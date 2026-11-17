# PRD Quality Review — Mojud (working name)

> **Updated 2026-11-16 to match the built app.** This review covers the as-built
> PRD (`prd.md`, FR-1 … FR-23, NFR-1 … NFR-9, SM-1 … SM-8), checked against the
> as-built brief and the code in `apps/`.

## Overall verdict
This is a compact, accurate PRD for a solo learning build. It has a clear thesis ("trust through a record nobody can quietly change"), a glossary whose terms are used consistently, a single permission table (FR-4), and FRs that each carry short, testable rules matching the code. The stock rules that matter most (append-only ledger, never-negative stock, second-person approvals) are stated as rules and backed by database checks (NFR-3). Remaining findings are minor: a few success metrics could be sharper, and two small rules in the code are not written down.

## Decision-readiness — strong
Decisions are stated as decisions with their reasons in the PRD addendum §B: one Unit cost per Product kept on each movement, damage through a hold and a second person, direct "Damaged" stock out only for Owners and Managers, stock counts and damage-flag movements not reversible, losses split three ways. The open items in §9 are genuinely open (usage targets to confirm with a real distributor).

### Findings
- **[low]** The brief's open questions (switching from Excel, staff acceptance, data trust) are not repeated in §9 (see `reconcile-brief.md` G-4). *Fix:* add them to §9 or point to the brief.

## Substance over theater — strong
The content is earned. Every role in §2.1 drives a column of the FR-4 table. The UJs use concrete figures that match the FRs ("Only 52 bag in stock.", "Counted 50, system had 52."). The NFRs have thresholds (320 px, 4.5:1 contrast, 2 s first load, 50 ms budget for `/auth/me`, 80% coverage).

### Findings
None.

## Strategic coherence — strong
Vision, personas, UJs, FRs and SMs all point at the same promise: the owner can trust the numbers and see where taka is lost, and honest workers are protected by the same record. Each UJ maps to one UX scenario (S01–S08) and to user stories US-01 … US-16.

### Findings
- **[low]** SM-4 covers only damage write-offs, while the brief's "no self-approval" criterion also covers Reversals (FR-15, FR-16). *Fix:* widen SM-4 to include Reversals.

## Done-ness clarity — strong
Each FR has pass/fail rules with exact messages and limits: SKU ≤ 40 characters, quantity 1–1,000,000, note ≤ 200, import ≤ 1,000 rows, history download ≤ 10,000 rows, sessions ending 12 hours after last use, "This was already decided." for a lost race. These match the automated tests named in the user stories.

### Findings
- **[low]** FR-7 says the list is searched "as the User types" but does not say the list starts with all Products and how many rows show. *Fix:* optional; the behaviour is obvious from the screen.
- **[low]** FR-13 says Flag damage is reached "from Stock in / out or from the Product's row" but not that the Product is pre-selected when opened from a row. *Fix:* add one line.

## Scope honesty — strong
§6 lists exactly what is built, with the screens and addresses that exist. §8 states the operating assumptions (one stock location, one unit per Product, one Unit cost, Owner resets passwords, demo data only). Nothing is promised that the app does not do.

### Findings
None.

## Downstream usability — strong
IDs are contiguous and unique (FR-1 … FR-23, NFR-1 … NFR-9, SM-1 … SM-8, UJ-1 … UJ-8). The §6 user-story table and the PRD addendum §A link each FR to the user stories and to how the code meets it. The FR-4 table is the single source for permissions, and the FR text agrees with it.

### Findings
- **[low]** The FRs are grouped by area, so FR-23 (segregation of duties) sits in §4.4 after FR-16. *Fix:* none needed; the ID is fixed and used by the stories and tests.

## Shape fit — strong
A multi-role operational tool with a floor user (Karim on a phone) and a remote owner (Haque), so UJs with named protagonists are load-bearing, and eight is the right density. Plain language, small FRs and technical detail kept in the addendum suit a solo learning project. No findings.

## Mechanical notes
- **Cross-references:** all FR references in the UJs, SMs and §6 resolve.
- **Glossary:** every capitalised term used in the FRs (Business, User, Role, Product, SKU, In stock, Stock movement, Reason, Stock ledger, Damage flag, Damaged hold, Write-off, Approval, Approvals inbox, Reversal, Stock count, Unit cost, Stock value, Minimum stock, Low stock, Out of stock, Losses, Dashboard, My record) is defined in §3.
- **Reasons:** the Glossary lists all ten Reasons, and they match the reason names in the app (Purchase, Customer return, Sale, Damaged, Count adjustment, Opening stock, Stock count, Damage flagged, Flag rejected, Reversal).
- **Assumptions Index roundtrip:** complete. The `[ASSUMPTION]` tags in §7 (SM-1, the usage targets) appear in §9.
- **UJ protagonists:** every UJ has a named persona (Haque, Karim, Nasima, Rafiq).
- **Required sections:** all present for the stakes (Purpose, Vision, Users and JTBD, UJs, Glossary, FRs, NFRs, Scope, SMs, Assumptions, Assumptions Index, Change log).
