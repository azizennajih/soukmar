#!/usr/bin/env bash
# SouqMar24 - Ersteinrichtung eines frischen Ubuntu-24.04-Servers.
# Als root ausfuehren. Voraussetzung: /root/backend.env (lokale .env des Backends) wurde hochgeladen.
set -euo pipefail

DOMAIN="${DOMAIN:-souqmar24.com}"
APP_DIR=/opt/soukmar
FRONT_REPO="https://github.com/azizennajih/soukmar.git"
BACK_REPO="git@github.com:azizennajih/soukmar-backend.git"
ENV_UPLOAD=/root/backend.env
DEPLOY_KEY=/root/.ssh/soukmar_deploy

[ "$(id -u)" -eq 0 ] || { echo "Bitte als root ausfuehren."; exit 1; }
[ -f "$ENV_UPLOAD" ] || { echo "FEHLT: $ENV_UPLOAD - lade zuerst deine lokale Backend-.env hoch (siehe Anleitung)."; exit 1; }

echo "==> 1/9 Pakete installieren"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y postgresql git curl openssl ufw fail2ban unattended-upgrades gnupg debian-keyring debian-archive-keyring apt-transport-https

if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2

if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

echo "==> 2/9 Firewall und Swap"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
# SSH-Brute-Force sperren (fail2ban) und Sicherheitsupdates automatisch einspielen
systemctl enable --now fail2ban >/dev/null 2>&1 || true
printf 'APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
' > /etc/apt/apt.conf.d/20auto-upgrades
if [ -z "$(swapon --show)" ]; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> 3/9 Datenbank"
DB_PASS_FILE=/root/.soukmar_db_pass
if [ ! -f "$DB_PASS_FILE" ]; then openssl rand -hex 24 > "$DB_PASS_FILE"; chmod 600 "$DB_PASS_FILE"; fi
DB_PASS="$(cat "$DB_PASS_FILE")"
[ "$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='soukmar'")" = "1" ] \
  || sudo -u postgres psql -c "CREATE USER soukmar WITH PASSWORD '$DB_PASS';"
[ "$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='soukmar'")" = "1" ] \
  || sudo -u postgres psql -c "CREATE DATABASE soukmar OWNER soukmar;"

echo "==> 4/9 Zugriff auf das private Backend-Repository (Deploy-Key)"
mkdir -p /root/.ssh && chmod 700 /root/.ssh
if [ ! -f "$DEPLOY_KEY" ]; then ssh-keygen -t ed25519 -N '' -C "soukmar-server" -f "$DEPLOY_KEY" >/dev/null; fi
ssh-keyscan -t ed25519 github.com >> /root/.ssh/known_hosts 2>/dev/null || true
grep -q 'IdentityFile /root/.ssh/soukmar_deploy' /root/.ssh/config 2>/dev/null || cat >> /root/.ssh/config <<EOF
Host github.com
  IdentityFile /root/.ssh/soukmar_deploy
  IdentitiesOnly yes
EOF
chmod 600 /root/.ssh/config
SSH_OUT="$(ssh -o BatchMode=yes -T git@github.com 2>&1 || true)"
if ! echo "$SSH_OUT" | grep -qi "successfully authenticated"; then
  echo
  echo "---------------------------------------------------------------"
  echo "Diesen Schluessel auf GitHub eintragen (nur Lesezugriff):"
  echo "Repository soukmar-backend -> Settings -> Deploy keys -> Add deploy key"
  echo "Titel: server, Schluessel einfuegen, 'Allow write access' NICHT anhaken."
  echo "---------------------------------------------------------------"
  cat "${DEPLOY_KEY}.pub"
  echo "---------------------------------------------------------------"
  read -r -p "Wenn eingetragen: Enter druecken ... " _
fi

echo "==> 5/9 Code herunterladen"
mkdir -p "$APP_DIR" && cd "$APP_DIR"
# Spaeter gehoert das Verzeichnis dem Benutzer 'soukmar', git laeuft aber als root (Deploy-Key)
git config --global --add safe.directory '*'
[ -d soukmar-backend/.git ] || git clone "$BACK_REPO" soukmar-backend
[ -d soukmar/.git ] || git clone "$FRONT_REPO" soukmar

echo "==> 6/9 Backend konfigurieren und bauen"
ENV_FILE="$APP_DIR/soukmar-backend/.env"
cp "$ENV_UPLOAD" "$ENV_FILE"
sed -i 's/\r$//' "$ENV_FILE"
chmod 600 "$ENV_FILE"
set_env() { if grep -q "^$1=" "$ENV_FILE"; then sed -i "s|^$1=.*|$1=$2|" "$ENV_FILE"; else echo "$1=$2" >> "$ENV_FILE"; fi; }
set_env DATABASE_URL "postgresql://soukmar:${DB_PASS}@localhost:5432/soukmar"
set_env JWT_SECRET "$(openssl rand -hex 48)"
set_env PORT 3000
set_env APP_URL "https://${DOMAIN}"
set_env API_URL "https://${DOMAIN}/api"
set_env ALLOWED_ORIGINS "https://${DOMAIN},https://www.${DOMAIN}"
set_env VAPID_SUBJECT "mailto:contact@${DOMAIN}"
grep -q '^OPERATOR_NAME=.+' "$ENV_FILE" || echo "HINWEIS: OPERATOR_NAME und OPERATOR_ADDRESS fehlen in der .env - sie erscheinen im Fuss jeder E-Mail (Betreiber-Angaben, rechtlich noetig). Eintragen und 'sudo -u soukmar -H pm2 restart soukmar-api'."
grep -q '^SMTP_FROM=.*onboarding@resend.dev' "$ENV_FILE" && echo "HINWEIS: SMTP_FROM ist noch die Resend-Testadresse - nach der Domain-Verifizierung in Resend auf no-reply@${DOMAIN} aendern."

cd "$APP_DIR/soukmar-backend"
npm ci
npx prisma generate
npx prisma migrate deploy
npx --yes tsx prisma/seed-catalog.ts
npm run build

echo "==> 7/9 Webseite bauen"
cd "$APP_DIR/soukmar"
npm ci
npm run build

echo "==> 8/9 Prozesse starten"
cat > "$APP_DIR/ecosystem.config.cjs" <<EOF
module.exports = { apps: [
  { name: 'soukmar-api', cwd: '$APP_DIR/soukmar-backend', script: 'dist/index.js',
    env: { NODE_ENV: 'production' } },
  { name: 'soukmar-web', cwd: '$APP_DIR/soukmar', script: 'dist/soukmar/server/server.mjs',
    env: { NODE_ENV: 'production', PORT: 4000, BACKEND_URL: 'http://127.0.0.1:3000' } }
] };
EOF
# Die Anwendung laeuft NICHT als root: ein eigener Benutzer ohne Login und ohne sudo
# begrenzt den Schaden, falls je eine Luecke in der App ausgenutzt wird.
id soukmar >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin soukmar
chown -R soukmar:soukmar "$APP_DIR"
chmod 600 "$ENV_FILE"
sudo -u soukmar -H pm2 delete all >/dev/null 2>&1 || true
sudo -u soukmar -H pm2 start "$APP_DIR/ecosystem.config.cjs"
sudo -u soukmar -H pm2 save
env PATH="$PATH:/usr/bin" pm2 startup systemd -u soukmar --hp /home/soukmar >/dev/null 2>&1 || true

echo "==> 9/9 HTTPS und Weiterleitung (Caddy)"
cat > /etc/caddy/Caddyfile <<EOF
${DOMAIN} {
  encode gzip zstd
  header {
    X-Content-Type-Options nosniff
    X-Frame-Options SAMEORIGIN
    Referrer-Policy strict-origin-when-cross-origin
    Strict-Transport-Security "max-age=31536000"
    -Server
  }
  @backend path /api/* /socket.io/*
  reverse_proxy @backend 127.0.0.1:3000
  reverse_proxy 127.0.0.1:4000
}

www.${DOMAIN} {
  redir https://${DOMAIN}{uri} permanent
}
EOF
systemctl reload caddy || systemctl restart caddy

echo
echo "FERTIG. Oeffne https://${DOMAIN}"
echo "(Das HTTPS-Zertifikat holt Caddy automatisch, sobald die DNS-Eintraege auf diesen Server zeigen.)"
sudo -u soukmar -H pm2 status
