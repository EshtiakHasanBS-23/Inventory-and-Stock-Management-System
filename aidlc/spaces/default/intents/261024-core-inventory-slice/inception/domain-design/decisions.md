# Architecture Decisions — Mojud core slice

Updated 2026-11-16: the decisions behind the components in `components.md`, as built. Sources: the code, the migrations, `requirements.md` (FR-1 to FR-23, NFR-1 to NFR-9), `stories.md` and `simplified-plan.md`.

## ADR-001: A modular monolith with two business modules

### Status: Accepted

### Context
One builder working with an AI developer maintains the app. Stock changes, approvals and the ledger must commit together in one database transaction (NFR-3). The app runs only on the builder's machine (NFR-8).

### Decision
One API process with two modules, `identity` and `stock`, on a shared `platform` layer. Approvals live inside `stock` because every decision writes stock movements. Each module exposes only its `index.ts`; ESLint refuses imports from another module's `internal/` folder.

### Consequences
- Positive: one transaction covers a stock change and its approval; one process to start, test and debug.
- Negative: `stock/internal/service.ts` is large (products, ledger, history, dashboard, import, export, report in one file).
- Security: authentication and CSRF run once in the platform pipeline for every protected route; a route-inventory test proves no protected route is mounted before authentication.

### Alternatives Rejected
- Separate services for identity and stock: a network hop and no shared transaction, for no benefit at this size.
- More modules (products, ledger, approvals, reports apart): more interfaces than the code needs; approvals and the ledger would still need one transaction.

## ADR-002: One write path for stock, guarded by the database

### Status: Accepted

### Context
Stock must never go below zero, even with two requests for the last unit at the same moment, and the record must never be edited (FR-10, FR-11, NFR-3).

### Decision
`applyMovement` is the only code that changes `products.on_hand`. In the caller's transaction it runs `UPDATE products SET on_hand = on_hand + delta WHERE … AND on_hand + delta >= 0`; no row returned means "Only N unit in stock." It then inserts the movement with the balance after. The database backs this up: a check keeps `on_hand >= 0`, and a trigger refuses every update or delete on `stock_movements`.

### Consequences
- Positive: one place for every stock rule; concurrent requests are serialized by the row update without explicit locks; the database refuses mistakes even outside the app.
- Negative: fixing a mistake needs a new movement (ADR-006), never an edit.
- Security: the audit trail cannot be changed through the app or directly in the database.

### Alternatives Rejected
- Read the quantity, check it in code, then write: two simultaneous requests could both pass the check.
- Compute the quantity from movements on every read: always consistent, but slower and still needs a lock to refuse negatives.

## ADR-003: Money stored as whole poisha, cost kept on each movement

### Status: Accepted

### Context
Stock value and losses are shown in taka and summed across many rows (FR-17, FR-18, FR-20). A later price change must not alter past losses.

### Decision
Every amount is an integer number of poisha (1 taka = 100 poisha) in the database. Each movement and each approval stores the product's unit cost at its moment. The API converts to taka at the edge; the web app formats with lakh grouping.

### Consequences
- Positive: exact sums; past losses keep their value.
- Negative: conversion at every boundary; unit cost input is limited to 2 decimals.
- Security: none beyond input validation of the amount.

### Alternatives Rejected
- `numeric` columns in taka: exact too, but JavaScript numbers would still need careful handling and sums would come back as strings.
- Only the current product cost: past losses would change whenever the price changes.

## ADR-004: Server-side sessions with a CSRF token

### Status: Accepted

### Context
People sign in with phone and password on shared office desktops and their own phones. Sign-out and deactivation must take effect at once (FR-2, FR-3, FR-5, NFR-1).

### Decision
A random session ID in an HttpOnly, SameSite=Lax cookie; only its SHA-256 hash is stored in `sessions`. Each session has a CSRF token sent back on sign-in and checked in `X-CSRF-Token` on every non-GET request, together with an Origin check. The session ends 12 hours after last use. Passwords are Argon2id hashes.

### Consequences
- Positive: sign-out, password change, reset and deactivation end sessions immediately; a stolen database does not reveal usable cookies.
- Negative: one database read per request; a daily clean-up removes expired rows.
- Security: page scripts cannot read the cookie; cross-site requests fail the CSRF and Origin checks.

### Alternatives Rejected
- Signed tokens (JWT) with no server state: cannot be ended at once on sign-out or deactivation.
- bcrypt: acceptable, but Argon2id is the current recommendation.

## ADR-005: Damage flags hold units out of sellable stock until decided

### Status: Accepted

### Context
Workers find damaged stock but must not write it off alone (FR-13, FR-14, FR-23). Damaged units must not be sold while a decision waits.

### Decision
Flagging writes a `damage_flagged` movement out of `on_hand` and adds the quantity to `products.damaged` (the hold). Approving removes it from the hold (written off). Rejecting removes it from the hold and writes a `damage_rejected` movement back into `on_hand`. Direct `damage` write-offs are allowed only to Owner and Manager.

### Consequences
- Positive: sellable stock is right at once; losses count from the flag and are cancelled by a rejection; the dashboard shows the value held.
- Negative: two quantities per product (`on_hand` and `damaged`) to keep straight.
- Security: no one can make stock disappear without a second person, except the Owner and Manager, whose direct write-offs are recorded under their names.

### Alternatives Rejected
- Leave the units in stock until approved: they could be sold meanwhile.
- No direct write-off at all: the Owner and Manager would need someone else for every write-off.

## ADR-006: One approvals table for damage flags and reversals

### Status: Accepted

### Context
Damage flags and corrections both need a second person, and the decider sees them in one inbox (FR-14, FR-15, FR-16). Two people may press Approve at the same moment.

### Decision
One `approvals` table with `kind` damage or reversal. A database check refuses `decided_by = requested_by`. Deciding selects the row `FOR UPDATE` and refuses anything not pending with "This was already decided." A partial unique index allows one open or approved reversal per movement. An approved reversal writes the opposite `reversal` movement through `applyMovement`, linked by `reverses_movement_id`; if it would go below zero, the whole decision rolls back and the request stays pending.

### Consequences
- Positive: one inbox, one decision path, one set of tests for "never your own" and "decided once".
- Negative: some columns mean different things per kind (`movement_id` is the flag movement or the movement to undo).
- Security: segregation of duties is enforced by the database as well as the code.

### Alternatives Rejected
- Separate tables per kind: two inboxes to merge and the same rules written twice.
- Edit or delete the wrong movement: breaks ADR-002.

## ADR-007: One stock location per business

### Status: Accepted

### Context
The target distributors keep stock in one place (simplified-plan, Rules).

### Decision
The quantity lives on the product row (`on_hand`, `damaged`). There is no location table.

### Consequences
- Positive: simpler queries, forms and tests.
- Negative: a business with stock in two places cannot record it separately.
- Security: none.

### Alternatives Rejected
- A per-location quantity table: more joins and forms for a need the users do not have.

## ADR-008: Shared zod contracts for both sides

### Status: Accepted

### Context
The server must validate every input (NFR-1), and the forms should show the same rules and messages.

### Decision
`@mojud/contracts` holds the zod schemas, limits, field messages and response types. The API validates with them; the web app checks forms and import rows with them.

### Consequences
- Positive: one source of truth for limits and messages; type errors when the API and the web app disagree.
- Negative: a contracts change rebuilds both apps.
- Security: strict schemas refuse unknown fields; size limits apply everywhere.

### Alternatives Rejected
- Separate validation on each side: drift between client and server messages.
- Generated client from OpenAPI: more tooling than one TypeScript repository needs.

## ADR-009: CSV for Excel, checked twice, all-or-nothing import

### Status: Accepted

### Context
Owners keep products in Excel and want files back for their accountants (FR-8, FR-21).

### Decision
Import reads a CSV in the browser (loose headers, comma or semicolon, Excel number formats, BOM), lists problems by spreadsheet row, and sends parsed rows as JSON. The server checks them again and saves all in one transaction, with opening quantities as `opening` movements; at most 1000 rows. Exports are CSV with a BOM, CRLF and a leading apostrophe on cells starting with `= + - @`.

### Consequences
- Positive: no spreadsheet library; quick feedback before upload; never half an import.
- Negative: people must save as "CSV UTF-8" from Excel.
- Security: formula injection in exported files is blocked; the import body stays under the 100 KB limit.

### Alternatives Rejected
- Read `.xlsx` files: a large library and more parsing risk.
- Save valid rows and skip bad ones: leaves the catalogue half imported.

## ADR-010: Reports worked back from the ledger

### Status: Accepted

### Context
The monthly report needs start and end quantities for any date range (FR-20), and there are no stored daily snapshots.

### Decision
The end quantity is the current quantity minus movements after the range; the start quantity is the end quantity minus movements inside it. Values use each movement's own unit cost. Dates in the API are a `from` inclusive and `to` exclusive range; the web app sends Dhaka days.

### Consequences
- Positive: always matches the ledger; no snapshot job.
- Negative: the cost grows with the number of movements after the range.
- Security: none beyond business scoping.

### Alternatives Rejected
- Nightly snapshots: another job to run and keep right on a local-only app.

## Assumptions & Open Questions

None.
