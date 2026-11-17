# Mojud: Inventory and Stock Management System

Mojud keeps stock for small distribution businesses. It keeps a permanent
record of every stock change with who, when, why and its value in taka, never
lets stock go below zero, and needs a second person for every damage write-off
and every correction. It covers sign-up, staff and roles, products with Excel
import, stock in / out, stock counts, damage flags, reversals and approvals, an
owner dashboard of stock value and losses, movement history, a monthly report,
CSV downloads and each person's own record. It runs end to end as a React web
app, a Node API and PostgreSQL.

| Part                     | Folder                           | What it is                                                        |
| ------------------------ | -------------------------------- | ----------------------------------------------------------------- |
| Web app                  | `apps/web`                       | React 18 + Vite, served by nginx in Docker                        |
| API                      | `apps/api`                       | Express 5 + Kysely: identity (sign-up, sessions, staff) and stock |
| Shared contract          | `packages/contracts`             | zod schemas and types used by both                                |
| Database                 | Docker `db` service              | PostgreSQL 16                                                     |
| Local stack and pipeline | `docker-compose.yml`, `scripts/` | Compose services and `npm run verify`                             |

Everything runs on your own machine; nothing is deployed anywhere.

## Prerequisites

- **Docker Desktop** with the WSL 2 backend (Windows 10 Home) and Docker
  Compose v2.24 or later. Start Docker Desktop before the commands below.
- **Node.js 22** (22.13 or later) and npm.

## First-time setup

```sh
cp .env.example .env
npm ci
npx playwright install chromium
```

`.env.example` holds working **local-only** values, so the copy works as is.
Change them before any deployment. `.env` is ignored by git; never commit it.

## Everyday commands

| Command               | What it does                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`         | Starts only the database in Docker, applies migrations, then runs the API (port 3000) and the web app (http://localhost:5173) with hot reload.                                                        |
| `npm run up`          | Builds and starts the whole stack in Docker. Open http://localhost:8080.                                                                                                                              |
| `npm run down`        | Stops the stack. Your data stays in the `pgdata` volume.                                                                                                                                              |
| `npm run verify`      | The full check before every merge: preflight, lint, type check, format check, secret scan, tests with coverage (80% lines), a clean stack build, and a browser smoke test. It cleans up after itself. |
| `npm run db:reset`    | Deletes the local database and starts it fresh (only demo data is kept here).                                                                                                                         |
| `npm test`            | Runs the unit and integration tests. The API tests need the database: `docker compose up -d --wait db`.                                                                                               |
| `npm run logs:errors` | Shows the API's error log lines from the running stack.                                                                                                                                               |

## Tests

- `npm run test:coverage` runs all three test projects (`contracts`, `api`,
  `web`) and fails below 80% line coverage in any of `packages/contracts/src`,
  `apps/api/src` or `apps/web/src`.
- The API tests use a real database, `mojud_test`, in the same `db` container.
  The test setup creates and migrates it on every run.
- `npm run test:smoke` is the Playwright browser test. `npm run verify` runs it
  against a throw-away stack.

## Troubleshooting

- **"Docker is not running"**: start Docker Desktop and wait until it says it is
  running, then try again.
- **"Port 8080 is in use" or "Port 5433 is in use"**: another copy of the stack
  is running. Stop it with `npm run down`. If something else uses the port,
  close that program.
- **"database not reachable at TEST_DATABASE_URL"**: start the database with
  `docker compose up -d --wait db` and check that `.env` exists.
- **A container keeps restarting**: run `npm run logs:errors` to see why.
- **The sign-in page says the session ended**: sessions end 12 hours after
  their last use. Sign in again.
