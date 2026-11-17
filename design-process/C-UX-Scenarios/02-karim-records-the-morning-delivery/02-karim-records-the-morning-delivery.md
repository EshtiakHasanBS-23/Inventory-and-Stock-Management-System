# 02: Karim Records the Morning Delivery

**Project:** Mojud
**Updated:** 2026-11-16 (as built)
**Method:** Whiteport Design Studio (WDS)
**Priority:** ⭐ P1
**Status:** ✅ Built

---

## Transaction (Q1)

Sign in on the phone and record a delivery as stock in, then a sale as stock out.

## Business Goal (Q2)

100% of stock changes record who, when, why and value; stock never goes below zero.

## User & Situation (Q3)

**Persona:** [Karim, Warehouse worker](../../B-Trigger-Map/personas/02-Karim-the-Warehouse-Worker.md)
**Situation:** 9:10 in the morning. A truck has dropped 40 bags of Miniket rice 25kg. Later a shop collects 6 bags. He has his phone in one hand.

## Driving Forces (Q4)

**Hope:** Recording is quick on the phone; his name is on what he did.
**Worry:** Slow paperwork; being blamed for a gap someone else made.

## Device & Starting Point (Q5 + Q6)

**Device:** Phone browser, about 360 px wide.
**Entry:** Opens Mojud's address; he is signed out, so he lands on Sign in.

## Best Outcome (Q7)

**User success:** "Saved. Stock in 40 bag of Miniket rice 25kg. Now 52 bag in stock." in under a minute.
**Business success:** A "Purchase" movement with his name, the time, the quantity, the balance after and the value at today's unit cost.

## Shortest Path (Q8)

1. **Sign in (02.1):** phone number and password, "Sign in"; lands on the Dashboard.
2. **Stock in / out (02.2):** from the bottom tab bar; chooses the product (sees "In stock now: 12 bag"), keeps "Stock in" and reason "Purchase", types 40, "Save". Sees the saved message with the new balance.
3. **Stock in / out (02.2), later:** chooses "Stock out", reason "Sale", quantity 6, "Save". If he typed more than is in stock he would see "Only 52 bag in stock." under Quantity and nothing would be saved. ✓

## Scenario Steps

| Step | Folder | Purpose | Exit action |
|------|--------|---------|-------------|
| 02.1 | `02.1-sign-in/` | Sign in as himself | "Sign in" → Dashboard (or the page first asked for) |
| 02.2 | `02.2-stock-in-out/` | Record stock in and stock out | "Save" → saved message with new balance |

## Stories and Requirements Covered

| Story | Requirements |
|---|---|
| US-02 Sign in and out | FR-2 |
| US-07 Record stock in and out | FR-9, FR-10, FR-11, FR-23 |

## Trigger Map Connections

- ✅ **Want (Karim):** quick recording on a phone (direction tiles, phone layout); proof with his name (append-only record).
- ❌ **Fear (Karim):** slow paperwork; blame.
- ✅ **Business:** every change records who, when, why and value (enforced by the API and database).
