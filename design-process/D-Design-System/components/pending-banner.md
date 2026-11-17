# Pending Banner

**Code:** `DashboardPage.tsx` · **Classes:** `.banner`, `.banner__sub`
**Mockups:** [key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A full-width amber link at the top of the Dashboard when approvals are waiting. The whole banner is one link to /approvals. Hidden when nothing is waiting.

## Anatomy

`alert` icon · two lines of text · `chevron` icon.

- Line 1: "3 requests waiting for approval" ("1 request…" for one).
- Line 2 (`.banner__sub`, meta size, normal weight; only when units are held as damaged): "৳5,400 held as damaged, waiting for a decision".

## Styling

Flex, gap `--spacing-3`, margin-bottom `--spacing-4`, padding `--spacing-3` `--spacing-4`, body-strong, no underline, `--colors-on-warning-tint` on `--colors-warning-tint` (10.7:1 light, 9.1:1 dark), `--rounded-md`, `--shadow-card`. With motion allowed it slides in (260ms).

## Accessibility

A single `<a>` whose text is the full message; icons `aria-hidden`. Test id `pending-approvals`.

## Used on

/dashboard (page 05.1).
