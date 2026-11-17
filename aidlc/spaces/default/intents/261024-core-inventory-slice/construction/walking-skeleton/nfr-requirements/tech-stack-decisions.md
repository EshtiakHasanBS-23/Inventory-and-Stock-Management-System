# Tech Stack Decisions — walking-skeleton

The walking skeleton set the stack the whole app uses. The mandated parts (TypeScript, React, Node, PostgreSQL, local Docker Compose) come from `project.md`. Library choices come from this stage's questions Q1–Q4. Exact versions are pinned in the `package.json` files and the lockfile.

## Decisions

| Area | Choice | Why | Alternatives considered |
|---|---|---|---|
| Language | TypeScript 5.9 (strict) | Mandated; NFR9 | — |
| Runtime | Node.js 22 LTS (`engines: ^22.13.0`) | Current LTS; built-in `crypto` and `fetch` | Node 20 LTS (older) |
| Repository layout | npm workspaces monorepo: `apps/api`, `apps/web`, `packages/contracts` | One install and one `npm run verify`; shared `@mojud/contracts` types (ADR on contracts) | Separate repositories (more setup for one builder) |
| Backend framework | Express 5.3 | Q1 A. Widely documented and simple for a beginner; Express 5 handles async errors | Fastify (faster, less familiar); NestJS (heavier) |
| Database access | Kysely 0.29 (typed SQL query builder) with `pg` | Q1 A. Plain, visible SQL with types; easy `FOR UPDATE` locks, conditional updates and transactions for the stock ledger | Drizzle ORM; Prisma (locks need raw SQL) |
| Migrations | Plain SQL files (`apps/api/migrations/0001`–`0005`) run by Kysely's `Migrator` through a SQL file provider, in a one-off `migrate` Compose service before the backend starts | Forward-only, readable SQL (team Deployment practice) | node-pg-migrate; Prisma migrate |
| Validation | zod 4 schemas, shared through `@mojud/contracts` | One schema for server checks and client hints | Hand-written checks |
| API description | OpenAPI 3.1 document generated from the zod schemas (`zod-to-openapi`) and served at `/api/v1/openapi.json`; it also documents `GET /api/v1/health`. Both routes are additive under contract v1 (C1). | Contract C1 requires OpenAPI | Hand-written YAML |
| Password hashing | Argon2id via the `argon2` package | Q2 A; NFR1.1 | bcrypt |
| Security headers | helmet | NFR1.14 | Manual headers |
| Logging | pino and pino-http (pino-pretty in development) | Q4 A; NFR8.9 | winston; console |
| Database | PostgreSQL 16 (`postgres:16-alpine`) | Mandated | — |
| Frontend | React 18.3 with Vite 7, React Router 6.30 | Mandated React; Vite is fast and simple | Next.js (server features not needed) |
| Frontend data | TanStack Query 5 for server calls, one small API client wrapper | Caching and request state without extra global state | Redux Toolkit (more code) |
| Styling | Plain CSS with design-system tokens as CSS variables (no UI kit) | Matches `design-system-mapping.md`; light and dark themes | Tailwind (extra layer over the tokens) |
| Translations | i18next with one English JSON file (`apps/web/src/i18n/en.json`) | BR5.2; all screen text in one place | Hand-rolled lookup |
| Unit and integration tests | Vitest 3.2 with V8 coverage (80% lines enforced for each of contracts, api and web) | Q3 A; NFR7 | Jest |
| Endpoint tests | Supertest against a real PostgreSQL test database (`mojud_test`, migrated by the global setup; api test files run one at a time in a single fork) | Q3 A; team Testing Posture | Mocked database |
| Screen tests | React Testing Library with jsdom and `jest-axe` for basic accessibility checks | Q3 A; NFR6 | — |
| Browser smoke test | Playwright 1.64 (Chromium, one worker) running 9 smoke tests against the Compose stack: web security headers; sign-up, sign-out and sign-in timings; products and stock in/out with the never-negative refusal; adding a worker; CSV import and downloads; damage flag and approval; phone layout; keyboard path; saved dark theme | Q3 A; verification command `npm run verify` | API-only smoke |
| Lint and format | ESLint 9 flat config with typescript-eslint and eslint-plugin-react-hooks; Prettier defaults | NFR9; team Code Style | — |
| Containers | Docker Compose with services `db`, `migrate` (one-off), `api`, `web` (nginx serving the built web app and proxying `/api` to `api`) | NFR8; same origin, no CORS (NFR1.15) | Vite dev server in Compose (not production-like) |

## Quality Requirements Met by These Tools

| ID | Requirement | Check |
|---|---|---|
| NFR6.1 | The screens (Sign up, Sign in, app shell and the stock pages) have no `jest-axe` violations in light and dark themes. | Component tests in `apps/web/test/a11y.test.tsx` and the page tests |
| NFR6.2 | The app can be used by keyboard alone: the skip link, visible focus, and focus moving to the error summary. Every text colour pair is 4.5:1 or more in both themes. | Playwright keyboard test; token contrast unit test |
| NFR7.1 | Line coverage is at least 80% for `packages/contracts`, `apps/api` and `apps/web`, each measured on every coverage run; the run fails below it. The latest run: 272 tests, about 98% line coverage. | Vitest `coverage.thresholds` in `vitest.config.ts` |
| NFR7.2 | Tests run with no manual setup beyond Docker and `.env`. The test database is created and migrated by the api global setup. | `npm run verify` on a clean clone |
| NFR9.1 | Every workspace uses strict TypeScript, ESLint (typescript-eslint, react-hooks) and Prettier. Lint, type and format errors fail `npm run verify`. | `npm run verify` |

## Verification Command

`npm run verify` (`scripts/verify.mjs`) runs these stages in order and stops at the first failure:

0. Preflight (`scripts/preflight.mjs`: Docker running, Compose v2.24 or later, `.env` present, ports free)
1. Static checks: `npm run lint`, `npm run typecheck`, `npm run format:check`, `scripts/secret-scan.mjs`
2. Start the database in a throw-away Compose project `mojud-verify`
3. Unit and integration tests with coverage (`npm run test:coverage`; fails under 80%)
4. Build and start the full stack (`docker compose up -d --build --wait`, 60 s limit)
5. Playwright smoke tests against `http://127.0.0.1:8080` (`npm run test:smoke`)
6. Tear down (`docker compose -p mojud-verify down -v`), always run once stage 2 has started

## Assumptions & Open Questions

None.
