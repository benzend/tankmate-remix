# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TankMate is a full-stack aquarium management application built on the **Epic Stack** (Kent C. Dodds). It has two frontends:

- **Web app**: Remix + React + Vite, deployed to Fly.io
- **Mobile app**: React Native (Expo SDK 54) in `/mobile/`, communicates via REST API

Backend is Express.js with Prisma ORM over SQLite. The mobile API lives at `server/api/` and serves `/api/v1/*` endpoints. Requires Node 20.

## Commands

```bash
npm run build           # Full build (icons + remix + server)
npm run dev             # Dev server with HMR
npm run lint            # ESLint
npm run typecheck       # TypeScript check
npm run format          # Prettier (write mode)
npm run validate        # Runs tests, lint, typecheck, and e2e in parallel

# Testing
npm test                # Vitest in watch mode
npm test -- --run       # Single run (no watch)
npm test -- path/to/file.test.ts   # Run a single test file
npm run coverage        # Vitest with coverage
npm run test:e2e        # Playwright in UI mode
npm run test:e2e:run    # Playwright headless (CI)

# Database
npm run prisma:studio   # GUI database browser
npx prisma migrate dev  # Create/apply migrations
npx prisma db seed      # Seed database

# Setup (first time)
npm run setup           # Build + prisma generate + migrate + seed + install Playwright
```

### Mobile (`/mobile/`)

```bash
cd mobile
npm install --legacy-peer-deps  # Required due to victory-native peer dep conflicts
npm test                        # Jest (single run)
npm run test:watch              # Jest watch mode
npx jest __tests__/file.test.ts # Run a single test file
```

To run on a physical device, both the web server (API) and Expo must run simultaneously on different ports:

```bash
# Terminal 1: Start web/API server
PORT=3000 npm run dev

# Terminal 2: Start Expo (from /mobile/)
API_URL=http://<your-lan-ip>:3000 npx expo start
```

The `API_URL` is baked into `app.config.ts` at Expo start time. The fallback is set in `mobile/app.config.ts` under `extra.apiUrl`. When testing on a physical device, `localhost` won't work — use your machine's LAN IP.

## Architecture

### Routing (Remix Flat Routes)

Routes live in `app/routes/` using `remix-flat-routes` convention with `+` group notation:
- `_auth+/` — Login, signup, password reset, 2FA
- `_marketing+/` — Public landing pages
- `dashboard+/` — Protected dashboard views (sub-groups: `_tanks+/`, `_coral-analyses+/`, `_galleries+/`, `_maintenance+/`, `_parameter-log+/`)
- `tanks+/` — Tank management CRUD
- `settings+/` — User profile and settings
- `resources+/` — Asset/resource loaders
- `admin+/` — Admin panel
- `users+/` — Public user profiles
- `_seo+/` — SEO routes
- `_image-upload+/` — Image upload handling

### Mobile API (`server/api/`)

Most domains have a paired routes + service file (e.g., `tanks.routes.ts` + `tank.service.ts`). Some routes (push, upload, user) are standalone without a separate service file. Services live in `server/services/`. Web uses cookie sessions; mobile uses Bearer token auth via `middleware.ts`.

Route mounting in `server/api/index.ts`: some routers (gallery, parameters, maintenance) are mounted at `/` because they define their own nested paths like `/tanks/:tankId/gallery` internally. Others (tanks, auth, coral-analyses) are mounted at their prefix.

**Image uploads**: Mobile sends base64-encoded images in JSON to `/api/v1/upload`. Images are compressed client-side via `expo-image-manipulator` (resized to 1920px max, JPEG 0.8 quality) before encoding. The server proxies to UploadThing CDN. The Express JSON body limit is set to `50mb` to accommodate batch uploads.

### Key Patterns

- **Path aliases**: `#app/*` for app source, `#tests/*` for test utilities
- **Server/client split**: Files ending `.server.ts` are server-only, `.client.ts` are client-only
- **Forms**: Zod schemas + Conform (`@conform-to/react`, `@conform-to/zod`)
- **Styling**: Tailwind CSS with `cn()` utility for class merging (from `app/utils/misc.tsx`)
- **UI components**: shadcn/ui in `app/components/ui/` — configured in `components.json`
- **Icons**: SVG sprite system built from `other/svg-icons/` via `build-icons.ts`
- **Error boundaries**: `GeneralErrorBoundary` component, `getErrorMessage()` utility
- **Caching**: `@epic-web/cachified` with LRU cache
- **Auth**: remix-auth with GitHub OAuth, TOTP-based 2FA, Prisma-backed sessions

### Database

Prisma schema at `prisma/schema.prisma`. SQLite in dev, LiteFS-replicated SQLite in production (Fly.io). Key domain models: User, FishTank, FishTankParameterLog, FishTankMaintenance, FishTankScore, CoralAnalysis, TankGallery, Fish/FishSpecies, Plant/PlantSpecies, DevicePushToken.

### Testing Infrastructure

- **Unit tests (web)**: Vitest, colocated as `*.test.{ts,tsx}` next to source in `app/`
- **E2E tests**: Playwright in `tests/e2e/`
- **Mocks**: MSW handlers in `tests/mocks/`
- **Test setup**: `tests/setup/setup-test-env.ts`, `tests/setup/global-setup.ts`
- **Unit tests (mobile)**: Jest with `jest-expo` preset, tests in `mobile/__tests__/`. Use top-level imports with `jest.mock()` and `jest.mocked()` — avoid `jest.resetModules()` with `require()` in hook tests as it causes dual React instance errors.

### Mobile App (`/mobile/`)

Expo SDK 54, Expo Router ~6, NativeWind (Tailwind for RN), TanStack Query 5 for data fetching, Zustand for auth/UI state. Has its own `package.json` and test suite (Jest).

Expo Router layout structure:
- `app/_layout.tsx` — Root layout with providers (QueryClient, auth gate, push notifications)
- `app/(auth)/` — Login/signup screens (shown when unauthenticated)
- `app/(tabs)/` — Main tab navigation (dashboard, tanks, profile)
- `app/tank/[id]/` — Tank detail screens (parameters, maintenance, gallery, log entry)
- `app/coral/` — Coral analysis feature
- `app/search.tsx` — Search

Key mobile patterns:
- **API client**: `mobile/lib/api.ts` — fetch wrapper with Bearer token injection, 401 refresh retry
- **Auth state**: Zustand store in `mobile/hooks/useAuth.ts`, tokens in `expo-secure-store`
- **Keyboard handling**: Use `automaticallyAdjustKeyboardInsets` on ScrollView instead of `KeyboardAvoidingView`
- **Parameter config**: `mobile/lib/parameterConfig.ts` — shared parameter metadata (labels, units, colors, success ranges, y-axis bounds)
- **Charts**: `mobile/components/charts/` — custom SVG charts using `react-native-svg`

## Code Style

- Follow Epic Stack conventions (`@epic-web/config` for ESLint, TypeScript, Prettier)
- Use `cva` for component variants, `forwardRef` for refs
- Keep files under 200 lines; extract pure functions into utility files
- Separate business logic from UI components
