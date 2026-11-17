# User Flows — Mojud core slice

Updated 2026-11-16 to match the built app.

Inputs: the intent statement ("intent-statement"), the scope document ("scope-document") and the intent backlog ("intent-backlog"). Screen codes W1–W14 refer to `wireframes.md`; scenario numbers S01–S08 refer to `design-process/C-UX-Scenarios/`.

## Core Flow (happy path, end to end)

```
[Owner]   W1 Sign up --> W3 Dashboard
              |
              v
          W5 Import from Excel --> W4 Products --> W13 Staff (adds Karim, Nasima, Rafiq)
              |
              v
[Worker]  W2 Sign in --> W3 Dashboard --> W6 Stock in / out (Purchase 40) --> "Saved. Now 52 in stock."
              |
              v
[Worker]  W8 Flag damage (1 bag) --> units move to the Damaged hold; approval waiting
              |
              v
[Supervisor] W10 Approvals --> Approve: write off
              |
              v
[Manager] W7 Stock count (counted 50, record had 52) --> 2 missing, saved
              |
              v
[Owner]   W3 Dashboard --> loss tile --> W9 History (filtered) --> Reverse... --> approval waiting
              |
              v
[Manager] W10 Approvals --> Approve --> opposite Reversal movement recorded
              |
              v
[Owner]   W11 Report --> Download CSV
```

<!-- Text fallback: The Owner signs up and lands on the Dashboard, imports products from Excel, checks the Products list and adds staff. Karim signs in and records a purchase on Stock in / out, then flags a damaged bag. Nasima approves the flag in Approvals and the bag is written off. Rafiq counts the shelf and the missing units are saved. The Owner opens a loss tile on the Dashboard, lands on the filtered History, and asks to reverse a mistaken movement; Rafiq approves it in Approvals. The Owner closes the month with the Report and a CSV download. -->

## Flow 1: Owner sets up the business (S01)

Persona: Mr. Abdul Haque, Owner. Trigger: wants to start using Mojud.

1. W1 Sign up → enters business name, his name, phone number, password → business and Owner account created; lands on W3 Dashboard.
2. W4 Products → Import from Excel (W5) → Download template → fills it in Excel with opening stock → saves as CSV → chooses the file.
3. W5 checks every row and lists problems by row; once clean, "Import 24 products" → "Imported 24 products with 1,250 units of opening stock." → See products.
4. W13 Staff → adds Karim (Warehouse worker), Nasima (Supervisor) and Rafiq (Manager) with phone numbers and passwords → "Karim can now sign in."

Success: products and staff are in place, and opening stock shows on the Dashboard.

Error paths:
- Phone number already registered → "This phone number is already registered" → use another number or sign in.
- Import file with problems → "products.csv has 2 problems. Fix them in Excel and choose the file again." with "Row 7: …" lines; nothing is imported.
- SKU already exists → the import is refused with its row number; nothing is imported.

## Flow 2: Worker records the morning delivery (S02)

Persona: Karim, Warehouse worker. Trigger: a delivery of rice arrives.

1. W2 Sign in → lands on W3 Dashboard.
2. W6 Stock in / out → chooses "Rice 25 kg" ("In stock now: 12 bag") → Stock in → reason Purchase → quantity 40 → Save.
3. Green message: "Saved. Stock in 40 bag of Rice 25 kg. Now 52 bag in stock."

Success: the purchase is a permanent movement with Karim's name, and the Dashboard and History show it.

Error paths:
- Sale of 60 when 52 are in stock → "Only 52 bag in stock."; nothing saved.
- Stock out with reason Damaged by a worker → "Use Flag damage: a supervisor, manager or owner decides it."
- Server error → "Couldn't save. Try again." with what was typed kept.

## Flow 3: Worker flags damage, Supervisor decides (S03)

Personas: Karim, Warehouse worker; Nasima, Supervisor. Trigger: a wet bag of flour is found.

1. Karim: W6 "Found damaged stock? Flag damage" (or Flag damage on the product's row in W4) → W8 with the product chosen, quantity 1 → Flag damage.
2. "Flagged 1 bag of Flour 2 kg (৳120). Waiting for a decision." The bag leaves sellable stock.
3. Nasima: W10 Approvals → Waiting → card "Damage flag · Flour 2 kg · 1 bag · ৳120 · Asked by Karim" → Approve: write off.
4. "Approved: Flour 2 kg." The card moves to Decided.

Success: the write-off is recorded with who flagged it and who approved it.

Error paths:
- Karim opens his own flag → "Waiting for someone else to decide." and no buttons.
- Two people decide at once → the second sees "This was already decided."
- Reject: back to stock → the bag returns to sellable stock.

## Flow 4: Manager counts the shelf (S04)

Persona: Rafiq, Manager. Trigger: routine shelf count.

1. W7 Stock count → chooses "Rice 25 kg" ("Recorded now: 52 bag") → counted quantity 50 → Save count.
2. "Counted 50, record had 52: 2 bag missing (৳4,800). Stock adjusted."

Success: a "Stock count" movement removes 2 bags with Rafiq's name and the note "Counted 50, system had 52."

Error paths:
- Count matches → "Count matches: 52 bag. Nothing changed."

## Flow 5: Owner traces a loss and fixes a mistake (S05)

Personas: Mr. Haque, Owner; Rafiq, Manager.

1. W3 Dashboard → "Losses, last 30 days" → Missing in counts → W9 History filtered to stock counts.
2. In W9 he spots a purchase of 400 that should have been 40 → Reverse… → "Why should it be reversed?" → Ask for reversal.
3. "Reversal asked for. Another owner or manager must approve it."
4. Rafiq: W10 Approvals → Reversal card ("Undo Purchase of …") → Approve.

Success: an opposite "Reversal" movement is recorded and linked to the original; both stay in the history.

Error paths:
- Approving would take stock below zero → refused; the request stays open.
- Stock count and damage-flag rows have no Reverse… action.

## Flow 6: Worker proves his week (S06)

Persona: Karim. W12 My record → Today / Last 7 days / Last 30 days: stock in and out, stock counts with missing and extra, damage flags by outcome, decisions for others. Owners and Managers can choose any person.

## Flow 7: Owner closes the month (S07)

Persona: Mr. Haque. W11 Report → this month by default → per-product start, in, sold, damaged, count +/−, adjusted, end, with taka values and a total line → Download CSV. W4 and W9 also have Download CSV.

Error path: start date after end date → "Choose a start date on or before the end date."

## Flow 8: Worker forgets his password (S08)

1. Karim tells Mr. Haque. Haque: W13 Staff → Reset password for Karim → new password → Set password → "Karim's password is changed. Tell them the new one." Karim is signed out everywhere.
2. Karim: W2 Sign in with the new password → W14 My password → current and new password → Change password → "Password changed. Other phones signed in as you are signed out."

Error path: wrong current password → "Your current password is not correct."

## Information Architecture

```
Public
  +-- W1 Sign up
  +-- W2 Sign in
Signed in (menu order)
  +-- W3 Dashboard (home for every role)
  +-- W4 Products
  |    +-- W5 Import from Excel (Owner, Manager)
  |    +-- W8 Flag damage (from a product row)
  +-- W6 Stock in / out
  |    +-- W8 Flag damage
  +-- W7 Stock count
  +-- W9 History (Reverse... for Owner, Manager)
  +-- W10 Approvals
  +-- W11 Report
  +-- W12 My record
  +-- W13 Staff (Owner only)
  +-- W14 My password
```

## Assumptions & Open Questions

None.
