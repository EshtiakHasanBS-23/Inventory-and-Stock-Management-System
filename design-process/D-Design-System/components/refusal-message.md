# Refusal Message

**Code:** `RefusalMessage` in `apps/web/src/components/RefusalMessage.tsx`, and `<p className="refusal">` used directly on pages · **Class:** `.refusal`
**Mockups:** [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A short red message that says what was refused and what to do. Used under a field (via `InputField` / `SelectField` `error`), and on its own for page-level failures.

## Styling

No margin; padding-left `--spacing-2`; 4px `--colors-danger` left bar; `--colors-danger` text, body-strong weight (7.2:1 on surface light, 8.3:1 dark). The bar plus the words make it readable without colour.

## Uses

| Where | Role | Example |
|---|---|---|
| Under a field | linked by `aria-describedby`, the input gets `aria-invalid` | "Enter a phone number of 6 to 15 digits.", "Only 3 bag in stock." |
| Page could not load | none | "Couldn't load this. Refresh the page to try again." |
| Action failed (approvals, staff row, import, sign out) | `role="alert"` | "This was already decided.", "Couldn't save. Try again." |
| Session ended (Sign in) | `role="status"` | "Your session ended. Sign in again." |
| Report range | none | "Choose a start date on or before the end date." |

## Content rules

Say what happened and the way forward in one sentence. Use numbers with units ("Only 3 bag in stock."). No error codes.

## Used on

Every page with a form or loaded data.

## Related

[input-field](input-field.md), [form-error-summary](form-error-summary.md), [confirmation-toast](confirmation-toast.md).
