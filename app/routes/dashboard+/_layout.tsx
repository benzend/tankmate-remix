import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
} from '@remix-run/react'
import { Button } from '#app/components/ui/button.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { getHints } from '#app/utils/client-hints.js'
import { getDomainUrl } from '#app/utils/misc.js'
import { getTheme } from '#app/utils/theme.server.js'
import { ThemeSwitch } from '../resources+/theme-switch'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request, { redirectTo: '/' })

  return json({
    requestInfo: {
      hints: getHints(request),
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
      userPrefs: {
        theme: getTheme(request),
      },
    },
  })
}

export default function DashboardLayout() {
  return (
    <main className="bg-background text-gray-100">
      <div className="flex h-[calc(100vh-92px)]">
        <SideNav />
        <div className="w-full px-6 py-4">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

const SideNav = () => {
  const data = useLoaderData<typeof loader>()
  const location = useLocation()
  return (
    <nav className="hidden w-60 flex-col justify-between rounded-tr-xl bg-accent-background p-5 md:flex">
      <TopOfSidenav>
        <Button
          variant={location.pathname === '/dashboard' ? 'sidenav-active' : 'sidenav'}
          size="full"
        >
          <Link to="/dashboard">Dashboard</Link>
        </Button>
      </TopOfSidenav>

      <BottomOfSidenav>
        <Form method="POST" action="/logout" className="w-full">
          <Button type="submit" size="full">
            Logout
          </Button>
        </Form>
        <Button size="full" variant="outline" className="mt-2">
          <ThemeSwitch
            userPreference={data.requestInfo.userPrefs.theme}
            buttonClasses="w-full text-foreground"
            after={({ mode }) => (
              <span className="ml-2 capitalize">{mode} Mode</span>
            )}
          />
        </Button>
      </BottomOfSidenav>
    </nav>
  )
}

const TopOfSidenav = ({ children }: { children: any }) => {
  return <div>{children}</div>
}

const BottomOfSidenav = ({ children }: { children: any }) => {
  return <div>{children}</div>
}
