# Button Danger

**Code:** inline `<button className="button button--danger">` in `apps/web/src/pages/stock/DamagePage.tsx` · **Class:** `.button--danger`
**Mockups:** not shown in the four key mockups; the Flag damage page uses the same frame as [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The submit button of the Flag damage form. It is red because flagging takes units out of sellable stock at once.

## Anatomy

`alert` icon + "Flag damage". `type="submit"`, test id `damage-save-button`, `aria-busy` while sending (a second submit is ignored in the handler).

## Styling

Full width, min-height `--spacing-button-desk` (3.5rem), `--typography-label-button-size`, no border, `--colors-on-danger` on `--colors-danger` (7.2:1 light, 8.2:1 dark). Hover `--shadow-raised`; active `scale(0.98)`; [focus ring](focus-ring.md).

## Used on

/damage, Flag damage (page 03.1).

## Related

[chip-button](chip-button.md) `--danger` (the "Flag damage" row action on Products), [button-approve](button-approve.md).
