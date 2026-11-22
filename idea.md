# Idea: Mojud, Inventory and Stock Management System

## 1. Vision

Mojud is a simple, reliable stock-keeping app for small distribution
businesses. It replaces spreadsheets and paper notebooks with one place that
shows what is in stock, what it is worth in taka, and who changed it, when and
why.

The first version focuses on **one business, one store**, and on getting the
stock numbers right: every change is recorded permanently, stock never goes
below zero, and losses need a second person to approve them.

## 2. The Problem

Small distributors keep stock in notebooks or spreadsheets, and the numbers
drift away from what is really on the shelf:

- **Wrong stock levels:** the record does not match the shelf.
- **Late restocking:** products run out because nobody noticed they were low.
- **Unexplained losses:** stock goes missing or is written off as damaged, and
  nobody can say who did it or why.
- **No history:** it is hard to see when, why and by whom stock was added,
  removed or corrected.
- **Slow reporting:** working out stock value and monthly movement takes hours
  by hand.
- **Weak accountability:** one person can change the numbers with no check.

## 3. What We Built

A web app where the owner creates the business, adds staff with roles, and the
team records every stock change. The app keeps a permanent, append-only record
of stock movements and works out current stock, value and losses from it.

### 3.1 Sign-up, staff and roles

- The owner creates the business and their own account with a phone number and
  password.
- The owner adds staff, gives each one a role, resets passwords, and can
  deactivate or reactivate people.
- Six roles: Owner, Manager, Supervisor, Warehouse worker, Sales rep and
  Accountant.
- Everyone can change their own password. Sessions end 12 hours after last use.

### 3.2 Product catalog

- Add, edit and search products by name or SKU.
- Each product has an SKU, name, unit (for example pcs, ctn, bag), minimum
  stock level and unit cost in taka.
- The product list shows quantity in stock, value, low/out-of-stock status and
  how much is held as damaged.
- Import many products at once from an Excel sheet (saved as CSV), with a
  preview, row-by-row error messages and opening stock.
- Only the Owner and Manager can add, edit or import products.

### 3.3 Stock in and stock out

- Stock in for a purchase or a customer return.
- Stock out for a sale, damage or an adjustment.
- Every movement saves the product, quantity, reason, person, time, note and
  the balance after it.
- Stock can never go below zero, and two people saving at the same moment
  cannot break the balance.
- A direct damage write-off can only be made by the Owner or Manager.

### 3.4 Stock counts

- Count what is on the shelf and enter the number.
- If it differs from the record, the difference is saved as a count movement
  with the person's name and the value of anything missing.

### 3.5 Damage flags and approvals

- Anyone can flag damaged or expired stock. It leaves the sellable stock at
  once and waits for a decision.
- A Supervisor, Manager or Owner approves or rejects it. Rejected stock comes
  back.
- An Owner or Manager can ask to reverse a past movement. A second Owner or
  Manager must approve it.
- Nobody can decide their own request.

### 3.6 History and accountability

- Full movement history with filters by product, reason, person and date, kept
  in the web address so a view can be shared or bookmarked.
- History loads 50 rows at a time with "Load more", and downloads as CSV.
- "My record" shows each person their own movements.
- Movements are never edited or deleted; mistakes are fixed with a new
  movement (a count, an adjustment or an approved reversal).

### 3.7 Dashboard and report

- Dashboard: number of products, units in stock, stock value, low-stock and
  out-of-stock products that need restocking, recent movements, pending
  approvals, stock held as damaged, and losses in the last 30 days (written
  off, damage flags and missing in counts).
- Monthly report per product: start, in, sold, damaged, count +/−, adjusted
  and end, with totals for received, sold and lost, and CSV download.
- Products and the report show 50 rows at a time with "Load more".

### 3.8 Look and feel

- Works on phone and desktop: bottom tabs on a phone, side menu on a desktop.
- Light and dark themes, with colours that meet WCAG AA contrast.
- Keyboard and screen-reader friendly (skip link, labelled fields, clear
  error messages).

## 4. Target Users

- **Owner:** sees stock value and losses, manages staff and products, decides
  approvals.
- **Manager:** manages products and stock, writes off damage, decides
  approvals and reversals.
- **Supervisor:** records stock and approves or rejects damage flags.
- **Warehouse worker, Sales rep, Accountant:** record stock in and out, count,
  flag damage, and view stock, history and reports.

## 5. Not in This Version

These were in the original idea and were left out to keep the first version
small. They are candidates for later rounds:

- Suppliers, purchase orders and tracking deliveries.
- Several warehouses or locations, and transfers between them.
- Sales orders, reserving stock and dispatch.
- Selling prices, product categories, variants, images and barcodes/QR codes.
- Batches, serial numbers and expiry dates.
- Notifications, alerts and automatic reorder suggestions.
- Integrations with accounting, sales or point-of-sale systems.
- Cloud hosting: this round runs only on the builder's machine.

## 6. Guiding Principles

1. **Accuracy first:** the record must match the shelf and never go negative.
2. **Nothing is silently changed:** every change is a new, permanent movement.
3. **Two people for losses:** damage flags and reversals need a second person.
4. **Simple workflows:** common tasks take as few steps as possible.
5. **Clear visibility:** what is low, what is lost and what it is worth are
   visible at a glance.
6. **Controlled access:** each role can do only what it needs.

## 7. How It Is Built

- React web app, Node (Express) API and PostgreSQL database, all in
  TypeScript, sharing one set of data rules between the web app and API.
- Runs locally with Docker Compose; nothing is deployed to the cloud.
- Unit, integration (against a real database) and screen tests, with at least
  80% line coverage, plus a browser smoke test.

## 8. Success Criteria

- Stock balances always match the movement history and never go below zero.
- Every stock change has a person, time, reason and balance after it.
- Every loss (damage, missing in a count) is visible on the dashboard with its
  value in taka.
- No damage flag or reversal is decided by the person who asked for it.
- Owners can see stock value, low stock and losses without building a
  spreadsheet.

**End of idea document.**
