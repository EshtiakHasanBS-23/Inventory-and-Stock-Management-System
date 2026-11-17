# Record Card

**Code:** `RecordPage.tsx` (`Period`, `Line`) · **Classes:** `.record-name`, `.record-grid`, `.card`, `.record-line`, `.record-line__icon`, `.record-line__text`, `.record-line__label`, `.record-line__value`
**Mockups:** none of the four shows My record
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

My record shows a person's own work in three cards: **Today**, **Last 7 days**, **Last 30 days**. Owner and Manager can pick another person with a [select field](select-field.md) ("Person", placeholder "Me").

## Card anatomy

A `.card` with an h2 period title and four lines:

| Icon | Label | Detail |
|---|---|---|
| swap | "Stock in and out" | "12 in · 5 out" (units) |
| clipboard | "Stock counts" | "2 missing · 0 extra" |
| alert | "Damage flags" | "1 approved · 0 rejected · 1 waiting" |
| check | "Decisions for others" | |

Each line: 2.25rem icon circle (`--colors-primary` on `--colors-primary-tint`), label (body-strong) with detail in muted below, and the count on the right (1.5rem, 700, tabular). Lines are split by a 1px `--colors-border` top.

## Styling

Person name above the grid in title size and weight. Grid `repeat(auto-fit, minmax(16rem, 1fr))`, gap `--spacing-4`. Card: `--colors-surface`, 1px `--colors-border`, `--rounded-lg`, `--shadow-card`, padding `--spacing-4`.

## Used on

/record, My record (page 06.1).
