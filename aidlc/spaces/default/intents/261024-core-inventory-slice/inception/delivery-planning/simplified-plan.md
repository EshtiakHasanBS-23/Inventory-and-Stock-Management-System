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

## Round 2 additions (2026-11-16)

| Item | Delivers |
|---|---|
| Stock value | Unit cost per product (stored in poisha), stock value per product and in total, the value of each movement, and losses (damage and count shortfalls) for the last 30 days on the dashboard. Each movement keeps the unit cost at its time, so a later price change does not alter past losses. |
| Stock count | Enter the physically counted quantity; the product row is locked and the difference is saved as a `count` movement (in or out). A matching count saves nothing. `count` cannot be chosen by hand. |
| Staff users | The Owner adds staff (manager, warehouse worker, sales rep, supervisor, accountant) with a phone and password, and deactivates or reactivates them. A deactivated person cannot sign in and their open session ends. The Owner cannot be deactivated. |

## Round 3 additions (2026-11-16)

| Item | Delivers |
|---|---|
| Phone layout | Below 1024px the side menu becomes a bottom tab bar that scrolls sideways, the app bar drops the business name and status, and forms use the full width. Every page fits at 360px and 320px with no sideways page scroll (checked in the browser smoke test). The "works best on a wider screen" notice is removed. |
| Passwords | Everyone changes their own password on "My password" with their current one; their other sessions end. The Owner sets a new password for a staff member on the Staff page; all of that person's sessions end. The Owner's own password is changed only on "My password". |
| History | Filters by product, reason, person and date range (start day inclusive, end day inclusive), kept in the URL; pages of 50 with "Load more". Every role can see the list of people's names for the filter. |
