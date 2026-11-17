# Mojud Design Tokens

**Source of truth:** [`apps/web/src/styles/tokens.css`](../../apps/web/src/styles/tokens.css). Every value below is copied from that file; components use them through `var(--…)` in [`apps/web/src/styles/base.css`](../../apps/web/src/styles/base.css). To change a value, change `tokens.css` and then this page.
**Index:** [00-design-system.md](00-design-system.md) · **Live view:** [catalog.html](catalog.html)

---

## Naming

CSS custom properties named `--<group>-<name>`: `--colors-primary`, `--spacing-target-min`, `--rounded-md`, `--typography-title-size`, `--shadow-card`, `--layout-side-nav-width`. Specs refer to them by that name.

## Themes

| Theme | How it applies |
|---|---|
| Light | `:root` (default) |
| Dark (chosen) | `:root[data-theme="dark"]`, set by the [theme switch](components/theme-switch.md) |
| Dark (device) | `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` when the theme is "Device" |

The two dark blocks hold the same values (a test checks this). Only colours and shadows change between themes; spacing, type, radius and layout are shared.

---

## Colors

### Base

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--colors-primary` | `#0b5a54` | `#63d5c6` | brand, links, primary button, current nav item, tile figures |
| `--colors-on-primary` | `#ffffff` | `#00211e` | text on primary |
| `--colors-surface` | `#ffffff` | `#0e1716` | cards, panels, tables, inputs, app bar |
| `--colors-surface-alt` | `#edf4f2` | `#18241f` | page background, side nav, table header, row hover, empty state |
| `--colors-text` | `#0d1f1c` | `#eaf4f1` | body text, focus ring |
| `--colors-text-muted` | `#3e524f` | `#aabfba` | labels, hints, meta text, nav icons |
| `--colors-border` | `#8faaa5` | `#3d524d` | decorative card and row dividers only |
| `--colors-control-border` | `#6b8580` | `#6b827c` | outline of every input, select, secondary button, chip, choice tile |

### Semantic

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--colors-success` | `#1b6e31` | `#74d68c` | saved toast, Approve button, OK pill text, Stock in, Online icon, empty-state icon |
| `--colors-on-success` | `#ffffff` | `#06210e` | text on success |
| `--colors-warning` | `#8a4f00` | `#f4b65c` | Low stock figure, damage card edge, "held as damaged" text |
| `--colors-on-warning` | `#ffffff` | `#2b1d00` | text on warning (defined; the Low pill now uses the tint pair) |
| `--colors-danger` | `#a8231b` | `#ff8f85` | refusals, error summary, losses, Out pill, Stock out, Flag damage button |
| `--colors-on-danger` | `#ffffff` | `#300704` | text on danger |
| `--colors-info` | `#1d5799` | `#8dbbf2` | role pill text, reversal card edge |
| `--colors-on-info` | `#ffffff` | `#071a33` | defined, not used by a component |

### Tints

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--colors-primary-tint` | `#d7ece8` | `#12302c` | nav hover, current bottom tab, avatars, count badge, secondary hover, record icons |
| `--colors-success-tint` | `#dff1e4` | `#12301b` | OK pill, Stock in change pill, chosen Stock in tile |
| `--colors-warning-tint` | `#ffc94d` | `#f4b65c` | Low pill, pending banner, count-warning toast |
| `--colors-on-warning-tint` | `#2b1d00` | `#2b1d00` | text and dashed outline on warning tint |
| `--colors-danger-tint` | `#fbe3e1` | `#3a1714` | Out pill, Stock out change pill, chosen Stock out tile, error summary, danger chip hover |
| `--colors-info-tint` | `#e1ecf8` | `#13243a` | role pill |

### Defined but not used by any component

| Token | Light | Dark |
|---|---|---|
| `--colors-surface-disabled` | `#e4ebe9` | `#1e2a27` |
| `--colors-text-disabled` | `#4f625f` | `#a3b5b1` |
| `--colors-scrim` | `#0d1f1c80` | `#00000099` |
| `--colors-page` | `#e3ecea` | `#0a1210` |

The app has no disabled controls and no overlays, so these have no consumer. The page background is `--colors-surface-alt`.

### Contrast (computed from tokens.css)

Every text pair the app uses reaches WCAG AA 4.5:1 in both themes. `apps/web/test/a11y.test.tsx` checks the main pairs in light, dark (chosen) and dark (device).

| Pair | Light | Dark |
|---|---|---|
| `text` on `surface` | 17.1:1 | 16.2:1 |
| `text` on `surface-alt` | 15.3:1 | 14.3:1 |
| `text-muted` on `surface` | 8.3:1 | 9.4:1 |
| `text-muted` on `surface-alt` | 7.5:1 | 8.3:1 |
| `on-primary` on `primary` | 8.1:1 | 9.6:1 |
| `primary` on `surface` | 8.1:1 | 10.3:1 |
| `primary` on `surface-alt` | 7.2:1 | 9.0:1 |
| `primary` on `primary-tint` | 6.5:1 | 8.0:1 |
| `text` on `primary-tint` | 13.9:1 | 12.6:1 |
| `danger` on `surface` | 7.2:1 | 8.3:1 |
| `danger` on `danger-tint` | 5.9:1 | 7.3:1 |
| `text` on `danger-tint` | 14.0:1 | 14.3:1 |
| `success` on `success-tint` | 5.4:1 | 8.0:1 |
| `on-success` on `success` | 6.3:1 | 9.5:1 |
| `on-danger` on `danger` | 7.2:1 | 8.2:1 |
| `warning` on `surface` | 6.6:1 | 10.1:1 |
| `on-warning-tint` on `warning-tint` | 10.7:1 | 9.1:1 |
| `info` on `info-tint` | 6.1:1 | 7.8:1 |
| `control-border` on `surface` (non-text, needs 3:1) | 4.0:1 | 4.4:1 |
| `border` on `surface` (decorative) | 2.5:1 | 2.2:1 |

`--colors-border` is below 3:1 on purpose: it only separates cards and rows. Anything a person must see to use a control has `--colors-control-border`.

---

## Typography

One font stack for everything:

```css
--typography-font-family: system-ui, "Segoe UI", Roboto, "Noto Sans Bengali", "Nirmala UI", sans-serif;
```

| Token set | Size | Weight | Line height | Used for |
|---|---|---|---|---|
| headline | `1.25rem` (20px) | 700 | 1.4 | page `h1`, report summary figures |
| title | `1.0625rem` (17px) | 700 | — | `h2`, brand, card titles, approval title and value, choice tile text |
| body | `1rem` (16px) | 400 | 1.5 | all text; inputs inherit it |
| body-strong | — | 600 | — | labels, buttons, nav, pills, table emphasis |
| label-button | `1.125rem` (18px) | 700 | 1.4 | primary, danger and approve button labels |
| meta | `0.875rem` (14px) | 500 | 1.4 | hints, table headers, pills, chips, muted lines |

Token names: `--typography-<set>-size`, `-weight`, `-line-height`; `--typography-body-strong-weight`. `meta-weight`, `meta-line-height` and `label-button-line-height` are defined but not referenced in base.css.

**Fixed sizes in base.css (no token):** metric figure 1.75rem / 700 / 1.2 (hero 2.25rem; 1.375rem and 1.75rem ≤1023px), My record count 1.5rem / 700. Numbers in tables, tiles, pills and money use `font-variant-numeric: tabular-nums`.

---

## Spacing

| Token | Value | Used for |
|---|---|---|
| `--spacing-1` | 0.25rem (4px) | icon gaps, field gap, tab group padding |
| `--spacing-2` | 0.5rem (8px) | small gaps, cell padding, refusal indent |
| `--spacing-3` | 0.75rem (12px) | control padding, list gaps, tile padding on phones |
| `--spacing-4` | 1rem (16px) | card padding, grid gaps, form gap |
| `--spacing-5` | 1.5rem (24px) | panel padding, section spacing, main padding |
| `--spacing-6` | 2rem (32px) | auth card padding, public page padding |
| `--spacing-gutter-phone` | 1rem | side padding below 1024px |
| `--spacing-gutter-desktop` | 1.5rem | side padding at 1024px and up |
| `--spacing-target-min` | 3rem (48px) | minimum height of every input, select, button, nav link, loss row |
| `--spacing-button-desk` | 3.5rem (56px) | primary, danger and approve buttons |
| `--spacing-app-bar-height` | 3.5rem (56px) | app bar min height, scroll padding |

---

## Radius

| Token | Value | Used for |
|---|---|---|
| `--rounded-sm` | 6px | inputs, selects, "waiting" note |
| `--rounded-md` | 12px | buttons, tiles, approval cards, toasts, banners, nav pills, choice tiles |
| `--rounded-lg` | 16px | panels, cards, table cards, auth card |
| `--rounded-full` | 9999px | pills, chips, tabs, avatars, count badge |

---

## Elevation

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--shadow-card` | `0 1px 2px rgb(13 31 28 / 6%)` | `none` | cards, panels, tiles, tables, app bar, current nav item |
| `--shadow-raised` | `0 6px 16px rgb(13 31 28 / 12%)` | `none` | hover on primary/approve/danger buttons, tiles, approval cards; auth card |
| `--shadow-float` | `0 6px 16px rgb(0 0 0 / 25%)` | `0 6px 16px rgb(0 0 0 / 50%)` | saved toast |

In dark mode cards are separated by their borders, not shadows.

---

## Layout

| Token | Value | Used for |
|---|---|---|
| `--layout-side-nav-width` | 13.75rem (220px) | side nav column |
| `--layout-content-max` | 75rem (1200px) | main area max width (desktop) |
| `--layout-auth-card-width` | 30rem (480px) | Sign up / Sign in card |

**Breakpoints (in base.css, not tokens):** ≤1199px (dashboard columns stack, 4-column forms go to 2), ≤1023px (bottom tab bar, phone gutters, tiles 2-up), ≤699px (stacked tables, one-column forms), ≤599px (app bar drops name and role), ≤359px (theme switch hidden). Works from 320px.

---

## Motion

No motion tokens. All animation sits in `@media (prefers-reduced-motion: no-preference)` except the busy spinner, which stops under `reduce`:

| Effect | Timing | On |
|---|---|---|
| fade-up (8px) | 260–320ms ease-out | page sections, tiles, cards, panels, tables, approval cards (tiles staggered 50ms) |
| slide-in (−12px, 0.98 scale) | 260ms | saved toast, error summary, pending banner; chosen tile icon 220ms |
| hover lift | 160ms | tiles and approval cards −2px; primary button −1px |
| press | 120ms | buttons and choice tiles scale 0.98 |
| shimmer | 1.4s linear loop | loading skeleton |
| count-up | 700ms ease-out cubic (JS, `useCountUp`) | dashboard figures |
