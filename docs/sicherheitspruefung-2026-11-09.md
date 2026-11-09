# Test- und Sicherheitsprüfung vom 09.11.2026

Umfang: Händler-Import, Werbe-Banner, Anmeldung/Rechte, Uploads, Chat, Live-Seite von außen (nur lesend), Abhängigkeiten, Geheimnisse in den Repos. Keine Prüfung durch Dritte; kein Penetrationstest einer externen Stelle.

## Automatische Tests
| Bereich | Ergebnis |
|---|---|
| Backend Typprüfung (`tsc`) | sauber |
| Backend Unit-Tests | 158 bestanden |
| Backend Integrationstests (echte Test-Datenbank, inkl. Migrationen) | 59 bestanden |
| Web Build (`ng build`) | erfolgreich, 3 alte Warnungen (Bundle-Größe admin.scss, leaflet nicht ESM, ungenutzter Import) |
| Web Tests | 76 bestanden |

## Aktive Angriffstests (lokal, Seed-Konten, 35 Fälle, alle bestanden)
Admin-Funktionen als normaler Nutzer (403), Händler-Import als Privatkonto (403), SSRF über Foto-Links (127.0.0.1, `[::1]`, localhost, 169.254.169.254, 10.x, fremder Port, Zugangsdaten in URL, `http`, `file`), Banner mit `javascript:`-Link/fremdem Bild-Host/`http`, Banner-Upload als Nicht-Admin, fremde Anzeige ändern/löschen, Rechteausweitung auf der eigenen Anzeige (isPremium, isFeatured, userId, Boost), fremde Chat-Unterhaltung, manipuliertes Token, JWT `alg=none`, Token mit selbst eingetragener Admin-Rolle, NoSQL-/SQL-Zeichen im Login und in der Suche, Drosselung von Banner-Klicks und Login-Versuchen.
Nicht ausgelöst: Selbstfreigabe einer ausstehenden Anzeige (lokal keine PENDING-Anzeige); der Code (`canSetListingStatus`) wurde gelesen.

## Live-Seite (souqmar24.com, nur Lesezugriffe)
Geschützte Endpunkte ohne Anmeldung: 401. CORS gibt nur die eigene Herkunft frei. `.env`, `.git`, `package.json`, `schema.prisma` nicht abrufbar. HTTP wird auf HTTPS umgeleitet. Kein `X-Powered-By`.

## Befunde
| Nr. | Schwere | Befund | Stand |
|---|---|---|---|
| 1 | niedrig | Unbekannte API-Adressen zeigten die Express-Standardseite ("Cannot GET /api/…") und verrieten das Framework | behoben (JSON-404), wirkt nach Server-Update |
| 2 | mittel | `script-src` der Seite erlaubt `'unsafe-inline'` (Angular-SSR). Abschwächung des XSS-Schutzes; derzeit kein `innerHTML` mit Nutzerdaten im Web | offen, Empfehlung: Nonces einführen |
| 3 | mittel | Mindestlänge Passwort war 6 Zeichen (Liste häufiger Passwörter ist aktiv) | behoben: jetzt 8 in Backend und Web (Registrierung, Zurücksetzen, Ändern). Bestehende Passwörter bleiben gültig. Android/iOS: Hinweistexte und Eingabeprüfung beim nächsten Sync auf 8 anheben |
| 4 | mittel | Kein Zwei-Faktor-Login für Admin-Konten. Ein übernommenes Admin-Konto könnte Banner setzen und Werbe-Mails versenden | offen, Empfehlung: 2FA oder sehr starkes Passwort |
| 5 | niedrig | Login-Token liegt im `localStorage` (bei XSS auslesbar). Gemildert durch 3 h Leerlauf-Ablauf, Widerruf bei Passwortänderung und fehlendes `innerHTML` | akzeptiertes Risiko |
| 6 | niedrig | HSTS ohne `includeSubDomains`/`preload` | offen, Empfehlung nur nach Prüfung aller Subdomains |
| 7 | niedrig | Abhängigkeit `ip-address` (hoch) über `geoip-country`, 7 weitere mittlere in Google-/Firebase-Bibliotheken. Nicht ausnutzbar: betrifft HTML-Ausgabe von IPv6-Adressen, die der Server nicht erzeugt. Fix wäre ein Downgrade | offen bis neue Version |
| 8 | mittel | Repo `Farben-Marokko`: GitHub-Token im Klartext in der Git-Remote-URL (nur lokal in `.git/config`, nicht im Repo) | offen, Empfehlung: Token widerrufen, neu erstellen, Git Credential Manager nutzen |

## Als gut bewertet
Token mit fest gesetztem Algorithmus, Geheimnis mindestens 32 Zeichen (Start bricht sonst ab), Rolle und Gültigkeit aus der Datenbank, Widerruf aller Sitzungen bei Passwortänderung; Passwort-Reset-Token gehasht und befristet; Rate-Limits (Login, Registrierung, Upload, Anzeigen, Import, Banner-Klicks); Upload mit Magic-Byte-Prüfung; Chat nur für Teilnehmer, mit Sicherheitsprotokoll; öffentliche Profile nur mit freigegebenen Feldern; Besitzer können Status/Premium/Hervorhebung nicht selbst setzen; Bilder nur aus dem eigenen Cloudinary-Konto; Open-Graph-Seite HTML-escaped; keine Schlüssel in Code oder Git-Historie.
