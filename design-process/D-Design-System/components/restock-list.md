# Restock List

**Code:** `DashboardPage.tsx` · **Classes:** `.attention-list`, `.attention-list__name`, `.go`
**Mockups:** [key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The "Needs restocking" card on the Dashboard: products at or below their minimum stock, out-of-stock first, each with a quick Stock in link.

## Row anatomy

Name (body-strong) with "4 bag (min 10)" in muted meta below · [stock state pill](stock-state-pill.md) (Low or Out) · `.go` link "Stock in" + chevron to /stock?productId=… (pre-selects the product).

## Styling

List with no gaps; each row a grid `minmax(0,1fr) auto auto`, gap `--spacing-3`, padding `--spacing-2` 0, 1px `--colors-border` top. `.go`: inline-flex, gap `--spacing-1`, min-height 48px, body-strong, `--colors-primary`, underlined on hover. ≤1023px the row is two columns and the link wraps to its own full-width line (min-height 2.5rem).

## Empty

[Empty state](empty-state.md): "Every product is above its minimum stock."

## Used on

/dashboard (page 05.1).
