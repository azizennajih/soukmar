# SouqMar24 – Branding für Social Media

Fertige Bilder liegen in `branding/social/`. Gestaltung: Logo-S aus `public/favicon.svg`, Schrift Plus Jakarta Sans (800), Farben aus der Palette (`#D93D4A`, `#111827`, `#FEF6E4`, `#FEF1F2`, `#1E3A5F`).

| Datei | Größe | Wofür |
|---|---|---|
| `profilbild/profilbild-facebook-instagram-tiktok-1080.png` | 1080×1080 | Profilbild Facebook, Instagram, TikTok (S in der Mitte, passt in den Kreisausschnitt) |
| `profilbild/profilbild-rund-vorschau-720.png` | 720×720 | Vorschau, wie es rund aussieht |
| `facebook/facebook-titelbild-1640x624.png` | 1640×624 | Facebook-Titelbild (Logo in der Mitte, damit der Handy-Zuschnitt nichts abschneidet) |
| `facebook/facebook-link-vorschau-1200x630.png` | 1200×630 | Link-Vorschau / Open Graph, Facebook-Beitragsbild |
| `instagram/beitrag-quadrat-1080x1080.png` | 1080×1080 | Instagram- und Facebook-Beitrag |
| `instagram/story-1080x1920.png` | 1080×1920 | Instagram-Story, Reels-Cover, Facebook-Story |
| `tiktok/tiktok-videocover-1080x1920.png` | 1080×1920 | TikTok-Videocover, heller Hintergrund |
| `logo/logo-icon-1024.png`, `logo-icon-512.png` | 1024 / 512 | Nur das S (abgerundete Kachel, transparente Ecken) |
| `logo/logo-horizontal-transparent.png` | 1800×480 | Logo mit Titel, transparent |
| `logo/logo-horizontal-white-bg.png` | 1800×480 | Logo mit Titel auf Weiß |
| `logo/logo-horizontal-fuer-dunklen-hintergrund.png` | 1800×480 | Logo mit Titel (weiße Schrift) auf Dunkelblau |
| `logo/logo-header-600x160.png` | 600×160 | Kopfzeile, Signatur, Banner |

Hinweis TikTok: Es gibt kein Titelbild, nur das Profilbild (mind. 200×200) und Videocover.

## Neu erzeugen

```bash
node branding/server.mjs      # startet http://localhost:4599
```

Dann `http://localhost:4599` im Browser öffnen: die Seite zeichnet alle Bilder (`generate.html`) und der Server speichert sie in `branding/social/`. Texte, Größen und Farben stehen in `generate.html` (Liste `ASSETS`).
