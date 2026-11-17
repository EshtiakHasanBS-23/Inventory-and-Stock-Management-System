# Accessibility Checklist — Mojud core slice

Updated 2026-11-16 to record what the built screens do. Target: WCAG 2.1 AA in light and dark themes (NFR-5). Applies to every screen in `mockups.md`. Checked by `apps/web/test/a11y.test.tsx` (axe in both themes, contrast of every text pair), the component tests and the browser smoke test (`apps/web/e2e/smoke.spec.ts`).

## Global

- [x] Every page has `lang="en"` and a unique title "{Page} · Mojud".
- [x] Landmarks: `header` (app bar), `nav` labelled "Main" (side menu or bottom tab bar), `main` with `id="main"`; "Skip to content" is the first focusable element and moves focus to `main`.
- [x] One `h1` per page; headings in order.
- [x] Everything is usable by keyboard in visual order, with a visible focus ring in both themes.
- [x] Every text colour pair is at least 4.5:1 in light and dark, including the tint tokens (tested).
- [x] Touch targets at least 48 px tall (`--spacing-target-min`).
- [x] State is never shown by colour alone: stock pills (OK / Low / Out), approval kinds, staff status and the dashboard tiles carry an icon and text.
- [x] Saved messages use `role="status"`; refusals that appear after an action use `role="alert"`.
- [x] Motion (count-up, fade-up, toast slide) runs only under `prefers-reduced-motion: no-preference`.
- [x] Pages fit at 320 px wide without sideways page scroll (smoke test at 360 px and 320 px).
- [x] The current navigation item has `aria-current="page"`.

## Forms (Sign up, Sign in, Products, Import, Stock in / out, Stock count, Flag damage, History reversal, Staff, My password)

- [x] Every field has a visible label linked by `for`/`id`; hints and errors are linked with `aria-describedby`; invalid fields have `aria-invalid`.
- [x] With two or more errors, the error summary takes focus and links to each field.
- [x] The Stock in / Stock out tiles are real radio buttons in a `fieldset` with a legend.
- [x] Password fields have a Show/Hide toggle with an accessible name.
- [x] Busy buttons announce their state (`aria-busy`) and are not pressed twice.

## Lists and tables (Products, History, Dashboard, Report, Staff, Import preview)

- [x] Tables have header cells; on phones each row becomes a card that keeps the column labels.
- [x] Row actions name their row (for example "Deactivate Karim", "Reset password for Karim", "Reverse sale of 4 bag Rice 25 kg").
- [x] Empty and loading states are written in text.

## Approvals

- [x] Waiting and Decided are buttons with `aria-pressed`, grouped and labelled.
- [x] When a card cannot be decided by this person, the reason is shown in text ("Waiting for someone else to decide.") instead of a disabled button.

## Themes

- [x] Light, Dark and Device all pass the axe checks and the contrast test.
- [x] The chosen theme applies before first paint, so there is no flash of the other theme.

## Assumptions & Open Questions

None.
