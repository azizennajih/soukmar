# SouqMar24 – Internationale SEO: Bericht und Maßnahmenplan

Stand: 9. Oktober 2026. Unterscheidung: **umgesetzt und getestet**, **umgesetzt, aber nur im Code/lokal geprüft**, **offen**.
Keine Aussage über Rankings oder garantierte Indexierung.

## 1. Technischer Zustand (Live-Seite vor diesen Änderungen, per `curl` als Googlebot geprüft)

| Bereich | Befund |
|---|---|
| HTTPS, `www` → ohne `www`, HTTP → HTTPS | in Ordnung (301/308) |
| Antwortzeit | ~0,17 s bis zum ersten Byte, HTML ~21 KB gzip, Assets 1 Jahr gecacht, gzip aktiv, Sicherheits-Header gesetzt |
| Server-Rendering | vorhanden; Titel, H1 und Inhalt stehen im HTML (kein reines JavaScript-Rendering) |
| `robots.txt`, `sitemap.xml` | vorhanden und erreichbar; sperren private Bereiche, blockieren nicht die ganze Seite |
| Strukturierte Daten | nur auf Anzeigenseiten (Product), nicht auf der Startseite |

### Gefundene Probleme (nach Priorität)

1. **Nicht gefunden = vermutlich nicht entdeckt.** Die Domain ist neu (live seit dem 8. Okt. 2026), es gibt weder eine verifizierte Search-Console-Property noch eingereichte Sitemap noch eingehende Links. Das ist die wahrscheinlichste Hauptursache und mit Technik allein nicht behebbar (siehe Abschnitt 5). Ob die Seite im Index steht, ließ sich von hier nicht prüfen (`site:`-Abfragen liefern über die verfügbare Suche nichts Belastbares).
2. **Widersprüchliche hreflang-Signale:** Auf den Seiten standen 11 Sprachen (+ x-default), in der Sitemap nur 6. Google ignoriert bei Widersprüchen oft beides.
3. **Fehlende Canonicals/hreflang auf allen Info- und Rechtsseiten** (Über uns, So funktioniert's, Sicherheit, Hilfe, AGB …): nur Startseite, Anzeigenliste und Detailseiten hatten sie.
4. **Soft-404:** Unbekannte URLs unter einem Sprachpräfix wurden mit 302 auf die Startseite umgeleitet; nicht vorhandene Anzeigen lieferten Status 200 mit leerer Seite.
5. **Nicht geprüfte Übersetzungen im Index:** Portugiesisch, Türkisch, Persisch, Urdu und Paschtu sind erreichbar, wurden aber nicht in die Sitemap aufgenommen und hatten keine Indexierungsregel.
6. **Keine Indexierungsregeln:** Login-, Registrier- und Kontoseiten waren indexierbar (soweit nicht in `robots.txt` gesperrt); Filter-/Sortier-Varianten der Anzeigenliste hatten nur ein Canonical.
7. **Social-Tags:** `twitter:title/description` waren fest auf Französisch.
8. **Sitemap:** ohne Kategorie-Seiten und ohne die Seiten „Über uns / So funktioniert's / Sicherheit“.

## 2. Umgesetzt

Alle Punkte sind im Code, durch Unit-Tests und durch einen SEO-Smoke-Test gegen den lokal gebauten SSR-Server geprüft (Abschnitt 4). **Auf der Live-Seite wirken sie erst nach dem Deployment.**

- **Eine zentrale Regel** (`src/app/services/seo-rules.ts`) bestimmt für jede Seite Canonical, robots-Meta und hreflang. Sie wird bei jeder Navigation angewendet (`localized-title.strategy.ts`) – auch beim Server-Rendering.
  - Query-Parameter fließen nie ins Canonical, außer `?categorie=` (eine eigene, sinnvolle Landingpage je Kategorie).
  - Filter-/Sortier-/Seiten-Varianten der Anzeigenliste: Canonical auf die Basisseite, `noindex, follow`.
  - Private Seiten (Login, Registrierung, Konto, Chat, Admin, Boost …): `noindex, nofollow`. Seiten dünner/persönlicher Art (Verkäuferprofil, Bildersuche): `noindex, follow`.
- **Mehrsprachigkeit ehrlich begrenzt:** `INDEXABLE_LANGS` (`locale-routing.ts`) = fr, en, ar, de, es, it. Nur diese bilden den hreflang-Cluster und die Sitemap; pt, tr, fa, ur, ps bleiben nutzbar, sind aber `noindex`, bis eine Muttersprachlerin / ein Muttersprachler die Übersetzung geprüft hat. Umschalten: Sprache in die Liste eintragen (Frontend **und** Backend `lib/sitemap.ts`).
- **Echte 404:** neue Seite `NotFoundComponent` mit HTTP-Status 404 beim Server-Rendering; nicht ladbare Anzeigen liefern ebenfalls 404 + `noindex`.
- **Strukturierte Daten:** Startseite: `Organization` + `WebSite` (mit Suchfeld-Aktion); Anzeigen: `Product`/`Offer` erweitert (Kategorie, Zustand, Verfügbarkeit) und `BreadcrumbList`.
- **Titel/Beschreibung:** jede Seite bekommt Titel und Beschreibung in der Sprache der Seite, inklusive `og:`/`twitter:`-Kopien und `og:locale`; Anzeigen ohne Beschreibung erhalten „Titel — Ort“ statt eines leeren Textes.
- **Sitemap** (Backend): zusätzlich Info-Seiten und eine Landingpage je Kategorie, **nur für Kategorien mit mindestens einer aktiven Anzeige**; Kommentar zur Sprachauswahl; Tests ergänzt.
- **Weiterleitung `/` → Sprache:** abhängig von Cookie/Browser-Sprache (nicht von der IP), temporär (302), jetzt mit `Vary: Accept-Language, Cookie`. Alle Sprachversionen bleiben direkt per URL erreichbar.
- **Werkzeug:** `scripts/seo-smoke.mjs` prüft eine laufende Seite (lokal oder live) auf Status, Canonical, robots, hreflang und Sitemap.

## 2a. Nachträgliche Korrekturen (9. Okt. 2026, nach dem ersten Live-Test in der Search Console)

Die Search Console lehnte den Indexierungsantrag für `/en/annonces` mit „Indexierungsprobleme beim Live-Test“ ab. Zwei Ursachen wurden im Code gefunden und behoben:

1. **Leere Seite = noindex (von mir eingeführt, jetzt entfernt).** Ob die Anzeigenliste leer ist, hängt vom Land des Besuchers ab (Anzeigen werden pro Land gezeigt). Googlebot besucht meist aus den USA, sieht dort 0 Anzeigen und hätte die Seite im gerenderten Zustand als `noindex` gesehen. Die Regel gibt es nicht mehr; nur noch Filter-Varianten sind `noindex`.
2. **Sprache der Seite wurde nach dem Laden vom Land überschrieben.** Ein Besucher ohne gespeicherte Sprachwahl, der aus einem anderen Land kam (auch der Googlebot), sah nach dem Laden den Text einer anderen Sprache als in der URL (z. B. `/de/…` plötzlich auf Englisch). Jetzt gilt immer die Sprache aus der URL (`I18nService.setLangFromUrl`); die Länder-Schätzung ändert die Sprache nur noch, wenn eine Seite gar keine Sprache in der URL hat. Test: `i18n-url-language.spec.ts`.

**Offen / Hinweis:** Die Anzeigenübersicht zeigt weiterhin nur Anzeigen des Landes des Besuchers (Produktregel). Für Besucher und Crawler aus Ländern ohne Anzeigen wirkt sie leer. Detailseiten bleiben unabhängig davon über die Sitemap erreichbar. Wer das ändern will (z. B. „keine Anzeigen im eigenen Land → alle Länder zeigen“), muss das als Produktentscheidung festlegen.

## 3. Geänderte Dateien

Frontend (`soukmar`):
`src/app/services/seo-rules.ts` (neu), `seo-rules.spec.ts` (neu), `locale-routing.ts`, `seo.service.ts`, `localized-title.strategy.ts`, `src/app/app.routes.ts`, `src/app/pages/not-found/not-found.component.ts` (neu), `pages/home/home.component.ts`, `pages/annonces/annonces.component.ts`, `pages/annonce-detail/annonce-detail.component.ts`, `src/server.ts`, `src/assets/i18n/*.json` (Schlüssel `not_found.*`), `scripts/seo-smoke.mjs` (neu), `docs/seo-bericht.md` (neu).
Backend (`soukmar-backend`): `src/lib/sitemap.ts`, `src/lib/sitemap.test.ts`, `src/routes/sitemap.ts`.
Keine Datenbank-Migration, keine Änderung an DNS, Caddy oder anderer Produktionskonfiguration.

## 4. Testergebnisse

- Frontend-Unit-Tests: 48 von 48 bestanden (darunter neue Tests für die SEO-Regel: Canonical, Filter-Varianten, nicht indexierbare Sprachen, private Seiten, URLs ohne Sprachpräfix).
- Backend-Unit-Tests: 98 von 98 bestanden (darunter neue Sitemap-Tests).
- Produktions-Build: erfolgreich.
- SEO-Smoke-Test gegen den lokal gebauten SSR-Server: alle Prüfungen bestanden. Zum Vergleich schlägt derselbe Test gegen die **aktuelle Live-Version** wie erwartet an (hreflang 12 statt 7, fehlende Canonicals auf Info-Seiten, fehlende robots-Angaben, keine 404-Status).
- **Nicht gemessen:** Core Web Vitals / Lighthouse (die öffentliche PageSpeed-Schnittstelle war über das Tageskontingent hinaus ausgelastet). Was sich ohne Messung belegen lässt: schnelle Antwortzeit, komprimierte Auslieferung, langlebiges Caching, feste Bildverhältnisse (`aspect-ratio`) gegen Layout-Sprünge.

## 5. Noch erforderliche manuelle Schritte

1. **Deployment** (Plan unten).
2. **Google Search Console** (nur mit deinem Google-Konto möglich): Domain-Property `souqmar24.com` anlegen und per DNS-TXT-Eintrag bei IONOS verifizieren → `https://souqmar24.com/sitemap.xml` einreichen → „URL-Prüfung“ für Startseite, eine Kategorieseite und eine Anzeige → „Indexierung beantragen“. Gleiches optional in **Bing Webmaster Tools**.
3. Prüfen, ob eine zweite Property pro Sprache nötig ist: nein – die Domain-Property deckt alle `/xx/`-Pfade ab; in den Berichten nach URL-Präfix filtern.
4. Muttersprachliche Prüfung der Übersetzungen (pt, tr, fa, ur, ps), danach in `INDEXABLE_LANGS` aufnehmen.
5. Standardsprache: **Englisch** (entschieden am 9. Okt. 2026) – gilt für `x-default`, für Besucher ohne erkennbare Sprache und als Rückfall für E-Mails ohne gespeicherte Sprache. Wer eine Sprache gewählt hat oder aus einem Land mit eigener Sprache kommt (z. B. Marokko → Französisch), ist nicht betroffen.
6. Datenschutzerklärung enthält bereits den Absatz zur anonymen Besucherzählung; Search Console selbst benötigt keine Änderung.

## 6. Deployment- und Rollback-Plan

**Vorher:** Sicherung läuft automatisch (`update.sh` bricht ab, wenn sie fehlschlägt).
**Deployment:** `bash /opt/soukmar/soukmar/deploy/update.sh` – baut Frontend und Backend neu und startet neu. Keine Migration, keine Konfigurationsänderung.
**Nachprüfung (2 Minuten):**
```
node scripts/seo-smoke.mjs https://souqmar24.com
```
Alle Zeilen müssen „ok“ sein. Zusätzlich im Browser `https://souqmar24.com/de/does-not-exist` öffnen (404-Seite) und `https://souqmar24.com/sitemap.xml`.
**Rollback:** Nicht per `git checkout` auf dem Server (`update.sh` holt per `git pull` immer den neuesten Stand und bricht auf einem alten Stand ab). Stattdessen werden die SEO-Änderungen im Repository mit einem Revert-Commit zurückgenommen (Frontend zurück auf den Stand `50dd945`, Backend auf `39ceb15`), gepusht und danach wie gewohnt mit `update.sh` eingespielt. Die Änderungen betreffen nur die Auslieferung; Daten sind nicht betroffen.

## 7. Empfehlungen und Maßnahmenplan

**Nächste 30 Tage**
- Search Console + Bing einrichten, Sitemap einreichen, wichtigste URLs prüfen und Indexierung beantragen.
- Seite bekannt machen: Links aus eigenen Kanälen (Instagram/TikTok-Profile, Marokko-Reiseseite, Partner), Eintrag in passenden Verzeichnissen. Ohne externe Links dauert Entdeckung erfahrungsgemäß länger.
- Inhalte schaffen: möglichst viele echte, vollständige Anzeigen (Titel, Beschreibung, Fotos, Ort) – nur Seiten mit Inhalt sind indexierbar sinnvoll.
- Wöchentlich Search Console: Abdeckung, „Gefunden – zurzeit nicht indexiert“, Fehler.

**Tag 31–60**
- Auswertung: Suchanfragen, Impressionen, Klicks, Länder; Sprachversionen über URL-Präfix trennen.
- Übersetzungen prüfen lassen und freigeben (pt, tr, …).
- Eigene Texte je Kategorie (Einleitung, Tipps) als echter Mehrwert auf den Kategorie-Landingpages; erst bei ausreichend Anzeigen Stadt-Landingpages erwägen (keine leeren Stadtseiten anlegen).
- Core Web Vitals mit echten Nutzerdaten (Search Console) und Lighthouse-Lauf nachholen.

**Tag 61–90**
- Auf Basis der Daten: Länder-/Sprachschwerpunkte setzen, ggf. `x-default` überdenken.
- Bewertungen/Verkäuferprofil-Seiten nur indexierbar machen, wenn genug eigener Inhalt vorhanden ist.
- Sitemap-Aufteilung (Index) erst nötig, wenn deutlich über ~8.000 Anzeigen.
