---
title: "PRD Addendum: Mojud (working name)"
created: 2026-10-22
updated: 2026-11-16
---

# PRD Addendum: Mojud (working name)

Technical notes and background that support the PRD. They describe *how* the built app meets the requirements, in plain terms. The PRD stays the source for *what* the app does.

## A. How the built app meets key requirements

**Technology**
- TypeScript throughout: a React web app, a Node (Express) API and a PostgreSQL 16 database. Validation rules are written once and shared by the web app and the API.
- It runs locally only, with Docker Compose (web, API, database) or in development mode with hot reload (NFR-8).

**Stock ledger and never-negative stock (FR-9 – FR-11, NFR-3)**
- Every stock change inserts a row into an append-only stock movements table. A database trigger refuses any update or delete of that table.
- The Product's stock quantity is changed in the same database transaction as the movement is inserted, using a conditional update ("only if enough is in stock"). A database check also refuses a negative quantity. So two requests for the last unit can never both succeed.

**Stock counts (FR-12)**
- The Product row is locked while the count is compared and saved, so no other change can happen between reading the current quantity and saving the difference.

**Approvals (FR-13 – FR-16, FR-23)**
- Damage flags and Reversals are stored as approval requests. A database check refuses a decision by the person who asked.
- Deciding locks the request row, so if two people decide at the same moment only one decision is saved; the other is told "This was already decided."

**Money (FR-17, NFR-9)**
- Unit costs and values are stored and added up as whole poisha (1/100 taka), so totals have no rounding drift. Each movement stores the Unit cost of its moment.

**Data isolation (FR-4, NFR-2)**
- Every table carries the Business it belongs to, and every query is filtered by the caller's Business. A record of another Business is answered as "not found".

**Excel import (FR-8)**
- The CSV file is read and checked in the browser first, so problems are shown by row before anything is sent. The API checks every row again and saves all rows in one database transaction, or none.

**CSV downloads (FR-21)**
- Files start with a UTF-8 byte-order mark for Excel. Cells starting with `=`, `+`, `-` or `@` get a leading apostrophe to block formula injection.

## B. Rationale for key choices

- **A permanent, append-only record:** the owner can only trust the numbers if nobody, including the owner, can quietly change past records. Mistakes are corrected with a Reversal that stays visible next to the original.
- **Damage goes through a hold and a second person:** a worker can report damage at once, but the stock is only written off after someone else agrees. This stops silent write-offs and protects the worker who reported it.
- **Direct "Damaged" stock out only for Owners and Managers:** the people who already decide approvals can record an obvious write-off directly; everyone else uses Flag damage.
- **Stock counts and Damage flag movements cannot be reversed:** a count records what was physically on the shelf, and a Damage flag is settled by approving or rejecting it, so reversing them would hide the real evidence.
- **One Unit cost per Product, kept on each movement:** this is the simplest way to show stock value, while past losses keep the value they had when they happened.
- **Losses split three ways on the Dashboard:** written off, damage flags and missing in counts point to different causes, and each one links to the movements behind it.

## C. Related documents

- Product brief: `_bmad-output/planning-artifacts/briefs/brief-E2E_IAM-2026-10-22/brief.md`
- Brief addendum (market research and design principles): `_bmad-output/planning-artifacts/briefs/brief-E2E_IAM-2026-10-22/addendum.md`
