# Scalability Requirements — walking-skeleton

Mojud runs on one machine (`requirements.md` NFR-8; constraint register C-T2). Scaling out is not a goal. These requirements keep the backend stateless and the lookups indexed.

## Load Projections

| Item | Expected |
|---|---|
| Businesses | Under 10 (demo data) |
| Users | Under 50 |
| Simultaneous users | Up to 5 browser sessions on one machine |
| Sessions stored | Under 1,000, kept small by the daily clean-up (BR2.3) |
| Products per business | Up to a few thousand; one import holds at most 1000 rows |

## Requirements

| ID | Requirement | Check |
|---|---|---|
| NFR8.1 | The backend keeps no session or user state in memory. All session data is in PostgreSQL, so the API process can restart without losing sign-ins. | Review: sessions live only in the `sessions` table |
| NFR8.2 | Database connections come from one pool (at most 10 connections), set by `DB_POOL_MAX`. | Config test |
| NFR8.3 | Indexes support the lookups: unique index on `users.phone`, primary key on `sessions.id_hash`, indexes on `sessions.expires_at` and `sessions.user_id`, `users.business_id`; unique `(business_id, sku)` on products; `(business_id, created_at DESC)` and `(product_id, created_at DESC)` on stock movements; `(business_id, status, requested_at DESC)` on approvals. | Schema test for the identity indexes; migration review |

## Capacity Planning and Scaling Triggers

None. The app is not deployed (`project.md` Forbidden).

## Assumptions & Open Questions

None.
