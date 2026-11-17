# Scalability Design — walking-skeleton

How the app meets `nfr-requirements/scalability-requirements.md` (NFR8.1–NFR8.3). Scaling out is not a goal. The design keeps the backend stateless and the database indexed.

## Stateless Backend (NFR8.1)

- **No in-memory state:** sessions, users and businesses live only in PostgreSQL. The backend holds no in-memory session map and no sticky state.
- **Clean-up job:** the session clean-up timer (`reliability-design.md`) takes the transaction-level advisory lock `pg_try_advisory_xact_lock(hashtext('session-cleanup'))` inside its own transaction, so it is safe to run on several instances.
- **Migrations:** these run in the one-off `migrate` service (or by `npm run dev` before the API starts), never inside the API process.
- **Stock correctness under concurrency:** never-negative stock is a conditional `UPDATE`, counts and decisions lock their row (`FOR UPDATE`), so correctness does not depend on a single process.

## Connection Pool (NFR8.2)

There is one pool per backend process, sized by `DB_POOL_MAX`. With one instance and PostgreSQL's default `max_connections` of 100, there is wide headroom.

## Indexes (NFR8.3)

| Table | Index | Serves |
|---|---|---|
| `businesses` | primary key `id` | caller context |
| `users` | primary key `id`; unique `phone`; index `business_id` | sign-in; sign-up duplicate check; business scoping |
| `sessions` | primary key `id_hash`; index `expires_at`; index `user_id` | authenticate; clean-up; ending a user's sessions (password change or reset) |
| `products` | primary key `id`; unique `(business_id, sku)` | product lookups; duplicate SKU check |
| `stock_movements` | `(business_id, created_at DESC)`; `(product_id, created_at DESC)` | history, dashboard, report, My record |
| `approvals` | `(business_id, status, requested_at DESC)`; unique partial `movement_id` for open or approved reversals | approvals inbox; one reversal per movement |

## Module Boundaries

Each module owns its tables and is reached only through its `index.ts` (NFR Design Q3; `logical-components.md`); ESLint enforces the import rule.

## Capacity Thresholds

None. The app is local, with under 50 users (`scalability-requirements.md`).

## Assumptions & Open Questions

None.
