# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository currently contains **no application code** — only a product/MVP spec at
`docs/aguila-viajera-mvp.md`. The `.gitignore` is pre-configured for a Next.js/Node project,
indicating that's the intended stack, but no `package.json`, source tree, or build tooling exists
yet. There are no build, lint, or test commands to run at this stage.

When scaffolding the project for the first time, follow the stack and architecture below rather
than inventing a different structure, and update this file with real commands (`npm run dev`,
`npm test`, etc.) as soon as they exist.

## What this project is

**Águila Viajera** is a community platform for **COPACO**, a volunteer group in Iztapalapa, CDMX
that organizes excursions for elderly adults. Today COPACO coordinates everything over WhatsApp
with no health records and no tamper-proof record of the official documents ("actas") they
produce — the local government has previously erased/appropriated their records. The platform
must fix three things at once: an accessible registration/enrollment flow for elderly users, a
health-profile system for trip safety, and a blockchain-backed, publicly verifiable record of
each acta.

Full spec (flow, features, out-of-scope list, success criteria): `docs/aguila-viajera-mvp.md`.
Read it before implementing any feature — it is the source of truth for scope.

## Intended architecture

| Layer | Technology |
|---|---|
| Frontend | React — responsive, mobile-first web app (no PWA/installation in MVP) |
| Backend | Node.js + Supabase |
| Auth | Privy — email or phone number only, no password, no wallet exposed to users |
| AI chatbot | Claude API (`claude-sonnet-4-6`) |
| Blockchain | Ethereum mainnet, smart contract `DocumentRegistry` (Solidity) |
| Document storage | IPFS, with the resulting hash anchored on-chain |
| Institutional wallet | Gnosis Safe multisig — only COPACO can sign; individual volunteers never touch wallets |

### Core flow (design constraint, not just a feature list)

1. User lands on the site and an AI chatbot triages them: adulto mayor (elderly user), familiar
   (linked family member), or voluntario COPACO.
2. Signup via Privy (email/phone, no password/wallet) — the elderly user can do this alone or
   with help from a linked family member.
3. A COPACO volunteer creates an excursion (place, date, capacity, accessibility, medical
   requirements).
4. The elderly user enrolls themselves, or a family member linked to their account enrolls on
   their behalf.
5. A health profile (mobility, cognitive condition, medications, emergency contact) is completed
   before the trip — by the elderly user, a linked family member, or reused from prior data.
6. The volunteer confirms enrollments via a consolidated list with per-participant health alerts.
7. The system generates a digital acta: SHA-256 hash → IPFS → anchored on Ethereum mainnet,
   signed by the COPACO institutional wallet.
8. Anyone can publicly verify an acta by ID and confirm on Ethereum who created it, when, and
   that it's unmodified.

### Design invariants to preserve when implementing

- **The elderly adult is the primary actor**, not a dependent — they can complete every step
  alone. A linked family member is optional support, never a required intermediary.
- **Family linking is initiated by the elderly user's own account**, not by COPACO — this is a
  privacy/autonomy requirement, not an implementation detail.
- **Health profile is a shared, always-editable object**: any of {the elderly user, a linked
  family member, prior data} can populate it, and it must be re-editable before each excursion.
- **Blockchain is fully invisible to end users.** Elderly users and volunteers never see or
  interact with wallets/crypto — signing happens only via the COPACO multisig. Do not add
  wallet-connect UI, per-user wallets, or crypto UX for these roles.
- **The chatbot is the entry point and guide** for registration, enrollment, and health-profile
  completion — not a bolt-on FAQ widget. It should orient users by role and walk them through
  each critical step, escalating to a human when needed.
- Every generated acta should be treated as authorship evidence for COPACO from day one — the
  on-chain registry is a progressively-built document repository, not a batch/migration feature.

### Explicitly out of scope for MVP

Do not implement these unless the spec changes: directory of 30+ community services, migrating
historical actas onto the blockchain, infrastructure-request module to the alcaldía, automatic
push/email notifications, complex rescheduling/cancellation flows, multi-wallet support for
individual volunteers, NFTs/tokenization of documents, installable PWA.

### Known operational risk

Ethereum mainnet gas fees (~$5–20 USD per acta) mean the COPACO institutional wallet must stay
funded. This is a product/ops concern (who funds the wallet), not something to solve with
alternative chains or shortcuts without discussion — the spec commits to Ethereum mainnet with a
Gnosis Safe multisig.
