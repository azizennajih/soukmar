#!/usr/bin/env bash
# Neue Version auf dem Server einspielen (als root ausfuehren): bash /opt/soukmar/soukmar/deploy/update.sh
set -euo pipefail
APP_DIR=/opt/soukmar

cd "$APP_DIR/soukmar-backend"
git pull --ff-only
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

cd "$APP_DIR/soukmar"
git pull --ff-only
npm ci
npm run build

pm2 restart all
pm2 status
