---
title: "Mojud - Experience"
name: Mojud
status: as-built
created: 2026-10-22
updated: 2026-11-16
sources:
  - apps/web/src/pages/
  - apps/web/src/components/
  - apps/web/src/session/roles.ts
  - apps/web/src/i18n/en.json
  - _bmad-output/planning-artifacts/prds/prd-E2E_IAM-2026-10-22/prd.md
  - design-process/C-UX-Scenarios/
---

# Mojud — Experience (as built)

> How the app behaves today. Look and tokens live in `DESIGN.md`. Requirements are cited by ID (FR-n, NFR-n, US-nn) from the PRD; scenarios (S01–S08) match `design-process/C-UX-Scenarios/`. All quoted copy is from `apps/web/src/i18n/en.json` or the API's messages.
>
> Mockups of the built screens: [Dashboard](mockups/key-dashboard.html), [Stock in / out](mockups/key-stock-movement.html), [Approvals](mockups/key-approvals.html), [Products](mockups/key-products.html).

## Foundation

Mojud is a responsive web app for one stock location and a handful of staff. Everyone signs in with a phone number and password, lands on the Dashboard and uses the same menu; what a person may do depends on their role. Every stock change is a permanent movement with who, when, why and value in taka. Damage write-offs by non-managers and every reversal need a second person. The UI is in English, works from 320 px wide, and offers Light, Dark and Device themes.

## Screens

| Route | Page (`h1`) | Who can open it | What it does |
|---|---|---|---|
| `/signup` | Create your business | Signed out | FR-1 |
| `/signin` | Sign in | Signed out | FR-2 |
| `/dashboard` | Dashboard | Everyone | FR-18 |
| `/products` | Products | Everyone (add/edit only Owner, Manager) | FR-6, FR-7, FR-17, FR-21 |
| `/products/import` | Import from Excel | Owner, Manager | FR-8 |
| `/stock` | Stock in / out | Everyone | FR-9, FR-10, FR-23 |
| `/count` | Stock count | Everyone | FR-12 |
| `/damage` | Flag damage | Everyone | FR-13 |
| `/history` | History | Everyone ("Reverse…" only Owner, Manager) | FR-19, FR-15, FR-21 |
| `/approvals` | Approvals | Everyone (deciding per FR-14, FR-15) | FR-16 |
| `/reports` | Report | Everyone | FR-20, FR-21 |
| `/record` | My record | Everyone (pick a person: Owner, Manager) | FR-22 |
| `/staff` | Staff | Owner | FR-3, FR-5 |
| `/account` | My password | Everyone | FR-5 |

Each page sets the browser title to "{page} · Mojud". A person who opens a page their role may not use is sent to the Dashboard.

## Navigation

- **Menu order** (`roles.ts`): Dashboard, Products, Stock in / out, Stock count, History, Approvals, Report, My record, Staff (Owner only), My password. Every role sees the same items except Staff.
- **Flag damage** has no menu item. It is reached from the "Found damaged stock? Flag damage" link on Stock in / out and from the "Flag damage" chip on each product row.
- **Desktop (1024 px and up)**: app bar on top, side menu on the left.
- **Below 1024 px**: the menu is a bottom tab bar (icon above label) that scrolls sideways; the app bar drops the business name and "Online" label. Below 600 px it shows only the avatar letter, Theme select and "Sign out". Below 360 px the Theme select is hidden.
- **Deep links**: row actions pass the product along (`/stock?productId=…`, `/damage?productId=…`, `/history?productId=…`), so the form opens with that product chosen. History filters and the Report date range live in the address and can be bookmarked or shared.
- **Home**: after sign-up or sign-in everyone goes to `/dashboard`, or back to the page they first asked for before being sent to Sign in.

## Roles in the UI

| What the person sees | Owner | Manager | Supervisor | Worker, Sales rep, Accountant |
|---|---|---|---|---|
| Product form, "Import from Excel", "Edit" chip | yes | yes | no | no |
| "Damaged" reason under Stock out | yes | yes | no | no |
| Approve / Reject on damage flags (not their own) | yes | yes | yes | no ("Waiting for someone else to decide.") |
| "Reverse…" on History rows; Approve / Reject on reversals (not their own) | yes | yes | no | no |
| Person picker on My record | yes | yes | no | no |
| Staff menu item and page | yes | no | no | no |

The API checks every one of these again (FR-4). If someone other than an Owner or Manager sends a "Damaged" stock-out anyway, the API answers "Use Flag damage: a supervisor, manager or owner decides it." (FR-23).

## Voice and messages

Short, plain English, telling the person what happened and what is true now. Money in taka with lakh grouping (৳12,45,000). Dates and times like "16 Nov, 09:30".

| Moment | Message |
|---|---|
| Stock saved | "Saved. Stock in 20 bag of Rice 25 kg. Now 45 bag in stock." |
| Not enough stock | "Only 3 bag in stock." (under Quantity) |
| Count matches | "Count matches: 40 bag. Nothing changed." |
| Count missing (amber) | "Counted 38, record had 40: 2 bag missing (৳3,000). Stock adjusted." |
| Count extra | "Counted 42, record had 40: 2 bag extra. Stock adjusted." |
| Damage flagged | "Flagged 1 bag of Rice 25 kg (৳1,500). Waiting for a decision." |
| Decision made | "Approved: Rice 25 kg." / "Rejected: Rice 25 kg." |
| Decided twice | "This was already decided." |
| Own request | "Someone else must decide your own request." (API); the card shows "Waiting for someone else to decide." |
| Reversal asked | "Reversal asked for. Another owner or manager must approve it." |
| Staff added | "Karim can now sign in." |
| Password reset by Owner | "Karim's password is changed. Tell them the new one." |
| Own password changed | "Password changed. Other phones signed in as you are signed out." |
| Wrong current password | "Your current password is not correct." |
| Sign-in failure | "Sign-in details are not correct." |
| Deactivated account | "This account is deactivated." |
| Session ended | "Your session ended. Sign in again." |
| Phone taken | "This phone number is already registered" |
| Save failed (network/server) | "Couldn't save. Try again." |
| Load failed | "Couldn't load this. Refresh the page to try again." |

## Patterns

### Forms
- Label above the box, hint below it, then the error, all linked with `aria-describedby`.
- Server-side field errors (the API returns one field at a time) appear under that field in red with `aria-invalid`.
- A form-level error, or two or more field errors, shows the error summary at the top of the form; it takes focus and links to each field. Sign up also moves focus to the first invalid field when it checks fields in the browser.
- Sign up checks each field when the person leaves it and again on submit; typed values are always kept.
- The primary button shows a spinner while saving, announces "Saving…" and ignores extra clicks.
- After a save the form clears its quantity and note and a green "saved" message (`role="status"`) appears above it.

### Lists and tables
- Products and Staff: a table on wider screens, one card per row below 700 px (name as title, a label beside each value, actions as full-width chips).
- History, Report and the import preview stay tables and scroll sideways inside their card on small screens.
- Dashboard recent movements are a compact list (product, reason, person, time, change).

### Loading, empty and error states

| Page | Loading | Empty | Load error |
|---|---|---|---|
| Dashboard | Four placeholder tiles | "Every product is above its minimum stock." (Needs restocking); "No stock movements yet." (Recent) | "Couldn't load this. Refresh the page to try again." |
| Products | "Loading…" | "No products yet." / "No products match this search." | same |
| Stock in / out, Stock count | — | "There are no products yet. Add products first." (link to Products) | — |
| History | "Loading…" | "No stock movements yet." | same |
| Approvals | "Loading…" | "Nothing is waiting for a decision." / "Nothing has been decided yet." | same |
| Report | "Loading…" | "No stock in this period." | same |
| My record, Staff | "Loading…" | — | same |

### Status
- Product status pill: "OK" (check), "Low" at or below minimum (alert), "Out" at 0 (cross). Units in the Damaged hold show as "N held as damaged" under the quantity.
- Staff status: "Active" / "Deactivated"; the Owner's row shows "That's you" instead of actions.
- Approval outcome: "Approved by Nasima · 16 Nov, 10:05" / "Rejected by …".

## Key flows

### S01 Haque sets up his business (US-01, US-06, US-05, US-03)
1. **Sign up** (`/signup`): "Business name", "Your name", "Phone number" ("You sign in with this number."), "Password" ("At least 8 characters.", Show/Hide). "Create business" creates the business and the Owner and opens the Dashboard. A phone already in use shows "This phone number is already registered".
2. **Import products** (`/products/import`, from "Import from Excel" on Products): three steps — download the template, save the sheet as "CSV UTF-8", choose the file. The browser checks every row: problems are listed as "Row 7: …" with "file.csv has 2 problems. Fix them in Excel and choose the file again." and Import stays hidden. A clean file shows "12 products are ready to import." with a preview table and an "Import 12 products" button. The server saves all rows or none and replies "Imported 12 products with 340 units of opening stock." with a "See products" link.
3. **Products** (`/products`): the "Add a product" form (SKU, Name, Unit, Minimum stock, Unit cost (৳)) sits above the list. "Edit" fills the form ("Edit RICE-25"; SKU cannot change) with "Save changes" and "Cancel". The list has a live search ("Search by name or SKU"), a count ("12 products"), "Download CSV", and per row: Stock in / out, Flag damage, History, Edit.
4. **Staff** (`/staff`): "Add a staff member" (Name, Phone number, Password, Role) then "Add staff member". "Your team" lists name, phone, role pill and status, with "Reset password" and "Deactivate" / "Reactivate" chips. Deactivating takes effect at once (no confirm step); that person's next request ends their session.

### S02 Karim records the morning delivery (US-02, US-07)
1. **Sign in** (`/signin`): "Phone number", "Password", "Sign in". Any wrong detail gives "Sign-in details are not correct." in the error summary, never naming the field.
2. **Stock in / out** (`/stock`): choose the product ("Choose a product"); the page shows "In stock now: 25 bag". Pick the **Stock in** or **Stock out** tile, then "Reason" (Purchase, Customer return, Count adjustment; or Sale, Damaged [Owner/Manager only], Count adjustment), "Quantity" and "Note (optional)". "Save" records the movement and shows the new balance.
3. Failure: a stock-out above what is in stock is refused with "Only N unit in stock." and nothing is saved (FR-10).

### S03 Karim flags a wet bag and Nasima decides (US-09, US-10)
1. **Flag damage** (`/damage`): intro "Flag stock that is damaged or expired. It leaves the sellable stock now, and a supervisor, manager or owner approves or rejects it." Product, "Damaged quantity" (starts at 1), note, red "Flag damage" button. The units move to the Damaged hold and an approval opens.
2. **Approvals** (`/approvals`): "Waiting" and "Decided" toggles. Each card shows the kind ("Damage flag" or "Reversal"), the value in taka, product and quantity, the note, "Asked by Karim · 16 Nov, 09:40". Nasima taps **"Approve: write off"** or **"Reject: back to stock"**; the card leaves the Waiting list and "Approved: Rice 25 kg." appears. Karim, looking at his own flag, sees "Waiting for someone else to decide."
3. If two people decide at once, the second sees "This was already decided."
4. The Dashboard banner "1 request waiting for approval · ৳1,500 held as damaged, waiting for a decision" links here.

### S04 Rafiq counts the rice shelf (US-08)
1. **Stock count** (`/count`): intro "Count what is on the shelf. Any difference from the record is saved as a stock count, with your name." Choose the product ("Recorded now: 40 bag"), enter "Counted quantity", optional note, "Save count".
2. The result is one of the three count messages above; missing stock uses the amber message. The movement is saved with the note "Counted 38, system had 40."

### S05 Haque traces a loss and fixes a mistake (US-12, US-13, US-11)
1. **Dashboard**: tiles for "Stock value" ("340 units across 12 products"), "Losses, last 30 days" split into "Written off", "Damage flags" and "Missing in counts", plus Low stock, Out of stock, Products, Units in stock. "Needs restocking" lists out-of-stock first, each with a "Stock in" link. "Recent movements" shows the last 10.
2. Each loss row links to History filtered by that reason (`/history?reason=damage`, `damage_flagged`, `count`).
3. **History**: filters Product, Reason, By, From, To, "Clear filters", "Download CSV"; columns When, Product, Change, Value, Reason (with note), Balance after, By; "Load more" adds 50 rows.
4. Haque sees a wrong sale and taps **"Reverse…"**. A panel "Ask to reverse this movement" asks "Why should it be reversed?"; "Ask for reversal" sends it ("Reversal asked for. Another owner or manager must approve it."). "Reverse…" is offered only on purchase, customer return, sale, damaged, count adjustment and opening stock rows; not on stock counts, damage-flag movements (flagged or rejected) or reversals.
5. Rafiq opens Approvals and approves; the opposite "Reversal" movement is recorded. If that would take stock below zero, approval is refused and the request stays open.

### S06 Karim proves his week (US-16)
**My record** (`/record`): "Your own work, as proof of what you did." Three cards — Today, Last 7 days, Last 30 days — each with "Stock in and out" (movements, "12 in · 4 out"), "Stock counts" ("2 missing · 0 extra"), "Damage flags" ("1 approved · 0 rejected · 0 waiting") and "Decisions for others". Owners and Managers get a "Person" picker (default "Me").

### S07 Haque closes the month (US-14, US-15)
**Report** (`/reports`): "From" and "To" dates (this month by default). Summary tiles "Received", "Sold", "Lost (damage and missing)". Table per product: Start, In, Sold, Damaged, Count +/−, Adjusted, End, with taka values beside quantities and a Total row. A start date after the end date shows "Choose a start date on or before the end date." "Download CSV" is on Report, History and Products; files open in Excel (UTF-8 with BOM, formula-safe cells).

### S08 Karim forgets his password (US-04)
1. **Staff reset** (Haque, `/staff`): "Reset password" on Karim's row replaces the add form with "New password for Karim" — "Tell them the new password. They are signed out everywhere and sign in with it." — "New password", "Set password", "Cancel".
2. **My password** (Karim, `/account`): "Current password", "New password", "Change password". Other sessions end; this one stays. The Owner changes their own password only here.

## Accessibility (implemented)

- WCAG 2.1 AA target (NFR-5). Automated axe checks run on every page in component tests, and on Sign up, Sign in and the signed-in frame in both light and dark.
- Every text colour pair is at least 4.5:1 in light and dark (unit test on `tokens.css`).
- "Skip to content" is the first focusable element and moves focus to `main`; focus is always visible (3 px ring); the current menu item has `aria-current="page"`.
- One `h1` per page; menu is a `nav` named "Main"; tables use `th scope`; icon-only labels have text alternatives (row actions on Staff carry names like "Deactivate Karim").
- State never relies on colour alone: pills, change chips and tiles pair colour with an icon and a word.
- Stock in / Stock out tiles are real radio buttons, usable by keyboard and screen reader.
- Saved messages use `role="status"`; the error summary takes focus; busy buttons set `aria-busy`.
- Touch targets are at least 48 px, apart from desktop chip buttons (36 px) and the Approvals toggles (40 px).
- Reduced motion turns off all animation, the spinner's turn and the dashboard count-up.
- A browser smoke test signs in with the keyboard only and checks every page at 360 px has a bottom menu and no sideways scroll.
