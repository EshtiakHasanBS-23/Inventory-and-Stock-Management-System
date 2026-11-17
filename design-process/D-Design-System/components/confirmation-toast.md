# Confirmation Toast (saved message)

**Code:** `<p className="success" role="status">` on pages · **Classes:** `.success`, `.success--warning`
**Mockups:** [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html), [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The green "saved" message after an action succeeds. It sits in the page flow above the form (not floating) and stays until the next action; it does not time out.

## Variants

| Variant | Colours | Used for |
|---|---|---|
| default | `--colors-on-success` on `--colors-success` (6.3:1 light, 9.5:1 dark), check mark | every successful save |
| `--warning` | `--colors-on-warning-tint` on `--colors-warning-tint` (10.7:1 / 9.1:1), check mark | a stock count that found units missing |

## Styling

Flex, gap `--spacing-3`, margin-bottom `--spacing-4`, padding `--spacing-3` `--spacing-4`, body-strong weight, `--rounded-md`, `--shadow-float`. A 1.5rem check mark is drawn by `::before` with a CSS mask in `currentColor`. Links inside inherit the text colour. With motion allowed it slides in (260ms).

## Messages (en.json)

| Page | Message |
|---|---|
| Stock in / out | "Saved. Stock in 10 bag of Rice 25 kg. Now 42 bag in stock." |
| Stock count | "Count matches: 40 bag. Nothing changed." / "Counted 38, record had 40: 2 bag missing (৳3,600). Stock adjusted." (warning) / "… 2 bag extra. Stock adjusted." |
| Flag damage | "Flagged 1 bag of Rice 25 kg (৳1,800). Waiting for a decision." |
| Approvals | "Approved: Rice 25 kg." / "Rejected: Rice 25 kg." |
| History | "Reversal asked for. Another owner or manager must approve it." |
| Import | "Imported 12 products with 480 units of opening stock. See products" |
| Staff | "Karim can now sign in." / "Karim's password is changed. Tell them the new one." |
| My password | "Password changed. Other phones signed in as you are signed out." |

## Accessibility

`role="status"` so screen readers announce it politely. The check mark is decorative; the sentence carries the meaning.

## Used on

/stock (02.2), /count (04.1), /damage (03.1), /approvals (03.2), /history (05.2), /products/import (01.2), /staff (01.4, 08.1), /account (08.2).
