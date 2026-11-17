# Feature Impact Analysis: Mojud (E2E_IAM)

Updated 2026-11-16 to match the built app.

> Scores the features that were built (FR-1 … FR-23) against the four personas.
> The score says how much each feature carries the trigger map, and so how much
> design care it gets when screens are reviewed or refined.

## Scoring

**Primary persona (Haque, Owner):** High = 5 pts | Medium = 3 pts | Low = 1 pt
**Other personas (Karim, Worker; Nasima, Supervisor; Rafiq, Manager):** High = 3 pts | Medium = 1 pt | Low = 0 pts

**Max possible score:** 14 (4 personas)
**Deep-design threshold:** 9+, or Primary High (5)

## Prioritized Features

| Rank | Feature (FR) | Owner | Worker | Supervisor | Manager | Score | Design depth |
|---|---|---|---|---|---|---|---|
| 1 | Permanent stock ledger (FR-11) | H 5 | H 3 | H 3 | H 3 | 14 | Deep |
| 2 | Flag damage + decide + Approvals inbox (FR-13, FR-14, FR-16) | H 5 | H 3 | H 3 | M 1 | 12 | Deep |
| 3 | Dashboard and loss drill-down (FR-18) | H 5 | M 1 | M 1 | H 3 | 10 | Deep |
| 3 | Stock in / out, never negative (FR-9, FR-10) | M 3 | H 3 | M 1 | H 3 | 10 | Deep |
| 3 | Segregation of duties (FR-23) | H 5 | M 1 | H 3 | M 1 | 10 | Deep |
| 6 | Reversals with second approval (FR-15) | H 5 | L 0 | L 0 | H 3 | 8 | Deep (Primary High) |
| 6 | Stock value (FR-17) | H 5 | L 0 | L 0 | H 3 | 8 | Deep (Primary High) |
| 6 | Import products from Excel (FR-8) | H 5 | L 0 | L 0 | H 3 | 8 | Deep (Primary High) |
| 6 | Stock count (FR-12) | M 3 | M 1 | M 1 | H 3 | 8 | Standard |
| 10 | Movement history with filters (FR-19) | H 5 | M 1 | L 0 | M 1 | 7 | Deep (Primary High) |
| 10 | Product list and search (FR-7) | M 3 | M 1 | L 0 | H 3 | 7 | Standard |
| 10 | My record (FR-22) | M 3 | H 3 | L 0 | M 1 | 7 | **Deep (override)** |
| 13 | Monthly stock report (FR-20) | H 5 | L 0 | L 0 | M 1 | 6 | Deep (Primary High) |
| 13 | Staff and role permissions (FR-3, FR-4) | H 5 | M 1 | L 0 | L 0 | 6 | Deep (Primary High) |
| 13 | Create and edit products (FR-6) | M 3 | L 0 | L 0 | H 3 | 6 | Standard |
| 16 | Create a business (FR-1) | H 5 | L 0 | L 0 | L 0 | 5 | Standard (one-time) |
| 17 | CSV downloads (FR-21) | M 3 | L 0 | L 0 | M 1 | 4 | Standard |
| 17 | Sign in and out (FR-2) | L 1 | M 1 | M 1 | M 1 | 4 | Light (enabler) |
| 19 | Passwords: own change, owner reset (FR-5) | L 1 | M 1 | L 0 | L 0 | 2 | Light (enabler) |

## Decisions

**Deep design** (every state, error message and phone layout checked):
- Ledger, damage flag and approvals, Dashboard, Stock in / out, segregation of
  duties, reversals, stock value, history, report, staff and roles, Excel import
- **Override:** My record (score 7) is below the threshold on points, but it is
  *the* answer to the secondary persona's main fear (being blamed) and carries
  objective 3. It gets deep design.
- Create a business is Primary High but used once per business, so it gets
  standard design.

**Standard design** (main states and errors):
- Stock count, product list and search, create and edit products, CSV downloads,
  create a business

**Light design** (follow the shared form and table patterns):
- Sign in and out, passwords

## Mapping to built screens

| Screen (route) | Feature(s) | Persona |
|---|---|---|
| Dashboard (`/dashboard`) | FR-18, FR-17 | Mr. Haque |
| Stock in / out (`/stock`) | FR-9, FR-10, FR-23 | Karim |
| Flag damage (`/damage`) | FR-13 | Karim |
| Approvals (`/approvals`) | FR-14, FR-15, FR-16 | Nasima, Rafiq |
| History (`/history`) | FR-19, FR-15 (Reverse…), FR-21 | Mr. Haque |
| Stock count (`/count`) | FR-12 | Rafiq |
| Products (`/products`), Import (`/products/import`) | FR-6, FR-7, FR-8, FR-21 | Rafiq, Mr. Haque |
| Report (`/reports`) | FR-20, FR-21 | Mr. Haque |
| My record (`/record`) | FR-22 | Karim |
| Staff (`/staff`), My password (`/account`) | FR-3, FR-4, FR-5 | Mr. Haque |
| Sign up (`/signup`), Sign in (`/signin`) | FR-1, FR-2 | Mr. Haque, Karim |

---

_Generated with Whiteport Design Studio framework_
_Strategic input for UX Scenarios and UX Design_
