# Contract Summary — Mojud core slice

Updated 2026-11-16 to describe the contracts as built. Sources: `apps/api/src/app.ts`, `apps/api/src/modules/identity/internal/routes.ts`, `apps/api/src/modules/stock/internal/routes.ts`, the service files beside them, `packages/contracts/src/*.ts` and `apps/api/migrations/0001`–`0005`. Requirements: `inception/requirements-analysis/requirements.md` (FR-1 to FR-23, NFR-1 to NFR-9). Stories: `inception/user-stories/stories.md` (US-01 to US-16).

## Contracts

| ID | Contract | Between | Where it lives |
|---|---|---|---|
| C1 | HTTP API `/api/v1` (JSON, plus CSV downloads) | Web app → API | Routes in `apps/api/src/modules/*/internal/routes.ts`; shared request schemas and response types in `packages/contracts` (`@mojud/contracts`) |
| C2 | Identity module surface: `authorize`, `resolveCaller`, `createIdentityRouters`, `Caller`, `startSessionCleanup`, `equalizeSignInFailure` | API platform and stock module → identity module | `apps/api/src/modules/identity/index.ts` |
| C3 | Stock module surface: `createStockRouter`, `StockDeps` | API app → stock module | `apps/api/src/modules/stock/index.ts` |
| C4 | Database schema | API → PostgreSQL 16 | Forward-only SQL migrations `apps/api/migrations/0001`–`0005` |

Modules import each other only through their `index.ts`; ESLint refuses imports of another module's `internal/` folder.

## C1 Conventions

- Base path `/api/v1`. JSON bodies, at most 100 KB; a larger or unreadable body is `400 VALIDATION_FAILED`.
- Request bodies are strict zod objects: an unknown field is refused with `VALIDATION_FAILED` "This field is not allowed."
- Session: cookie `mojud_session` (HttpOnly, SameSite=Lax, Path=/, no Max-Age; `Secure` from configuration). The session ends 12 hours after its last use; each signed-in request moves the expiry.
- CSRF: every non-GET request after sign-in sends header `X-CSRF-Token` with the token returned by sign-up, sign-in and `/auth/me`. Every non-GET request must also come from an allowed `Origin` (or `Referer`).
- Every response carries `X-Request-Id` (a valid incoming one is kept) and `X-Response-Time`, plus helmet security headers (CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`).
- Every query is limited to the caller's business. An ID that is not a UUID, or belongs to another business, answers `404 NOT_FOUND` (except where noted).
- Money in responses is in taka (number with up to 2 decimals); it is stored in poisha. Dates are ISO 8601 strings.
- CSV downloads: `text/csv; charset=utf-8`, `Content-Disposition: attachment`, `Cache-Control: no-store`, UTF-8 BOM, CRLF line ends; text cells starting with `=`, `+`, `-`, `@`, tab or carriage return get a leading apostrophe.

### Error shape

`{ "code": string, "message": string, "field"?: string, "requestId"?: string }`

| Code | Status | Default message | Used for |
|---|---|---|---|
| `VALIDATION_FAILED` | 400 | "Check this field." (each schema field has its own message) | Bad body or query; wrong current password; bad import row; unknown product on a stock change; reason not allowed for the role |
| `DUPLICATE` | 409 | "This phone number is already registered" | Phone in use; SKU in use; a reversal already open or approved; an approval already decided ("This was already decided.") |
| `NOT_SIGNED_IN` | 401 | "Sign in to continue." | No or unknown session cookie |
| `SESSION_ENDED` | 401 | "Your session ended. Sign in again." | Session expired, or the user was deactivated |
| `INVALID_CREDENTIALS` | 401 | "Sign-in details are not correct." | Any sign-in failure, including a malformed sign-in body |
| `ACCOUNT_DEACTIVATED` | 401 | "This account is deactivated." | Correct password on a deactivated account |
| `FORBIDDEN` | 403 | "Couldn't save. Try again." (role refusals carry their own message) | Missing or wrong CSRF token; foreign Origin; role not allowed |
| `NOT_FOUND` | 404 | "Not found" | Unknown route; record not in the caller's business |
| `INSUFFICIENT_STOCK` | 409 | "Not enough stock." (sent as "Only N unit in stock.") | A change that would take stock below zero |
| `INTERNAL_ERROR` | 500 | "Couldn't save. Try again." | Unexpected failure (carries `requestId`) |

## C1 Endpoints

"Roles" lists who may call it; everyone else gets `403 FORBIDDEN`. "All" means any signed-in, active person.

### Platform (public)

| Method and path | Body or query | Success | Errors |
|---|---|---|---|
| `GET /health` | — | 200 `{status:"ok", db:"ok"}`; 503 `{status:"error", db:"down"}` | — |
| `GET /openapi.json` | — | 200 OpenAPI 3.1 document (covers the four `/auth` endpoints below and `/health`) | — |

### Identity: `/auth` (FR-1, FR-2, FR-5)

| Method and path | Access | Body | Success | Errors |
|---|---|---|---|---|
| `POST /auth/signup` | Public | `{businessName, name, phone, password}`: names 1–100 after trim; phone 6–15 digits after removing spaces and dashes; password 8–128 | 201 `SessionResponse` and the session cookie | 400 `VALIDATION_FAILED` (field), 409 `DUPLICATE` (phone) |
| `POST /auth/signin` | Public | `{phone, password}` | 200 `SessionResponse` and the session cookie | 401 `INVALID_CREDENTIALS`, 401 `ACCOUNT_DEACTIVATED` |
| `POST /auth/signout` | All | — | 204, cookie cleared, session deleted | 401, 403 (CSRF) |
| `GET /auth/me` | All | — | 200 `SessionResponse` | 401 `NOT_SIGNED_IN` / `SESSION_ENDED` |
| `POST /auth/password` | All | `{currentPassword, newPassword}` (new 8–128) | 204; the caller's other sessions end | 400 `VALIDATION_FAILED` ("Your current password is not correct.") |

`SessionResponse`: `{userId, businessId, businessName, name, role, warehouseIds, csrfToken}`. `warehouseIds` is always an empty array (see Code differences).

### Identity: `/users` (FR-3, FR-5, FR-19)

| Method and path | Roles | Body | Success | Errors |
|---|---|---|---|---|
| `GET /users` | Owner | — | 200 `StaffMember[]` `{id, name, phone, role, active, createdAt}`, oldest first | 403 "Only the owner can manage staff." |
| `GET /users/names` | All | — | 200 `PersonName[]` `{id, name}` for everyone in the business (History and My record pickers) | — |
| `POST /users` | Owner | `{name, phone, password, role}`; role one of `manager`, `warehouse_worker`, `sales_rep`, `supervisor`, `accountant` | 201 `StaffMember` | 400, 403, 409 `DUPLICATE` (phone) |
| `PATCH /users/:id` | Owner | `{active: boolean}` | 200 `StaffMember`; a deactivated person's session ends on their next request | 403 "The owner cannot be deactivated.", 404 |
| `POST /users/:id/password` | Owner | `{newPassword}` | 204; all of that person's sessions end | 403 "Change your own password on the My password page." (for the Owner), 404 |

### Stock: products (FR-6, FR-7, FR-8, FR-17, FR-21)

| Method and path | Roles | Body or query | Success | Errors |
|---|---|---|---|---|
| `GET /products` | All | `?q=` text (trimmed, up to 100 characters; matches name or SKU ignoring case; `%` and `_` are plain text) | 200 `Product[]` ordered by name, SKU | — |
| `POST /products` | Owner, Manager | `{sku (1–40), name (1–100), unit (1–20), minStock (0–1,000,000), unitCost (taka 0–10,000,000, up to 2 decimals)}` | 201 `Product` with `onHand` 0 | 400, 403 "Only an owner or manager can do this.", 409 `DUPLICATE` (sku) |
| `PATCH /products/:id` | Owner, Manager | Any of `{name, unit, minStock, unitCost}`, at least one; SKU cannot change | 200 `Product` | 400, 403, 404 |
| `POST /products/import` | Owner, Manager | `{rows: ImportRow[]}`, 1–1000 rows; each row is a product plus `openingStock` (0–1,000,000) | 201 `{created, openingUnits}`; all rows in one transaction, opening stock as `opening` movements | 400 `VALIDATION_FAILED` field `rows`: "Row N: …", "Row N: SKU X is also on row M.", "Row N: a product with SKU X already exists.", "The file has no product rows, or more than 1000."; 403 |
| `GET /products/export.csv` | All | — | 200 `products.csv` (products with stock and value) | — |

`Product`: `{id, sku, name, unit, minStock, onHand, unitCost, stockValue, damaged, status}`; `status` is `out` at 0, `low` at or below `minStock`, otherwise `ok`.

### Stock: movements and counts (FR-9 to FR-12, FR-19, FR-21, FR-23)

| Method and path | Roles | Body or query | Success | Errors |
|---|---|---|---|---|
| `POST /stock/movements` | All; reason `damage` only Owner, Manager | `{productId, direction: in\|out, reason, quantity (1–1,000,000), note? (≤200)}`; in: `purchase`, `return`, `adjustment`; out: `sale`, `damage`, `adjustment` | 201 `Movement` | 400 (reason must fit the direction; unknown product: field `productId`; `damage` by other roles: "Use Flag damage: a supervisor, manager or owner decides it."), 409 `INSUFFICIENT_STOCK` "Only N unit in stock." |
| `POST /stock/counts` | All | `{productId, countedQuantity (0–1,000,000), note?}` | 201 `CountResult {previous, counted, difference, movement}`; `movement` is null when the count matched | 400 |
| `GET /stock/movements` | All | `?productId&userId&reason&from&to&limit&offset`; `from` inclusive, `to` exclusive (ISO date-times); `limit` 1–200 (default 100; the web app asks for 50); empty values ignored | 200 `Movement[]`, newest first | 400 naming the field |
| `GET /stock/movements/export.csv` | All | Same filters, no paging, up to 10,000 rows | 200 `stock-history.csv`, times in Dhaka time | 400 |

`Movement`: `{id, productId, productName, sku, unit, direction, reason, quantity, balanceAfter, value, reversesMovementId, note, userName, createdAt}`. Reasons: `purchase`, `return`, `sale`, `damage`, `adjustment`, `count`, `opening`, `damage_flagged`, `damage_rejected`, `reversal`. `count`, `opening`, `damage_flagged`, `damage_rejected` and `reversal` are written only by their own operations.

### Stock: approvals (FR-13 to FR-16, FR-23)

| Method and path | Roles | Body or query | Success | Errors |
|---|---|---|---|---|
| `POST /stock/damage-flags` | All | `{productId, quantity (1–1,000,000), note?}` | 201 `Approval` (kind `damage`, status `pending`); writes a `damage_flagged` movement and adds the quantity to the product's damaged hold | 400, 409 `INSUFFICIENT_STOCK` |
| `POST /approvals/reversals` | Owner, Manager | `{movementId, note (1–200, required)}` | 201 `Approval` (kind `reversal`, status `pending`) | 400 (unknown movement; "A stock count cannot be reversed. Count the product again."; "This movement cannot be reversed."), 403 "Only an owner or manager can ask for a reversal.", 409 "This movement already has a reversal, asked for or approved." |
| `GET /approvals` | All | `?status=pending` (default) or `decided` | 200 `Approval[]`, newest first, at most 200 | 400 |
| `POST /approvals/:id/approve` | Damage: Owner, Manager, Supervisor; reversal: Owner, Manager; never the requester | — | 200 `Approval`. Damage: units leave the hold. Reversal: writes the opposite `reversal` movement linked to the original | 403 "Someone else must decide your own request." / "A supervisor, manager or owner decides damage." / "An owner or manager decides reversals.", 404, 409 "This was already decided.", 409 `INSUFFICIENT_STOCK` (reversal stays pending) |
| `POST /approvals/:id/reject` | As approve | — | 200 `Approval`. Damage: units leave the hold and a `damage_rejected` movement returns them to stock. Reversal: nothing changes | As approve |

`Approval`: `{id, kind, status, productId, productName, sku, unit, quantity, value, note, movement {id, direction, reason, createdAt}, requestedBy, requestedAt, decidedBy, decidedAt, canDecide}`.

### Stock: insight (FR-18, FR-20, FR-21, FR-22)

| Method and path | Roles | Query | Success | Errors |
|---|---|---|---|---|
| `GET /dashboard` | All | — | 200 `Dashboard {productCount, totalUnits, stockValue, lossValue30d, lossBreakdown {damage, damageFlagged, missing}, pendingApprovals, damagedValue, lowStockCount, outOfStockCount, lowStock: Product[], recentMovements: Movement[10]}` | — |
| `GET /reports/stock` | All | `?from&to` (ISO date-times, required; `to` exclusive) | 200 `StockReport {from, to, lines: ReportLine[], totals}`; each line: `opening, received, sold, damaged, countDifference, adjusted, closing, receivedValue, soldValue, damagedValue, missingValue` | 400 "The end date must be on or after the start date." |
| `GET /reports/stock.csv` | All | Same | 200 `stock-report.csv` with a total line | 400 |
| `GET /me/record` | All for self; Owner, Manager for anyone (`?userId=`) | `?userId` optional | 200 `WorkRecord {userId, name, today, week, month}`; each period: `movements, unitsIn, unitsOut, counts, countMissing, countExtra, flagsRaised, flagsApproved, flagsRejected, flagsPending, decisions`. Today is the Dhaka day; week and month are the last 7 and 30 days | 403 "You can see only your own record.", 404 |

## C2 Identity module surface

- `resolveCaller(sessionId)` turns the cookie into `{caller, csrfToken, checkCsrf, extend}` or throws `NOT_SIGNED_IN` / `SESSION_ENDED`. Only the identity module touches the `sessions` table.
- `authorize(caller, action)` refuses a missing caller (`NOT_SIGNED_IN`) or an inactive one (`FORBIDDEN`). Role rules are checked by each operation after it (Owner-only staff operations in identity; Owner/Manager and decider rules in stock).
- `Caller`: `{userId, businessId, businessName, name, role, active, warehouseIds}` (read-only).
- `startSessionCleanup` deletes expired sessions at start and every 24 hours, under an advisory lock.

## C4 Database schema

| Table | Migration | Columns and rules |
|---|---|---|
| `businesses` | 0001 | `id` uuid, `name` (1–100), `created_at` |
| `users` | 0001 | `id`, `business_id` → businesses, `name`, `phone` (unique across all businesses, `^[0-9]{6,15}$`), `role` (six roles), `password_hash` (Argon2id), `active`, `created_at` |
| `sessions` | 0001 | `id_hash` (SHA-256 of the cookie value, primary key), `user_id` → users (cascade), `csrf_token`, `created_at`, `last_used_at`, `expires_at` |
| `products` | 0002, 0003, 0005 | `id`, `business_id`, `sku` (1–40, unique per business), `name`, `unit` (1–20), `min_stock` ≥ 0, `on_hand` ≥ 0 (check `products_on_hand_not_negative`), `unit_cost` poisha ≥ 0 (0003), `damaged` ≥ 0 (0005), `created_at` |
| `stock_movements` | 0002–0005 | `id`, `business_id`, `product_id`, `direction` in/out, `reason` (ten values after 0005), `quantity` > 0, `balance_after` ≥ 0, `note` ≤ 200, `user_id`, `unit_cost` poisha (0003), `reverses_movement_id` → stock_movements (0005), `created_at`. Trigger `stock_movements_no_update_or_delete` refuses every update and delete |
| `approvals` | 0005 | `id`, `business_id`, `kind` damage/reversal, `product_id`, `quantity` > 0, `unit_cost`, `note`, `movement_id`, `status` pending/approved/rejected, `requested_by`, `requested_at`, `decided_by`, `decided_at`, `result_movement_id`. Checks: `approvals_decided_by_someone_else`, `approvals_decision_complete`. Partial unique index `approvals_one_reversal_per_movement` (kind reversal, status pending or approved) |

Indexes: `users(business_id)`, `sessions(expires_at)`, `sessions(user_id)`, `stock_movements(business_id, created_at DESC)`, `stock_movements(product_id, created_at DESC)`, `approvals(business_id, status, requested_at DESC)`.

## Code differences found while writing this summary

- `SessionResponse` and `Caller` still carry `warehouseIds`, always an empty array. It is a leftover field from the walking skeleton and nothing reads it.
- `GET /openapi.json` documents only `/auth/signup`, `/auth/signin`, `/auth/signout`, `/auth/me` and `/health`, not the other endpoints.
- "This was already decided." uses code `DUPLICATE` (409), whose default message is about phone numbers; the message is always overridden.
- `FORBIDDEN` without its own message (CSRF and Origin failures) says "Couldn't save. Try again."

## Assumptions & Open Questions

None.
