---
title: "PRD: Mojud (working name)"
status: final
created: 2026-10-22
updated: 2026-11-16
inputs:
  - _bmad-output/planning-artifacts/briefs/brief-E2E_IAM-2026-10-22/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-E2E_IAM-2026-10-22/addendum.md
---

# PRD: Mojud (working name)

*Mojud (মজুদ) means "stock" in Bangla. The name is temporary.*

## 0. Document Purpose

This PRD describes **what** Mojud does, as it has been built. It is written for anyone who needs to understand the product: the builder, a reviewer, or a business owner trying it out. It says what each feature does and how to check it, not how the code works.

- Requirements are in plain language. Each FR (functional requirement) can be tested on its own, using the short acceptance rules under it.
- Words defined in the **Glossary (§3)** have one meaning only, and the rest of the document uses them exactly as defined.
- Features (§4) are grouped by area. FR numbers are fixed and are the same IDs used in the user stories and tests.
- Guesses that still need checking with real users are marked `[ASSUMPTION]` and listed again in §9.
- Technical notes that support this PRD are in this PRD's `addendum.md`.

## 1. Vision

Mojud is a simple, reliable stock-control web app for **small FMCG distributors in Bangladesh**: one stock location and a handful of staff. It replaces Excel sheets and paper khatas with one shared, permanent record of stock.

The core idea is **trust through a record nobody can quietly change**:

- Every stock change is saved permanently with who made it, when, why, and its value in taka. Nothing is ever edited or deleted.
- Stock can never go below zero.
- Every damage write-off and every correction needs a second person.
- The owner sees stock value and losses in taka on one dashboard, and can follow every loss back to the movements behind it.
- Each worker can see their own record of work, which protects them from blame for gaps they did not cause.

Mojud runs in a web browser on a desktop or a phone (320 pixels wide and up), in English, with light and dark themes. It runs locally, started with one command. It is a free learning project with no business model.

## 2. Target Users

### 2.1 Personas and Jobs To Be Done

*The names are illustrative personas.*

| Role | Persona | Job |
|---|---|---|
| **Owner** | Mr. Abdul Haque, the main decision maker, at his desk and on his phone | "Let me trust my stock numbers without visiting the warehouse, show me where I am losing taka, and make sure nobody can write stock off on their own." |
| **Manager** | Rafiq | "Help me keep the product list right, count stock accurately, and correct mistakes without rewriting history." |
| **Supervisor** | Nasima | "Let me decide damage flags quickly and fairly, and never be asked to approve my own." |
| **Warehouse worker** | Karim, on his phone | "Let me record my work in seconds and prove what I did." |
| **Sales rep** | | "Let me see how much stock there is and record what I sell." |
| **Accountant** | | "Give me a stock value and a monthly report I can trace back to individual stock movements, and let me download them." |

Sales reps and Accountants can see everything, record stock in and out, count stock, flag damage and see their own record, the same as a Warehouse worker (FR-4).

### 2.2 Key User Journeys

These journeys match UX scenarios S01–S08. Priority: S02, S03 and S05 are P1; S01, S04 and S06 are P2; S07 and S08 are P3.

- **UJ-1 (S01). Haque sets up his business.**
  Haque signs up with his business name, his name, his phone number and a password, and lands on the Dashboard as the **Owner** (FR-1). He downloads the import template, fills in his products in Excel with their opening stock, saves it as CSV and imports it. Mojud checks every row first and lists any problems by spreadsheet row. Once the file is clean, all products are created in one go, and each opening quantity is saved as an "Opening stock" **Stock movement** (FR-8). He checks the Products list (FR-7) and adds Karim, Nasima and Rafiq on the Staff page, each with a role (FR-3).

- **UJ-2 (S02). Karim records the morning delivery.**
  Karim signs in on his phone (FR-2), opens **Stock in / out**, picks "Rice 25 kg", chooses Stock in, reason Purchase, and enters 40. Mojud shows "Saved" with the new balance (FR-9). Later he tries to record a sale of 60 bags when only 52 are in stock. Mojud refuses with "Only 52 bag in stock." and nothing changes (FR-10).

- **UJ-3 (S03). Karim flags a wet bag and Nasima decides.**
  Karim finds a wet bag of flour and taps **Flag damage**. The quantity defaults to 1. The bag leaves sellable stock and goes into the **Damaged hold**, and an **Approval** opens (FR-13). Nasima, a Supervisor, opens **Approvals**, sees the card for the flag (Damage flag, Flour 2 kg, quantity 1, its value in taka, asked by Karim and when), and taps Approve. The bag is written off (FR-14, FR-16). Karim could not have approved his own flag, and he could not have written the bag off directly (FR-23).

- **UJ-4 (S04). Rafiq counts the rice shelf.**
  Rafiq opens **Stock count**, picks "Rice 25 kg" and enters 50. Mojud had 52. It saves a "Stock count" movement taking out 2 bags with the note "Counted 50, system had 52." and shows how many units and how much taka are missing (FR-12).

- **UJ-5 (S05). Haque traces a loss and fixes a mistake.**
  On the **Dashboard**, Haque sees losses for the last 30 days split into Written off, Damage flags and Missing in counts (FR-18). He taps "Missing in counts" and lands on the **History**, already filtered to stock-count movements (FR-19). He also spots a purchase of 400 that should have been 40. He taps **Reverse…** on that row and gives a reason. Rafiq, a different Manager, approves it in Approvals, and Mojud records the opposite **Reversal** movement, linked to the original. Both rows stay in the history (FR-15).

- **UJ-6 (S06). Karim proves his week.**
  Karim opens **My record** and sees, for today, the last 7 days and the last 30 days, how many stock movements and units he recorded, his counts, and his damage flags with how many were approved, rejected or still waiting (FR-22).

- **UJ-7 (S07). Haque closes the month.**
  Haque opens **Report**. It shows this month by default: for each product, the start quantity, what came in, what was sold, damaged, counted and adjusted, and the end quantity, with values in taka and a total line (FR-20). He downloads the report, the product list and the filtered history as CSV files for his accountant (FR-21).

- **UJ-8 (S08). Karim forgets his password.**
  Karim tells Haque. Haque opens **Staff** and sets a new password for Karim, which signs Karim out everywhere (FR-5). Karim signs in with it and then chooses his own password on **My password**.

## 3. Glossary

- **Business**: one company using Mojud. All data belongs to exactly one Business. Businesses never see each other's data.
- **User**: a person who signs in to Mojud with a phone number and password. A User belongs to one Business and has one **Role**.
- **Role**: one of six fixed roles that decide what a User can do: Owner, Manager, Supervisor, Warehouse worker, Sales rep, Accountant (see FR-4).
- **Product**: an item the Business stocks, with a **SKU**, a name, a unit (such as pcs, ctn or bag), a minimum stock and a **Unit cost**.
- **SKU**: the Business's unique code for a Product. It cannot be changed after the Product is created.
- **In stock**: the sellable quantity of a Product. It never goes below zero.
- **Stock movement**: one permanent record of a change in stock. It holds the Product, direction (in or out), reason, quantity, balance after, Unit cost at that moment, note, the User and the time. It is never edited or deleted.
- **Reason**: why a Stock movement happened. The reasons are: Purchase, Customer return, Sale, Damaged, Count adjustment, Opening stock, Stock count, Damage flagged, Flag rejected (back in stock) and Reversal.
- **Stock ledger**: the full list of Stock movements. A Product's In stock quantity always equals the sum of its movements.
- **Damage flag**: a report by any User that some units are damaged. It moves them out of sellable stock into the **Damaged hold** and opens an **Approval**.
- **Damaged hold**: units that have been flagged as damaged and are waiting for a decision. They are not sellable.
- **Write-off**: removing stock as a loss. It happens when a Damage flag is approved, or when an Owner or Manager records a Stock out with the reason Damaged.
- **Approval**: a request that a second person must decide: either a Damage flag or a Reversal. Nobody can decide their own request.
- **Approvals inbox**: the screen listing Approvals, with Waiting and Decided tabs.
- **Reversal**: a new Stock movement that cancels an earlier, mistaken one by recording the opposite change. It is asked for by an Owner or Manager and approved by a different Owner or Manager.
- **Stock count**: entering the quantity actually counted on the shelf for a Product. Any difference is saved as a Stock movement.
- **Unit cost**: the cost of one unit of a Product in taka. Each Product has one.
- **Stock value**: In stock × Unit cost, in taka.
- **Minimum stock**: the level at or below which a Product counts as low.
- **Low stock**: In stock is at or below Minimum stock (and above zero). **Out of stock**: In stock is 0.
- **Losses**: the value in taka of stock written off, of Damage flags (less those rejected) and of units missing in Stock counts.
- **Dashboard (owner view)**: the home screen after sign-in, showing Stock value, losses, low stock, items waiting for approval and recent movements. Every User can see it.
- **My record**: a User's own summary of the work they recorded, which is their proof of work.

## 4. Features

### 4.1 Business, Staff and Roles

**Description:** An Owner creates a Business and adds staff. Each User's Role controls what they can do. For damage write-offs and corrections, the person who does the work and the person who approves it must be different (segregation of duties).

#### FR-1: Create a business
Anyone can sign up a new Business on the public sign-up page by entering the business name, the Owner's name, a phone number and a password.
- The phone number must be 6–15 digits and must not already be used by any User of any Business.
- The password must be 8–128 characters.
- Sign-up creates the Business and its Owner, signs the Owner in, and opens the Dashboard.

#### FR-2: Sign in and out
A User signs in with their phone number and password, and can sign out.
- Any failed sign-in shows the same message, "Sign-in details are not correct.", whichever field was wrong.
- A deactivated User who enters the correct password sees "This account is deactivated." and is not signed in.
- A session ends 12 hours after it was last used.
- Signing out ends the session at once.
- After signing in, the User returns to the page they first asked for.

#### FR-3: Manage staff
The Owner can add a User with a name, phone number, password and Role (Manager, Warehouse worker, Sales rep, Supervisor or Accountant).
- The staff list shows each person's name, phone number, Role and status (Active or Deactivated).
- A phone number that is already used is refused with "This phone number is already registered".
- The Owner can deactivate a User. Their open sessions end on their next request, and they cannot sign in again. Their past Stock movements keep their name.
- The Owner can reactivate a deactivated User.
- The Owner cannot be deactivated.

#### FR-4: Role permissions
The system checks this table on the server for every request, not only by hiding buttons.

| Action | Owner | Manager | Supervisor | Warehouse worker, Sales rep, Accountant |
|---|---|---|---|---|
| See the Dashboard, Products, History, Report and Approvals list | ✓ | ✓ | ✓ | ✓ |
| Create, edit and import Products | ✓ | ✓ | | |
| Stock in and out (Purchase, Customer return, Sale, Count adjustment) | ✓ | ✓ | ✓ | ✓ |
| Stock out with the reason Damaged (direct Write-off) | ✓ | ✓ | | |
| Stock count | ✓ | ✓ | ✓ | ✓ |
| Flag damage | ✓ | ✓ | ✓ | ✓ |
| Decide a Damage flag (never their own) | ✓ | ✓ | ✓ | |
| Ask for a Reversal | ✓ | ✓ | | |
| Decide a Reversal (never their own) | ✓ | ✓ | | |
| See own My record | ✓ | ✓ | ✓ | ✓ |
| See anyone's My record | ✓ | ✓ | | |
| Add, deactivate and reactivate staff; set a staff member's password | ✓ | | | |
| Change own password | ✓ | ✓ | ✓ | ✓ |

- Every request only sees the caller's own Business. A record that belongs to another Business is answered as "not found".

#### FR-5: Passwords
- Any User can change their own password on **My password** by entering their current password and a new one. A wrong current password is refused with "Your current password is not correct." After a change, the User's other sessions end and the current one stays signed in.
- The Owner can set a new password for a staff member from the Staff page. All of that person's sessions end.
- The Owner changes their own password only through My password.

### 4.2 Products

#### FR-6: Create and edit products
An Owner or Manager can create a Product with a SKU, name, unit, minimum stock and Unit cost.
- The SKU is at most 40 characters and unique within the Business.
- The name is at most 100 characters; the unit is at most 20 characters (for example pcs, ctn or bag).
- Minimum stock is a whole number of 0 or more.
- Unit cost is in taka, 0 or more, with at most 2 decimal places.
- An Owner or Manager can edit the name, unit, minimum stock and Unit cost. The SKU cannot be changed.

#### FR-7: Product list and search
Every User can see the list of Products.
- Each row shows SKU, name, In stock, units in the Damaged hold, minimum stock, Unit cost, Stock value and a status pill: **OK**, **Low** (at or below minimum) or **Out** (0).
- Typing in the search box filters by name or SKU as the User types. Upper and lower case are ignored, and characters such as `%` or `_` are treated as plain text.
- The page shows how many Products there are.

#### FR-8: Import products from Excel (CSV)
An Owner or Manager can create many Products at once from a CSV file saved from Excel.
- A template can be downloaded with the columns `sku, name, unit, unit_cost, min_stock, opening_stock`.
- Column headers are matched loosely, so small differences in how they are written are accepted. Commas or semicolons both work as separators. Excel-style numbers such as "1,250.50" or "৳ 100" are accepted. A UTF-8 byte-order mark is handled.
- Every row is checked in the browser before anything is sent, and each problem is listed with its spreadsheet row number.
- The server checks the file again and creates **all rows or none**. A SKU that appears twice in the file, or already exists, is refused with its row number.
- A file may have at most 1,000 rows.
- Each opening quantity is saved as an "Opening stock" Stock movement.

### 4.3 Stock In, Out and the Stock Ledger

**Description:** This is the core of the system. Every change is a Stock movement in the Stock ledger. Stock never goes negative, and nothing in the ledger can be changed afterwards.

#### FR-9: Record stock in and out
Any User can record a stock change by choosing a Product, a direction, a reason, a quantity and an optional note.
- Stock in reasons: Purchase, Customer return, Count adjustment.
- Stock out reasons: Sale, Damaged (Owner and Manager only, see FR-23), Count adjustment.
- The quantity is a whole number from 1 to 1,000,000. The note is at most 200 characters.
- After saving, a message confirms the change and shows the new In stock balance.

#### FR-10: Stock never goes negative
- A change that would take In stock below zero is refused with "Only N {unit} in stock." (for example "Only 52 bag in stock."), and nothing is saved.
- If two people try to take the last unit at the same moment, only one succeeds.

#### FR-11: Permanent stock ledger
- Every stock change creates one Stock movement holding the Product, direction, reason, quantity, balance after, Unit cost at that moment, note, User and time.
- No one can edit or delete a Stock movement, not even the Owner. The database itself refuses it.
- A Product's In stock quantity always equals the sum of its Stock movements.

#### FR-12: Stock count
Any User can enter the counted quantity (0 or more) for a Product.
- If the count differs from In stock, the difference is saved as a "Stock count" movement: in for extra units, out for missing units, with the note "Counted X, system had Y."
- If the count matches, nothing is saved and the User is told the count matches.
- The message shows how many units are missing or extra, and the value of missing units in taka.
- While a count is being saved, no other change to that Product can slip in between.

### 4.4 Damage and Approvals

#### FR-13: Flag damage
Any User can flag damage on a Product, from Stock in / out or from the Product's row.
- The User enters the quantity (default 1) and an optional note.
- The units leave sellable stock and move into the Damaged hold, recorded as a "Damage flagged" movement, and an Approval opens.
- A User cannot flag more units than are In stock.

#### FR-14: Decide a damage flag
A Supervisor, Manager or Owner who did not raise the flag can decide it with one tap.
- **Approve:** the units are written off and leave the Damaged hold.
- **Reject:** the units return to sellable stock, recorded as a "Flag rejected, back in stock" movement.
- Who decided and when are recorded.

#### FR-15: Reverse a mistake
An Owner or Manager can ask to reverse a Stock movement from the History, giving a reason.
- Movements that can be reversed: Purchase, Customer return, Sale, Damaged, Count adjustment and Opening stock.
- Stock count and Damage flag movements cannot be reversed.
- A different Owner or Manager approves it. Mojud then records the opposite movement with the reason "Reversal", linked to the original. Both stay in the history.
- A movement can have only one open or approved Reversal at a time.
- If approving would take stock below zero, the approval is refused and the request stays open.
- If the request is rejected, nothing changes and it can be asked again.

#### FR-16: Approvals inbox
Every User can open **Approvals**, which has **Waiting** and **Decided** tabs.
- Each card shows the kind (Damage flag or Reversal), Product, quantity, value in taka, note, who asked and when, and, for a Reversal, which movement it reverses.
- Approve and Reject buttons appear only for people allowed to decide that kind who did not ask for it. Everyone else sees "Waiting for someone else to decide."
- Nobody can decide their own request. The database also enforces this.
- If two people decide the same request at the same moment, only one decision counts. The other sees "This was already decided."

#### FR-23: Segregation of duties
- Only an Owner or Manager can record a Stock out with the reason Damaged. Anyone else who tries is told "Use Flag damage: a supervisor, manager or owner decides it."
- Nobody can decide their own Damage flag or Reversal.

### 4.5 Value, Dashboard and Reports

#### FR-17: Stock value
- Each Product has one Unit cost.
- Stock value = In stock × Unit cost.
- Every Stock movement keeps the Unit cost of its moment, so the value of past losses does not change when the Unit cost is edited later.
- Money is added up in poisha (1/100 taka), so totals have no rounding drift.

#### FR-18: Dashboard (owner view)
Every User can see the Dashboard. It is the home screen after sign-in.
- A banner shows "N requests waiting for approval" and the value held as damaged, and links to Approvals.
- Tiles show: Stock value (with the number of units and Products); losses in the last 30 days split into **Written off**, **Damage flags** (less rejected) and **Missing in counts**, each linking to the History filtered by that reason; and the numbers of low-stock Products, out-of-stock Products, Products and units.
- A **Needs restocking** list shows low and out-of-stock Products, out of stock first, each with a Stock in link.
- The 10 most recent Stock movements are listed.

#### FR-19: Movement history
Every User can see all Stock movements, newest first.
- Filters: Product, reason, person, from date and to date. The filters are kept in the page address, so a filtered view can be shared or bookmarked.
- Results come in pages of 50 with a "Load more" button.
- Columns: when, Product, change, value, reason and note, balance after, and by whom.
- Owners and Managers see a **Reverse…** action on rows that can be reversed (FR-15).

#### FR-20: Stock report
Every User can open the stock report for a date range (this month by default).
- For each Product it shows: start quantity; received (purchases, customer returns, opening stock); sold; damaged (written off and flagged, less rejected); counted plus or minus; adjusted (count adjustments and reversals); and end quantity.
- Values are in taka at the Unit cost of the time of each movement.
- A total line is shown, with summary tiles for received, sold and lost.

#### FR-21: CSV downloads
Every User can download CSV files that open in Excel:
- **Products**, with In stock and Stock value.
- **History**, with the same filters as on screen, up to 10,000 rows, with times in Bangladesh time.
- **Report**, with the total line.
- Files start with a UTF-8 byte-order mark so Excel shows the taka sign and any non-English text correctly.
- Any cell starting with `=`, `+`, `-` or `@` gets a leading apostrophe, so Excel never runs it as a formula.

### 4.6 My Record

#### FR-22: My record
Every User can see their own record for **today** (Bangladesh time), the **last 7 days** and the **last 30 days**:
- Stock in and out: number of movements and units.
- Stock counts, with missing and extra units.
- Damage flags raised, by outcome: approved, rejected or waiting.
- Decisions made on other people's requests.

Owners and Managers can pick any person and see their record.

## 5. Cross-Cutting Non-Functional Requirements

- **NFR-1 Security:** Passwords are stored only as Argon2id hashes. The session cookie cannot be read by page scripts (HttpOnly, SameSite=Lax). Every change needs a CSRF token and a matching Origin. Security headers are sent (Content Security Policy, X-Frame-Options DENY, nosniff, same-origin referrer). Request bodies are limited to 100 KB. All input is validated on the server with the same rules the browser uses. Secrets live only in a local `.env` file.
- **NFR-2 Data isolation:** Every query is limited to the caller's Business. Automated endpoint tests confirm that one Business cannot read or change another's data.
- **NFR-3 Integrity:** Stock movements are append-only (a database trigger refuses updates and deletes). Stock never goes negative (a database check plus a conditional update). An Approval is decided only once (row lock) and never by the person who asked (database check).
- **NFR-4 Usability and look:** Every screen works from 320 pixels wide without sideways scrolling. Desktop has a side menu with icons; phones have a bottom tab bar. Tables become cards on phones. Light, dark and "follow the device" themes. Clear colour pills with icons and a green "saved" message. Motion is switched off when the device asks for reduced motion.
- **NFR-5 Accessibility:** The target is WCAG 2.1 AA. Automated accessibility (axe) checks run in both themes. Every text colour pair has a contrast of at least 4.5:1 in light and dark, and this is tested. The app can be used by keyboard alone, with a skip link and a visible focus outline. State is never shown by colour alone.
- **NFR-6 Performance:** Checked by the browser smoke test: first load, sign-up and sign-in each take 2 seconds or less. The median server time for the "who am I" request (`/auth/me`) stays well under 200 ms (budget 50 ms).
- **NFR-7 Quality:** 272 automated tests (unit, API tests against a real PostgreSQL database, and screen tests with accessibility checks) plus 9 browser smoke tests. Line coverage at least 80% (currently about 98%). Lint, type check, format check and secret scan. All of it runs with one command, `npm run verify`.
- **NFR-8 Running:** Local only. `npm run dev` starts it with hot reload; `npm run up` starts web, API and PostgreSQL with Docker Compose. Database changes are forward-only SQL migrations.
- **NFR-9 Language and money:** The interface is in English. Taka amounts use lakh grouping (for example ৳12,45,000) and Western digits. Exported dates and times are in Bangladesh time.

## 6. Scope (what is built)

| Area | FRs | Screens |
|---|---|---|
| Sign up, sign in, staff, roles and passwords | FR-1 – FR-5 | Sign up, Sign in, Staff, My password |
| Products, search and Excel import | FR-6 – FR-8 | Products, Import |
| Stock in / out, never-negative rule and permanent ledger | FR-9 – FR-11 | Stock in / out |
| Stock count | FR-12 | Stock count |
| Damage flags, approvals, reversals and segregation of duties | FR-13 – FR-16, FR-23 | Flag damage, Approvals, History (Reverse…) |
| Stock value, Dashboard, History, Report and CSV downloads | FR-17 – FR-21 | Dashboard, History, Report |
| My record | FR-22 | My record |

**Screens and addresses:** `/signup`, `/signin`, `/dashboard`, `/products`, `/products/import`, `/stock`, `/count`, `/damage`, `/history`, `/approvals`, `/reports`, `/record`, `/staff` (Owner only), `/account` (My password).

**Menu order:** Dashboard, Products, Stock in / out, Stock count, History, Approvals, Report, My record, Staff (Owner only), My password. Flag damage is reached from Stock in / out and from each Product row.

**User stories:**

| Story | FRs | Persona |
|---|---|---|
| US-01 Sign up a business | FR-1 | Haque |
| US-02 Sign in and out | FR-2 | Karim |
| US-03 Manage staff | FR-3, FR-4 | Haque |
| US-04 Passwords | FR-5 | Karim, Haque |
| US-05 Manage and find products | FR-6, FR-7, FR-17 | Rafiq |
| US-06 Import products from Excel | FR-8 | Haque |
| US-07 Record stock in and out | FR-9, FR-10, FR-11, FR-23 | Karim |
| US-08 Count stock | FR-12 | Rafiq |
| US-09 Flag damage | FR-13 | Karim |
| US-10 Decide damage flags | FR-14, FR-16, FR-23 | Nasima |
| US-11 Reverse a mistake | FR-15, FR-16 | Haque asks, Rafiq approves |
| US-12 See the dashboard and trace losses | FR-18, FR-17 | Haque |
| US-13 Search the history | FR-19 | Haque |
| US-14 Monthly stock report | FR-20 | Haque |
| US-15 Download CSV | FR-21 | Haque, Accountant |
| US-16 My record | FR-22 | Karim |

## 7. Success Metrics

**Business goal**
- **SM-1 Product proof:** one real distributor uses Mojud instead of Excel or a khata for 8 weeks in a row. `[ASSUMPTION: target to be confirmed with a real distributor]`

**Built-in guarantees (checked by automated tests)**
- **SM-2 Complete record:** 100% of stock changes have a User, time, reason and value. Enforced by FR-9 – FR-13 and FR-11.
- **SM-3 No negative stock:** 0 Products with In stock below zero, including under simultaneous requests. Enforced by FR-10 and NFR-3.
- **SM-4 No silent write-offs:** 100% of damage write-offs are either recorded by an Owner or Manager, or approved by a second person. Enforced by FR-14 and FR-23.
- **SM-5 Traceable losses:** every taka in the Dashboard loss tiles can be followed to the Stock movements behind it in one tap. Checked through FR-18 and FR-19.

**Usage (measured once real users try it)** `[ASSUMPTION: targets are provisional]`
- **SM-6 Damage decided quickly:** Damage flags are decided within 24 hours of being raised (from Approvals: time asked and time decided).
- **SM-7 Count accuracy:** the share of Stock counts that match In stock rises month on month (from "Stock count" movements in the History).

**Product quality**
- **SM-8:** all automated tests pass, line coverage stays at or above 80%, and the NFR-6 time budgets hold, every time `npm run verify` runs.

## 8. Assumptions

- The Business has **one stock location** and a handful of staff.
- Each Product has one **unit** (for example pcs, ctn or bag); all quantities are whole numbers of that unit.
- Each Product has one **Unit cost**, edited by an Owner or Manager; movements keep the cost of their moment.
- The Owner manages staff and passwords; a forgotten password is reset by the Owner (FR-5).
- Only demo and test data is used while the app runs locally.

## 9. Assumptions Index

- §7 SM-1: the 8-week target is to be confirmed with a real distributor.
- §7 SM-6, SM-7: usage targets are provisional until checked with real users.

## 10. Change log

**2026-10-24** — applied UX design decisions from the first design round.

**2026-11-16** — Rewritten to match the built app; features that were not built were removed.
