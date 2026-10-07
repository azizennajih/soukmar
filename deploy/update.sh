#!/usr/bin/env bash
# Neue Version auf dem Server einspielen (als root ausfuehren): bash /opt/soukmar/soukmar/deploy/update.sh
set -euo pipefail
APP_DIR=/opt/soukmar
git config --global --add safe.directory '*'

# Vor jedem Update eine frische Datenbank-Sicherung (falls ein Update die Daten veraendert)
/usr/local/bin/soukmar-backup || { echo "ABBRUCH: Sicherung fehlgeschlagen - Update nicht durchgefuehrt."; exit 1; }

cd "$APP_DIR/soukmar-backend"
git pull --ff-only
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

cd "$APP_DIR/soukmar"
git pull --ff-only
install -m 700 "$APP_DIR/soukmar/deploy/backup.sh" /usr/local/bin/soukmar-backup
npm ci
npm run build

# git/npm laufen als root, die Anwendung als 'soukmar'
chown -R soukmar:soukmar "$APP_DIR"
sudo -u soukmar -H pm2 restart all
sudo -u soukmar -H pm2 status
