# Simplified Plan — Mojud core slice (replaces B2–B7)

Decided 2026-11-16 by the project owner: the original plan (U2 backend XL + U3
frontend L, 12 stories, 7 Bolts) was too large to finish quickly. B1 (walking
skeleton) stays as built. Everything after it is replaced by four small
vertical slices, each delivering backend and screen together.

## Scope kept

| Slice | Delivers |
|---|---|
| S1 Products | Create, list, search and edit products (SKU, name, unit, minimum stock) |
| S2 Stock in / out | Record stock in (purchase, return, adjustment) and out (sale, damage, adjustment) with a reason and optional note; stock can never go negative |
| S3 Stock list and low stock | Current quantity per product, low-stock and out-of-stock highlighted |
| S4 History and dashboard | Movement history (who, when, why, balance after); dashboard totals and recent movements |

## Rules

- One warehouse per business (no warehouse table).
- Every stock change is one database transaction: a conditional update of the
  product's quantity (refused when it would go below zero) plus one appended
  movement row. Movements cannot be updated or deleted (database trigger).
- Roles: Owner and Manager may create and edit products; every signed-in user
  may view stock and record movements. The six roles stay in the schema, but no
  user management screen is built.
- Every query is scoped to the caller's business.

## Cut or deferred

Purchase orders, suppliers, blind receiving, dispatch orders, reservations,
picking, damage replacement, the Issues module, My tasks, multiple warehouses,
user management, the full permission table, idempotency keys, offline mode and
Bangla.

## Process

The remaining per-unit design stages (functional design, NFR requirements, NFR
design, infrastructure design) are skipped: the skeleton already fixed the
stack, structure and conventions. Each slice is built and checked with
`npm test`; `npm run verify` stays the final check.
