---
name: Mojud
description: Stock-control web app for small Bangladeshi FMCG distributors. Calm, professional and high-contrast, in English, with light, dark and device themes.
status: as-built
created: 2026-10-22
updated: 2026-11-16
sources:
  - apps/web/src/styles/tokens.css
  - apps/web/src/styles/base.css
  - apps/web/src/components/
  - apps/web/src/pages/
  - _bmad-output/planning-artifacts/prds/prd-E2E_IAM-2026-10-22/prd.md
colors:
  # Light (tokens.css :root)
  primary: '#0B5A54'
  on-primary: '#FFFFFF'
  surface: '#FFFFFF'
  surface-alt: '#EDF4F2'
  text: '#0D1F1C'
  text-muted: '#3E524F'
  border: '#8FAAA5'
  control-border: '#6B8580'
  success: '#1B6E31'
  on-success: '#FFFFFF'
  warning: '#8A4F00'
  on-warning: '#FFFFFF'
  danger: '#A8231B'
  on-danger: '#FFFFFF'
  info: '#1D5799'
  primary-tint: '#D7ECE8'
  success-tint: '#DFF1E4'
  warning-tint: '#FFC94D'
  on-warning-tint: '#2B1D00'
  danger-tint: '#FBE3E1'
  info-tint: '#E1ECF8'
  # Dark (tokens.css :root[data-theme="dark"], same values for the device dark theme)
  primary-dark: '#63D5C6'
  on-primary-dark: '#00211E'
  surface-dark: '#0E1716'
  surface-alt-dark: '#18241F'
  text-dark: '#EAF4F1'
  text-muted-dark: '#AABFBA'
  border-dark: '#3D524D'
  control-border-dark: '#6B827C'
  success-dark: '#74D68C'
  on-success-dark: '#06210E'
  warning-dark: '#F4B65C'
  on-warning-dark: '#2B1D00'
  danger-dark: '#FF8F85'
  on-danger-dark: '#300704'
  info-dark: '#8DBBF2'
  primary-tint-dark: '#12302C'
  success-tint-dark: '#12301B'
  warning-tint-dark: '#F4B65C'
  on-warning-tint-dark: '#2B1D00'
  danger-tint-dark: '#3A1714'
  info-tint-dark: '#13243A'
typography:
  headline: { fontSize: 1.25rem, fontWeight: 700, lineHeight: 1.4 }
  title: { fontSize: 1.0625rem, fontWeight: 700 }
  body: { fontSize: 1rem, fontWeight: 400, lineHeight: 1.5 }
  body-strong: { fontWeight: 600 }
  label-button: { fontSize: 1.125rem, fontWeight: 700 }
  meta: { fontSize: 0.875rem }
  tile-value: { fontSize: 1.75rem, fontWeight: 700 }
  tile-value-hero: { fontSize: 2.25rem, fontWeight: 700 }
rounded:
  sm: 6px
  md: 12px
  lg: 16px
  full: 9999px
spacing:
  '1': 0.25rem
  '2': 0.5rem
  '3': 0.75rem
  '4': 1rem
  '5': 1.5rem
  '6': 2rem
  gutter-phone: 1rem
  gutter-desktop: 1.5rem
  target-min: 3rem
  button-desk: 3.5rem
  app-bar-height: 3.5rem
---

# Mojud — Design System (as built)

> How the app looks today. Every value here comes from `apps/web/src/styles/tokens.css` and `base.css`. Behaviour lives in `EXPERIENCE.md`. Mockups: `mockups/key-dashboard.html`, `key-stock-movement.html`, `key-approvals.html`, `key-products.html`.

## Brand and style

Calm and professional: a tinted page background, white cards with a thin border and a soft shadow, one deep teal accent for links, the current menu item and the main button. Numbers that matter (stock value, losses) are large. Status is always a tinted pill with an icon and a word. The UI is in English. Light, dark and "Device" themes ship.

## Colors

Tokens are CSS custom properties named `--colors-*`. Light values sit on `:root`. Dark values apply when the person picks Dark (`[data-theme="dark"]`) or picks Device and the operating system prefers dark; both dark blocks hold the same values (a test checks this).

| Token | Light | Dark | Used for |
|---|---|---|---|
| `primary` / `on-primary` | `#0B5A54` / `#FFFFFF` | `#63D5C6` / `#00211E` | Links, primary button, current menu item, brand, chosen tab, Owner pill, hero stock-value figure |
| `surface` | `#FFFFFF` | `#0E1716` | Cards, panels, tables, app bar, inputs |
| `surface-alt` | `#EDF4F2` | `#18241F` | Page background, side menu, table header row, empty states, "Waiting for someone else" note |
| `text` / `text-muted` | `#0D1F1C` / `#3E524F` | `#EAF4F1` / `#AABFBA` | Body text / hints, sub-headings, labels; `text` is also the focus ring |
| `border` | `#8FAAA5` | `#3D524D` | Decorative card edges and row dividers only |
| `control-border` | `#6B8580` | `#6B827C` | Outlines of inputs, selects, secondary buttons, chip buttons, choice tiles |
| `success` / `on-success` | `#1B6E31` / `#FFFFFF` | `#74D68C` / `#06210E` | Saved toast, Approve button, chosen "Stock in" tile, "OK" and "Active" pills, stock-in change chips |
| `warning` | `#8A4F00` | `#F4B65C` | Low-stock tile figure, "held as damaged" note, top edge of a damage-flag card |
| `warning-tint` / `on-warning-tint` | `#FFC94D` / `#2B1D00` | `#F4B65C` / `#2B1D00` | "Low" pill, approvals banner on the Dashboard, amber toast for a count with missing stock |
| `danger` / `on-danger` | `#A8231B` / `#FFFFFF` | `#FF8F85` / `#300704` | Refusal text, error summary, Flag damage button, losses figures, "Out" pill, stock-out change chips, chosen "Stock out" tile |
| `info` / `info-tint` | `#1D5799` / `#E1ECF8` | `#8DBBF2` / `#13243A` | Role pills on Staff, top edge of a reversal card |
| `primary-tint`, `success-tint`, `danger-tint` | `#D7ECE8`, `#DFF1E4`, `#FBE3E1` | `#12302C`, `#12301B`, `#3A1714` | Pill and chip backgrounds, hover on menu items and secondary buttons, avatar circles |

`tokens.css` also defines `on-info`, `page`, `scrim`, `surface-disabled` and `text-disabled`; no style uses them today.

### Contrast (computed from the token values)

| Pair | Light | Dark |
|---|---|---|
| `text` on `surface` | 17.1:1 | 16.2:1 |
| `text` on `surface-alt` | 15.3:1 | 14.3:1 |
| `text-muted` on `surface` | 8.3:1 | 9.4:1 |
| `text-muted` on `surface-alt` | 7.5:1 | 8.3:1 |
| `on-primary` on `primary` | 8.1:1 | 9.6:1 |
| `primary` on `surface` | 8.1:1 | 10.3:1 |
| `primary` on `primary-tint` | 6.5:1 | 8.0:1 |
| `danger` on `surface` | 7.2:1 | 8.3:1 |
| `danger` on `danger-tint` | 5.9:1 | 7.3:1 |
| `success` on `success-tint` | 5.4:1 | 8.0:1 |
| `on-success` on `success` | 6.3:1 | 9.5:1 |
| `on-warning-tint` on `warning-tint` | 10.7:1 | 9.1:1 |
| `warning` on `surface` | 6.6:1 | 10.1:1 |
| `info` on `info-tint` | 6.1:1 | 7.8:1 |
| `control-border` vs `surface` | 4.0:1 | 4.4:1 |
| `control-border` vs `surface-alt` | 3.6:1 | 3.9:1 |
| `border` vs `surface` | 2.5:1 | 2.2:1 (decorative only) |

A unit test (`apps/web/test/a11y.test.tsx`) reads `tokens.css` and fails if any of 16 text pairs drops below 4.5:1 in light, chosen dark or device dark.

## Typography

One system font stack: `system-ui, "Segoe UI", Roboto, "Noto Sans Bengali", "Nirmala UI", sans-serif`. The last two fallbacks make sure the taka sign (৳) renders.

| Style | Size | Weight | Where |
|---|---|---|---|
| Headline | 1.25rem | 700 | Page `h1` |
| Title | 1.0625rem | 700 | Section `h2`, app name, card titles |
| Body | 1rem / 1.5 | 400 | Everything else; labels and strong text 600 |
| Button label | 1.125rem | 700 | Primary, Approve and Flag damage buttons |
| Meta | 0.875rem | — | Hints, sub-labels, chip buttons, phone menu labels |
| Tile figure | 1.75rem (2.25rem hero) | 700 | Dashboard tiles; 1.375rem / 1.75rem below 1024 px |

Figures use tabular numbers. Money shows as taka with lakh grouping and up to 2 decimals (৳12,45,000; ৳1,250.5). Digits are Western.

## Layout and spacing

- Spacing scale: 4, 8, 12, 16, 24, 32 px (`--spacing-1` to `--spacing-6`). Gutters 16 px on phones, 24 px on desktop.
- Minimum touch target: 48 px (`--spacing-target-min`); primary, Approve and Flag damage buttons are 56 px tall.
- Signed-in frame: sticky app bar (56 px) on top; a 220 px side menu on the left; main content up to 1200 px wide.
- Sign up and Sign in: one centred card (up to 480 px) on the tinted background.
- Breakpoints (max-width): 1199 px (dashboard columns stack, 4-column forms go to 2); 1023 px (side menu becomes a bottom tab bar, app bar hides business name and "Online" label, tiles go 2 per row, choice tiles stack their content); 699 px (all form grids go to one column; Products and Staff tables become cards); 599 px (app bar shows only the avatar letter, not name and role); 359 px (theme switch hidden).
- The page never scrolls sideways at 360 px (browser smoke test). Wide tables other than Products and Staff (History, Report, Import preview) scroll sideways inside their card.

## Elevation and depth

| Token | Light | Dark | Used for |
|---|---|---|---|
| `shadow-card` | `0 1px 2px` at 6% | none | Cards, panels, tiles, tables, app bar, current menu item |
| `shadow-raised` | `0 6px 16px` at 12% | none | Sign-in card, hover on tiles, approval cards and primary buttons |
| `shadow-float` | `0 6px 16px` black 25% | black 50% | Saved toast |

In dark mode depth comes from borders, not shadows.

## Shapes

Radius 6 px for inputs, selects and small notes; 12 px for buttons, tiles, choice tiles, toasts, banners and approval cards; 16 px for cards, panels, tables and the auth card; full round for pills, chips, tabs and avatars.

## Components

### Frame and navigation
- **App bar** (`AppBar`): logo mark and "Mojud", business name, avatar letter, person's name and role, a cloud-check icon with the word "Online" (a fixed label), the Theme select (Light, Dark, Device) and a "Sign out" secondary button.
- **Side menu** (`SideNav`): icon plus label per item. Current item is a white pill with a teal icon and `aria-current="page"`; hover shows `primary-tint`. Below 1024 px it is a fixed bottom tab bar (icon above label, current item tinted) that scrolls sideways when items do not fit.
- **Skip link** (`SkipLink`): "Skip to content", first focusable element, visible only on focus, moves focus to `main`.
- **Page header**: `h1` with a muted one-line subtitle on most pages; Products has its actions on the right.

### Buttons
- **Primary** (`ButtonPrimary`): full-width teal, 56 px, bold label. While busy it shows a spinner, announces "Saving…" and ignores clicks (`aria-busy`, `aria-disabled`).
- **Secondary** (`ButtonSecondary`, also used for CSV download links and "Import from Excel"): white with `control-border` outline and teal text; `primary-tint` on hover.
- **Approve** (green) and **Flag damage** (red, full width): 56 px, bold.
- **Chip button**: small rounded outline button for row actions (Stock in / out, Flag damage in red, History, Edit, Reset password, Deactivate in red, Reactivate). 36 px tall on desktop; 48 px and full width inside phone cards.
- **Link button**: text-style button for "Reverse…", "Clear filters".
- **Tabs** (Approvals): two pill toggle buttons in a rounded group; the chosen one is teal (`aria-pressed`).

### Inputs
- **InputField**: label above, box, then hint, then error, joined with `aria-describedby`; `aria-invalid` on error. 48 px tall, 1 px `control-border`, 2 px teal border on focus, 2 px red border when invalid. Hints sit below the box so boxes in one row line up.
- **PasswordField**: InputField with a "Show" / "Hide" toggle button (`aria-pressed`).
- **SelectField**: native select with the same label and error layout, optional empty first choice ("Choose a product", "All products", "Everyone", "Me").
- **Date fields** for History and Report ranges; **file input** for the import.
- **Refusal message**: red bold text with a 4 px red bar on the left, under the field.
- **Error summary** (`FormErrorSummary`): red-tinted box at the top of a form after a failed submit; takes focus; shows a form-level message and, for two or more field errors, "N fields need fixing:" with links that move focus to each field.

### Stock display
- **StockBadge**: tinted pill with icon and word: "OK" (check, green), "Low" (alert, amber fill with a dashed inner outline), "Out" (cross, red).
- **Change chip**: rounded pill with the signed quantity, green for in, red for out.
- **"N held as damaged"**: small amber line under a product's quantity.
- **Status pills on Staff**: "Active" (check, green) / "Deactivated" (cross, muted with outline); role pill in blue; Owner pill in teal; avatar circle with the first letter.

### Choice tiles
The Stock in / Stock out choice on the Stock in / out page: two large tiles (72 px min) that are real radio buttons stretched invisibly over the tile. Each has a round icon, a bold label and a hint ("Purchase, return or adjustment" / "Sale, damage or adjustment"). Chosen "Stock in" turns green-tinted with a green border; chosen "Stock out" red-tinted with a red border. Keyboard focus draws the focus ring around the tile.

### Cards, panels, tables
- **Panel**: white card with 24 px padding holding a form.
- **Card**: white card with 16 px padding for dashboard sections and My record periods.
- **Data table**: inside a white rounded card; header row on `surface-alt`; numbers right-aligned; rows tint on hover.
- **Tables that become cards**: only Products and Staff (`data-table--stack`). Below 700 px each row becomes a block: the name as a title, then one line per value with its column name as a label on the left, then the row actions as full-width chips.
- **Movement list**: on the Dashboard, recent movements show as a compact list (product, reason, person, time, change chip) instead of a table.

### Dashboard parts
- **Banner**: amber link bar "N requests waiting for approval" with a sub-line "৳X held as damaged, waiting for a decision", alert icon and chevron.
- **Tiles**: two wide hero tiles (Stock value in teal; Losses, last 30 days in red with three linked loss rows) and four small tiles (Low stock with alert icon, Out of stock with cross icon, Products, Units in stock).
- **Needs restocking list**: product name, "N unit (min M)", status pill and a "Stock in" link with chevron.
- **Count-up figures** (`useCountUp`): tile figures count up from 0 over 700 ms with an ease-out curve and land on the exact value. With reduced motion they show the final value at once.
- **Skeleton**: four placeholder tiles while the dashboard loads (shimmer only when motion is allowed).

### Feedback
- **Saved toast**: green box with a white check mark, `role="status"`, above the form. Amber variant for a count that found stock missing.
- **Empty state**: muted text on `surface-alt` with a green check icon ("Every product is above its minimum stock.", "Nothing is waiting for a decision.", "No stock movements yet.").
- **Approval card**: white card with a 4 px top edge (amber for damage flag, blue for reversal); kind label in small caps with icon, value in red, product with a red change chip, note in italics, "Asked by …", then Approve / Reject buttons or the "Waiting for someone else to decide." note, or (when decided) a pill "Approved by …" / "Rejected by …".
- **Report summary**: three stat tiles with a teal left edge (Received, Sold, Lost).
- **My record lines**: icon, label, detail line and a bold figure per line, one card per period.

## Motion

All animation sits inside `@media (prefers-reduced-motion: no-preference)`: page sections and cards fade up (260–320 ms, dashboard tiles staggered by 50 ms), toasts, error summaries and the approvals banner slide in, tiles and approval cards lift 2 px on hover, buttons and choice tiles press to 98%. When reduced motion is requested none of this runs, the spinner stops turning and dashboard figures do not count up.

## Do's and don'ts

- Do pair every colour state with an icon and a word.
- Do use `control-border` for anything a person can operate; `border` is for decoration only.
- Do keep one primary button per form.
- Don't add new colours outside `tokens.css`; both themes must keep every text pair at 4.5:1 or more.
- Don't animate outside the no-preference motion block.
