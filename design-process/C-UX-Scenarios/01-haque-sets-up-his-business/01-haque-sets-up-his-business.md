# 01: Haque Sets Up His Business

**Project:** Mojud
**Updated:** 2026-11-16 (as built)
**Method:** Whiteport Design Studio (WDS)
**Priority:** P2
**Status:** ✅ Built

---

## Transaction (Q1)

Create the business, load the product list with opening stock from Excel, check it, and add the staff who will record stock.

## Business Goal (Q2)

A distributor can replace his Excel sheet and khata with Mojud in one sitting, so every stock change from day one records who, when, why and value.

## User & Situation (Q3)

**Persona:** [Mr. Abdul Haque, Owner](../../B-Trigger-Map/personas/03-Haque-the-Owner.md)
**Situation:** Sunday evening at his desk. He keeps about 60 products in an Excel sheet with prices and what is on the shelf. Tomorrow morning Karim and Nasima should start recording in Mojud.

## Driving Forces (Q4)

**Hope:** Set up quickly from the sheet he already has; decide who can do what.
**Worry:** Typing 60 products by hand; staff being able to write stock off without him knowing.

## Device & Starting Point (Q5 + Q6)

**Device:** Desktop browser (laptop).
**Entry:** Opens Mojud for the first time and lands on Sign in, then follows "New business? Create one" to `/signup`.

## Best Outcome (Q7)

**User success:** His business exists, 60 products show with stock, value and status, and Karim (Warehouse worker), Nasima (Supervisor) and Rafiq (Manager) can sign in.
**Business success:** Opening stock is recorded as "Opening stock" movements under his name, so the record is complete from the first day.

## Shortest Path (Q8)

1. **Sign up (01.1):** enters business name, his name, phone number and password; "Create business". He is signed in and lands on the Dashboard.
2. **Products (01.3) → Import from Excel (01.2):** "Download template", fills it in Excel, saves as "CSV UTF-8", chooses the file. The preview says "60 products are ready to import."; he presses "Import 60 products" and sees "Imported 60 products with 1,240 units of opening stock. See products".
3. **Products (01.3):** checks the list: in stock, minimum stock, unit cost, value and an OK / Low / Out pill per product. Corrects one unit cost with "Edit" → "Save changes".
4. **Staff (01.4):** adds Karim (Warehouse worker), Nasima (Supervisor) and Rafiq (Manager) with phone numbers and starting passwords; each time sees "<name> can now sign in." ✓

## Scenario Steps

| Step | Folder | Purpose | Exit action |
|------|--------|---------|-------------|
| 01.1 | `01.1-sign-up/` | Create the business and the Owner account | "Create business" → Dashboard |
| 01.2 | `01.2-import-products/` | Import products and opening stock from CSV | "Import N products" → "See products" |
| 01.3 | `01.3-products/` | Check, search, add and edit products | Menu → Staff |
| 01.4 | `01.4-staff/` | Add staff with roles | "Add staff member" for each person |

## Stories and Requirements Covered

| Story | Requirements |
|---|---|
| US-01 Sign up a business | FR-1 |
| US-06 Import products from Excel | FR-8 |
| US-05 Manage and find products | FR-6, FR-7, FR-17 |
| US-03 Manage staff | FR-3, FR-4 |

## Trigger Map Connections

- ✅ **Want (Haque):** set up quickly (Excel import); control who does what (staff, roles).
- ❌ **Fear (Haque):** unexplained write-offs: roles decide who may write off directly (see [DD-1](../00-design-decisions.md)).
