# Focus Ring

**Code:** `:focus-visible` rule at the top of `apps/web/src/styles/base.css`; `.choice-tile:has(input:focus-visible)` for choice tiles
**Mockups:** visible when tabbing through any mockup
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

One global keyboard focus style for every focusable element: links, buttons, inputs, selects, tabs, chip buttons and nav items.

## Styling

```css
:focus-visible {
  outline: 3px solid var(--colors-text);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--colors-surface);
}
```

A 2px `surface` inner line and a 3px `text` outer line, so the ring shows on any background in both themes. Text fields and selects also switch to a 2px `--colors-primary` border while focused (2px `--colors-danger` when invalid).

**Choice tiles:** the real radio is invisible and covers the tile, so the tile itself draws the ring: `outline: 3px solid var(--colors-text); outline-offset: 2px` when its radio has `:focus-visible`.

**Exceptions:** `<main>` (`.app-main:focus`) has no outline: it only gets focus from the skip link, never from Tab.

## Accessibility

Shown for keyboard focus only (`:focus-visible`), never removed. Checked by the axe component tests in both themes.

## Used on

Every route.
