import { type IncomingMessage, type ServerResponse } from 'node:http'
import { env, exit } from 'node:process'

import { hash, hmac } from 'src/auth'

// eslint-disable-next-line @typescript-eslint/naming-convention
const { PROXY_USERS } = env

if (!PROXY_USERS) {
	console.error('Missing $PROXY_USERS')
	exit(1)
}

const users = PROXY_USERS.split(',')
if (users.length === 0) {
	console.error('Invalid $PROXY_USERS')
	exit(1)
}

export const logins = users.map(user => {
	const [username, password] = user.split(':')
	if (!username || !password) {
		console.error('Invalid $PROXY_USERS')
		exit(1)
	}

	return { username, password }
})

type LoginRequest = {
	username: string;
	passwordHash: string;
}

export async function login(request: IncomingMessage, response: ServerResponse) {
	const body = await new Promise<LoginRequest>(resolve => {
		let data = ''

		request.on('data', (chunk: string) => {
			data += chunk.toString()
		})

		request.on('end', () => {
			resolve(JSON.parse(data) as LoginRequest)
		})
	})

	const { username, passwordHash } = body
	const user = logins.find(user => user.username === username)

	if (!user) {
		response.statusCode = 401
		response.write('User not found')
		response.end()
		return
	}

	const hashHex = hash(user.password)
	if (hashHex !== passwordHash) {
		response.statusCode = 401
		response.write('Incorrect password')
		response.end()
		return
	}

	const dayExpiry = new Date(Date.now() + (1000 * 60 * 60 * 24)).toUTCString()
	const cookieSecret = hmac(username)

	response.statusCode = 200
	response.setHeader('Set-Cookie', `tale-auth=${username}:${cookieSecret}; Path=/; HttpOnly; SameSite=Strict; Secure; Expires=${dayExpiry}`)
	response.write('200 OK')
	response.end()
}

