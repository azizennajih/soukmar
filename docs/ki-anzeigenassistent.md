# KI-Anzeigenassistent

Stand: 2026-11-13. Status: **Weg 1 umgesetzt** (Entscheidung des Betreibers vom 2026-11-13). Auf dem Live-Server ist die KI aus, bis `OLLAMA_URL` gesetzt ist.

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

## Umsetzung (Weg 1)

### Ablauf

1. Der Assistent („✨ Anzeige mit KI erstellen“, `components/ai-listing-assistant`) steht in `/deposer-annonce` über den Formularschritten und bleibt auf jedem Schritt sichtbar. Er nutzt dieselbe Fotoliste wie der Foto-Schritt.
2. „Fotos analysieren“ schickt bis zu 6 Fotos an `POST /api/ai/listing-draft` (angemeldet). Das Backend prüft Format und Größe, entfernt doppelte Bilder, verkleinert Kopien für das Modell und fragt Ollama: erst alle Bilder gemeinsam (Artikel, Texte, Kategorie), dann ohne Bilder die Auswahlfelder der gewählten Unterkategorie.
3. Die Antwort wird serverseitig geprüft (`lib/aiListing.ts`): nur vorhandene Kategorien und Unterkategorien, Auswahlwerte nur aus den Optionen, Marke nur wenn auf einem Foto lesbar, nie „Sonstige“ geraten.
4. Die Vorschau zeigt Artikel, Titel, Beschreibung, Kategorie (mit Alternativen), erkannte Eigenschaften und was fehlt. Titel und Beschreibung sind dort bearbeitbar.
5. Erst „Vorschlag übernehmen“ schreibt ins Formular. Selbst geschriebene Texte werden nur nach Rückfrage ersetzt. Die Anzeige entsteht wie bisher über `POST /api/listings` und geht in die Moderation.

### Antwort von `POST /api/ai/listing-draft`

`product_name`, `suggested_title`, `suggested_description`, `suggested_category` (`category`, `subcategory_code`, `subcategory_id`), `alternative_categories`, `attributes`, `missing_attributes`, `confidence` (0–1), `missing_information`, `keywords`, `brand`, `model`, `color`, `material`, `features`, `cached`, `images_analysed`.

Fehler: 503 `AI_UNAVAILABLE` (nicht eingerichtet oder nicht erreichbar), 503 `AI_BUSY` (Warteschlange voll), 502 `AI_FAILED` (Antwort unbrauchbar), 429 (mehr als 20 Analysen je Stunde und Konto). In allen Fällen bleibt die manuelle Erstellung nutzbar.

### Schutz und Sparsamkeit

- Kein Zugang im Browser: Der Browser spricht nur mit der eigenen API, die Adresse des KI-Rechners steht nur in der Server-`.env`.
- Dateien: JPEG, PNG, WebP, GIF, je höchstens 10 MB, Prüfung der Magic Bytes.
- Gleiche Fotos (auch in anderer Reihenfolge) in derselben Sprache liefern 24 Stunden lang das gespeicherte Ergebnis; „Neu generieren“ umgeht das bewusst. Doppelte Fotos in einer Anfrage werden nur einmal analysiert.
- Es läuft immer nur eine Analyse gleichzeitig, höchstens drei warten.

### Einschalten (Betreiber)

Auf einem eigenen Rechner mit mindestens 8 GB RAM, **nicht** auf dem Produktivserver:

1. Ollama installieren (ollama.com) und `ollama pull qwen3-vl:4b` ausführen.
2. Den Port 11434 nur für den Server erreichbar machen, zum Beispiel über einen WireGuard- oder SSH-Tunnel. Ollama hat keine eigene Anmeldung, der Port darf nie offen im Internet stehen.
3. In der Backend-`.env` auf dem Server eintragen und die API neu starten:

```
OLLAMA_URL=http://<Adresse des KI-Rechners im Tunnel>:11434
OLLAMA_MODEL=qwen3-vl:4b
```

Weitere Schalter: `OLLAMA_TIMEOUT_MS` (Standard 240000), `AI_IMAGE_MAX_PX` (Standard 768, kleiner ist schneller), `AI_ATTRIBUTE_PASS=off` (zweiten Durchlauf abschalten).

Ohne `OLLAMA_URL` zeigt der Assistent „gerade nicht verfügbar“; es springt kein anderer Dienst ein.
