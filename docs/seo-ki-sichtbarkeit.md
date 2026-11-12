# Auffindbarkeit: Suchmaschinen und KI-Assistenten (Stand 12.11.2026)

## Was technisch schon da ist
- Seiten werden auf dem Server gerendert (Crawler sehen Inhalt ohne JavaScript).
- Pro Seite Canonical, `hreflang` (fr, en, ar, de, es, it + x-default), Open Graph und Twitter-Karten.
- `sitemap.xml` mit allen öffentlichen Anzeigen, Kategorien und Infoseiten in allen indexierbaren Sprachen (mit `lastmod`).
- Strukturdaten: Startseite `Organization` + `WebSite` (mit Suchfunktion), Anzeigen `Product` + `BreadcrumbList`.
- Private Seiten (Admin, Chat, Profil …) sind per `robots.txt` und `noindex` ausgeschlossen.

## Neu in dieser Runde
- **`/llms.txt`**: kurze, maschinenlesbare Beschreibung (Was ist SouqMar24, Funktionen, Kategorien, wichtige Links, Kontakt) für KI-Assistenten. Datei: `public/llms.txt`, auf Englisch, bei Änderungen von Funktionen mitpflegen.
- **`robots.txt`** nennt KI-Crawler ausdrücklich und erlaubt sie (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, Amazonbot, Meta-ExternalAgent, DuckAssistBot). Private Pfade bleiben gesperrt.
- **Titel und Beschreibungen mit Suchbegriffen** in allen 11 Sprachen: Startseite "Kleinanzeigen in Marokko", Kategorien "{Kategorie} – Kleinanzeigen kaufen & verkaufen", Anzeigen "{Titel} – {Stadt} | SouqMar24" (Titel auf 55 Zeichen gekürzt).
- **Marken-Daten**: `Organization` mit Beschreibung, Land (Marokko) und Schreibvarianten (SouqMar, Souq Mar 24, Soukmar24).
- **Vorschaubild 1200 × 630** (`og-default.png`) statt des kleinen Logos, große Twitter-Karte.

## Was nur du tun kannst (Reihenfolge nach Wirkung)
1. **Google Search Console** einrichten: Property `souqmar24.com` per DNS-TXT-Eintrag bestätigen (beim DNS-Anbieter der Domain), dann `https://souqmar24.com/sitemap.xml` einreichen. Danach unter "Seiten" prüfen, welche URLs indexiert sind.
2. **Bing Webmaster Tools**: Property aus der Search Console importieren (ein Klick), Sitemap einreichen. Wichtig: ChatGPT-Suche, Copilot und viele andere Assistenten stützen sich auf den Bing-Index.
3. **IndexNow** (optional, Bing/Yandex): Schlüsseldatei anlegen und neue Anzeigen sofort melden. Kann ich bei Bedarf bauen.
4. **Profile verlinken**: Facebook, Instagram, TikTok und ähnliche Profile mit `https://souqmar24.com` verknüpfen. Nenn mir die Profil-Adressen, dann trage ich sie als `sameAs` in die Strukturdaten ein.
5. **Erwähnungen und Links von außen**: Marokko-Foren, Verzeichnisse, Blogs, Partnerseiten (z. B. moroccancities.com mit einem Link auf SouqMar24). KI-Assistenten und Suchmaschinen vertrauen Seiten, über die andere schreiben.
6. **Inhalte**: Je mehr echte Anzeigen und je mehr eigener Text (Ratgeber, Städte-/Kategorieseiten), desto mehr gibt es zu finden.

## Realistische Erwartung
Ein Anspruch auf Nennung in ChatGPT, Gemini oder Claude lässt sich technisch nicht erzwingen. Diese Assistenten antworten aus ihrem Training und aus Suchindizes (Bing, Google und andere). Neue Seiten werden meist erst nach Wochen indexiert und erwähnt. Prüfen kannst du es nach 4–8 Wochen, indem du die Assistenten fragst: "Was ist SouqMar24?" und "Kleinanzeigen-Portal für Marokko".

## Prüfen nach dem Update
- `https://souqmar24.com/llms.txt` und `https://souqmar24.com/robots.txt` öffnen.
- Quelltext der Startseite: `<title>` enthält "Kleinanzeigen in Marokko" (de), `og:image` zeigt auf `og-default.png`.
- Rich-Results-Test von Google mit einer Anzeigen-URL: `Product` sollte erkannt werden.
