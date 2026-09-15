#!/usr/bin/env bash
set -euo pipefail

# TankMate Remix (ReefChronicle) install script for Cloud Agents.
# Idempotent: safe to run repeatedly against a warm or partially-prepared VM.

# The project requires Node 20 (see .nvmrc / package.json "engines").
# Node 22/24 cause better-sqlite3 native ABI mismatches, so pin via nvm.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install
nvm use
nvm alias default "$(cat .nvmrc)" >/dev/null 2>&1 || true
echo "Using Node $(node -v)"

# Provide a local .env for development if one is not already present.
# The mock values in .env.example are sufficient to boot the app; real
# secrets (OpenAI, Stripe, etc.) can be supplied via Cursor secrets to
# enable the optional AI/payment features.
if [ ! -f .env ]; then
	cp .env.example .env
	echo "Created .env from .env.example"
fi

# Install dependencies (uses the lockfile).
npm install

# Build (icons -> remix -> server), generate the Prisma client, apply
# migrations, and seed the development SQLite database.
npm run build
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

echo "Install complete."
