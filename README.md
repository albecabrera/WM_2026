# WM 2026 Tipp-Spiel · BBG & ESG Bonn

Schulinternes Tipp-Spiel zur FIFA WM 2026 für das **BBG** (Gruppe Gelb) und die **Elisabeth-Selbert-Gesamtschule** (Klasse 4). Schüler und Lehrkräfte tippen Spielergebnisse und treten gegeneinander an.

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

Die App läuft als **statisches Frontend (Next.js Export) + PHP-Backend** auf diesem Server
(Plesk, PHP 8.1). `httpdocs/` ist zugleich Repo-Root und Document-Root.

```bash
# Datenbank initialisieren / neu seeden (ACHTUNG: --force löscht alle Tipps!)
php api/cli/init.php          # legt wm-data/wm.sqlite an (außerhalb von httpdocs)

# Frontend neu bauen + deployen (Node 20 liegt lokal unter ../.local/node20)
app/deploy.sh
```

Secrets (`JWT_SECRET`, `FOOTBALL_API_KEY`) liegen in `../wm-data/config.php` —
außerhalb des Document-Root, nicht im Repo.

---

## Login-Codes

### Admin

| Code        | Beschreibung |
|-------------|-------------|
| `admin2026` | Zugang zum vollständigen Admin-Panel |

---

### BBG — Lehrkräfte (Gruppe Gelb)

| Name     | Code          |
|----------|---------------|
| Cabrera  | `lehrerinca`  |
| Owji     | `lehrerow`    |

### BBG — Schüler-Beispiele (Gruppe Gelb)

Codes haben das Format `{phantasiename}-gelb`, z.B. `rasenrakete-gelb`.  
Vollständige Liste (30 Codes) in `prisma/seed.ts`.

---

### ESG — Lehrkräfte (Klasse 4)

| Name     | Code           |
|----------|----------------|
| Venedey  | `lehrerinve`   |
| Cabrera  | `lehrerca`     |

### ESG — Schüler-Beispiele (Klasse 4)

Codes haben das Format `{phantasiename}-k4`, z.B. `sturmheld-k4`.  
Vollständige Liste (30 Codes) in `prisma/seed.ts`.

---

## Funktionsübersicht

| # | Funktion | Beschreibung | Rollen |
|---|----------|-------------|--------|
| 1 | **3-Schritt-Login** | Schule klicken → Rolle wählen (Schüler/Lehrkraft) → persönlichen Code eingeben | Alle |
| 2 | **Klassen-Isolation** | Schüler/Lehrer sehen nur die eigene Klasse in Rangliste & Dashboard | Alle |
| 3 | **Dashboard** | Übersicht: Punkte, Rang, Tipps; Tutorial-Modal für Erstbesucher | Schüler, Lehrer |
| 4 | **Gruppen-Tipps** | Tippen auf alle 104 WM-Spiele (Heim/Auswärts) — gesperrt 5 Min. vor Anpfiff | Schüler, Lehrer |
| 5 | **Fortschrittsbalken** | Zeigt „X von Y getippt" pro Gruppe | Schüler, Lehrer |
| 6 | **Weltmeister-Tipp** | Einmaliger Tipp auf den WM-Sieger (+5 Punkte) bis Turnierbeginn | Schüler, Lehrer |
| 7 | **KO-Runden** | Anzeige R32 → R16 → QF → SF → Finale mit Live-Ergebnissen | Schüler, Lehrer |
| 8 | **Live-Badge** | `● LIVE` bei laufenden Spielen; automatische Aktualisierung alle 30 Sek. | Alle |
| 9 | **Rangliste — Einzelwertung** | Punkte-Rangliste der eigenen Klasse; Top-3-Podium; Admin sieht alle | Alle |
| 10 | **Rangliste — Gruppenwertung** | Klassenrangliste mit Gesamtpunkten, Durchschnitt, bestem Spieler | Alle |
| 11 | **Hell-/Dunkel-Modus** | Toggle ☀️/🌙; wird in `localStorage` gespeichert | Alle |
| 12 | **Admin — Ergebnisse** | Spielergebnisse manuell eintragen + automatische Punkteberechnung | Admin |
| 13 | **Admin — KO-Bracket** | Teams manuell einsetzen; Auto-Advance nach jedem Ergebnis | Admin |
| 14 | **Admin — Elfmeterschießen** | Bei Unentschieden im KO: Gewinner-Modal → manueller Advance | Admin |
| 15 | **Admin — Turniersieger** | WM-Gewinner offiziell setzen → +5-Punkte-Berechnung für alle | Admin |
| 16 | **Admin — Schüler verwalten** | Neue Phantasienamen anlegen, Codes einsehen | Admin |
| 17 | **Admin — Code-Reset** | Vergessenen Code via `#Name` suchen und neu generieren | Admin |
| 18 | **Admin — QR-Codes** | QR-Code pro Login-Code generieren (zum Ausdrucken/Aushängen) | Admin |
| 19 | **Admin — Gesamtübersicht** | Admin sieht alle Klassen (Gelb + K4) ohne Einschränkung | Admin |
| 20 | **Klassenliste (Druck)** | Druckbare Liste: Klasse → Lehrkräfte → Schüler + **ausschneidbare Schüler-Karten** (Name-Zeile + Code + Klasse); PDF-Export | Admin, Lehrer |
| 21 | **Auto-Sync** | Server holt WM-Ergebnisse automatisch von `football-data.org` (Server→Server, kein Browser) | — |
| 22 | **Celebrations-Seite** | Siegerehrung mit Animation und Konfetti nach Turnierende | Admin |
| 23 | **Datenschutzseite** | Vollständige DSGVO-Erklärung unter `/datenschutz` | Alle (öffentlich) |

---

## WM 2026 Gruppen (offizielles Sortiment — FIFA, 5. Dez. 2025)

| Gruppe | Team 1 | Team 2 | Team 3 | Team 4 |
|--------|--------|--------|--------|--------|
| **A** | 🇲🇽 Mexiko | 🇿🇦 Südafrika | 🇰🇷 Südkorea | 🇨🇿 Tschechien |
| **B** | 🇨🇦 Kanada | 🇧🇦 Bosnien-H. | 🇶🇦 Katar | 🇨🇭 Schweiz |
| **C** | 🇧🇷 Brasilien | 🇲🇦 Marokko | 🇭🇹 Haiti | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Schottland |
| **D** | 🇺🇸 USA | 🇵🇾 Paraguay | 🇦🇺 Australien | 🇹🇷 Türkei |
| **E** | 🇩🇪 Deutschland | 🇨🇼 Curaçao | 🇨🇮 Elfenbeinküste | 🇪🇨 Ecuador |
| **F** | 🇳🇱 Niederlande | 🇯🇵 Japan | 🇸🇪 Schweden | 🇹🇳 Tunesien |
| **G** | 🇧🇪 Belgien | 🇪🇬 Ägypten | 🇮🇷 Iran | 🇳🇿 Neuseeland |
| **H** | 🇪🇸 Spanien | 🇨🇻 Kap Verde | 🇸🇦 Saudi-Arabien | 🇺🇾 Uruguay |
| **I** | 🇫🇷 Frankreich | 🇸🇳 Senegal | 🇮🇶 Irak | 🇳🇴 Norwegen |
| **J** | 🇦🇷 Argentinien | 🇩🇿 Algerien | 🇦🇹 Österreich | 🇯🇴 Jordanien |
| **K** | 🇵🇹 Portugal | 🇨🇩 DR Kongo | 🇺🇿 Usbekistan | 🇨🇴 Kolumbien |
| **L** | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England | 🇭🇷 Kroatien | 🇬🇭 Ghana | 🇵🇦 Panama |

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
| **Next.js** | 14.2 | React-Framework — App Router, statischer Export (`output: 'export'`) |
| **React** | 18 | UI-Bibliothek |
| **TypeScript** | 5 | Typsicherheit |
| **CSS (plain)** | — | Styling via CSS-Variablen + `globals.css` — kein Tailwind, kein CSS-in-JS |
| **qrcode** | 1.5 | QR-Code-Generierung im Browser (lokal, kein Drittdienst) |

### Backend / API

| Technologie | Version | Zweck |
|-------------|---------|-------|
| **PHP** | 8.1 | REST-Endpunkte unter `api/` (Router + Route-Handler) |
| **PDO SQLite** | — | Datenbankzugriff — DB-Datei `../wm-data/wm.sqlite`, kein externer DB-Server |
| **JWT (HS256)** | — | Eigene Implementierung in `api/lib/bootstrap.php`, Session als `httpOnly`-Cookie |
| **cURL** | — | Auto-Sync gegen football-data.org |

### Fonts (self-hosted)

| Font | Datei | Zweck |
|------|-------|-------|
| **Bebas Neue** | `public/fonts/bebas-neue-latin.woff2` | Display-Font (Titel, Zahlen) |
| **DM Sans** (Variable) | `public/fonts/dm-sans-latin.woff2` | Body-Font (400–700) |
| **DM Sans Ext** | `public/fonts/dm-sans-latin-ext.woff2` | Erweiterte Zeichensätze |

### Architekturmuster

- **Statisches Frontend + PHP-API** — Next.js-Export liefert reines HTML/JS, alle Daten kommen per `fetch('/api/…')` vom PHP-Backend auf derselben Domain
- **Client-seitige Guards** — `AuthGuard` prüft die Session gegen `/api/me` (Cookie ist `httpOnly`, für JS unlesbar)
- **REST** — einfache `GET/POST`-Endpunkte
- **JWT + `httpOnly`-Cookie** — Session ohne `localStorage`-Token
- **Schul-Isolation** — Schule wird serverseitig (PHP) aus `classCode` abgeleitet (`get_school()`), nie vom Client

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
| GET | `/api/admin/klassenliste` | Klassenliste (Lehrer: eigene Klasse) | Admin, Lehrer |
| GET | `/api/admin/teachers` | Lehrkräfte-Liste (für Lehrerhandbuch) | Admin, Lehrer |
| GET | `/api/sync` | Auto-Sync-Status + Sync auslösen | Alle |
| POST | `/api/sync?force=1` | Sofort-Sync erzwingen | Admin, Lehrer |

---

## Deployment

Die App läuft produktiv unter **https://wm.albertocabrera.de** (Plesk, Apache + PHP 8.1).
EU-Server, Daten bleiben auf dem eigenen Hosting — DSGVO-konform.

```bash
# 1. Frontend bauen + nach httpdocs/ kopieren
app/deploy.sh

# 2. Datenbank (nur beim ersten Mal oder zum Zurücksetzen)
php api/cli/init.php           # weigert sich, eine befüllte DB zu überschreiben
php api/cli/init.php --force   # kompletter Reset (löscht alle Tipps!)
```

Routing übernimmt `.htaccess`: `/api/*` → PHP-Router (`api/index.php`),
alles andere wird als statische Datei ausgeliefert. Quellcode (`app/`),
Repo-Dateien und `.git` sind per 403 gesperrt.

---

## Konfiguration

Liegt in `/var/www/vhosts/wm.albertocabrera.de/wm-data/config.php`
(außerhalb des Document-Root, nicht im Repo):

```php
return [
    'JWT_SECRET' => 'min-32-zeichen-langer-zufallsstring',   // openssl rand -hex 32

    // Optional — aktiviert automatischen WM-Ergebnis-Sync
    'FOOTBALL_API_KEY' => 'schluessel-von-football-data.org',
];
```

Die SQLite-Datenbank liegt daneben: `wm-data/wm.sqlite`.

---

## Projektstruktur

```
httpdocs/                       Repo-Root = Document-Root
├── index.html, _next/, …       Statischer Next.js-Export (Build-Artefakte)
├── .htaccess                   Routing + Schutz von Quellcode/Repo-Dateien
├── api/                        PHP-Backend
│   ├── index.php               Router (/api/* → Route-Handler)
│   ├── .htaccess               Rewrite auf den Router
│   ├── lib/                    DB, JWT/Session, Punkte, Klassen, Bracket, football-data
│   ├── routes/                 Ein Handler-Modul pro Endpunkt-Gruppe
│   └── cli/init.php            Schema + Seed (Nutzer, 48 Teams, 104 Spiele)
├── app/                        Frontend-Quellcode (Next.js)
│   ├── deploy.sh               Build + Deploy nach httpdocs/
│   ├── public/fonts/           Self-hosted Webfonts (DSGVO)
│   └── src/
│       ├── app/                App Router (alle Seiten client-seitig)
│       ├── components/         AuthGuard, ThemeProvider, QuickLogin, …
│       └── lib/                Klassen- und Punkte-Logik (client)
└── preview/                    HTML-Prototyp (ohne Server)

../wm-data/                     Außerhalb des Document-Root
├── config.php                  JWT_SECRET, FOOTBALL_API_KEY
└── wm.sqlite                   SQLite-Datenbank
```
