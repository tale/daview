import { env, exit } from 'node:process'

import { createClient, type FileStat } from 'webdav'

// eslint-disable-next-line @typescript-eslint/naming-convention
const { PROXY_ENDPOINT, PROXY_LOGIN, POD_NAME } = env
if (!PROXY_ENDPOINT) {
	console.error('Missing $PROXY_ENDPOINT')
	exit(1)
}

if (!PROXY_LOGIN) {
	console.error('Missing $PROXY_LOGIN')
	exit(1)
}

const [username, password] = PROXY_LOGIN.split(':')
if (!username || !password) {
	console.error('Invalid $PROXY_LOGIN')
	exit(1)
}

const client = createClient(PROXY_ENDPOINT, {
	username,
	password
})

export type Response = {
	status: number;
	server: string;
	files: FileStat[];
}

const serverName = POD_NAME ? `tale-k8s (${POD_NAME})` : 'tale-k8s'
export async function read(path: string) {
	try {
		const fileLookup = await client.getDirectoryContents(path)
		return {
			status: 200,
			server: serverName,
			files: (fileLookup as FileStat[])
		}
	} catch {
		return {
			status: 404,
			server: serverName,
			files: []
		}
	}
}

export async function find(path: string) {
	try {
		const stat = await client.stat(path) as FileStat
		return stat
	} catch {}
}

export function stream(path: string) {
	try {
		return client.createReadStream(path)
	} catch {}
}
