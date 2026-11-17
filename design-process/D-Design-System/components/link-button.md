# Link Button

**Code:** `MovementTable.tsx` (Reverse…), `HistoryPage.tsx` (Clear filters) · **Class:** `.link-button`
**Mockups:** none of the four shows it
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A `<button>` that looks like a text link, for a light action inside text or a table row.

## Uses

| Label | Where | Notes |
|---|---|---|
| "Reverse…" | last column of the History table, on reversible rows, Owner and Manager only | `aria-label` "Reverse Purchase of 10 bag Rice 25 kg"; opens the reversal panel form above the table |
| "Clear filters" | under the History filters, when any filter is set | clears the URL query |

## Styling

No padding, background or border; inherits font; `--colors-primary`, underlined. Hover thickens the underline to 2px. Inside `.row-actions` it is body-strong weight, not underlined until hover.

## Used on

/history (page 05.2).
