# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repo is a **prototype** (Next.js App Router) whose job is to validate UX with real COPACO
users before backend/infra investment. Read "Prototype vs. production scope" below before
assuming any pattern here should carry forward to a production build.

Two planning docs live in `docs/` and **disagree with each other**; `aguila-viajera-prd.md` is
the one to trust for scope, personas, acceptance criteria, and target stack — see
`docs/plan-desarrollo.md` §0 for the full conflict breakdown and why the PRD wins. Read the PRD
before implementing any feature; it's dated later and marked "listo para generar tickets"
(ready to generate tickets), i.e. it supersedes the earlier MVP doc.

The codebase is under **active, concurrent development** — expect files to change between
sessions in ways not described here yet (e.g. a Privy auth integration under `app/(auth)/` and
early blockchain/append-only-log scaffolding in `lib/types.ts` were both added mid-session and
are still evolving). Re-check a file's actual current content before assuming this doc is
exhaustive; treat this as a map of *stable, load-bearing* patterns, not a changelog.

## Commands

Run from the repo root (the Next.js project lives at the root, not in a subfolder):

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
  blockchain, no chatbot in this MVP (those live in the PRD's Fase 3 / post-MVP roadmap, not now).
- `docs/plan-desarrollo.md` — the development plan derived from the PRD: phases (-1 prototype, 0
  foundational, 1 MVP core, 2 institutional panel, 3 post-MVP), the doc-conflict resolution, and
  what's in/out of the current prototype.

## Prototype vs. production scope

The PRD recommends **Flutter/React Native** for the elderly-user mobile experience and a
**separate React+TS** panel for coordinators, backed by NestJS + PostgreSQL + phone/OTP auth
(PRD §4.1). This prototype deliberately does not follow that split: it's a single Next.js web app.
Core domain state (excursions, enrollments, health profiles) lives in a React Context in memory
(`lib/store.tsx`) with **no backend and no persistence** — it resets on full page reload. This was
a scoped decision to get a clickable prototype in front of COPACO fast; it is not a recommendation
to build production on Next.js instead of the PRD's stack. A separate, real auth integration
(Privy, under `app/(auth)/`) is being layered in alongside the demo role-switcher — the two are
not yet unified, so don't assume auth state and `useStore().currentUser` are the same thing
without checking.

## Architecture

- **Directory layout** (Next.js project root == repo root): `app/` (routes), `components/`
  (shared UI), `lib/` (domain types, seed data, the in-memory store), `public/images/` (real
  photo assets — see "Images" below).
- `lib/types.ts` — domain types: `Usuario` (role: adulto_mayor / familiar / coordinador),
  `PerfilSalud`, `Excursion`, `Inscripcion`. Also contains early, partially-wired groundwork for
  Épica C (append-only integrity: `EventoLog`, `AnclajeBlockchain`, `contentHash` fields) — this
  is Fase 3 territory per the PRD roadmap and not fully connected to the UI yet; don't assume it's
  load-bearing without checking `lib/store.tsx`.
- `lib/seed-data.ts` — fixed seed data (Elena Martínez as the elderly persona, Ana as her linked
  family member, Raúl Gómez as coordinator, Carmen Reyes, 3 seed excursions with a
  `descripcionLarga` marketing blurb each). All demo flows are built around these fixtures.
- `lib/store.tsx` — `StoreProvider`/`useStore()`: in-memory arrays + mutation functions
  (`inscribir`, `crearExcursion`, `guardarPerfilSalud`, `marcarAsistencia`, etc). No API routes, no
  DB. `currentUserId` simulates the demo role-switch — **switching it does not survive a full page
  navigation** (`router.push`/`<Link>` is fine; `page.goto()`/hard reload resets to the seed
  default). This has bitten Playwright verification scripts repeatedly — always navigate via
  clicks when testing a flow that depends on the selected demo user.
- **Routing**: `app/page.tsx` is the public **landing page** at `/` — no emoji anywhere on this
  page specifically (a deliberate, scoped request), animated (`useReveal()` IntersectionObserver
  pattern + counters), sections assembled in `LandingPage()` at the bottom of the file. Everything
  else lives under `app/(app)/` behind `app/(app)/layout.tsx`, which renders `Header` (top,
  desktop nav + user chip) and `BottomNav` (mobile tab bar — this is the **primary navigation**;
  the demo role-switcher lives behind its "Yo" tab, not in the header):
  - `app/(app)/excursiones/page.tsx` — excursion listing.
  - `app/(app)/excursiones/[id]/page.tsx` — detail + conditional accessibility alert + enrollment.
  - `app/(app)/coordinador/nueva-excursion/page.tsx` — 4-step excursion creation wizard.
  - `app/(app)/coordinador/excursiones/[id]/participantes/page.tsx` — participant panel with
    collapsible medical detail and check-in.
  - `app/(app)/perfil-salud/page.tsx` — segmented health profile form.
  - `app/(auth)/login/`, `app/(auth)/registro/` — Privy-backed auth flow, added by a parallel
    effort; not yet unified with the demo `useStore().currentUser` role switch.
- **Shared components** (`components/`): `Header`, `BottomNav`, `AccesibilidadBadge` (accepts
  `icon?: boolean` — pass `false` on emoji-free contexts), `PlaceholderImage`, `BackButton`.

## Images

Some real photo assets now exist under `public/images/` (`images/excursiones/ex-1.jpg` etc.,
`images/ui/hero.jpg`, `momento-1..4.jpg`, `coordinador.jpg`) and are rendered as plain `<img>`
tags where the content is static/known ahead of time (landing hero, seed excursion covers). For
anything **dynamic or user-specific with no pre-existing file** (a new excursion's cover photo
mid-creation in the wizard, a person's profile photo), use `components/PlaceholderImage.tsx`
instead of inventing a new inline placeholder — it renders a labeled dashed box marking where a
real image will go later. Don't silently swap a `PlaceholderImage` for a hardcoded `<img
src="/images/...">` unless the file actually exists in `public/`.

**Gotcha:** `PlaceholderImage` needs a fixed pixel size (e.g. a small circular avatar), pass the
`size` prop (renders inline `style`) — do **not** try to constrain it with a Tailwind class like
`w-16` or `rounded-full`. The component's base class (`.placeholder-image` in `globals.css`) is
plain, unlayered CSS, which in Tailwind v4's cascade always beats a `@layer utilities` class
regardless of source order or specificity. This already caused one real bug (an avatar rendering
at nearly full card width) — see the `size`/`shape` prop implementation for the fix pattern
(inline `style`, not `className`) before adding new placeholder variants.

## Design system

Tokens live in `app/globals.css` as CSS custom properties (`--color-primary`, `--color-accent`,
`--color-ink-soft`, `--radius-md`, `--shadow-md`, etc.) plus reusable component classes (`.card`,
`.btn-primary`/`.btn-secondary`/`.btn-accent`/`.btn-ghost-light`, `.badge*`, `.alert-box`/
`.success-box`/`.info-box`, `.step-number`, `.placeholder-image`) and an animation layer
(`.animate-*`/`.reveal*`/`.text-shimmer`/`.btn-glow`/`.card-gradient-border`, mostly used on the
landing page). Reach for an existing token/class before adding a new inline color.

- **Typography**: `Manrope` (body/UI, via `next/font/google` in `app/layout.tsx`, exposed as
  `--font-sans`) + `Playfair Display` (headings `h1`/`h2`/`h3`, exposed as `--font-display`) —
  deliberately chosen to read as less generic than a system-font stack while keeping body text
  highly legible at the 18px base size.
- **Contrast**: colors were tuned by computing actual WCAG contrast ratios (not eyeballed) after
  the palette shifted to sky-blue/amber — e.g. `--color-border` and `--color-ink-soft` were
  darkened, `--color-accent-dark` was darkened specifically because the raw `--color-accent`
  (amber) fails contrast as text/border on the light backgrounds used throughout. If you introduce
  a new color pairing, check contrast before shipping it — this user base needs AA/AAA, not just
  "looks fine to me."
- `Header` uses a **solid** (non-transparent) background deliberately — an earlier
  translucent/backdrop-blur version let scrolled content bleed through and hurt legibility.

## Accessibility non-negotiables (PRD §3.1)

18px base font size, ≥44px tap targets (all `.btn-*` classes, form inputs use `min-height: 52px`
in the newer pages), explicit two-step confirmation for irreversible actions (e.g. cancelling an
enrollment), visible-not-buried privacy notices next to health data capture, and — specifically —
**no emoji on the public landing page** (`app/page.tsx`) per an explicit product decision; emoji
remain fine as functional iconography on the internal app pages (mobility icons, badges, nav).

## Common bug pattern: nested `<a>` inside `<a>`

Cards that navigate to a detail page on click, but also contain a smaller inner link (e.g. an
excursion card linking to `/excursiones/[id]`, with a "Panel de participantes →" link inside it
for coordinators) are **not** valid HTML as `<Link><Link/></Link>` — browsers silently break the
inner link's clickability and React logs a hydration/nesting console error. Fix: make the *outer*
wrapper a `<div role="button" tabIndex={0} onClick={...} onKeyDown={...}>` using `useRouter` for
navigation, and keep the inner `<Link>` with `onClick={(e) => e.stopPropagation()}`. This has
recurred at least twice (landing excursion cards, `app/(app)/excursiones/page.tsx`'s
`ExcursionCard`) — check for it before wrapping any card-with-inner-link in a `<Link>`.

## Verifying changes

There's no test suite — verify UI changes by running `npm run dev` and driving flows in a browser
(headless via Playwright works well; no project-specific browser-driving skill exists yet in this
repo). Two things that will burn time if forgotten:
1. Switching the demo role only survives **client-side** navigation — use clicks, not `page.goto`.
2. If you delete `.next` while the dev server is still running, the server's cache goes stale and
   every route 500s until you kill and restart it (`pkill -f "next dev"` then `npm run dev`).
