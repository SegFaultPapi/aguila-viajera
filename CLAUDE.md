# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repo has a frontend-only, no-backend **prototype** under `app/` (Next.js) whose job is to
validate UX with real COPACO users before any backend/infra investment. It is not the production
codebase — read "Prototype vs. production scope" below before assuming any pattern here should
carry forward.

Two planning docs live in `docs/` and **disagree with each other**; `aguila-viajera-prd.md` is
the one to trust for scope, personas, acceptance criteria, and target stack — see
`docs/plan-desarrollo.md` §0 for the full conflict breakdown and why the PRD wins. Read the PRD
before implementing any feature; it's dated later and marked "listo para generar tickets"
(ready to generate tickets), i.e. it supersedes the earlier MVP doc.

## Commands

All commands run from `app/`:

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build (also runs the TypeScript check)
npm run lint     # ESLint (flat config, next/core-web-vitals + next/typescript)
npx tsc --noEmit # type-check only, no build output
```

There is no test suite yet — no `npm test` script exists.

## Docs map

- `docs/aguila-viajera-mvp.md` — earlier concept doc: narrative of the problem, and a wider
  product vision (blockchain acta registry, Privy auth, Claude chatbot). Useful for *why this
  project exists*, not for *what to build right now*.
- `docs/aguila-viajera-prd.md` — **the current source of truth**. Scopes the MVP down to a single
  module (Turismo Comunitario / community excursions), defines 4 epics with acceptance criteria
  (A: registration, B: excursion management, C: append-only integrity records, D: institutional
  dashboard), and recommends Flutter/RN + React+TS + NestJS + PostgreSQL + phone/OTP auth — no
  blockchain, no Privy, no chatbot in this MVP (those live in the PRD's Fase 3 / post-MVP
  roadmap, not now).
- `docs/plan-desarrollo.md` — the development plan derived from the PRD: phases (-1 prototype, 0
  foundational, 1 MVP core, 2 institutional panel, 3 post-MVP), the doc-conflict resolution, and
  what's in/out of the current prototype.

## Prototype vs. production scope

The PRD recommends **Flutter/React Native** for the elderly-user mobile experience and a
**separate React+TS** panel for coordinators, backed by NestJS + PostgreSQL + phone/OTP auth
(PRD §4.1). The prototype in `app/` deliberately does not follow that split: it's a single
Next.js web app with **no backend, no auth, and no persistence** (state lives in a React Context
in memory and resets on full page reload — see `app/lib/store.tsx`). This was a scoped decision
to get a clickable prototype in front of COPACO fast; it is not a recommendation to build
production on Next.js instead of the PRD's stack. That decision gets made after usability testing
(`docs/plan-desarrollo.md`, Fase 0).

## Architecture of the `app/` prototype

- `app/lib/types.ts` — domain types: `Usuario` (role: adulto_mayor / familiar / coordinador),
  `PerfilSalud`, `Excursion`, `Inscripcion`. These mirror the PRD's Épica A/B data shape, not a
  finalized DB schema.
- `app/lib/seed-data.ts` — fixed seed data (Elena Martínez as the elderly persona, Ana as her
  linked family member, Raúl Gómez as coordinator, 3 seed excursions). All demo flows are built
  around these fixtures.
- `app/lib/store.tsx` — `StoreProvider`/`useStore()`: the entire "backend" is a React Context with
  in-memory arrays and mutation functions (`inscribir`, `crearExcursion`, `guardarPerfilSalud`,
  `marcarAsistencia`, etc). No API routes, no DB. `currentUserId` simulates auth via a plain
  dropdown in the header — switching it does not persist across a hard navigation/reload, since
  there's no session storage. This is a known, accepted limitation of the prototype, not a bug to
  silently fix — if you add persistence, do it deliberately and update this section.
- Routing splits public marketing from the demo app via an App Router route group:
  - `app/app/page.tsx` — public **landing page** at `/` (no role switcher, no Header component).
    Own top bar (`TopBar`), hero, animated impact stats, "cómo funciona", role breakdown, live
    preview of upcoming excursions pulled from the store, trust section, coordinator CTA, footer.
    Uses an `IntersectionObserver`-driven `.reveal`/`.reveal-left`/`.reveal-right` scroll-in
    pattern (see `useReveal()` in this file and the keyframes in `globals.css`) — don't add new
    animated sections without registering them with the same classes or they'll silently render
    static.
  - `app/app/(app)/layout.tsx` — layout for the authenticated-feeling demo app: renders `Header`
    (logo, nav, the "Viendo como" role-switcher demo affordance) around all routes below.
  - `app/app/(app)/excursiones/page.tsx` — excursion listing (Flujo 1, steps 1-2).
  - `app/app/(app)/excursiones/[id]/page.tsx` — detail + conditional accessibility alert +
    enrollment (Flujo 1, steps 3-5). The alert logic lives inline in this page: it fires when the
    current user's `PerfilSalud.movilidad` isn't `independiente`/`no_aplica` AND the excursion has
    any accessibility obstacle, or when the excursion itself requires a companion.
  - `app/app/(app)/coordinador/nueva-excursion/page.tsx` — 4-step excursion creation wizard
    (Flujo 2).
  - `app/app/(app)/coordinador/excursiones/[id]/participantes/page.tsx` — participant panel with a
    collapsed-by-default medical detail view and a check-in checkbox (Flujo 4). Gated to the
    excursion's own coordinator via `currentUser.id === excursion.coordinadorId`.
  - `app/app/(app)/perfil-salud/page.tsx` — segmented health profile form (Flujo 3). Resolves
    "whose profile" via role: a `familiar` editing here edits the elderly user they're linked to
    (`cuidaA`), not their own profile.
- Design tokens live in `app/app/globals.css` as CSS custom properties (`--color-primary`,
  `--color-accent`, `--radius-md`, `--shadow-md`, etc.) plus reusable component classes
  (`.card`, `.btn-primary`/`.btn-secondary`/`.btn-accent`/`.btn-ghost-light`, `.badge*`,
  `.alert-box`/`.success-box`/`.info-box`, `.step-number`) and an animation layer (keyframes +
  `.animate-*`/`.reveal*`/`.text-shimmer`/`.card-gradient-border`/`.btn-glow` utilities used by the
  landing page). Reach for an existing token/class before adding a new inline color or one-off
  style — the accent/primary/ink-soft palette and shadow scale are meant to be reused everywhere,
  not just on the landing.
- Accessibility choices follow PRD §3.1 non-negotiables: 18px base font size, ≥44px tap targets
  (all `.btn-*` classes), explicit two-step confirmation for irreversible actions (e.g. cancelling
  an enrollment), and visible-not-buried privacy notices next to health data capture. The `Header`
  uses a solid (non-transparent) background deliberately — an earlier translucent/backdrop-blur
  version let scrolled page content bleed through and reduced legibility, which conflicts with the
  AA/AAA contrast requirement for this user base; don't reintroduce transparency there without
  re-checking contrast.

## Verifying changes

There's no test suite — verify UI changes by running `npm run dev` in `app/` and driving the four
flows above in a browser (or headless via Playwright/`chromium-cli`, which is how this prototype
was last verified — no project-specific browser-driving skill exists yet in this repo).
