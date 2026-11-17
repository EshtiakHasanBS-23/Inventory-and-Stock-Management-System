---
title: "Product Brief: Mojud (working name)"
status: final
created: 2026-10-22
updated: 2026-11-16
inputs:
  - _bmad-output/brainstorming/brainstorm-inventory-stock-management-2026-10-22/brainstorm-intent.md
  - idea.md
---

# Product Brief: Mojud (working name)

> **Updated 2026-11-16 to match the built app.** This brief describes only what
> the app in `apps/` does. Requirement IDs (FR-1 … FR-23) refer to the as-built
> specification.

> *Mojud* (মজুদ) means "stock" in Bangla. The name is temporary.

## Executive Summary

Mojud is a simple, reliable stock-control web app for small **FMCG distributors
and wholesalers in Bangladesh** with one stock location and a handful of staff.
It replaces Excel sheets and paper khatas with one shared record. That record
shows what is in stock, who changed it and why, and where taka is being lost.

The core idea is **trust through transparent accountability**. Every stock
change is kept permanently with who, when, why and its value in taka. Every
damage write-off and every correction needs a second person. And the same
record that holds people accountable also proves what honest workers did.

It is a phone-friendly web app in English that runs in the browser on desktop
and phone. This is a personal learning project, built with the intention of
becoming usable by a real business.

Working positioning line: *"Every loss traced to a person and a reason."*

## The Problem

A typical scenario: the sheet says 60 bags of rice are in stock. At month end
only 52 are on the shelf. Two bags got wet last week and someone wrote them off;
someone else changed the figure after a delivery. Nobody remembers who did what,
and the owner is left with ৳9,600 of loss and no explanation.

The underlying causes:

- **Figures change without a trail.** In a sheet or khata, a number can be
  overwritten and the old value, the person and the reason are gone.
- **Write-offs happen quietly.** Damage is reported verbally and written off by
  the same person who found it, with no second check.
- **Owners find losses too late.** Damaged and missing stock shows up as an
  unexplained shortfall at month end, with nothing to trace it back to.
- **Honest workers get blamed.** When a gap appears, there is no record to show
  who did the work correctly.

**Root cause:** the people who record stock get no immediate benefit from doing
it, so under time pressure recording is the first thing skipped.

## The Solution

A responsive web app that works on desktop and phone (from 320 px wide). It
does a small number of things reliably:

- **A permanent stock record.** Every change is a movement with product,
  direction, reason, quantity, balance after, unit cost at that moment, note,
  person and time. The database refuses any edit or delete (FR-11).
- **Stock never goes below zero.** A change that would do so is refused with
  "Only N unit in stock.", even when two people record the last unit at once (FR-10).
- **Quick recording.** Stock in (purchase, customer return, count adjustment)
  and stock out (sale, count adjustment) on one screen, with a saved message
  showing the new balance (FR-9).
- **Stock counts.** Enter what is on the shelf; the difference is saved as a
  stock count movement and shown as units and taka missing or extra (FR-12).
- **Damage needs a second person.** Anyone can flag damage; the units leave
  sellable stock straight away and a supervisor, manager or owner who did not
  raise the flag approves or rejects it in one tap. Only an owner or manager can
  write off damage directly (FR-13, FR-14, FR-23).
- **Mistakes are reversed, not edited.** An owner or manager asks to reverse a
  movement with a reason; a different owner or manager approves it, and an
  opposite movement is recorded and linked to the original (FR-15).
- **One approvals list.** Waiting and decided damage flags and reversals, each
  with product, quantity, value in taka, who asked and when. Nobody decides
  their own request (FR-16).
- **Losses in taka for the owner.** A dashboard with stock value, losses in the
  last 30 days split into written off, damage flags and missing in counts (each
  opening the matching history), low and out-of-stock products, and the latest
  movements (FR-17, FR-18).
- **History, report and Excel files.** A filterable movement history (FR-19), a
  monthly stock report per product (FR-20), and CSV downloads of products,
  history and report that open in Excel (FR-21).
- **Quick set-up.** Products are created by hand or imported from Excel (CSV)
  with opening stock, all rows or none (FR-6, FR-8).
- **Something back for workers.** "My record" shows a person's own stock
  movements, counts, damage flags and decisions for today, the last 7 days and
  the last 30 days (FR-22).
- **Staff and roles.** The owner signs up the business, adds staff with one of
  five roles, deactivates or reactivates them and resets their passwords (FR-1
  … FR-5).

## What Makes This Different

These points are honest positioning claims. None of them is a technical moat.

- **Nothing is overwritten.** Every change stays in the record, with its value
  in taka at the time.
- **Second-person approval.** Every damage write-off by floor staff and every
  correction is decided by someone other than the person who asked.
- **Accountability that protects.** The same record that holds people
  accountable also clears honest workers, and each worker can see their own.
- **Phone-friendly and simple.** One screen per job, cards on phones, plain
  English messages.
- `[ASSUMPTION]` **There is a market gap.** Desk research suggests local tools
  are either single-shop khata apps or brand-side distribution and ERP systems.
  This must be checked with real distributors (addendum A).

## Who This Serves

**Primary customer:** the **owner** of a small Bangladeshi FMCG distributor or
wholesaler with one stock location and a handful of staff. Today they run on
Excel and khata, and they aren't on the floor every day. They want **control**:
to trust the numbers from a distance and see where money is lost.

**Daily users** adopt it only if it gives them **relief**. The built roles:

| Role | What they do in Mojud | What success looks like |
|---|---|---|
| Owner | Manages staff, products and imports; records stock; writes off damage; asks for and decides reversals and damage flags (not their own); sees anyone's record | Sees losses in taka and can follow each one to its movements |
| Manager | Manages products and imports; records stock and counts; writes off damage; asks for and decides reversals and damage flags (not their own); sees anyone's record | Counts are right and mistakes are corrected without editing history |
| Supervisor | Records stock and counts; flags damage; decides other people's damage flags | Clears the approvals list in one tap per card |
| Warehouse worker | Records stock in/out and counts; flags damage | Records in seconds and has proof of their own work |
| Sales rep | Checks stock; records stock in/out and counts; flags damage | Knows what is in stock without calling the warehouse |
| Accountant | Reads the history and report; downloads CSV; records stock and counts; flags damage | Gets a stock value backed by a movement-level trail |

## Success Criteria

`[ASSUMPTION]` Adoption targets are provisional until tested with a real business.

- **Product proof:** one real distributor replaces Excel or khata with Mojud for
  8 consecutive weeks.
- **Complete audit information:** 100% of stock changes record person, time,
  reason and value. The system enforces this (FR-11).
- **No negative stock:** stock never goes below zero (FR-10).
- **No self-approval:** no damage flag or reversal is decided by the person who
  raised it (FR-16, FR-23).
- **Losses traceable in taka:** every loss figure on the dashboard opens the
  movements behind it (FR-18, FR-19).
- **Count losses fall:** "Missing in counts" and the report's lost total go down
  month on month (FR-18, FR-20).
- **Floor adoption:** each staff member's weekly activity is visible in My
  record (FR-22).
- **Speed:** first load, sign-up and sign-in each take 2 seconds or less (NFR-6).

## Scope

The built app delivers these features (requirement IDs in brackets):

1. Business sign-up, sign-in and sign-out (FR-1, FR-2)
2. Staff management with six roles and role permissions (FR-3, FR-4)
3. Passwords: change own, owner reset for staff (FR-5)
4. Products with SKU, unit, minimum stock and unit cost in taka (FR-6)
5. Product list with search and OK / Low / Out status (FR-7)
6. Product import from Excel (CSV) with opening stock (FR-8)
7. Stock in / out with reasons (FR-9)
8. Never-negative stock (FR-10)
9. Permanent, append-only stock ledger (FR-11)
10. Stock counts (FR-12)
11. Damage flags with second-person decision (FR-13, FR-14)
12. Reversals with second-person approval (FR-15)
13. Approvals list (FR-16)
14. Stock value in taka (FR-17)
15. Owner dashboard with losses in taka and drill-down (FR-18)
16. Filterable movement history (FR-19)
17. Monthly stock report (FR-20)
18. CSV downloads for Excel (FR-21)
19. My record (FR-22)
20. Segregation of duties (FR-23)

It runs locally with Docker Compose, in English, with light and dark themes.

## Open Questions

`[ASSUMPTION]` Each of these needs to be checked with real distributors.

- **Switching:** why would an owner leave an Excel sheet that works "well
  enough"? Is the loss in taka large enough to justify it?
- **Staff acceptance:** will staff accept more accountability if the product
  clearly protects them too?
- **Data trust:** what security and backup promises do owners need before
  trusting a new web app with stock and money data?

## Vision

Mojud becomes the stock record a small distributor trusts: quick to record,
impossible to rewrite quietly, and clear about where every taka of loss came
from. It stays a focused stock-control product.
