# Button Secondary

**Code:** `ButtonSecondary` in `apps/web/src/components/Buttons.tsx`; the same classes on `DownloadLink` (`apps/web/src/components/DownloadLink.tsx`), the PasswordField Show/Hide toggle and the "Import from Excel" link · **Classes:** `.button.button--secondary`
**Mockups:** [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html) (Import from Excel, Download CSV), [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html) (Reject), [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The quieter action: Cancel, Sign out, Reject, Load more, Show/Hide password, and links styled as buttons (CSV downloads, Import from Excel).

## Forms it takes

| Form | Element | Example |
|---|---|---|
| `ButtonSecondary` | `<button type="button">` with `testId`, `onClick` | Cancel, Sign out, Reject, Load more |
| `DownloadLink` | `<a href download>` (a plain GET; the session cookie is sent) | "Download CSV" on Products, History, Report |
| Router link | `<Link className="button button--secondary">` with an `upload` icon | "Import from Excel" on Products (Owner, Manager) |
| Password toggle | `<button aria-pressed aria-controls aria-label="Show password">` | "Show" / "Hide" in the [input field](input-field.md) addon |

## States

Default `--colors-primary` text on `--colors-surface`, 1px `--colors-control-border`; hover `--colors-primary-tint` background; active `scale(0.98)`; focus [ring](focus-ring.md). No disabled state.

## Styling

Inline-flex, gap `--spacing-2`, min-height `--spacing-target-min` (48px), padding 0 `--spacing-4`, body size, body-strong weight (600), `--rounded-md`. In the app bar: `white-space: nowrap`, padding 0 `--spacing-3` ≤1023px. In an approval card: min-height 48px, padding 0 `--spacing-2`, body size.

## Content

"Cancel", "Sign out", "Reject" / "Reject: back to stock", "Load more" ("Loading…" while fetching), "Show" / "Hide", "Download CSV", "Import from Excel".

## Used on

App bar (all signed-in routes), /products (01.3), /staff reset form (08.1), /approvals (03.2), /history (05.2), /reports (07.1), password fields on /signup, /signin, /staff, /account.

## Related

[button-primary](button-primary.md), [chip-button](chip-button.md), [link-button](link-button.md).
