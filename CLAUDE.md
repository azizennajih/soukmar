# SoukMar (Web) — Claude Working Guide

Marokkanisches Kleinanzeigen-Portal. **Stack:** Angular 22 (zoneless, OnPush, standalone) · Node/Express (`../soukmar-backend`) · PostgreSQL · Prisma · Cloudinary
**Pfad:** `C:\AIProjekte\soukmar` · **GitHub:** github.com/azizennajih/soukmar · **Dev:** `npm start` (Port 4200) · Build: `npx ng build`
Backend, Android und iOS haben eigene `CLAUDE.md` (Backend: Tests, Moderation, API-Meldungen, Deployment).

## Design — immer einhalten
- Farben, Radius, Schatten stehen als CSS-Variablen in `src/styles.scss` (`--primary` #D93D4A, `--secondary`, `--gold`, `--text`, `--text-muted`, `--border`, `--bg`, `--white`, `--radius`). **Nur diese nutzen, keine neuen oder hardcodierten Farben.**
- Preise nie rot/fett-900: `color: var(--text)`, `font-weight: 700`.
- Fonts: Inter (Body), Plus Jakarta Sans (h1–h5). Abstände in `rem` (px nur für 1px-Borders). Inputs/Buttons `.75rem` Radius, Pills `999px`. Container `.container` (max 1280px).
- Globale Klassen (nicht neu schreiben): `.btn-primary .btn-outline .btn-ghost .card .badge-* .container .section .grid-2/3/4 .form-group .input-icon-wrap .empty-state .fade-in .auth-page .auth-card .auth-form`; Kategorie-Badges `.cat-<farbe>` (siehe `styles.scss`).
- Breakpoints: 480 / 640 / 768 / 1024 px (max-width).
- SCSS in BEM (`.navbar__logo`). Keine inline-Styles im Template.

## i18n
- **11 Sprachen:** ar, de, en, es, fa, fr, it, ps, pt, tr, ur — `src/assets/i18n/<lang>.json`, **lazy** geladen (`I18nService.load()`); nie statisch importieren.
- Texte: `| T` (TranslatePipe in `imports` eintragen) oder `this.i18n.t('key')`. Keine hardcodierten Strings. Neue Schlüssel in **alle 11** Dateien.
- RTL (`ar`, `fa`, `ur`, `ps`) setzt `I18nService` automatisch.
- Kategorien: `('cats.' + cat.value) | T`. Unterkategorien/Attribute: `subcats.<code>`, `attrs.<code>`, `attrs.opts.<option>` (Labels nie aus der DB).
- Zeit/Preis: `timeAgo()`, `formatPrice()` aus `listing.model.ts`. Anzeigenfotos immer `| imageUrl:<Breite>`.

## Angular
`OnPush` + `cdr.markForCheck()` nach async Daten · Signals/`computed` bevorzugen · Standalone, kein NgModule, kein zone.js.
Keine `alert()/confirm()/prompt()`: `ToastService` (`toast.error/success/info`) und `DialogService` (`await dialog.confirm({message, danger})`).

## Fachliches
- **Attribut-System (EAV):** Kategorie → `Subcategory` → `AttributeDefinition`; Werte in `ListingAttributeValue`. Katalog über `/api/catalog/*` und `CatalogService`; Suchfilter `attr_<CODE>`, `attr_<CODE>_min/_max`.
- **Moderation:** Neue Anzeigen sind `PENDING`, öffentlich erst nach Freigabe. Status nur über `/api/admin/moderation/*` ändern. Admin-UI `src/app/pages/admin/moderation/`, Doku `docs/anzeigenmoderation.md`.
- **Login:** E-Mail/Passwort + optional Google/Facebook (`components/social-login`, Backend `POST /api/auth/social`). Buttons erscheinen nur, wenn `GOOGLE_CLIENT_ID` bzw. `FACEBOOK_APP_ID`+`FACEBOOK_APP_SECRET` im Backend-`.env` gesetzt sind. Instagram: kein eigener Login mehr (läuft über Facebook); TikTok liefert keine E-Mail. Neue externe Skripte/Frames brauchen einen Eintrag in der CSP in `src/server.ts`.

## Stolperfallen
- **Neue Seite:** Route in `app.routes.ts` (+ `PRIVATE_PATHS`, falls Login-Seite) **und** in `app.routes.server.ts` (`CLIENT_ONLY_PATHS` bei privaten Seiten) eintragen und im Backend `src/lib/sitemap.ts` (`DISALLOWED_PATHS`). Der Dev-Server liest `app.routes.server.ts` nur beim Start: sonst 404 → `ng serve` neu starten.
- **i18n-JSON** haben CRLF und mehr als 4000 Zeilen: nie mit `JSON.stringify` neu schreiben (riesiger Diff), neue Blöcke per Skript vor der letzten `}` anhängen und mit `JSON.parse` prüfen.
- **Dateiauswahl testen:** im Browser-Test `.import input[type=file]` o. Ä. gezielt wählen; das erste `input[type=file]` der Seite ist die Foto-Suche der Navbar.
- **Werbe-/Affiliate-Banner:** im Admin-Tab "Banner" (`components/admin-banners`) verwaltet; angezeigt über `SponsorService` (`banners(placement)` je Land), `app-sponsor-rails` (links/rechts, nur ab 1700 px) und `app-sponsor-banner` (INLINE nach jeder 8. Anzeige und auf der Startseite). Immer mit Label `sponsor.label` und `rel="sponsored"`; nur Cloudinary-Bilder (CSP). Backend siehe `soukmar-backend/CLAUDE.md`.
- **Händler-Import:** Seite `pages/import-annonces/` (CSV-Parser `csv.ts`), Backend siehe `soukmar-backend/CLAUDE.md`.

## Wichtige Pfade
`src/styles.scss` · `src/app/services/{i18n,auth}.service.ts` · `src/app/models/listing.model.ts` · `src/app/app.routes.ts` · `src/app/components/{navbar,listing-card,social-login}/` · Katalog-Seed `../soukmar-backend/prisma/catalog-data.ts`

## Arbeitsweise (Tokens sparen)
- Große Dateien nie komplett lesen (i18n-JSON >1500 Zeilen, `package-lock.json`, `docs/phasen-verlauf.md`, Build-Logs): Grep oder `Read` mit `offset`/`limit`.
- Erst gezielt suchen (Grep/Glob), dann nur die betroffene Stelle lesen. Lange Ausgaben filtern (`| tail`, `Select-Object -Last 20`).
- Pro Aufgabe eine neue Sitzung (`/clear`); dauerhaftes Wissen gehört hierher oder ins Memory.
- Skripte mit Regex/Backslashes als Datei anlegen statt per `node -e`/Heredoc.
- Nutzer-Kommunikation Deutsch und kurz; ehrlich berichten, was getestet wurde.
- Nach jeder Änderung: commit + push zu `github.com/azizennajih/soukmar`. Server-Update macht der Nutzer (`deploy/update.sh`), nie selbst.
