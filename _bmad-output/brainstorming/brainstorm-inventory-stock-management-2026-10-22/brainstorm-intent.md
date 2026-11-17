---
title: Inventory and Stock Management System - Brainstorm Intent
source: _bmad-output/brainstorming/brainstorm-inventory-stock-management-2026-10-22/.memlog.md
date: 2026-10-22
updated: 2026-11-16
status: ready-for-product-brief
---

# Inventory and Stock Management System - Brainstorm Intent

> **Updated 2026-11-16 to match the built app.** This is the brainstorm narrowed
> to the app that was built (`apps/`). Only the ideas that the app delivers are
> kept. Requirement IDs (FR-1 … FR-23) refer to the as-built specification.

## 1. Product in one line

A simple, reliable stock-control web app for small FMCG distributors. It keeps a permanent record of every stock change, with who, when, why and its value in taka, and shows the owner where money is lost. It is **not a full ERP**.

- **Core theme:** trust through transparent accountability. Make every change traceable, never let stock go below zero, need a second person for every damage write-off and every correction, and protect honest workers from unfair blame.
- **Positioning candidate:** "Every loss traced to a person and a reason."

## 2. Problem and root cause

**Trigger story:** the sheet said 60 bags of rice were in stock, but only 52 were on the shelf. Two bags got wet and someone wrote them off; someone else changed the figure after a delivery. Nobody could say who did what, and the owner was left with a loss in taka and no explanation.

**Five Whys:**
1. Why was the number wrong? Damage and other changes were not recorded when they happened.
2. Why? Damage was reported verbally and written off by the same person, and figures in a sheet or khata can be overwritten without a trace.
3. Why? Recording is slow and awkward, and there is no single place where everyone records the same way.
4. Why? Existing tools are built for reports, not for quick daily recording, so recording feels like extra work.
5. **Root:** the people who record get little immediate benefit. The value goes up to the owner and never comes back down to them.

**Insight:** gaps appear where one person's number is trusted without a second look: a write-off nobody else checked, a correction that overwrote the old figure, a shelf count that was never compared with the record.

## 3. Target customer

**Small FMCG distributors and wholesalers in Bangladesh** with one stock location and a handful of staff. Today they use Excel or a paper khata. The owner is not on the floor every day.

| Role | Core need |
|---|---|
| Owner | Trust the numbers from a distance. See money lost (written off, damaged, missing in counts) in taka, with no surprises at month end. |
| Manager | Keep the product list right, count stock accurately, and correct mistakes without rewriting history. |
| Supervisor | Approve or reject damage flags in one tap, and never be asked to approve their own. |
| Warehouse worker | Record work quickly on a phone, and be protected from blame for gaps they did not cause. |
| Sales rep | See how much is in stock and record what is sold. |
| Accountant | A clear stock value, a movement-level trail, and a monthly report to download for Excel. |

## 4. Design principles

1. **Every change is a permanent record.** Each stock change is a movement with who, when, why, quantity, balance after and unit cost at that moment. Nothing is overwritten or deleted.
2. **Stock never goes below zero.** A change that would do so is refused.
3. **Mistakes are reversed, not edited.** A correction is an opposite movement, linked to the original and approved by a second person.
4. **Segregation of duties.** Nobody approves their own damage flag or correction. Only the owner or a manager writes damage off directly; everyone else flags it.
5. **Every number the owner sees can be traced.** Each loss figure opens the movements behind it. Use evidence, not scores; the Trust Score idea was rejected.
6. **Every record gives something back.** A clear saved message with the new balance, and a personal record of work that proves what each person did.
7. **Protect honest workers.** The same record that holds people accountable also proves what they did.

## 5. Built scope

These are the brainstorm ideas the app delivers:

1. Business sign-up, staff with six roles, and role permissions (FR-1 – FR-4)
2. Passwords: change your own; the owner resets staff passwords (FR-5)
3. Product list with SKU, unit, minimum stock and unit cost, with search and OK / Low / Out status (FR-6, FR-7)
4. Excel (CSV) import with opening stock (FR-8)
5. Stock in and out with a reason (FR-9)
6. Never-negative stock (FR-10)
7. Permanent, append-only stock record (FR-11)
8. Stock counts that save the difference (FR-12)
9. Damage flag with one-tap second-person approval, working without a photo (FR-13, FR-14)
10. Reversals with second-person approval (FR-15)
11. One approvals list for damage flags and reversals (FR-16)
12. Stock value in taka (FR-17)
13. Owner dashboard with losses in taka and drill-down, plus a low-stock list (FR-18)
14. Filterable movement history (FR-19)
15. Monthly stock report and CSV downloads for Excel (FR-20, FR-21)
16. Worker "My record" showing their own movements, counts, damage flags and decisions (FR-22)
17. Segregation of duties (FR-23)

**WON'T**
- Full ERP scope, including invoicing
- A Trust Score made-up percentage (rejected)

## 6. Open questions and assumptions

**Market**
- Why would an owner leave a free Excel sheet that works well enough?
- What makes this better than existing local inventory software?
- What do target businesses use today: Excel, khata or nothing? This needs checking.

**People and adoption**
- Will employees accept a system that makes them more accountable if it also protects them?
- Can staff use it without technical training?

**Trust and data**
- Why should customers trust a new web app with their stock and financial data (security, backups)?

**Assumptions to validate**
- The market is Bangladesh and the currency is BDT. This was inferred from the owner thinking in taka.
- One stock location and a handful of staff describe the target business.
