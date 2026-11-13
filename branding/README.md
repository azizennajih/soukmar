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

| `werbung/*-160x600.png` | 320×1200 (2x) | Werbe-Banner links/rechts (Admin-Tab "Banner", Platzierung "Links und rechts") |
| `werbung/*-1200x250.png` | 2400×500 (2x) | Werbe-Banner zwischen den Anzeigen (Platzierung "Zwischen den Anzeigen") |

Die Werbe-Banner (Expedia Hotels DE/FR, Check24 Reisen DE, Trip.com DE/FR) haben absichtlich keine Partner-Logos; Texte und Farben stehen in `BANNER_SPECS` in `generate.html` (neu erzeugen mit `http://localhost:4599/?only=werbung`). Als Ziel-Link im Admin-Tab die eigenen Partner-Links verwenden.

Hinweis TikTok: Es gibt kein Titelbild, nur das Profilbild (mind. 200×200) und Videocover.

## Neu erzeugen

```bash
node branding/server.mjs      # startet http://localhost:4599
```

Dann `http://localhost:4599` im Browser öffnen: die Seite zeichnet alle Bilder (`generate.html`) und der Server speichert sie in `branding/social/`. Texte, Größen und Farben stehen in `generate.html` (Liste `ASSETS`).

## Reel (9:16, 15,5 s, MP4)

`branding/reel/reel-de.mp4`, `reel-fr.mp4`, `reel-ar.mp4`, `reel-en.mp4` (1080×1920, ohne Ton). Ablauf: Logo, "Kaufen & verkaufen – ganz einfach in deiner Nähe", sechs Kategorien, Chat-Anfrage, Aufruf mit `souqmar24.com`. Texte stehen in `branding/reel.html` (Objekt `TEXTS`). Neu aufnehmen: `node branding/server.mjs`, dann `http://localhost:4599/reel` öffnen (nur eine Sprache: `?lang=de`; Standbild prüfen: `?lang=de&still=9.5`).
Musik fügst du in Instagram, Facebook oder TikTok beim Hochladen hinzu (dort gibt es lizenzierte Titel).

## Werbevideo (16:9) und Werbe-Reel (9:16) mit echten Screenshots

`branding/video/video-16x9-<de|fr|ar|en>.mp4` (1920×1080, für Facebook-Feed, YouTube) und `branding/video/reel-9x16-<de|fr|ar|en>.mp4` (1080×1920, für Reels, Stories, TikTok, Shorts). Je 20,5 s, 30 fps, H.264, mit eigener Musik (AAC, Stereo).
Ablauf: Aufhänger ("Etwas zu verkaufen?"), Logo, die echte Seite im Handy bzw. Browser (scrollt), vier Vorteile, Aufruf mit `souqmar24.com`.
Die Vorteile entsprechen den Aussagen der Website (Anzeige in unter 2 Minuten, Prüfung durch das Team, Chat, 11 Sprachen); keine Aussage zu Preisen.

- Musik: wird im Browser erzeugt (`buildAudio` in `video.html`, 120 BPM, Am7 – Fmaj7 – C – G), also lizenzfrei und ohne fremde Rechte. Ohne Ton rendern: `http://localhost:4599/video?music=0` (Dateien enden dann auf `-ohne-ton`), z. B. wenn in Instagram/TikTok ein Titel aus deren Bibliothek darübergelegt werden soll.
- Texte und Szenen: `branding/video.html` (`TEXTS`, `SCENES`).
- Screenshots: `branding/video/shots/` (Startseite, Handy und Desktop, je Sprache; ohne Cookie-Hinweis und ohne Partner-Banner). Neu aufnehmen: `npm i puppeteer-core` in einem beliebigen Ordner, dann `node shots.mjs` (Kopie in `branding/video/shots.mjs`, nutzt das installierte Chrome).
- Neu rendern: `node branding/server.mjs`, dann `http://localhost:4599/video` in Chrome öffnen und warten, bis der Tab-Titel `FERTIG` zeigt (nur eines: `?format=reel&lang=de`; Standbild: `?format=wide&lang=de&still=8`). Gerendert wird Bild für Bild über WebCodecs (`vendor/mp4-muxer.js`, MIT), daher ruckelfrei.
- fr/ar scrollen nur bis zu den Kategorien, solange die Anzeigen auf der Seite deutsch sind (`scrollM`/`scrollD` in `TEXTS`).
