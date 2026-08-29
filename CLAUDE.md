# SoukMar — Claude Working Guide

## Project
Marokkanisches Kleinanzeigen-Portal (wie Avito/Leboncoin).  
**Stack:** Angular 22 (zoneless, OnPush) · Node/Express · PostgreSQL · Prisma · Cloudinary  
**Pfad:** `C:\AIProjekte\soukmar`  
**GitHub:** github.com/azizennajih/soukmar  
**Dev-Server:** `npm start` im Projektverzeichnis (Port 4200)

---

## Design System — IMMER einhalten

### Farben (CSS-Variablen aus `src/styles.scss`)
| Variable          | Wert        | Verwendung                                |
|-------------------|-------------|-------------------------------------------|
| `--primary`       | `#D93D4A`   | Buttons, CTAs, Logo, Hover — sparsam      |
| `--primary-dark`  | `#B8313C`   | Hover-Zustand für Primary                 |
| `--primary-light` | `#FEF1F2`   | Hintergrund für Primär-Highlights         |
| `--gold`          | `#C9941A`   | Premium-Badges, Featured-Akzent           |
| `--gold-light`    | `#FEF6E4`   | Hintergrund für Gold-Highlights           |
| `--secondary`     | `#1E3A5F`   | Navbar-Topbar, sekundäre Elemente         |
| `--text`          | `#111827`   | Haupttext                                 |
| `--text-muted`    | `#6B7280`   | Sekundärtext, Placeholder                 |
| `--border`        | `#E5E9EE`   | Rahmen, Trennlinien                       |
| `--bg`            | `#F8F7F5`   | Seitenhintergrund (leicht warm)           |
| `--white`         | `#FFFFFF`   | Karten, Overlays                          |
| `--radius`        | `.875rem`   | Standard-Borderradius                     |

**WICHTIG:** Preise NIEMALS rot oder fett-900 — immer `color: var(--text)`, `font-weight: 700`.  
**Hardcoded Farben vermeiden** — immer CSS-Variablen nutzen.  
**Niemals neue Farben erfinden** — nur die obige Palette verwenden.

### Typografie
- **Body-Font:** Inter (400–700)
- **Heading-Font:** Plus Jakarta Sans (600–900) — für h1–h5
- Preise: `font-weight: 700`, `color: var(--text)` — nicht rot, nicht fett-900

<!-- Typografie ist im obigen Block enthalten -->

### Abstände & Größen
- Spacing-Einheit: `rem` (kein px außer für 1px-Borders)
- Border-Radius: `--radius` (1rem) Standard · `.75rem` für Inputs/Buttons · `.5rem` für kleine Elemente · `999px` für Pills
- Standard-Padding Buttons: `.7rem 1.5rem`
- Container: `max-width: 1280px`, `.container`-Klasse verwenden

### Schatten
```css
--shadow:    0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);   /* Karten */
--shadow-md: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05);
```

### Globale Utility-Klassen (aus `styles.scss` — nicht neu schreiben)
```
.btn-primary    .btn-outline    .btn-ghost
.card           .badge          .badge-premium .badge-active .badge-pending .badge-sold .badge-rejected
.container      .section
.grid-2         .grid-3         .grid-4
.form-group     .input-icon-wrap
.empty-state
.fade-in
.auth-page      .auth-card      .auth-logo      .auth-form  (für Auth-Seiten)
```

### Kategorie-Badge-Farben
```
.cat-blue    → Elektronik     .cat-green   → Immobilien
.cat-purple  → Jobs           .cat-yellow  → Premium/Sonstiges
.cat-emerald → Dienstleistungen .cat-pink  → Mode
.cat-orange  → Fahrzeuge      .cat-gray    → Andere
```

---

## i18n — IMMER berücksichtigen

- **3 Sprachen:** Französisch (`fr`), Englisch (`en`), Arabisch (`ar`)
- **Service:** `I18nService` (Signal-basiert) — injizieren mit `inject(I18nService)`
- **Pipe:** `| T` (TranslatePipe, `pure: false`) — für alle UI-Texte im Template
- **Übersetzungsdateien:** `src/assets/i18n/fr.json`, `en.json`, `ar.json`
- **Keine hardcodierten Strings** in Templates oder Components — immer `| T` oder `this.i18n.t('key')`
- **RTL:** Bei `ar` wird `document.documentElement.dir = 'rtl'` automatisch gesetzt
- **Reaktiv:** `this.i18n.lang()` (Signal) lesen — Angular triggert Re-Render
- Neue Übersetzungsschlüssel **immer in alle 3 JSON-Dateien** eintragen
- Kategorien: `('cats.' + cat.value) | T` — nie `cat.label` direkt nutzen
- Zeit/Preis: `timeAgo(date, lang)` und `formatPrice(price, currency, lang)` aus `listing.model.ts`

---

## Angular-Konventionen

- **ChangeDetection:** `OnPush` — immer `cdr.markForCheck()` nach async Daten
- **Signals:** `signal()`, `computed()`, `effect()` bevorzugen
- **Standalone Components** — kein NgModule
- **Imports im Component** deklarieren (nicht in app.module)
- Kein `zone.js` — das Projekt läuft zoneless

---

## Code-Konventionen

- SCSS: BEM-Naming (`.navbar__logo`, `.navbar__logo-icon`)
- Keine inline-Styles im Template
- Keine neuen Farben außer der Palette
- `TranslatePipe` immer in `imports: []` des Components eintragen wenn `| T` genutzt wird
- PowerShell für alle CLI-Befehle (kein Bash auf Windows)
- Nach jeder Änderung: commit + push zu `github.com/azizennajih/soukmar`

---

## Wichtige Dateipfade

| Was | Pfad |
|-----|------|
| Global Styles | `src/styles.scss` |
| i18n Französisch | `src/assets/i18n/fr.json` |
| i18n Englisch | `src/assets/i18n/en.json` |
| i18n Arabisch | `src/assets/i18n/ar.json` |
| i18n Service | `src/app/services/i18n.service.ts` |
| TranslatePipe | `src/app/pipes/translate.pipe.ts` |
| Listing Model | `src/app/models/listing.model.ts` |
| Navbar | `src/app/components/navbar/` |
| Listing Card | `src/app/components/listing-card/` |
| Routes | `src/app/app.routes.ts` |

---

## Breakpoints

```
max-width: 480px   → Mobile klein
max-width: 640px   → Mobile
max-width: 768px   → Tablet
max-width: 1024px  → Desktop klein
```
