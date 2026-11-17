# Intent Statement — Mojud core slice

Updated 2026-11-16 to match the built app.

## Problem Statement

Small FMCG distributors and wholesalers in Bangladesh, with one stock location and a handful of staff, run their stock on Excel sheets and paper khatas. Figures can be overwritten without a trace, damage is written off by the same person who found it, and the owner finds losses in taka too late, with nothing to trace them back to. [Q1]

Mojud gives these businesses one shared, permanent stock record: every change is kept with who, when, why and its value in taka, stock never goes below zero, and every damage write-off and every correction needs a second person. [Q1]

This piece of work builds Mojud as a working application that a small business can try on one machine. [desc]

## Target Customer

| Who | Role in the product | Pain today | Source |
|---|---|---|---|
| Owner (Mr. Abdul Haque) | Main decision maker; sets up the business and staff, watches stock value and losses | Cannot trust stock numbers without visiting the warehouse, and cannot see where taka is being lost | [Q2] |
| Warehouse worker (Karim) | Records most stock changes, on a phone | Recording is slow, and they get blamed for stock gaps they did not cause | [Q2] |
| Supervisor (Nasima) | Decides damage flags | Damage is reported verbally with no fair, quick way to decide it | [Q2] |
| Manager (Rafiq) | Keeps products right, counts stock, corrects mistakes | Mistakes can only be fixed by overwriting figures | [Q2] |

## Success Metrics

This work is successful when every item below is demonstrably true. [Q3]

| # | Outcome | How it is checked | Source |
|---|---|---|---|
| S1 | An Owner can sign up a business, import or add products, and add staff with roles (scenario S01) | The sign-up, import and staff screens work end to end in the running app | [Q3] [desc] |
| S2 | Any staff member can record stock in and out with a reason, and the saved message shows the new balance (scenario S02) | Recording a purchase and a sale updates the stock and the history | [Q3] [desc] |
| S3 | Damage is flagged by one person and approved or rejected by another, and nobody can decide their own request (scenario S03) | A flag moves units out of sellable stock; only a different supervisor, manager or owner can decide it | [Q3] [desc] |
| S4 | Stock never goes negative, and every stock change is a permanent record that cannot be edited or deleted | Automated tests pass for both rules, including two people taking the last unit at once | [Q3] |
| S5 | The owner sees stock value and losses in the last 30 days in taka, and each loss figure opens the movements behind it (scenario S05) | Tapping a loss tile shows the matching filtered history | [Q3] [desc] |
| S6 | All of the above run on the builder's own machine | The application starts locally with one command | [Q3] [desc] |

## Initiative Trigger

The PRD and UX design are finished, and this work turns them into working software as a learning and portfolio project. [Q4]

## Initial Scope Signal

**Workflow-selected:** the `mvp` workflow was selected for this piece of work. [scope]

**Product boundary as built:**

- Business sign-up, sign-in and sign-out; staff with six roles; passwords. [desc]
- Products with unit cost, search and Excel import with opening stock. [desc]
- Stock in and out, stock counts, the permanent stock record and the never-negative rule. [desc]
- Damage flags, reversals and one approvals list, each decided by a second person. [desc]
- Dashboard with stock value and losses in taka, movement history, monthly report, Excel downloads and each person's own record. [desc]
- One stock location per business; English; desktop and phone screens; runs locally only. [desc]

## Assumptions & Open Questions

None.
