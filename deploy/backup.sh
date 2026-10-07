#!/usr/bin/env bash
# SouqMar24 - taegliche Sicherung der Datenbank (und der .env) auf diesem Server.
# Wird nachts per Cron ausgefuehrt (siehe setup-server.sh), kann aber jederzeit von Hand laufen:
#   sudo /usr/local/bin/soukmar-backup
#
# Behaelt 14 Tagessicherungen und 8 Wochensicherungen (sonntags). Fotos liegen bei Cloudinary und
# sind hier nicht enthalten. WICHTIG: Diese Sicherungen liegen auf demselben Server - sie schuetzen
# vor Fehlbedienung und kaputten Daten, nicht vor einem Totalausfall. Zusaetzlich das Backup im
# IONOS-Kundenbereich (Acronis) buchen oder den Ordner regelmaessig auf den eigenen Rechner kopieren:
#   scp -r root@SERVER:/var/backups/soukmar ./soukmar-backups
#
# Wiederherstellen (Anwendung vorher stoppen: sudo -u soukmar -H pm2 stop soukmar-api):
#   sudo -u postgres pg_restore --clean --if-exists -d soukmar /var/backups/soukmar/daily/db-DATUM.dump
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/soukmar}"
ENV_FILE="${ENV_FILE:-/opt/soukmar/soukmar-backend/.env}"
KEEP_DAILY="${KEEP_DAILY:-14}"
KEEP_WEEKLY="${KEEP_WEEKLY:-8}"
# Ueberschreibbar fuer Tests; Standard: Dump im komprimierten Custom-Format
DUMP_CMD="${DUMP_CMD:-sudo -u postgres pg_dump -Fc soukmar}"

umask 077
mkdir -p "$BACKUP_DIR/daily" "$BACKUP_DIR/weekly"
chmod 700 "$BACKUP_DIR"

stamp="$(date +%Y-%m-%d_%H%M)"
tmp="$BACKUP_DIR/daily/.db-$stamp.tmp"
out="$BACKUP_DIR/daily/db-$stamp.dump"

# Erst in eine temporaere Datei schreiben: ein abgebrochener Dump ersetzt nie eine gute Sicherung.
if ! $DUMP_CMD > "$tmp"; then
  rm -f "$tmp"; echo "$(date -Is) FEHLER: Datenbank-Dump fehlgeschlagen" >&2; exit 1
fi
if [ ! -s "$tmp" ]; then
  rm -f "$tmp"; echo "$(date -Is) FEHLER: Dump ist leer" >&2; exit 1
fi
# Echter Dump? (nur wenn pg_restore da ist und das Standardformat benutzt wird)
if [ "$DUMP_CMD" = "sudo -u postgres pg_dump -Fc soukmar" ] && command -v pg_restore >/dev/null; then
  if ! pg_restore --list "$tmp" >/dev/null 2>&1; then
    rm -f "$tmp"; echo "$(date -Is) FEHLER: Dump ist beschaedigt" >&2; exit 1
  fi
fi
mv "$tmp" "$out"

# Konfiguration (Zugangsdaten!) mitsichern - nur fuer root lesbar
if [ -f "$ENV_FILE" ]; then cp "$ENV_FILE" "$BACKUP_DIR/daily/env-$stamp.bak"; fi

# Sonntags zusaetzlich eine Wochensicherung
if [ "$(date +%u)" = "7" ]; then
  cp "$out" "$BACKUP_DIR/weekly/db-$stamp.dump"
fi

# Aufraeumen: nur die neuesten N behalten
prune() { # Ordner Muster Anzahl
  { ls -1t "$1"/$2 2>/dev/null || true; } | tail -n +"$(( $3 + 1 ))" | xargs -r rm -f --
}
prune "$BACKUP_DIR/daily" 'db-*.dump' "$KEEP_DAILY"
prune "$BACKUP_DIR/daily" 'env-*.bak' "$KEEP_DAILY"
prune "$BACKUP_DIR/weekly" 'db-*.dump' "$KEEP_WEEKLY"

echo "$(date -Is) OK: $(basename "$out") ($(du -h "$out" | cut -f1))"
