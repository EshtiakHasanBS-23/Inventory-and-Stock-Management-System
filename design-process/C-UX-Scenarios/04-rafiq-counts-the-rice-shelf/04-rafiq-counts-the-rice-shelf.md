# 04: Rafiq Counts the Rice Shelf

**Project:** Mojud
**Updated:** 2026-11-16 (as built)
**Method:** Whiteport Design Studio (WDS)
**Priority:** P2
**Status:** ✅ Built

---

## Transaction (Q1)

Count what is physically on a shelf and let Mojud save the difference from the record, with his name.

## Business Goal (Q2)

Stock accuracy is checked regularly, and every shortage found is a recorded loss in taka, never a silent edit.

## User & Situation (Q3)

**Persona:** [Rafiq, Manager](../../B-Trigger-Map/personas/05-Rafiq-the-Manager.md)
**Situation:** Friday afternoon. He counts the Miniket rice 25kg stack: 44 bags. The record says 46.

## Driving Forces (Q4)

**Hope:** Accurate counts, and correcting the record without editing history.
**Worry:** Discrepancies with no trail of who found them.

## Device & Starting Point (Q5 + Q6)

**Device:** Phone at the shelf.
**Entry:** Menu "Stock count".

## Best Outcome (Q7)

**User success:** "Counted 44, record had 46: 2 bag missing (৳2,501). Stock adjusted."
**Business success:** A "Stock count" movement (out, 2 bags) with the note "Counted 44, system had 46.", his name and the value, shown in the Dashboard's "Missing in counts" loss.

## Shortest Path (Q8)

1. **Stock count (04.1):** chooses the product; sees "Recorded now: 46 bag"; types 44 in "Counted quantity"; "Save count". Sees the amber missing message. ✓
2. Had the count matched, he would see "Count matches: 46 bag. Nothing changed." and no movement would be saved. Had there been more, "… 1 bag extra. Stock adjusted."

## Scenario Steps

| Step | Folder | Purpose | Exit action |
|------|--------|---------|-------------|
| 04.1 | `04.1-stock-count/` | Enter the counted quantity; the difference is saved | "Save count" → result message |

## Stories and Requirements Covered

| Story | Requirements |
|---|---|
| US-08 Count stock | FR-12 |

## Trigger Map Connections

- ✅ **Want (Rafiq):** accurate counts; correct the record without editing history (a count movement, never an edit).
- ❌ **Fear (Haque):** losses found too late: count shortages appear as "Missing in counts" on the Dashboard.
