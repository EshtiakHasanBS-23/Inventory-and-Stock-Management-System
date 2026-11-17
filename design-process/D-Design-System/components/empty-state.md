# Empty State

**Code:** `<p className="empty-state">` in `MovementTable.tsx`, `DashboardPage.tsx`, `ProductsPage.tsx`, `ApprovalsPage.tsx` · **Class:** `.empty-state`
**Mockups:** none of the four shows an empty list
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

One line that replaces an empty list, with a 28px icon.

## Styling

Flex, gap `--spacing-3`, padding `--spacing-4`, `--colors-text-muted` on `--colors-surface-alt`, `--rounded-md`; the icon is `--colors-success`.

## Messages

| Where | Icon | Text |
|---|---|---|
| Dashboard, Needs restocking | check | "Every product is above its minimum stock." |
| Dashboard recent / History | clock | "No stock movements yet." |
| Products | box | "No products yet." / "No products match this search." |
| Approvals | check | "Nothing is waiting for a decision." / "Nothing has been decided yet." |

## Used on

/dashboard (05.1), /history (05.2), /products (01.3), /approvals (03.2).
