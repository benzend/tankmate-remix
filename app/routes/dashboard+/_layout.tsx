import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Button } from '#app/components/ui/button.js'
import { Logo } from '#app/components/ui/logo.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { getHints } from '#app/utils/client-hints.js'
import { getDomainUrl, humanize, toTitleCase } from '#app/utils/misc.js'
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
      <Nav />
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
          variant={
            location.pathname === '/dashboard' ? 'sidenav-active' : 'sidenav'
          }
          size="full"
          className="mb-4"
        >
          <Link to="/dashboard">Dashboard</Link>
        </Button>
        <Button
          variant={
            location.pathname === '/dashboard/maintenance'
              ? 'sidenav-active'
              : 'sidenav'
          }
          size="full"
          className="mb-4"
        >
          <Link to="/dashboard/maintenance">Maintenance</Link>
        </Button>
        <Button
          variant={
            location.pathname === '/dashboard/parameter-log'
              ? 'sidenav-active'
              : 'sidenav'
          }
          size="full"
          className="mb-4"
        >
          <Link to="/dashboard/parameter-log">Parameter Log</Link>
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

const Nav = () => {
  const data = useLoaderData<typeof loader>()
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (navOpen) setNavOpen(false)
  }, [location.pathname])

  return (
    <>
      {navOpen && (
        <nav className="z-2 fixed left-0 top-0 h-screen w-screen bg-accent-background px-10">
          <header className="flex h-20 justify-between"></header>

          <div className="flex h-[calc(100vh-100px)] flex-col justify-between">
            <div className="text-center">
              <Button variant="outline" size="full">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="full">
                <Link to="/dashboard/maintenance">Maintenance</Link>
              </Button>
              <Button variant="outline" size="full">
                <Link to="/dashboard/parameter-log">Parameter Log</Link>
              </Button>
            </div>

            <div>
              <Button size="full" variant="outline" className="mt-2">
                <ThemeSwitch
                  userPreference={data.requestInfo.userPrefs.theme}
                  buttonClasses="w-full text-foreground"
                  after={({ mode }) => (
                    <span className="ml-2 capitalize">{mode} Mode</span>
                  )}
                />
              </Button>

              <Form method="POST" action="/logout" className="text-center">
                <Button variant="default" size="full" type="submit">
                  Logout
                </Button>
              </Form>
            </div>
          </div>
        </nav>
      )}

      <header className="flex justify-between px-10 py-6">
        <div className="flex items-center gap-20">
          <Logo mode="follow-theme" />
          <div className="ml-2">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex items-center gap-10">
          <button
            className="group relative block md:hidden"
            onClick={() => setNavOpen((prev) => !prev)}
          >
            <div
              className={`relative flex h-[50px] w-[50px] transform items-center justify-center overflow-hidden rounded-full shadow-md ring-0 ring-gray-300 ring-opacity-30 transition-all duration-200`}
            >
              <div className="flex h-[20px] w-[20px] origin-center transform flex-col justify-between overflow-hidden transition-all duration-300">
                <div
                  className={`h-[2px] w-7 origin-left transform bg-foreground transition-all delay-100 duration-300 ${navOpen ? 'translate-y-6' : ''}`}
                ></div>
                <div
                  className={`h-[2px] w-7 transform rounded bg-foreground transition-all delay-75 duration-300 ${navOpen ? 'translate-y-6' : ''}`}
                ></div>
                <div
                  className={`h-[2px] w-7 origin-left transform bg-foreground transition-all duration-300 ${navOpen ? 'translate-y-6' : ''}`}
                ></div>

                <div
                  className={`absolute top-2.5 flex w-0 -translate-x-10 transform items-center justify-between transition-all duration-500 ${navOpen ? 'w-12 translate-x-0' : ''}`}
                >
                  <div
                    className={`absolute h-[2px] w-5 rotate-0 transform bg-foreground transition-all delay-300 duration-500 ${navOpen ? 'rotate-45' : ''}`}
                  ></div>
                  <div
                    className={`absolute h-[2px] w-5 -rotate-0 transform bg-foreground transition-all delay-300 duration-500 ${navOpen ? '-rotate-45' : ''}`}
                  ></div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </header>
    </>
  )
}

function Breadcrumbs() {
  const location = useLocation()
  const validCrumbs = ['dashboard', 'tanks', 'maintenance', 'parameter-log', 'new']
  const to = (pathPart: string) => {
    const index = location.pathname.indexOf(pathPart)
    return location.pathname.slice(0, index + pathPart.length)
  }

  const validPathParts = location.pathname
    .split('/')
    .filter((_p) => validCrumbs.includes(_p))
  const crumbs = validPathParts.map((pathPart, i) => {
    return {
      link: to(pathPart),
      label: toTitleCase(humanize(pathPart)),
      last: i === validPathParts.length - 1,
    }
  })

  const pathsWithSingles = ['/maintenance/', '/tanks/', '/parameter-log/'];
  const excludedLastPaths = ['/new']

  const endElement = (() => {
    if (excludedLastPaths.some(_p => location.pathname.includes(_p))) {
      return
    }
    if (pathsWithSingles.some(_p => location.pathname.includes(_p))) {
      const _split = location.pathname.split('/')
      return _split[_split.length - 1]
    }
  })()

  return (
    <div className="hidden md:flex gap-2">
      {crumbs.map((crumb) => (
        <div>
          <Link to={crumb.link}><span>{crumb.label}</span></Link>
          {!crumb.last && <span className="ml-2">{'>'}</span>}
        </div>
      ))}
      {endElement && (
        <div>
          <span className="mr-2">{'>'}</span>
          <Link to={to(endElement)}>{endElement}</Link>
        </div>
      )}
    </div>
  )
}

function TopOfSidenav({ children }: { children: any }) {
  return <div>{children}</div>
}

function BottomOfSidenav({ children }: { children: any }) {
  return <div>{children}</div>
}
