# Skip Link

**Code:** `apps/web/src/components/SkipLink.tsx` · **Class:** `.skip-link`
**Mockups:** all four (first element in `<body>`)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

"Skip to content": the first focusable element on every page, public and signed in. Hidden above the screen until it gets keyboard focus.

## Behaviour

- Positioned at `top: -10rem`; on `:focus` it moves to `top: --spacing-2`.
- Activating it prevents the default jump and calls `focus()` on `#main` (the `<main>` element, `tabIndex={-1}`, its own outline suppressed), so the next Tab lands inside the page content.

## Styling

Absolute, `left: --spacing-4`, `z-index: 10`, inline-flex, min-height `--spacing-target-min`, padding 0 `--spacing-4`, `--colors-primary` body-strong text on `--colors-surface`, `--rounded-md`, plus the global [focus ring](focus-ring.md).

## Accessibility

A real `<a href="#main">`, so it works with JavaScript off. Test id `skip-link`.

## Content

"Skip to content" (`app.skipLink`).

## Used on

Every route.
