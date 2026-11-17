# Count Badge

**Code:** `ProductsPage.tsx`, `StaffPage.tsx` · **Classes:** `.list-toolbar`, `.list-toolbar__search`, `.list-toolbar__title`, `.list-toolbar__count`
**Mockups:** [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A rounded-full count above a list: "36 products", "6 people". It sits at the right end of the list toolbar, opposite the search box (Products) or the "Your team" heading (Staff). The Products count follows the search as you type.

## Styling

Padding `--spacing-1` `--spacing-3`, body-strong, `--colors-primary` on `--colors-primary-tint` (6.5:1 light, 8.0:1 dark), `--rounded-full`.

Toolbar: flex, wrap, items aligned to the bottom, space-between, gap `--spacing-3`, margin `--spacing-5` 0 `--spacing-3`. Search: `flex: 1 1 22rem`, max 28rem (no max ≤699px).

## Content

"{{count}} product(s)", "{{count}} person / people". Test ids `products-count`, `staff-count`.

## Used on

/products (01.3), /staff (01.4).
