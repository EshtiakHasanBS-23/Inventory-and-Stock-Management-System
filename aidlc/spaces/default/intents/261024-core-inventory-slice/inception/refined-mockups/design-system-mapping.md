# Design System Mapping — Mojud core slice

Updated 2026-11-16 to describe what was built. How the screens in `mockups.md` use the design system in `design-process/D-Design-System/` (`00-design-system.md`, `design-tokens.md`, `components/`). Components are our own React components with tokens as CSS variables; no outside UI library is used.

## Tokens

- Every token is a CSS custom property in `apps/web/src/styles/tokens.css`, named after its path: for example `--colors-primary`, `--colors-surface`, `--spacing-target-min`, `--typography-body-size`.
- Light values sit on `:root`. Dark values apply under `[data-theme="dark"]`, and under `@media (prefers-color-scheme: dark)` when the theme is Device.
- Round 5 added tint tokens for pills and highlights (`--colors-page`, `--colors-primary-tint`, `--colors-success-tint`, `--colors-warning-tint`, `--colors-on-warning-tint`, `--colors-danger-tint`, `--colors-info-tint`) and elevation tokens (`--shadow-card`, `--shadow-raised`, `--shadow-float`), each with a dark value. Every text and background pair is tested at 4.5:1 in both themes.
- Typography uses the system font stack; money is formatted with lakh grouping in `format.ts`.

## Components as built

| Design-system component | Built as | Used on |
|---|---|---|
| `app-bar` | `components/AppBar.tsx` | Every signed-in page |
| `side-nav` | `components/SideNav.tsx` (side menu on desktop) | Every signed-in page |
| `bottom-tab-bar` | Same `SideNav`, restyled below 1024 px as a sideways-scrolling tab bar with icons | Every signed-in page on phones |
| `focus-ring` | Global `:focus-visible` style in `base.css` | All |
| `button-primary` | `ButtonPrimary` in `components/Buttons.tsx` (busy state "Saving…") | Every form |
| `button-secondary` | `ButtonSecondary` | Sign out, Cancel, Load more, Approve/Reject, tabs, row actions |
| `input-field` | `InputField`, `PasswordField` (Show/Hide) | Every form |
| `combobox` | `SelectField` (native `select`) | Product, reason, role, person, filters |
| `choice-chip` | Radio tiles (`fieldset.choice-tiles`) for Stock in / Stock out | Stock in / out |
| `form-error-summary` | `FormErrorSummary` | Every form |
| `refusal-message` | `RefusalMessage` and inline `.refusal` text | Every form and list |
| `confirmation-toast` | `.success` toast with a check mark (`role="status"`) | Every save |
| `stock-state-pill` | `StockBadge` (OK / Low / Out with icon and text) | Products, Dashboard |
| `owner-metric-tile` | Dashboard tiles (`.tile`, `.tile--hero`) with count-up figures | Dashboard |
| `loss-row` | Linked loss rows in the losses tile | Dashboard |
| `data-table` | `.data-table` (`MovementTable`, product, staff, report and import tables), stacked as cards on phones | Products, History, Dashboard, Report, Staff, Import |
| `issue-card` | Approval cards (`ApprovalCard`) | Approvals |
| `issue-decision-button` | "Approve: write off" / "Reject: back to stock" and "Approve" / "Reject" | Approvals |
| `file-upload` | Native file input "CSV file" | Import |
| `count-badge` | Count line ("N products", "N people") | Products, Staff |
| — (own) | `ThemeSwitch` (Light, Dark, Device) | App bar |
| — (own) | `SkipLink` "Skip to content" | Every page |
| — (own) | `DownloadLink` for CSV files | Products, History, Report |
| — (own) | `Icon` set (inline SVG) | Navigation, tiles, pills, buttons |

Design-system components that the built screens do not use are not listed.

## Responsive rules

| Width | Layout |
|---|---|
| 1200 px and up | Full desktop grid |
| 1024–1199 px | Narrower grids |
| Below 1024 px | Bottom tab bar; app bar without business name and status; full-width forms; tables as cards |
| Below 600 px and below 360 px | Single column; tighter gutters; still no sideways page scroll at 320 px |

## Assumptions & Open Questions

None.
