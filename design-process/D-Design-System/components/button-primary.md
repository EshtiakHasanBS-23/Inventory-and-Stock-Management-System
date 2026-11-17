# Button Primary

**Code:** `ButtonPrimary` in `apps/web/src/components/Buttons.tsx` · **Classes:** `.button.button--primary`, `.spinner`
**Mockups:** [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html) ("Save")
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The main action of a form. One per form.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | ReactNode | | label |
| `testId` | string | | `data-testid` |
| `type` | `"submit"` \| `"button"` | `"submit"` | Import uses `"button"` with `onClick` |
| `busy` | boolean | false | shows the spinner and ignores clicks |
| `onClick` | () => void | | |

## States

| State | Look | Behaviour |
|---|---|---|
| Default | `--colors-on-primary` on `--colors-primary` | |
| Hover | `--shadow-raised`; lifts 1px (motion allowed) | |
| Active | `scale(0.98)` | |
| Focus | global [focus ring](focus-ring.md) | |
| Busy | spinner (1em ring, `currentColor`, 0.8s spin; still under reduced motion) before the label, visually hidden "Saving…", `cursor: progress` | `aria-busy="true"` and `aria-disabled="true"`; a click is prevented, so a form cannot be sent twice |

There is no disabled state: the button stays enabled and the server or form check explains what is missing through the [form error summary](form-error-summary.md) and [refusal messages](refusal-message.md).

## Styling

Inline-flex, centred, gap `--spacing-2`; min-height `--spacing-button-desk` (3.5rem); padding 0 `--spacing-4`; `--typography-label-button-size` (1.125rem) / weight 700; `--rounded-md`; no border; transitions transform 120ms, shadow and background 160ms.

**Width:** full width by default (auth cards, single-column forms). Inside `.form-actions` it is auto width on desktop and full width again ≤1023px (actions stack).

## Content (labels in use)

"Create business", "Sign in", "Save" (Stock in / out), "Save count", "Add product" / "Save changes", "Import N products", "Add staff member", "Set password", "Ask for reversal", "Change password".

## Used on

/signup (01.1), /products/import (01.2), /products (01.3), /staff (01.4, 08.1), /signin (02.1), /stock (02.2), /count (04.1), /history reversal form (05.2), /account (08.2).

## Related

[button-secondary](button-secondary.md) (Cancel beside it), [button-danger](button-danger.md) (Flag damage page uses that instead), [form-error-summary](form-error-summary.md).
