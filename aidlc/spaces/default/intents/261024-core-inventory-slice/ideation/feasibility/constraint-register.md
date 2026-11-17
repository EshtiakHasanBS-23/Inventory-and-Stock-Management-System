# Constraint Register — Mojud core slice

Updated 2026-11-16 to match the built app.

Constraints that bound this work, drawn from the intent statement ("intent-statement") and `feasibility-questions.md`.

## Technical Constraints

| ID | Constraint | Fixed or flexible | Source |
|---|---|---|---|
| C-T1 | The app is built with TypeScript, a React frontend, a Node backend and a PostgreSQL database | Fixed (your choice) | Initial request |
| C-T2 | It runs only on the builder's machine, started with Docker Compose; no cloud deployment | Fixed | Initial request |
| C-T3 | The build machine runs Windows 10 Home, so Docker Desktop needs WSL 2 | Fixed (environment) | Q5 |
| C-T4 | No connections to other systems; the app has its own database | Fixed | Q1 |
| C-T5 | One stock location per business | Fixed | Scope document |

## Organizational Constraints

| ID | Constraint | Source |
|---|---|---|
| C-O1 | One person builds, decides scope and approves the work | Intent capture Q5, Q6 |
| C-O2 | The builder is a beginner across most of the stack, so the design must stay simple and be explained | Q3 |
| C-O3 | No deadline and no budget limit | Q4 |

## Regulatory Constraints

| ID | Constraint | Source |
|---|---|---|
| C-R1 | None, because only demo and test data is used. Using real distributor data would bring data-protection duties. | Q2 |

## Assumptions & Open Questions

None.
