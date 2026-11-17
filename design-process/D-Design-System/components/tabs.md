# Tabs (segmented)

**Code:** `ApprovalsPage.tsx` · **Classes:** `.tabs`, `.tab`
**Mockups:** [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A pill-shaped pair of toggle buttons that switches the Approvals list between **Waiting** and **Decided**. The choice lives in the URL (`?status=decided`), so it survives a refresh and can be shared.

## Markup

`<div class="tabs" role="group" aria-label="Approvals">` with two `<button class="tab" aria-pressed="true|false">`. Switching clears any toast or error. Test ids `approvals-tab-pending`, `approvals-tab-decided`.

## Styling

Group: inline-flex, gap `--spacing-1`, padding `--spacing-1`, margin-bottom `--spacing-4`, `--colors-surface`, 1px `--colors-border`, `--rounded-full`. Tab: min-height 2.5rem, padding 0 `--spacing-4`, body-strong, `--colors-text-muted`, no background, `--rounded-full`. Pressed: `--colors-on-primary` on `--colors-primary`.

## Accessibility

Pressed state is exposed by `aria-pressed` and shown by fill and text colour. Keyboard: Tab to each button, Enter or Space to choose; [focus ring](focus-ring.md).

## Used on

/approvals (page 03.2).
