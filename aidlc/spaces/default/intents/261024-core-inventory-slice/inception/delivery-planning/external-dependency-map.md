# External Dependency Map — Mojud core slice

Updated 2026-11-16. Things outside the project that the Bolts in `bolt-plan.md` relied on. The app runs only on the builder's machine and connects to no other system (`unit-of-work.md`, `contract-summary.md`, `team-practices.md`).

| Dependency | Owner | Used by | If unavailable |
|---|---|---|---|
| Docker with Compose on the build machine | Builder | `npm run up` and `npm run verify` (PostgreSQL 16, migrate, API, web containers) | Run PostgreSQL alone in Docker or a local PostgreSQL install, and start the API and web app with `npm run dev` |
| Node.js 22 (`^22.13.0`) | Builder | Every script, the API and the web build | Nothing runs; install it |
| npm registry | npm | Installing packages (Express, Kysely, pg, argon2, helmet, pino, zod, React, Vite, TanStack Query, i18next, Vitest, Playwright and the rest of `package.json`) | Retry later; an installed `node_modules` keeps working |
| Playwright browser download | Playwright | The browser smoke test in `npm run verify` | Smoke test cannot run until the browser is installed |

No external APIs, data feeds, cloud services, approvals or other teams are involved.

## Assumptions & Open Questions

None.
