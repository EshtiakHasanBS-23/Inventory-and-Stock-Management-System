# Chip Button

**Code:** row actions in `apps/web/src/pages/stock/ProductsPage.tsx` and `StaffPage.tsx` · **Classes:** `.chip-button`, `.chip-button--danger`, inside `.row-actions`
**Mockups:** [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A small rounded-full outline button or link for per-row actions in a [data table](data-table.md).

## Where and what

| Page | Chips (icon + label) |
|---|---|
| Products | `swap` "Stock in / out" (link to /stock?productId=), `alert` "Flag damage" (danger, link to /damage?productId=), `clock` "History" (link to /history?productId=), "Edit" (button; Owner, Manager only) |
| Staff | `key` "Reset password", `x` "Deactivate" (danger) or `check` "Reactivate". The Owner's row shows "That's you" instead |

## Variants

- **default:** `--colors-primary` text.
- **danger:** `--colors-danger` text; hover `--colors-danger-tint` background and `--colors-danger` border.

## Styling

Inline-flex, gap `--spacing-1`, min-height 2.25rem, padding 0 `--spacing-3`, meta size (0.875rem), body-strong weight, no wrap, no underline, `--colors-surface` background, 1px `--colors-control-border`, `--rounded-full`. Hover: `--colors-primary-tint` background, `--colors-primary` border. Transitions 160ms.

## Layout

`.row-actions` is a no-wrap flex row with gap `--spacing-2`. In a stacked table with three or more actions (Products) it becomes a 2×2 grid aligned right. On phones (≤699px) the chips fill the card width, wrap, and grow to min-height `--spacing-target-min` (48px).

## Accessibility

Staff chips carry a full `aria-label` with the person's name ("Reset password for Karim", "Deactivate Karim"). Icons are `aria-hidden`. The danger variant is also distinguished by its label and icon, not colour alone.

## Used on

/products (01.3), /staff (01.4, 08.1).
