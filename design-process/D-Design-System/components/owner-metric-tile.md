# Metric Tile

**Code:** `DashboardPage.tsx` (`Figure` + `apps/web/src/useCountUp.ts`); report summary tiles in `ReportPage.tsx` · **Classes:** `.hero-grid`, `.tile`, `.tile--hero`, `.tile__label`, `.tile__value` (`--primary`, `--danger`, `--warning`), `.tile__meta`; `.stat-grid`, `.stat`, `.stat--out`
**Mockups:** [key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A card with a label and one big figure. On the Dashboard the figures count up from 0 when they load.

## Dashboard tiles (`<dl class="hero-grid">`, 4 columns)

| Tile | Variant | Figure | Extra |
|---|---|---|---|
| `box` "Stock value" | hero (spans 2), `--primary` | ৳ total | "1,240 units across 36 products" |
| `alert` "Losses, last 30 days" | hero, `--danger` | ৳ total | three [loss rows](loss-row.md) |
| "Low stock" | `--warning` | count, with a 26px alert icon | |
| "Out of stock" | `--danger` | count, with a 26px x icon | |
| "Products" | plain | count | |
| "Units in stock" | plain | count | |

## Count-up

`useCountUp(target)` animates from the previous value to the target over 700ms with an ease-out cubic curve. Whole numbers are shown while counting; the exact figure (with poisha, as taka via `formatTaka`) at the end. Under `prefers-reduced-motion: reduce` (or without `requestAnimationFrame`) the target shows at once.

## Styling

| Part | Value |
|---|---|
| Grid | 4 equal columns, gap `--spacing-4`; 2 columns, gap `--spacing-3` at ≤1023px |
| Tile | grid, gap `--spacing-1`, padding `--spacing-4` (`--spacing-3` ≤1023px), `--colors-surface`, 1px `--colors-border`, `--rounded-md`, `--shadow-card` |
| Hero | spans 2 columns, padding `--spacing-5` (`--spacing-4` ≤1023px) |
| Label | flex with icon, body-strong, `--colors-text-muted` |
| Value | 1.75rem / 700 / 1.2, tabular numbers (hero 2.25rem); ≤1023px 1.375rem (hero 1.75rem) |
| Meta | `--colors-text-muted` |

Motion (no reduced-motion preference): tiles fade up in a 50ms stagger and lift 2px with `--shadow-raised` on hover.

While loading, a `.skeleton-grid` of four shimmering `.skeleton` blocks (7rem high) stands in, with a visually hidden "Loading…".

## Report summary tiles (`.stat`)

Three tiles on the Report page: "Received", "Sold", "Lost (damage and missing)" (`.stat--out`, danger left bar). Each is padding `--spacing-4`, 1px `--colors-border`, 4px `--colors-primary` left bar, `--rounded-md`, `--shadow-card`; label meta size muted; value headline size and weight, tabular numbers. No count-up. Grid `repeat(auto-fit, minmax(160px, 1fr))`, 2 columns ≤1023px.

## Accessibility

A definition list: `<dt>` label, `<dd>` value. Icons `aria-hidden`. Low and Out are told apart by label and icon, not colour.

## Used on

/dashboard (05.1), /reports (07.1).
