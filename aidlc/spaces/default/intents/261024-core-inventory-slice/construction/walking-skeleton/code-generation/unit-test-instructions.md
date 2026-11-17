# Unit Test Instructions — walking-skeleton

Standard test strategy plus the `mvp` floor (80% line coverage). Methodology is test-after: each layer is built, then its tests are written and run (Testing Contract in `code-generation-plan.md`). These instructions cover the whole suite as it stands: the walking-skeleton tests and the stock, staff and password tests added on top of them.

## Framework Setup

- **Runner:** Vitest 3.2 with three projects under `test.projects` in the root `vitest.config.ts`: `contracts` (node), `api` (node, `globalSetup: ./test/globalSetup.ts`, `pool: 'forks'` with `singleFork: true` so the files share one test database one at a time, test timeout 20 s), `web` (jsdom, `setupFiles: ./test/setup.ts` with `@testing-library/jest-dom` and `jest-axe`).
- **Coverage:** `@vitest/coverage-v8`, configured once at the root: reports `text` and `html` to `coverage/`; `thresholds.lines: 80` overall and for each of `packages/contracts/src`, `apps/api/src` and `apps/web/src`.
- **Endpoint tests:** Supertest against `createApp()` (no network port).
- **Browser smoke:** Playwright Chromium (`apps/web/playwright.config.ts`, one worker, base URL `http://127.0.0.1:8080`), run by `npm run test:smoke` in `npm run verify` stage 5 (not part of the unit run).

## Prerequisites

1. Docker running; `cp .env.example .env`.
2. `npm ci`.
3. Database for API tests: `docker compose up -d --wait db` (host port 5433). The API global setup creates `mojud_test` if missing and migrates it on every run, so no manual step is needed (NFR7.2). `TEST_DATABASE_URL` comes from `.env`.

## Commands

All commands are run from the repository root.

| What | Command |
|---|---|
| Runner check | `npx vitest run --project contracts packages/contracts/test/runner.test.ts` |
| Contracts tests | `npx vitest run --project contracts packages/contracts/test` |
| Database schema tests | `npx vitest run --project api apps/api/test/db` |
| Identity repository, clean-up, password, tokens, service | `npx vitest run --project api apps/api/test/identity` |
| Auth and platform endpoint tests | `npx vitest run --project api apps/api/test/api` |
| Stock module endpoint tests | `npx vitest run --project api apps/api/test/stock` |
| Web component tests | `npx vitest run --project web apps/web/test` |
| Everything with coverage | `npm run test:coverage` |
| Full pipeline (static checks, tests, stack, smoke) | `npm run verify` |

## Expected Coverage

- At least 80% line coverage for `packages/contracts/src`, `apps/api/src` and `apps/web/src`, each measured separately. The run fails below it; the threshold is never lowered. Latest run: 272 tests, 98.08% lines overall.
- Excluded from coverage: `apps/api/src/server.ts` and `apps/api/src/migrate.ts` (process entry points, exercised by the smoke test), `apps/web/src/main.tsx`, `.d.ts` files and test files.

## Test Files

| Area | File(s) | What they check |
|---|---|---|
| Contracts | `packages/contracts/test/runner.test.ts`, `schemas.test.ts` | Runner works; shared schemas and phone normalization |
| Database schema | `apps/api/test/db/schema.test.ts` | Tables, constraints and indexes from the migrations |
| Identity | `apps/api/test/identity/{repository,cleanup,password,tokens,service}.test.ts` | Global-lookup allow-list, transaction rollback, clean-up lock, Argon2id and timing, tokens, sign-up/sign-in rules including simultaneous sign-ups |
| Auth and platform | `apps/api/test/api/{auth,platform}.test.ts` | Endpoints, cookie, CSRF, Origin check, uniform sign-in failure, headers, request ID, logs and redaction, health, route inventory, config, shutdown |
| Stock | `apps/api/test/stock/stock.test.ts` | Products, search, stock in/out, never negative (including two simultaneous requests for the last unit), append-only trigger, unit cost and value, counts, dashboard, staff management, business isolation |
| Approvals | `apps/api/test/stock/approvals.test.ts` | Damage flags, decisions, never deciding one's own request, decided once, reversals, one reversal per movement, My record |
| Import, export, report | `apps/api/test/stock/importExportReport.test.ts` | All-or-nothing import with row numbers, opening stock, CSV BOM and formula guard, stock report |
| History, people, passwords | `apps/api/test/stock/historyAndPasswords.test.ts` | History filters and paging, people's names, password change and Owner reset |
| Web | `apps/web/test/*.test.tsx` | Sign up, Sign in, shell and navigation per role, theme, accessibility (axe in both themes, contrast), visual tokens, stock pages, value, count, staff, import, report, history, account, approvals |

Each file covers the happy path and at least two error or edge cases (construction phase rules).

## Mocking and Stubbing

- **Database:** never mocked in `api` tests: they use the real `mojud_test` database (team Testing Posture). Tables are cleared between tests by `test/helpers/db.ts`.
- **Clock:** injected through `config.clock`; tests set a fixed time to cross the 12-hour expiry and the 7-day clean-up boundary.
- **Hash verifier:** a spy asserts exactly one verify on every sign-in failure path.
- **Failure injection:** a repository test throws after the business insert (transaction test); a pool pointed at an unused port makes `/health` return 503; a pool `error` event checks the process keeps running.
- **Logs:** a pino destination stream captured in memory for log-field and redaction tests.
- **Web:** `fetch` is stubbed per test (no network); a fresh TanStack Query client is created per test.

## Test Data

- Built by helpers: `test/helpers/factories.ts` (unique phone per call) and `test/helpers/twoBusinesses.ts` (businesses A and B with signed-in Supertest agents holding cookie and CSRF token).
- No shared fixtures between files; every test creates what it needs.
- The Playwright smoke test uses a unique 11-digit phone (`01` + last 9 digits of `Date.now()`) and runs against the throw-away `mojud-verify` Compose project.
