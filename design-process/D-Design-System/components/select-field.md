# Select Field

**Code:** `SelectField` in `apps/web/src/components/SelectField.tsx` · **Classes:** `.field`, `.field__control`, `.field select`
**Mockups:** [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html) (Product, Reason)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A native `<select>` with the same label, error and border rules as the [input field](input-field.md). The app has no custom dropdown or combobox; product choice is a native select listing "Name (SKU)".

## Props

`id`, `label`, `value`, `options: {value, label}[]`, `onChange(value)`, `error?`, `placeholder?` (an empty first option, e.g. "Choose a product"), `testId`.

## States

Default 1px `--colors-control-border`; focus 2px `--colors-primary` + [focus ring](focus-ring.md); invalid `aria-invalid="true"` with a [refusal message](refusal-message.md) below (linked by `aria-describedby`).

## Styling

`flex: 1`, min-height `--spacing-target-min`, padding 0 `--spacing-3`, inherited font, `--colors-text` on `--colors-surface`, `--rounded-sm`.

## Uses

| Page | Select | Placeholder / options |
|---|---|---|
| Stock in / out, Stock count, Flag damage | Product | "Choose a product"; "Rice 25 kg (RICE-25)" |
| Stock in / out | Reason | Stock in: Purchase, Customer return, Count adjustment. Stock out: Sale, Damaged (Owner and Manager only), Count adjustment |
| History | Product, Reason, By | "All products", "All reasons", "Everyone" |
| My record | Person (Owner, Manager) | "Me" |
| Staff | Role | Manager, Warehouse worker, Sales rep, Supervisor, Accountant |

## Used on

/stock (02.2), /count (04.1), /damage (03.1), /history (05.2), /record (06.1), /staff (01.4).
