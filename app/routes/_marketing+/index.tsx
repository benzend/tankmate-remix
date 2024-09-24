import { type MetaFunction } from '@remix-run/node'
import { Form } from '@remix-run/react'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<main className="font-poppins grid h-full place-items-center">
			<div className="grid place-items-center px-4 py-16 xl:grid-cols-2 xl:gap-24">
				<Form action="/tanks/parse" method="POST">
					<input type="file" name="file" id="file" />
					<button type="submit">Submit</button>
				</Form>
			</div>
		</main>
	)
}
