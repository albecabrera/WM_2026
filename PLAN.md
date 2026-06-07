# WM 2026 Tipp-Spiel — Roadmap

Tipp-Spiel para la WM 2026. Stack: Next.js 14, Prisma + SQLite, JWT.
Escuela: ESG Bonn, Klassen 5 & 6.

---

## Estado actual

| Componente | Estado |
|---|---|
| Login por código | ✅ Listo |
| Dashboard Schüler (Fase de Grupos) | ✅ Listo |
| Rangliste / Leaderboard | ✅ Listo |
| Admin panel (resultados + alumnos) | ✅ Listo |
| Prototipo HTML standalone (sin servidor) | ✅ Listo |
| Fase KO en Next.js | ⏳ Pendiente |
| Predicción del campeón | ⏳ Pendiente |
| Pantalla de celebración | ⏳ Pendiente |
| Real-time updates | ⏳ Pendiente |
| Deployment Vercel | ⏳ Pendiente |

---

## EPIC 1 — Fase de Grupos Completa (MVP)

**Objetivo:** Todos los alumnos pueden tipear todos los partidos de grupos, ver puntos en tiempo real y consultar la rangliste.

**Referencia:** Ya implementado en el prototipo HTML (`preview/`). Migrar lógica a Next.js completo.

### User Stories

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E1-US1 | Como alumno quiero hacer login con mi código personal | Redirige a /dashboard; código incorrecto muestra error rojo |
| E1-US2 | Como alumno quiero ver todos los partidos de grupo A–L organizados por tabs | 12 tabs, carga partidos al cambiar tab |
| E1-US3 | Como alumno quiero ingresar mi tipp (marcador) para cada partido | Input numérico; se guarda con POST /api/tips; badge "Gespeichert" aparece |
| E1-US4 | Como alumno quiero ver mis puntos actuales y mi posición en ranking | Stats cards: Punkte / Platz / Tipps abgegeben |
| E1-US5 | Como alumno quiero ver el ranking de mi clase sin salir del dashboard | Mini-rangliste en sidebar (top 10) |
| E1-US6 | Como admin quiero ingresar resultados reales partido por partido | Input + botón "Ergebnis speichern"; recalcula puntos automáticamente |
| E1-US7 | Como admin quiero agregar nuevos alumnos y ver su código generado | Formulario: apellido + clase → código automático (ej. mueller6a) |

---

## EPIC 2 — Fase KO / Rondas de Eliminación

**Objetivo:** Extender el juego a la fase eliminatoria (R32 → R16 → QF → SF → Final).

**Referencia:** Componente `ko-rounds.jsx` ya existe en el prototipo HTML.

### Pasos de implementación

1. Agregar `phase: KO_R32 | KO_R16 | QF | SF | FINAL` al schema Prisma
2. Seedear los 64 partidos KO con bracket vacío
3. Crear `/dashboard/ko` page con el bracket visual
4. Reutilizar lógica de puntaje (exakt/Tordifferenz/Tendenz) para KO
5. Admin puede avanzar equipos al siguiente round automáticamente

### User Stories

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E2-US1 | Como alumno quiero ver el bracket KO completo | Bracket visual con 8 rounds, equipos se actualizan al avanzar |
| E2-US2 | Como alumno quiero tipear el marcador de cada partido KO | Mismo UI que fase grupos; tipp bloqueado < 5 min antes del partido |
| E2-US3 | Como admin quiero ingresar el resultado de un partido KO y avanzar al ganador | Al guardar resultado: ganador aparece automáticamente en siguiente round |
| E2-US4 | Como alumno quiero ver mis puntos KO por separado de los de grupos | Tab "Gruppen" / "KO" en el dashboard |

---

## EPIC 3 — Predicción del Campeón

**Objetivo:** Antes del torneo, cada alumno elige quién gana la WM → +5 puntos si acierta.

**Referencia:** Componente `winner-tip.jsx` ya existe en el prototipo HTML.

### Pasos de implementación

1. Campo `winnerTip: String?` en modelo `User` (Prisma)
2. API `POST /api/tips/winner` — solo acepta si torneo no empezó (fecha < 11-Jun-2026)
3. UI: card especial en dashboard antes del inicio → dropdown de 48 equipos
4. Admin revela el campeón → `PUT /api/results/winner` → puntos se aplican

### User Stories

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E3-US1 | Como alumno quiero elegir quién gana la WM antes del 11 Jun 2026 | Dropdown de 48 equipos; guarda con confirmación; no editable después |
| E3-US2 | Como admin quiero revelar el campeón y distribuir los +5 puntos | Botón "Turniersieger bekannt geben" en Admin; aplica puntos a quienes acertaron |
| E3-US3 | Como alumno quiero ver si acerté el campeón en mi perfil | Badge dorado "Turniersieger ✓" en el dashboard si acertó |

---

## EPIC 4 — Pantalla de Celebración

**Objetivo:** Al revelar el ganador del torneo o de la clase, mostrar una animación de celebración.

**Referencia:** Componente `celebration.jsx` ya existe en el prototipo HTML.

### Pasos de implementación

1. Crear `/celebration` page en Next.js
2. Migrar animaciones CSS del prototipo (confetti, brillos)
3. Admin trigger: botón en panel → redirige a celebración con datos del ganador
4. Opcional: pantalla proyectable para mostrar en clase

### User Stories

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E4-US1 | Como admin quiero activar la pantalla de celebración con el ganador del torneo | Botón en Admin Panel → /celebration?winner=ID → animación fullscreen |
| E4-US2 | Como admin quiero celebrar al ganador de mi clase específicamente | Filtro por clase antes de celebrar; muestra nombre + puntos + clase |
| E4-US3 | La pantalla de celebración funciona en proyector (16:9, fullscreen) | Layout landscape optimizado; botón ESC/cerrar accesible |

---

## EPIC 5 — Real-time & Live Updates

**Objetivo:** Los puntos y resultados se actualizan sin recargar la página durante los partidos en vivo.

### Pasos de implementación

1. Evaluar SSE (Server-Sent Events) vs polling cada 30s
2. Hook `useInterval` en dashboard para refetch automático
3. Indicador visual "Live" cuando hay partido en curso
4. Toast notification cuando se publica un resultado nuevo

### User Stories

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E5-US1 | Como alumno quiero que mi puntuación se actualice automáticamente | Sin recargar; actualiza cada 30s durante partidos en vivo |
| E5-US2 | Como alumno quiero recibir una notificación cuando se publique un resultado | Toast "🔴 Ergebnis: GER 2:1 NED — Deine Tipps wurden bewertet" |
| E5-US3 | Como alumno quiero ver un indicador cuando hay un partido en vivo | Badge "LIVE" parpadeante en el match card correspondiente |

---

## EPIC 6 — Mejoras Admin

**Objetivo:** Hacer que la administración del torneo sea más eficiente para el profesor.

### User Stories

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E6-US1 | Como admin quiero ingresar múltiples resultados a la vez (bulk entry) | Form con todos los partidos del día; guardar todo con un botón |
| E6-US2 | Como admin quiero exportar la rangliste a PDF para imprimir | Botón "PDF exportieren" → documento A4 con ranking + puntos |
| E6-US3 | Como admin quiero generar un QR code por alumno con su login code | QR generado en browser; imprimible en PDF de clase |
| E6-US4 | Como admin quiero ver estadísticas: tipp accuracy por partido | Tabla: % de alumnos que acertaron exacto/tendencia/nada por partido |
| E6-US5 | Como admin quiero filtrar la rangliste por clase | Tabs 5a / 5b / 6a / 6b / Todas |

---

## EPIC 7 — Deployment & Producción

**Objetivo:** App desplegada en Vercel con base de datos persistente para toda la temporada.

### Pasos de implementación

1. Migrar SQLite → Supabase (PostgreSQL) para Vercel
2. Variables de entorno en Vercel: DATABASE_URL, JWT_SECRET
3. CI: GitHub Actions → lint + type-check en cada PR
4. Dominio custom (opcional): `wm2026.esg-bonn.de`

### User Stories

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E7-US1 | Como admin quiero que la app esté disponible desde cualquier dispositivo | URL pública en Vercel; accesible sin VPN |
| E7-US2 | Como admin quiero que los datos persistan aunque el servidor se reinicie | Supabase PostgreSQL; no SQLite en Vercel filesystem |
| E7-US3 | Como dev quiero que cada push a main pase type-check antes de deployar | GitHub Actions: `tsc --noEmit` → bloqueante en PR |

---

## Prioridad de Implementación

```
Sprint 1 (antes del 11-Jun-2026):
  ✅ EPIC 1 — MVP grupos completo
  EPIC 3 — Predicción del campeón (¡deadline 11-Jun!)
  EPIC 7 — Deployment Vercel

Sprint 2 (durante grupos 11-Jun → 2-Jul):
  EPIC 6 — Mejoras Admin
  EPIC 5 — Real-time updates

Sprint 3 (fase KO 4-Jul → 19-Jul):
  EPIC 2 — Fase KO
  EPIC 4 — Celebración
```

---

## Puntos del sistema

| Resultado | Puntos |
|---|---|
| Exaktes Ergebnis | +3 |
| Tordifferenz stimmt | +2 |
| Tendenz stimmt (sieg/unentschieden/niederlage) | +1 |
| Turniersieger richtig | +5 |

**Abgabeschluss:** 5 Minutos antes del pitido inicial.

---

# Revisión completa — 2026-06-07

## Auditoría (verificado en vivo, puerto 3000)

| Área | Estado |
|------|--------|
| Login (Admin/Lehrer/Schüler) | ✅ funciona |
| 48 equipos · 72 grupos · 32 KO | ✅ |
| Auto-advance KO (ganador → siguiente ronda) | ✅ probado (CAN → #89) |
| Empate KO → modal penales → advance manual | ✅ probado (MEX → #89) |
| Semifinal: ganador→Final, perdedor→3er puesto | ✅ lógica correcta |
| Guards de seguridad (alumno 403 en admin) | ✅ probado |
| Dark/Light, tutorial, banner 5-min, fondos | ✅ |
| tsc --noEmit | ✅ sin errores |

## Cambios obligatorios (correcciones)

- [x] **C1 · README sync** — rutas API reales + features nuevas documentadas.
- [x] **C2 · Bug responsive móvil** — grid movido a `.dashboard-grid` en `<style>`,
  media query `<768px` → 1 columna, sidebar pasa a `position: static`.

## Mejoras UI/UX aplicadas

- [x] **M1 · Textos tutorial más cortos** — 5 pasos reescritos en frases cortas,
      una idea por línea, alemán fácil para 5/6 grado.
- [x] **M2 · Barra de progreso por grupo** — "X von 6 getippt" + barra que se pone
      verde al completar el grupo.
- [x] **M3 · Estado vacío más amigable** — dashboard, leaderboard y KO con mensajes
      claros y simpáticos.

## Decisiones del usuario

- Aplicar los 4 cambios + actualizar README. ✅ Hecho.

---

# Auto-sync por internet — 2026-06-07

Objetivo: actualizar resultados/avances automáticamente, maestro no carga nada.

- [x] Schema: `externalId` en Team/Match, `matchNumber` nullable, modelo `SyncState`.
- [x] `lib/teams-data.ts` — mapeo código FIFA → nombre alemán + bandera (+fallback).
- [x] `lib/football-api.ts` — cliente football-data.org (v4, competición WC), normaliza
      stage/status/grupo/marcador/equipos.
- [x] `/api/sync` — upsert por externalId, recálculo de puntos, throttle 5 min,
      graceful sin clave. `force` solo staff.
- [x] Auto-trigger cliente en dashboard + admin (cero acción maestro).
- [x] Indicador `🌐 Auto-Sync aktiv` / `⚙️ aus` en el panel admin.
- [x] README documentado (clave gratis football-data.org).

Pendiente real: solo se puede probar en vivo desde el 11-Jun (datos del torneo).
Requiere que el usuario cree la clave gratis y la ponga en `.env` como `FOOTBALL_API_KEY`.

## Otras mejoras aplicadas

- [x] `.gitignore`: `next-env.d.ts`, `*.tsbuildinfo`.
- [x] Aviso si `JWT_SECRET` usa fallback en producción.

