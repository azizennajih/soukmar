# KI-Anzeigenassistent: Analyse und Entscheidungsvorlage

Stand: 2026-11-13. Status: **Entscheidung des Betreibers offen, noch nichts entwickelt.**

Ziel: Anzeige in wenigen Schritten aus Produktfotos erstellen, zu 100 % ohne zusätzliche Kosten.

## Phase 1: Bestand

| Bereich | Stand |
|---|---|
| Formular | `src/app/pages/deposer-annonce/` – eine Komponente, 6 Schritte (Art, Kategorie, Unterkategorie, Details, Fotos, Kontakt). Zustand liegt in Feldern der Komponente (`form`, `photos`, `step`), kein Store. Fotos kommen erst in Schritt 5. |
| Upload | Fotos werden im Browser verkleinert (`utils/image-compression.ts`, max. 1600 px / 1,5 MB) und erst beim Veröffentlichen über `UploadService` an `POST /api/upload` geschickt (multer im Speicher, max. 10 Dateien je 10 MB, JPEG/PNG/WebP/GIF, Magic-Byte-Prüfung `isRealImage`, danach Cloudinary). |
| Anzeigen-API | `POST/PUT /api/listings` (`routes/listings.ts`), Prüfung in `lib/listingInput.ts`, `lib/attributes.ts`, `lib/listingChecks.ts`. Neue Anzeigen sind `PENDING` (Moderation). |
| Katalog | `GET /api/catalog/subcategories`, `/subcategories/:id/attributes`, `/categories/:cat/full`; 18 Kategorien, Unterkategorien und Attribute aus `prisma/catalog-data.ts` (EAV: `Subcategory`, `AttributeDefinition`, `ListingAttributeValue`). |
| Anmeldung | JWT im `Authorization`-Header, Middleware `authenticate`; das Formular ist nur angemeldet nutzbar. |
| Begrenzung | `middleware/rateLimit.ts` (pro Nutzer bzw. IP), z. B. `uploadLimiter`, `imageSearchLimiter`. |
| Sprache | 11 Sprachen, `I18nService` (lazy), RTL für ar/fa/ur/ps; `langInterceptor` schickt die Portalsprache als `Accept-Language`; API-Meldungen französisch und über `lib/apiMessages.ts` übersetzt. |
| Vorhandene Bildfunktionen | Fotosuche über dHash (`lib/imageHash.ts`, sharp) – keine inhaltliche Erkennung. Keine Vision-KI im Projekt. |

## Phase 2: Kann eine echte Vision-KI kostenlos laufen?

### Infrastruktur

| Rechner | Ausstattung | Eignung |
|---|---|---|
| Produktivserver IONOS VPS M+ (Ubuntu 24.04) | laut Tarif 4 GB RAM, 2–4 vCores (bitte bestätigen), 120 GB NVMe, keine GPU, 2 GB Swap; darauf laufen PostgreSQL, API, SSR, Caddy | **reicht nicht**: ein Vision-Modell braucht allein 3–8 GB RAM und lastet alle Kerne aus |
| Entwicklungs-PC | Intel i5-4300M (2 Kerne), 8 GB RAM, keine GPU, 60 GB frei, Ollama nicht installiert | reicht zum Testen eines kleinen Modells (voraussichtlich 1–3 Minuten je Analyse), nicht für den Live-Betrieb |

### Modellvergleich (Ollama, lokal, Stand der Ollama-Bibliothek 11/2026)

| Modell | Größe | Lizenz | Produkterkennung | DE / FR / EN / AR | Bewertung |
|---|---|---|---|---|---|
| `qwen3-vl:4b` | 3,3 GB | Apache 2.0 | gut, starke Texterkennung auf Produkten (32 Sprachen) | gut / gut / sehr gut / brauchbar (im Test zu prüfen) | **Empfehlung ab 8 GB RAM** |
| `gemma4:e2b` | 4,6–7,5 GB | Apache 2.0 | gut | sehr gut, über 140 Sprachen | beste Sprachqualität, braucht aber 12 GB RAM oder mehr |
| `gemma3:4b` | 3,4 GB | Gemma Terms of Use (kommerziell erlaubt, aber keine Open-Source-Lizenz) | gut | gut, über 140 Sprachen | Alternative, Lizenz schwächer |
| `qwen3-vl:2b` | 1,9 GB | Apache 2.0 | mäßig, mehr Fehler | schwächer | nur als Notlösung |
| `llama3.2-vision` | 7,8 GB | Llama-Lizenz, Bildmodell für Nutzer in der EU ausgeschlossen | – | – | ausgeschlossen |
| `moondream`, `granite3.2-vision` | 1,7 / 2,4 GB | Apache 2.0 | nur Englisch bzw. auf Dokumente ausgelegt | ungeeignet | ausgeschlossen |

Geschwindigkeit (Schätzung, nicht gemessen): ohne GPU auf 4 modernen Kernen etwa 30–90 Sekunden je Analyse, mit einer GPU ab 8 GB Grafikspeicher 3–10 Sekunden.

### Ergebnis

- **Modell:** `qwen3-vl:4b` über Ollama, per Umgebungsvariable austauschbar (z. B. gegen `gemma4:e2b` auf stärkerer Hardware).
- **Lizenzkosten:** 0 € (Ollama MIT, Modell Apache 2.0).
- **Laufende Kosten:** 0 €, sofern ein eigener Rechner die KI ausführt.
- **Benötigte Hardware:** mindestens 8 GB RAM und 4 Kerne nur für die KI, besser eine GPU.
- **Zusätzliche Serverressourcen:** ja. Der jetzige Server (4 GB RAM) trägt die KI nicht. Auf ihm wird nichts installiert.

### Wege für den Betreiber

1. **Ollama-Anbindung bauen, auf dem Entwicklungs-PC testen, live zunächst ausgeschaltet.** Das Backend spricht Ollama nur über `OLLAMA_URL` an. Ist die Variable leer oder der Dienst nicht erreichbar, meldet der Assistent verständlich, dass die KI gerade nicht verfügbar ist, und die manuelle Erstellung läuft unverändert. Live wird die KI, sobald ein eigener Rechner mit mindestens 8 GB RAM dauerhaft erreichbar ist (z. B. über einen kostenlosen WireGuard- oder SSH-Tunnel zum Server). Kosten: 0 €.
2. **Regelbasierte Lösung ohne KI auf dem jetzigen Server.** Titel und Beschreibung aus Vorlagen, Kategorie aus Nutzereingaben; läuft sofort live, erkennt aber keine Bildinhalte und heißt dann nicht „KI“.
3. **Größerer Server.** Wäre technisch der einfachste Weg, verursacht aber monatliche Kosten und widerspricht damit der Vorgabe.

Ein kostenpflichtiger Dienst springt in keinem Fall automatisch ein.
