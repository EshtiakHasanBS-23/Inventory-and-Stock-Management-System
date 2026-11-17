# Performance Requirements — walking-skeleton

Performance targets as built and checked (NFR-6 in `requirements.md`): sign-up, sign-in, `/auth/me` and the first page load. All timings are measured on the builder's machine with the stack running in Docker Compose (NFR8).

## Targets

| ID | Requirement | Target | How it is checked |
|---|---|---|---|
| NFR5.1 | Sign-up (WF1) completes, including the Argon2id hash and the transaction | ≤ 2 s from submit to the Dashboard | Playwright smoke test fails above 2 s |
| NFR5.2 | Sign-in (WF2) completes, including the hash check | ≤ 2 s from submit to the Dashboard | Playwright smoke test fails above 2 s |
| NFR5.3 | Authenticated request overhead (WF4: session lookup, CSRF check, session extension) | Median ≤ 50 ms on the server for `/auth/me` (budget); the check fails only above 200 ms so a busy machine does not cause false failures | The smoke test makes 20 `/auth/me` calls after a warm-up call and reads the `X-Response-Time` header; it reports the median and fails above 200 ms |
| NFR5.4 | First page load of the web app (production build served locally) | Sign in page usable within 2 s | Playwright smoke test |
| NFR5.5 | Password hashing cost | One Argon2id hash with the NFR1.1 parameters takes at most 500 ms on the builder's machine (upper bound only; the OWASP minimum parameters are expected to take roughly 20–100 ms) | A unit test times one hash and fails above 500 ms |

## Resource Constraints

- The whole stack runs on one Windows 10 Home machine with Docker Desktop and WSL 2. Compose memory limits: database 1 GB, API 512 MB, web (nginx) 256 MB, one-off migrate 256 MB.
- Database connection pool: at most 10 connections.

## Benchmarks

No load benchmark exists. The app runs on one machine with demo data; the stock pages (products, history, report) are not separately timed.

## Assumptions & Open Questions

None.
