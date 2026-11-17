# App Bar

**Code:** `apps/web/src/components/AppBar.tsx` · **Classes:** `.app-bar`, `.app-bar__brand`, `.app-bar__logo`, `.app-bar__business`, `.app-bar__avatar`, `.app-bar__user`, `.app-bar__meta`, `.app-bar__status`
**Mockups:** all four ([key-dashboard.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html), [key-stock-movement.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html), [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html), [key-products.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html))
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The sticky bar at the top of every signed-in page (rendered by `SignedInLayout` in `apps/web/src/layouts/Layouts.tsx`). It shows who is signed in to which business and holds the theme switch and Sign out. Public pages (Sign up, Sign in) have no app bar.

## Anatomy (left to right)

1. **Brand:** a 2.25rem teal logo square (`.app-bar__logo`, `logo` icon, `on-primary` on `primary`, `rounded.md`) and the app name "Mojud" in `primary`, title size.
2. **Business name** (`.app-bar__business`), from the session.
3. **Avatar** (`.app-bar__avatar`): the first letter of the person's name, `primary` on `primary-tint`, `rounded.full`, `aria-hidden`. It pushes the rest to the right (`margin-left: auto`).
4. **Name and role** (`.app-bar__user`): name, then the role in `text-muted` meta size (`.app-bar__meta`), e.g. "Owner", "Supervisor".
5. **Status** (`.app-bar__status`): a cloud-with-check icon in `success` plus the text "Online". It is a fixed label: the app has no other connection state.
6. **[Theme switch](theme-switch.md).**
7. **Sign out:** a [button-secondary](button-secondary.md) (`app-bar-sign-out-button`, `white-space: nowrap`).

If sign-out fails, a [refusal-message](refusal-message.md) with `role="alert"` shows "Couldn't save. Try again." inside the bar.

## Styling

| Property | Value |
|---|---|
| Position | `position: sticky; top: 0; z-index: 5` |
| Height | min `--spacing-app-bar-height` (3.5rem) |
| Padding | `--spacing-2` × `--spacing-gutter-desktop` |
| Gap | `--spacing-4` |
| Background / edge | `--colors-surface`, 1px `--colors-border` bottom, `--shadow-card` |
| Brand | `--typography-title-size` / `--typography-title-weight`, `--colors-primary` |

## Responsive

| Width | Change |
|---|---|
| ≤1023px | padding uses `--spacing-gutter-phone`; gap `--spacing-2`; business name and Online status are hidden; logo and avatar shrink to 2rem; name/role truncate with an ellipsis; the "Theme" label becomes visually hidden (the select keeps its name); the bar no longer wraps |
| ≤599px | brand text drops to body size; name and role are hidden (the avatar stands in); theme select max 6.5rem |
| ≤359px | the theme switch is hidden |

## Accessibility

- `<header>` landmark; the [skip link](skip-link.md) comes before it.
- Avatar is `aria-hidden`; the name is real text.
- Status is icon plus text, never colour alone.
- Test ids: `app-bar-user-name`, `app-bar-user-role`, `app-bar-sign-out-button`.

## Content

"Mojud", business name, person name, role label (`roles.*`: Owner, Manager, Supervisor, Warehouse worker, Sales rep, Accountant), "Online", "Theme", "Sign out".

## Used on

Every signed-in route: /dashboard, /products, /products/import, /stock, /count, /damage, /history, /approvals, /reports, /record, /staff, /account (pages 01.2–01.4, 02.2, 03.1, 03.2, 04.1, 05.1, 05.2, 06.1, 07.1, 08.1, 08.2).

## Related

[side-nav](side-nav.md), [bottom-tab-bar](bottom-tab-bar.md), [theme-switch](theme-switch.md), [button-secondary](button-secondary.md).
