# Mr. Haque the Owner: Primary Persona

> Primary target. Signs the business up, decides whether it keeps using Mojud, and is the person the stock numbers are for.

Updated 2026-11-16 to match the built app.

**Priority:** PRIMARY
**Role in flywheel:** sets the business up, reads stock value and losses in taka, asks for corrections → trusts the numbers and keeps the distributor on Mojud (product proof)
**Created:** 2026-10-23
**Sources:** as-built app (FR-1, FR-3 … FR-5, FR-8, FR-15, FR-17 … FR-21); user stories US-01, US-03, US-06, US-11 … US-15. Fears and quotes are `[ASSUMPTION]` until checked with a pilot distributor.

## Profile Summary

**Mr. Haque owns a small FMCG distributorship with one stock location and a
handful of staff. He built it on relationships and a khata, and now runs it
mostly by phone.** He doesn't want long reports; he wants to *trust* the
numbers without driving to the warehouse, and to know where taka is leaking
while there's still time to act. He'll judge Mojud by whether his staff
actually record in it and whether its figures hold up when he asks "why?".

## Visual Representation

**Image generation prompt:**
"Portrait of a 52-year-old Bangladeshi businessman in a pressed shirt, seated
in a modest office with ledger books and a calendar from a supplier, looking at
a smartphone with a thoughtful, slightly skeptical expression, warm afternoon
window light, natural documentary style, medium shot."

## Context of Use

- **Where:** home, office, car; rarely in the warehouse
- **Device:** a mid-range smartphone, sometimes a desktop at the office
- **Moments:** signing up and importing his product list (S01), a daily glance at the Dashboard, tracing a loss and asking to reverse a wrong entry (S05), closing the month with the Report and CSV downloads (S07), resetting a staff member's password (S08)

## Goals (usage context)

- See stock value and losses in the last 30 days, split by reason, at a glance (Dashboard, FR-18)
- Follow any loss figure down to the movement, person and time (History filters, FR-19)
- Close the month with one report he can hand to his accountant (Report, CSV, FR-20, FR-21)
- Get set up without a consultant (sign-up, Excel import with opening stock, staff, FR-1, FR-8, FR-3)
- Fix a wrong entry without anyone rewriting history (Reverse…, approved by a second person, FR-15)

## Driving Forces

**Positive (wants):**
- ✅ Trust the numbers from a distance (stock value from in-stock × unit cost, FR-17)
- ✅ See losses in taka and where they came from (Written off / Damage flags / Missing in counts, each linking to History)
- ✅ No silent write-offs (only Owner/Manager can write off directly; everyone else flags and a second person decides, FR-23)
- ✅ Control who does what (roles, deactivate and reactivate, FR-3, FR-4)

**Negative (fears):**
- ❌ Discovering losses at month end, too late (answered by the 30-day loss tiles and the "waiting for approval" banner)
- ❌ Write-offs nobody can explain (answered by the permanent record: every change has who, when, why and value, FR-11)

## Illustrative Quote

> "Don't tell me stock is short. Tell me which product, which day, and who counted."
> *(illustrative, not from an interview)*

## Design Implications

- Dashboard is the home after sign-in; banner "N requests waiting for approval · ৳X held as damaged" links to Approvals (FR-18)
- Every loss tile links to History filtered by that reason; filters are kept in the address so a view can be shared (FR-19)
- Lakh-grouped taka (৳12,45,000) everywhere (NFR-9)
- Sign-up, Excel import (checked row by row before saving) and Staff work without hand-holding (FR-1, FR-8, FR-3)
- Works on phone and desktop, light and dark themes (NFR-4)
- No person scores; the record shows what happened, not a ranking of people
