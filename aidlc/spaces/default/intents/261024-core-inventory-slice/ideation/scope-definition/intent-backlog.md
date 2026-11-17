# Intent Backlog — Mojud core slice

Updated 2026-11-16 to match the built app.

Proto-units of work, prioritized with MoSCoW and sequenced dependency-first (Q4). The scope boundary comes from the scope document, which builds on the intent statement ("intent-statement"), the feasibility assessment ("feasibility-assessment") and the constraint register ("constraint-register"). Every item below is built.

## Prioritized Backlog

| Order | ID | Proto-unit | What it delivers | MoSCoW | Depends on | Success outcome |
|---|---|---|---|---|---|---|
| 1 | IB-1 | Business and sign-in | Owner sign-up that creates the business; sign in and sign out for everyone; six roles | Must | — | S1 |
| 2 | IB-2 | Products | Create, edit, list and search products with SKU, unit, minimum stock and unit cost | Must | IB-1 | S1 |
| 3 | IB-3 | Stock record core | Stock in and out with a reason, permanent stock movements and the never-negative rule, with automated tests | Must | IB-2 | S2, S4 |
| 4 | IB-4 | Dashboard and history | Stock totals, low and out-of-stock products, recent movements, and a filterable movement history | Must | IB-3 | S5 |
| 5 | IB-5 | Stock value and counts | Unit cost and stock value in taka; stock counts that save the difference | Must | IB-3 | S5 |
| 6 | IB-6 | Staff and passwords | Owner adds, deactivates and reactivates staff and resets their passwords; everyone changes their own password | Must | IB-1 | S1 |
| 7 | IB-7 | Excel import, downloads and report | Product import with opening stock (all rows or none), CSV downloads, monthly stock report | Must | IB-3, IB-5 | S1, S5 |
| 8 | IB-8 | Accountability | Damage flags, reversals, the approvals list (never deciding your own), losses split three ways on the dashboard, My record | Must | IB-3, IB-6 | S3, S5 |
| 9 | IB-9 | Phone layout and look | Every screen works on a phone; light and dark themes | Must | all | S2 |
| 10 | IB-10 | Local run | The whole app starts on the builder's machine with one command | Must | all | S6 |

IB-3 and IB-10 run through every other item: the stock rules are tested as each feature adds movements, and each item is checked running locally.

## Sequencing Rationale

Dependency-first (Q4): each item needs the records the one before it creates. Stock cannot be recorded until there are products; losses cannot be valued until products have a unit cost; approvals need staff with different roles. With no deadline (feasibility Q4) and a beginner builder (feasibility Q3), each piece is built on working foundations, in small slices that each deliver a screen together with its rules.

## Assumptions & Open Questions

None.
