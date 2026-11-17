# Side Nav

**Code:** `apps/web/src/components/SideNav.tsx`, items in `apps/web/src/session/roles.ts` (`ROLE_NAV`) · **Classes:** `.side-nav`, `.side-nav__label`
**Mockups:** [key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html), [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html), [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html), [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The main menu on screens 1024px and wider: a column of pill links with icons to the left of the page. Below 1024px the same element becomes the [bottom tab bar](bottom-tab-bar.md).

## Items (in order)

| Label | Route | Icon | Who |
|---|---|---|---|
| Dashboard | /dashboard | `dashboard` | everyone |
| Products | /products | `box` | everyone |
| Stock in / out | /stock | `swap` | everyone |
| Stock count | /count | `clipboard` | everyone |
| History | /history | `clock` | everyone |
| Approvals | /approvals | `check` | everyone |
| Report | /reports | `chart` | everyone |
| My record | /record | `person` | everyone |
| Staff | /staff | `users` | Owner only |
| My password | /account | `key` | everyone |

Flag damage (/damage) and Import from Excel (/products/import) are not menu items; they are reached from Stock in / out and Products.

## Styling

| Part | Value |
|---|---|
| Column | `flex: 0 0 --layout-side-nav-width` (13.75rem), padding `--spacing-3`, `--colors-surface-alt`, 1px `--colors-border` right edge |
| List | grid, gap `--spacing-1` |
| Link | flex, gap `--spacing-3`, min-height `--spacing-target-min` (48px), padding `--spacing-2` `--spacing-3`, `--rounded-md`, `--colors-text`, body-strong weight, no underline |
| Icon | 20px, `--colors-text-muted` |
| Hover | background `--colors-primary-tint` |
| Current page | `--colors-primary` text and icon on `--colors-surface`, `--shadow-card` |

## States

Default, hover, current (`aria-current="page"`, set by React Router `NavLink`), focus (global [focus ring](focus-ring.md)).

## Motion

With no reduced-motion preference, links ease background and shadow over 160ms.

## Accessibility

- `<nav aria-label="Main">` (`nav.label`).
- Current item announced through `aria-current="page"`, and shown by colour, white pill and shadow together.
- Icons are `aria-hidden`; the text label is always visible.
- Test ids: `side-nav`, `side-nav-<item>-link` (e.g. `side-nav-approvals-link`).

## Used on

Every signed-in route (see [app-bar](app-bar.md#used-on)).

## Related

[bottom-tab-bar](bottom-tab-bar.md) (same component on phones), [icon](icon.md), [app-bar](app-bar.md).
