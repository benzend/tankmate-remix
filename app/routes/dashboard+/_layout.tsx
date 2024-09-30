import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLocation } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request, { redirectTo: '/' })

	return json({ ok: true })
}

export default function DashboardLayout() {
	const location = useLocation()

	return (
		<main className="min-h-screen bg-background text-gray-100">
			<div className="flex">
				<nav className="h-screen w-60 rounded-r-xl bg-slate-800 p-5">
					<button
						className={`mb-2 w-full rounded-xl px-4 py-2 text-left ${location.pathname === '/dashboard' && 'bg-slate-700'}`}
					>
						<Link to="/dashboard">Dashboard</Link>
					</button>
				</nav>

				<div className="px-10 py-4">
					<Outlet />
				</div>
			</div>
		</main>
	)
}
