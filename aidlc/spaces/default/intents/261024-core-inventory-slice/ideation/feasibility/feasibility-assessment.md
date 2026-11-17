# Feasibility Assessment — Mojud core slice

Updated 2026-11-16 to match the built app.

Input: the intent statement (`ideation/intent-capture/intent-statement.md`, "intent-statement") and the answers in `feasibility-questions.md`. No market research was run for this workflow.

## Verdict

**Feasible, and now built.** A single-builder web app that keeps a permanent stock record, refuses negative stock, routes damage and corrections through a second person, and shows losses in taka needs no outside systems, special compliance work or paid services. The one early blocker (the local run setup was not yet installed on the build machine) was cleared, and the app runs locally.

## Technical Viability

| Area | Assessment | Basis |
|---|---|---|
| Integrations | None needed. The app stands alone with its own data, so there are no outside systems to depend on or wait for. | Q1 |
| Compliance | No legal or data-protection work, because only demo and test data is used. This must be revisited before any real distributor data is entered. | Q2 |
| Core rules (stock never negative, permanent stock movements, nobody decides their own request) | Viable. These are well-understood record-keeping rules. They are the part most worth getting right, and they are covered by success outcomes S3 and S4 in the intent statement. | intent-statement S3, S4 |
| Excel import and downloads | Viable. Owners already keep their products in Excel, so a simple template and file download fit how they work today. | intent-statement S1, S5 |
| Phone use | Viable. Workers record on small phones, so every screen must work from a narrow phone width. | Q2 |
| Running locally | Viable once the local run setup is installed on the Windows 10 Home machine. | Q5 |
| Builder experience | The builder is a beginner across most of the chosen tools. This is manageable if the design stays simple, uses few moving parts, and explains its choices. | Q3 |
| Time and money | No deadline and no budget limit, so schedule pressure is not a risk. | Q4 |

## Risk Analysis

| Risk | Likelihood | Impact | Response |
|---|---|---|---|
| The local run setup fails to install or run on Windows 10 Home | Medium | High: the app cannot run as planned | Set up and test it before building starts; keep a simpler fallback for running the database |
| Beginner builder gets stuck on unfamiliar tools | Medium | Medium: slower progress | Keep the design small; explain choices in plain words; build in small, testable slices |
| Stock rules implemented wrongly (stock goes negative, records get changed, or someone approves their own request) | Low to medium | High: breaks the product's core promise | Treat these rules as must-test items with automated tests (S3, S4) |
| Scope grows beyond what one builder can finish | Medium | Medium | Build in small slices, each delivering a working screen with its rules, and keep only what is finished |

## Assumptions & Open Questions

None.
