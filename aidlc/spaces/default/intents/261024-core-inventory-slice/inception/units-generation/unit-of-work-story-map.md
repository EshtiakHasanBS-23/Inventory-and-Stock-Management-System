# Unit of Work Story Map — Mojud core slice

Updated 2026-11-16. Maps the sixteen stories in `inception/user-stories/stories.md` to the units in `unit-of-work.md`. Where a story grew over several units, the first unit delivered its core and later units extended it; the story was complete after the last unit listed.

| Story | Requirements | Unit(s) | What each unit added |
|---|---|---|---|
| US-01 Sign up a business | FR-1 | U1 | Sign-up form, business and Owner, session |
| US-02 Sign in and out | FR-2 | U1, U4 | U1: sign in, sign out, sessions, CSRF; U4: phone layout of the shell (deactivated sign-in refusal came with U3) |
| US-03 Manage staff | FR-3, FR-4 | U3 | Staff page and endpoints, deactivate and reactivate |
| US-04 Passwords | FR-5 | U4 | My password; Owner reset on Staff |
| US-05 Manage and find products | FR-6, FR-7, FR-17 | U2, U3 | U2: create, edit, search, status; U3: unit cost and stock value (U6 added the damaged column) |
| US-06 Import products from Excel | FR-8 | U5 | Template, browser checks, all-or-nothing import, opening stock |
| US-07 Record stock in and out | FR-9, FR-10, FR-11, FR-23 | U2, U6 | U2: stock in and out, never negative, append-only ledger; U6: direct damage only for Owner and Manager |
| US-08 Count stock | FR-12 | U3 | Stock count page and `count` movements |
| US-09 Flag damage | FR-13 | U6 | Flag damage page, damaged hold |
| US-10 Decide damage flags | FR-14, FR-16, FR-23 | U6 | Approvals inbox, approve and reject |
| US-11 Reverse a mistake | FR-15, FR-16 | U6 | Reverse… on History, reversal approvals |
| US-12 See the dashboard and trace losses | FR-18, FR-17 | U2, U3, U6 | U2: totals and recent movements; U3: value and 30-day losses; U6: loss split, links, banner |
| US-13 Search the history | FR-19 | U2, U4, U6 | U2: list; U4: filters in the address, Load more; U6: Reverse… action |
| US-14 Monthly stock report | FR-20 | U5 | Report page and endpoint |
| US-15 Download CSV | FR-21 | U5 | Products, history and report CSV |
| US-16 My record | FR-22 | U6 | My record page and endpoint |

## By unit

| Unit | Stories |
|---|---|
| U1 Walking skeleton | US-01, US-02 |
| U2 Stock core | US-05, US-07, US-12, US-13 |
| U3 Value, count, staff | US-03, US-05, US-08, US-12 |
| U4 Phone layout, passwords, history filters | US-02, US-04, US-13 |
| U5 Import, export, report | US-06, US-14, US-15 |
| U6 UI refresh and accountability | US-07, US-09, US-10, US-11, US-12, US-13, US-16 |

Every story US-01 to US-16 is mapped to at least one unit. The machine-readable form is `traceability.json`.

## Assumptions & Open Questions

None.
