# 05: Haque Traces a Loss and Fixes a Mistake

**Project:** Mojud
**Updated:** 2026-11-16 (as built)
**Method:** Whiteport Design Studio (WDS)
**Priority:** ⭐ P1
**Status:** ✅ Built

---

## Transaction (Q1)

See the business at a glance, follow a loss figure to the movements behind it, and correct a wrong entry through a reversal that another manager approves.

## Business Goal (Q2)

Losses are traceable in taka to the movement, person and time; mistakes are corrected without editing history.

## User & Situation (Q3)

**Personas:** [Mr. Abdul Haque, Owner](../../B-Trigger-Map/personas/03-Haque-the-Owner.md) (traces, asks); [Rafiq, Manager](../../B-Trigger-Map/personas/05-Rafiq-the-Manager.md) (approves)
**Situation:** Monday morning, at his desk or on his phone away from the warehouse. The Dashboard shows ৳5,002 of losses in the last 30 days. He also spots that a sale of 3 bags last Thursday was entered twice.

## Driving Forces (Q4)

**Hope:** Trust the numbers from a distance; see where losses came from.
**Worry:** Losses found too late; write-offs nobody can explain.

## Device & Starting Point (Q5 + Q6)

**Device:** Desktop or phone.
**Entry:** Signs in and lands on the Dashboard (everyone's home).

## Best Outcome (Q7)

**User success:** Haque knows the ৳5,002 is ৳2,501 approved damage flags and ৳2,501 missing in Friday's count, sees who recorded each, and has asked to reverse the double sale. Rafiq approves it; stock is right again.
**Business success:** The duplicate is undone by a linked "Reversal" movement under Rafiq's decision; the original stays in the record.

## Shortest Path (Q8)

1. **Dashboard (05.1):** reads Stock value, "Losses, last 30 days" with Written off / Damage flags / Missing in counts. Taps "Missing in counts".
2. **History (05.2):** opens filtered to reason "Stock count" (`/history?reason=count`); sees Rafiq's count with "−2 bag", ৳2,501 and the note. Clears filters, picks the product and a date range, finds the two identical "Sale" rows.
3. **History (05.2):** taps "Reverse…" on the duplicate; the "Ask to reverse this movement" panel opens; types "Entered twice" in "Why should it be reversed?"; "Ask for reversal". Sees "Reversal asked for. Another owner or manager must approve it."
4. **Approvals ([03.2](../03-karim-flags-a-wet-bag-and-nasima-decides/03.2-approvals/03.2-approvals.md)), Rafiq:** the card "Reversal · Undo Sale of 13 Nov, 11:05 · Asked by Mr. Abdul Haque"; taps "Approve". A "Reversal" stock-in of 3 bags is recorded. ✓

## Scenario Steps

| Step | Folder | Purpose | Exit action |
|------|--------|---------|-------------|
| 05.1 | `05.1-dashboard/` | Stock value, losses by reason, low stock, recent movements | Loss row → History filtered by reason |
| 05.2 | `05.2-history/` | Filter the record; ask for a reversal | "Ask for reversal" |
| (03.2) | `../03-…/03.2-approvals/` | Rafiq approves the reversal | "Approve" |

## Stories and Requirements Covered

| Story | Requirements |
|---|---|
| US-12 See the dashboard and trace losses | FR-18, FR-17 |
| US-13 Search the history | FR-19 |
| US-11 Reverse a mistake | FR-15, FR-16 |

## Trigger Map Connections

- ✅ **Want (Haque):** trust numbers from a distance; see losses in taka and where they came from (loss split, drill-down).
- ✅ **Want (Rafiq):** correct mistakes without editing history (reversal with second approval).
- ❌ **Fear (Haque):** losses found too late; unexplained write-offs.
