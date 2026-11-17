# Risk and Sequencing Rationale — Mojud core slice

Updated 2026-11-16. Why the Bolts in `bolt-plan.md` ran in this order (a Bolt is one build pass that ends in running, tested code). Inputs: `simplified-plan.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `requirements.md`, `stories.md`, `components.md`, `contract-summary.md` and the team practices (`team-practices.md`).

## Heuristic

**Walking skeleton first, then the riskiest rules, then small vertical slices.** The skeleton proved the parts connect. The stock rules came next because every later feature writes movements. After that, each round delivered backend and screens together so every Bolt ended with something usable in the browser. No formal scoring model was used; the unit dependencies fixed most of the order.

## Order and Why

| Position | Bolt | Reason |
|---|---|---|
| 1 | B1 Walking skeleton | Team practice; proves Docker Compose, sessions, CSRF and migrations on the builder's machine before any feature |
| 2 | B2 Stock core | The never-negative and never-edited rules are the product's core promise (intent S4); every later Bolt writes movements through this path |
| 3 | B3 Value, count, staff | Value is needed by losses, the report and approvals; counts and staff complete day-to-day use by more than one person |
| 4 | B4 Phone layout, passwords, history filters | Workers use phones; filtered history is the base for tracing losses and asking for reversals |
| 5 | B5 Import, export, report | Quick setup from Excel and the month-end report; builds on value from B3 |
| 6 | B6 UI refresh and accountability | Needs everything before it: the history to reverse from, value for losses, all pages to restyle |

## Change of Plan After B1

The first plan split the work into one large backend unit and one large frontend unit. After B1 the builder replaced it with small vertical slices (`simplified-plan.md`), because the large units would have shown nothing in the browser for a long time and were too big to finish quickly. Each later round was chosen after the previous one was running.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Bolt | Outcome |
|---|---|---|---|---|---|
| Docker does not run on the build machine | Medium | High | Checked first in B1; allowed fallback is PostgreSQL alone in Docker or installed locally, with `npm run dev` | B1 | Compose stack runs; `npm run verify` uses it |
| Stock rules subtly wrong (negative stock, lost updates, edited history) | Medium | High | Single write path with conditional update; database check and trigger; concurrency tests against real PostgreSQL | B2 | Tests pass, including two simultaneous requests for the last unit |
| Two people decide the same approval at once, or someone approves their own | Medium | High | Row lock on decision; database check `decided_by <> requested_by`; partial unique index for reversals | B6 | Tests pass |
| Money rounding errors in sums | Medium | Medium | Integer poisha everywhere; unit cost kept per movement | B3 | Tests pass |
| Excel files that do not parse as expected | Medium | Medium | Loose header matching, comma or semicolon, Excel number formats, BOM; row-numbered problems; all-or-nothing save | B5 | Tests cover each format |
| Phone layout breaks pages | Medium | Medium | Smoke test checks 360 px and 320 px without sideways scroll | B4 | Checked on every verify run |
| New colours fail contrast in one theme | Medium | Medium | Contrast test for every text pair in light and dark; axe checks | B6 | Tests pass |
| Learning curve on the stack slows progress | High | Medium | Small rounds, each ending with a running result | All | Six Bolts completed |

## Assumptions & Open Questions

None.
