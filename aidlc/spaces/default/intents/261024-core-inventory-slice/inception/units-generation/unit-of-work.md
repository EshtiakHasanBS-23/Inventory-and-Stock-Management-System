# Units of Work — Mojud core slice

Updated 2026-11-16 to describe the units actually built. Sources: `inception/delivery-planning/simplified-plan.md` (the build rounds), `inception/domain-design/components.md`, `requirements.md` (FR-1 to FR-23), `stories.md` (US-01 to US-16) and the code.

## Deployment Model

One API service (a modular monolith with the `identity` and `stock` modules), one web app and one PostgreSQL 16 database, started together with Docker Compose (`npm run up`) or in development with `npm run dev`. Everything runs on the builder's machine. Each unit after the walking skeleton is a vertical slice: its migration, API, contracts and screens are built and tested together.

## Units

| Unit ID | Name | Build round | Migration | Complexity |
|---|---|---|---|---|
| U1 | Walking skeleton: sign-up and sign-in | B1 | 0001_identity | M |
| U2 | Stock core: products, stock in and out, low stock, history, dashboard | Round 1 (slices S1–S4) | 0002_stock | L |
| U3 | Stock value, stock count, staff | Round 2 | 0003_value_and_count | M |
| U4 | Phone layout, passwords, history filters | Round 3 | none | M |
| U5 | Import, export, report | Round 4 | 0004_opening_stock | M |
| U6 | UI refresh and accountability: damage flags, reversals, approvals, My record, loss split | Round 5 | 0005_approvals | L |

### U1 — Walking skeleton: sign-up and sign-in

**Description.** The thinnest slice through browser, API and database, plus the foundations every later unit uses.

**Delivered.**
- Repository layout: `apps/api`, `apps/web`, `packages/contracts`; strict TypeScript, ESLint, Prettier, Vitest with coverage, Supertest, React Testing Library with axe, Playwright smoke test.
- Docker Compose with `db` (PostgreSQL 16), `migrate`, `api` and `web`; `.env.example`; `npm run verify` (preflight, static checks with secret scan, tests with coverage, full stack, smoke test).
- Forward-only SQL migrations; `0001_identity` (businesses, users, sessions).
- Platform pipeline: request ID, response time, logging, helmet, Origin check, 100 KB body limit, authentication, CSRF, session extension, error handler, `/health`, `/openapi.json`.
- Identity: sign-up, sign-in, sign-out, `/auth/me`, Argon2id, sessions with 12-hour expiry and daily clean-up.
- Web: app shell (app bar, side nav, skip link, theme switch with light, dark and device), English translation file, Sign up and Sign in.

**Stories.** US-01, US-02.

### U2 — Stock core

**Description.** Products and a trustworthy stock record (simplified-plan slices S1–S4).

**Delivered.**
- `0002_stock`: `products` with `on_hand >= 0`, `stock_movements` with the append-only trigger.
- Products: create, edit, list, search (Owner and Manager change; everyone reads).
- Stock in and out with a reason and note, through the single conditional-update write path; never negative.
- Stock status OK, Low, Out; low-stock highlighting.
- History (who, when, why, balance after) and Dashboard totals with recent movements.
- Every signed-in person lands on the Dashboard.

**Stories.** US-05 (products and search), US-07 (stock in and out, never negative, permanent ledger), US-12 (first dashboard), US-13 (first history).

### U3 — Stock value, stock count, staff

**Delivered.**
- `0003_value_and_count`: unit cost in poisha on products and movements; `count` reason.
- Stock value per product and in total; value of each movement; 30-day losses on the Dashboard.
- Stock count page and `POST /stock/counts` with a row lock; matching counts save nothing.
- Staff page and `/users` endpoints: the Owner adds, deactivates and reactivates people; deactivated people cannot sign in and their session ends.

**Stories.** US-03, US-05 (unit cost and value), US-08, US-12 (value and losses).

### U4 — Phone layout, passwords, history filters

**Delivered.**
- Below 1024 px the side menu becomes a bottom tab bar; every page fits at 360 px and 320 px (checked in the smoke test).
- My password page and `POST /auth/password`; Owner reset on Staff and `POST /users/:id/password`.
- History filters (product, reason, person, from, to) kept in the address; pages of 50 with Load more; `GET /users/names` for the person filter.

**Stories.** US-04, US-13 (filters and paging), US-02 (phone layout of the shell).

### U5 — Import, export, report

**Delivered.**
- `0004_opening_stock`: `opening` reason.
- Import page with template, browser checks by row, and all-or-nothing `POST /products/import` (at most 1000 rows).
- CSV downloads for products, filtered history (up to 10,000 rows, Dhaka time) and the report; BOM and formula-injection guard.
- Report page and `GET /reports/stock` for any date range, this month by default.

**Stories.** US-06, US-14, US-15.

### U6 — UI refresh and accountability

**Delivered.**
- The look of the HTML mockups in `design-process`: tinted page, white cards, icon side nav, hero tiles with count-up figures, tinted pills with icons, green saved toast, Stock in / Stock out tiles, bottom tab bar with icons; new tint tokens checked at 4.5:1 in both themes; motion only when reduced motion is not requested.
- `0005_approvals`: `products.damaged`, new reasons `damage_flagged`, `damage_rejected`, `reversal`, `reverses_movement_id`, and the `approvals` table with its checks and partial unique index.
- Flag damage page; Approvals inbox (Waiting and Decided); Reverse… on History; direct `damage` limited to Owner and Manager.
- My record page and `GET /me/record`.
- Dashboard loss split (Written off, Damage flags, Missing in counts) with links to filtered History, and the waiting-approvals banner.

**Stories.** US-07 (segregation of duties), US-09, US-10, US-11, US-12 (loss split and banner), US-13 (Reverse…), US-16.

## Implementation Notes

- Units were built one after another by one builder working with an AI developer; each ended with `npm test` green, and `npm run verify` stayed the final check.
- After U1, the per-unit design stages were skipped (simplified-plan, Process): the skeleton had fixed the stack, structure and conventions.

## Assumptions & Open Questions

None.
