import { type LayoutProps } from 'rakkasjs'

export default function Layout({ children }: LayoutProps) {
	return (
		<div className='container p-4'>
			{children}
		</div>
	)
}
