# TankMate Mobile — Architecture Guide

## Overview

TankMate Mobile is a React Native (Expo) companion app for the TankMate aquarium management platform. It shares a backend with the existing Remix web app via a REST API layer.

```
┌───────────────────────────────────────────┐
│          React Native App (Expo)          │
│                                           │
│  Screens → Hooks → API Client → Server   │
│   (UI)    (TanStack    (fetch +   (REST)  │
│            Query)       Bearer)           │
└──────────────────┬────────────────────────┘
                   │ HTTPS + Bearer Token
┌──────────────────┼────────────────────────┐
│     Remix Server (Express on Fly.io)      │
│                  │                        │
│   /api/v1/*  ────┤  (mobile API)          │
│   /resources/*   │  (web loaders/actions) │
│                  │                        │
│   Prisma (SQLite) + UploadThing CDN       │
└───────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Expo ~52 (managed) | Build toolchain, OTA updates |
| Routing | Expo Router ~4 | File-based navigation |
| Styling | NativeWind 4 (Tailwind) | Utility-first styles |
| Data | TanStack Query 5 | Server state, caching, offline |
| Client State | Zustand 5 | Auth store, minimal UI state |
| Forms | React Hook Form + Zod | Validation shared with server |
| Auth Storage | expo-secure-store | Encrypted keychain/keystore |
| Images | expo-image | Fast loading with transitions |
| Charts | Victory Native | Parameter history visualization |
| Animations | React Native Animated | Spring-based micro-interactions |
| Notifications | expo-notifications | Push via FCM/APNs |
| Biometrics | expo-local-authentication | Face ID / fingerprint unlock |

---

## Directory Structure

```
mobile/
├── app/                          # Expo Router file-based screens
│   ├── _layout.tsx               # Root: providers, auth gate, biometric
│   ├── search.tsx                # AI-powered search overlay
│   ├── (auth)/                   # Unauthenticated screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                   # Main tab bar
│   │   ├── _layout.tsx           # Tab config with haptic feedback
│   │   ├── index.tsx             # Dashboard — tank grid
│   │   ├── coral.tsx             # Coral analysis list
│   │   ├── galleries.tsx         # All tank galleries
│   │   └── settings.tsx          # Account, security, data, danger zone
│   ├── profile/                  # Account management
│   │   ├── edit.tsx
│   │   ├── password.tsx
│   │   ├── connections.tsx       # OAuth providers
│   │   └── two-factor.tsx
│   ├── tank/
│   │   ├── new.tsx               # Create tank
│   │   └── [id]/
│   │       ├── index.tsx         # Tank detail
│   │       ├── edit.tsx          # Edit tank
│   │       ├── parameters.tsx    # Parameter history + charts
│   │       ├── maintenance.tsx   # Maintenance history
│   │       ├── log-params.tsx    # Log water parameters
│   │       ├── log-maint.tsx     # Log maintenance
│   │       └── gallery.tsx       # Manage tank photos
│   └── coral/
│       ├── new.tsx               # Camera → AI analysis flow
│       └── [id].tsx              # Coral detail
│
├── components/
│   ├── ui/                       # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx             # Spring-animated snackbar
│   │   ├── ErrorBoundary.tsx     # React error boundary with retry
│   │   └── Animated.tsx          # FadeIn, StaggeredList, ScalePress
│   ├── tank/
│   │   ├── TankCard.tsx          # Tank grid card
│   │   └── HealthRing.tsx        # Circular health score
│   └── common/
│       └── EmptyState.tsx        # Empty state with icon + CTA
│
├── hooks/                        # All data hooks (TanStack Query)
│   ├── useAuth.ts                # Zustand auth store
│   ├── useUser.ts                # Profile, password, connections, export, delete
│   ├── useTanks.ts               # Tank CRUD
│   ├── useParameters.ts          # Parameter log queries + mutations
│   ├── useMaintenance.ts         # Maintenance log queries + mutations
│   ├── useCorals.ts              # Coral analysis queries + mutations
│   ├── useSearch.ts              # AI search with debounce
│   ├── usePushNotifications.ts   # Push token registration + listeners
│   └── useBiometrics.ts          # Face ID / fingerprint toggle
│
├── lib/                          # Core libraries
│   ├── api.ts                    # Fetch wrapper: Bearer auth, token refresh, error handling
│   ├── auth.ts                   # Secure token storage (keychain/keystore)
│   ├── queryClient.ts            # TanStack Query + AsyncStorage persistence
│   └── upload.ts                 # Image upload: local file → base64 → server → CDN
│
├── theme/                        # Design tokens
│   ├── colors.ts                 # Dark theme palette matching web
│   ├── typography.ts             # Font families (Jost, GowunBatang)
│   └── spacing.ts                # Spacing scale
│
└── __tests__/                    # Jest test suite
    ├── api-client.test.ts
    ├── useAuth.test.ts
    ├── useUser.test.ts
    ├── useTanks.test.ts
    ├── useDataHooks.test.ts
    ├── Toast.test.tsx
    └── ErrorBoundary.test.tsx
```

---

## Authentication Flow

```
App Launch
    │
    ├── Has stored token?
    │   ├── No  → Show login screen
    │   └── Yes
    │       ├── Biometric enabled?
    │       │   ├── Yes → Prompt Face ID / fingerprint
    │       │   │         (pass or fail, continue to restore)
    │       │   └── No  → Skip
    │       └── Call GET /api/v1/user/me
    │           ├── 200 → Set user in Zustand store → Navigate to tabs
    │           └── 401 → Attempt token refresh
    │                     ├── Refresh succeeds → Retry original request
    │                     └── Refresh fails → Clear tokens → Login screen
```

**Token storage**: `expo-secure-store` (iOS Keychain, Android Keystore)
**Token type**: Prisma Session ID sent as `Authorization: Bearer <sessionId>`
**Token refresh**: Automatic on 401 via `POST /auth/refresh`, with deduplication of concurrent refreshes

---

## Data Flow

All server state flows through TanStack Query:

```
Screen Component
    │
    └── useTanks() / useParameters() / etc.
        │
        └── TanStack Query
            ├── Check cache (AsyncStorage persistence for offline)
            ├── If stale (>30s) → Background refetch via api()
            └── api() → fetch() with Bearer token
                       → Auto-refresh on 401
                       → JSON response → Cache update → Re-render
```

**Offline support**: Query cache persists to AsyncStorage (7-day max age, 24-hour garbage collection). On app open without connectivity, stale cached data renders immediately.

**Mutations**: All writes use `useMutation` with `onSuccess` callbacks that invalidate relevant query keys, triggering automatic refetch.

---

## Image Upload Flow

```
expo-image-picker (camera or library)
    │ local file URI
    │
expo-file-system.readAsStringAsync(uri, base64)
    │ base64 string
    │
POST /api/v1/upload { base64, filename, contentType }
    │ server receives base64
    │
UTApi.uploadFiles(File)  ← UploadThing server SDK
    │ uploads to UploadThing CDN
    │
Response: { url, key, name, size }
    │ CDN URL
    │
Store URL in database (gallery, coral analysis, tank image)
```

Batch uploads supported via `POST /api/v1/upload/batch` (up to 10 images).

---

## Server API Layer

All mobile API routes live at `/api/v1/*`, mounted in `server/index.ts` before the Remix catch-all.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Login, returns session token |
| POST | `/auth/signup` | Register new account |
| POST | `/auth/logout` | Invalidate current session |
| POST | `/auth/refresh` | Extend session expiry |
| GET | `/tanks` | List user's tanks |
| POST | `/tanks` | Create tank |
| GET | `/tanks/:id` | Tank detail with relations |
| PATCH | `/tanks/:id` | Update tank |
| DELETE | `/tanks/:id` | Delete tank |
| GET | `/tanks/:id/parameters` | Parameter logs for tank |
| POST | `/tanks/:id/parameters` | Log water parameters |
| GET | `/tanks/:id/maintenance` | Maintenance logs for tank |
| POST | `/tanks/:id/maintenance` | Log maintenance |
| GET | `/tanks/:id/gallery` | Gallery images for tank |
| POST | `/tanks/:id/gallery` | Add gallery images |
| PATCH | `/gallery/:id` | Update image metadata |
| DELETE | `/gallery/:id` | Delete gallery image |
| GET | `/galleries` | All galleries for user |
| GET | `/coral-analyses` | List coral analyses |
| POST | `/coral-analyses` | Analyze coral (AI) |
| GET | `/coral-analyses/:id` | Coral detail |
| GET | `/user/me` | Current user profile |
| PATCH | `/user/me` | Update profile |
| DELETE | `/user/me` | Delete account |
| POST | `/user/me/password` | Change password |
| GET | `/user/me/connections` | OAuth connections |
| POST | `/user/me/sign-out-others` | Revoke other sessions |
| GET | `/user/me/data-export` | Export all user data |
| GET | `/search?q=` | AI-powered search |
| POST | `/upload` | Single image upload |
| POST | `/upload/batch` | Batch image upload |
| POST | `/push/register` | Register push token |
| DELETE | `/push/unregister` | Remove push token |

---

## Key Design Decisions

1. **Shared backend** — No separate API server. The Remix Express server serves both web and mobile through different auth mechanisms (cookies vs Bearer tokens) but the same Prisma database.

2. **Service layer extraction** — Business logic lives in `server/services/*.service.ts`, shared between Remix loaders/actions and API routes. No duplication.

3. **Server-proxied uploads** — Mobile sends base64 to our server, which uploads to UploadThing. This avoids exposing UploadThing tokens to the client and keeps the upload flow consistent with web.

4. **Token = Session ID** — Mobile uses the same Prisma `Session` table as web. The Bearer token IS the session ID. No JWTs, no refresh tokens — just session extension via `/auth/refresh`.

5. **Offline-first reads** — TanStack Query persistence means the app shows cached data instantly on launch, even without network. Writes require connectivity.

6. **Biometric as convenience** — Biometric unlock gates the app restore, not the token itself. The token is always stored in the secure enclave. Biometric adds a "show me your face before I show your data" gate.
