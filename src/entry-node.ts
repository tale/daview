/* eslint-disable unicorn/filename-case */
import { type IncomingMessage, type ServerResponse } from 'node:http'

import { createMiddleware } from 'rakkasjs/node-adapter'
import { login, verify } from 'src/auth'
import { find, stream } from 'src/client'

import hattipHandler from './entry-hattip'

export default async function (request: IncomingMessage, response: ServerResponse) {
	if (request.method === 'POST' && request.url === '/_api/login') {
		await login(request, response)
		return
	}

	if (request.method === 'GET' && request.url === '/_api/logout') {
		const returnTo = request.headers.referer ?? '/'

		response.setHeader('Set-Cookie', 'tale-auth=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict')
		response.statusCode = 301
		response.setHeader('Location', returnTo)
		response.end()
		return
	}

	if (request.method === 'GET' && request.url?.startsWith('/_api/download')) {
		if (!verify(request, response)) {
			return
		}

		if (!request.headers.host) {
			response.statusCode = 400
			response.write('Bad Request')
			response.end()
			return
		}

		const { searchParams } = new URL(request.url, `http://${request.headers.host}`)
		const file = searchParams.get('file')

		if (!file) {
			response.statusCode = 400
			response.write('Bad Request')
			response.end()
			return
		}

		const path = decodeURIComponent(file)
		const lookup = await find(path)
		if (!lookup) {
			response.statusCode = 404
			response.write('Not Found')
			response.end()
			return
		}

		const { size, type, mime, filename } = lookup
		if (type !== 'file') {
			response.statusCode = 400
			response.write('Bad Request')
			response.end()
			return
		}

		response.setHeader('Content-Length', size)
		response.setHeader('Content-Type', mime ?? 'application/octet-stream')
		response.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
		response.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

		const fileStream = stream(path)
		if (!fileStream) {
			response.statusCode = 404
			response.write('Not Found')
			response.end()
			return
		}

		fileStream.pipe(response)
		return
	}

	createMiddleware(hattipHandler)(request, response)
}

