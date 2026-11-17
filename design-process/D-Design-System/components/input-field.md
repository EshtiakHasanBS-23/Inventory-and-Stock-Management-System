# Input Field

**Code:** `InputField` in `apps/web/src/components/InputField.tsx`; `PasswordField` in `PasswordField.tsx` wraps it · **Classes:** `.field`, `.field--wide`, `.field__control`, `.field__hint`
**Mockups:** [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html) (Quantity, Note), [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html) (product form, search)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A labelled text box: label above, the box, then the hint and any error below. Every typed value in the app uses it: text, phone, password, numbers and dates.

## Anatomy

```html
<div class="field">                       <!-- .field--wide spans 2 grid columns -->
  <label for="id">Label</label>
  <div class="field__control">
    <input id="id" name="id" aria-describedby="id-hint id-error" aria-invalid="true">
    <!-- optional addon, e.g. the password Show/Hide button -->
  </div>
  <p class="field__hint" id="id-hint">Hint</p>
  <p class="refusal" id="id-error">Error</p>   <!-- refusal-message -->
</div>
```

Hints sit below the box so boxes in the same form row line up.

## Props

`id`, `label`, `value`, `onChange(value)`, `onBlur?`, `hint?`, `error?`, `type?` (`text` default, `tel`, `password`, `date`), `autoComplete?`, `inputMode?` (`numeric` for quantities, `decimal` for unit cost, `tel` for phone), `testId`, `addon?`, `wide?`.

## Password field

`PasswordField` is an input field whose addon is a [button-secondary](button-secondary.md) toggle: "Show" / "Hide", `aria-pressed`, `aria-controls` the input, `aria-label="Show password"`. It switches `type` between `password` and `text`. Test id `<testId>-toggle`.

## States

| State | Border |
|---|---|
| Default | 1px `--colors-control-border` (4.0:1 light, 4.4:1 dark against surface) |
| Focus | 2px `--colors-primary`, plus the [focus ring](focus-ring.md) |
| Invalid | 2px `--colors-danger`, `aria-invalid="true"`, error text below |

There is no disabled or read-only state.

## Styling

`.field`: one-column grid, gap `--spacing-1`. Label body-strong. Input: `flex: 1`, min-height `--spacing-target-min` (48px), padding 0 `--spacing-3`, inherited font (body 1rem), `--colors-text` on `--colors-surface`, `--rounded-sm`. Hint: meta size, `--colors-text-muted`, 0.125rem top margin. Date inputs keep `min-width: 0` so they fit a 320px screen.

## Validation timing

Sign up checks each field when the person leaves it (`onBlur`) and again on submit. Other forms send to the server and show the field the server names. Field errors render as [refusal messages](refusal-message.md); two or more are also listed in the [form error summary](form-error-summary.md).

## Content (examples from en.json)

Labels: "Business name", "Your name", "Phone number" (hint "You sign in with this number."), "Password" (hint "At least 8 characters."), "Quantity", "Note (optional)", "Counted quantity", "Damaged quantity", "SKU", "Name", "Unit" (hint "For example pcs, ctn or bag."), "Minimum stock", "Unit cost (৳)", "Search by name or SKU", "From", "To", "Why should it be reversed?", "Current password", "New password".

## Used on

/signup (01.1), /products (01.3, form and search), /staff (01.4, 08.1), /signin (02.1), /stock (02.2), /damage (03.1), /count (04.1), /history (05.2, dates and reversal note), /reports (07.1, dates), /account (08.2).

## Related

[select-field](select-field.md), [refusal-message](refusal-message.md), [form-error-summary](form-error-summary.md).
