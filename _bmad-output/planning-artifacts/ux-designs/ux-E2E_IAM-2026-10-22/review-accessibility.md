---
title: "Mojud UI - Accessibility review (as built)"
reviewed: [DESIGN.md, EXPERIENCE.md, apps/web/src]
date: 2026-11-16
standard: WCAG 2.1 AA
---

# Accessibility review — Mojud as built

## Verdict

**Pass, with three small gaps.** The built UI meets the WCAG 2.1 AA target set in NFR-5 for the checks it automates: colour contrast, structure, keyboard path and reduced motion. The gaps below are about announcing single field errors and the size of a few small controls.

## What is implemented

| Area | What the app does | Evidence |
|---|---|---|
| Contrast (1.4.3) | 16 text pairs at 4.5:1 or more in light, chosen dark and device dark; lowest is `success` on `success-tint`, 5.4:1 in light | `apps/web/test/a11y.test.tsx` reads `tokens.css` |
| Non-text contrast (1.4.11) | Inputs, selects, secondary and chip buttons use `control-border` (4.0:1 light, 4.4:1 dark on white/surface); `border` (2.5:1) is decoration only | `DESIGN.md` contrast table |
| Use of colour (1.4.1) | Stock, staff and approval states are pills with an icon and a word; change chips have an arrow icon and a sign; the "Low" pill also has a dashed outline | `StockBadge.tsx`, `MovementTable.tsx`, `StaffPage.tsx` |
| Automated checks | axe passes on every page in component tests, and on Sign up, Sign in and the signed-in frame in both themes | `apps/web/test/*.test.tsx` |
| Bypass blocks (2.4.1) | "Skip to content" is the first focusable element and moves focus to `main` | `SkipLink.tsx` |
| Focus visible (2.4.7) | 3 px `text`-coloured ring with a 2 px surface gap; choice tiles draw it around the whole tile | `base.css` |
| Keyboard | Everything is native links, buttons, inputs, selects and radios; a browser smoke test signs in with the keyboard only | `e2e/smoke.spec.ts` |
| Structure (1.3.1) | One `h1` per page; `nav` named "Main" with `aria-current="page"`; tables with `th scope`; dashboard tiles as a definition list; forms with real labels | pages, `SideNav.tsx` |
| Errors (3.3.1, 3.3.3) | Errors appear under the field with `aria-invalid` and `aria-describedby`; a form-level error or two or more field errors show a summary that takes focus and links to each field | `InputField.tsx`, `FormErrorSummary.tsx` |
| Status messages (4.1.3) | Saved messages use `role="status"`; approvals and staff action errors use `role="alert"`; busy buttons set `aria-busy` and say "Saving…" | pages |
| Names (4.1.2) | Repeated row actions name their person ("Reset password for Karim", "Deactivate Karim"); "Reverse…" names the movement; the password toggle is `aria-pressed` | `StaffPage.tsx`, `MovementTable.tsx`, `PasswordField.tsx` |
| Reflow (1.4.10) | Works from 320 px; at 360 px every page has the bottom menu and no sideways page scroll (smoke test). Products and Staff become cards below 700 px | `base.css`, `e2e/smoke.spec.ts` |
| Motion (2.3.3) | All animation, the spinner's turn and the dashboard count-up stop when reduced motion is requested | `base.css`, `useCountUp.ts` |
| Language (3.1.1) | `<html lang="en">` | `index.html` |

## Gaps

1. **A single server field error is not announced.** On Stock in / out, Flag damage, Stock count, Products, Staff and My password, an API error tied to one field (for example "Only 3 bag in stock.") appears under the field but focus stays on the button and the message has no live role. Screen-reader users may miss it. Fix: move focus to the field, or put the message in a live region. (Sign up already moves focus to the first invalid field.)
2. **Some targets are under 48 px.** Chip buttons are 36 px tall on desktop (48 px on phones) and the Approvals toggles are 40 px. Both pass WCAG 2.1 AA, which has no size rule at this level, but miss the app's own 48 px target.
3. **History and Report tables scroll sideways on phones.** The page itself does not scroll, but the table does, inside its card. This is allowed for data tables under 1.4.10, though it is harder to use than the Products and Staff cards.
