#!/usr/bin/env bash
# SouqMar24 - SSH absichern: Anmeldung nur noch per SSH-Schluessel, kein Passwort mehr.
# Als root auf dem Server ausfuehren, NACHDEM dein Schluessel hinterlegt ist und du dich damit
# erfolgreich angemeldet hast (siehe Hinweis unten). Das Skript bricht ab, wenn kein Schluessel da ist,
# damit du dich nicht aussperrst.
#
# 1) Auf deinem Windows-Rechner (PowerShell), einmalig:
#      ssh-keygen -t ed25519
#      type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@SERVER-IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
# 2) Neues PowerShell-Fenster: ssh root@SERVER-IP  -> muss OHNE Passwort funktionieren
# 3) Dann hier: bash harden-ssh.sh   (das alte Fenster erst schliessen, wenn ein NEUES Fenster noch klappt)
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Bitte als root ausfuehren."; exit 1; }
if [ ! -s /root/.ssh/authorized_keys ]; then
  echo "ABBRUCH: /root/.ssh/authorized_keys ist leer. Erst deinen SSH-Schluessel hinterlegen (Schritt 1)."; exit 1
fi

cat > /etc/ssh/sshd_config.d/99-soukmar-hardening.conf <<'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
MaxAuthTries 4
LoginGraceTime 30
X11Forwarding no
CONF

sshd -t
systemctl reload ssh || systemctl reload sshd
echo "SSH gehaertet: nur noch Schluessel-Anmeldung. Teste jetzt in einem NEUEN Fenster: ssh root@SERVER-IP"
