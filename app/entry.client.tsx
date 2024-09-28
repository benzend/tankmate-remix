import * as Sentry from "@sentry/remix";
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import { startTransition, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client'

Sentry.init({
    dsn: "https://774fae3cba25b6c33dd3ad7243f97586@o4508025365987328.ingest.us.sentry.io/4508028896673792",
    tracesSampleRate: 1,

    integrations: [Sentry.browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches
    })]
})

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
	void import('./utils/monitoring.client.tsx').then(({ init }) => init())
}

startTransition(() => {
	hydrateRoot(document, <RemixBrowser />)
})