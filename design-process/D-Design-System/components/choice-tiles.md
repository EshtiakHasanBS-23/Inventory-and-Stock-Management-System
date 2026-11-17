# Choice Tiles

**Code:** `StockPage.tsx` · **Classes:** `.choice-tiles`, `.choice-tile`, `.choice-tile--in`, `.choice-tile--out`, `.choice-tile__icon`, `.choice-tile__text`, `.choice-tile__hint`
**Mockups:** [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The big **Stock in / Stock out** choice on the Stock in / out form: two real radio buttons drawn as tiles. Changing the direction resets the Reason select to the first reason of that direction.

## Anatomy

```html
<fieldset class="choice-tiles">
  <legend>Direction</legend>
  <label class="choice-tile choice-tile--in">
    <input type="radio" name="stock-direction" value="in" checked>
    <span class="choice-tile__icon"><!-- in icon, 26px --></span>
    <span class="choice-tile__text">Stock in
      <span class="choice-tile__hint">Purchase, return or adjustment</span></span>
  </label>
  <label class="choice-tile choice-tile--out">… Stock out · Sale, damage or adjustment …</label>
</fieldset>
```

The radio is invisible (`opacity: 0`) and covers the whole tile, so a tap anywhere chooses it, and keyboard, screen readers and tests use the radio itself.

## States

| State | Tile | Icon circle |
|---|---|---|
| Unchosen | `--colors-surface`, 2px `--colors-control-border` | `--colors-text-muted` on `--colors-surface-alt` |
| Stock in chosen | `--colors-success-tint`, 2px `--colors-success` border | `--colors-on-success` on `--colors-success` |
| Stock out chosen | `--colors-danger-tint`, 2px `--colors-danger` border | `--colors-on-danger` on `--colors-danger` |
| Keyboard focus | 3px `--colors-text` outline, 2px offset | |

The choice is shown by colour, border, the arrow icon and the label together.

## Styling

Two equal grid columns, gap `--spacing-3`. Tile: flex, gap `--spacing-3`, min-height 4.5rem, padding `--spacing-3`, `--rounded-md`. Icon circle 2.75rem, `--rounded-full`. Text title weight; hint meta size, normal weight, muted. ≤1023px each tile stacks icon above text, centred.

## Motion

Border and background ease over 160ms. With motion allowed, a pressed tile scales to 0.98 and the chosen icon slides in (220ms).

## Used on

/stock, Stock in / out (page 02.2).
