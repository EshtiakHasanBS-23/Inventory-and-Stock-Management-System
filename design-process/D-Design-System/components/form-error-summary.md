# Form Error Summary

**Code:** `FormErrorSummary` in `apps/web/src/components/FormErrorSummary.tsx` · **Classes:** `.error-summary`, `.error-summary__title`
**Mockups:** none of the four shows a failed submit
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

A box at the top of a form after a failed submit. It takes focus so a screen reader reads it once per submit, and each link moves focus to its field.

## Props

| Prop | Notes |
|---|---|
| `id`, `testId` | the title gets `<id>-title`; links get `<testId>-link-<fieldId>` |
| `formMessage?` | a form-level message (server or save error), shown first as the title |
| `errors?: {fieldId, message}[]` | listed only when there are **two or more** |
| `focusKey` | a number that changes on every submit, so focus moves to the box each time |

Renders nothing when there is no form message and fewer than two field errors (a single field error shows only under its field).

## Anatomy

```html
<div class="error-summary" tabindex="-1" aria-labelledby="x-title">
  <p class="error-summary__title" id="x-title">Only 3 bag in stock.</p>
  <p>2 fields need fixing:</p>                    <!-- when both exist -->
  <ul><li><a href="#field-id">Message</a></li></ul>
</div>
```

## Styling

Padding `--spacing-3` `--spacing-4`; 4px `--colors-danger` left bar; `--colors-danger` text on `--colors-danger-tint` (5.9:1 light, 7.3:1 dark); `--rounded-md`. Title body-strong. List indented `--spacing-4`; each link inline-flex with min-height `--spacing-target-min`, `--colors-danger`. With motion allowed it slides in (260ms).

The Import page reuses the same classes for its list of row problems (with `role="alert"`, no links).

## Content

"N fields need fixing:" (`errors.summary`), or the server's message, e.g. "Sign-in details are not correct.", "This account is deactivated.", "Only 3 bag in stock.", "Use Flag damage: a supervisor, manager or owner decides it.", "Couldn't save. Try again."

## Used on

/signup (01.1), /signin (02.1), /products (01.3), /staff reset (08.1), /stock (02.2), /damage (03.1), /count (04.1); classes reused on /products/import (01.2).
