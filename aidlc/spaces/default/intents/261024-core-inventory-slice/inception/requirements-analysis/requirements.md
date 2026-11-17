# Requirements — Mojud core slice

Updated 2026-11-16 to describe the app as built.

Sources:
- Ideation: the intent statement (`ideation/intent-capture/intent-statement.md`, cited as "intent S1", "intent S4", "intent S5") and the intent backlog (`ideation/scope-definition/intent-backlog.md`, cited as IB-1, IB-2, IB-3, IB-4, IB-10).
- Build rounds: `inception/delivery-planning/simplified-plan.md`, cited as "Round 1" (slices S1–S4) to "Round 5". A requirement with no ideation source is marked **added during build**.
- The PRD (`_bmad-output/planning-artifacts/prds/prd-E2E_IAM-2026-10-22/prd.md`) uses the same FR and NFR numbers as this document.
- The team practices (`inception/practices-discovery/team-practices.md`).

Stories US-01 to US-16 in `inception/user-stories/stories.md` cover every requirement below.

## Intent Analysis

Mojud ("stock" in Bangla; working name) is a stock-control web app for small Bangladeshi FMCG distributors with one stock location and a handful of staff. It keeps a permanent, append-only record of every stock change with who, when, why and the value in taka; never lets stock go below zero; makes every damage write-off and every correction need a second person; and gives the owner a dashboard of stock value and losses with drill-down, a monthly report and Excel (CSV) import and export. It is a responsive web app (desktop and phone, 320 px and up) in English with light and dark themes, started locally with Docker Compose. It is a free learning project.

Depth: Standard. Request type: new product (greenfield). Scope: web app, API and database in one repository.

## Personas

- Mr. Abdul Haque, Owner: sets up the business, watches value and losses, manages staff.
- Karim, Warehouse worker: records stock, counts, flags damage, mostly on a phone.
- Nasima, Supervisor: decides damage flags.
- Rafiq, Manager: manages products and imports, counts, asks for and decides reversals, decides damage.
- Sales rep and Accountant roles have the same rights as a Warehouse worker.

## Functional Requirements

Each requirement names its origin and has acceptance criteria in Given/When/Then form. Every criterion is checked by an automated test named in the matching story.

### FR-1 Create a business

Origin: intent S1; IB-1. Built in the walking skeleton.

Anyone can sign up a business with business name, owner name, phone (6 to 15 digits after spaces and dashes are removed, unique across all businesses) and password (8 to 128 characters, stored as an Argon2id hash). This creates the business, its Owner and a session, and lands on the Dashboard.
- Given no account uses phone 01712345678, When a person signs up with it and a valid password, Then the business and its Owner are created, they are signed in, and they land on the Dashboard.
- Given phone 01712345678 is already registered in any business, When someone signs up with it, Then sign-up is refused with "This phone number is already registered" and the typed values are kept.
- Given a 7-character password, When the person submits, Then sign-up is refused with "At least 8 characters."

### FR-2 Sign in and out

Origin: IB-1. Built in the walking skeleton; the deactivated-account rule was added in Round 2.

People sign in with phone and password. The session cookie is HttpOnly and SameSite=Lax and ends 12 hours after last use. Every change request carries a CSRF token. Sign out ends the session at once. After sign-in the person returns to the page first asked for, or the Dashboard.
- Given a wrong phone or wrong password, When the person signs in, Then the message is "Sign-in details are not correct." and does not say which field was wrong.
- Given a deactivated account, When the person signs in with the correct password, Then sign-in is refused with "This account is deactivated."
- Given a session last used more than 12 hours ago, When a request arrives, Then it is refused and the person returns to Sign in with "Your session ended. Sign in again."
- Given a signed-in person, When they sign out, Then replaying the old cookie is refused.

### FR-3 Staff

Origin: IB-2 (users). Added in Round 2.

The Owner adds a person with name, phone, password and role (manager, warehouse worker, sales rep, supervisor, accountant). The list shows name, phone, role and status. The Owner deactivates and reactivates people; a deactivated person's session ends on their next request and sign-in is refused. The Owner cannot be deactivated.
- Given the Owner, When they add Karim as a warehouse worker, Then Karim appears in the list as Active and can sign in.
- Given a phone already used, When the Owner adds a person with it, Then it is refused with "This phone number is already registered".
- Given the Owner, When they try to deactivate themselves, Then it is refused with "The owner cannot be deactivated."
- Given a non-Owner, When they call any staff endpoint, Then it is refused with 403.

### FR-4 Role permissions

Origin: IB-1 (six roles). The rules grew with each round; the full table was in place after Round 5.

The server checks the caller on every endpoint. Every query is limited to the caller's business; another business's record answers "not found".

| Action | Owner | Manager | Supervisor | Worker, Sales rep, Accountant |
|---|---|---|---|---|
| See dashboard, products, history, report, approvals | Yes | Yes | Yes | Yes |
| Create, edit, import products | Yes | Yes | No | No |
| Stock in and out (purchase, return, sale, count adjustment) | Yes | Yes | Yes | Yes |
| Stock out as "Damaged" (direct write-off) | Yes | Yes | No (must flag) | No (must flag) |
| Stock count; flag damage | Yes | Yes | Yes | Yes |
| Decide a damage flag (never own) | Yes | Yes | Yes | No |
| Ask for and decide a reversal (never own) | Yes | Yes | No | No |
| See own record | Yes | Yes | Yes | Yes |
| See anyone's record | Yes | Yes | No | No |
| Staff: add, deactivate, reactivate, reset password | Yes | No | No | No |
| Change own password | Yes | Yes | Yes | Yes |

- Given a Warehouse worker, When they call the create-product endpoint directly, Then it is refused with 403 "Only an owner or manager can do this."
- Given users of two businesses, When a user of business A asks for or changes a record of business B by ID, Then the answer is not found.

### FR-5 Passwords

Origin: added during build (Round 3).

Anyone changes their own password on "My password" by giving the current one; their other sessions end and this one stays. The Owner sets a new password for a staff member, which ends all of that person's sessions. The Owner's own password is changed only on "My password".
- Given a wrong current password, When the person submits, Then it is refused with "Your current password is not correct." and nothing changes.
- Given the Owner resets Karim's password, When Karim's old session makes a request, Then it is refused, and Karim signs in with the new password.
- Given the Owner, When they try to reset their own password through Staff, Then it is refused with "Change your own password on the My password page."

### FR-6 Products

Origin: IB-2 (products). Added in Round 1 (slice S1); unit cost added in Round 2.

An Owner or Manager creates a product with SKU (up to 40 characters, unique in the business), name (up to 100), unit (up to 20, for example pcs, ctn, bag), minimum stock (0 or more) and unit cost in taka (0 or more, at most 2 decimals, stored as poisha). They edit name, unit, minimum stock and unit cost; the SKU cannot change.
- Given SKU RICE-25 exists in the business, When another product is saved with it, Then it is refused with "A product with this SKU already exists."; another business may use the same SKU.
- Given a unit cost of 12.345, When the product is saved, Then it is refused under the unit cost field.
- Given a new product, When it is created, Then it has 0 in stock.

### FR-7 Product list and search

Origin: IB-2. Added in Round 1 (slices S1 and S3); value and damaged hold columns added in Rounds 2 and 5.

The list shows SKU, name, in stock, units held as damaged, minimum stock, unit cost, stock value and a status pill: OK, Low (at or below minimum) or Out (at 0). Search by name or SKU narrows the list as you type, ignoring case and treating % and _ as plain text. The number of products is shown.
- Given product "Rice 25 kg" with SKU RICE-25, When a user types "rice", Then it is in the results.
- Given a product with 3 in stock and minimum 5, When the list shows it, Then its pill reads "Low" with an icon; at 0 it reads "Out".

### FR-8 Import products from Excel (CSV)

Origin: IB-4 (opening stock). Added in Round 4.

An Owner or Manager downloads a template (`sku,name,unit,unit_cost,min_stock,opening_stock`) and uploads a CSV. Headers are matched loosely; comma or semicolon separators, Excel numbers such as "1,250.50" or "৳ 100", and a UTF-8 BOM are accepted. Every row is checked in the browser first and problems are listed by spreadsheet row. The server checks again and creates all rows or none. At most 1000 rows. Opening quantities are saved as "Opening stock" movements.
- Given a file with a bad row 4, When it is chosen, Then "Row 4: …" is listed and no Import button is offered.
- Given a SKU that already exists or repeats in the file, When the server checks the import, Then it refuses it naming the row and no product is saved.
- Given an empty file or one over 1000 rows, When it is imported, Then it is refused with "The file has no product rows, or more than 1000."

### FR-9 Stock in and out

Origin: IB-3. Added in Round 1 (slice S2).

A person chooses a product, a direction and a reason (Stock in: purchase, customer return, count adjustment; Stock out: sale, damaged [Owner and Manager only], count adjustment), a whole-number quantity from 1 to 1,000,000, and an optional note of up to 200 characters. The saved message shows the new balance.
- Given Rice has 10 bag, When Karim records Stock out, Sale, 4, Then he sees "Saved. Stock out 4 bag of Rice 25 kg. Now 6 bag in stock."
- Given a quantity of 0 or a reason that does not fit the direction, When the form is saved, Then it is refused naming the field.

### FR-10 Stock never goes negative

Origin: intent S4; IB-3. Added in Round 1.

A change that would take stock below zero is refused with "Only N unit in stock." A conditional update inside one database transaction, backed by a database check, makes sure two simultaneous requests for the last unit cannot both succeed.
- Given Rice has 6 bag, When someone takes out 7, Then it is refused with "Only 6 bag in stock." and nothing changes.
- Given 1 unit left, When two people take it out at the same moment, Then exactly one succeeds.

### FR-11 Permanent stock ledger

Origin: intent S4; IB-3. Added in Round 1; unit cost per movement added in Round 2.

Every change is a movement holding product, direction, reason, quantity, balance after, unit cost at that moment, note, person and time. The database refuses any update or delete of a movement. A product's quantity always equals the sum of its movements.
- Given any recorded movement, When anyone tries to update or delete it, even directly in the database, Then it is refused.
- Given any sequence of changes, When the product is read, Then its quantity equals the sum of its movements.

### FR-12 Stock count

Origin: added during build (Round 2).

A person enters the counted quantity (0 or more) for a product. The product row is locked; the difference is saved as a "Stock count" movement (in for extra, out for missing) with the note "Counted X, system had Y." A matching count saves nothing. The message shows missing or extra units, and the taka value of a shortfall. "Stock count" cannot be chosen by hand on Stock in / out.
- Given the record says 10 bag, When Rafiq counts 8, Then a "Stock count" movement out of 2 bag is saved and he sees "2 bag missing" with its value.
- Given the count matches the record, When it is saved, Then nothing is recorded and he sees "Count matches … Nothing changed."

### FR-13 Flag damage

Origin: added during build (Round 5).

Anyone flags damage: product, quantity (default 1) and an optional note. The units leave sellable stock into a Damaged hold with a "Damage flagged" movement, and a pending approval opens. Nobody can flag more than is in stock.
- Given Rice has 10 bag, When Karim flags 2, Then 8 stay in stock, 2 are held as damaged, and a pending damage approval exists.
- Given 10 in stock, When someone flags 11, Then it is refused and nothing changes.

### FR-14 Decide a damage flag

Origin: added during build (Round 5).

A Supervisor, Manager or Owner who did not raise the flag approves it (written off; the units leave the hold) or rejects it (the units go back into stock with a "Flag rejected, back in stock" movement) in one tap.
- Given Karim's pending flag of 2 bag, When Nasima approves it, Then the hold drops by 2 and in stock stays the same.
- Given the same flag, When Nasima rejects it, Then 2 bag return to stock with a "Flag rejected, back in stock" movement.

### FR-15 Reverse a mistake

Origin: added during build (Round 5).

An Owner or Manager asks to reverse a movement (purchase, return, sale, damaged, adjustment, opening stock), giving a reason. A different Owner or Manager approves it and the opposite "Reversal" movement is recorded, linked to the original. Stock counts and damage-flag movements cannot be reversed. One open or approved reversal per movement. A reversal that would take stock below zero is refused and stays open. A rejected reversal changes nothing and may be asked for again.
- Given a sale of 4 bag, When Haque asks to reverse it and Rafiq approves, Then a "Reversal" movement of 4 bag in is recorded under Rafiq's name, linked to the sale.
- Given a stock count movement, When someone asks to reverse it, Then it is refused with "A stock count cannot be reversed. Count the product again."
- Given a movement with an open reversal, When someone asks again, Then it is refused with "This movement already has a reversal, asked for or approved."

### FR-16 Approvals inbox

Origin: added during build (Round 5).

Approvals has Waiting and Decided tabs. Each card shows kind (Damage flag or Reversal), product, quantity, value in taka, note, who asked and when, and what is being reversed. Approve and Reject show only to people allowed to decide who did not ask; others see "Waiting for someone else to decide." Nobody decides their own request (also a database rule). A decision locks the row, so of two simultaneous decisions only one wins and the other gets "This was already decided."
- Given my own pending flag, When I try to decide it, Then it is refused with "Someone else must decide your own request."
- Given two deciders act at the same moment, When both reach the server, Then one succeeds and the other sees "This was already decided."

### FR-17 Stock value

Origin: added during build (Round 2).

Each product has one unit cost. Stock value is in stock × unit cost. Every movement keeps the unit cost of its moment, so past losses keep their value when the price changes. Money is summed in poisha.
- Given 10 bag at ৳1,250.50, When the list shows the product, Then its stock value is ৳12,505.
- Given a damage write-off at ৳100 and a later price change to ৳120, When losses are shown, Then the write-off is still valued at ৳100 a unit.

### FR-18 Dashboard

Origin: added during build (Round 1 slice S4; value and losses in Round 2; loss split and banner in Round 5).

Everyone sees the Dashboard; it is the home page after sign-in. It shows: a banner "N requests waiting for approval · ৳X held as damaged" linking to Approvals; tiles for stock value (with units and products), losses in the last 30 days split into Written off, Damage flags (less rejected) and Missing in counts, each linking to History filtered by that reason; low stock, out of stock, products and units; a Needs restocking list (out of stock first) with Stock in links; and the 10 most recent movements.
- Given a count shortfall worth ৳200 this month, When Haque opens the Dashboard, Then "Missing in counts" shows ৳200 and links to History filtered by reason "Stock count".
- Given 2 pending approvals, When the Dashboard opens, Then the banner reads "2 requests waiting for approval" and links to Approvals.

### FR-19 Movement history

Origin: added during build (Round 1 slice S4; filters in Round 3; Reverse… in Round 5).

History lists movements newest first, with filters for product, reason, person, from date and to date, kept in the address so they can be shared. Pages of 50 with "Load more". Columns: when, product, change, value, reason and note, balance after, by. Owners and Managers see "Reverse…" on reversible rows.
- Given a filter for reason "Sale" and person Karim, When the page loads, Then only Karim's sales show and the address holds both filters.
- Given 120 movements, When the person presses Load more twice, Then all 120 show.

### FR-20 Stock report

Origin: added during build (Round 4).

For a date range (this month by default), each product shows start quantity, received (purchases, returns, opening stock), sold, damaged (written off and flagged, less rejected), count +/−, adjusted (adjustments and reversals) and end quantity, with taka values at the cost of the time, a total line, and summary tiles for received, sold and lost.
- Given no dates in the address, When Report opens, Then it shows this month.
- Given an end date before the start date, When the report is asked for, Then it shows "Choose a start date on or before the end date." instead of loading.

### FR-21 CSV downloads

Origin: added during build (Round 4).

Three downloads: products (with stock and value), filtered history (same filters, up to 10,000 rows, times in Dhaka time) and the report (with the total line). Files start with a UTF-8 BOM, and text cells starting with = + - @ get a leading apostrophe so Excel does not run them as formulas.
- Given a product named "=HYPERLINK(…)", When the products CSV is downloaded, Then the cell reads "'=HYPERLINK(…)".
- Given History filtered by product, When the history CSV is downloaded, Then it holds the same movements without paging.

### FR-22 My record

Origin: added during build (Round 5).

Each person sees their own work for today (Dhaka time), the last 7 days and the last 30 days: stock in and out movements and units, counts with missing and extra units, damage flags raised by outcome (approved, rejected, waiting), and decisions made for others. An Owner or Manager can pick any person in the business.
- Given Karim raised 3 flags (1 approved, 1 rejected, 1 waiting) today, When he opens My record, Then Today shows "1 approved · 1 rejected · 1 waiting".
- Given a Warehouse worker, When they ask for someone else's record, Then it is refused with "You can see only your own record."

### FR-23 Segregation of duties

Origin: added during build (Round 5).

Only an Owner or Manager writes damage off directly; anyone else who tries is told "Use Flag damage: a supervisor, manager or owner decides it." Nobody decides their own damage flag or reversal.
- Given a Warehouse worker, When they send a Stock out with reason "damage", Then it is refused with that message.
- Given an approval row, When anyone tries to store the requester as the decider, Then the database refuses it.

## Non-Functional Requirements

| ID | Requirement | How it is checked | Origin |
|---|---|---|---|
| NFR-1 Security | Argon2id password hashes; HttpOnly, SameSite=Lax session cookie; CSRF token and Origin check on every change; security headers (CSP, X-Frame-Options DENY, nosniff, same-origin referrer); request body at most 100 KB; every input validated on the server with the shared zod schemas; secrets only in a local `.env`. | API tests for headers, CSRF, Origin, body limit and validation; secret scan in `npm run verify`. | IB-1; team practices |
| NFR-2 Data isolation | Every query is limited to the caller's business. | Cross-business tests on the endpoints. | IB-1 |
| NFR-3 Integrity | Movements are append-only (database trigger); stock never negative (database check and conditional update); approvals are decided once (row lock) and never by the requester (database check). | Database and concurrency tests against real PostgreSQL. | intent S4; IB-3 |
| NFR-4 Usability and look | Responsive from 320 px; desktop side menu with icons; phone bottom tab bar; tables become cards on phones; light, dark and device themes; tinted background, white cards, colour pills with icons, green saved toast; gentle motion only when reduced motion is not requested. | Component tests; browser smoke test at 360 px and 320 px. | Rounds 3 and 5 |
| NFR-5 Accessibility | WCAG 2.1 AA target; automated axe checks in both themes; every text colour pair at least 4.5:1 in light and dark; keyboard path with skip link and visible focus; state never shown by colour alone. | `a11y.test.tsx` and component tests. | team practices |
| NFR-6 Performance | First load, sign-up and sign-in each 2 s or less; `/auth/me` median server time well under 200 ms (budget 50 ms). | Browser smoke test. | walking skeleton |
| NFR-7 Quality | 272 automated tests (unit, API against real PostgreSQL, components with accessibility checks) and 9 browser smoke tests; at least 80% line coverage (about 98%); lint, type check, format check and secret scan; one command, `npm run verify`. | `npm run verify`. | team practices |
| NFR-8 Running | Local only. `npm run dev` (hot reload) or `npm run up` (Docker Compose: web, API, PostgreSQL). Forward-only SQL migrations. No cloud deployment. | `npm run verify` builds and starts the Compose stack. | intent S5; IB-10 |
| NFR-9 Language and money | English interface; taka with lakh grouping (৳12,45,000); Western digits; dates in Bangladesh time in exports. | Component tests for money format; CSV tests. | added during build (Rounds 2 and 4) |

## Constraints

- TypeScript, React web app, Node API, PostgreSQL database (project rules).
- Runs on the builder's machine only; no cloud deployment (project rules).
- One builder working with an AI developer; no deadline or budget.
- No connections to other systems.

## Assumptions

- HTTPS is not used while the app runs only on the builder's machine; the session cookie's `Secure` flag is set from configuration.
- One stock location per business: the quantity lives on the product.

## Open Questions

None.
