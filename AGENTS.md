# Agent Guidelines for TankMate Remix

## Commands

- **Build**: `npm run build` (icons → remix → server, via `run-s`)
- **Dev**: `npm run dev` (requires `npm run build:icons` first; runs `dev-server.js` with `MOCKS=true`)
- **Lint**: `npm run lint` (ESLint via `@epic-web/config`)
- **Typecheck**: `npm run typecheck` (`tsc`)
- **Format**: `npm run format` (Prettier)
- **Test single file**: `npm test -- path/to/test.test.ts`
- **Test all**: `npm test` (Vitest, watch mode)
- **Test once**: `npm test -- --run`
- **E2E dev**: `npm run test:e2e` (Playwright UI mode)
- **E2E CI**: `npm run test:e2e:run` (headless, requires build first)
- **Validate**: `npm run validate` (runs tests, lint, typecheck, e2e in parallel)
- **DB GUI**: `npm run prisma:studio`
- **Initial setup**: `npm run setup` (build, prisma generate, migrate, seed, playwright install)

## Project Structure

- **app/**: Remix web app. Excluded from tsconfig: `mobile/**`
  - **routes/**: File-based routing with `remix-flat-routes`
  - **components/**: React components (use `cva` for variants, `cn()` from `#app/utils/misc.tsx`)
  - **utils/**: Shared utilities. Server-only files end with `.server.ts`, client-only with `.client.ts`
- **server/**: Express server (`server/index.ts`) + mobile API routes (`/api/v1/*`)
- **mobile/**: React Native (Expo) app — **separate package with own dependencies**. Managed via `mobile/package.json`. Not included in root tsconfig.
- **tests/**: E2E tests (Playwright) & test utilities
  - Setup: `tests/setup/setup-test-env.ts`
  - Global setup: `tests/setup/global-setup.ts`
  - Custom matchers: `tests/setup/custom-matchers.ts`
- **prisma/**: Database schema & migrations (SQLite via Prisma)
- **other/**: Dockerfile, build scripts, etc.

## Setup Prerequisites

- **Node.js 20** (enforced in `engines`, `.nvmrc` has `v20.11.1`). Use `nvm use 20` before installing deps. Node 24 causes `better-sqlite3` ABI mismatches and Remix `AbortSignal` test failures.
- Copy `.env.example` → `.env` and fill values
- **`OPENAI_API_KEY` is optional** — the app boots and runs without it. AI features (coral analysis, search, tank parsing) gracefully degrade with user-facing error messages.
- **GitHub OAuth env vars must be prefixed with `MOCK_`** for tests/mocks to work (e.g., `GITHUB_CLIENT_ID=MOCK_GITHUB_CLIENT_ID`)
- `npm run setup` handles: build → `prisma generate` → `prisma migrate deploy` → `prisma db seed` → `playwright install`
- If switching Node versions, run `npm rebuild better-sqlite3` to avoid native module ABI errors

## Code Style

- **Path aliases**: `#app/*` for app files, `#tests/*` for test files (configured in `package.json` imports and `tsconfig.json`)
- **Components**: Use `cva` for variants, `forwardRef` for refs, `cn()` from `#app/utils/misc.tsx` for Tailwind merging
- **Forms**: Use Conform for form handling, Zod for validation
- **Error handling**: Use `getErrorMessage()` utility from `misc.tsx`
- **Dates**: Use date-fns utilities and format functions from `misc.tsx`

## Testing Quirks

- **Vitest config lives in `vite.config.ts`** (not a separate `vitest.config.ts`)
- **Unit tests**: `*.test.{ts,tsx}` co-located in `app/`
- **E2E tests**: Located in `tests/e2e/`
- Tests rely on MSW mocks; `console.error` throws by default unless explicitly mocked away
- Playwright tests need `.env` and a built app (`npm run build`)

## Auth / OAuth Gotchas

- `remix-auth-github` types are strict. When implementing `AuthProvider`:
  - Use explicit generic: `new GitHubStrategy<ProviderUser>(...)`
  - Option keys are `clientID` and `callbackURL` (not `clientId` / `redirectURI`)
- The `ProviderUser` type is defined in `app/utils/providers/provider.ts`

## Deploy

- **Platform**: Fly.io
- **App name**: `tankmate` (defined in `fly.toml`)
- **Staging**: `${app_name}-staging` (i.e. `tankmate-staging`) on `dev` branch
- Deploy runs only on push (not PRs), after lint/typecheck/vitest/playwright all pass
- Uses remote builder with `--build-arg COMMIT_SHA`
- `SENTRY_AUTH_TOKEN` is passed as a build secret for production deploys

## Key Dependencies

- **Framework**: Remix 2.10.3 + React 18 + Vite
- **Database**: Prisma 5 + SQLite (`better-sqlite3`)
- **Styling**: Tailwind CSS + Radix UI primitives + shadcn/ui
- **Forms**: Conform + Zod
- **Auth**: `remix-auth` with cookie sessions
- **Testing**: Vitest + Playwright + Testing Library
- **Mobile**: Expo SDK 54 + React Native + NativeWind (separate package in `mobile/`)

## Server Build Gotchas

- `other/build-server.ts` bundles the `server/` directory into `server-build/` via esbuild. It must use `bundle: true` with `external: [...all npm deps]` so that local imports (e.g. from `#app/`) are inlined into the output. Without this, the production Docker image crashes because `server-build/` references `../app/utils/...` paths that don't exist as `.js` files in the final container.
- The `other/build-server.ts` also post-processes output to rewrite `.ts/.tsx` import extensions to `.js` for Node ESM compatibility.

## Monorepo Notes

- `mobile/` is a separate npm package. Run `cd mobile && npm install --legacy-peer-deps` to set it up.
- Root tsconfig excludes `mobile/**`.
