# AGENTS.md — Echoes of Priya

A personal, romantic single-page experience (React + Vite) with a private two-person chat backed by Netlify Functions + Netlify Database.

## Architecture
- `src/main.tsx` → `App.tsx`: `MotionConfig(reducedMotion="user")` → `MusicProvider` → `WorldProvider` → `Shell`.
  `Shell` renders persistent layers (sky, `AmbientCanvas`, `ButterflyGarden`, routes, `FxCanvas`, `MusicPlayer`, `EasterEgg`).
  Music lives **above the router** so it never restarts across chapters or `/corner`.
- Routes: `/` → `pages/Experience.tsx` (3 chapters in `src/slides/`), `/corner` → `pages/Corner.tsx` (gate) → `components/chat/ChatRoom.tsx`, `*` → NotFound.
- Chapters are switched with `AnimatePresence` (not routes); state is kept in sessionStorage (`echoes:slide`, `echoes:entered`). Swipe + arrow keys + nav dots.
- `src/content.ts` holds **all user-facing copy**. Never hard-code copy in components.
- FX: `src/fx/fx.ts` is a tiny event bus (`fx.burst`, `fx.burstFrom`, `fx.rain`) consumed by `FxCanvas` (bursts + desktop cursor trail). `AmbientCanvas` draws fireflies/petals with a `level` prop. Sprites are pre-rendered in `fx/sprites.ts`.
- Music: `music/MusicContext.tsx` tries `content.music.src`; on failure falls back to the Web Audio `music/musicBox.ts`. Only started from user gestures.

## Backend
- `netlify/functions/chat.mts` at `/api/chat/*`: `POST session`, `GET messages?after=id`, `POST messages`, `POST typing`.
- Auth: `Authorization: Bearer <access code>`; role derived server-side from env `PRIYA_ACCESS_CODE` / `OWNER_ACCESS_CODE` (503 `not_configured` if missing).
- DB: Drizzle (`drizzle-orm@beta`, adapter `drizzle-orm/netlify-db`). Schema `db/schema.ts`; migrations in `netlify/database/migrations/` via `npx drizzle-kit generate --name <name>`. Never edit applied migrations.
- Client polling every 2.5s (12s when hidden) with optimistic sends — see `lib/chatApi.ts`.

## Conventions
- Plain CSS in `src/styles.css` with tokens at the top; glass = `.glass`. Animate transform/opacity only.
- Anything `position: fixed` rendered inside a slide must use a portal (slides use transforms/filters) — see `Modal.tsx`.
- Respect reduced motion; keep particle counts low on coarse pointers.
- Never add phone numbers / WhatsApp links; never ship secrets in frontend code.
