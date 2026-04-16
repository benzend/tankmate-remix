# Agent Guidelines for ReefChronicles Remix Project

## Commands

- **Build**: `npm run build` (runs build:icons, build:remix, build:server)
- **Dev**: `npm run dev` (requires `npm run build:icons` first, runs via
  dev-server.js)
- **Lint**: `npm run lint` (ESLint with @epic-web/config)
- **Typecheck**: `npm run typecheck` (TypeScript)
- **Test single file**: `npm test -- path/to/test.test.ts`
- **Test all**: `npm test` (Vitest, watch mode)
- **Test once**: `npm test -- --run`
- **E2E dev**: `npm run test:e2e` (Playwright UI mode)
- **E2E CI**: `npm run test:e2e:run` (headless, requires build first)
- **Format**: `npm run format` (Prettier)
- **Validate**: `npm run validate` (test --run, lint, typecheck, e2e:run in
  parallel)
- **DB**: `npm run prisma:studio`

## Project Structure

- **app/**: Remix web application (excluded from tsconfig: `mobile/**`)
  - **routes/**: File-based routing with remix-flat-routes
  - **components/**: React components (use cva for variants)
  - **utils/**: Shared utilities
- **server/**: Express server & mobile API routes (/api/v1/\*)
- **mobile/**: React Native (Expo) app — separate package with own dependencies
- **tests/**: E2E tests (Playwright) & test utilities
- **prisma/**: Database schema & migrations (SQLite via Prisma)

## Code Style

- **Path aliases**: `#app/*` for app files, `#tests/*` for test files
  (configured in package.json imports and tsconfig)
- **File naming**: Server files end with `.server.ts`, client files with
  `.client.ts`
- **Components**: Use `cva` for variants, `forwardRef` for refs, `cn()` from
  `#app/utils/misc.tsx` for Tailwind merging
- **Forms**: Use Conform for form handling, Zod for validation
- **Error handling**: Use `getErrorMessage()` utility from misc.tsx
- **Dates**: Use date-fns utilities and format functions from misc.tsx

## Testing

- **Unit tests**: `*.test.{ts,tsx}` co-located in app/
- **E2E tests**: Located in `tests/e2e/`
- **Test setup**: `tests/setup/setup-test-env.ts`, global setup at
  `tests/setup/global-setup.ts`

## Key Dependencies

- **Framework**: Remix 2.10.3 + React 18 + Vite
- **Database**: Prisma 5 + SQLite (better-sqlite3)
- **Styling**: Tailwind CSS + Radix UI primitives + shadcn/ui
- **Forms**: Conform + Zod
- **Auth**: remix-auth with cookie sessions
- **Testing**: Vitest + Playwright + Testing Library
