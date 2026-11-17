# RAID Log — Mojud core slice

Updated 2026-11-16 to match the built app.

Risks, Assumptions, Issues and Dependencies for this work, based on the intent statement ("intent-statement") and the feasibility assessment.

## Risks

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | The local run setup will not install or run on Windows 10 Home | Medium | High | Install and test before building; fallback is a simpler local setup for the database | Builder |
| R2 | Beginner builder slowed by unfamiliar tools | Medium | Medium | Simple design with few moving parts; small, testable slices; choices explained | Builder |
| R3 | Stock rules (never negative, permanent movements, nobody decides their own request) built wrongly | Low to medium | High | Automated tests for these rules from the start (success outcomes S3, S4) | Builder |
| R4 | Scope grows beyond what one builder can finish | Medium | Medium | Small slices, each finished and checked before the next | Builder |

## Assumptions

| ID | Assumption | Status |
|---|---|---|
| A1 | Only demo and test data is used (Q2) | Confirmed |
| A2 | One stock location per business is enough for the target customer | Confirmed |

## Issues

| ID | Issue | Impact | Action | Owner |
|---|---|---|---|---|
| I1 | The local run setup was not installed on the build machine (Q5) | Blocked running the app locally | Installed and confirmed; the app now starts locally with one command | Builder (closed) |

## Dependencies

| ID | Dependency | Needed by | Status |
|---|---|---|---|
| D1 | Working local run setup on the build machine | Building and running the app | In place (I1 closed) |
| D2 | Approved PRD and UX design documents as the source of requirements | Requirements and design stages | In place |

## Assumptions & Open Questions

None.
