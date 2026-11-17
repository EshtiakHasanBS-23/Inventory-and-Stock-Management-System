---
title: "Product Brief: Mojud (working name)"
phase: WDS Phase 1 — Product Brief
brief_level: complete
status: complete
created: 2026-10-23
updated: 2026-11-16
seeded_from:
  - _bmad-output/planning-artifacts/briefs/brief-E2E_IAM-2026-10-22/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-E2E_IAM-2026-10-22/addendum.md
  - _bmad-output/planning-artifacts/prds/prd-E2E_IAM-2026-10-22/prd.md
  - _bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/EXPERIENCE.md
  - idea.md
---

# Product Brief: Mojud (working name)

> **Updated 2026-11-16 to match the built app.** This brief now describes only
> what the app in `apps/` does. Requirement IDs (FR-1 … FR-23) refer to the
> as-built specification.

> *Mojud* (মজুদ) means "stock" in Bangla. The name is temporary.

This WDS brief builds on the BMAD brief, PRD and UX documents listed above.
Where those documents go into more detail, this brief links to them instead of
repeating it.

## Strategic Summary

Small Bangladeshi FMCG distributors keep stock in Excel sheets and paper
khatas. A figure gets changed and nobody knows who changed it or why. Damage is
written off quietly. The owner finds the loss at month end, as a shortfall in
taka that nobody can explain.

The root cause is not missing software. **The people who record stock get
nothing back for doing it**, and the owner has no trail to follow when a number
looks wrong.

Mojud is a phone-friendly stock-control web app that fixes this for a business
with one stock location and a handful of staff:

- Every stock change is a permanent record with **who, when, why and the value
  in taka**. Records are never edited or deleted (FR-11), and stock never goes
  below zero (FR-10).
- **Every damage write-off and every correction needs a second person.**
  Workers flag damage; a supervisor, manager or owner who did not raise the flag
  decides it. Mistakes are fixed with an approved reversal, never by editing
  history (FR-13 … FR-16, FR-23).
- The owner gets a **dashboard of stock value and losses in taka**, with each
  loss figure leading to the movements behind it (FR-18, FR-19), plus a monthly
  stock report and Excel (CSV) downloads (FR-20, FR-21).
- Workers get something straight back: a clear "Saved" message with the new
  balance, and **My record**, a view of their own work that protects them from
  blame for gaps they did not cause (FR-22).

## Vision

**"Every loss traced to a person and a reason."**

Mojud is the one shared stock record a small distributor trusts: quick for the
person recording, and clear for the owner checking. It stays a focused
stock-control product.

## Positioning

- **For** owners of small Bangladeshi FMCG distributors and wholesalers with
  one stock location and a handful of staff
- **who** can't trust their stock numbers from a distance and find losses too late,
- **Mojud is** a phone-friendly stock-control web app
- **that** records every stock change permanently and traces every loss to a
  person, a reason and a value in taka,
- **unlike** Excel and paper khatas, which hold one bare number with no trail,
- **because** nothing is ever overwritten, every damage write-off and
  correction needs a second person's approval, and the same record that holds
  staff accountable also proves what they did.

## Client Profile

- **Solo project.** The project owner is also the designer and builder.
  Decisions are made by their own judgement.
- **Internal driver:** learning end-to-end product design and delivery, with the
  intention of building something a real business could actually use.
- **No external sign-off.** There is no contract, client approval or
  procurement gate.

## Target Users

**Decision maker:** the **owner** (persona: Mr. Abdul Haque). They are not on
the floor every day and want *control*: to trust the numbers from a distance
and see where money is lost.

**Daily users** adopt Mojud only if it gives them *relief*. These are the six
roles in the built app (FR-3, FR-4):

| Role | Device | What they do in Mojud | What success feels like |
|---|---|---|---|
| Owner (Haque) | Desk + phone | Signs up the business; adds, deactivates and reactivates staff and resets their passwords; manages and imports products; records stock; writes off damage directly; asks for and decides reversals and damage flags (never their own); sees anyone's record | Sees stock value and losses in taka and can follow any loss to its movements |
| Manager (Rafiq) | Desk + phone | Manages and imports products; records stock and counts; writes off damage directly; asks for and decides reversals and damage flags (never their own); sees anyone's record | Counts are right and mistakes are corrected without editing history |
| Supervisor (Nasima) | Phone | Records stock in/out and counts; flags damage; approves or rejects other people's damage flags in one tap | Clears the approvals list fast, and nobody can approve their own flag |
| Warehouse worker (Karim) | Phone | Records stock in/out and counts; flags damage; sees their own record | Records in seconds and has proof of their own work |
| Sales rep | Phone | Sees products and stock; records stock in/out (for example a sale) and counts; flags damage; sees their own record | Checks what is in stock without calling the warehouse |
| Accountant | Desk | Sees the dashboard, history and report; downloads CSV files; records stock and counts; flags damage | Gets a stock value backed by a movement-by-movement trail |

Everyone can see the dashboard, products, history, report and approvals list,
and everyone can change their own password (FR-5).

Usage context: floor staff are often standing and using a phone with one hand,
so every screen works from 320 px wide, with a bottom tab bar and cards in
place of tables on phones. Full journeys are in the UX scenarios S01 … S08.

## Business Model

**None. This is a free learning project.**

- The app has no pricing, billing or subscription features.
- **Design implication:** no design effort goes into funnels, plans, trials or
  upgrade prompts. Sign-up (FR-1) creates a business and its owner in one step.

## Success Criteria

`[ASSUMPTION]` Adoption targets are provisional until tested with a real business.

**Primary (product proof):** one real distributor replaces Excel or khata with
Mojud for **8 consecutive weeks**.

**Measurable with the built app:**

- **100% of stock changes record who, when, why and the value in taka.** The
  system enforces this: every change is a movement, and the database refuses
  edits and deletes (FR-11).
- **Stock never goes below zero**, including when two people record the last
  unit at the same moment (FR-10).
- **No damage write-off or reversal is decided by the person who asked for
  it**, enforced by the app and the database (FR-16, FR-23).
- **Every loss is traceable in taka:** the dashboard's 30-day loss tiles
  (written off, damage flags, missing in counts) each open the matching
  filtered history (FR-18, FR-19).
- **Losses in counts shrink month on month:** the "Missing in counts" figure
  and the monthly report's "lost" total trend down (FR-18, FR-20).
- **Damage decisions don't pile up:** the dashboard banner shows how many
  requests are waiting and the taka held as damaged (FR-18).
- **Set-up takes one sitting:** a product list of up to 1,000 rows is imported
  from Excel (CSV), with opening stock, in one step (FR-8).
- **Floor adoption:** each worker's activity is visible in My record for the
  last 7 and 30 days (FR-22).
- **Speed:** first load, sign-up and sign-in each take 2 seconds or less
  (NFR-6, checked by the browser smoke test).

## Competitive Landscape

| Alternative | Why it doesn't serve our customer |
|---|---|
| Excel / khata / WhatsApp (status quo) | One bare number, figures can be changed silently, no trail, nobody can trace losses |
| TallyKhata, Hishabee | Built for a single shop's sales and dues, not for tracing stock losses to staff |
| TallyPrime | Accounting-first desktop tool, not built for quick recording on a phone |
| Sokrio, Field Buzz | Sold to brands for field sales, not to small distributors for stock control |
| Odoo / local ERPs | Too heavy and too expensive to implement for a small business |

**Why Mojud wins (positioning, not a moat):** a permanent record that cannot be
overwritten, second-person approval for every write-off and correction, losses
shown in taka, and a record that protects honest workers. The market gap is
`[ASSUMPTION]` until checked with real distributors. Sources: brief addendum A.

## Constraints & Context

- **Team:** solo. Built by one person in small increments.
- **Budget:** none. Free, open tooling only.
- **Platform:** responsive web app in the browser, for desktop and phone,
  working from 320 px wide. No native apps.
- **One stock location** per business.
- **Running:** local only, started with Docker Compose (`npm run up`) or in
  development mode (`npm run dev`). No cloud deployment (NFR-8).
- **Tech stack:** TypeScript throughout; React 18 + Vite frontend, Express 5 +
  PostgreSQL 16 backend, shared zod schemas. DESIGN.md tokens are the source
  of visual truth.
- **Security:** Argon2id passwords, HttpOnly session cookie that ends 12 hours
  after last use, CSRF protection on every change, and every query limited to
  the caller's business (NFR-1, NFR-2).
- **Accessibility:** WCAG 2.1 AA target, checked automatically in light and
  dark themes (NFR-5).

## Platform Strategy

| Surface | Devices | Navigation |
|---|---|---|
| **Phone** | Phones from 320 px | Bottom tab bar; tables shown as cards |
| **Desktop** | Laptop and desktop browsers | Side menu with icons; full tables |

All roles use the same app; the menu shows only what a role may use (the Staff
page appears for the Owner only). Light, dark and device-setting themes are
available. Menu order: Dashboard, Products, Stock in / out, Stock count,
History, Approvals, Report, My record, Staff (Owner), My password.

## Tone of Voice

**Short, plain, calm, and on the worker's side.**

| Attribute | Means | Example from the app |
|---|---|---|
| Plain | Say what happened and the result | "Saved. Stock in 20 bag of Miniket Rice. Now 64 bag in stock." |
| Calm | No alarm, no exclamation marks | "Nothing is waiting for a decision." |
| Protective | No blame words; say who decides next | "Flagged 2 bag of Miniket Rice (৳2,400). Waiting for a decision." |
| Precise | Limits stated in the product's own unit | "Only 3 bag in stock." |
| Fair | Say why an action isn't available | "Use Flag damage: a supervisor, manager or owner decides it." |

Language rules: the interface is in English; Western digits; taka with lakh
grouping (৳12,45,000); product names exactly as entered; dates in Bangladesh
time in downloads (NFR-9). Brand style: DESIGN.md → Brand & Style.

## Not Applicable to This Product

- **SEO and keyword map:** the app sits behind a sign-in, with no public marketing site.
- **Contact strategy:** none.

## Open Questions

- Will staff accept more accountability when it visibly protects them too?
- What security and backup promises do owners need before trusting a new web app?
- Is the market gap real? Needs conversations with real distributors.

---

**Status:** Product Brief Complete (updated to match the built app)
**Next Phase:** Trigger Mapping (Phase 2)
**Last Updated:** 2026-11-16
