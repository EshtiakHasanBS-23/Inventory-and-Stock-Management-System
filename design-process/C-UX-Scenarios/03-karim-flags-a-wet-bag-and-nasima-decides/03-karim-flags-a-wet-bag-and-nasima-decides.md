# 03: Karim Flags a Wet Bag and Nasima Decides

**Project:** Mojud
**Updated:** 2026-11-16 (as built)
**Method:** Whiteport Design Studio (WDS)
**Priority:** ⭐ P1
**Status:** ✅ Built

---

## Transaction (Q1)

Report damaged stock so it leaves sellable stock now, and have a second person approve the write-off or put it back.

## Business Goal (Q2)

No silent write-offs: every damage loss is recorded with who found it, who decided it, and its value in taka.

## User & Situation (Q3)

**Personas:** [Karim, Warehouse worker](../../B-Trigger-Map/personas/02-Karim-the-Warehouse-Worker.md) (flags); [Nasima, Supervisor](../../B-Trigger-Map/personas/04-Nasima-the-Supervisor.md) (decides)
**Situation:** After rain, Karim finds 2 bags of Miniket rice 25kg soaked at the bottom of the stack. Nasima clears decisions at the end of her shift.

## Driving Forces (Q4)

**Karim's hope:** Report it fast and be on record as the one who found it, not the one who lost it.
**Karim's worry:** Being blamed; paperwork.
**Nasima's hope:** Clear decisions quickly and fairly.
**Nasima's worry:** Being the bottleneck.

## Device & Starting Point (Q5 + Q6)

**Karim:** phone; from Stock in / out ("Found damaged stock? Flag damage") or the "Flag damage" chip on the product row.
**Nasima:** phone or desktop; menu "Approvals", or the Dashboard banner "1 request waiting for approval".

## Best Outcome (Q7)

**User success:** Karim sees "Flagged 2 bag of Miniket rice 25kg (৳2,501). Waiting for a decision." Nasima taps "Approve: write off" and sees "Approved: Miniket rice 25kg."
**Business success:** A "Damage flagged" movement under Karim's name moved the bags out of sellable stock into a damaged hold; Nasima's decision is recorded with her name and time. Had she rejected it, a "Flag rejected, back in stock" movement would have returned them.

## Shortest Path (Q8)

1. **Flag damage (03.1):** Karim chooses the product, enters 2 (default is 1), adds a note "Wet from rain", taps "Flag damage". Sees the flagged message with the value.
2. **Approvals (03.2):** Nasima opens the Waiting tab; the card shows "Damage flag", the value, product and quantity, the note, and "Asked by Karim · 16 Nov, 09:40". She taps "Approve: write off". The card moves to Decided. ✓
3. If Karim opens Approvals, his own card says "Waiting for someone else to decide." and has no buttons.

## Scenario Steps

| Step | Folder | Purpose | Exit action |
|------|--------|---------|-------------|
| 03.1 | `03.1-flag-damage/` | Move damaged units into the hold and open an approval | "Flag damage" → flagged message |
| 03.2 | `03.2-approvals/` | Second person approves or rejects | "Approve: write off" / "Reject: back to stock" |

## Stories and Requirements Covered

| Story | Requirements |
|---|---|
| US-09 Flag damage | FR-13 |
| US-10 Decide damage flags | FR-14, FR-16, FR-23 |

## Trigger Map Connections

- ✅ **Want (Karim):** proof that protects him (his name on the flag); quick recording.
- ✅ **Want (Nasima):** one-tap decisions; fairness (cannot approve her own; clear who asked).
- ❌ **Fear (Haque):** unexplained write-offs: every damage loss passes a second person ([DD-1](../00-design-decisions.md)).
