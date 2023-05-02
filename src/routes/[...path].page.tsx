import 'src/index.css'

import { type PageProps, useServerSideQuery } from 'rakkasjs'
import { Suspense } from 'react'
import { read } from 'src/client'

export default function Page({ params }: PageProps) {
	const path = params.path.endsWith('/') ? params.path : `${params.path}/`
	const previousPath = path.split('/').slice(0, -2)
		.join('/') || '/'

	const { data } = useServerSideQuery(context => {
		const cookie = context.request.headers.get('cookie')
		const taleAuth = cookie?.split(';')
			.find(c => c.trim().startsWith('tale-auth'))
			?.split('=')[1]

		const [username, hash] = taleAuth?.split(':') ?? []

		return {
			username,
			hash
		}
	})

	return (
		<>
			<div className='flex justify-between items-center mb-4'>
				<h1>Index of {path}</h1>
				{data.username ? (
					<p className='text-right'>
						<a href='/_api/logout' className='text-blue-600'>Logout</a> ({data.username})
					</p>
				) : (
					<p className='text-right'>
						<a href='/login' className='text-blue-600'>Login</a>
					</p>
				)}
			</div>
			<table className='table-auto w-full font-mono text-sm'>
				<thead>
					<tr>
						<th className='text-left'>Name</th>
						<th className='text-right'>Last Modified</th>
						<th className='text-right'>Size</th>
					</tr>
				</thead>
				<Suspense fallback={<tr><td>Loading...</td></tr>}>
					<Files path={path} previousPath={previousPath} auth={Boolean(data.username)}/>
				</Suspense>
			</table>
		</>
	)
}

function Files({ path, previousPath, auth }: { path: string; previousPath: string; auth: boolean }) {
	const { data } = useServerSideQuery(async () => read(path))

	return (
		<tbody>
			{path !== '/' && (
				<tr>
					<td className='text-left text-blue-600'>
						<a href={previousPath}>../</a>
					</td>
					<td className='text-right'>-</td>
					<td className='text-right'>-</td>
				</tr>
			)}
			{data.files.map(file => (
				<tr key={file.filename}>
					{file.type === 'directory' ? (
						<>
							<td className='text-left text-blue-600'>
								<a href={file.filename}>{file.filename.replace(path, '')}/</a>
							</td>

							<td className='text-right'>{file.lastmod}</td>
							<td className='text-right'>-</td>
						</>
					) : (
						<>
							{auth ? (
								<td className='text-left text-blue-600'>
									<a href={`/_api/download?file=${encodeURIComponent(file.filename)}`}>{file.filename.replace(path, '')}</a>
								</td>
							) : (
								<td className='text-left'>{file.filename.replace(path, '')}</td>
							)}

							<td className='text-right'>{file.lastmod}</td>
							<td className='text-right'>{file.size}</td>
						</>
					)}

				</tr>
			))}
		</tbody>
	)
}
