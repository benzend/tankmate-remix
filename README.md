# ReefChronicle

A full-stack aquarium management application for tracking water parameters, maintenance schedules, coral health, and more. Built on the [Epic Stack](https://www.epicweb.dev/epic-stack).

## Features

- **Tank Management** — Create and manage multiple freshwater and saltwater tanks
- **Water Parameter Logging** — Track pH, ammonia, nitrite, nitrate, alkalinity, calcium, magnesium, and salinity over time
- **Maintenance Tracking** — Log water changes, filter cleanings, equipment maintenance, and more
- **Coral Analysis** — AI-powered coral health analysis via image upload
- **Dosing Calculator** — Calculate supplement doses for ~90 products across calcium, alkalinity, and magnesium
- **Tank Gallery** — Photo gallery for each tank with image uploads
- **Tank Scoring** — Automated health scores based on parameter history
- **Mobile App** — React Native (Expo) companion app with offline support and push notifications
- **User Profiles** — Public profiles and tank sharing
- **Subscriptions** — Stripe (web) and RevenueCat (mobile) billing integration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | Remix + React + Vite |
| Mobile App | React Native (Expo SDK 54) |
| Backend | Express.js + Remix server |
| Database | SQLite + Prisma ORM |
| Auth | remix-auth (cookie sessions), Bearer tokens (mobile) |
| Styling | Tailwind CSS (web), NativeWind (mobile) |
| Deployment | Fly.io with LiteFS-replicated SQLite |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/benzend/tankmate-remix.git
cd tankmate-remix

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Build, generate Prisma client, run migrations, seed database, install Playwright
npm run setup
```

### Development

```bash
npm run dev
```

### Mobile App

```bash
cd mobile
npm install --legacy-peer-deps

# In one terminal — start the API server
PORT=3000 npm run dev

# In another terminal — start Expo
API_URL=http://<your-lan-ip>:3000 npx expo start
```

See the [mobile README](mobile/README.md) for more details.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Full production build |
| `npm test` | Run unit tests (Vitest, watch mode) |
| `npm test -- --run` | Run unit tests once |
| `npm run test:e2e:run` | Run Playwright e2e tests (headless) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run format` | Prettier |
| `npm run validate` | Run tests, lint, typecheck, and e2e in parallel |
| `npm run prisma:studio` | Open Prisma database GUI |

## Project Structure

```
app/                    # Remix web application
  routes/               # File-based routing (remix-flat-routes)
    dashboard+/         # Protected dashboard (tanks, parameters, maintenance, etc.)
    _auth+/             # Login, signup, 2FA
    tanks+/             # Tank CRUD
    settings+/          # User settings
    admin+/             # Admin panel
  components/           # React components
  utils/                # Shared utilities
server/                 # Express server & mobile API
  api/                  # REST API routes (/api/v1/*)
  services/             # Business logic layer
mobile/                 # React Native (Expo) app
prisma/                 # Database schema & migrations
tests/                  # E2E tests (Playwright) & test utilities
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. Required services:

- **Database**: SQLite (works out of the box)
- **Email**: [Resend](https://resend.com) for transactional email
- **Image Uploads**: [UploadThing](https://uploadthing.com)
- **AI Features**: OpenAI API key (for coral analysis)
- **OAuth**: GitHub (optional)
- **Payments**: Stripe (web) / RevenueCat (mobile) — optional

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

## Acknowledgments

Built on the [Epic Stack](https://www.epicweb.dev/epic-stack) by [Kent C. Dodds](https://kentcdodds.com).
