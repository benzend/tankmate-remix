import * as Sentry from "@sentry/remix";

Sentry.init({
    dsn: "https://774fae3cba25b6c33dd3ad7243f97586@o4508025365987328.ingest.us.sentry.io/4508028896673792",
    tracesSampleRate: 1,
    autoInstrumentRemix: true
})