import 'src/index.css'

import { type PageProps } from 'rakkasjs'
import { useState } from 'react'

type Inputs = {
	username: HTMLInputElement;
	password: HTMLInputElement;
}

async function hash(data: string) {
	const utf8 = new TextEncoder().encode(data)
	const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
	const hashArray = [...new Uint8Array(hashBuffer)]
	const hashHex = hashArray
		.map(bytes => bytes.toString(16).padStart(2, '0'))
		.join('')
	return hashHex
}

export default function Page({ url }: PageProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const returnTo = url.searchParams.get('return_to') ?? '/'

	return (
		<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
			<form
				className='space-y-4'
				onSubmit={async event => {
					event.preventDefault()
					setLoading(true)
					setError('')

					const inputs = event.target as unknown as Inputs
					const username = inputs.username.value
					const passwordHash = await hash(inputs.password.value)

					const post = new URL('/_api/login', url)
					const response = await fetch(post.toString(), {
						method: 'POST',
						body: JSON.stringify({ username, passwordHash })
					})

					if (response.ok) {
						location.href = returnTo
						return
					}

					setLoading(false)
					const data = await response.text()
					setError(data)
				}}
			>

				<div>
					<label htmlFor='username' className='block text-sm font-medium text-gray-900'>
						Username (WebDAV Login)
					</label>
					<div className='mt-2'>
						<input
							required
							id='username'
							name='username'
							type='text'
							autoComplete='username'
							className='w-full border rounded-md shadow-sm p-2'
						/>
					</div>
				</div>

				<div>
					<label htmlFor='password' className='block text-sm font-medium text-gray-900'>
						Password
					</label>
					<div className='mt-2'>
						<input
							required
							id='password'
							name='password'
							type='password'
							autoComplete='current-password'
							className='w-full border rounded-md shadow-sm p-2'
						/>
					</div>
				</div>
				{error && (
					<div className='text-red-500 p-2 rounded relative text-center' role='alert'>
						{error}
					</div>
				)}

				<div>
					<button
						type='submit'
						disabled={loading}
						className={`w-full border rounded-md shadow-sm p-2 bg-blue-500 text-white inline-flex items-center justify-center ${loading ? 'cursor-not-allowed' : ''}`}
					>
						{loading && (
							<svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
								<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
								<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'/>
							</svg>
						)}

						Sign in
					</button>
				</div>
			</form>
		</div>
	)
}
