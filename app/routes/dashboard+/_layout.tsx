import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Button } from '#app/components/ui/button.js'
import { Input } from '#app/components/ui/input.js'
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
        <div className="w-full overflow-y-auto px-6 pt-4">
          <div className="pb-10">
            <Outlet />
          </div>
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
        <ThemeSwitch
          userPreference={data.requestInfo.userPrefs.theme}
          buttonClasses="w-full text-foreground py-2 mt-2 border rounded"
          after={({ mode }) => (
            <span className="ml-2 capitalize">{mode} Mode</span>
          )}
        />
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
              <ThemeSwitch
                userPreference={data.requestInfo.userPrefs.theme}
                buttonClasses="w-full text-foreground py-2 mb-2 border rounded"
                after={({ mode }) => (
                  <span className="ml-2 capitalize">{mode} Mode</span>
                )}
              />

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
          <Logo to="/dashboard" mode="follow-theme" />
          <div className="ml-2">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex items-center gap-10">
          <Search />
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
  const validCrumbs = [
    'dashboard',
    'tanks',
    'maintenance',
    'parameter-log',
    'new',
  ]
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

  const pathsWithSingles = ['/maintenance/', '/tanks/', '/parameter-log/']
  const excludedLastPaths = ['/new']

  const endElement = (() => {
    if (excludedLastPaths.some((_p) => location.pathname.includes(_p))) {
      return
    }
    if (pathsWithSingles.some((_p) => location.pathname.includes(_p))) {
      const _split = location.pathname.split('/')
      return _split[_split.length - 1]
    }
  })()

  return (
    <div className="hidden gap-2 md:flex">
      {crumbs.map((crumb) => (
        <div key={crumb.label}>
          <Link to={crumb.link}>
            <span className="text-foreground">{crumb.label}</span>
          </Link>
          {!crumb.last && <span className="ml-2 text-foreground">{'>'}</span>}
        </div>
      ))}
      {endElement && (
        <div>
          <span className="mr-2 text-foreground">{'>'}</span>
          <Link to={to(endElement)}>
            <span className="text-foreground">{endElement}</span>
          </Link>
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

interface SearchResult {
  title: string
  url: string
  content?: string
}

interface SearchResponse {
  results: SearchResult[]
}

function isSearchResponse(data: unknown): data is SearchResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as SearchResponse).results) &&
    (data as SearchResponse).results.every(
      (item): item is SearchResult =>
        typeof item === 'object' &&
        item !== null &&
        'title' in item &&
        'url' in item &&
        typeof item.title === 'string' &&
        typeof item.url === 'string',
    )
  )
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function Search() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedAnswer, setExpandedAnswer] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300) // 300ms delay
  const navigate = useNavigate()

  useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      setIsSearching(true)
      fetch(
        `/resources/search?query=${encodeURIComponent(debouncedSearchQuery)}`,
      )
        .then((res) => res.json())
        .then((data: unknown) => {
          if (isSearchResponse(data)) {
            setSearchResults(data.results)
          } else {
            console.error('Invalid search response format')
            setSearchResults([])
          }
          setIsSearching(false)
        })
        .catch((error) => {
          console.error('Search error:', error)
          setIsSearching(false)
          setSearchResults([])
        })
    } else {
      setSearchResults([])
    }
  }, [debouncedSearchQuery])

  return (
    <div className="relative hidden md:block">
      <Form
        method="GET"
        action="/resources/search"
        onChange={(e) => {
          const form = e.currentTarget
          const formData = new FormData(form)
          const query = formData.get('search')
          setSearchQuery(query?.toString() || '')
        }}
      >
        <Input
          placeholder="Search or ask a question"
          id="search"
          name="search"
          className="w-[300px]"
        />
        <button hidden type="submit" />
      </Form>

      {/* Search Results Dropdown */}
      {(searchResults.length > 0 || isSearching) && (
        <div
          className={`absolute top-full mt-1 w-[300px] rounded-md border bg-background p-2 shadow-lg ${expandedAnswer ? 'max-h-[80vh] overflow-y-auto' : ''
            }`}
        >
          {isSearching ? (
            <div className="p-2 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : (
            searchResults.map((result, index) => {
              const isExpertAnswer =
                index === 0 && result.title === 'Expert Answer'

              return (
                <div key={index} className="mb-2 last:mb-0">
                  <button
                    className="w-full rounded-md p-2 text-left hover:bg-accent"
                    onClick={() => {
                      if (isExpertAnswer) {
                        setExpandedAnswer(!expandedAnswer)
                      } else {
                        navigate(result.url)
                        setSearchResults([])
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{result.title}</div>
                      {isExpertAnswer && (
                        <div className="text-xs text-muted-foreground">
                          {expandedAnswer ? '↑ Collapse' : '↓ Expand'}
                        </div>
                      )}
                    </div>
                    {result.content && (
                      <div
                        className={`mt-1 text-xs text-muted-foreground ${isExpertAnswer
                            ? expandedAnswer
                              ? ''
                              : 'line-clamp-2'
                            : 'line-clamp-2'
                          }`}
                      >
                        {result.content}
                      </div>
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
