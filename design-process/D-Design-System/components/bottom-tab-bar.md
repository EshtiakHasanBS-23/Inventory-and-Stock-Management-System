# Bottom Tab Bar

**Code:** the same `SideNav` component (`apps/web/src/components/SideNav.tsx`), restyled by the `@media (max-width: 1023px)` blocks in `apps/web/src/styles/base.css` · **Classes:** `.side-nav`
**Mockups:** the phone width of any mockup (all four share the frame)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

On screens narrower than 1024px the [side nav](side-nav.md) is fixed to the bottom of the screen as a row of tabs (icon above label). There is no separate component and no separate item list: the same role items, in the same order, scroll sideways when they do not fit.

## Styling (≤1023px)

| Part | Value |
|---|---|
| Bar | `position: fixed; bottom: 0; left: 0; right: 0; z-index: 10`, `--colors-surface`, 1px `--colors-border` top, shadow `0 -2px 8px rgb(13 31 28 / 8%)`, no padding |
| List | one flex row, `overflow-x: auto`, scrollbar hidden; each item `flex: 1 0 auto` |
| Tab | column (icon above label), min-width 4.5rem, min-height `--spacing-target-min` + `--spacing-3` (60px), padding `--spacing-2` `--spacing-2` `--spacing-1`, meta-size text, centred, no wrap, square corners, 3px transparent top border |
| Current tab | `--colors-primary-tint` background, `--colors-primary` text and icon, primary top border |

The main area gets extra bottom padding (`--spacing-target-min` + `--spacing-6`) so the fixed bar never covers the last control.

## Accessibility

Same as [side-nav](side-nav.md): `<nav aria-label="Main">`, `aria-current="page"`, visible text labels, 48px+ targets. The bar scrolls with touch, trackpad or Tab key focus.

## Used on

Every signed-in route at phone and tablet widths (320px and up).

## Related

[side-nav](side-nav.md), [app-bar](app-bar.md).
