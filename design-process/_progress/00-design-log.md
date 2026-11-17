# Design Log — Mojud (E2E_IAM)

The design folders describe the app as built. The code in `apps/web` is the
source of truth; when a design file and the code differ, the code wins and the
file is corrected.

## Current

| Task | Started |
|---|---|
| None — design docs match the built app | 2026-11-16 |

## Decisions

| Date | Phase | Decision |
|---|---|---|
| 2026-10-23 | Setup | WDS outputs go to `design-process/`. |
| 2026-11-16 | All | Design docs rewritten to match the built app (rounds 1–5 in `simplified-plan.md`). Anything not built was removed. |
| 2026-11-16 | 1 | Product brief: "Every loss traced to a person and a reason"; six roles; success criteria the app can measure. |
| 2026-11-16 | 2 | Trigger map: Mr. Haque (Owner) primary, Karim (Warehouse worker) secondary, Nasima (Supervisor) tertiary, Rafiq (Manager) supporting. |
| 2026-11-16 | 3 | 8 scenarios (S01–S08), 15 pages, each page spec written from the real screen. |
| 2026-11-16 | 4 | Cross-cutting decisions in `C-UX-Scenarios/00-design-decisions.md` describe the built behaviour. |
| 2026-11-16 | 7 | Design system: tokens from `apps/web/src/styles/tokens.css`, 33 component specs for components that exist, `catalog.html` built from the real CSS. |

## Design Loop Status

| Page | Status | Date |
|---|---|---|
| 01.1–08.2 (15 pages) | specified from the built app | 2026-11-16 |
| All 15 pages | linked to D-Design-System | 2026-11-16 |

## Completed

- [x] Phase 1: Product Brief → `A-Product-Brief/project-brief.md`
- [x] Phase 2: Trigger Map → `B-Trigger-Map/trigger-map.md`, `personas/`, `feature-impact-analysis.md`
- [x] Phase 3: Scenarios → `C-UX-Scenarios/00-ux-scenarios.md` + 8 scenario folders, 15 pages
- [x] Phase 4: UX Design → 15 page specs + `C-UX-Scenarios/00-design-decisions.md`
- [x] Phase 7: Design System → `D-Design-System/` (00-design-system.md, design-tokens.md, 33 components, catalog.html)
