# Loss Row

**Code:** `DashboardPage.tsx` · **Classes:** `.loss-rows`, `.loss-row`
**Mockups:** [key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

Three link rows inside the "Losses, last 30 days" [metric tile](owner-metric-tile.md). Each splits the loss by source and opens the History filtered to that reason, so the owner can trace a loss to the movements, people and notes behind it.

## Rows

| Label | Links to | Test id |
|---|---|---|
| "Written off" | /history?reason=damage | `loss-damage` |
| "Damage flags" (less rejected) | /history?reason=damage_flagged | `loss-damage_flagged` |
| "Missing in counts" | /history?reason=count | `loss-count` |

## Anatomy and styling

`<a class="loss-row">`: label (`flex: 1`) · amount in `<b>` (`--colors-danger`, tabular numbers) · 16px chevron. Flex, gap `--spacing-2`, min-height `--spacing-target-min` (48px), `--colors-text`, no underline, 1px `--colors-border` top. Hover underlines the label.

## Used on

/dashboard (page 05.1), leading to /history (05.2).
