# WM 2026 Tipp-Spiel · ESG Bonn

App de pronósticos para la Copa del Mundo 2026. Klassen 5 & 6, Elisabeth-Selbert-Gesamtschule Bonn.

## Estructura

```
WM_2026/
├── app/              Next.js 14 — App completo (full-stack)
│   ├── prisma/       Schema + seed (SQLite)
│   └── src/app/      App Router pages & API routes
├── preview/          Prototipo HTML standalone (sin servidor)
└── plan.md           Roadmap EPICs + plan de revisión
```

## Inicio rápido

```bash
cd app
npm install
cp .env.example .env          # editar JWT_SECRET con un valor aleatorio
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev                   # http://localhost:3000 (o 3001 si está ocupado)
```

> **JWT_SECRET**: cualquier string largo aleatorio, p. ej. `openssl rand -hex 32`

## Login codes de demo

| Rol      | Código       | Clase |
|----------|--------------|-------|
| Admin    | `admin2026`  | —     |
| Lehrer   | `lehrer6a`   | 6a    |
| Lehrer   | `lehrer5b`   | 5b    |
| Schüler  | `mueller6a`  | 6a    |
| Schüler  | `schmidt6a`  | 6a    |
| Schüler  | `bauer6b`    | 6b    |

## Funcionalidades

### Para alumnos
- Portada premium de bienvenida con estadísticas del torneo
- Login con código personal (sin contraseña)
- Tutorial paso a paso tras el login (alemán fácil para 5/6 grado)
- Banner fijo de aviso: tipear 5 min antes del pitido
- Pronósticos de fase de grupos (72 partidos)
- **Barra de progreso por grupo** ("3 von 6 getippt")
- Pronósticos de rondas KO (R32 → Final)
- Pronóstico del campeón del torneo (hasta el 11-Jun)
- Tabla de clasificación con puntos en tiempo real
- Actualización automática cada 30 segundos + toast de resultados
- Badge `● LIVE` en partidos en curso
- **Modo claro / oscuro** (toggle ☀️/🌙, se recuerda en localStorage)
- Diseño responsive (1 columna en móvil/tablet)

### Para maestros / admin
- Panel de administración con 5 pestañas
- Cargar resultados de grupos y KO
- **Auto-avance del bracket KO**: al cargar el resultado de un partido KO,
  el ganador pasa automáticamente a la siguiente ronda
- **Modal de penales**: si un partido KO termina empatado, aparece un modal
  para elegir quién ganó (prórroga/penales) y avanzar manualmente
- Semifinal: el ganador va al Final, el perdedor al partido por el 3er puesto
- Revelar campeón con pantalla de celebración + confeti
- Filtrar celebración por clase
- Ver códigos QR de cada alumno (para imprimir)
- **Resetear código de alumno con `#nombre`**: escribir `#Müller` en el panel → busca automáticamente → genera nuevo código único

### Reseteo de código (`#nombre`)
Desde el panel de admin, pestaña "Schüler verwalten":
1. Escribir `#` seguido del apellido del alumno (con o sin Umlaute)
2. Clic en "Suchen" — muestra el alumno con su código actual
3. Clic en "↺ Code ändern" — genera un nuevo código único

> Funciona con nombres alemanes: `#Müller` = `#Mueller` = `#muller`

## Puntuación

| Resultado | Puntos |
|-----------|--------|
| Resultado exacto (ej. 2-1 = 2-1) | +3 |
| Tordifferenz correcta (ej. 3-2 y tipé 2-1 → diff +1) | +2 |
| Tendencia correcta (victoria/empate/derrota) | +1 |
| Campeón correcto | +5 |

## API routes (reales)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth` | Login con código |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/me` | Stats del usuario (puntos, rank, tipps) |
| GET | `/api/matches?phase=GROUP` | Partidos por fase (GROUP, ROUND_OF_32, …) |
| GET | `/api/teams` | Los 48 equipos |
| POST | `/api/tips` | Guardar pronóstico de partido |
| GET/POST | `/api/tips/winner` | Ver/guardar pronóstico de campeón |
| GET | `/api/leaderboard` | Tabla de clasificación (`?class=6a` opcional) |
| POST | `/api/results` | (Admin/Lehrer) Cargar resultado + auto-avance KO |
| GET/PUT | `/api/admin/ko` | (Admin/Lehrer) Ver/asignar equipos KO |
| POST | `/api/admin/advance` | (Admin/Lehrer) Avance manual del ganador (penales) |
| GET/POST | `/api/admin` | (Admin/Lehrer) Listar/crear alumnos |
| POST | `/api/admin/reset-code` | (Admin/Lehrer) Buscar/resetear código de alumno |
| GET | `/api/admin/qr` | (Admin/Lehrer) Generar QR PNG de código |
| POST | `/api/results/winner` | (Admin/Lehrer) Revelar campeón + award puntos |
| GET | `/api/sync` | Auto-sync con la API de fútbol (throttle 5 min) |
| POST | `/api/sync?force=1` | (Admin/Lehrer) Forzar sync inmediato |

> Todos los endpoints admin devuelven `403 Keine Berechtigung` a alumnos.

## Bracket KO (auto-avance)

Al cargar el resultado de un partido KO en `/api/results`:

- **Victoria clara** → el ganador se asigna automáticamente al slot correcto del
  siguiente partido (R32 #73–88 → R16 #89–96 → QF #97–100 → SF #101–102 → Final #104).
- **Empate** → la respuesta trae `needsPenaltyWinner: true`; el admin elige el ganador
  en el modal y se llama `/api/admin/advance`.
- **Semifinales** (#101, #102) → ganador al Final (#104), perdedor al 3er puesto (#103).

## Auto-sync por internet (resultados automáticos)

La app puede actualizarse **sola** con los resultados reales de la WM 2026 — el maestro
no carga nada. Cuando alguien abre la app, se consulta una API de fútbol, se actualizan
marcadores y equipos que avanzan (octavos, cuartos, semis, final), y se recalculan los puntos.

**Cómo activarlo:**

1. Crear una clave gratis en <https://www.football-data.org/client/register>
2. Agregarla al `.env`:
   ```env
   FOOTBALL_API_KEY="tu-clave"
   ```
3. Reiniciar la app. Listo — en el panel admin aparece `🌐 Auto-Sync aktiv`.

**Cómo funciona:**
- `/api/sync` consulta `football-data.org` (competición `WC`), con **throttle de 5 min**.
- Lo dispara el cliente al abrir el dashboard/admin → cero acción del maestro.
- Equipos mapeados a alemán por código FIFA (`src/lib/teams-data.ts`); si falta uno,
  usa el nombre de la API + 🏳 como fallback.
- Partidos sincronizados por `externalId` (estable). Al primer import, los partidos
  placeholder sin tipps se borran.
- **Sin clave**, la app sigue funcionando en modo manual (cargar resultados a mano).

> Variables opcionales: `FOOTBALL_API_BASE` (default v4), `FOOTBALL_API_COMPETITION` (default `WC`).
> Para sync aunque nadie esté online: agregar un cron (Vercel Pro) o GitHub Action que
> haga `GET /api/sync` cada 10 min.

## Variables de entorno

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-secreto-aqui"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
# Opcional — activa el auto-sync de resultados:
FOOTBALL_API_KEY="clave-de-football-data.org"
```

## Tech stack

- **Next.js 14** — App Router, Server Components
- **Prisma 5** + **SQLite** — ORM + base de datos local
  > Nota: SQLite no soporta `enum`; los roles/fases/estados son `String`.
- **JWT** via `jsonwebtoken` + `cookies-next`
- **QR codes** via `qrcode` npm package
- **Tema claro/oscuro** — CSS custom properties + `[data-theme]` en `<html>`

## Deployment (Vercel)

El `vercel.json` en la raíz configura el build desde el subdirectorio `app/`:

```json
{
  "buildCommand": "cd app && npm install && npm run build",
  "outputDirectory": "app/.next",
  "framework": "nextjs"
}
```

Agregar en Vercel las mismas variables de entorno del `.env`.

## CI

GitHub Actions (`ci.yml`) corre `tsc --noEmit` en cada push/PR a `main`.
