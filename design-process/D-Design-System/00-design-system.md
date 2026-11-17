# Mojud Design System

**Project:** Mojud, a stock-control web app for small FMCG distributors (desktop and phone, English, light and dark)
**Last updated:** 2026-11-16 (rewritten to match the built app)
**Components:** 33 specs in [components/](components/) · **Tokens:** [design-tokens.md](design-tokens.md) · **Live view:** [catalog.html](catalog.html)

---

## Purpose

One place to look up the tokens and components the app actually uses, by name. Every spec here describes code that exists in `apps/web`; nothing is planned or proposed.

## Source of truth

| What | Where |
|---|---|
| Token values | [`apps/web/src/styles/tokens.css`](../../apps/web/src/styles/tokens.css) |
| Component styles | [`apps/web/src/styles/base.css`](../../apps/web/src/styles/base.css) (plain CSS, BEM-style class names, no component library) |
| Shared components | `apps/web/src/components/` (AppBar, Buttons, DownloadLink, FormErrorSummary, Icons, InputField, PasswordField, RefusalMessage, SelectField, SideNav, SkipLink, ThemeSwitch) |
| Page-level components | `apps/web/src/pages/stock/` (StockBadge, MovementTable, ApprovalCard and the page files) |
| Navigation | `apps/web/src/session/roles.ts` |
| Copy | `apps/web/src/i18n/en.json` |
| Visual reference | four mockups that mirror the built screens, in [`_bmad-output/…/mockups/`](../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/): [key-dashboard.html](../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-dashboard.html), [key-stock-movement.html](../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-stock-movement.html), [key-approvals.html](../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html), [key-products.html](../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-products.html) |

If this folder and the code disagree, the code is right; update this folder.

## Look

"Calm professional": a tinted page (`surface-alt`) with white cards, a teal primary, rounded pills with an icon and a word for every state, big tabular figures for money and counts, and gentle motion that switches off under reduced motion. Dark mode swaps every colour token and drops card shadows.

## Baseline rules (apply to every component)

- Every control is at least 48px high (`--spacing-target-min`); the row chips are 36px on desktop and 48px on phones.
- State is never shown by colour alone: pills, tiles and toasts always pair colour with an icon and words.
- Visible [focus ring](components/focus-ring.md) on `:focus-visible`; a [skip link](components/skip-link.md) on every page.
- Text pairs reach 4.5:1 in both themes ([contrast table](design-tokens.md#contrast-computed-from-tokenscss)); control outlines reach 3:1.
- Works from 320px wide; tables scroll or stack instead of widening the page.
- Icons are inline SVG with `aria-hidden`; the text beside them carries the meaning.
- Money is taka with lakh grouping (৳12,45,000); digits are Western; quantities show their unit.

---

## Pages

| ID | Page | Route | Scenario |
|---|---|---|---|
| 01.1 | Sign up | /signup | S01 |
| 01.2 | Import from Excel | /products/import | S01 |
| 01.3 | Products | /products | S01 |
| 01.4 | Staff | /staff | S01 |
| 02.1 | Sign in | /signin | S02 |
| 02.2 | Stock in / out | /stock | S02 |
| 03.1 | Flag damage | /damage | S03 |
| 03.2 | Approvals | /approvals | S03 |
| 04.1 | Stock count | /count | S04 |
| 05.1 | Dashboard | /dashboard | S05 |
| 05.2 | History | /history | S05 |
| 06.1 | My record | /record | S06 |
| 07.1 | Report | /reports | S07 |
| 08.1 | Staff (reset password) | /staff | S08 |
| 08.2 | My password | /account | S08 |

Scenarios: [C-UX-Scenarios/00-ux-scenarios.md](../C-UX-Scenarios/00-ux-scenarios.md).

---

## Components

### Frame and navigation

| Component | File | Code | Mockup |
|---|---|---|---|
| App bar | [app-bar.md](components/app-bar.md) | `AppBar.tsx` | all four |
| Side nav (≥1024px) | [side-nav.md](components/side-nav.md) | `SideNav.tsx` | all four |
| Bottom tab bar (<1024px) | [bottom-tab-bar.md](components/bottom-tab-bar.md) | `SideNav.tsx` + media query | all four (phone width) |
| Skip link | [skip-link.md](components/skip-link.md) | `SkipLink.tsx` | all four |
| Theme switch | [theme-switch.md](components/theme-switch.md) | `ThemeSwitch.tsx` | stock-movement, approvals |
| Focus ring | [focus-ring.md](components/focus-ring.md) | `:focus-visible` | all four |
| Icon | [icon.md](components/icon.md) | `Icons.tsx` | all four |

### Actions

| Component | File | Code | Mockup |
|---|---|---|---|
| Button primary | [button-primary.md](components/button-primary.md) | `ButtonPrimary` | stock-movement |
| Button secondary (and download link) | [button-secondary.md](components/button-secondary.md) | `ButtonSecondary`, `DownloadLink` | products, approvals, stock-movement |
| Button danger | [button-danger.md](components/button-danger.md) | Flag damage submit | — |
| Button approve | [button-approve.md](components/button-approve.md) | `ApprovalCard` | approvals |
| Chip button | [chip-button.md](components/chip-button.md) | Products and Staff row actions | products |
| Link button | [link-button.md](components/link-button.md) | Reverse…, Clear filters | — |
| Tabs | [tabs.md](components/tabs.md) | Approvals Waiting / Decided | approvals |

### Forms

| Component | File | Code | Mockup |
|---|---|---|---|
| Input field (and password field) | [input-field.md](components/input-field.md) | `InputField`, `PasswordField` | stock-movement, products |
| Select field | [select-field.md](components/select-field.md) | `SelectField` | stock-movement |
| Choice tiles | [choice-tiles.md](components/choice-tiles.md) | Stock in / Stock out | stock-movement |
| File upload (Import) | [file-upload.md](components/file-upload.md) | `ImportPage.tsx` | — |

### Feedback

| Component | File | Code | Mockup |
|---|---|---|---|
| Form error summary | [form-error-summary.md](components/form-error-summary.md) | `FormErrorSummary` | — |
| Refusal message | [refusal-message.md](components/refusal-message.md) | `RefusalMessage`, `.refusal` | stock-movement |
| Confirmation toast | [confirmation-toast.md](components/confirmation-toast.md) | `.success` | stock-movement, approvals |
| Pending banner | [pending-banner.md](components/pending-banner.md) | Dashboard `.banner` | dashboard |
| Empty state | [empty-state.md](components/empty-state.md) | `.empty-state` | — |

### Content

| Component | File | Code | Mockup |
|---|---|---|---|
| Stock state pill | [stock-state-pill.md](components/stock-state-pill.md) | `StockBadge`, `.badge` | products, dashboard |
| Change pill | [change-pill.md](components/change-pill.md) | `Change` in `MovementTable` | dashboard, approvals |
| Role pill and person | [role-pill.md](components/role-pill.md) | Staff table | — |
| Count badge | [count-badge.md](components/count-badge.md) | `.list-toolbar__count` | products |
| Metric tile (count-up) | [owner-metric-tile.md](components/owner-metric-tile.md) | Dashboard `.tile`, Report `.stat` | dashboard |
| Loss row | [loss-row.md](components/loss-row.md) | Dashboard losses tile | dashboard |
| Restock list | [restock-list.md](components/restock-list.md) | Dashboard Needs restocking | dashboard |
| Approval card | [approval-card.md](components/approval-card.md) | `ApprovalCard` | approvals |
| Data table (and movement list) | [data-table.md](components/data-table.md) | `MovementTable`, page tables | products, dashboard |
| Record card | [record-card.md](components/record-card.md) | My record | — |

---

## Patterns

Layout classes in base.css that are shared but too simple for their own spec.

| Pattern | Classes | What it does |
|---|---|---|
| Signed-in frame | `.app-frame`, `.app-main` | flex row: side nav + main (max `--layout-content-max`, padding `--spacing-5` × desktop gutter). Below 1024px: block, phone gutters, extra bottom padding for the tab bar |
| Public frame | `.public-page`, `.auth-card`, `.auth-card__switch` | Sign up / Sign in: a 30rem card (`--rounded-lg`, `--shadow-raised`, padding `--spacing-6`) centred on `surface-alt`, with "New business? Create one" / "Already have an account? Sign in" below |
| Page header | `.page-header`, `.page-header__sub`, `.page-header--split` | `h1` and a muted subtitle; `--split` puts `.page-actions` (buttons) on the right (Products) |
| Panel (form card) | `.panel`, `.panel--wide` | a form on a card: grid, gap `--spacing-4`, max 720px (wide: no max), padding `--spacing-5` (`--spacing-4` on phones), `--rounded-lg`, `--shadow-card` |
| Card | `.card` | content card with an `h2` (dashboard columns, My record) |
| Form grid | `.form-grid`, `--3`, `--4`, `.field--wide` | auto-fit columns (min 200px); fixed 3 or 4 columns for Products and Staff forms (4→2 at ≤1199px, 3→2 at ≤1023px, 1 at ≤699px) |
| Form actions | `.form-actions` | primary + Cancel in a row; stacked full width ≤1023px |
| Filter grid | `.filter-grid` | History and Report filters, auto-fit min 180px |
| Dashboard columns | `.dash-columns` | Needs restocking and Recent movements side by side (1 : 1.4); stacked ≤1199px |
| Flag hint | `.flag-hint` | "Found damaged stock? Flag damage" link under the Stock in / out title |
| Loading | `.loading`, `.skeleton-grid`, `.skeleton` | "Loading…" text; dashboard shimmer blocks |
| Muted text | `.muted` | meta size, `--colors-text-muted` |
| Visually hidden | `.visually-hidden` | screen-reader-only text (busy "Saving…", Actions header, loading) |

---

## Change log

- 2026-11-16: Rewritten to match the built app. Specs for components the app does not have were deleted; specs for built components were rewritten from the code; new specs added for skip link, theme switch, icon, select field, choice tiles, chip button, link button, tabs, button approve, approval card, change pill, role pill, pending banner, restock list, empty state and record card. Tokens now copied from `tokens.css`.
