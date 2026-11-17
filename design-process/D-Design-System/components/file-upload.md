# File Upload (Import)

**Code:** `apps/web/src/pages/stock/ImportPage.tsx`, parsing in `apps/web/src/csvImport.ts` · **Classes:** `.steps`, `.field input[type="file"]`, `.error-summary`, `.data-table`
**Mockups:** none of the four shows it
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The Import from Excel page: numbered steps, a native file input for a CSV, a checked preview, and one import button. Owner and Manager only.

## Anatomy

1. **Steps** (`<ol class="steps">`): "Fill in your products in Excel, using the template: **Download template**" (a link that downloads `mojud-products-template.csv`), "Save the sheet as "CSV UTF-8".", "Choose the file below, check the preview, then import."
2. **Panel** with a `.field`: label "CSV file", `<input type="file" accept=".csv,text/csv">` (no border, padding `--spacing-2` 0, test id `import-file-input`).
3. **Problems** (when the browser check finds any): an `.error-summary` box with `role="alert"`: "stock.csv has 3 problems. Fix them in Excel and choose the file again." and up to 20 lines "Row 4: …".
4. **Ready** (no problems): "12 products are ready to import.", a preview [data table](data-table.md) (SKU, Name, Unit, Unit cost (৳), Minimum stock, Opening stock; first rows only, then "…and N more."), and a [button-primary](button-primary.md) "Import 12 products" (`type="button"`, busy while sending).
5. **Server refusal** as a [refusal message](refusal-message.md) with `role="alert"`; **done** as a [confirmation toast](confirmation-toast.md): "Imported 12 products with 480 units of opening stock. See products".

There is no drag-and-drop zone.

## Used on

/products/import, Import from Excel (page 01.2), reached from the "Import from Excel" button on Products.
