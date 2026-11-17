# UX Spine Review — Mojud (as built)

Reviewed: `DESIGN.md` and `EXPERIENCE.md` (ux-E2E_IAM-2026-10-22) against the code (`apps/web/src`), the PRD (`prd-E2E_IAM-2026-10-22/prd.md`) and the UX scenarios (`design-process/C-UX-Scenarios/`). Mockups: `mockups/key-dashboard.html`, `mockups/key-stock-movement.html`, `mockups/key-approvals.html`, `mockups/key-products.html`. Date: 2026-11-16.

## Verdict

**Good. The pair matches the build.** Every token value in `DESIGN.md` is copied from `tokens.css`; every route, label and message in `EXPERIENCE.md` exists in the code or `en.json`.

## Rubric

| Criterion | Result | Notes |
|---|---|---|
| Tokens match the code | Pass | Light and dark colours, spacing, radii, shadows and type sizes taken from `tokens.css` / `base.css`. Five defined-but-unused tokens are named as such. |
| Contrast claims recompute | Pass | Ratios computed from the hex values; the same pairs are guarded by a unit test. |
| Components described exist | Pass | Buttons, InputField, PasswordField, SelectField, error summary, refusal message, StockBadge, chips, choice tiles, panels, cards, tables-as-cards (Products and Staff only), approval cards, banner, count-up figures, skeleton. |
| Every route covered | Pass | 14 routes, each with who can open it and its FR. |
| Roles shown correctly | Pass | Matches `roles.ts`, the page code and the PRD role table. |
| Flows map to scenarios | Pass | S01–S08 with their US IDs, real labels and failure paths. |
| Copy is real | Pass | Messages quoted from `en.json` and the API. |
| Empty, loading, error states | Pass | Table per page. |
| Accessibility claims are real | Pass | Each claim points to a test or a file; gaps are listed in `review-accessibility.md`. |
| Only built behaviour | Pass | No unbuilt screens or future work described. |

## Findings

1. **Medium — single field errors are silent for screen readers.** See `review-accessibility.md`, gap 1.
2. **Low — "Online" in the app bar is a fixed label.** It always shows "Online" with a cloud-check icon and carries no state. Either give it meaning or remove it.
3. **Low — unused tokens.** `on-info`, `page`, `scrim`, `surface-disabled`, `text-disabled` (and three type sub-tokens) are defined in `tokens.css` but not used.
4. **Low — deactivate has no confirm step.** Deactivating a staff member happens on one tap. It is reversible ("Reactivate"), so the risk is small.
5. **Low — History and Report tables scroll sideways on phones**, unlike the Products and Staff cards.
