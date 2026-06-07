# WM 2026 Tipp-Spiel · ESG Bonn

App de pronósticos para la Copa del Mundo 2026. Klassen 5 & 6, Elisabeth-Selbert-Gesamtschule Bonn.

## Estructura

```
WM_2026/
├── app/              Next.js 14 — App completo (full-stack)
│   ├── prisma/       Schema + seed (SQLite)
│   └── src/app/      App Router pages & API routes
├── preview/          Prototipo HTML standalone (sin servidor)
└── PLAN.md           Roadmap EPICs & User Stories
```

## Inicio rápido

```bash
cd app
npm install
cp .env.example .env          # editar JWT_SECRET con un valor aleatorio
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev                   # http://localhost:3000
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
- Portada premium de bienvenida con conteo de participantes
- Login con código personal (sin contraseña)
- Pronósticos de fase de grupos (72 partidos)
- Pronósticos de rondas KO (R32 → Final)
- Pronóstico del campeón del torneo (hasta el 11-Jun)
- Tabla de clasificación con puntos en tiempo real
- Actualización automática cada 30 segundos
- Badge `● LIVE` en partidos en curso

### Para maestros / admin
- Panel de administración con 5 pestañas
- Cargar resultados de grupos y KO
- Asignar equipos a brackets KO
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
| Tendencia correcta (ej. 2-1 → cualquier victoria local) | +1 |
| Empate correcto (sin exacto) | +1 |
| Campeón correcto | +5 |

## API routes

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login con código |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/me` | Stats del usuario (puntos, rank, tipps) |
| GET | `/api/matches` | Partidos de grupos |
| GET | `/api/matches/ko` | Partidos KO |
| POST | `/api/tips` | Guardar pronóstico |
| GET/POST | `/api/tips/winner` | Ver/guardar pronóstico de campeón |
| GET | `/api/results` | Tabla de clasificación |
| GET | `/api/teams` | Los 48 equipos |
| POST | `/api/admin/results` | (Admin) Cargar resultado de partido |
| GET/PUT | `/api/admin/ko` | (Admin) Ver/asignar equipos KO |
| POST | `/api/admin/reset-code` | (Admin) Buscar/resetear código de alumno |
| GET | `/api/admin/qr` | (Admin) Generar QR PNG de código |
| POST | `/api/results/winner` | (Admin) Revelar campeón + award puntos |

## Variables de entorno

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-secreto-aqui"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Tech stack

- **Next.js 14** — App Router, Server Components, Server Actions
- **Prisma 5** + **SQLite** — ORM + base de datos local
- **JWT** via `jsonwebtoken` + `cookies-next`
- **QR codes** via `qrcode` npm package
- **Vercel** — deployment con `vercel.json` en raíz

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
