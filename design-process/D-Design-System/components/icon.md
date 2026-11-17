# Icon

**Code:** `apps/web/src/components/Icons.tsx` (`<Icon name size />`) · **Class:** `.icon`
**Mockups:** all four (inline SVG copied from the same set)
**Tokens:** none (draws in `currentColor`) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The one icon set: inline SVG line icons on a 24×24 grid, `stroke="currentColor"`, stroke width 2, round caps and joins, no fill. Never emoji, never an icon font.

## Props

| Prop | Type | Default |
|---|---|---|
| `name` | one of the names below | required |
| `size` | number (px) | 20 |

## Names and where they appear

| Name | Meaning | Used in |
|---|---|---|
| `logo` | Mojud mark (box) | app bar logo (22px) |
| `dashboard` | Dashboard | nav |
| `box` | Products / stock value | nav, stock value tile, products empty state |
| `swap` | Stock in / out, reversal | nav, product chip, reversal approval card, My record |
| `clipboard` | Stock count | nav, My record |
| `clock` | History | nav, product chip, history empty state |
| `check` | Approvals, OK, approved, active | nav, OK pill, Approve button, empty states |
| `chart` | Report | nav |
| `person` | My record | nav |
| `users` | Staff | nav |
| `key` | My password, reset password | nav, staff chip |
| `alert` | Low, damage, losses, pending | Low pill, Flag damage button and chip, losses tile, pending banner |
| `x` | Out, rejected, deactivate | Out pill, out-of-stock tile, staff chip |
| `chevron` | Go to | loss rows, banner, Stock in links |
| `in` / `out` | Stock in / Stock out | choice tiles, change pills |
| `upload` | Import | "Import from Excel" button |
| `download` | Download | defined; CSV links are text only |

## Accessibility

Every icon has `aria-hidden="true"` and `focusable="false"`. The text next to it carries the meaning, so no state or action depends on the icon alone. `.icon { flex: none }` keeps it from shrinking.
