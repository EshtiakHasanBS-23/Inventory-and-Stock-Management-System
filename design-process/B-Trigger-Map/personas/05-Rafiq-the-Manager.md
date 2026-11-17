# Rafiq the Manager: Supporting Persona

> Supporting target. Keeps the catalogue right, counts stock, and is the second person for corrections.

Updated 2026-11-16 to match the built app.

**Priority:** SUPPORTING
**Role in flywheel:** keeps products and unit costs right, runs counts, approves reversals and decides damage flags → accurate record and losses valued correctly (objectives 2, 4 and 5)
**Created:** 2026-11-16
**Sources:** as-built app (FR-6 … FR-8, FR-12, FR-14 … FR-16, FR-19, FR-22, FR-23); user stories US-05, US-08, US-11; scenarios S04, S05. Fears and quotes are `[ASSUMPTION]` until checked with a pilot distributor.

## Profile Summary

**Rafiq manages day-to-day stock for Mr. Haque. He knows every product, its
unit and what it costs, and he is the one people come to when an entry is
wrong.** In a khata a mistake gets crossed out and nobody can tell what was
there before. He wants counts that settle what is really on the shelf and a way
to fix a wrong entry that leaves the original visible, with someone else
agreeing to the fix.

## Visual Representation

**Image generation prompt:**
"Photograph of a 40-year-old Bangladeshi man in a checked shirt with a pen in
his breast pocket, standing beside a shelf of rice bags and oil tins in a small
warehouse, holding a smartphone and glancing up from it with a practical,
attentive expression, a laptop on a desk softly out of focus behind him, even
daylight from a doorway, documentary style, medium shot."

## Context of Use

- **Where:** a desk in the warehouse office and on the floor
- **Device:** a desktop or laptop at the desk; his phone on the floor
- **Moments:** counting the rice shelf (S04), approving a reversal Mr. Haque asked for (S05), adding or editing products and importing a product list (S01), checking anyone's record when a gap is questioned

## Goals (usage context)

- Count a product and have the difference saved with its value ("Counted X, system had Y.", FR-12)
- Approve or reject reversals and damage flags he did not raise (FR-14, FR-15, FR-16)
- Keep products right: SKU, name, unit, minimum stock, unit cost (FR-6, FR-7)
- Import a product list from Excel, with every row checked before anything is saved (FR-8)
- See any person's record, not just his own (FR-22)

## Driving Forces

**Positive (wants):**
- ✅ Accurate counts (missing or extra shown in units and taka; a matching count saves nothing)
- ✅ Correct mistakes without editing history (a reversal is a new movement linked to the original, FR-15)
- ✅ A correct catalogue (search by name or SKU as you type; Low / Out status pills, FR-7)

**Negative (fears):**
- ❌ A correction that hides what happened (answered: movements can never be updated or deleted, FR-11; reversals need a second Owner or Manager)

## Illustrative Quote

> "If it was wrong, show that it was wrong, and show who fixed it."
> *(illustrative, not from an interview)*

## Design Implications

- Stock count form: product, counted quantity; message shows missing or extra in units and taka (FR-12)
- Approvals cards for reversals show what is being reversed; a reversal that would take stock below zero is refused and stays open (FR-15, FR-16)
- Stock counts and damage-flag movements cannot be reversed; only one open or approved reversal per movement (FR-15)
- Products table with status pills and search; SKU fixed after creation (FR-6, FR-7)
- Excel import lists problems by spreadsheet row and saves all rows or none (FR-8)
- Direct "Damaged" stock out is available to him as Manager (FR-23)
