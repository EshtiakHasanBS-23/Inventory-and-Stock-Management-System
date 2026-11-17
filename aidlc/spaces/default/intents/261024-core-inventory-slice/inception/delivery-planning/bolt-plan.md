# Bolt Plan — Mojud core slice

Updated 2026-11-16 to record the Bolts actually built. A **Bolt** is one build pass that ends in running, tested code you can check. The original plan (seven Bolts over a backend unit and a frontend unit) was replaced after B1 by small vertical slices; the decision is recorded in `simplified-plan.md`. Inputs: `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `requirements.md`, `stories.md`, `components.md`, `contract-summary.md`, `team-practices.md`.

Bolts ran one after another (serial), each delivering backend and screens together.

## Sequence

| # | Bolt | Unit | Stories | Walking skeleton |
|---|---|---|---|---|
| B1 | Walking skeleton | U1 | US-01, US-02 | **Yes** |
| B2 | Stock core (Round 1: slices S1 Products, S2 Stock in / out, S3 Stock list and low stock, S4 History and dashboard) | U2 | US-05, US-07, US-12, US-13 | — |
| B3 | Value, count, staff (Round 2) | U3 | US-03, US-05, US-08, US-12 | — |
| B4 | Phone layout, passwords, history filters (Round 3) | U4 | US-02, US-04, US-13 | — |
| B5 | Import, export, report (Round 4) | U5 | US-06, US-14, US-15 | — |
| B6 | UI refresh and accountability (Round 5) | U6 | US-07, US-09, US-10, US-11, US-12, US-13, US-16 | — |

## B1 — Walking skeleton (U1)

- **Built:** repository layout with `apps/api`, `apps/web`, `packages/contracts`; Docker Compose (db, migrate, api, web); migration `0001_identity`; the platform pipeline; sign-up, sign-in, sign-out, `/auth/me`; app shell with theme switch and English text; lint, type check, format, secret scan, Vitest with coverage, Playwright smoke test; `npm run verify`.
- **Proved:** browser → API → PostgreSQL works with sessions, CSRF and migrations on the builder's machine.
- **Definition of Done (met):** one command starts everything from a clean checkout; an Owner signs up, signs out and signs in again; `npm run verify` passes with at least 80% line coverage.

## B2 — Stock core (U2)

- **Built:** migration `0002_stock`; products (create, edit, list, search); stock in and out through the single conditional-update write path; append-only trigger; OK, Low, Out status; History; Dashboard totals and recent movements.
- **Definition of Done (met):** tests prove stock never goes negative (including two simultaneous requests for the last unit), movements cannot be updated or deleted, quantities equal the sum of movements, and every query is scoped to the business.

## B3 — Value, count, staff (U3)

- **Built:** migration `0003_value_and_count`; unit cost in poisha on products and movements; stock value and 30-day losses; Stock count page; Staff page with add, deactivate and reactivate.
- **Definition of Done (met):** API and screen tests for value sums, count differences (missing, extra, matching), Owner-only staff rules and the deactivated sign-in refusal.

## B4 — Phone layout, passwords, history filters (U4)

- **Built:** bottom tab bar below 1024 px; pages fit at 360 px and 320 px; My password; Owner password reset; History filters in the address with Load more; people names list.
- **Definition of Done (met):** smoke test checks no sideways scroll at 360 px and 320 px; tests for session ending on password change and reset; filter tests.

## B5 — Import, export, report (U5)

- **Built:** migration `0004_opening_stock`; Import page and all-or-nothing endpoint; CSV downloads for products, history and report; Report page.
- **Definition of Done (met):** tests for row-numbered import problems, duplicate SKUs, 1000-row limit, BOM and formula-injection guard, Dhaka time, and report totals.

## B6 — UI refresh and accountability (U6)

- **Built:** the mockup look with tint tokens; migration `0005_approvals`; Flag damage; Approvals inbox; Reverse… on History; direct damage limited to Owner and Manager; My record; dashboard loss split and banner.
- **Definition of Done (met):** tests for "never your own", decided once under simultaneous decisions, one reversal per movement, a reversal that would go negative staying open, loss split values, and 4.5:1 contrast for every text pair in both themes. Final state: 272 automated tests and 9 smoke tests, about 98% line coverage, `npm run verify` green.

## Assumptions & Open Questions

None.
