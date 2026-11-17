---
title: "Input reconciliation: Brief + Brief Addendum vs PRD"
created: 2026-10-22
updated: 2026-11-16
inputs:
  - _bmad-output/planning-artifacts/briefs/brief-E2E_IAM-2026-10-22/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-E2E_IAM-2026-10-22/addendum.md
targets:
  - _bmad-output/planning-artifacts/prds/prd-E2E_IAM-2026-10-22/prd.md
  - _bmad-output/planning-artifacts/prds/prd-E2E_IAM-2026-10-22/addendum.md
---

# Input reconciliation: Brief vs PRD

> **Updated 2026-11-16 to match the built app.** Both the brief and the PRD now
> describe only what the app in `apps/` does. This check compares the two
> as-built documents with each other and with the code. Requirement IDs
> (FR-1 … FR-23, NFR-1 … NFR-9) refer to the as-built specification.

Scope of check: the brief's Solution bullets, its 20 scope items, the roles table, the success criteria, the open questions, the positioning line, and the four as-built design principles in brief addendum B. The PRD was not edited.

## Summary

- **Coverage is complete.** Every one of the brief's 20 scope items maps to one or more PRD FRs, and every PRD FR traces back to a brief scope item. The six roles and their permissions agree with PRD FR-4 and with the code.
- **The core theme is carried through:** a permanent record nobody can quietly change, stock never below zero, a second person for every damage write-off by floor staff and every correction, and losses in taka traceable to their movements.
- **Remaining gaps are small:** two brief success criteria are worded differently in the PRD, the brief's open questions are not repeated in the PRD, and the positioning line is not carried. No feature in either document is missing from the other.

## Gaps

Severity: **high** = contradicts or silently replaces an agreed input; **medium** = weakens or leaves an agreed idea underspecified; **low** = wording, consistency or minor drift.

### G-1. Count-loss success criterion measured differently — LOW
- **Input:** brief.md, Success Criteria, "Count losses fall: 'Missing in counts' and the report's lost total go down month on month (FR-18, FR-20)."
- **PRD:** prd.md §7 SM-7, "the share of Stock counts that match In stock rises month on month."
- **Concern:** both describe better counts, but one measures taka lost and the other the share of matching counts. **Fix:** keep both, or add the taka measure to SM-7 so the owner's view (losses in taka) is the headline.

### G-2. Floor-adoption criterion not in the PRD — LOW
- **Input:** brief.md, Success Criteria, "Floor adoption: each staff member's weekly activity is visible in My record (FR-22)."
- **PRD:** §7 has no matching SM. My record itself is fully specified (FR-22).
- **Fix:** add an SM such as "every active staff member has at least one recorded action per week, as shown in My record", marked `[ASSUMPTION]` like the other usage targets.

### G-3. "No self-approval" scoped slightly differently — LOW
- **Input:** brief.md, "No self-approval: no damage flag or reversal is decided by the person who raised it (FR-16, FR-23)."
- **PRD:** §7 SM-4 covers damage write-offs only ("recorded by an Owner or Manager, or approved by a second person"). The rule for Reversals is in FR-15, FR-16 and FR-23, and NFR-3 says the database enforces it.
- **Fix:** widen SM-4 to "no damage flag or Reversal is decided by the person who asked for it", which the database check already guarantees.

### G-4. Brief open questions not carried — LOW
- **Input:** brief.md, Open Questions: switching from Excel, staff acceptance of accountability, data-trust promises.
- **PRD:** §8 and §9 list only the success-metric assumptions.
- **Fix:** add the three questions to PRD §9 as `[ASSUMPTION]` items to check with a real distributor, or state that the brief holds them.

### G-5. Positioning line not carried — LOW
- **Input:** brief.md, "Every loss traced to a person and a reason."
- **PRD:** §1 Vision states the same idea ("trust through a record nobody can quietly change") without the line.
- **Fix:** optional; quote the line in §1 so the brief, PRD and trigger map speak with one voice.

## Scope creep (beyond the brief)

No scope creep was found. Every PRD FR maps to a brief scope item, and the PRD adds only detail the brief leaves out (exact limits such as SKU length, 1,000-row imports, 10,000-row history downloads, 12-hour sessions). All of these match the code.

## Items verified as covered (no gap)

- Brief scope items 1–20 map to FR-1 – FR-23 (PRD §6 Scope table).
- Brief Solution bullets: permanent record (FR-11), never-negative stock (FR-10), quick recording (FR-9), stock counts (FR-12), damage with a second person (FR-13, FR-14, FR-23), reversals (FR-15), approvals list (FR-16), losses in taka on the Dashboard (FR-17, FR-18), history, report and CSV (FR-19 – FR-21), Excel import (FR-6, FR-8), My record (FR-22), staff and roles (FR-1 – FR-5).
- Brief roles table matches the PRD FR-4 permission table, including "only Owner and Manager write damage off directly" and "Supervisor decides damage flags but not Reversals".
- Brief addendum B principles: permanent movement (FR-11), never below zero (FR-10), reverse never edit (FR-15), every figure valued in taka at the cost of its moment (FR-17).
- Brief success criteria for product proof (SM-1), complete audit information (SM-2), no negative stock (SM-3), losses traceable in taka (SM-5) and speed (NFR-6) are carried.
- Brief "runs locally with Docker Compose, in English, with light and dark themes" matches NFR-4, NFR-8 and NFR-9.
- The brief's typical scenario (60 bags on the sheet, 52 on the shelf) matches PRD UJ-2 and UJ-4, which use the same figures.
