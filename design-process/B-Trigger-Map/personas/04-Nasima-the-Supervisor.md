# Nasima the Supervisor: Tertiary Persona

> Tertiary target. The second person who decides every damage flag.

Updated 2026-11-16 to match the built app.

**Priority:** TERTIARY
**Role in flywheel:** decides damage flags quickly and fairly → damage written off only after a second look, losses explained in taka (objectives 4 and 5)
**Created:** 2026-10-23
**Sources:** as-built app (FR-13, FR-14, FR-16, FR-23); user story US-10; scenario S03. Fears and quotes are `[ASSUMPTION]` until checked with a pilot distributor.

## Profile Summary

**Nasima supervises the warehouse floor. Damaged stock used to reach her by
shouting, phone calls and WhatsApp photos, and she is accountable for every
write-off.** She wants one list where each card already shows what was flagged,
how many, what it is worth, who flagged it and when, so she can decide in a tap
and get back to the floor. She doesn't want to be the reason decisions pile up,
and she doesn't want anyone to say she approved her own request.

## Visual Representation

**Image generation prompt:**
"Photograph of a 35-year-old Bangladeshi woman supervisor in a salwar kameez
with a dupatta and an ID lanyard, standing at the end of a warehouse aisle,
checking a smartphone with a composed, decisive expression, a worker and pallets
softly out of focus behind her, even fluorescent lighting, documentary style."

## Context of Use

- **Where:** on the floor and at a small desk by the bay
- **Device:** her own Android phone
- **Moments:** deciding a flag Karim just raised (S03), clearing the Waiting tab before shift end, checking the Decided tab when someone asks what happened to a flag

## Goals (usage context)

- See every waiting damage flag in one place (Approvals, Waiting tab, FR-16)
- Approve (written off) or reject (back in stock) in one tap (FR-14)
- Know the decision is final and recorded with her name ("This was already decided." if someone else got there first)

## Driving Forces

**Positive (wants):**
- ✅ One-tap decisions with product, quantity, value in taka, note, who asked and when on the card
- ✅ Fairness: nobody decides their own request; the card says "Waiting for someone else to decide." when it isn't hers to decide (FR-16, FR-23)

**Negative (fears):**
- ❌ Being the bottleneck (answered: any Supervisor, Manager or Owner who did not raise the flag can decide it, and the Dashboard banner shows what is waiting)

## Illustrative Quote

> "Show me what was flagged, who flagged it, and let me close it."
> *(illustrative, not from an interview)*

## Design Implications

- Approvals inbox with Waiting / Decided tabs; each card shows kind, product, quantity, value, note, who asked and when (FR-16)
- Approve / Reject shown only to people allowed to decide who did not ask (FR-16, FR-23)
- Flagged units leave sellable stock at once into a Damaged hold, so stock is right while the decision waits (FR-13)
- A rejected flag puts the units back with a "Flag rejected, back in stock" movement (FR-14)
- An empty Waiting tab that reads as done
