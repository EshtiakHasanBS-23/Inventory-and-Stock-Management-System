# Team Allocation — Mojud core slice

Updated 2026-11-16. A **Bolt** is one build pass that ends in running, tested code (see `bolt-plan.md`). Inputs: `unit-of-work.md`, `unit-of-work-story-map.md`, `bolt-plan.md` and the team practices (`team-practices.md`).

There is one builder, working with an AI developer in the same session. The builder decided scope and approved each plan and result; the AI wrote the code and tests. There is one team, so no program board was needed.

| Bolt | Unit | Built by | Reviewed and approved by |
|---|---|---|---|
| B1 Walking skeleton | U1 | AI developer | Builder |
| B2 Stock core | U2 | AI developer | Builder |
| B3 Value, count, staff | U3 | AI developer | Builder |
| B4 Phone layout, passwords, history filters | U4 | AI developer | Builder |
| B5 Import, export, report | U5 | AI developer | Builder |
| B6 UI refresh and accountability | U6 | AI developer | Builder |

**Staffing:** solo ownership; Bolts ran one after another.

**Builder's part:** chose the simplified plan after B1, approved the verification command and the working skeleton, approved each round's scope, and decided on any failure. The builder pushes `main` to GitHub when they choose.

## Assumptions & Open Questions

None.
