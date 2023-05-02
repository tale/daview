import { type IncomingMessage, type ServerResponse } from 'node:http'

import { hmac, logins } from 'src/auth'

export function verify(request: IncomingMessage, response: ServerResponse) {
	const { cookie } = request.headers
	const taleAuth = cookie?.split(';')
		.find(c => c.trim().startsWith('tale-auth'))
		?.split('=')[1]

	if (!taleAuth) {
		response.statusCode = 401
		response.write('Unauthorized')
		response.end()
		return false
	}

	const [username, hash] = taleAuth?.split(':') ?? []
	if (!username || !hash) {
		response.statusCode = 400
		response.write('Bad Request')
		response.end()
		return false
	}

	const user = logins.find(user => user.username === username)
	if (!user) {
		response.statusCode = 401
		response.write('Invalid User')
		response.end()
		return false
	}

	const expectedHash = hmac(user.username)
	if (expectedHash !== hash) {
		response.statusCode = 401
		response.setHeader('Set-Cookie', 'tale-auth=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict')
		response.write('Invalid Credentials')
		response.end()
		return false
	}

	return true
}
