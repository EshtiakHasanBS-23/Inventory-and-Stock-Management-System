# 07: Haque Closes the Month

**Project:** Mojud
**Updated:** 2026-11-16 (as built)
**Method:** Whiteport Design Studio (WDS)
**Priority:** P3
**Status:** ✅ Built

---

## Transaction (Q1)

See what came in, was sold and was lost this month, per product and in taka, and download it for the accountant.

## Business Goal (Q2)

Losses are traceable in taka each month; the accountant gets the figures without retyping.

## User & Situation (Q3)

**Persona:** [Mr. Abdul Haque, Owner](../../B-Trigger-Map/personas/03-Haque-the-Owner.md) (an Accountant can do the same)
**Situation:** 30 November, evening. He wants the month's picture and a file to send to his accountant.

## Driving Forces (Q4)

**Hope:** See losses in taka and where they came from; one file for the accountant.
**Worry:** Losses found too late.

## Device & Starting Point (Q5 + Q6)

**Device:** Desktop.
**Entry:** Menu "Report"; it opens on this month by default.

## Best Outcome (Q7)

**User success:** Three summary figures (Received, Sold, Lost) and a table per product from start to end quantity, with a Total line; "Download CSV" gives `stock-report.csv`.
**Business success:** The same figures the app shows go to the accountant, with values at the cost of the time.

## Shortest Path (Q8)

1. **Report (07.1):** opens with From = 1 November, To = today. Reads Received ৳…, Sold ৳…, "Lost (damage and missing)" ৳….
2. **Report (07.1):** reads the table: Start, In, Sold, Damaged, Count +/−, Adjusted, End per product; the Total line.
3. **Report (07.1):** "Download CSV" → `stock-report.csv`, sent to the accountant. ✓
4. Optional: Products "Download CSV" (`products.csv`) and History "Download CSV" (`stock-history.csv`, same filters) for detail.

## Scenario Steps

| Step | Folder | Purpose | Exit action |
|------|--------|---------|-------------|
| 07.1 | `07.1-report/` | Stock report for a date range, with CSV downloads | "Download CSV" |

## Stories and Requirements Covered

| Story | Requirements |
|---|---|
| US-14 Monthly stock report | FR-20 |
| US-15 Download CSV | FR-21 |

## Trigger Map Connections

- ✅ **Want (Haque):** see losses in taka and where they came from (report).
- ❌ **Fear (Haque):** losses found too late.
