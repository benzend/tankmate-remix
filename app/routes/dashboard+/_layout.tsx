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
        <Link to="/dashboard">
          <Button
            variant={
              location.pathname === '/dashboard' ? 'sidenav-active' : 'sidenav'
            }
            size="full"
            className="mb-4"
          >
            Dashboard
          </Button>
        </Link>
        <Link to="/dashboard/maintenance">
          <Button
            variant={
              location.pathname === '/dashboard/maintenance'
                ? 'sidenav-active'
                : 'sidenav'
            }
            size="full"
            className="mb-4"
          >
            Maintenance
          </Button>
        </Link>
        <Link to="/dashboard/parameter-log">
          <Button
            variant={
              location.pathname === '/dashboard/parameter-log'
                ? 'sidenav-active'
                : 'sidenav'
            }
            size="full"
            className="mb-4"
          >
            Parameter Log
          </Button>
        </Link>
        <Link to="/dashboard/coral-analyses">
          <Button
            variant={
              location.pathname === '/dashboard/coral-analyses'
                ? 'sidenav-active'
                : 'sidenav'
            }
            size="full"
            className="mb-4"
          >
            Coral Analyzer
          </Button>
        </Link>
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
        <nav className="z-10 fixed left-0 top-0 h-screen w-screen bg-accent-background px-10">
          <div className="flex h-[calc(100vh-100px)] flex-col justify-between mt-32">
            <div className="text-center">
              <Link to="/dashboard">
                <Button variant="outline" size="full">
                  Dashboard
                </Button>
              </Link>
              <Link to="/dashboard/maintenance">
                <Button variant="outline" size="full">
                  Maintenance
                </Button>
              </Link>
              <Link to="/dashboard/parameter-log">
                <Button variant="outline" size="full">
                  Parameter Log
                </Button>
              </Link>
              <Link to="/dashboard/coral-analyses">
                <Button variant="outline" size="full">
                  Coral Analyzer
                </Button>
              </Link>

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

      <header className="flex justify-between px-10 py-6 z-10 relative">
        <div className="flex items-center gap-20">
          <Logo to="/dashboard" mode="follow-theme" />
          <div className="ml-2">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex items-center gap-3">
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
    'coral-analyses',
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300) // 300ms delay
  const navigate = useNavigate()

  useEffect(() => {
    const abortController = new AbortController()

    const performSearch = async () => {
      if (debouncedSearchQuery.length > 2) {
        setIsSearching(true)
        try {
          const response = await fetch(
            `/resources/search?query=${encodeURIComponent(debouncedSearchQuery)}`,
            {
              signal: abortController.signal,
            }
          )
          const data: unknown = await response.json()

          // Only update if the request wasn't aborted
          if (!abortController.signal.aborted) {
            if (isSearchResponse(data)) {
              setSearchResults(data.results)
            } else {
              console.error('Invalid search response format')
              setSearchResults([])
            }
          }
        } catch (error) {
          // Only log and update state if the request wasn't aborted
          if (error instanceof Error && error.name === 'AbortError') {
            return
          }
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          if (!abortController.signal.aborted) {
            setIsSearching(false)
          }
        }
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }

    performSearch().catch(err => console.error('failed to search', err))

    // Cleanup: abort any pending requests when the query changes or component unmounts
    return () => {
      abortController.abort()
    }
  }, [debouncedSearchQuery])

  return (
    <>
      {/* Mobile Search */}
      <div className="relative md:hidden">
        {isMobileSearchOpen ? (
          <div className="fixed inset-x-0 top-0 z-50 bg-background p-4">
            <div className="relative flex items-center">
              <Form
                method="GET"
                action="/resources/search"
                className="w-full"
                onChange={(e) => {
                  const form = e.currentTarget
                  const formData = new FormData(form)
                  const query = formData.get('search')
                  setSearchQuery(query?.toString() || '')
                }}
              >
                <div className="relative">
                  <svg
                    className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <Input
                    placeholder="Search or ask a question"
                    id="search-mobile"
                    name="search"
                    className="w-full pl-8 pr-8"
                    autoFocus
                  />
                </div>
                <button hidden type="submit" />
              </Form>
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Search Results */}
            {(searchResults.length > 0 || isSearching) && (
              <div className="absolute left-0 right-0 mt-2 max-h-[60vh] overflow-y-auto bg-background p-4 shadow-lg">
                {isSearching ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : (
                  searchResults.map((result, index) => (
                    // ... same result rendering as desktop ...
                    <div key={index} className="mb-2 last:mb-0">
                      <button
                        className="w-full rounded-md p-2 text-left hover:bg-accent"
                        onClick={() => {
                          if (index === 0 && result.title === 'Expert Answer') {
                            setExpandedAnswer(!expandedAnswer)
                          } else {
                            navigate(result.url)
                            setSearchResults([])
                            setIsMobileSearchOpen(false)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-medium">
                            {result.title}
                          </div>
                          {index === 0 && result.title === 'Expert Answer' && (
                            <div className="text-xs text-muted-foreground">
                              {expandedAnswer ? '↑ Collapse' : '↓ Expand'}
                            </div>
                          )}
                        </div>
                        {result.content && (
                          <div
                            className={`mt-1 text-sm text-muted-foreground ${index === 0 && result.title === 'Expert Answer'
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
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full"
          >
            <svg
              className="h-6 w-6 text-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Desktop Search */}
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
          <div className="relative">
            <svg
              className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Search or ask a question"
              id="search"
              name="search"
              className="w-[300px] pl-8"
            />
          </div>
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
                        <div className="text-lg font-medium">
                          {result.title}
                        </div>
                        {isExpertAnswer && (
                          <div className="text-xs text-muted-foreground">
                            {expandedAnswer ? '↑ Collapse' : '↓ Expand'}
                          </div>
                        )}
                      </div>
                      {result.content && (
                        <div
                          className={`mt-1 text-sm text-muted-foreground ${isExpertAnswer
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
    </>
  )
}
