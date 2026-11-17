# Personas — Mojud core slice

Updated 2026-11-16 to match the built app.

Four named personas use the built app. Each is drawn from `requirements.md` (FR-1 to FR-23 and the roles table) and the named personas in `design-process/B-Trigger-Map/personas/`. Everyone lands on the Dashboard after signing in and sees the same menu: Dashboard, Products, Stock in / out, Stock count, History, Approvals, Report, My record and My password; the Owner also sees Staff.

## Mr. Abdul Haque — Owner

- **Role:** creates the business at sign-up and has every permission: products, imports, stock, counts, direct damage write-offs, deciding flags and reversals, anyone's record, and Staff (add, deactivate, reactivate, reset passwords).
- **Goals:** trust the stock numbers from a distance; see stock value and losses in taka and where they came from; stop silent write-offs; set up quickly from Excel; control who can do what.
- **Pain points:** losses found too late; write-offs nobody can explain.
- **Tech comfort:** medium; desk computer for setup and the month-end report, phone for quick checks.
- **How he uses Mojud:** signs up (US-01), imports products (US-06), adds staff (US-03), resets a forgotten password (US-04), watches the Dashboard (US-12), searches History and asks for reversals (US-13, US-11), closes the month with the Report and CSV downloads (US-14, US-15).

## Karim — Warehouse worker (primary user)

- **Role:** records stock in and out, counts stock, flags damage; cannot write damage off directly, cannot decide approvals, sees only his own record.
- **Goals:** record work quickly on his phone; know it was saved; have a permanent record with his name that protects him from blame.
- **Pain points:** slow paperwork; being blamed for gaps he did not cause.
- **Tech comfort:** low to medium; phone with the bottom menu.
- **How he uses Mojud:** signs in (US-02), records deliveries and sales (US-07), flags a wet bag (US-09), checks My record (US-16), changes his password (US-04).

## Nasima — Supervisor

- **Role:** records stock and counts like a worker, and decides damage flags raised by others; cannot write damage off directly, cannot ask for or decide reversals.
- **Goals:** clear damage decisions fast; be fair, with a clear view of who asked and a rule that nobody decides their own flag.
- **Pain points:** becoming the bottleneck for the team.
- **Tech comfort:** medium; phone or desk.
- **How she uses Mojud:** approves or rejects flags in one tap in Approvals (US-10); her decisions appear in her record (US-16).

## Rafiq — Manager

- **Role:** manages products and imports, records stock and counts, writes damage off directly, decides damage flags, asks for and approves reversals (never his own), and sees anyone's record. He cannot manage staff.
- **Goals:** keep the catalogue right; keep counts accurate; correct mistakes without editing history.
- **Pain points:** wrong numbers with no trail of who did what.
- **Tech comfort:** medium to high; desk and phone.
- **How he uses Mojud:** adds and edits products (US-05), counts the rice shelf (US-08), approves Haque's reversal (US-11), reviews a worker's record (US-16).

## Other roles

Sales rep and Accountant accounts exist with the same permissions as a Warehouse worker: they see everything, record stock and counts, flag damage and see their own record. An Accountant uses the Report and CSV downloads (US-14, US-15).

## Relationships and Priority

| Priority | Persona | Why |
|---|---|---|
| 1 | Karim (Warehouse worker) | Most stock changes start with him; the record is only as good as his recording |
| 2 | Mr. Haque (Owner) | Creates the business and staff; the dashboard and losses answer his questions |
| 3 | Nasima (Supervisor) | The second person on every damage flag |
| 4 | Rafiq (Manager) | Keeps products and counts right; the second person on reversals |

Haque creates the business and adds Karim, Nasima and Rafiq. Karim records stock and flags damage; Nasima (or Rafiq or Haque) decides the flag. Haque or Rafiq asks for a reversal and the other approves it. Everyone's work shows in History and in each person's record.

## Assumptions & Open Questions

None.
