# User Stories Assessment

Updated 2026-11-16 to match the built app.

## Decision

Execute.

## Rationale

The app is user-facing and serves four named personas (Mr. Haque the Owner, Karim the Warehouse worker, Nasima the Supervisor, Rafiq the Manager), each with different permissions on the same screens. The requirements (`inception/requirements-analysis/requirements.md`, FR-1 to FR-23) carry real business logic: a permanent stock record that never goes negative, a second person for every damage write-off and every reversal, and stock and losses valued in taka. Sixteen stories (US-01 to US-16) tie each requirement to the person it serves, give every behaviour Given/When/Then acceptance criteria, and point to the automated tests that prove it, as the team practices (`team-practices.md`, test-after with 80% coverage) require.

## Factors Considered

| Factor | Finding |
|---|---|
| Project type | New product (greenfield), full-stack |
| User-facing scope | 14 screens: Sign up, Sign in, Dashboard, Products, Import products, Stock in / out, Stock count, Flag damage, History, Approvals, Report, My record, Staff, My password |
| Personas | Mr. Haque (Owner), Karim (Warehouse worker), Nasima (Supervisor), Rafiq (Manager); Sales rep and Accountant roles share the worker's permissions |
| Story set | 16 stories in 5 epics: Set up and access, Products, Record stock, Accountability, Insight; mapped to scenarios S01 to S08 |
| Complexity signals | Never-negative stock under concurrency, append-only movements, approvals decided once and never by the requester, money in poisha, CSV import all-or-nothing |
| Verification | Every story names its API, component and browser smoke tests |
| Cross-team work | None; one builder |

## Where Stories Add the Most Value

- Recording stock and the never-negative rule: exact refusals ("Only N unit in stock.") and the race for the last unit.
- Damage flags and reversals: who may ask, who may decide, and what happens to stock on approve or reject.
- Permissions per role: stories make clear who may do what on each screen.
- Losses and value: the dashboard split, the report columns and the cost kept at the time of each movement.

## Assumptions & Open Questions

None.
