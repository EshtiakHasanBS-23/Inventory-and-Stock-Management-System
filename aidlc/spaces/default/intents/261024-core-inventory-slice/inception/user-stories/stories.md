# User Stories — Mojud core slice

Updated 2026-11-16 to match the built app.

Source: `inception/requirements-analysis/requirements.md` (FR-1 to FR-23, NFR-1 to NFR-9), personas in `personas.md`, team practices (test-after, 80% coverage). Sixteen stories, US-01 to US-16, grouped into five epics. Every story is Must Have and is built. Acceptance criteria use Given/When/Then and each one is independently testable; "Verified by" names the automated tests that prove it.

Test files are cited by short name:
- API (against real PostgreSQL): `apps/api/test/api/auth.test.ts`, `apps/api/test/identity/service.test.ts`, `apps/api/test/identity/password.test.ts`, `apps/api/test/db/schema.test.ts`, `apps/api/test/stock/stock.test.ts`, `apps/api/test/stock/approvals.test.ts`, `apps/api/test/stock/historyAndPasswords.test.ts`, `apps/api/test/stock/importExportReport.test.ts`
- Web components: `apps/web/test/SignUpPage.test.tsx`, `apps/web/test/SignInPage.test.tsx`, `apps/web/test/shell.test.tsx`, `apps/web/test/stockPages.test.tsx`, `apps/web/test/valueCountStaff.test.tsx`, `apps/web/test/accountability.test.tsx`, `apps/web/test/historyAccount.test.tsx`, `apps/web/test/importReport.test.tsx`, `apps/web/test/visual.test.tsx`, `apps/web/test/theme.test.tsx`, `apps/web/test/a11y.test.tsx`
- Browser smoke: `apps/web/e2e/smoke.spec.ts`

## Story Map

| Epic | Stories |
|---|---|
| 1. Set up and access | US-01, US-02, US-03, US-04 |
| 2. Products | US-05, US-06 |
| 3. Record stock | US-07, US-08 |
| 4. Accountability | US-09, US-10, US-11, US-16 |
| 5. Insight | US-12, US-13, US-14, US-15 |

| Scenario | Stories |
|---|---|
| S01 Haque sets up his business | US-01, US-06, US-05, US-03 |
| S02 Karim records the morning delivery | US-02, US-07 |
| S03 Karim flags a wet bag and Nasima decides | US-09, US-10 |
| S04 Rafiq counts the rice shelf | US-08 |
| S05 Haque traces a loss and fixes a mistake | US-12, US-13, US-11 |
| S06 Karim proves his week | US-16 |
| S07 Haque closes the month | US-14, US-15 |
| S08 Karim forgets his password | US-04 |

---

## 1. Set up and access

### US-01 Sign up a business

**As** Mr. Haque, the Owner, **I want** to create my business and my own account in one step, **so that** I can start using Mojud without anyone's help.

- Priority: Must Have
- Requirements: FR-1, NFR-1, NFR-2
- Depends on: none

Acceptance criteria:
- **AC-01.1** Given no account uses phone 01712345678, When I sign up with a business name, my name, that phone and a password of 8 to 128 characters, Then the business and my Owner account are created, I am signed in, and I land on the Dashboard.
- **AC-01.2** Given phone 01712345678 is already registered in any business, When I sign up with it, Then sign-up is refused with "This phone number is already registered" under the phone field and every value I typed is kept.
- **AC-01.3** Given a 7-character password, When I leave the field or submit, Then I see "At least 8 characters."; with two or more problems the error summary lists them all and takes focus.
- **AC-01.4** Given two simultaneous sign-ups with the same phone, When both reach the server, Then one succeeds and the other is refused as a duplicate.
- **AC-01.5** Given I have signed up, When the stored account is inspected, Then the password is stored only as a salted Argon2id hash, and the session cookie is HttpOnly and SameSite=Lax.
- **AC-01.6** Given the server fails while saving, When I submit, Then I see "Couldn't save. Try again." in the focused summary and my values are kept.

INVEST: independent (first story); one form; testable through AC-01.1 to AC-01.6.

Verified by: `auth.test.ts` (sign-up), `service.test.ts` (signUp), `password.test.ts`, `schema.test.ts`, `SignUpPage.test.tsx`, `smoke.spec.ts` ("signs up, lands on the dashboard…").

### US-02 Sign in and out

**As** Karim, a Warehouse worker, **I want** to sign in with my phone and password and sign out when I am done, **so that** my work is recorded under my own name and nobody else can use my session.

- Priority: Must Have
- Requirements: FR-2, NFR-1, NFR-4, NFR-5, NFR-6
- Depends on: US-01

Acceptance criteria:
- **AC-02.1** Given an active account, When I sign in with the right phone (in any typed format) and password, Then I land on the Dashboard, or on the page I first asked for.
- **AC-02.2** Given a wrong password or an unknown phone, When I sign in, Then I see "Sign-in details are not correct." in the summary, with no hint of which field was wrong; both cases give the same answer.
- **AC-02.3** Given a deactivated account, When I sign in with the right password, Then I see "This account is deactivated."
- **AC-02.4** Given I am signed in, When I sign out, Then the session ends at once and replaying the old cookie is refused.
- **AC-02.5** Given I last used Mojud more than 12 hours ago, When I make a request, Then the session has ended and I return to Sign in with "Your session ended".
- **AC-02.6** Given any change request without the right CSRF token or from a foreign Origin, When it reaches the server, Then it is refused with 403.
- **AC-02.7** Given only a keyboard, When I sign in, Then I can use the skip link and see visible focus at every step; first load, sign-up and sign-in each take 2 seconds or less.
- **AC-02.8** Given I chose the dark theme, When I reload the page, Then the dark theme applies before first paint; Device follows the device setting.

INVEST: depends only on an existing account; testable per outcome.

Verified by: `auth.test.ts` (sign-in, sessions, CSRF, Origin), `service.test.ts` (signIn, sessions), `SignInPage.test.tsx`, `shell.test.tsx` (401 handling), `theme.test.tsx`, `a11y.test.tsx`, `smoke.spec.ts` (sign in within 2 s, keyboard only, dark theme).

### US-03 Manage staff

**As** Mr. Haque, the Owner, **I want** to add my staff with their roles, and deactivate or reactivate them, **so that** each person signs in as themselves and can do only what their role allows.

- Priority: Must Have
- Requirements: FR-3, FR-4, NFR-2
- Depends on: US-01

Acceptance criteria:
- **AC-03.1** Given I am the Owner, When I add a person with name, phone, password and a role (manager, warehouse worker, sales rep, supervisor or accountant), Then they appear in the Staff list with name, phone, role and status, and can sign in and record stock.
- **AC-03.2** Given a phone already registered, When I add a person with it, Then it is refused with "This phone number is already registered" under the phone field.
- **AC-03.3** Given an active staff member who is signed in, When I deactivate them, Then their next request ends their session and sign-in is refused; When I reactivate them, Then they can sign in again.
- **AC-03.4** Given I am the Owner, When I try to deactivate myself, Then it is refused with "The owner cannot be deactivated."
- **AC-03.5** Given a Manager, Supervisor, Worker, Sales rep or Accountant, When they open Staff or call the staff endpoints, Then they are sent away or refused, and Staff is not in their menu.
- **AC-03.6** Given another business's staff member, When I try to change them, Then the request answers not found.

INVEST: one owner-only screen; testable per rule.

Verified by: `stock.test.ts` (staff users), `valueCountStaff.test.tsx` (Staff), `smoke.spec.ts` ("lets the owner add a worker…").

### US-04 Passwords

**As** Karim, a Warehouse worker, **I want** to change my own password, and **as** Mr. Haque **I want** to set a new password for a staff member who forgot theirs, **so that** nobody is locked out and an old password stops working.

- Priority: Must Have
- Requirements: FR-5, NFR-1
- Depends on: US-02, US-03

Acceptance criteria:
- **AC-04.1** Given I am signed in, When I enter my current password and a new one of 8 or more characters on My password, Then the password changes, this session stays signed in, my other sessions end, and the form clears.
- **AC-04.2** Given a wrong current password, When I submit, Then I see "Your current password is not correct." under that field and nothing changes.
- **AC-04.3** Given I am the Owner, When I set a new password for Karim on Staff, Then Karim's sessions all end and he signs in with the new password.
- **AC-04.4** Given a non-Owner, a reset of the Owner's own password, or a staff member of another business, When a reset is requested, Then it is refused; the Owner changes their own password only through My password.

INVEST: two small forms; testable per outcome.

Verified by: `historyAndPasswords.test.ts` (passwords), `historyAccount.test.tsx` (My password, Staff password reset).

---

## 2. Products

### US-05 Manage and find products

**As** Rafiq, the Manager, **I want** to add and edit products with their unit, minimum stock and unit cost, and find any product as I type, **so that** stock is recorded against the right product at the right value.

- Priority: Must Have
- Requirements: FR-6, FR-7, FR-17, NFR-2
- Depends on: US-01

Acceptance criteria:
- **AC-05.1** Given I am an Owner or Manager, When I add a product with SKU RICE-25, name, unit bag, minimum stock and unit cost ৳1,250.50, Then it is created with 0 in stock and appears in the list.
- **AC-05.2** Given SKU RICE-25 exists in my business, When I add another product with it, Then it is refused with "A product with this SKU already exists."; another business may use the same SKU.
- **AC-05.3** Given a negative unit cost or one with more than 2 decimals, When I save, Then it is refused under that field and my values are kept.
- **AC-05.4** Given an existing product, When I edit its name, unit, minimum stock or unit cost, Then the change is saved; the SKU cannot be changed.
- **AC-05.5** Given products in the list, When I type part of a name or SKU (any case; % and _ treated as text), Then only matching products show, with "No products match this search." when none match.
- **AC-05.6** Given the list, When I look at a product, Then I see SKU, name, in stock, held as damaged, minimum stock, unit cost, stock value (in stock × unit cost) and a status pill with text: OK, Low (at or below minimum) or Out (0).
- **AC-05.7** Given a Supervisor, Worker, Sales rep or Accountant, When they open Products, Then add and edit are hidden and the server refuses them.
- **AC-05.8** Given another business's product, When I try to edit it, Then the request answers not found.

INVEST: one screen with a form; testable per rule.

Verified by: `stock.test.ts` (products, stock value in taka), `stockPages.test.tsx` (Products), `valueCountStaff.test.tsx` (stock value), `accountability.test.tsx` ("shows held damage on Products…").

### US-06 Import products from Excel

**As** Mr. Haque, the Owner, **I want** to import my product list and opening stock from an Excel CSV file, **so that** I can set up in minutes instead of typing every product.

- Priority: Must Have
- Requirements: FR-8, FR-11
- Depends on: US-05

Acceptance criteria:
- **AC-06.1** Given the downloadable template (sku,name,unit,unit_cost,min_stock,opening_stock), When I fill it and choose the file, Then every row is previewed and, on Import, every product is created with its opening quantity recorded as an "Opening stock" movement.
- **AC-06.2** Given a file saved by Excel with a BOM, semicolons, loose headers, quoted values or numbers like "1,250.50" or "৳ 100", When I choose it, Then it is read correctly; empty numbers count as 0.
- **AC-06.3** Given a file with bad rows, When I choose it, Then each problem is listed with its spreadsheet row number and no Import button is offered.
- **AC-06.4** Given a SKU repeated in the file or already in use, When the server checks the import, Then it refuses it naming the row, and no product is saved.
- **AC-06.5** Given an empty file or one with more than 1000 rows, When I import, Then it is refused with "The file has no product rows, or more than 1000."
- **AC-06.6** Given a Supervisor, Worker, Sales rep or Accountant, When they try to import, Then Import is hidden and the server refuses it.

INVEST: one page; testable with sample files.

Verified by: `importExportReport.test.ts` (product import), `importReport.test.tsx` (reading a product CSV, Import page, CSV download links), `smoke.spec.ts` ("imports products from a CSV…").

---

## 3. Record stock

### US-07 Record stock in and out

**As** Karim, a Warehouse worker, **I want** to record stock coming in and going out with a reason in a few taps on my phone, **so that** the record matches the shelf and shows it was me.

- Priority: Must Have
- Requirements: FR-9, FR-10, FR-11, FR-23, NFR-3
- Depends on: US-05

Acceptance criteria:
- **AC-07.1** Given Rice has 10 bag, When I choose Stock out, reason Sale, quantity 4 and save, Then I see "Saved. Stock out 4 bag of … Now 6 bag in stock." and the movement records product, direction, reason, quantity, balance after, unit cost, note, my name and the time.
- **AC-07.2** Given Rice has 6 bag, When I try to take out 7, Then it is refused with "Only 6 bag in stock." under the quantity and stock is unchanged.
- **AC-07.3** Given 1 unit left, When two people take it out at the same moment, Then exactly one succeeds.
- **AC-07.4** Given a quantity of 0, a fraction or none, or a reason that does not fit the direction, When I save, Then it is refused naming the field.
- **AC-07.5** Given I am a Worker or Supervisor, When I open Stock in / out, Then "Damaged" is not offered and I am pointed to Flag damage; a direct request is refused with "Use Flag damage: a supervisor, manager or owner decides it."; an Owner or Manager can record Damaged directly.
- **AC-07.6** Given any recorded movement, When anyone tries to update or delete it, even directly in the database, Then it is refused, and each product's quantity always equals the sum of its movements.
- **AC-07.7** Given another business's product, When I record stock for it, Then it is refused as if it did not exist.
- **AC-07.8** Given a link from a product row or the Dashboard, When I open Stock in / out, Then that product is already chosen; the direction tiles are real radios usable by keyboard.

INVEST: one screen; testable by balances.

Verified by: `stock.test.ts` (stock in and out), `approvals.test.ts` ("makes workers flag damage…"), `stockPages.test.tsx` (Stock in / out), `visual.test.tsx` (choice tiles), `accountability.test.tsx` ("hides the direct Damaged reason…"), `smoke.spec.ts` ("adds a product, moves stock in and out…").

### US-08 Count stock

**As** Rafiq, the Manager, **I want** to enter what I counted on the shelf and have the difference saved, **so that** the record is corrected openly and I see what is missing in taka.

- Priority: Must Have
- Requirements: FR-12, FR-11, FR-17
- Depends on: US-05

Acceptance criteria:
- **AC-08.1** Given the record says 10 bag, When I enter a count of 8, Then a "Stock count" movement out of 2 bag is saved with note "Counted 8, system had 10." and I see "… 2 bag missing (৳…). Stock adjusted."
- **AC-08.2** Given the record says 10 bag, When I count 12, Then a "Stock count" movement in of 2 bag is saved and I see "… 2 bag extra. Stock adjusted."
- **AC-08.3** Given the count matches the record, When I save, Then nothing is saved and I see "Count matches … Nothing changed."
- **AC-08.4** Given a negative count or another business's product, When I save, Then it is refused.
- **AC-08.5** Given Stock in / out, When I look at the reasons, Then "Stock count" cannot be chosen by hand.

INVEST: one form; testable by movements.

Verified by: `stock.test.ts` (stock counts), `valueCountStaff.test.tsx` (Stock count).

---

## 4. Accountability

### US-09 Flag damage

**As** Karim, a Warehouse worker, **I want** to flag a damaged item so it is held aside until someone else decides, **so that** the damage is on record under my name and I am never accused of a silent write-off.

- Priority: Must Have
- Requirements: FR-13, FR-16, FR-23
- Depends on: US-07

Acceptance criteria:
- **AC-09.1** Given Rice has 10 bag at ৳100, When I flag 2 bag with note "torn bags", Then 8 stay in stock, 2 are held as damaged with a "Damage flagged" movement, a pending approval for ৳200 opens, and I see "Flagged 2 bag of … Waiting for a decision."
- **AC-09.2** Given 10 in stock, When I flag 11, Then it is refused and nothing changes.
- **AC-09.3** Given a product row on Products, When I follow its flag link, Then Flag damage opens with that product chosen and quantity 1.
- **AC-09.4** Given a refusal from the server, When I save, Then it is shown under the field it concerns, or in the summary.

INVEST: one form; testable by stock and the inbox.

Verified by: `approvals.test.ts` (damage flags), `accountability.test.tsx` (Flag damage), `smoke.spec.ts` ("a worker flags damage…").

### US-10 Decide damage flags

**As** Nasima, the Supervisor, **I want** to approve or reject a damage flag in one tap, **so that** losses are confirmed by a second person and the inbox never waits on me.

- Priority: Must Have
- Requirements: FR-14, FR-16, FR-23, NFR-3
- Depends on: US-09

Acceptance criteria:
- **AC-10.1** Given Karim's pending flag, When I open Approvals, Then the Waiting tab shows kind, product, quantity, value in taka, note, who asked and when, with "Approve: write off" and "Reject: back to stock".
- **AC-10.2** Given I tap "Approve: write off", Then the units leave the damaged hold and stay counted as a loss.
- **AC-10.3** Given I tap "Reject: back to stock", Then the units return to stock with a "Flag rejected, back in stock" movement and the loss is cancelled.
- **AC-10.4** Given my own flag, or I am a Worker, When I try to decide it, Then it is refused ("Someone else must decide your own request." for my own) and the card says "Waiting for someone else to decide."; the database also refuses it.
- **AC-10.5** Given two people decide the same flag at the same moment, When both reach the server, Then only one wins and the other sees "This was already decided."
- **AC-10.6** Given decided requests, When I open the Decided tab, Then I see them with their outcome; with none I see "Nothing has been decided yet."

INVEST: one inbox; testable by stock and statuses.

Verified by: `approvals.test.ts` (damage flags, inbox), `accountability.test.tsx` (Approvals inbox), `smoke.spec.ts` ("…a supervisor approves it…").

### US-11 Reverse a mistake

**As** Mr. Haque, the Owner, **I want** to ask for a wrong movement to be reversed, and **as** Rafiq, the Manager, **I want** to approve it, **so that** mistakes are corrected without anyone editing history.

- Priority: Must Have
- Requirements: FR-15, FR-16, FR-11
- Depends on: US-07, US-13

Acceptance criteria:
- **AC-11.1** Given a sale of 4 bag in History, When I choose Reverse… and give the reason "Sold to the wrong shop", Then a pending reversal opens and I see "Reversal asked for. Another owner or manager must approve it."; stock does not change yet.
- **AC-11.2** Given that pending reversal, When Rafiq approves it, Then an opposite "Reversal" movement of 4 bag in is recorded under his name, linked to the sale, with note "Reverses sale: Sold to the wrong shop"; I cannot approve my own.
- **AC-11.3** Given a movement with an open or approved reversal, When anyone asks again, Then it is refused with "This movement already has a reversal, asked for or approved."; after a rejection it may be asked again.
- **AC-11.4** Given a reversal that would take stock below zero, When it is approved, Then it is refused and stays open.
- **AC-11.5** Given a stock count, When I ask to reverse it, Then it is refused with "A stock count cannot be reversed. Count the product again."; damage-flag movements cannot be reversed either.
- **AC-11.6** Given a Worker, When they open History, Then no Reverse… action is offered and the server refuses a direct request; a reason is required.
- **AC-11.7** Given a rejected reversal, Then nothing changes.

INVEST: one request and one decision; testable by movements.

Verified by: `approvals.test.ts` (reversals), `accountability.test.tsx` (Reverse a movement from History; "rejects a reversal…").

### US-16 My record

**As** Karim, a Warehouse worker, **I want** to see my own work for today, the last 7 days and the last 30 days, **so that** I can prove what I did if anyone asks.

- Priority: Must Have
- Requirements: FR-22
- Depends on: US-07, US-08, US-09, US-10

Acceptance criteria:
- **AC-16.1** Given I recorded 2 movements (1 unit in, 2 out), 1 count with 1 missing and 3 damage flags (1 approved, 1 rejected, 1 waiting), When I open My record, Then each of today, 7 days and 30 days shows exactly those figures (days in Bangladesh time).
- **AC-16.2** Given a Supervisor decided 2 requests, When an Owner views that Supervisor's record, Then it shows 2 decisions.
- **AC-16.3** Given I am a Worker, When I ask for someone else's record, Then it is refused; an Owner or Manager can pick any person in their own business, and a person from another business answers not found.

INVEST: read-only page; testable with seeded work.

Verified by: `approvals.test.ts` (my record), `accountability.test.tsx` (My record), `smoke.spec.ts` ("1 approved · 0 rejected · 0 waiting").

---

## 5. Insight

### US-12 See the dashboard and trace losses

**As** Mr. Haque, the Owner, **I want** one page with stock value, losses in taka and what needs attention, **so that** I can trust my numbers from a distance and see where losses came from.

- Priority: Must Have
- Requirements: FR-18, FR-17
- Depends on: US-07

Acceptance criteria:
- **AC-12.1** Given 3 products with stock, When I open the Dashboard, Then I see stock value (with units and products), products, units, low stock and out of stock counts.
- **AC-12.2** Given products at or below minimum, When I open the Dashboard, Then Needs restocking lists them, out of stock first, each with a Stock in link to that product; with none, it says nothing needs restocking.
- **AC-12.3** Given losses in the last 30 days, When I open the Dashboard, Then they are split into Written off, Damage flags (less rejected) and Missing in counts, each valued at the cost of its moment and linking to History filtered by that reason.
- **AC-12.4** Given pending approvals or units held as damaged, When I open the Dashboard, Then a banner shows how many requests wait and the taka held as damaged, linking to Approvals.
- **AC-12.5** Given recent changes, When I open the Dashboard, Then the 10 most recent movements are shown; with none it says nothing has moved.

INVEST: read-only page; testable with seeded movements.

Verified by: `stock.test.ts` ("summarises stock on the dashboard", "totals stock value and 30-day losses…"), `approvals.test.ts` ("holds flagged units…"), `stockPages.test.tsx` (Dashboard), `valueCountStaff.test.tsx` (stock value), `accountability.test.tsx` ("splits losses by source…"), `smoke.spec.ts` ("…the owner sees the loss").

### US-13 Search the history

**As** Mr. Haque, the Owner, **I want** to filter every stock movement by product, reason, person and dates, **so that** I can see exactly who changed what, when and why.

- Priority: Must Have
- Requirements: FR-19, FR-11
- Depends on: US-07

Acceptance criteria:
- **AC-13.1** Given movements, When I open History, Then they are listed newest first with when, product, change, value in taka, reason and note, balance after and who.
- **AC-13.2** Given filters for product, reason, person, from date and to date, When I apply them, Then only matching movements show (from inclusive, to exclusive), the filters are kept in the address, and Clear removes them.
- **AC-13.3** Given more than 50 movements, When I press Load more, Then the next 50 are added until there are no more.
- **AC-13.4** Given an invalid filter, When it reaches the server, Then it is refused naming the field; the person list shows only people in my business.
- **AC-13.5** Given History cannot load, Then the page says so.

INVEST: read-only page; testable with seeded movements.

Verified by: `stock.test.ts` (history and dashboard), `historyAndPasswords.test.ts` (history filters), `historyAccount.test.tsx` (History filters), `stockPages.test.tsx` (History), `valueCountStaff.test.tsx` ("shows each movement's value…").

### US-14 Monthly stock report

**As** Mr. Haque, the Owner, **I want** a stock report for a date range, **so that** I can close the month knowing what came in, went out and was lost, in units and taka.

- Priority: Must Have
- Requirements: FR-20, FR-17
- Depends on: US-07, US-08, US-09

Acceptance criteria:
- **AC-14.1** Given I open Report, Then this month is shown by default.
- **AC-14.2** Given movements in the range, When the report loads, Then each product shows start quantity, received, sold, damaged (less rejected), count +/−, adjusted and end quantity, with values in taka at the cost of the time, a total line and tiles for received, sold and lost.
- **AC-14.3** Given dates in the address or changed in the date boxes, When the report loads, Then it uses that range; with no movements it says nothing moved.
- **AC-14.4** Given a missing or backwards range, When I ask for the report, Then it asks for a valid range instead of loading.

INVEST: read-only page; testable with seeded movements.

Verified by: `importExportReport.test.ts` (stock report), `importReport.test.tsx` (Report page), `smoke.spec.ts` ("…shows them in the report").

### US-15 Download CSV

**As** Mr. Haque, the Owner, or an Accountant, **I want** to download products, history and the report as CSV files that open in Excel, **so that** I can keep and share the figures.

- Priority: Must Have
- Requirements: FR-21, NFR-9
- Depends on: US-05, US-13, US-14

Acceptance criteria:
- **AC-15.1** Given products, When I download the products CSV, Then it lists my business's products with stock and value only.
- **AC-15.2** Given History filters, When I download the history CSV, Then it holds the same filtered movements without paging (up to 10,000 rows), with dates in Dhaka time.
- **AC-15.3** Given a report, When I download its CSV, Then it includes the total line.
- **AC-15.4** Given a cell starting with =, +, - or @, When it is written, Then it gets a leading apostrophe; values are quoted where needed and the file starts with a UTF-8 BOM.

INVEST: three links; testable by file contents.

Verified by: `importExportReport.test.ts` (CSV writer, CSV exports), `importReport.test.tsx` (CSV download links), `smoke.spec.ts` ("…downloads CSVs…").

---

## Non-Functional Coverage

| Requirement | Where it is checked |
|---|---|
| NFR-1 Security | AC-01.5, AC-02.4, AC-02.5, AC-02.6, AC-04.1, AC-04.3; security headers and body limit in `platform.test.ts` and `auth.test.ts` |
| NFR-2 Data isolation | AC-03.6, AC-05.8, AC-07.7, AC-08.4, AC-16.3 |
| NFR-3 Integrity | AC-07.2, AC-07.3, AC-07.6, AC-10.4, AC-10.5, AC-11.4 |
| NFR-4 Usability and look | AC-02.8, AC-07.8; 360 px phone layout in `smoke.spec.ts` |
| NFR-5 Accessibility | AC-02.7; axe checks and contrast in `a11y.test.tsx` and component tests |
| NFR-6 Performance | AC-02.7 |
| NFR-7 Quality | `npm run verify` (tests, coverage, lint, type check, format, secret scan) |
| NFR-8 Running | `npm run dev` and `npm run up` |
| NFR-9 Language and money | AC-05.1, AC-15.2; lakh grouping in `valueCountStaff.test.tsx` |

## Won't Have (this time)

None.

## Assumptions & Open Questions

None.
