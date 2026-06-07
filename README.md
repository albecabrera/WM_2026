# WM 2026 Tipp-Spiel · BBG & ESG Bonn

Schulinternes Tipp-Spiel zur FIFA WM 2026 für das **BBG** (6 Farb-Klassen) und die **Elisabeth-Selbert-Gesamtschule** (Klasse 1–6). Schüler und Lehrkräfte tippen Spielergebnisse und treten gegeneinander an.

> **⚠️ Datenschutz-Grundsatz:** Es werden ausschließlich Phantasienamen verwendet.  
> Echte Namen, E-Mail-Adressen oder Passwörter werden niemals eingegeben, gespeichert oder übertragen.  
> Die Zuordnung Code ↔ echter Schüler bleibt **offline beim Lehrer** (DSGVO-konform).

---

## Inhalt

- [Schnellstart](#schnellstart)
- [Login-Codes](#login-codes)
- [Funktionsübersicht](#funktionsübersicht)
- [Datenschutz & DSGVO](#datenschutz--dsgvo)
- [Tech-Stack](#tech-stack)
- [Punktesystem](#punktesystem)
- [Auto-Sync (Ergebnisse aus dem Internet)](#auto-sync)
- [API-Routen](#api-routen)
- [Deployment](#deployment)
- [Umgebungsvariablen](#umgebungsvariablen)

---

## Schnellstart

```bash
cd app
npm install
cp .env.example .env          # JWT_SECRET setzen: openssl rand -hex 32
npx prisma db push
npm run db:seed
npm run dev                   # http://localhost:3000
```

---

## Login-Codes

### Admin

| Code        | Beschreibung |
|-------------|-------------|
| `admin2026` | Zugang zum vollständigen Admin-Panel |

---

### BBG — Lehrkräfte (12 gesamt, 2 pro Klasse)

| Klasse       | Code 1                      | Code 2                    |
|--------------|-----------------------------|---------------------------|
| **gelb**     | `torpantherspur-gelb`       | `rasenzauberwind-gelb`    |
| **schwarz**  | `ballgepardspur-schwarz`    | `netzfederflug-schwarz`   |
| **gruen**    | `elferkompass-gruen`        | `torregenflug-gruen`      |
| **blau**     | `flankenmeteorflug-blau`    | `ballvulkanwind-blau`     |
| **rot**      | `netzfuchsspur-rot`         | `rasenphantasie-rot`      |
| **weiss**    | `pokalwirbel-weiss`         | `fanfarenblitz-weiss`     |

### BBG — Schüler-Beispiele (je 2 pro Klasse)

| Klasse       | Beispiel 1                | Beispiel 2                |
|--------------|---------------------------|---------------------------|
| **gelb**     | `rasenrakete-gelb`        | `ballblitz-gelb`          |
| **schwarz**  | `netzfalke-schwarz`       | `elferstern-schwarz`      |
| **gruen**    | `rasenblitz-gruen`        | `ballstern-gruen`         |
| **blau**     | `torgepard-blau`          | `rasenvulkan-blau`        |
| **rot**      | `torrakete-rot`           | `rasenfeder-rot`          |
| **weiss**    | `torwirbelwind-weiss`     | `rasenmeteorflug-weiss`   |

> Alle 180 BBG-Schüler-Codes: `{phantasiename}-{farbe}` — vollständige Liste in `prisma/seed.ts`.

---

### ESG — Lehrkräfte (13 gesamt; Klasse 3 hat 3 Lehrkräfte)

| Klasse       | Code 1                    | Code 2                  | Code 3             |
|--------------|---------------------------|-------------------------|--------------------|
| **k1**       | `taktikmeister-k1`        | `spielstratege-k1`      | —                  |
| **k2**       | `angriffsleiter-k2`       | `defensivheld-k2`       | —                  |
| **k3**       | `spielvisionaer-k3`       | `offensivcoach-k3`      | `kampfkommando-k3` |
| **k4**       | `defensivgeist-k4`        | `spielleitung-k4`       | —                  |
| **k5**       | `sturmfuhrer-k5`          | `abwehrstratege-k5`     | —                  |
| **k6**       | `flankencoach-k6`         | `spielanalyst-k6`       | —                  |

### ESG — Schüler-Beispiele (je 2 pro Klasse)

| Klasse   | Beispiel 1           | Beispiel 2            |
|----------|----------------------|-----------------------|
| **k1**   | `sturmheld-k1`       | `torjager-k1`         |
| **k2**   | `sturmheld-k2`       | `torjager-k2`         |
| **k3**   | `sturmheld-k3`       | `torjager-k3`         |
| **k4**   | `sturmheld-k4`       | `torjager-k4`         |
| **k5**   | `sturmheld-k5`       | `torjager-k5`         |
| **k6**   | `sturmheld-k6`       | `torjager-k6`         |

> Alle 180 ESG-Schüler-Codes: `{phantasiename}-{klassencode}` — vollständige Liste in `prisma/seed.ts`.

---

## Funktionsübersicht

| # | Funktion | Beschreibung | Rollen |
|---|----------|-------------|--------|
| 1 | **2-Schritt-Login** | Schule wählen → Schulcode eingeben → persönlichen Code eingeben | Alle |
| 2 | **Multi-Schul-Unterstützung** | BBG und ESG vollständig getrennt — eigene Ranglisten pro Schule | Alle |
| 3 | **Dashboard** | Übersicht: Punkte, Rang, Tipps; Tutorial-Modal für Erstbesucher | Schüler, Lehrer |
| 4 | **Gruppen-Tipps** | Tippen auf alle 104 WM-Spiele (Heim/Auswärts) — gesperrt 5 Min. vor Anpfiff | Schüler, Lehrer |
| 5 | **Fortschrittsbalken** | Zeigt „X von Y getippt" pro Gruppe | Schüler, Lehrer |
| 6 | **Weltmeister-Tipp** | Einmaliger Tipp auf den WM-Sieger (+5 Punkte) bis Turnierbeginn | Schüler, Lehrer |
| 7 | **KO-Runden** | Anzeige R32 → R16 → QF → SF → Finale mit Live-Ergebnissen | Schüler, Lehrer |
| 8 | **Live-Badge** | `● LIVE` bei laufenden Spielen; automatische Aktualisierung alle 30 Sek. | Alle |
| 9 | **Rangliste — Einzelwertung** | Punkte-Rangliste aller Mitspieler der eigenen Schule; Filter nach Klasse; Top-3-Podium | Alle |
| 10 | **Rangliste — Gruppenwertung** | Klassenrangliste mit Gesamtpunkten, Durchschnitt, bestem Spieler | Alle |
| 11 | **Hell-/Dunkel-Modus** | Toggle ☀️/🌙; wird in `localStorage` gespeichert | Alle |
| 12 | **Admin — Ergebnisse** | Spielergebnisse manuell eintragen + automatische Punkteberechnung | Admin |
| 13 | **Admin — KO-Bracket** | Teams manuell einsetzen; Auto-Advance nach jedem Ergebnis | Admin |
| 14 | **Admin — Elfmeterschießen** | Bei Unentschieden im KO: Gewinner-Modal → manueller Advance | Admin |
| 15 | **Admin — Turniersieger** | WM-Gewinner offiziell setzen → +5-Punkte-Berechnung für alle | Admin |
| 16 | **Admin — Schüler verwalten** | Neue Phantasienamen anlegen, Codes einsehen | Admin |
| 17 | **Admin — Code-Reset** | Vergessenen Code via `#Name` suchen und neu generieren | Admin |
| 18 | **Admin — QR-Codes** | QR-Code pro Login-Code generieren (zum Ausdrucken/Aushängen) | Admin |
| 19 | **Admin — Schul-Umschaltung** | Alle Admin-Ansichten getrennt nach BBG / ESG filterbar | Admin |
| 20 | **Klassenliste (Druck)** | Druckbare Liste: Klasse → Lehrkräfte → Schüler mit Codes; PDF-Export | Admin, Lehrer |
| 21 | **Auto-Sync** | Server holt WM-Ergebnisse automatisch von `football-data.org` (Server→Server, kein Browser) | — |
| 22 | **Celebrations-Seite** | Siegerehrung mit Animation und Konfetti nach Turnierende | Admin |
| 23 | **Datenschutzseite** | Vollständige DSGVO-Erklärung unter `/datenschutz` | Alle (öffentlich) |

---

## Datenschutz & DSGVO

### Was gespeichert wird

| Tabelle | Gespeicherte Felder | Bewertung |
|---------|---------------------|-----------|
| `User` | Phantasiename, Klassencode, Login-Code, Rolle | ✅ Kein personenbezogenes Datum |
| `Tip` | User-ID (intern), Match-ID, Heim/Auswärts-Tore, Punkte | ✅ Nur Zahlen |
| `TournamentWinnerTip` | User-ID (intern), Team-ID, Punkte | ✅ Nur Zahlen |
| `Match` | Spielpaarung, Datum, Ergebnis, Status | ✅ Öffentliche Spieldaten |
| `Team` | Nationalmannschaft, Kürzel, Emoji | ✅ Öffentliche Daten |
| `SyncState` | Letzter Sync-Zeitstempel | ✅ Nur Systemdaten |

### Was niemals gespeichert wird

Echte Namen · E-Mail-Adressen · Geburtsdatum · IP-Adressen · Passwörter · Standortdaten · Gerätedaten · Nutzungszeiten

### Technische Maßnahmen

| Maßnahme | Umsetzung |
|----------|----------|
| Keine externen Tracker | Kein Google Analytics, Meta Pixel, Hotjar o.Ä. |
| Keine Google Fonts CDN | Bebas Neue + DM Sans **selbst gehostet** in `public/fonts/` — keine IP an Google übermittelt (vgl. LG München I, 20.01.2022, Az. 3 O 17493/20) |
| Lokale Datenbank | SQLite auf Schulrechner (`file:./dev.db`) — kein Cloud-Dienst |
| Kein externer Auth-Dienst | Eigenes JWT-System, rein lokal |
| `httpOnly`-Cookie | Kein JavaScript-Zugriff auf Session-Token |
| Schulcode clientseitig | Schulpasswort (`bbg-wm2026` / `esg-wm2026`) wird **niemals** an den Server übertragen |
| Lehrkraft-Datentrennung | Lehrer sieht ausschließlich eigene Klasse in Klassenliste und Admin-Bereich |
| Externe API servergesteuert | `football-data.org`-Abfragen nur Server→Server — Browser kontaktiert niemals externe APIs |

---

## Tech-Stack

### Frontend

| Technologie | Version | Zweck |
|-------------|---------|-------|
| **Next.js** | 14.2 | React-Framework — App Router, Server Components, API Routes |
| **React** | 18 | UI-Bibliothek |
| **TypeScript** | 5 | Typsicherheit |
| **CSS (plain)** | — | Styling via CSS-Variablen + `globals.css` — kein Tailwind, kein CSS-in-JS |
| **clsx** | 2.1 | Bedingte Klassen-Namen |

### Backend / API

| Technologie | Version | Zweck |
|-------------|---------|-------|
| **Next.js API Routes** | 14.2 | REST-Endpunkte (`route.ts`) |
| **Prisma ORM** | 5.10 | Typsicherer Datenbankzugriff |
| **SQLite** | — | Lokale Datenbank — kein externer DB-Server |
| **jsonwebtoken** | 9 | JWT-Generierung und -Verifikation |
| **bcryptjs** | 2.4 | Hashing-Bibliothek |
| **cookies-next** | 4.1 | `httpOnly`-Cookie-Management |
| **qrcode** | 1.5 | QR-Code-Generierung (lokal, kein Drittdienst) |

### Fonts (self-hosted)

| Font | Datei | Zweck |
|------|-------|-------|
| **Bebas Neue** | `public/fonts/bebas-neue-latin.woff2` | Display-Font (Titel, Zahlen) |
| **DM Sans** (Variable) | `public/fonts/dm-sans-latin.woff2` | Body-Font (400–700) |
| **DM Sans Ext** | `public/fonts/dm-sans-latin-ext.woff2` | Erweiterte Zeichensätze |

### Architekturmuster

- **App Router** (Next.js 14) — Server Components by default, `'use client'` nur wo nötig
- **Container/Presentational** — Seiten als Server Components, interaktive Teile als Client Components
- **REST** — einfache `GET/POST`-Endpunkte
- **JWT + `httpOnly`-Cookie** — Session ohne `localStorage`-Token
- **Schul-Isolation** — Schule wird serverseitig aus `classCode` abgeleitet (`getSchool()`), nie vom Client

---

## Punktesystem

| Tipp-Ergebnis | Punkte |
|---------------|--------|
| Genaues Ergebnis (z.B. 2:1 = 2:1) | **+3** |
| Richtige Tordifferenz (z.B. 3:2 statt 2:1) | **+2** |
| Richtige Tendenz (Sieg / Unentschieden / Niederlage) | **+1** |
| Weltmeister richtig getippt | **+5** |

### Wertungen

- 🎽 **Gruppensieger** — Beste(r) pro Klasse
- 👑 **Jahrgangssieger** — Beste(r) aller Klassen (schulweit)
- 🏅 **Beste Gruppe** — Klasse mit den meisten Gesamtpunkten

---

## Auto-Sync

Die App aktualisiert WM-Ergebnisse automatisch — der Lehrer muss nichts manuell eintragen.

**Aktivierung:**
1. Kostenloser API-Schlüssel unter <https://www.football-data.org/client/register>
2. In `.env` eintragen:
   ```env
   FOOTBALL_API_KEY="dein-schluessel"
   ```
3. App neu starten → im Admin-Panel erscheint `🌐 Auto-Sync aktiv`

**Funktionsweise:**
- `/api/sync` fragt `football-data.org` ab (Throttle: 5 Min.)
- Wird vom Client beim Öffnen von Dashboard/Admin ausgelöst
- Nur Server→Server — keine Schülerdaten werden übermittelt
- Ohne Schlüssel: App läuft im manuellen Modus

---

## API-Routen

| Methode | Route | Beschreibung | Rolle |
|---------|-------|-------------|-------|
| POST | `/api/auth` | Login mit Phantasiecode | Alle |
| GET | `/api/auth/logout` | Logout (Cookie löschen) | Alle |
| GET | `/api/me` | Eigene Stats (Punkte, Rang, Tipps) | Alle |
| GET | `/api/matches` | Spiele nach Phase (`?phase=GROUP`) | Alle |
| GET | `/api/teams` | Alle 48 Teams | Alle |
| POST | `/api/tips` | Tipp speichern | Schüler, Lehrer |
| GET/POST | `/api/tips/winner` | Weltmeister-Tipp lesen/speichern | Schüler, Lehrer |
| GET | `/api/leaderboard` | Rangliste (`?school=bbg&class=gelb`) | Alle |
| GET | `/api/leaderboard/groups` | Klassenrangliste | Alle |
| POST | `/api/results` | Ergebnis eintragen + Auto-Advance KO | Admin |
| POST | `/api/results/winner` | Weltmeister offiziell setzen | Admin |
| GET/PUT | `/api/admin/ko` | KO-Teams einsehen/zuweisen | Admin |
| POST | `/api/admin/advance` | KO-Gewinner manuell vorrücken (Elfmeter) | Admin |
| GET/POST | `/api/admin` | Schüler auflisten/anlegen | Admin, Lehrer |
| POST | `/api/admin/reset-code` | Login-Code suchen/zurücksetzen | Admin |
| GET | `/api/admin/qr` | QR-Code-PNG generieren | Admin |
| GET | `/api/admin/klassenliste` | Klassenliste (Lehrer: eigene Klasse) | Admin, Lehrer |
| GET | `/api/sync` | Auto-Sync-Status + Sync auslösen | Alle |
| POST | `/api/sync?force=1` | Sofort-Sync erzwingen | Admin, Lehrer |

---

## Deployment

### Lokal (empfohlen für Schulbetrieb)

Daten verlassen das Schulnetz nicht — DSGVO-konform.

```bash
cd app
npm install
cp .env.example .env       # JWT_SECRET setzen
npx prisma db push
npm run db:seed
npm run dev                # Entwicklung: http://localhost:3000
```

Alle Schüler im selben WLAN erreichbar unter: `http://<IP-Schulrechner>:3000`

### Vercel (optional, nur bei externem Zugriff)

- Region auf **Frankfurt (`fra1`)** setzen (EU-Server)
- [Data Processing Agreement mit Vercel](https://vercel.com/legal/dpa) abschließen (kostenlos)
- Umgebungsvariablen im Vercel-Dashboard hinterlegen

```json
{
  "buildCommand": "cd app && npm install && npm run build",
  "outputDirectory": "app/.next",
  "framework": "nextjs"
}
```

---

## Umgebungsvariablen

```env
# Pflicht — App wirft Fehler beim Start wenn nicht gesetzt
JWT_SECRET="min-32-zeichen-langer-zufallsstring"   # openssl rand -hex 32

# Prisma (Standard: lokale SQLite-Datei)
DATABASE_URL="file:./dev.db"

# Optional — aktiviert automatischen WM-Ergebnis-Sync
FOOTBALL_API_KEY="schluessel-von-football-data.org"
```

---

## Projektstruktur

```
WM_2026/
├── app/
│   ├── prisma/
│   │   ├── schema.prisma       Datenbankschema (SQLite)
│   │   └── seed.ts             Alle Nutzer + Spielplan anlegen
│   ├── public/
│   │   └── fonts/              Self-hosted Webfonts (DSGVO)
│   └── src/
│       ├── app/                Next.js App Router
│       │   ├── api/            REST-Endpunkte
│       │   ├── admin/          Admin-Panel
│       │   ├── dashboard/      Schüler-Dashboard
│       │   ├── leaderboard/    Rangliste
│       │   ├── klassenliste/   Druckbare Klassenliste
│       │   ├── datenschutz/    DSGVO-Erklärung
│       │   ├── login/          2-Schritt-Login
│       │   └── page.tsx        Landingpage
│       ├── components/         Wiederverwendbare UI-Komponenten
│       └── lib/                Auth, Prisma, Klassen, Punkte-Logik
└── preview/                    HTML-Prototyp (ohne Server)
```
