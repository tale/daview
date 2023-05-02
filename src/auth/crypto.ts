import { createHash, createHmac } from 'node:crypto'
import { env, exit } from 'node:process'

// eslint-disable-next-line @typescript-eslint/naming-convention
const { PROXY_SECRET } = env
if (!PROXY_SECRET) {
	console.error('Missing $PROXY_SECRET')
	exit(1)
}

export function hash(password: string) {
	const hash = createHash('sha256')
	hash.update(password)
	return hash.digest('hex')
}

export function hmac(secret: string) {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const hmac = createHmac('sha256', PROXY_SECRET!)
	hmac.update(secret)
	return hmac.digest('hex')
}

