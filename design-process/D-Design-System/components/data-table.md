# Data Table

**Code:** `MovementTable` (`apps/web/src/pages/stock/MovementTable.tsx`), tables in `ProductsPage.tsx`, `StaffPage.tsx`, `ReportPage.tsx`, `ImportPage.tsx` · **Classes:** `.table-wrap`, `.data-table`, `.data-table--stack`, `.num`, `.cell-title`, `.cell-name`, `.cell-code`, `.cell-strong`, `.cell-actions`, `.row-actions`, `.held`, `.row--inactive`; compact list `.movement-list`
**Mockups:** [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html) (stacked table), [key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html) (compact movement list)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A real `<table>` on a card. Two flavours:

- **Scrolling table** (`.data-table`): wide tables (History, Report, Import preview) scroll sideways inside `.table-wrap` on small screens.
- **Stacked table** (`.data-table data-table--stack`): Products and Staff become one card per row on phones (≤699px), each value with its column label (`data-label`) beside it.

## Tables in the app

| Page | Columns | Flavour |
|---|---|---|
| Products | Product (name + SKU), In stock (+ "2 held as damaged"), Min stock, Unit cost, Value, Status ([pill](stock-state-pill.md)), actions ([chips](chip-button.md)) | stacked |
| Staff | Name (avatar + name), Phone number, Role ([role pill](role-pill.md)), Status (Active / Deactivated pill), actions | stacked |
| History (`MovementTable`) | When, Product (+ SKU), Change ([change pill](change-pill.md)), Value, Reason (+ note), Balance after, By, and "Reverse…" ([link button](link-button.md)) for Owner and Manager | scrolling |
| Report | Product (row header, + SKU · unit), Start, In, Sold, Damaged, Count +/−, Adjusted, End; `<tfoot>` Total row | scrolling |
| Import preview | SKU, Name, Unit, Unit cost (৳), Minimum stock, Opening stock | scrolling |

## Styling

| Part | Value |
|---|---|
| `.table-wrap` | `position: relative; overflow-x: auto`, `--colors-surface`, 1px `--colors-border`, `--rounded-lg`, `--shadow-card` (no border or shadow inside a `.card`) |
| Cells | padding `--spacing-2` `--spacing-3` (stacked: `--spacing-3` `--spacing-4`), left aligned, 1px `--colors-border` bottom; none on the last row |
| Header | meta size, `--colors-text-muted` on `--colors-surface-alt` |
| `.num` | right aligned, tabular numbers |
| Row hover | `--colors-surface-alt` |
| `<tfoot>` | body-strong, 2px `--colors-border` top |
| `.cell-code` | tabular, `--colors-text-muted`, no wrap (SKU, phone) |
| `.held` | block, meta size, `--colors-warning` ("2 held as damaged") |
| `.row--inactive` | name, code and avatar in muted colours (deactivated staff) |

**Stacked at ≤699px:** the `<thead>` is visually hidden; each `<tr>` is a block card (padding `--spacing-3` `--spacing-4`, border between rows); each `<td>` is a flex row with `attr(data-label)` on the left (meta, muted, body-strong) and the value on the right; the title cell is title size with no label; actions fill the width.

## Compact movement list (Dashboard)

`MovementTable compact` renders a `<ul class="movement-list">`: product name (body-strong) with "Purchase · Karim · 3 Nov, 09:40" in muted below, and the change pill on the right; rows split by a 1px border. It reads well on a phone without a table.

## States

Loading ("Loading…"), load failed ([refusal](refusal-message.md)), [empty](empty-state.md). History loads 50 rows at a time with a centred "Load more" [button-secondary](button-secondary.md) (`.load-more`).

## Accessibility

`<th scope="col">` headers; the Report uses `<th scope="row">` for product names. The actions column header is visually hidden text "Actions". Dates use `en-GB` short form ("3 Nov, 09:40"); money uses taka with lakh grouping (৳12,45,000).

## Used on

/products (01.3), /staff (01.4, 08.1), /history (05.2), /reports (07.1), /products/import (01.2), /dashboard (05.1, compact list).
