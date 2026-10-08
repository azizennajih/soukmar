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

# Orte (alle Staedte und Doerfer der Welt, GeoNames): einmalig im Hintergrund importieren, falls die Tabelle leer ist.
# Die Seite laeuft waehrenddessen normal; Fortschritt: tail -f /var/log/soukmar-places-import.log
PLACES=$(sudo -u postgres psql -d soukmar -tAc 'SELECT count(*) FROM "Place"' 2>/dev/null || echo 0)
if [ "${PLACES:-0}" -lt 1000000 ] && ! pgrep -f import-places >/dev/null; then
  command -v unzip >/dev/null || apt-get install -y unzip
  cd "$APP_DIR/soukmar-backend"
  nohup npx tsx prisma/import-places.ts > /var/log/soukmar-places-import.log 2>&1 &
  echo "Orte-Import gestartet (dauert etwa 20-40 Minuten): tail -f /var/log/soukmar-places-import.log"
fi
