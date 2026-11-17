# Performance Design — walking-skeleton

How the app meets `nfr-requirements/performance-requirements.md` (NFR5.1–NFR5.5). The app is small and local, so the design avoids caches and relies on few round trips per request.

## Request Budgets

| Path | Database round trips | Main cost | Requirement |
|---|---|---|---|
| Sign-up | 1 transaction (insert business, insert user, insert session) | One Argon2id hash (~20–100 ms) | NFR5.1 ≤ 2 s |
| Sign-in | 1 select user + 1 insert session | One Argon2id verify | NFR5.2 ≤ 2 s |
| Stock change (movement, count, flag, decision) | 1 transaction: conditional `UPDATE` of the product plus one `INSERT` of the movement (plus the approval row for flags and decisions) | Indexed primary-key writes | not separately timed |
| Authenticated request (`/auth/me`) | 2: one joined `SELECT` (session, user, business by primary keys), then one `UPDATE` to extend the session (`security-design.md` Lifetime) | Two indexed primary-key operations | NFR5.3 median ≤ 50 ms |

## Resource Pooling

- **Connection pool:** one `pg.Pool` with `max: DB_POOL_MAX` (default 10), `idleTimeoutMillis: 30000` and `connectionTimeoutMillis: 5000`, shared by Kysely (NFR8.2).
- **Hashing:** Argon2 runs on libuv's thread pool, so the event loop is not blocked. The default `UV_THREADPOOL_SIZE` of 4 is enough for 5 users.

## Frontend Loading (NFR5.4)

- **Build and compression:** the web app is a Vite production build, served by nginx with gzip on and `Cache-Control: max-age=31536000, immutable` for hashed assets. `index.html` is served with `no-cache`.
- **Code splitting:** each route is lazy-loaded with `React.lazy`, so the Sign in page loads only the shell and its form.
- **Fonts:** no web fonts are downloaded; the design system uses a system font stack.

## Caching

There is no server-side cache. The session must be checked on every request (NFR1.6), and the data is tiny. TanStack Query keeps `/auth/me` in memory in the browser with `staleTime: Infinity`, and resets it on sign-in and sign-out.

## Measurement

- **Smoke timings (NFR5.1, NFR5.2, NFR5.4):** the Playwright smoke test wraps each step in `performance.now()` timers and fails above the targets.
- **`/auth/me` median (NFR5.3):** the smoke test makes 20 `/auth/me` calls through `request.get` after a warm-up call and reads each one's `X-Response-Time` header, which the API sets from the same timer as the log line's `durationMs`. The test fails when the median is above 200 ms.
- **Hash time (NFR5.5):** a Vitest test times one hash and fails above 500 ms.

## Assumptions & Open Questions

None.
