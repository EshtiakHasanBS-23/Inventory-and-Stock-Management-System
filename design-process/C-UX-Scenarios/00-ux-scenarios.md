Updated 2026-11-16 to match the built app.

# UX Scenarios: Mojud

> The user journeys the built app supports, page by page. Every page spec is
> grounded in the code: pages in `apps/web/src/pages/**`, copy in
> `apps/web/src/i18n/en.json`, API in `apps/api/src/modules/**/routes.ts`,
> field rules in `packages/contracts/src/*.ts`.

**Created:** 2026-10-23 · **Rewritten:** 2026-11-16 (as built)
**Method:** Whiteport Design Studio (WDS)
**Format:** Storyboard (dynamic web app). Each page lists its elements, states and messages.
**Sources:** [Trigger Map](../B-Trigger-Map/trigger-map.md), the as-built specification (FR-1 … FR-23, US-01 … US-16), the code.

---

## Scenario Summary

| ID | Scenario | Persona | Pages | Priority | Status |
|----|----------|---------|-------|----------|--------|
| 01 | [Haque Sets Up His Business](01-haque-sets-up-his-business/01-haque-sets-up-his-business.md) | Mr. Abdul Haque, Owner | 4 | P2 | ✅ Built |
| 02 | [Karim Records the Morning Delivery](02-karim-records-the-morning-delivery/02-karim-records-the-morning-delivery.md) | Karim, Warehouse worker | 2 | ⭐ P1 | ✅ Built |
| 03 | [Karim Flags a Wet Bag and Nasima Decides](03-karim-flags-a-wet-bag-and-nasima-decides/03-karim-flags-a-wet-bag-and-nasima-decides.md) | Karim, Warehouse worker; Nasima, Supervisor | 2 | ⭐ P1 | ✅ Built |
| 04 | [Rafiq Counts the Rice Shelf](04-rafiq-counts-the-rice-shelf/04-rafiq-counts-the-rice-shelf.md) | Rafiq, Manager | 1 | P2 | ✅ Built |
| 05 | [Haque Traces a Loss and Fixes a Mistake](05-haque-traces-a-loss-and-fixes-a-mistake/05-haque-traces-a-loss-and-fixes-a-mistake.md) | Mr. Abdul Haque, Owner; Rafiq, Manager | 2 | ⭐ P1 | ✅ Built |
| 06 | [Karim Proves His Week](06-karim-proves-his-week/06-karim-proves-his-week.md) | Karim, Warehouse worker | 1 | P2 | ✅ Built |
| 07 | [Haque Closes the Month](07-haque-closes-the-month/07-haque-closes-the-month.md) | Mr. Abdul Haque, Owner | 1 | P3 | ✅ Built |
| 08 | [Karim Forgets His Password](08-karim-forgets-his-password/08-karim-forgets-his-password.md) | Karim, Warehouse worker; Mr. Abdul Haque, Owner | 2 | P3 | ✅ Built |

---

## Scenarios

### [01: Haque Sets Up His Business](01-haque-sets-up-his-business/01-haque-sets-up-his-business.md)
**Pages:** Sign up, Import products, Products, Staff
**Stories:** US-01, US-06, US-05, US-03
**User value:** His business, products with opening stock and staff are in Mojud in one sitting, from the Excel sheet he already keeps.

### [02: Karim Records the Morning Delivery](02-karim-records-the-morning-delivery/02-karim-records-the-morning-delivery.md)
**Pages:** Sign in, Stock in / out
**Stories:** US-02, US-07
**User value:** The delivery is recorded under his name in a few taps on his phone, and the saved message shows the new balance.

### [03: Karim Flags a Wet Bag and Nasima Decides](03-karim-flags-a-wet-bag-and-nasima-decides/03-karim-flags-a-wet-bag-and-nasima-decides.md)
**Pages:** Flag damage, Approvals
**Stories:** US-09, US-10
**User value:** Karim reports damage without writing it off himself; Nasima decides it in one tap and can never decide her own.

### [04: Rafiq Counts the Rice Shelf](04-rafiq-counts-the-rice-shelf/04-rafiq-counts-the-rice-shelf.md)
**Pages:** Stock count
**Stories:** US-08
**User value:** The shelf count corrects the record, and the difference is saved with his name, in units and taka.

### [05: Haque Traces a Loss and Fixes a Mistake](05-haque-traces-a-loss-and-fixes-a-mistake/05-haque-traces-a-loss-and-fixes-a-mistake.md)
**Pages:** Dashboard, History (then Approvals, page 03.2, for Rafiq)
**Stories:** US-12, US-13, US-11
**User value:** From one loss figure Haque reaches the movements behind it, and corrects a wrong entry without editing history.

### [06: Karim Proves His Week](06-karim-proves-his-week/06-karim-proves-his-week.md)
**Pages:** My record
**Stories:** US-16
**User value:** His own work for today, 7 days and 30 days, as proof of what he did.

### [07: Haque Closes the Month](07-haque-closes-the-month/07-haque-closes-the-month.md)
**Pages:** Report (with CSV downloads)
**Stories:** US-14, US-15
**User value:** What came in, went out and was lost this month, in units and taka, and a CSV for the accountant.

### [08: Karim Forgets His Password](08-karim-forgets-his-password/08-karim-forgets-his-password.md)
**Pages:** Staff (reset password), My password
**Stories:** US-04
**User value:** Haque sets a new password for Karim; Karim then changes it to one only he knows.

---

## Page Coverage Matrix

| Page | Route | Scenario | Purpose in flow |
|------|-------|----------|-----------------|
| 01.1 Sign up | `/signup` | 01 | Create the business and the Owner account |
| 01.2 Import products | `/products/import` | 01 | Load products and opening stock from a CSV saved from Excel |
| 01.3 Products | `/products` | 01 | Check, search, add and edit products |
| 01.4 Staff | `/staff` | 01 | Add staff with roles; deactivate and reactivate |
| 02.1 Sign in | `/signin` | 02 | Sign in with phone number and password |
| 02.2 Stock in / out | `/stock` | 02 | Record a purchase, return, sale or adjustment |
| 03.1 Flag damage | `/damage` | 03 | Move damaged units into a hold that waits for a decision |
| 03.2 Approvals | `/approvals` | 03, 05 | Decide damage flags and reversals (second person) |
| 04.1 Stock count | `/count` | 04 | Enter the counted quantity; the difference is saved |
| 05.1 Dashboard | `/dashboard` | 05 | Stock value, losses by reason, low stock, recent movements |
| 05.2 History | `/history` | 05 | Filter the movement record and ask for a reversal |
| 06.1 My record | `/record` | 06 | Own work for today, 7 and 30 days |
| 07.1 Report | `/reports` | 07 | Stock report for a date range, with CSV downloads |
| 08.1 Staff: reset password | `/staff` | 08 | The Owner sets a new password for a staff member |
| 08.2 My password | `/account` | 08 | Change your own password |

**Coverage:** every signed-in route and both public routes are specified. `/staff` appears twice: 01.4 covers adding and deactivating people, 08.1 covers the reset-password form on the same page.

---

## Shared frame (every signed-in page)

Specified once here; page specs refer to it.

| Element | Copy | testid | Notes |
|---|---|---|---|
| Skip link | "Skip to content" | `skip-link` | First focusable element; moves focus to `main#main` |
| App bar: brand | "Mojud" + logo | – | Sticky at the top |
| App bar: business name | the business name | – | Hidden below 1024 px |
| App bar: person | name, role (e.g. "Warehouse worker") | `app-bar-user-name`, `app-bar-user-role` | Below 600 px only the initial avatar shows |
| App bar: status | cloud icon + "Online" | – | Hidden below 1024 px |
| Theme switch | label "Theme"; options "Light", "Dark", "Device" | `theme-switch` | Label visually hidden below 1024 px; whole switch hidden below 360 px |
| Sign out | "Sign out" | `app-bar-sign-out-button` | Ends the session at once (`POST /api/v1/auth/signout`), goes to Sign in; on failure "Couldn't save. Try again." |
| Main menu | `nav` labelled "Main" | `side-nav` | Dashboard, Products, Stock in / out, Stock count, History, Approvals, Report, My record, Staff (Owner only), My password. Links `side-nav-<item>-link`; current page has `aria-current="page"` |

- **Desktop (1024 px and up):** side menu with icons on the left, page content on the right.
- **Phone and tablet (below 1024 px):** the menu becomes a bottom tab bar that scrolls sideways; forms use the full width.
- **Below 700 px:** tables marked as stackable (Products, Staff) become one card per row, with a label beside each value. Other tables scroll sideways inside their frame.
- **Page title:** "<Page> · Mojud".
- **Loading a page:** "Loading…" (`loading`). **Load failure:** "Couldn't load this. Refresh the page to try again."
- **Saved message:** a green toast-style box with a check mark (`role="status"`).
- **Session:** a signed-out person who opens a signed-in page goes to Sign in and returns to that page after signing in. A session ends 12 hours after last use.
- **Roles:** a role that may not open a page (only `/staff` for non-Owners and `/products/import` for roles other than Owner and Manager) is sent to the Dashboard.

---

_Generated with Whiteport Design Studio framework_
