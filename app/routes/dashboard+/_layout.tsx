import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, Outlet, useLocation } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request, { redirectTo: '/' })

  return json({ ok: true })
}

export default function DashboardLayout() {
  const location = useLocation()

  return (
    <main className="bg-background text-gray-100">
      <div className="flex h-[calc(100vh-92px)]">
        <nav className="hidden w-60 rounded-tr-xl bg-slate-800 p-5 md:flex flex-col justify-between">
          <TopOfSidenav>
            <button
              className={`mb-2 w-full rounded-xl px-4 py-2 text-left ${location.pathname === '/dashboard' && 'bg-slate-700'}`}
            >
              <Link to="/dashboard">Dashboard</Link>
            </button>
          </TopOfSidenav>

          <BottomOfSidenav>
            <Form method="POST" action="/logout">
              <button
                type="submit"
                className="w-full rounded-xl px-4 py-2 text-left"
              >
                Logout
              </button>
            </Form>
          </BottomOfSidenav>
        </nav>

        <div className="px-6 py-4 w-full">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

const TopOfSidenav = ({ children }: { children: any }) => {
  return <div>{children}</div>
}

const BottomOfSidenav = ({ children }: { children: any }) => {
  return <div>{children}</div>
}
