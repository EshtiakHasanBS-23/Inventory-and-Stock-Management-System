# Theme Switch

**Code:** `apps/web/src/components/ThemeSwitch.tsx`, `apps/web/src/theme/theme.ts`, `apps/web/public/theme-init.js` · **Classes:** `.theme-switch`, `.theme-switch__label`
**Mockups:** in the app bar of [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html) and [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html)
**Tokens:** [design-tokens.md](../design-tokens.md#themes) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A labelled native `<select>` in the [app bar](app-bar.md) with three choices: **Light**, **Dark**, **Device**.

## Behaviour

- **Light / Dark** set `data-theme="light"` / `"dark"` on `<html>` and save the choice in `localStorage` (`mojud-theme`). `theme-init.js` applies it before first paint, so there is no flash.
- **Device** removes the attribute and the saved value; the `@media (prefers-color-scheme: dark)` block in `tokens.css` then follows the operating system.
- If storage is blocked, the choice still applies for the session and a warning is logged; reading falls back to Device.

## Styling

Inline-flex, gap `--spacing-2`. The select: min-height `--spacing-target-min`, padding 0 `--spacing-2`, `--colors-text` on `--colors-surface`, 1px `--colors-control-border`, `--rounded-sm`.

## Responsive

≤1023px the "Theme" label is visually hidden (still the accessible name); ≤599px the select is at most 6.5rem wide; ≤359px the switch is hidden.

## Accessibility

`<label for="theme-switch">Theme</label>` names the select. Test id `theme-switch`.

## Content

"Theme"; options "Light", "Dark", "Device".

## Used on

Every signed-in route (inside the app bar).
