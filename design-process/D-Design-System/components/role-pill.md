# Role Pill and Person

**Code:** `StaffPage.tsx` · **Classes:** `.pill`, `.pill--role`, `.pill--owner`, `.person`, `.person__avatar`
**Mockups:** none of the four (the Staff page uses the [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html) table look)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

In the Staff table: a **person** cell (initial avatar + name) and a **role pill**.

## Role pill

| Variant | Colours | Text |
|---|---|---|
| `pill--role` | `--colors-info` on `--colors-info-tint` (6.1:1 light, 7.8:1 dark) | "Manager", "Supervisor", "Warehouse worker", "Sales rep", "Accountant" |
| `pill--role pill--owner` | `--colors-on-primary` on `--colors-primary` | "Owner" |

Inline-block, padding 0.125rem `--spacing-3`, meta size, body-strong, no wrap, `--rounded-full`. Not interactive.

## Person

Inline-flex, gap `--spacing-3`. Avatar: 2.25rem circle, the first letter of the name, 700 weight, `--colors-primary` on `--colors-primary-tint`, `aria-hidden`. A deactivated person's avatar and text go muted (`.row--inactive`). The app bar avatar uses the same look.

## Used on

/staff (pages 01.4, 08.1).
