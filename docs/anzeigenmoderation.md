# Anzeigenmoderation (Freigabe vor Veröffentlichung)

Stand: 2026-10-20 · Backend: `soukmar-backend` · Web: dieses Repo

## Ablauf in einem Satz

Jede neue Anzeige landet im Status **PENDING** („wartet auf Prüfung“) und ist nirgends öffentlich, bis ein Admin oder Moderator sie im Dashboard unter **Anzeigenmoderation** freigibt. Nach der Freigabe bekommt der Nutzer eine E-Mail („Deine Anzeige ist jetzt online!“).

## Status

| Anforderung | Status in der Datenbank | Öffentlich? |
|---|---|---|
| pending_review | `PENDING` | nein |
| approved | `ACTIVE` (`RESERVED`/`SOLD` sind Nutzer-Umschalter *nach* der Freigabe) | ja (`ACTIVE`, `RESERVED`) |
| rejected | `REJECTED` | nein |
| changes_requested | `CHANGES_REQUESTED` (neu) | nein |
| suspended | `SUSPENDED` (neu) | nein |
| draft | **nicht umgesetzt** – eine Anzeige wird beim Anlegen sofort eingereicht | – |

Erlaubte Übergänge (serverseitig in `src/lib/listingModeration.ts`, `ACTION_RULES`):

- **freigeben**: PENDING, CHANGES_REQUESTED, REJECTED, SUSPENDED → ACTIVE
- **ablehnen** (Grund Pflicht, optional „Nutzer darf erneut einreichen“): PENDING, CHANGES_REQUESTED, SUSPENDED, ACTIVE, RESERVED → REJECTED
- **Änderungen anfordern** (Grund Pflicht): PENDING, SUSPENDED, ACTIVE, RESERVED → CHANGES_REQUESTED
- **sperren** (Grund Pflicht): ACTIVE, RESERVED → SUSPENDED
- **zurück in die Warteschlange**: CHANGES_REQUESTED, REJECTED, SUSPENDED, ACTIVE, RESERVED → PENDING

Der Nutzer kann sich nie selbst freigeben. Auch ein Admin kann über das normale Bearbeiten (`PUT /api/listings/:id`) keinen dieser Status setzen (Antwort 400 `USE_MODERATION_API`), sodass jede Entscheidung im Verlauf steht.

## Was nach Änderungen durch den Nutzer passiert

- Anzeige im Status `CHANGES_REQUESTED` (oder `REJECTED` mit erlaubter erneuter Einreichung): jede Änderung schickt sie zurück auf PENDING.
- Veröffentlichte Anzeige: Änderung an Titel, Beschreibung, Bildern, Telefon/WhatsApp, Kategorie, Unterkategorie, Land oder Art (Angebot/Gesuch) sowie ein Preissprung unter die Hälfte oder über das Doppelte schickt sie zurück auf PENDING. Alles andere (z. B. Reserviert/Verkauft, kleine Preisänderung) bleibt ohne neue Prüfung.
- Endgültig abgelehnte Anzeige: Bearbeiten wird mit 403 abgelehnt.

## Datenbank

Migration `prisma/migrations/20261020120000_listing_moderation_workflow`:

- Enum `ListingStatus` + `CHANGES_REQUESTED`, `SUSPENDED`
- `Listing`: `moderationSignals` (Warnhinweise), `submittedAt`, `moderatedAt`, `moderatedById`, `moderationReason`, `resubmitAllowed`, `statusChangedAt`
- neue Tabelle `ListingModerationEvent` (Verlauf): von/nach Status, wer (`actorId`, `actorRole` ADMIN/MODERATOR/OWNER/SYSTEM), Grund, Zeitpunkt, E-Mail-Art/-Status/-Zeitpunkt/-Fehler
- Bestehende Anzeigen behalten ihren Status (bleiben online); `submittedAt`/`statusChangedAt` werden aus den vorhandenen Zeiten befüllt.

## Parallele Entscheidungen

`transitionListing()` liest den Status in einer Transaktion und schreibt mit `updateMany … where status = <gelesener Status>`. Entscheiden zwei Admins gleichzeitig, gewinnt genau einer, der andere bekommt 409 (`ALREADY`/`STALE`) und das Dashboard lädt neu. Das Dashboard sendet zusätzlich `expectedStatus` mit.

## E-Mails

- Freigabe, Ablehnung (mit Grund und Hinweis, ob erneut einreichbar), Änderungswunsch, Sperre – in 11 Sprachen (`src/lib/listingDecisionTexts.ts`).
- Freigabe-Link ist absolut (`APP_URL/<sprache>/annonces/<id>`).
- Versand erst **nach** dem Commit; ein Fehler macht die Entscheidung nicht rückgängig. Status (SENT/FAILED/PENDING/SKIPPED) und Fehlertext stehen am Verlaufseintrag; im Dashboard gibt es „Erneut senden“ (atomar, kein doppelter Versand bei Doppelklick).
- Wiederholtes Freigeben derselben Anzeige schickt keine zweite Mail (zweiter Aufruf → 409).

## Automatische Prüfhinweise (nur Warnungen)

Geprüft wird: Schlagwörter (Betrug/verbotene Ware/Spam), optional OpenAI-Textprüfung, externe Links/Link-Verkürzer, E-Mail/Telefon/Messenger im Text, GROSSSCHREIBUNG, Zeichenwiederholungen, sehr kurze Beschreibung, Preis null/Platzhalter/stark unter bzw. über dem Durchschnitt vergleichbarer Anzeigen, Textduplikate (eigenes/fremdes Konto), wiederverwendete Fotos (Bild-Hash, nur in der Prüfansicht), Massen-Einstellen (pro Stunde/Tag), neues unbestätigtes Konto.

**Nicht geprüft:** der Inhalt der Bilder (kein Bildklassifikator). Ein leeres Ergebnis ist keine Garantie.

Schwellen sind per `MODERATION_RULES` (JSON-Umgebungsvariable) änderbar, z. B. `{"massPostingPerHour":3,"extraPatterns":[{"pattern":"gratis\\s+iphone","reason":"Lockangebot","severity":"high"}]}`.

## Umgebungsvariablen

| Variable | Wirkung |
|---|---|
| `LISTING_PREMODERATION` | `all` (Standard): jede neue Anzeige wartet auf Freigabe. `flagged`: nur Anzeigen mit Warnhinweisen warten (altes Verhalten). |
| `MODERATION_RULES` | JSON mit Schwellenwerten und zusätzlichen Schlagwort-Regeln (siehe oben). |

## API (nur ADMIN/MODERATOR, `/api/admin/moderation`)

`GET /summary` · `GET /listings` (status, country, category, from, to, q, sort=oldest|risk|newest, page, limit) · `GET /listings/:id` · `POST /listings/:id/{approve|reject|request-changes|suspend|requeue}` (body: `reason`, `allowResubmit`, `expectedStatus`) · `GET /history` · `POST /events/:id/resend-email`

## Wo nicht-freigegebene Anzeigen ausgeschlossen sind

Suche/Listen, Detail-API (nur Besitzer und Team), Favoriten, Verkäuferseite, „ähnliche Anzeigen“, Sitemap, OG-/Social-Vorschau, Benachrichtigungen an gespeicherte Suchen/Follower (erst bei der ersten Freigabe). Die Detailseite für Besitzer/Team trägt `noindex` und einen Hinweis.

## Web-Oberfläche

- Admin → Tab **Anzeigenmoderation** (`src/app/pages/admin/moderation/`): Kennzahlen, Warteschlange mit Filtern (Status, Land, Kategorie, Erstellungsdatum, Suche nach Titel/ID/Nutzer, Sortierung), Detailansicht (Bilder, Beschreibung, Preis, Kategorie, Ort, Angaben, Verkäufer-Infos, Warnhinweise, ähnliche Anzeigen, Käufer-Vorschau, Verlauf), Entscheidungen mit Pflichtbegründung, Verlaufsliste aller Entscheidungen.
- Meine Anzeigen: Statusanzeige mit Erklärung und Begründung des Teams; Hinweis nach dem Einreichen.
- Texte in allen 11 Sprachdateien (`moderation.*`, `annonces.*`, `mes_annonces.*`, `deposer.*`, `listing.not_public_notice`).

## Tests

- `npm test` (Backend): 134 Unit-Tests, u. a. Prüfregeln, Übergänge, Begründungspflicht, Bearbeitungs-Regeln, Mailtexte.
- `npm run test:int` (Backend): 34 Integrationstests gegen eine echte PostgreSQL-Testdatenbank (`soukmar_modtest`, wird automatisch angelegt) mit den 12 geforderten Fällen: pending beim Anlegen · vor Freigabe nicht öffentlich · Nutzer kann nicht freigeben · Admin kann freigeben · danach öffentlich · Besitzer bekommt Mail · wiederholtes Freigeben ohne zweite Mail · abgelehnt bleibt unveröffentlicht · Bearbeitung löst erneute Prüfung aus · nicht freigegebene Anzeigen fehlen in Suche/API/Sitemap · Mailfehler beschädigt den Status nicht · gleichzeitige Admin-Entscheidungen bleiben konsistent.
- `ng test` (Web): 69 Tests (u. a. Parität der Sprachdateien).
- Im Browser (lokale Entwicklungsumgebung) von Hand geprüft: Warteschlange, Detail, Ablehnen mit Pflichtgrund, Freigeben mit fehlgeschlagener Mail (Status bleibt freigegeben, „Erneut senden“ erscheint), Besitzer-Ansicht, Hinweis auf der Detailseite, mobile Breite.

## Offene Punkte / Grenzen

- **Bildinhalte** werden nicht automatisch geprüft.
- **Kein Entwurf-Status.**
- Ein laufender **Chat** zu einer später gesperrten Anzeige wird nicht unterbrochen.
- Die **Android-/iOS-Apps** kennen die neuen Status noch nicht und zeigen sie als Rohtext; die Moderation selbst läuft nur im Web-Dashboard.
- Übersetzungen der Mail- und Oberflächentexte (v. a. fa/ur/ps) sind maschinell erstellt und nicht von Muttersprachlern geprüft.
- Auf dem Server muss die Migration laufen (`deploy/update.sh` führt `prisma migrate deploy` aus). **Backend und Web müssen zusammen ausgeliefert werden**: Das alte Admin-Frontend würde beim Freigeben `USE_MODERATION_API` erhalten.
- Ob die Mails beim Provider ankommen, ist mit der echten SMTP-Konfiguration auf dem Server zu prüfen; lokal wurde der Versand nur gegen einen absichtlich toten SMTP-Port (Fehlerfall) getestet.
