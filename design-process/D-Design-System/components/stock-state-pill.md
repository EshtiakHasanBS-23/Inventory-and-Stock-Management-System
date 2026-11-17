# Stock State Pill

**Code:** `StockBadge` in `apps/web/src/pages/stock/StockBadge.tsx`; the same `.badge` classes for approval outcomes and staff status · **Classes:** `.badge`, `.badge--ok`, `.badge--low`, `.badge--out`, `.badge--muted`
**Mockups:** [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html) (Status column), [key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html) (Needs restocking)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A rounded-full pill with a tint, an icon and a word. It never relies on colour alone.

## Stock states (`StockBadge status`)

| Status | Rule | Icon | Text | Colours (light / dark contrast) |
|---|---|---|---|---|
| `ok` | above minimum stock | check | "OK" | `--colors-success` on `--colors-success-tint` (5.4:1 / 8.0:1) |
| `low` | at or below minimum, above 0 | alert | "Low" | `--colors-on-warning-tint` on `--colors-warning-tint` (10.7:1 / 9.1:1) + 2px dashed inner outline in `--colors-on-warning-tint` (offset −4px), padding 0.125rem 0.625rem |
| `out` | 0 in stock | x | "Out" | `--colors-danger` on `--colors-danger-tint` (5.9:1 / 7.3:1) |

The status is computed by the API from on-hand and minimum stock.

## Other uses of `.badge`

| Where | Variant | Text |
|---|---|---|
| Approvals, Decided tab | `--ok` (check) / `--out` (x) | "Approved by Rafiq · 3 Nov, 10:15" / "Rejected by …" |
| Staff, Status column | `--ok` (check) / `--muted` (x) | "Active" / "Deactivated"; muted is `--colors-text-muted` on `--colors-surface-alt` with a 1px `--colors-border` outline |

## Styling

Inline-flex, centred, gap `--spacing-1`, padding 0.125rem `--spacing-2`, meta size (0.875rem), body-strong weight, no wrap, `--rounded-full`. Icon 14px.

## Accessibility

Plain text in a `<span>`; icon `aria-hidden`. Not focusable. Test id `stock-badge`.

## Used on

/products (01.3), /dashboard Needs restocking (05.1), /approvals (03.2), /staff (01.4).

## Related

[change-pill](change-pill.md), [role-pill](role-pill.md), [icon](icon.md).
