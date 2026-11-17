# Karim the Warehouse Worker: Secondary Persona

> Secondary target. The record is only complete if he records what he handles.

Updated 2026-11-16 to match the built app.

**Priority:** SECONDARY
**Role in flywheel:** records stock in, stock out, counts and damage flags at the moment they happen → complete, permanent record → owner trust → product proof
**Created:** 2026-10-23
**Sources:** as-built app (FR-2, FR-5, FR-9 … FR-11, FR-13, FR-22, FR-23); user stories US-02, US-04, US-07, US-09, US-16. Fears and quotes are `[ASSUMPTION]` until checked with a pilot distributor.

## Profile Summary

**Karim works in the warehouse: unloading deliveries, handing out goods for sales,
moving cartons and bags. He's quick with his hands and slow to trust
paperwork, because paperwork has never protected him.** When stock goes missing
today, the worker nearest the gap gets blamed. If recording in Mojud is quick
and his own record becomes his defence, he records.

## Visual Representation

**Image generation prompt:**
"Candid photograph of a 26-year-old Bangladeshi man in a plain work shirt,
standing in a dim FMCG warehouse aisle between stacked cartons of rice and
cooking oil, holding a low-cost Android phone in one hand and a carton edge in
the other, focused and slightly hurried expression, natural mixed lighting from
a roller door, documentary photography style, shallow depth of field."

## Context of Use

- **Where:** warehouse floor and loading bay, standing
- **Device:** a low-cost Android phone in the browser (layout works from 320 px; bottom tab bar on phones)
- **Moments:** recording the morning delivery as stock in (S02), recording a sale as stock out, flagging a wet or crushed bag (S03), checking his week in My record (S06), changing his password after the owner resets it (S08)

## Goals (usage context)

- Record a stock change in one short form: product, direction, reason, quantity, optional note (FR-9)
- See at once that it was saved, with the new balance
- Flag damage without needing a manager's permission first (FR-13)
- Have something to point to when a gap is questioned (My record, FR-22)

## Driving Forces

**Positive (wants):**
- ✅ Speed: a short form that works on his phone
- ✅ Proof: every movement carries his name and time and can never be edited or deleted (FR-11)
- ✅ Clarity: clear messages when something is refused ("Only N unit in stock.", "Use Flag damage: a supervisor, manager or owner decides it.")

**Negative (fears):**
- ❌ Being blamed for a shortfall someone else caused (answered by the named, permanent record and My record)
- ❌ Slow paperwork (answered by one form with whole-number quantities and a saved message)

## Illustrative Quote

> "If it shows I recorded 92 in, then 92 is what came. Don't put the 8 on me."
> *(illustrative, not from an interview)*

## Design Implications

- Phone layout with bottom tab bar; tables become cards on phones (NFR-4)
- Saved message shows the new balance; green saved toast
- Refusals explain what to do next, never blame (stock never negative, FR-10; damage goes through Flag damage, FR-23)
- Flag damage reachable from Stock in / out and from each product row
- My record shows today, last 7 days and last 30 days: movements and units, counts, flags by outcome (FR-22)
- Sign-in with phone and password; session ends 12 hours after last use (FR-2)
