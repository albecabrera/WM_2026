# ⚽ WM 2026 Tipp-Spiel · BBG & ESG Bonn

**🇪🇸 [Español](#-español) · 🇩🇪 [Deutsch](#-deutsch)**

> 🌐 **https://wm.albertocabrera.de** · Frontend estático (Next.js) + Backend PHP 8.1 + SQLite

---

## 🇪🇸 Español

### ¿Qué es esto?

Juego de pronósticos (*Tipp-Spiel*) del Mundial 2026 para dos escuelas de Bonn:
el **BBG** (grupo Gelb) y la **Elisabeth-Selbert-Gesamtschule** (Klasse 4).
Alumnos y profesores pronostican los resultados de los 104 partidos y compiten
en una clasificación por clase.

> **🔒 Protección de datos:** solo se usan nombres de fantasía
> (`Rasenrakete`, `Sturmheld`, …). Nunca se introducen nombres reales,
> correos ni contraseñas. La asignación código ↔ alumno real queda
> **offline, en manos del profesor** (conforme al RGPD/DSGVO).

### Características

- 🔑 **Login con código** — sin contraseñas: cada alumno tiene un código tipo `rasenrakete-gelb`
- ⚽ **Pronósticos de los 104 partidos** — fase de grupos (12 grupos) + eliminatorias completas
- 🏆 **Pronóstico del campeón** — +5 puntos, se cierra al empezar el torneo
- 📊 **Clasificación en vivo** — individual y por clase, cada uno ve solo su clase
- 🥅 **Fase KO automática** — el ganador avanza solo en el cuadro; empate → penales manuales
- 🌐 **Auto-sync de resultados** — opcional, vía [football-data.org](https://www.football-data.org) (clave gratis)
- 🖨 **Listas de clase imprimibles** — con tarjetas recortables por alumno (código + QR)
- 🌙 **Modo oscuro/claro**, tutorial integrado y diseño responsive

### Sistema de puntos

| Acierto | Puntos |
|---|---|
| Resultado exacto (ej. 2:1 = 2:1) | **+3** |
| Diferencia de goles correcta | **+2** |
| Tendencia correcta (victoria/empate/derrota) | **+1** |
| Campeón del mundo acertado | **+5** |

Los pronósticos se cierran **5 minutos antes** de cada partido.

### Arquitectura

```
httpdocs/                       raíz del repo = document root (Apache/Plesk)
├── index.html, _next/, …       frontend compilado (export estático de Next.js)
├── .htaccess                   routing + bloqueo del código fuente
├── api/                        ⚙️ backend PHP 8.1
│   ├── index.php               router REST (/api/* → handlers)
│   ├── lib/                    DB (PDO SQLite), JWT, puntos, bracket KO, sync
│   ├── routes/                 un módulo por grupo de endpoints
│   └── cli/init.php            crea esquema + seed (usuarios, 48 equipos, 104 partidos)
├── app/                        🎨 código fuente del frontend (Next.js 14, TypeScript)
│   └── deploy.sh               build + deploy en un paso
└── preview/                    prototipo HTML original (sin servidor)

../wm-data/                     fuera del document root (no descargable, no en git)
├── config.php                  JWT_SECRET + FOOTBALL_API_KEY
└── wm.sqlite                   base de datos SQLite
```

La sesión es un **JWT (HS256) en cookie `httpOnly`**; el frontend valida el acceso
contra `GET /api/me`. El aislamiento por escuela/clase se decide **siempre en el
servidor** a partir del `classCode` de la sesión, nunca en el cliente.

### Deploy

Requisitos en el servidor: PHP ≥ 8.1 con PDO SQLite, Apache con `mod_rewrite`,
y Node 20 para compilar (en este servidor vive en `../.local/node20`).

```bash
# 1️⃣ Solo la primera vez: crear y seedear la base de datos
php api/cli/init.php            # se niega a sobrescribir una DB con datos
php api/cli/init.php --force    # reset total (⚠️ borra todos los pronósticos)

# 2️⃣ Configurar secretos (fuera del docroot): ../wm-data/config.php
#    'JWT_SECRET'        → openssl rand -hex 32
#    'FOOTBALL_API_KEY'  → clave gratis de football-data.org (opcional)

# 3️⃣ Compilar el frontend y desplegarlo en httpdocs/
app/deploy.sh
```

`deploy.sh` ejecuta `next build` (export estático) y copia `app/out/` a la raíz,
reemplazando `_next/` entero para no acumular chunks viejos. No hay ningún
proceso Node en producción: Apache sirve HTML estático y PHP responde `/api/*`.

### Códigos de acceso

| Rol | Código | Ámbito |
|---|---|---|
| Admin | `admin2026` | todo |
| Profesora BBG | `lehrerinca`, `lehrerow` | grupo Gelb |
| Profesora ESG | `lehrerinve`, `lehrerca` | Klasse 4 |
| Alumnos | `<nombrefantasía>-<clase>` (ej. `rasenrakete-gelb`) | su clase |

La lista completa imprimible está en **/klassenliste** (login de profesor o admin).

---

## 🇩🇪 Deutsch

### Worum geht es?

Tippspiel zur Fußball-WM 2026 für zwei Bonner Schulen: das **BBG** (Gruppe Gelb)
und die **Elisabeth-Selbert-Gesamtschule** (Klasse 4). Schülerinnen, Schüler und
Lehrkräfte tippen die Ergebnisse aller 104 Spiele und treten in einer
klassenbezogenen Rangliste gegeneinander an.

> **🔒 Datenschutz:** Es werden ausschließlich Phantasienamen verwendet
> (`Rasenrakete`, `Sturmheld`, …). Echte Namen, E-Mail-Adressen oder Passwörter
> werden niemals eingegeben oder gespeichert. Die Zuordnung Code ↔ echte/r
> Schüler/in bleibt **offline bei der Lehrkraft** (DSGVO-konform).

### Funktionen

- 🔑 **Login per Code** — keine Passwörter: jede/r Schüler/in hat einen Code wie `rasenrakete-gelb`
- ⚽ **Tipps für alle 104 Spiele** — Gruppenphase (12 Gruppen) + komplette K.-o.-Runde
- 🏆 **Weltmeister-Tipp** — +5 Punkte, schließt mit Turnierbeginn
- 📊 **Live-Rangliste** — einzeln und pro Klasse; jede/r sieht nur die eigene Klasse
- 🥅 **Automatische K.-o.-Phase** — Sieger rückt im Bracket automatisch vor; Unentschieden → Elfmeterschießen manuell
- 🌐 **Auto-Sync der Ergebnisse** — optional über [football-data.org](https://www.football-data.org) (kostenloser Schlüssel)
- 🖨 **Druckbare Klassenlisten** — mit ausschneidbaren Karten pro Schüler/in
- 🌙 **Dunkel-/Hellmodus**, eingebautes Tutorial, responsives Design

### Punktesystem

| Treffer | Punkte |
|---|---|
| Exaktes Ergebnis (z. B. 2:1 = 2:1) | **+3** |
| Richtige Tordifferenz | **+2** |
| Richtige Tendenz (Sieg/Unentschieden/Niederlage) | **+1** |
| Weltmeister richtig getippt | **+5** |

Abgabeschluss: **5 Minuten vor Anpfiff** jedes Spiels.

### Architektur

```
httpdocs/                       Repo-Root = Document-Root (Apache/Plesk)
├── index.html, _next/, …       kompiliertes Frontend (statischer Next.js-Export)
├── .htaccess                   Routing + Schutz des Quellcodes
├── api/                        ⚙️ PHP-8.1-Backend
│   ├── index.php               REST-Router (/api/* → Handler)
│   ├── lib/                    DB (PDO SQLite), JWT, Punkte, KO-Bracket, Sync
│   ├── routes/                 ein Modul pro Endpunkt-Gruppe
│   └── cli/init.php            Schema + Seed (Nutzer, 48 Teams, 104 Spiele)
├── app/                        🎨 Frontend-Quellcode (Next.js 14, TypeScript)
│   └── deploy.sh               Build + Deploy in einem Schritt
└── preview/                    ursprünglicher HTML-Prototyp (ohne Server)

../wm-data/                     außerhalb des Document-Root (nicht abrufbar, nicht im Repo)
├── config.php                  JWT_SECRET + FOOTBALL_API_KEY
└── wm.sqlite                   SQLite-Datenbank
```

Die Session ist ein **JWT (HS256) im `httpOnly`-Cookie**; das Frontend prüft den
Zugriff gegen `GET /api/me`. Die Schul-/Klassen-Isolation wird **immer serverseitig**
aus dem `classCode` der Session abgeleitet, nie im Client.

### Deployment

Voraussetzungen auf dem Server: PHP ≥ 8.1 mit PDO SQLite, Apache mit
`mod_rewrite`, Node 20 zum Bauen (auf diesem Server unter `../.local/node20`).

```bash
# 1️⃣ Nur beim ersten Mal: Datenbank anlegen und seeden
php api/cli/init.php            # verweigert das Überschreiben einer befüllten DB
php api/cli/init.php --force    # kompletter Reset (⚠️ löscht alle Tipps)

# 2️⃣ Secrets konfigurieren (außerhalb des Docroot): ../wm-data/config.php
#    'JWT_SECRET'        → openssl rand -hex 32
#    'FOOTBALL_API_KEY'  → kostenloser Schlüssel von football-data.org (optional)

# 3️⃣ Frontend bauen und nach httpdocs/ deployen
app/deploy.sh
```

`deploy.sh` führt `next build` (statischer Export) aus und kopiert `app/out/`
in den Root; `_next/` wird dabei komplett ersetzt, damit sich keine alten Chunks
ansammeln. In Produktion läuft **kein Node-Prozess**: Apache liefert statisches
HTML aus, PHP beantwortet `/api/*`.

### Zugangscodes

| Rolle | Code | Bereich |
|---|---|---|
| Admin | `admin2026` | alles |
| Lehrkraft BBG | `lehrerinca`, `lehrerow` | Gruppe Gelb |
| Lehrkraft ESG | `lehrerinve`, `lehrerca` | Klasse 4 |
| Schüler/innen | `<phantasiename>-<klasse>` (z. B. `rasenrakete-gelb`) | eigene Klasse |

Die vollständige, druckbare Liste gibt es unter **/klassenliste**
(Lehrkraft- oder Admin-Login).

---

## 🔌 API

| Método / Methode | Ruta / Route | Descripción / Beschreibung | Rol / Rolle |
|---|---|---|---|
| POST | `/api/auth` | Login con código / Login per Code | todos / alle |
| GET | `/api/auth/logout` | Logout (borra cookie / löscht Cookie) | todos / alle |
| GET | `/api/me` | Stats propios / eigene Stats (Punkte, Rang) | todos / alle |
| GET | `/api/matches` | Partidos / Spiele (`?phase=GROUP&group=A`) | todos / alle |
| GET | `/api/teams` | Los 48 equipos / alle 48 Teams | todos / alle |
| GET/POST | `/api/tips` | Pronósticos / Tipps | alumnos+profes / Schüler+Lehrer |
| GET/POST | `/api/tips/winner` | Pronóstico del campeón / Weltmeister-Tipp | alumnos+profes / Schüler+Lehrer |
| GET | `/api/leaderboard` | Clasificación / Rangliste (`?class=`) | todos / alle |
| GET | `/api/leaderboard/groups` | Clasificación por clase / Klassenrangliste | todos / alle |
| POST | `/api/results` | Resultado real + avance KO / Ergebnis + KO-Advance | admin, profes / Lehrer |
| POST | `/api/results/winner` | Revelar campeón / Weltmeister festlegen | admin, profes / Lehrer |
| GET/PUT | `/api/admin/ko` | Cuadro KO / KO-Bracket | admin, profes / Lehrer |
| POST | `/api/admin/advance` | Avance manual (penales) / manuell vorrücken (Elfmeter) | admin, profes / Lehrer |
| GET/POST | `/api/admin` | Listar/crear alumnos / Schüler auflisten/anlegen | admin (POST), profes (GET) |
| POST | `/api/admin/reset-code` | Resetear código / Login-Code zurücksetzen | admin, profes / Lehrer |
| GET | `/api/admin/klassenliste` | Lista de clase / Klassenliste | admin, profes / Lehrer |
| GET | `/api/admin/teachers` | Lista de profes / Lehrkräfte-Liste | admin, profes / Lehrer |
| GET / POST | `/api/sync` | Auto-sync (`POST ?force=1` fuerza / erzwingt) | todos / staff |

---

<sub>WM 2026 Tipp-Spiel · BBG & ESG Bonn · 11. Juni – 26. Juli 2026 · 🇺🇸 🇨🇦 🇲🇽</sub>
