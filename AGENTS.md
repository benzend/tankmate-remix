# Agent Guidelines for Tankmate Remix Project

## Commands
- **Build**: `npm run build` (runs build:icons, build:remix, build:server)
- **Lint**: `npm run lint` (ESLint with @epic-web/config)
- **Typecheck**: `npm run typecheck` (TypeScript)
- **Test single file**: `npm test -- path/to/test.test.ts`
- **Test all**: `npm test` (Vitest)
- **E2E test**: `npm run test:e2e` (Playwright)
- **Format**: `npm run format` (Prettier)
- **Validate all**: `npm run validate`

## Code Style
- Use path aliases: `#app/*` for app files, `#tests/*` for test files
- Import React components with explicit extensions (.tsx)
- Use `cn()` utility for Tailwind class merging
- Follow Epic Stack conventions (@epic-web/config for linting/types)
- Server files end with `.server.ts`, client files with `.client.ts`
- Use Zod for validation, Conform for forms
- Error handling with `getErrorMessage()` utility
- Date utilities in `misc.tsx` for consistent formatting
- Components use cva for variants, forwardRef for refs
- Test files: `*.test.{ts,tsx}` in app/, e2e in tests/e2e/

## File Organization & Purity
- Create small, focused files (single responsibility principle)
- Keep files under 200 lines when possible
- Extract pure functions into separate utility files
- Prioritize pure functions (no side effects, deterministic output)
- Separate business logic from UI components
- Use composable, reusable utilities over monolithic functions
- Group related utilities in dedicated files (e.g., date-utils.ts, validation.ts)