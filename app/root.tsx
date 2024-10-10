import {
  json,
  type LoaderFunctionArgs,
  type HeadersFunction,
  type LinksFunction,
  type MetaFunction,
} from '@remix-run/node'
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useMatches,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import { useState } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import appleTouchIconAssetUrl from './assets/favicons/apple-touch-icon.png'
import faviconAssetUrl from './assets/favicons/favicon.svg'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { EpicProgress } from './components/progress-bar.tsx'
import { useToast } from './components/toaster.tsx'
import { Button } from './components/ui/button.tsx'
import { href as iconsHref } from './components/ui/icon.tsx'
import { EpicToaster } from './components/ui/sonner.tsx'
import { ThemeSwitch, useTheme } from './routes/resources+/theme-switch.tsx'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUserId, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import { combineHeaders, getDomainUrl } from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { type Theme, getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'
import { useOptionalUser } from './utils/user.ts'

export const links: LinksFunction = () => {
  return [
    // Preload svg sprite as a resource to avoid render blocking
    { rel: 'preload', href: iconsHref, as: 'image' },
    {
      rel: 'icon',
      href: '/favicon.webp',
      sizes: '48x48',
    },
    { rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
    { rel: 'apple-touch-icon', href: appleTouchIconAssetUrl },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
      crossOrigin: 'use-credentials',
    } as const, // necessary to make typescript happy
    { rel: 'stylesheet', href: tailwindStyleSheetUrl },
  ].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data ? 'TankMate' : 'Error | TankMate' },
    { name: 'description', content: `Create and manage aquariums on the fly` },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const timings = makeTimings('root loader')
  const userId = await time(() => getUserId(request), {
    timings,
    type: 'getUserId',
    desc: 'getUserId in root',
  })

  const user = userId
    ? await time(
      () =>
        prisma.user.findUniqueOrThrow({
          select: {
            id: true,
            name: true,
            username: true,
            image: { select: { id: true } },
            roles: {
              select: {
                name: true,
                permissions: {
                  select: { entity: true, action: true, access: true },
                },
              },
            },
          },
          where: { id: userId },
        }),
      { timings, type: 'find user', desc: 'find user in root' },
    )
    : null
  if (userId && !user) {
    console.info('something weird happened')
    // something weird happened... The user is authenticated but we can't find
    // them in the database. Maybe they were deleted? Let's log them out.
    await logout({ request, redirectTo: '/' })
  }
  const { toast, headers: toastHeaders } = await getToast(request)
  const honeyProps = honeypot.getInputProps()

  return json(
    {
      user,
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: {
          theme: getTheme(request),
        },
      },
      ENV: getEnv(),
      toast,
      honeyProps,
    },
    {
      headers: combineHeaders(
        { 'Server-Timing': timings.toString() },
        toastHeaders,
      ),
    },
  )
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = {
    'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
  }
  return headers
}

function Document({
  children,
  nonce,
  theme = 'light',
  env = {},
  allowIndexing = true,
}: {
  children: React.ReactNode
  nonce: string
  theme?: Theme
  env?: Record<string, string>
  allowIndexing?: boolean
}) {
  return (
    <html lang="en" className={`${theme} h-full overflow-x-hidden`}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {allowIndexing ? null : (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Links />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

function App() {
  const data = useLoaderData<typeof loader>()
  const nonce = useNonce()
  const user = useOptionalUser()
  const theme = useTheme()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const allowIndexing = data.ENV.ALLOW_INDEXING !== 'false'
  useToast(data.toast)

  return (
    <Document
      nonce={nonce}
      theme={theme}
      allowIndexing={allowIndexing}
      env={data.ENV}
    >
      <div className="flex h-screen flex-col justify-between">
        <header className="container py-6">
          {navOpen && (
            <nav className="z-2 fixed left-0 top-0 h-screen w-screen bg-slate-800 px-10">
              <header className="flex h-20 justify-between"></header>

              <div className="justify-between flex h-[calc(100vh-100px)] flex-col">
                <div>
                  <Button variant="outline" size="wide">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </div>

                <div>
                  <Form method="POST" action="/logout" className="text-center">
                    <Button variant="default" size="wide" type="submit">
                      Logout
                    </Button>
                  </Form>
                </div>
              </div>
            </nav>
          )}
          <nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8">
            <Logo />
            <div className="flex items-center gap-10">
              {location.pathname.includes('dashboard') ? (
                <button
                  className="group relative block md:hidden"
                  onClick={() => setNavOpen((prev) => !prev)}
                >
                  <div
                    className={`relative flex h-[50px] w-[50px] transform items-center justify-center overflow-hidden rounded-full shadow-md ring-0 ring-gray-300 ring-opacity-30 transition-all duration-200`}
                  >
                    <div className="flex h-[20px] w-[20px] origin-center transform flex-col justify-between overflow-hidden transition-all duration-300">
                      <div
                        className={`h-[2px] w-7 origin-left transform bg-white transition-all delay-100 duration-300 ${navOpen ? 'translate-y-6' : ''}`}
                      ></div>
                      <div
                        className={`h-[2px] w-7 transform rounded bg-white transition-all delay-75 duration-300 ${navOpen ? 'translate-y-6' : ''}`}
                      ></div>
                      <div
                        className={`h-[2px] w-7 origin-left transform bg-white transition-all duration-300 ${navOpen ? 'translate-y-6' : ''}`}
                      ></div>

                      <div
                        className={`absolute top-2.5 flex w-0 -translate-x-10 transform items-center justify-between transition-all duration-500 ${navOpen ? 'w-12 translate-x-0' : ''}`}
                      >
                        <div
                          className={`absolute h-[2px] w-5 rotate-0 transform bg-white transition-all delay-300 duration-500 ${navOpen ? 'rotate-45' : ''}`}
                        ></div>
                        <div
                          className={`absolute h-[2px] w-5 -rotate-0 transform bg-white transition-all delay-300 duration-500 ${navOpen ? '-rotate-45' : ''}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </button>
              ) : (
                <>
                  {user ? (
                    <Button asChild variant="default" size="lg">
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="default" size="lg">
                      <Link to="/login">Log In</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </nav>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>

        {!location.pathname.includes('dashboard') ? (
          <div className="container flex items-center justify-between py-5">
            <Logo />

            <p className="mx-10 text-sm text-gray-400">
              © 2024 TankMate. All Rights Reserved.
            </p>

            <ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
          </div>
        ) : null}
      </div>
      <EpicToaster closeButton position="top-center" theme={theme} />
      <EpicProgress />
    </Document>
  )
}

function Logo() {
  return (
    <Link to="/" className="group grid leading-snug">
      <span className="font-light transition group-hover:-translate-x-1">
        Tank
      </span>
      <span className="font-bold transition group-hover:translate-x-1">
        Mate
      </span>
    </Link>
  )
}

function AppWithProviders() {
  const data = useLoaderData<typeof loader>()
  return (
    <HoneypotProvider {...data.honeyProps}>
      <App />
    </HoneypotProvider>
  )
}

export default withSentry(AppWithProviders)

export function ErrorBoundary() {
  // the nonce doesn't rely on the loader so we can access that
  const nonce = useNonce()

  // NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
  // likely failed to run so we have to do the best we can.
  // We could probably do better than this (it's possible the loader did run).
  // This would require a change in Remix.

  // Just make sure your root route never errors out and you'll always be able
  // to give the user a better UX.

  return (
    <Document nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  )
}
