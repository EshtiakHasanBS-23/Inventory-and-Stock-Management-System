# Frontend Components — walking-skeleton

The web app as built (`apps/web/src`): React 18, React Router 6, TanStack Query and i18next, with our own components styled by design tokens as CSS variables (`styles/tokens.css`, `styles/base.css`). The walking skeleton built the shell, Sign up and Sign in; the stock pages were added on the same shell. Requirements: FR-1, FR-2, NFR-4, NFR-5, NFR-9 here, and the page-level FRs listed under Routes.

## Component Hierarchy

```
main.tsx
+-- theme-init.js            (public/; applies the saved theme before first paint; BR5.1)
+-- App
    +-- I18nextProvider      (English translation file i18n/en.json; BR5.2)
    +-- QueryClientProvider  (TanStack Query; server data and mutations in api/stock.ts)
    +-- SessionProvider      (calls /auth/me; holds the caller and CSRF token; handles 401s)
    +-- BrowserRouter
        +-- PublicLayout     (skip link; Sign up, Sign in; signed-in people go to the Dashboard)
        |   +-- SignUpPage
        |   +-- SignInPage
        +-- SignedInLayout   (requires a caller; otherwise Sign in, remembering the page)
            +-- SkipLink
            +-- AppBar       (app name, business, name and role, "Online" label, ThemeSwitch, Sign out)
            +-- SideNav      (menu with icons; a bottom tab bar below 1024 px)
            +-- RoleRoute    (opens a page only for its roles; others go to the Dashboard)
                +-- DashboardPage, ProductsPage, ImportPage, StockPage, CountPage,
                    DamagePage, HistoryPage (MovementTable), ApprovalsPage, ReportPage,
                    RecordPage, StaffPage, AccountPage
```

Shared building blocks: `InputField`, `PasswordField` (Show/Hide), `SelectField`, `ButtonPrimary`, `ButtonSecondary`, `FormErrorSummary`, `RefusalMessage`, `DownloadLink`, `ThemeSwitch`, `SkipLink`, `Icons`, `StockBadge` (OK / Low / Out pill with icon and text).

Pages are loaded on demand with `React.lazy`, so Sign in loads only the shell and its form.

## Props and State

| Component | Props | State |
|---|---|---|
| SessionProvider | children, fetchFn | session (caller and CSRF token, or none), loading, endReason |
| SignUpPage | — | fields {businessName, name, phone, password}, fieldErrors, formError, saving |
| SignInPage | — | fields {phone, password}, formError, saving |
| AppBar | — | reads the caller from SessionProvider |
| SideNav | role | — |
| ThemeSwitch | — | choice: light, dark or device |
| InputField | id, label, hint, value, error, onChange, type | — |
| ButtonPrimary | label, busy, disabledReason, onClick | — |

## Interaction Flows

- **Sign up:** fields validated when leaving a field (required, phone 6–15 digits, password at least 8). Submit disables the button and shows a spinner; a server field error appears under that field; other errors appear in `FormErrorSummary`, which takes focus. Typed values are always kept. Success goes to the Dashboard.
- **Sign in:** on 401 INVALID_CREDENTIALS or ACCOUNT_DEACTIVATED the summary shows the server message and takes focus. Success goes to the page first asked for, if any, otherwise the Dashboard.
- **Sign out:** sends the CSRF token, then shows Sign in.
- **401 handling:** responses from `/auth/signin` and `/auth/signup` are always shown on their own form. The first `/auth/me` call shows Sign in with no message on any 401. Any other call: SESSION_ENDED returns the person to Sign in with "Your session ended. Sign in again."; NOT_SIGNED_IN returns them to Sign in with no message. The current page is remembered and reopened after signing in.
- **Theme:** ThemeSwitch saves light or dark in browser storage; "Device" removes the saved choice and follows the device setting.
- **Saved changes:** a green toast confirms each save (for example the new balance after Stock in / out).

## Routes

| Path | Page | Who may open it | Requirement |
|---|---|---|---|
| `/signup` | Sign up | Not signed in | FR-1 |
| `/signin` | Sign in | Not signed in | FR-2 |
| `/` | Redirects to `/dashboard` | Signed in | FR-2 |
| `/dashboard` | Dashboard | Everyone | FR-18 |
| `/products` | Products | Everyone (create and edit controls for Owner and Manager) | FR-6, FR-7 |
| `/products/import` | Import products | Owner, Manager | FR-8 |
| `/stock` | Stock in / out | Everyone | FR-9 |
| `/count` | Stock count | Everyone | FR-12 |
| `/damage` | Flag damage | Everyone | FR-13 |
| `/history` | History | Everyone (Reverse… for Owner and Manager) | FR-19, FR-15 |
| `/approvals` | Approvals | Everyone (decide buttons only when allowed) | FR-16 |
| `/reports` | Report | Everyone | FR-20, FR-21 |
| `/record` | My record | Everyone (person picker for Owner and Manager) | FR-22 |
| `/staff` | Staff | Owner | FR-3, FR-5 |
| `/account` | My password | Everyone | FR-5 |

Any other path redirects to `/`. A signed-in person who opens a page their role may not open goes to the Dashboard.

## Side Navigation

Order for every role: Dashboard, Products, Stock in / out, Stock count, History, Approvals, Report, My record, then Staff (Owner only), then My password. Flag damage is reached from Stock in / out and from each product row. The current item has `aria-current="page"`.

## Form Validation (Sign up)

| Field | Rule | Message |
|---|---|---|
| Business name | Required, at most 100 characters | "Enter your business name." |
| Your name | Required, at most 100 characters | "Enter your name." |
| Phone number | 6–15 digits after removing spaces and dashes | "Enter a phone number of 6 to 15 digits." |
| Password | At least 8 characters, at most 128, counted as typed (never trimmed) | "At least 8 characters." |

The server checks the same rules (BR1.1–BR1.4) with the same shared schemas from `@mojud/contracts`; the client check only gives faster feedback.

## API Integration

One API client (`api/client.ts`) sends the session cookie on every call, adds `X-CSRF-Token` to every non-GET call, and turns the shared error shape into field or form messages. Stock and staff calls are TanStack Query hooks in `api/stock.ts`. Types come from `@mojud/contracts`.

| Call | When |
|---|---|
| `GET /api/v1/auth/me` | App load |
| `POST /api/v1/auth/signup`, `/auth/signin`, `/auth/signout` | Sign up, sign in, sign out |
| `POST /api/v1/auth/password` | My password |
| `GET/POST /api/v1/users`, `PATCH /users/:id`, `POST /users/:id/password`, `GET /users/names` | Staff page; people pickers |
| Stock endpoints | See `construction/backend/functional-design/functional-spec.md` |

## Accessibility

Every page has one `h1`, `header`/`nav`/`main` landmarks and a skip link; labels sit above fields; errors are linked with `aria-describedby`; focus is visible in both themes; status is never shown by colour alone; tables become cards on phones; motion is off when reduced motion is requested. Component tests run axe in light and dark themes and check every text colour pair for at least 4.5:1 contrast.

## Assumptions & Open Questions

None.
