# WM 2026 Tipp-Spiel · ESG Bonn

Schul-Tipp-Spiel para la Fußball-Weltmeisterschaft 2026. Klassen 5 & 6.

## Estructura

```
WM_2026/
├── app/              Next.js 14 — App completo (full-stack)
├── preview/          Prototipo HTML standalone (sin servidor, abrir en browser)
└── PLAN.md           Roadmap con EPICs y User Stories
```

## Inicio rápido — Prototipo HTML

Abrir `preview/WM 2026 Tipp-Spiel v2.html` en el browser. Sin instalación.

## Inicio rápido — Next.js App

```bash
cd app
npm install
cp .env.example .env      # editar JWT_SECRET
npm run db:push
npm run db:seed
npm run dev               # http://localhost:3000
```

## Login codes

| Rol | Código |
|---|---|
| Admin | `admin2026` |
| Lehrer | `lehrer6a` |
| Schüler | `mueller6a` |

## Tech stack

- Next.js 14 (App Router)
- Prisma + SQLite
- JWT (cookies)
- Vercel (deployment)

## Roadmap

Ver [PLAN.md](./PLAN.md) — EPICs y User Stories ordenados por sprint.
