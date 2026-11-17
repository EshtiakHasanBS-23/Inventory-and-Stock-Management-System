# Change Pill

**Code:** `Change` in `apps/web/src/pages/stock/MovementTable.tsx`; quantity on approval cards · **Classes:** `.change`, `.change--in`, `.change--out`
**Mockups:** [key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html) (Recent movements), [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html) (quantity in each card)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A small rounded-full pill showing a stock change with its sign and unit: "+10 bag" or "−2 bag".

## Variants

| Variant | Icon | Colours |
|---|---|---|
| `--in` | `in` (arrow down to tray), "+" | `--colors-success` on `--colors-success-tint` |
| `--out` | `out` (arrow up), "−" | `--colors-danger` on `--colors-danger-tint` |

On approval cards the pill is always `--out` and shows the quantity without a sign or icon ("2 bag").

## Styling

Inline-flex, gap 0.2rem, padding 0.0625rem `--spacing-2`, body-strong, no wrap, `--rounded-full`. Icon 14px. In tables it sits in a right-aligned `.num` cell.

## Accessibility

The sign and the word carry the direction; colour and icon repeat it.

## Used on

/history (05.2), /dashboard recent movements (05.1), /approvals (03.2).
