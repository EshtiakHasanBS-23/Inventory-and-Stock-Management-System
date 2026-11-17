# Interaction Specification — Mojud core slice

Updated 2026-11-16 to describe the behaviour as built. Screens: `mockups.md`. Endpoints: `inception/contract-design/contract-summary.md`. Requirements: `requirements.md`. Code: `apps/web/src`.

## Global behaviour

| Behaviour | As built |
|---|---|
| Loading data | TanStack Query per endpoint; pages show "Loading…" (or skeleton tiles on the Dashboard) with `aria-busy`; a failed load shows "Couldn't load this. Refresh the page to try again." |
| Saving | The primary button shows "Saving…" and is busy while the request runs; on success a green toast with a check mark (`role="status"`) and the related lists refresh |
| Field errors | Shown under the field and linked with `aria-describedby`; with two or more errors a `FormErrorSummary` "N fields need fixing:" takes focus and links to each field; server field errors (`field` in the error body) land under the same field; other failures show "Couldn't save. Try again." |
| Session | On start the app calls `/auth/me`. A 401 on any request returns the person to Sign in, keeping the page they asked for; after an expired session Sign in shows "Your session ended. Sign in again." Sign out goes to Sign in |
| CSRF | The API client sends `X-CSRF-Token` on every non-GET request |
| Role-guarded routes | `/staff` is Owner only; `/products/import` is Owner and Manager only; other roles opening them are sent to the Dashboard. Buttons a role may not use are not shown, and the server refuses them anyway |
| Theme | Theme switch: Light, Dark or Device; the choice is stored in the browser and applied before first paint; Device follows the system setting |
| Motion | Count-up figures, cards fading up and the toast sliding in run only when reduced motion is not requested |
| Page title | "{Page} · Mojud" |

## Per-screen interactions

### Sign up and Sign in (`/signup`, `/signin`)

- Fields check on leave and on submit with the shared schemas; the phone accepts spaces and dashes.
- Password fields have Show/Hide.
- Sign in never says which field was wrong.

### Dashboard (`/dashboard`)

- Figures count up from 0 to their value.
- The banner and each loss row are links: banner → `/approvals`; Written off → `/history?reason=damage`; Damage flags → `/history?reason=damage_flagged`; Missing in counts → `/history?reason=count`.
- "Stock in" on a Needs restocking row → `/stock?productId=…` with the product chosen.

### Products (`/products`)

- Search filters as you type (server search on name or SKU, any case).
- Edit fills the form with the row; Cancel returns to "Add a product". SKU is read-only while editing.
- Row links: Stock in / out → `/stock?productId=…`; Flag damage → `/damage?productId=…`; History → `/history?productId=…`.
- Download CSV fetches `/api/v1/products/export.csv`.

### Import (`/products/import`)

- Choosing a file parses it in the browser at once (BOM, comma or semicolon, loose headers, Excel numbers) and checks every row; up to 20 problems and up to 20 preview rows are shown.
- Import sends all rows in one request; a server refusal names the row and nothing is saved.

### Stock in / out (`/stock`)

- `?productId=` pre-chooses the product.
- Choosing a direction resets the reason to one that fits; "Damaged" is offered only to Owner and Manager.
- After saving, the toast shows the new balance and the quantity and note clear; product and direction stay for the next entry.
- "Flag damage" link carries the chosen product.

### Stock count (`/count`)

- Shows the recorded quantity for the chosen product; saving shows matched, missing (with ৳ value) or extra.

### Flag damage (`/damage`)

- `?productId=` pre-chooses the product; quantity defaults to 1.
- Saving shows the flagged quantity and its value, and that it waits for a decision.

### Approvals (`/approvals`)

- Waiting and Decided are toggle buttons (`aria-pressed`) and set `?status=`.
- Approve or Reject acts at once (one tap) and shows "{Approved|Rejected}: {product}."; the card leaves Waiting. "This was already decided." or a role refusal shows as an alert.
- Cards whose `canDecide` is false show "Waiting for someone else to decide." instead of buttons.

### History (`/history`)

- Changing a filter updates the address (`productId`, `reason`, `userId`, `from`, `to`) and reloads from the first page; "Clear filters" empties them.
- From and To are whole days; To is included.
- "Load more" asks for the next 50 and appends them.
- Reverse… (Owner, Manager, reversible rows only) opens an inline form; a reason is required; after sending, the form closes and a status message shows.
- Download CSV uses the same filters.

### Report (`/reports`)

- From and To default to the first and last day of this month and are kept in the address.
- A backwards range shows a message and does not call the server.
- Download CSV uses the same range.

### My record (`/record`)

- Owners and Managers get a Person select (from `/users/names`); everyone else sees only their own record.

### Staff (`/staff`)

- Adding a person shows "{name} can now sign in." and the team list refreshes.
- Deactivate and Reactivate act at once on that row.
- Reset password opens an inline form for that person; Cancel closes it.

### My password (`/account`)

- Saving shows the toast; this session stays signed in and the other sessions end.

## Assumptions & Open Questions

None.
