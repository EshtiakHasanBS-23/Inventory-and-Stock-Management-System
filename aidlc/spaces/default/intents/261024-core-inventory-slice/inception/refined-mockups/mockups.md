# Refined Mockups — Mojud core slice

Updated 2026-11-16 to describe the screens as built (`apps/web/src/pages/**`, text from `apps/web/src/i18n/en.json`). Requirements: `requirements.md` (FR-1 to FR-23, NFR-4, NFR-5). Stories: `stories.md` (US-01 to US-16). UX scenarios and page numbers: `design-process/C-UX-Scenarios/` (S01–S08). Component names in `code` are the React components in `apps/web/src/components`; behaviour is in `interaction-spec.md`.

## Layout Frame (all signed-in screens)

- **Desktop (1024 px and up):** `AppBar` across the top (logo and "Mojud", business name, avatar initial, name and role, a static "Online" label, `ThemeSwitch`, "Sign out"); `SideNav` on the left with an icon and label per item; content in white cards on a tinted page background.
- **Phone and tablet (below 1024 px):** the side menu becomes a bottom tab bar with icons that scrolls sideways; the app bar drops the business name and status; forms use the full width; tables become stacked cards. Every page fits at 360 px and 320 px without sideways page scroll.
- Menu order: Dashboard, Products, Stock in / out, Stock count, History, Approvals, Report, My record, Staff (Owner only), My password. Flag damage is reached from Stock in / out and from each product row.
- Each page has one `h1` with a short subtitle; the browser title is "{Page} · Mojud".
- Saved messages appear as a green toast with a check mark (`role="status"`); refusals appear under the field or in a `FormErrorSummary`.
- Every signed-in person lands on the Dashboard.

## 01.1 Sign up — `/signup` (S01; US-01)

- Centred card on the tinted page: heading "Create your business".
- `InputField` Business name, Your name, Phone number (hint "You sign in with this number."), `PasswordField` Password (hint "At least 8 characters.", Show/Hide).
- `ButtonPrimary` "Create business"; link "Already have an account? Sign in".
- States: errors under each field; duplicate phone "This phone number is already registered" under Phone; with two or more problems a summary "N fields need fixing:" takes focus; server failure "Couldn't save. Try again." in the summary; values kept.
- Success → Dashboard.

## 02.1 Sign in — `/signin` (S02; US-02)

- Same card: Phone number, Password, `ButtonPrimary` "Sign in", link "New business? Create one".
- Errors in the summary: "Sign-in details are not correct." (never names a field) or "This account is deactivated."; after an expired session: "Your session ended. Sign in again."
- Success → the page first asked for, or Dashboard.

## 05.1 Dashboard — `/dashboard` (S05; US-12)

- Banner (only when something waits): "N requests waiting for approval" with "৳X held as damaged, waiting for a decision", linking to Approvals.
- Two hero tiles with count-up figures: **Stock value** (৳, with "N units across M products") and **Losses, last 30 days** (৳) with three linked rows — Written off, Damage flags, Missing in counts — each opening History filtered by that reason.
- Four small tiles: Low stock (warning icon), Out of stock (cross icon), Products, Units in stock.
- Card **Needs restocking**: out-of-stock products first, each "N unit (min M)" with a status pill and a "Stock in" link; when none: "Every product is above its minimum stock."
- Card **Recent movements**: the last 10, in the movement table.
- Loading shows skeleton tiles; failure shows "Couldn't load this. Refresh the page to try again."

## 01.3 Products — `/products` (S01; US-05, US-15)

- Header actions: "Import from Excel" (Owner, Manager) and "Download CSV".
- Form card (Owner, Manager only): "Add a product" with SKU, Name, Unit (hint "For example pcs, ctn or bag."), Minimum stock (hint "Marked low at or below this quantity."), Unit cost (৳) (hint "What you pay for one unit."); `ButtonPrimary` "Add product". Choosing Edit on a row turns it into "Edit {SKU}" with SKU fixed, "Save changes" and "Cancel".
- Toolbar: search "Search by name or SKU" and a count "N products".
- Table columns: Product (name and SKU), In stock (with "N held as damaged" when there is any), Min stock, Unit cost, Value, Status pill (OK / Low / Out with icon), Actions: Stock in / out, Flag damage, History, Edit (Owner, Manager).
- Empty: "No products yet." or "No products match this search."

## 01.2 Import from Excel — `/products/import` (S01; US-06) — Owner, Manager

- Three numbered steps: download the template; save the sheet as "CSV UTF-8"; choose the file, check the preview, then import.
- File input "CSV file".
- Problems: "{file} has N problems. Fix them in Excel and choose the file again." with a list "Row N: …"; no Import button.
- Ready: "N products are ready to import.", a preview table (first rows, with Opening stock) and "…and N more.", then `ButtonPrimary` "Import N products".
- Done: "Imported N products with M units of opening stock." and a link "See products".

## 02.2 Stock in / out — `/stock` (S02; US-07)

- Top link: "Found damaged stock? Flag damage".
- Product select ("Choose a product"); under it "In stock now: N unit".
- Direction as two large radio tiles: **Stock in** ("Purchase, return or adjustment") and **Stock out** ("Sale, damage or adjustment").
- Reason select limited to the direction: Purchase, Customer return, Count adjustment / Sale, Damaged (Owner and Manager only), Count adjustment.
- Quantity, Note (optional), `ButtonPrimary` "Save".
- Saved toast: "Saved. Stock out 4 bag of Rice 25 kg. Now 6 bag in stock."
- Refusal under Quantity: "Only N unit in stock."
- With no products: "There are no products yet." and "Add products first."

## 04.1 Stock count — `/count` (S04; US-08)

- Intro: "Count what is on the shelf. Any difference from the record is saved as a stock count, with your name."
- Product select, "Recorded now: N unit", Counted quantity, Note, `ButtonPrimary` "Save count".
- Results: "Count matches: N unit. Nothing changed." / "Counted 8, record had 10: 2 bag missing (৳…). Stock adjusted." / "… 2 bag extra. Stock adjusted."

## 03.1 Flag damage — `/damage` (S03; US-09)

- Intro: the stock leaves sellable stock now and a supervisor, manager or owner approves or rejects it.
- Product select (pre-chosen from a product row or Stock in / out), "In stock now", Damaged quantity (default 1), Note, `ButtonPrimary` "Flag damage".
- Saved: "Flagged 2 bag of Rice 25 kg (৳…). Waiting for a decision."

## 03.2 Approvals — `/approvals` (S03, S05; US-10, US-11)

- Intro: damage flags and reversals need a second person; nobody decides their own request.
- Two tab buttons: **Waiting** and **Decided** (kept in the address as `?status=decided`).
- Each card: kind (Damage flag / Reversal) with icon, product and SKU, quantity and value in ৳, note, "Asked by {name} · {time}", and for a reversal "Undo {reason} of {time}".
- Actions for allowed deciders who did not ask: damage "Approve: write off" / "Reject: back to stock"; reversal "Approve" / "Reject". Otherwise "Waiting for someone else to decide."
- Decided cards show "Approved/Rejected by {name} · {time}".
- Empty: "Nothing is waiting for a decision." / "Nothing has been decided yet."

## 05.2 History — `/history` (S05; US-13, US-11, US-15)

- Filters: Product (All products), Reason (All reasons), Person (Everyone), From, To; "Clear filters"; "Download CSV". Filters live in the address.
- Movement table: When, Product, Change (+/− with unit), Value, Reason and note, Balance after, By; "Reverse…" on reversible rows for Owner and Manager.
- "Load more" adds the next 50.
- Reverse… opens an inline form "Ask to reverse this movement" with "Why should it be reversed?", "Ask for reversal" and "Cancel"; sent: "Reversal asked for. Another owner or manager must approve it."
- Empty: "No stock movements yet."

## 07.1 Report — `/reports` (S07; US-14, US-15)

- From and To date inputs (this month by default; kept in the address); "Download CSV".
- Summary tiles: Received, Sold, Lost (damage and missing), in ৳.
- Table: Product, Start, In, Sold, Damaged, Count +/−, Adjusted, End, with a Total row.
- Backwards range: "Choose a start date on or before the end date."; no movements: "No stock in this period."

## 06.1 My record — `/record` (S06; US-16)

- Intro: "Your own work, as proof of what you did."
- Person select (Owner and Manager only; "Me" first).
- Three columns or stacked cards: Today, Last 7 days, Last 30 days. Each shows Stock in and out (count, "N in · M out"), Stock counts ("N missing · M extra"), Damage flags ("N approved · M rejected · K waiting") and Decisions for others.

## 01.4 / 08.1 Staff — `/staff` (S01, S08; US-03, US-04) — Owner only

- Form card "Add a staff member": Name, Phone number (hint "They sign in with this number."), Password, Role (Manager, Warehouse worker, Sales rep, Supervisor, Accountant); "Add staff member". Saved: "{name} can now sign in."
- "Your team" table with count: Name, Phone, Role, Status pill (Active / Deactivated), Actions: Reset password, Deactivate or Reactivate. The Owner's row says "That's you" and has no actions.
- Reset password opens "New password for {name}" with a short explanation, New password, "Set password" and "Cancel". Saved: "{name}'s password is changed. Tell them the new one."

## 08.2 My password — `/account` (S08; US-04)

- Current password, New password, `ButtonPrimary` "Change password".
- Saved: "Password changed. Other phones signed in as you are signed out."
- Wrong current password: "Your current password is not correct." under that field.

## Assumptions & Open Questions

None.
