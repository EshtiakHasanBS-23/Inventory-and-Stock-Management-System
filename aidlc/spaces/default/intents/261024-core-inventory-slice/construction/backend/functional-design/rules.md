# Business Rules — backend

Rules of the stock module as built (`apps/api/src/modules/stock/internal/service.ts`, `approvals.ts`, `routes.ts`; shared schemas in `packages/contracts/src/stock.ts`, `approvals.ts`, `importReport.ts`; database rules in `apps/api/migrations/0002`–`0005`). Rule IDs continue after the identity rules BR1–BR5 (`construction/walking-skeleton/functional-design/rules.md`). Requirement IDs are FR-n / NFR-n from `requirements.md`.

```yaml
rules:
  # ---- BR6 Business scoping and permissions ----
  - id: BR6.1
    statement: Every stock read and write is scoped to the caller's business
    category: authorization
    applies_to: products, stock_movements, approvals, users (record lookup)
    trigger: any stock-module request
    logic: every query filters by caller.businessId; an id from another business is treated as not existing (product id in a body → VALIDATION_FAILED "Choose a product."; product, approval or person id in the path → 404 NOT_FOUND; movement id for a reversal → VALIDATION_FAILED "Choose a movement from the history."). An id that is not a UUID is NOT_FOUND
    violation: 404 NOT_FOUND or 400 VALIDATION_FAILED as listed
    source: FR-4, NFR-2
  - id: BR6.2
    statement: Every stock operation first checks the caller is signed in and active
    category: authorization
    applies_to: all stock endpoints
    trigger: request
    logic: each service function calls authorize(caller, action), which refuses a missing or inactive caller; the routes are mounted behind authentication and the CSRF check
    violation: 401 NOT_SIGNED_IN / SESSION_ENDED, 403 FORBIDDEN
    source: FR-4
  - id: BR6.3
    statement: Only an Owner or Manager creates, edits or imports products
    category: authorization
    applies_to: POST /products, PATCH /products/:id, POST /products/import
    trigger: request
    logic: IF caller.role is not owner or manager THEN refuse
    violation: 403 FORBIDDEN "Only an owner or manager can do this."
    source: FR-4, FR-6, FR-8
  - id: BR6.4
    statement: Every active person in the business may read products, history, the dashboard, the report, approvals and CSV downloads, and may record stock in/out, counts and damage flags
    category: authorization
    applies_to: stock module
    trigger: request
    logic: no role check beyond BR6.2 for these operations; role limits are BR6.3, BR8.2, BR12.1, BR13.1 and BR19.1
    violation: not applicable
    source: FR-4

  # ---- BR7 Products ----
  - id: BR7.1
    statement: A product has a SKU unique in the business
    category: constraint
    applies_to: Product.sku
    trigger: create, import
    logic: SKU trimmed, 1–40 characters; unique (business_id, sku) in the database; a clash on create → DUPLICATE
    violation: 409 DUPLICATE field sku "A product with this SKU already exists."
    source: FR-6
  - id: BR7.2
    statement: Product fields are checked on the server with the shared schema
    category: validation
    applies_to: create, edit, import rows
    trigger: request
    logic: name 1–100 trimmed; unit 1–20 trimmed; minStock whole number 0–1,000,000; unitCost taka 0–10,000,000 with at most 2 decimals, stored as poisha (round(taka × 100)); unknown fields refused (strict object)
    violation: 400 VALIDATION_FAILED with the field's message (e.g. "Enter a cost in taka, 0 or more, with up to 2 decimals.")
    source: FR-6, NFR-1
  - id: BR7.3
    statement: Editing changes name, unit, minimum stock or unit cost; the SKU and quantities never change by edit
    category: policy
    applies_to: PATCH /products/:id
    trigger: request
    logic: body holds at least one of name, unit, minStock, unitCost; sku, onHand and damaged are not accepted; the row must belong to the caller's business
    violation: 400 VALIDATION_FAILED; 404 NOT_FOUND for another business or an unknown id
    source: FR-6
  - id: BR7.4
    statement: A product's status follows its quantity
    category: calculation
    applies_to: Product
    trigger: every product read
    logic: out when onHand = 0; low when onHand <= minStock; otherwise ok
    violation: not applicable
    source: FR-7
  - id: BR7.5
    statement: Product search matches name or SKU, ignoring case, with wildcards treated as text
    category: calculation
    applies_to: GET /products?q=
    trigger: request
    logic: trim the text and keep the first 100 characters; escape \, % and _; match name ILIKE or sku ILIKE '%text%'; order by name, then SKU
    violation: not applicable
    source: FR-7

  # ---- BR8 Stock in / out and the ledger ----
  - id: BR8.1
    statement: A movement's reason must fit its direction, and its quantity is a whole number from 1 to 1,000,000
    category: validation
    applies_to: POST /stock/movements
    trigger: request
    logic: in allows purchase, return, adjustment; out allows sale, damage, adjustment; count, opening, damage_flagged, damage_rejected and reversal are written only by their own operations and cannot be chosen by hand; note trimmed, at most 200 characters, empty saved as null
    violation: 400 VALIDATION_FAILED "Choose a reason that fits the direction." / "Enter a whole number, 1 or more."
    source: FR-9
  - id: BR8.2
    statement: Only an Owner or Manager writes stock off directly as damaged
    category: authorization
    applies_to: POST /stock/movements with reason damage
    trigger: request
    logic: IF reason = damage AND caller.role is not owner or manager THEN refuse; everyone else uses Flag damage (BR11)
    violation: 400 VALIDATION_FAILED field reason "Use Flag damage: a supervisor, manager or owner decides it."
    source: FR-9, FR-23
  - id: BR8.3
    statement: Stock never goes below zero
    category: constraint
    applies_to: products.on_hand
    trigger: any movement (stock in/out, count, flag, rejection, reversal)
    logic: UPDATE products SET on_hand = on_hand + delta WHERE id = ? AND business_id = ? AND on_hand + delta >= 0; IF no row is updated AND the product exists THEN refuse. The database also checks on_hand >= 0 and balance_after >= 0. Because the check and the change are one statement, two simultaneous requests for the last unit cannot both succeed
    violation: 409 INSUFFICIENT_STOCK field quantity "Only N <unit> in stock."; nothing saved
    source: FR-10, NFR-3
  - id: BR8.4
    statement: Every stock change is one movement written with the quantity change, in one transaction
    category: policy
    applies_to: stock_movements
    trigger: any movement
    logic: in the same transaction as the quantity update, insert a movement with product, direction, reason, quantity, balance after (the new on_hand), the product's unit cost at that moment, note, caller as user and the time; product quantity therefore always equals the sum of its movements
    violation: any failure rolls the whole transaction back (BR2.8)
    source: FR-11, FR-17
  - id: BR8.5
    statement: Movements are permanent
    category: constraint
    applies_to: stock_movements
    trigger: UPDATE or DELETE on stock_movements
    logic: the trigger stock_movements_no_update_or_delete raises 'stock movements cannot be changed or deleted'; mistakes are corrected with a reversal (BR13) or a stock count (BR9)
    violation: database error restrict_violation (no endpoint issues an update or delete)
    source: FR-11, NFR-3

  # ---- BR9 Stock count ----
  - id: BR9.1
    statement: A stock count records only the difference, with the product row locked
    category: calculation
    applies_to: POST /stock/counts
    trigger: request
    logic: countedQuantity whole number 0–1,000,000; in one transaction SELECT the product FOR UPDATE; difference = counted − on_hand; IF difference = 0 THEN save nothing; ELSE write a count movement (in for extra, out for missing) for |difference| with note "Counted X, system had Y." plus the optional note; return previous, counted, difference and the movement
    violation: 400 VALIDATION_FAILED "Choose a product." for an unknown product
    source: FR-12

  # ---- BR10 Product import ----
  - id: BR10.1
    statement: An import holds 1 to 1000 rows, each checked with the product rules plus an opening quantity
    category: validation
    applies_to: POST /products/import
    trigger: request
    logic: each row is sku, name, unit, unitCost, minStock, openingStock (whole number 0–1,000,000); the first problem is reported with its spreadsheet row number (array index + 2, row 1 being the header); the web app parses and checks the same rows in the browser first (comma or semicolon, UTF-8 BOM, loose headers, Excel-style numbers)
    violation: 400 VALIDATION_FAILED field rows "Row N: <field message>" or "The file has no product rows, or more than 1000."
    source: FR-8
  - id: BR10.2
    statement: An import never creates a duplicate SKU
    category: constraint
    applies_to: POST /products/import
    trigger: request
    logic: a SKU repeated in the file → "Row N: SKU X is also on row M."; a SKU that already exists in the business → "Row N: a product with SKU X already exists."
    violation: 400 VALIDATION_FAILED field rows; nothing saved
    source: FR-8
  - id: BR10.3
    statement: An import creates all rows or none, and records opening quantities as movements
    category: policy
    applies_to: POST /products/import
    trigger: valid import
    logic: in one transaction insert every product with on_hand = openingStock; for each product with openingStock > 0 insert an in movement with reason opening, note "Imported opening stock", the row's unit cost and the caller; return created and openingUnits
    violation: any failure rolls back everything
    source: FR-8, FR-11

  # ---- BR11 Flag damage ----
  - id: BR11.1
    statement: Anyone may flag damaged stock; the units move into the Damaged hold and wait for a decision
    category: policy
    applies_to: POST /stock/damage-flags
    trigger: request
    logic: quantity whole number 1–1,000,000, optional note ≤200; in one transaction write an out movement with reason damage_flagged (BR8.3 applies, so no more than in stock can be flagged), add the quantity to products.damaged, and insert a pending approval of kind damage with the product's unit cost and the flagged movement's id
    violation: 409 INSUFFICIENT_STOCK "Only N <unit> in stock."
    source: FR-13

  # ---- BR12 Deciding approvals ----
  - id: BR12.1
    statement: Each kind of approval has its own deciders
    category: authorization
    applies_to: POST /approvals/:id/approve, /approvals/:id/reject
    trigger: request
    logic: damage → owner, manager or supervisor; reversal → owner or manager
    violation: 403 FORBIDDEN "A supervisor, manager or owner decides damage." / "An owner or manager decides reversals."
    source: FR-14, FR-15, FR-16
  - id: BR12.2
    statement: Nobody decides their own request
    category: authorization
    applies_to: approvals
    trigger: decision
    logic: IF approval.requested_by = caller THEN refuse; the database check approvals_decided_by_someone_else (decided_by <> requested_by) backs it
    violation: 403 FORBIDDEN "Someone else must decide your own request."
    source: FR-16, FR-23, NFR-3
  - id: BR12.3
    statement: An approval is decided once
    category: constraint
    applies_to: approvals
    trigger: decision
    logic: in one transaction SELECT the approval FOR UPDATE (scoped to the business); IF status is not pending THEN refuse; of two simultaneous decisions only the first wins. The check approvals_decision_complete keeps status, decided_by and decided_at consistent
    violation: 409 DUPLICATE "This was already decided."; 404 NOT_FOUND for an unknown id
    source: FR-16, NFR-3
  - id: BR12.4
    statement: Deciding a damage flag empties the hold; rejecting returns the units to stock
    category: calculation
    applies_to: approvals of kind damage
    trigger: decision
    logic: subtract the quantity from products.damaged; approve writes no movement (the units already left with damage_flagged and stay written off); reject writes an in movement with reason damage_rejected and note "Damage flag rejected: back in stock"
    violation: not applicable
    source: FR-14
  - id: BR12.5
    statement: Approving a reversal records the opposite movement, linked to the original
    category: calculation
    applies_to: approvals of kind reversal
    trigger: approve
    logic: write a movement with the opposite direction, reason reversal, the original quantity, reverses_movement_id = the original, note "Reverses <reason>: <request note>"; BR8.3 applies, so a reversal that would take stock below zero is refused, the transaction rolls back and the request stays pending; reject writes nothing
    violation: 409 INSUFFICIENT_STOCK
    source: FR-15
  - id: BR12.6
    statement: A decision records who, when, the outcome and the movement it wrote
    category: policy
    applies_to: approvals
    trigger: decision
    logic: set status approved or rejected, decided_by, decided_at = now() and result_movement_id (the damage_rejected or reversal movement, or null)
    violation: not applicable
    source: FR-16
  - id: BR12.7
    statement: The approvals list shows, per card, whether the caller may decide it
    category: calculation
    applies_to: GET /approvals?status=pending|decided
    trigger: request
    logic: status pending (default) lists open requests newest requested first; decided lists approved and rejected, newest decided first; at most 200; each card carries kind, product, quantity, value (quantity × unit cost at the request), note, the linked movement, who asked and when, who decided and when, and canDecide = pending AND caller's role may decide this kind AND caller did not ask
    violation: 400 VALIDATION_FAILED "Choose pending or decided."
    source: FR-16

  # ---- BR13 Reversal requests ----
  - id: BR13.1
    statement: Only an Owner or Manager asks for a reversal
    category: authorization
    applies_to: POST /approvals/reversals
    trigger: request
    logic: IF caller.role is not owner or manager THEN refuse
    violation: 403 FORBIDDEN "Only an owner or manager can ask for a reversal."
    source: FR-15
  - id: BR13.2
    statement: A reversal request names a movement of the business and gives a reason
    category: validation
    applies_to: POST /approvals/reversals
    trigger: request
    logic: movementId a UUID of a movement in the caller's business; note required, 1–200 characters; the approval copies the movement's quantity and the product's current unit cost
    violation: 400 VALIDATION_FAILED "Choose a movement from the history." / "Say why it should be reversed."
    source: FR-15
  - id: BR13.3
    statement: Only purchase, return, sale, damage, adjustment and opening movements can be reversed
    category: constraint
    applies_to: POST /approvals/reversals
    trigger: request
    logic: count → refuse with "A stock count cannot be reversed. Count the product again."; damage_flagged, damage_rejected and reversal → "This movement cannot be reversed."
    violation: 400 VALIDATION_FAILED field movementId
    source: FR-15
  - id: BR13.4
    statement: A movement has at most one open or approved reversal
    category: constraint
    applies_to: approvals
    trigger: request
    logic: unique partial index approvals_one_reversal_per_movement on movement_id WHERE kind = 'reversal' AND status IN ('pending', 'approved'); a rejected reversal does not block a new request
    violation: 409 DUPLICATE field movementId "This movement already has a reversal, asked for or approved."
    source: FR-15

  # ---- BR14 Money ----
  - id: BR14.1
    statement: Money is kept in whole poisha and each movement keeps the cost of its moment
    category: calculation
    applies_to: products.unit_cost, stock_movements.unit_cost, approvals.unit_cost
    trigger: every write and every sum
    logic: store integers in poisha; sum in poisha and convert to taka once; stock value = on_hand × unit_cost; movement value = quantity × the movement's unit_cost, so changing a product's cost later does not change past values
    violation: not applicable
    source: FR-17

  # ---- BR15 Dashboard ----
  - id: BR15.1
    statement: The dashboard summarises stock, value, losses and waiting approvals for the business
    category: calculation
    applies_to: GET /dashboard
    trigger: request
    logic: productCount; totalUnits (sum of onHand); stockValue; lossValue30d = lossBreakdown.damage (damage movements) + damageFlagged (damage_flagged less damage_rejected) + missing (count movements out), all from movements in the last 30 days at their own unit cost; pendingApprovals (pending approvals); damagedValue (sum of damaged × unit cost); lowStockCount; outOfStockCount; lowStock (products not ok, lowest onHand first, at most 10); recentMovements (newest 10)
    violation: not applicable
    source: FR-18, FR-17

  # ---- BR16 History ----
  - id: BR16.1
    statement: The movement history is filtered, newest first and paged
    category: calculation
    applies_to: GET /stock/movements
    trigger: request
    logic: optional productId, userId, reason (any of the ten reasons), from (ISO date-time, inclusive), to (exclusive); empty values ignored; limit 1–200 (default 100; the web app asks for 50 per page), offset 0–1,000,000; order created_at desc, id desc; each row carries product, SKU, unit, direction, reason, quantity, balance after, value, reversesMovementId, note, person's name and time
    violation: 400 VALIDATION_FAILED with the filter's message
    source: FR-19

  # ---- BR17 Stock report ----
  - id: BR17.1
    statement: The stock report shows what happened to each product in a date range, consistent with the ledger
    category: calculation
    applies_to: GET /reports/stock
    trigger: request
    logic: from and to are required ISO date-times, from inclusive, to exclusive, to after from; per product, opening = on_hand − net movements since from; closing = on_hand − net movements since to; within the range received = purchase + return + opening, sold = sale, damaged = damage + damage_flagged − damage_rejected, countDifference = count in − count out, adjusted = adjustment + reversal (in − out); values receivedValue, soldValue, damagedValue, missingValue (count out only) at each movement's cost; products with no movement in the range and zero opening and closing are left out; a totals line sums every line
    violation: 400 VALIDATION_FAILED "Enter a valid start date." / "The end date must be on or after the start date."
    source: FR-20

  # ---- BR18 CSV downloads ----
  - id: BR18.1
    statement: CSV files open safely and correctly in Excel
    category: policy
    applies_to: GET /products/export.csv, /stock/movements/export.csv, /reports/stock.csv
    trigger: download
    logic: UTF-8 byte order mark, comma separated, CRLF line ends, quotes where needed; a text cell starting with = + - @ tab or carriage return gets a leading apostrophe (formula-injection guard); numbers written as numbers; sent as an attachment with Cache-Control no-store
    violation: not applicable
    source: FR-21, NFR-1
  - id: BR18.2
    statement: Each download has fixed contents
    category: policy
    applies_to: CSV downloads
    trigger: download
    logic: products.csv — SKU, name, unit, in stock, minimum stock, status, unit cost, stock value; stock-history.csv — the same filters as the history page without paging, at most 10,000 rows, date in Dhaka time ("YYYY-MM-DD HH:mm"), SKU, product, direction, reason, quantity, unit, balance after, value, by, note; stock-report.csv — the report lines plus a Total line
    violation: 400 VALIDATION_FAILED for invalid filters or dates
    source: FR-21

  # ---- BR19 My record ----
  - id: BR19.1
    statement: Everyone sees their own record; an Owner or Manager may see anyone's in the business
    category: authorization
    applies_to: GET /me/record?userId=
    trigger: request
    logic: no userId or own id → own record; another id → only owner or manager; the person must be in the caller's business
    violation: 403 FORBIDDEN "You can see only your own record."; 404 NOT_FOUND for an unknown person
    source: FR-22
  - id: BR19.2
    statement: My record counts one person's work for today, the last 7 days and the last 30 days
    category: calculation
    applies_to: GET /me/record
    trigger: request
    logic: today starts at midnight Bangladesh time (UTC+6); per period count stock movements and units in/out they recorded (excluding counts, damage_flagged and damage_rejected), counts with units missing and extra, damage flags they raised by outcome (approved, rejected, waiting), and approvals they decided for others
    violation: not applicable
    source: FR-22
```

## Rules Summary

| ID | Rule | Category | Source |
|---|---|---|---|
| BR6.1 | Business scoping | authorization | FR-4, NFR-2 |
| BR6.2 | Signed-in active caller | authorization | FR-4 |
| BR6.3 | Products: Owner or Manager | authorization | FR-4, FR-6, FR-8 |
| BR6.4 | Reads and recording open to every role | authorization | FR-4 |
| BR7.1 | SKU unique per business | constraint | FR-6 |
| BR7.2 | Product field limits, money in poisha | validation | FR-6 |
| BR7.3 | Edit: name, unit, minimum, cost only | policy | FR-6 |
| BR7.4 | OK / Low / Out status | calculation | FR-7 |
| BR7.5 | Search name or SKU | calculation | FR-7 |
| BR8.1 | Reason fits direction; quantity 1–1,000,000 | validation | FR-9 |
| BR8.2 | Direct damage: Owner or Manager only | authorization | FR-9, FR-23 |
| BR8.3 | Never negative (conditional update + checks) | constraint | FR-10, NFR-3 |
| BR8.4 | Movement and quantity in one transaction | policy | FR-11, FR-17 |
| BR8.5 | Append-only trigger | constraint | FR-11, NFR-3 |
| BR9.1 | Count records the difference under a row lock | calculation | FR-12 |
| BR10.1 | Import rows checked, row numbers | validation | FR-8 |
| BR10.2 | No duplicate SKU on import | constraint | FR-8 |
| BR10.3 | All or nothing; opening movements | policy | FR-8, FR-11 |
| BR11.1 | Flag damage into the hold, approval opens | policy | FR-13 |
| BR12.1 | Deciders per kind | authorization | FR-14, FR-15, FR-16 |
| BR12.2 | Never decide your own | authorization | FR-16, FR-23 |
| BR12.3 | Decided once (row lock) | constraint | FR-16 |
| BR12.4 | Damage decision effects | calculation | FR-14 |
| BR12.5 | Reversal movement on approve | calculation | FR-15 |
| BR12.6 | Decision recorded | policy | FR-16 |
| BR12.7 | Approvals list and canDecide | calculation | FR-16 |
| BR13.1 | Reversal request: Owner or Manager | authorization | FR-15 |
| BR13.2 | Reversal request fields | validation | FR-15 |
| BR13.3 | Reversible reasons | constraint | FR-15 |
| BR13.4 | One open or approved reversal per movement | constraint | FR-15 |
| BR14.1 | Poisha and cost at the moment | calculation | FR-17 |
| BR15.1 | Dashboard figures | calculation | FR-18 |
| BR16.1 | History filters and paging | calculation | FR-19 |
| BR17.1 | Stock report | calculation | FR-20 |
| BR18.1 | CSV: BOM and formula guard | policy | FR-21 |
| BR18.2 | CSV contents | policy | FR-21 |
| BR19.1 | My record access | authorization | FR-22 |
| BR19.2 | My record periods and counts | calculation | FR-22 |

## Assumptions & Open Questions

None.
