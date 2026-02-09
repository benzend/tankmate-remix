# ReefChronicles React Native Migration & UI Improvement Plan

## Overview

Migrate ReefChronicles from a Remix web app to a React Native mobile app using **Expo**, while keeping the existing Remix server as the backend by adding a REST API layer. The mobile app will ship to iOS and Android with an improved UI designed for native interaction patterns.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Expo (managed) | Managed workflow, OTA updates, file-based routing via Expo Router — familiar for Remix devs |
| **Navigation** | Expo Router + React Navigation | File-based routing mirrors the existing Remix route structure |
| **Styling** | NativeWind (Tailwind for RN) | Reuse your existing Tailwind mental model and color tokens |
| **Data Fetching** | TanStack Query (React Query) | Caching, background refetch, optimistic updates — replaces Remix loaders on the client |
| **Forms** | React Hook Form + Zod | Zod schemas can be shared between server and mobile client |
| **Auth Token Storage** | expo-secure-store | Encrypted keychain (iOS) / keystore (Android) for JWT/session tokens |
| **Charts** | Victory Native + react-native-skia | 60fps native-rendered charts, replaces Chart.js |
| **Animations** | react-native-reanimated | Native thread animations for transitions and micro-interactions |
| **Camera** | expo-camera + expo-image-picker | Coral analysis capture + gallery photo selection |
| **Push Notifications** | expo-notifications + FCM/APNs | Maintenance reminders, parameter alerts |
| **Image Loading** | expo-image | Fast image caching with blurhash placeholders |
| **State** | TanStack Query (server state) + Zustand (UI state) | Minimal client state, server-driven architecture |
| **Icons** | @expo/vector-icons or react-native-heroicons | Native icon set, replaces SVG sprite system |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Native App                │
│  (Expo Router, NativeWind, TanStack Query)       │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │ Screens │  │ API Layer│  │ Secure Storage   │ │
│  │ (UI)    │←→│ (hooks)  │  │ (auth tokens)    │ │
│  └─────────┘  └────┬─────┘  └─────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │ HTTPS
┌─────────────────────┼───────────────────────────┐
│          Existing Remix Server (Fly.io)          │
│                     │                             │
│  ┌──────────────────┼──────────────────────────┐ │
│  │  NEW: /api/* routes (Express)               │ │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │ │
│  │  │ Auth API │ │ Tank API │ │ Upload API  │ │ │
│  │  └──────────┘ └──────────┘ └─────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
│                     │                             │
│  Existing: Prisma → SQLite, OpenAI, Resend, etc. │
└─────────────────────────────────────────────────┘
```

Both the web app (Remix loaders/actions) and the mobile app (REST API) share the same Prisma queries, auth logic, and external service integrations. No duplication of business logic.

---

## Phase 0: API Layer (Server-Side)

**Goal:** Add REST API endpoints to the existing Express server that the React Native app can call. The web app continues to work unchanged.

### Auth Strategy

Switch from cookie-based sessions to **Bearer token** auth for mobile:

- On login, return a `{ token, refreshToken, expiresAt }` response
- Store the existing Prisma `Session.id` as the bearer token (it's already a CUID)
- Mobile sends `Authorization: Bearer <sessionId>` on every request
- Add a middleware that checks for Bearer token OR cookie session — both resolve to the same `getUserId()` path
- Refresh token endpoint extends session expiration

### API Endpoints

All endpoints prefixed with `/api/v1/`. Request/response format: JSON.

#### Auth

| Method | Endpoint | Maps to | Notes |
|---|---|---|---|
| POST | `/api/v1/auth/login` | `login()` in auth.server.ts | Returns `{ token, refreshToken, user }` |
| POST | `/api/v1/auth/signup` | `signup()` flow | Email → verify → onboard (multi-step) |
| POST | `/api/v1/auth/verify` | `validateRequest()` | Verify OTP code |
| POST | `/api/v1/auth/onboard` | Onboarding action | Create account after email verification |
| POST | `/api/v1/auth/logout` | `logout()` | Invalidates session server-side |
| POST | `/api/v1/auth/refresh` | New | Extends session, returns new token |
| POST | `/api/v1/auth/forgot-password` | Forgot password action | Sends reset email |
| POST | `/api/v1/auth/reset-password` | Reset password action | Requires valid verification |
| POST | `/api/v1/auth/2fa/verify` | 2FA verification | Returns upgraded token |
| GET | `/api/v1/auth/oauth/:provider` | OAuth initiation | Returns OAuth URL for in-app browser |
| GET | `/api/v1/auth/oauth/:provider/callback` | OAuth callback | Deep link back to app |

#### Tanks

| Method | Endpoint | Maps to |
|---|---|---|
| GET | `/api/v1/tanks` | Dashboard loader (tank list with scores) |
| POST | `/api/v1/tanks` | tanks.new action |
| GET | `/api/v1/tanks/:id` | tanks.$id loader (full detail with relations) |
| PATCH | `/api/v1/tanks/:id` | tanks.$tankId.update action |
| DELETE | `/api/v1/tanks/:id` | tanks.$tankId.delete action |

#### Parameter Logs

| Method | Endpoint | Maps to |
|---|---|---|
| GET | `/api/v1/tanks/:id/parameters` | Parameter logs for a tank (chart data) |
| POST | `/api/v1/tanks/:id/parameters` | parameter-log.new action |
| GET | `/api/v1/parameters/:id` | Single parameter log detail |

#### Maintenance

| Method | Endpoint | Maps to |
|---|---|---|
| GET | `/api/v1/tanks/:id/maintenance` | Maintenance logs for a tank |
| POST | `/api/v1/tanks/:id/maintenance` | maintenance.new action |
| GET | `/api/v1/maintenance/:id` | Single maintenance log detail |

#### Coral Analysis

| Method | Endpoint | Maps to |
|---|---|---|
| GET | `/api/v1/coral-analyses` | Coral analyses list (all tanks) |
| POST | `/api/v1/coral-analyses` | coral-analyses.new action (triggers OpenAI) |
| GET | `/api/v1/coral-analyses/:id` | Single analysis detail |

#### Galleries

| Method | Endpoint | Maps to |
|---|---|---|
| GET | `/api/v1/tanks/:id/gallery` | Gallery images for a tank |
| POST | `/api/v1/tanks/:id/gallery` | Add images (batch) |
| PATCH | `/api/v1/gallery/:id` | Update image metadata |
| DELETE | `/api/v1/gallery/:id` | Delete image |
| PATCH | `/api/v1/tanks/:id/gallery/publish` | Toggle gallery publish |

#### Search

| Method | Endpoint | Maps to |
|---|---|---|
| GET | `/api/v1/search?q=...` | /resources/search loader (OpenAI) |

#### User / Settings

| Method | Endpoint | Maps to |
|---|---|---|
| GET | `/api/v1/user/me` | Current user profile |
| PATCH | `/api/v1/user/me` | Update profile (username, name) |
| POST | `/api/v1/user/me/photo` | Upload profile photo |
| DELETE | `/api/v1/user/me/photo` | Delete profile photo |
| POST | `/api/v1/user/me/password` | Change password |
| POST | `/api/v1/user/me/password/create` | Create password (OAuth users) |
| GET | `/api/v1/user/me/connections` | OAuth connections |
| DELETE | `/api/v1/user/me/connections/:id` | Disconnect OAuth |
| POST | `/api/v1/user/me/2fa/setup` | Generate 2FA secret + QR URI |
| POST | `/api/v1/user/me/2fa/verify` | Verify & enable 2FA |
| DELETE | `/api/v1/user/me/2fa` | Disable 2FA |
| POST | `/api/v1/user/me/change-email` | Initiate email change |
| GET | `/api/v1/user/me/data-export` | GDPR data download |

#### Uploads

| Method | Endpoint | Maps to |
|---|---|---|
| POST | `/api/v1/uploads/presign` | Get UploadThing presigned URL |

### Implementation Approach

1. Create `server/api/` directory with route modules
2. Each module exports an Express Router
3. Share Prisma queries via shared service functions extracted from loaders/actions
4. Add `authenticateAPI` middleware that reads Bearer token → resolves userId
5. Add API-specific rate limiting (same tiers, keyed by userId + IP)
6. Mount all API routes under `/api/v1` in `server/index.ts`

### Shared Service Layer

Extract business logic from Remix loaders/actions into reusable functions:

```
server/services/
  ├── auth.service.ts        ← login, signup, verify, session management
  ├── tank.service.ts        ← CRUD for tanks, ownership checks
  ├── parameter.service.ts   ← parameter log CRUD
  ├── maintenance.service.ts ← maintenance log CRUD
  ├── coral.service.ts       ← coral analysis + OpenAI integration
  ├── gallery.service.ts     ← gallery CRUD, publish toggle
  ├── user.service.ts        ← profile, password, connections, 2FA
  └── search.service.ts      ← OpenAI search
```

Each service receives a `userId` (already authenticated) and returns plain objects. No Request/Response coupling — these work for both Remix and the REST API.

---

## Phase 1: React Native Project Setup

**Goal:** Scaffold the Expo project, configure navigation, auth flow, and theming.

### Project Structure

```
mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout (auth provider, query provider)
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── _layout.tsx           # Auth layout (no tabs)
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── verify.tsx
│   │   ├── onboard.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main app (authenticated, bottom tabs)
│   │   ├── _layout.tsx           # Tab bar layout
│   │   ├── index.tsx             # Dashboard (tank list)
│   │   ├── coral.tsx             # Coral analyzer
│   │   ├── galleries.tsx         # Galleries
│   │   └── settings.tsx          # Settings
│   ├── tank/                     # Tank stack (no tab bar)
│   │   ├── [id]/
│   │   │   ├── index.tsx         # Tank detail
│   │   │   ├── edit.tsx          # Edit tank
│   │   │   ├── parameters.tsx    # Parameter history + charts
│   │   │   ├── log-params.tsx    # Log new parameters
│   │   │   ├── maintenance.tsx   # Maintenance history
│   │   │   ├── log-maint.tsx     # Log new maintenance
│   │   │   └── gallery.tsx       # Tank gallery
│   │   └── new.tsx               # Create new tank
│   ├── coral/
│   │   ├── [id].tsx              # Analysis detail
│   │   └── new.tsx               # New analysis (camera)
│   └── profile/
│       ├── edit.tsx              # Edit profile
│       ├── password.tsx          # Change password
│       ├── two-factor.tsx        # 2FA setup
│       └── connections.tsx       # OAuth connections
├── components/
│   ├── ui/                       # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   └── Skeleton.tsx
│   ├── charts/
│   │   ├── ParameterChart.tsx    # Full-size parameter chart
│   │   └── Sparkline.tsx         # Mini inline chart
│   ├── tank/
│   │   ├── TankCard.tsx
│   │   ├── HealthRing.tsx        # Circular health score indicator
│   │   └── ParameterGrid.tsx
│   ├── coral/
│   │   ├── AnalysisCard.tsx
│   │   └── CameraOverlay.tsx     # Guided capture UI
│   └── common/
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       └── PullToRefresh.tsx
├── hooks/
│   ├── useAuth.ts                # Auth context + token management
│   ├── useTanks.ts               # TanStack Query hooks for tank API
│   ├── useParameters.ts
│   ├── useMaintenance.ts
│   ├── useCorals.ts
│   ├── useGallery.ts
│   └── useSearch.ts
├── lib/
│   ├── api.ts                    # Fetch wrapper with auth headers
│   ├── queryClient.ts            # TanStack Query config
│   ├── auth.ts                   # Token storage (expo-secure-store)
│   └── schemas.ts                # Shared Zod schemas (imported from server)
├── theme/
│   ├── colors.ts                 # Color palette (from extended-theme.ts)
│   ├── typography.ts             # Font sizes + families (Jost, Gowun Batang)
│   └── spacing.ts                # Spacing scale
├── assets/
│   └── animations/               # Lottie files (water, bubbles, fish)
├── tailwind.config.ts            # NativeWind config
├── app.config.ts                 # Expo config
└── package.json
```

### Key Setup Tasks

1. `npx create-expo-app mobile --template tabs` inside the repo root
2. Install NativeWind and port the color tokens from `app/utils/extended-theme.ts`
3. Configure Expo Router with the `(auth)` and `(tabs)` layout groups
4. Set up TanStack Query provider in root layout
5. Build the API client (`lib/api.ts`) with Bearer token injection and refresh logic
6. Implement auth context that checks `expo-secure-store` for existing token on launch
7. Install custom fonts (Jost, Gowun Batang) via `expo-font`

---

## Phase 2: Core Screens — Dashboard & Tank Management

**Goal:** Build the primary user flow — viewing tanks, tank details, and managing data.

### Screen: Dashboard (Tank List)

**Current web UI:** Card grid, 1-4 columns responsive, basic tank name + image + score.

**Improved mobile UI:**
- **Pull-to-refresh** on the tank list
- **Tank cards** as horizontally-scrollable carousel (1 card visible with peek of next) on small screens, 2-col grid on tablets
- Each card shows:
  - Tank image (full-bleed, 16:9 aspect ratio) with gradient overlay at bottom
  - Tank name overlaid on image
  - **Health ring** — circular progress indicator color-coded by score (green/yellow/red)
  - **Sparkline row** — 3-4 mini charts showing recent pH, temp, alk, calcium trends
  - Water type badge (saltwater/freshwater pill)
- **Swipe actions** on cards: swipe left → delete (with confirmation), swipe right → quick-log parameters
- **Floating Action Button (FAB)** in bottom-right to add new tank
- **Empty state** with illustration and "Add your first tank" CTA when no tanks exist
- **Skeleton loading** while data fetches

### Screen: Tank Detail

**Current web UI:** Linear layout with image, name, parameter charts in a grid, maintenance list.

**Improved mobile UI:**
- **Sticky header** with tank image as background (parallax scroll effect)
  - Tank name + water type overlaid
  - Back button + edit icon in header
  - Health score ring in top-right corner
- **Scrollable tab sections** (horizontal tab bar, swipeable):
  - **Overview** — key stats, latest parameters as a compact grid, recent maintenance entries
  - **Parameters** — full chart view for each parameter with time range selector (7d / 30d / 90d / All)
  - **Maintenance** — chronological maintenance log with type icons
  - **Gallery** — masonry image grid with pinch-to-zoom viewer
- **Quick Action Bar** (sticky bottom):
  - "Log Parameters" button
  - "Log Maintenance" button
  - "Take Photo" button (camera → gallery)

### Screen: Log Parameters (Bottom Sheet)

**Current web UI:** Full page form with dropdown + 8 number inputs.

**Improved mobile UI:**
- **Bottom sheet modal** (slides up from bottom, doesn't navigate away from tank detail)
- Tank pre-selected based on context (which tank detail you're on)
- **Parameter input grid** — 2x4 grid of number inputs, each labeled with unit
- **Numeric keyboard** auto-focused for each input
- **Target range hint** shown below each input (e.g., "Target: 8.0–8.4" for pH)
- Color-coded borders: green if value is in range, yellow/red if out of range
- **Quick presets** — "Same as last" button to pre-fill from most recent log
- **Haptic feedback** on submit success
- Dismissible by swiping down

### Screen: Log Maintenance (Bottom Sheet)

**Current web UI:** Full page form with type dropdown + details textarea.

**Improved mobile UI:**
- **Bottom sheet modal**
- **Maintenance type selector** — visual grid of icons instead of dropdown:
  - 💧 Water Change
  - 🔄 Filter Change
  - 🏖️ Sand Change
  - ⚙️ Custom
- **Details textarea** with placeholder text per type
- One-tap submit

### Screen: Create/Edit Tank

**Current web UI:** Standard form page.

**Improved mobile UI:**
- **Multi-step wizard** (3 steps with progress indicator):
  1. **Basics** — Name, water type toggle (saltwater/freshwater with icons)
  2. **Dimensions** — Visual tank dimension inputs with a tank silhouette that updates as you type, auto-calculated volume
  3. **Photo** — Camera capture or gallery pick for tank image
- **Animated transitions** between steps (slide left/right)

---

## Phase 3: AI Features — Coral Analysis & Search

### Screen: Coral Analysis List

**Current web UI:** List with color-coded left borders by health score.

**Improved mobile UI:**
- **Image-forward card list** — each card is the coral photo with overlay info
  - Full-width image (3:2 aspect ratio)
  - Health score badge (circular, color-coded) floating in top-right
  - Friendly name + scientific name at bottom
  - Date label
- **Filter chips** at top: All, Healthy (8+), Watch (5-7), Critical (<5)
- Pull-to-refresh
- FAB → "Analyze New Coral"

### Screen: New Coral Analysis (Camera Flow)

**Current web UI:** UploadThing file picker → wait for AI response.

**Improved mobile UI:**
- **Full-screen camera view** with:
  - Framing guide overlay (circular or square target area)
  - Lighting indicator (warns if too dark)
  - "Tips" overlay: "Get close, ensure good lighting, steady hand"
  - Flash toggle
  - Gallery pick button (bottom-left) as alternative
- **Review screen** after capture:
  - Full-screen image preview
  - "Retake" and "Analyze" buttons
  - Tap "Analyze" → upload + OpenAI call
- **Loading state** — animated Lottie (scanning/analyzing visual) while OpenAI processes
- **Results screen:**
  - Coral image at top
  - Health score with large animated ring (fills up to score)
  - Friendly name + scientific name
  - AI analysis text (otherDetails) in readable card
  - "Save to Tank" button → tank picker if not pre-selected
  - "Share" button → native share sheet

### Global Search

**Current web UI:** Debounced input in top nav with dropdown results.

**Improved mobile UI:**
- **Search accessible from all tabs** via search icon in header
- **Full-screen search overlay** on tap (like iOS Spotlight):
  - Large input with auto-focus
  - Recent searches list
  - Results appear below as typed (debounced)
  - "Expert Answer" as a collapsible card at the top of results
  - Result items link to relevant screens

---

## Phase 4: Media — Galleries & Image Upload

### Screen: Galleries Tab

**Current web UI:** Per-tank sections with 4-column grid, hover overlays.

**Improved mobile UI:**
- **Per-tank sections** with horizontal scroll preview (4-5 images visible) + "See All" link
- Published/unpublished status badge per tank
- Tap a section → full gallery view

### Screen: Full Gallery View

- **Masonry grid layout** (2 columns, variable height based on image aspect ratio)
- **Tap image** → full-screen viewer with:
  - Pinch-to-zoom
  - Swipe left/right between images
  - Image title + description overlay at bottom
  - Share, Edit, Delete actions in toolbar
- **Multi-select mode** — long-press to enter, tap to toggle, batch delete

### Upload Flow

- **FAB** → bottom sheet with options:
  - "Take Photo" (camera)
  - "Choose from Library" (multi-select image picker)
- **Batch metadata editor** — after selecting images, scroll through each with title/description/alt fields
- **Upload progress** — per-image progress bars, retry on failure
- Tank auto-selected from context

---

## Phase 5: Settings & Profile

### Screen: Settings Tab

**Current web UI:** Profile page with forms for name, photo, password, 2FA, connections.

**Improved mobile UI:**
- **Settings list** (native grouped table style):
  - **Account section:**
    - Profile photo + name (tap to edit)
    - Email
    - Username
  - **Security section:**
    - Password (Change / Create)
    - Two-Factor Authentication (toggle + setup)
    - Active Sessions (count + "Sign Out All")
  - **Connections section:**
    - GitHub (Connected / Connect)
  - **Data section:**
    - Export My Data
    - Delete Account (destructive, red text)
  - **App section:**
    - Theme (System / Light / Dark)
    - Notifications (on/off + configure)
    - About / Version

### 2FA Setup Flow

- Step 1: Tap "Enable 2FA" → server generates TOTP secret
- Step 2: QR code displayed (for authenticator app)
- Step 3: Enter verification code
- Step 4: Success confirmation with recovery code display

---

## Phase 6: Polish & Platform Features

### Push Notifications

- **Maintenance reminders** — "Time for a water change?" based on maintenance log frequency
- **Parameter alerts** — if last logged parameters were out of range, remind to re-check
- **Coral health check-ins** — periodic reminder to re-analyze corals

Implementation:
- `expo-notifications` for local scheduling
- Server-side push via FCM/APNs for remote triggers
- Add `devicePushToken` field to User model, register on login
- New API endpoints: `POST /api/v1/user/me/push-token`, `DELETE /api/v1/user/me/push-token`

### Offline Support (Stretch Goal)

- Cache last-fetched tank data in local SQLite via `expo-sqlite`
- Allow reading cached data when offline (read-only)
- Queue parameter logs and maintenance entries for sync when back online
- Visual indicator when operating offline

### Animations & Micro-interactions

- **Shared element transitions** — tank card image → tank detail header image
- **Skeleton loading** for all data-fetching screens
- **Haptic feedback** on: form submit, delete confirmation, FAB tap, swipe action threshold
- **Lottie animations** for: empty states, loading states, coral scanning, success confirmations
- **Aquatic theme** — subtle wave animation on dashboard header, water ripple effect on pull-to-refresh

### Accessibility

- VoiceOver (iOS) and TalkBack (Android) labels on all interactive elements
- Dynamic type support (respects system font size)
- Minimum 44pt touch targets on all buttons
- Sufficient color contrast (WCAG AA on all text)
- Reduce motion support (disable animations when system preference set)

---

## Migration Order & Milestones

| Milestone | Phase | Deliverable | Dependencies |
|---|---|---|---|
| **M0** | Phase 0 | API layer live, web app unchanged | None |
| **M1** | Phase 1 | App shell with auth flow working | M0 |
| **M2** | Phase 2 | Dashboard + tank CRUD + parameter/maintenance logging | M1 |
| **M3** | Phase 3 | Coral analysis camera flow + search | M2 |
| **M4** | Phase 4 | Gallery management with native image viewer | M2 |
| **M5** | Phase 5 | Settings, profile, 2FA, OAuth | M1 |
| **M6** | Phase 6 | Notifications, animations, polish | M2-M5 |
| **M7** | — | TestFlight / Play Store internal testing | M2-M5 |
| **M8** | — | App Store / Play Store submission | M6-M7 |

M2 and M5 can run in parallel. M3 and M4 can also run in parallel since they're independent feature areas.

---

## Shared Code Between Web & Mobile

These can live in a shared package (or be imported from the server):

- **Zod schemas** — validation schemas for all forms (tank, parameters, maintenance, auth)
- **Type definitions** — TypeScript interfaces for API request/response shapes
- **Constants** — parameter success ranges, maintenance types, water types
- **Color tokens** — extracted from extended-theme.ts into a shared format
- **Service layer** — the Phase 0 extracted business logic is consumed by both Remix and the API

### Monorepo Structure

```
tankmate-remix/
├── apps/
│   ├── web/          ← existing Remix app (moved)
│   └── mobile/       ← new Expo app
├── packages/
│   └── shared/       ← Zod schemas, types, constants
├── server/           ← Express + API routes (shared backend)
├── prisma/           ← shared database schema
└── package.json      ← workspace root
```

Use npm/yarn/pnpm workspaces to manage the monorepo. The shared package is consumed by both `apps/web` and `apps/mobile`.

---

## Database Considerations

The current SQLite setup works but has limitations for a multi-client architecture:

- **Short term:** Keep SQLite. The API layer adds no concurrency issues since it's the same Express process handling both web and mobile requests.
- **Long term:** If user count grows or you need real-time features (WebSocket push for parameter updates), migrate to **PostgreSQL**. Prisma makes this a schema change + migration — no query rewrites needed.

Add to schema for mobile support:
```prisma
model DevicePushToken {
  id        String   @id @default(cuid())
  token     String
  platform  String   // "ios" | "android"
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([token])
  @@index([userId])
}
```

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| UploadThing may not support direct mobile uploads | Blocks image features | Use presigned URL pattern: server generates URL, mobile uploads directly to storage |
| OAuth in-app browser UX | Clunky auth flow | Use `expo-auth-session` for native OAuth, deep link callback |
| Expo managed workflow limitations | May need native modules | Eject to dev client only if needed; most features covered by Expo SDK |
| Maintaining two frontends | Double the UI work | Shared service layer + shared schemas minimize drift. Consider dropping web-specific features on mobile |
| App Store review delays | Blocks launch | Submit early with TestFlight/internal testing track while polishing |
