# Wireframes — Mojud core slice (rough)

Updated 2026-11-16 to match the built app.

Inputs: the intent statement (`ideation/intent-capture/intent-statement.md`, "intent-statement"), the scope document (`ideation/scope-definition/scope-document.md`, "scope-document") and the intent backlog (`ideation/scope-definition/intent-backlog.md`, "intent-backlog"), plus the answers in `rough-mockups-questions.md`.

## How to Read This

These rough wireframes show the real screens of the built app, one per address, using the words the screens actually show. Look and feel come from the design system (`design-process/D-Design-System/`); page-level detail comes from the UX scenarios (`design-process/C-UX-Scenarios/`, S01–S08).

Common to every screen:

| Rule | Detail |
|---|---|
| Phone and desktop | Every screen works from 320 px wide. Desktop has a side menu with icons; phones have a bottom tab bar. Tables become cards on phones. |
| Themes | Light, dark and "Device" (follows the phone or computer), chosen in the top bar. |
| Language and money | English; taka with lakh grouping, for example ৳12,45,000. |
| Saved messages | A green message confirms each save and repeats the new figure. |
| Refusals | Shown in plain words next to the form, for example "Only 52 bag in stock." |
| Accessibility | WCAG 2.1 AA target; skip link first; visible focus; state shown by icon and text, never colour alone. |

## App Shell (all signed-in screens)

```
+--------------------------------------------------------------------------+
| [logo] Mojud   Haque Traders         (H) Karim                           |
|                                          Warehouse worker                |
|                                      Online  [Theme: Light v] [Sign out] |
+----------------+---------------------------------------------------------+
| Dashboard      |                                                         |
| Products       |   page title (h1)                                       |
| Stock in / out |   short subtitle                                        |
| Stock count    |                                                         |
| History        |   main content                                          |
| Approvals      |                                                         |
| Report         |                                                         |
| My record      |                                                         |
| Staff (Owner)  |                                                         |
| My password    |                                                         |
+----------------+---------------------------------------------------------+
Phone: the side menu becomes a bottom tab bar that scrolls sideways.
```

Every role sees the same menu, except Staff, which only the Owner sees. Every role lands on the Dashboard after signing in.

## W1. Sign up (/signup, S01 page 01.1)

```
+--------------------------------------------------------------+
| Mojud                                                        |
|            +--------------------------------------+          |
|            | Create your business (h1)            |          |
|            | Business name  [                   ] |          |
|            | Your name      [                   ] |          |
|            | Phone number   [                   ] |          |
|            |   You sign in with this number.      |          |
|            | Password       [               ][Show]|         |
|            |   At least 8 characters.             |          |
|            | [ Create business ]                  |          |
|            | Already have an account? Sign in     |          |
|            +--------------------------------------+          |
+--------------------------------------------------------------+
```

States: field errors under each field with a summary ("2 fields need fixing:"); "This phone number is already registered"; "Couldn't save. Try again."; button shows "Saving…" while saving. Success opens the Dashboard.

## W2. Sign in (/signin, S02 page 02.1)

```
+--------------------------------------------------------------+
| Mojud                                                        |
|            +--------------------------------------+          |
|            | Sign in (h1)                         |          |
|            | Phone number   [                   ] |          |
|            | Password       [               ][Show]|         |
|            | [ Sign in ]                          |          |
|            | New business? Create one             |          |
|            +--------------------------------------+          |
+--------------------------------------------------------------+
```

States: "Sign-in details are not correct." (never says which field); "This account is deactivated."; "Your session ended. Sign in again." after 12 hours unused. Success returns to the page first asked for, or the Dashboard.

## W3. Dashboard (/dashboard, S05 page 05.1)

```
+----------------+---------------------------------------------------------+
| (menu)         | Dashboard (h1)                                          |
|                | Your stock and money at a glance.                       |
|                | +-----------------------------------------------------+ |
|                | | ! 2 requests waiting for approval                    | |
|                | |   ৳240 held as damaged, waiting for a decision  [->] | |
|                | +-----------------------------------------------------+ |
|                | +------------------------+ +--------------------------+ |
|                | | Stock value            | | Losses, last 30 days     | |
|                | | ৳12,45,000             | | ৳9,600                   | |
|                | | 1,250 units across     | |  Written off      ৳2,400 >| |
|                | | 24 products            | |  Damage flags       ৳240 >| |
|                | +------------------------+ |  Missing in counts ৳6,960 >| |
|                |                            +--------------------------+ |
|                | [Low stock 3] [Out of stock 1] [Products 24] [Units 1,250]|
|                |                                                         |
|                | Needs restocking (h2)                                   |
|                |  Sugar 1 kg   0 pcs (min 20)   [Out]      [Stock in]    |
|                |  Rice 25 kg   8 bag (min 10)   [Low]      [Stock in]    |
|                |                                                         |
|                | Recent movements (h2)                                   |
|                |  (last 10 movements, same columns as History)           |
+----------------+---------------------------------------------------------+
```

States: "Every product is above its minimum stock." when nothing needs restocking; no banner when nothing is waiting. Each loss line opens History filtered to that reason.

## W4. Products (/products, S01 page 01.3)

```
+----------------+---------------------------------------------------------+
| (menu)         | Products (h1)        [Import from Excel] [Download CSV] |
|                | Everything you stock, with what it is worth.            |
|                | +-----------------------------------------------------+ |
|                | | Add a product (h2)            (Owner, Manager only)  | |
|                | | SKU [     ] Name [            ] Unit [    ]          | |
|                | |   For example pcs, ctn or bag.                       | |
|                | | Minimum stock [   ]  Unit cost (৳) [      ]          | |
|                | | [ Add product ]                                      | |
|                | +-----------------------------------------------------+ |
|                | Search by name or SKU [              ]     24 products  |
|                | Product            In stock  Min  Unit cost  Value  Status  Actions        |
|                | RICE25 Rice 25 kg  52 bag    10   ৳2,400  ৳1,24,800 [OK] |
|                |   [Stock in / out] [Flag damage] [History] [Edit]       |
|                | FLR2 Flour 2 kg    18 bag    20   ৳120    ৳2,160   [Low] |
|                |   1 held as damaged                                     |
+----------------+---------------------------------------------------------+
```

States: Edit fills the form as "Edit RICE25" with Save changes and Cancel (SKU fixed); "No products yet."; "No products match this search."; status pills OK, Low, Out with icons.

## W5. Import from Excel (/products/import, S01 page 01.2)

```
+----------------+---------------------------------------------------------+
| (menu)         | Import from Excel (h1)                                  |
|                | 1. Fill in your products in Excel, using the template:  |
|                |    [Download template]                                  |
|                | 2. Save the sheet as "CSV UTF-8".                       |
|                | 3. Choose the file below, check the preview, then import.|
|                | CSV file [ Choose file ]                                |
|                |                                                         |
|                | 24 products are ready to import.                        |
|                | SKU    Name         Unit  Unit cost  Min  Opening stock |
|                | RICE25 Rice 25 kg   bag   2,400      10   12            |
|                | …and 19 more.                                           |
|                | [ Import 24 products ]                                  |
+----------------+---------------------------------------------------------+
```

States: "products.csv has 2 problems. Fix them in Excel and choose the file again." with "Row 7: …" lines and no Import button; after import, "Imported 24 products with 1,250 units of opening stock." and See products. Owner and Manager only.

## W6. Stock in / out (/stock, S02 page 02.2)

```
+----------------+---------------------------------------------------------+
| (menu)         | Stock in / out (h1)                                     |
|                | Found damaged stock? Flag damage                        |
|                | Product [ Rice 25 kg                     v ]            |
|                |   In stock now: 12 bag                                  |
|                | Direction                                               |
|                | +-----------------------+ +-----------------------+     |
|                | | (in)  Stock in        | | (out) Stock out       |     |
|                | | Purchase, return or   | | Sale, damage or       |     |
|                | | adjustment            | | adjustment            |     |
|                | +-----------------------+ +-----------------------+     |
|                | Reason   [ Purchase v ]                                 |
|                | Quantity [ 40 ]                                         |
|                | Note (optional) [                         ]             |
|                | [ Save ]                                                |
|                | (ok) Saved. Stock in 40 bag of Rice 25 kg.              |
|                |      Now 52 bag in stock.                               |
+----------------+---------------------------------------------------------+
```

Reasons: Stock in — Purchase, Customer return, Count adjustment. Stock out — Sale, Damaged (Owner and Manager only), Count adjustment. States: "Only 52 bag in stock."; "Use Flag damage: a supervisor, manager or owner decides it."; "There are no products yet. Add products first."

## W7. Stock count (/count, S04 page 04.1)

```
+----------------+---------------------------------------------------------+
| (menu)         | Stock count (h1)                                        |
|                | Count what is on the shelf. Any difference from the     |
|                | record is saved as a stock count, with your name.       |
|                | Product [ Rice 25 kg                     v ]            |
|                |   Recorded now: 52 bag                                  |
|                | Counted quantity [ 50 ]                                 |
|                | Note (optional)  [                       ]              |
|                | [ Save count ]                                          |
|                | Counted 50, record had 52: 2 bag missing (৳4,800).      |
|                | Stock adjusted.                                         |
+----------------+---------------------------------------------------------+
```

States: "Count matches: 52 bag. Nothing changed."; "Counted 55, record had 52: 3 bag extra. Stock adjusted."

## W8. Flag damage (/damage, S03 page 03.1)

```
+----------------+---------------------------------------------------------+
| (menu)         | Flag damage (h1)                                        |
|                | Flag stock that is damaged or expired. It leaves the    |
|                | sellable stock now, and a supervisor, manager or owner  |
|                | approves or rejects it.                                 |
|                | Product [ Flour 2 kg                     v ]            |
|                |   In stock now: 18 bag                                  |
|                | Damaged quantity [ 1 ]                                  |
|                | Note (optional)  [ wet bag               ]              |
|                | [ Flag damage ]                                         |
|                | Flagged 1 bag of Flour 2 kg (৳120). Waiting for a       |
|                | decision.                                               |
+----------------+---------------------------------------------------------+
```

Opened from Stock in / out or from a product row, with the product already chosen. States: cannot flag more than is in stock ("Only 18 bag in stock.").

## W9. History (/history, S05 page 05.2)

```
+----------------+---------------------------------------------------------+
| (menu)         | History (h1)                                            |
|                | Product [All products v] Reason [All reasons v]         |
|                | By [Everyone v]  From [ date ]  To [ date ]             |
|                | [Download CSV]  [Clear filters]                         |
|                | When         Product     Change  Value   Reason   Balance after  By     |
|                | 16 Nov 09:12 Rice 25 kg  +400    ৳9,60,000 Purchase  452  Karim |
|                |                                            [Reverse…]   |
|                | 15 Nov 17:40 Rice 25 kg  −2      ৳4,800  Stock count     |
|                |              Counted 50, system had 52.   50     Rafiq  |
|                | [ Load more ]                                           |
+----------------+---------------------------------------------------------+
```

Reverse… (Owner and Manager, on reversible rows) opens "Ask to reverse this movement" with "Why should it be reversed?" and Ask for reversal / Cancel, then "Reversal asked for. Another owner or manager must approve it." Filters stay in the address so a view can be shared. States: "No stock movements yet."

## W10. Approvals (/approvals, S03 page 03.2)

```
+----------------+---------------------------------------------------------+
| (menu)         | Approvals (h1)                                          |
|                | Damage flags and reversals need a second person. You    |
|                | can never decide your own request.                      |
|                | [ Waiting ] [ Decided ]                                 |
|                | +-----------------------------------------------------+ |
|                | | Damage flag   Flour 2 kg   1 bag   ৳120              | |
|                | | wet bag                                             | |
|                | | Asked by Karim · 16 Nov 08:30                       | |
|                | | [ Approve: write off ]  [ Reject: back to stock ]   | |
|                | +-----------------------------------------------------+ |
|                | +-----------------------------------------------------+ |
|                | | Reversal   Rice 25 kg   400 bag                      | |
|                | | Undo Purchase of 16 Nov 09:12                       | |
|                | | Asked by Mr. Haque · 16 Nov 10:05                   | |
|                | | [ Approve ]  [ Reject ]                             | |
|                | +-----------------------------------------------------+ |
+----------------+---------------------------------------------------------+
```

States: "Waiting for someone else to decide." instead of buttons for the person who asked or a role that cannot decide; "Approved: Flour 2 kg."; "This was already decided."; Decided cards show "Approved by Nasima · time"; "Nothing is waiting for a decision."

## W11. Report (/reports, S07 page 07.1)

```
+----------------+---------------------------------------------------------+
| (menu)         | Report (h1)                                             |
|                | From [ 1 Nov ]  To [ 30 Nov ]            [Download CSV] |
|                | [Received ৳3,20,000] [Sold ৳2,90,000]                   |
|                | [Lost (damage and missing) ৳9,600]                      |
|                | Product     Start  In   Sold  Damaged  Count +/-  Adjusted  End |
|                | Rice 25 kg  12     40   0     0        −2         0        50   |
|                | Flour 2 kg  20     0    1     1        0          0        18   |
|                | Total       …                                           |
+----------------+---------------------------------------------------------+
```

States: this month by default; "Choose a start date on or before the end date."; "No stock in this period." Values are in taka at the cost of the time.

## W12. My record (/record, S06 page 06.1)

```
+----------------+---------------------------------------------------------+
| (menu)         | My record (h1)                                          |
|                | Your own work, as proof of what you did.                |
|                | Person [ Me v ]              (Owner, Manager only)      |
|                | +-------------+ +-------------+ +-------------+         |
|                | | Today       | | Last 7 days | | Last 30 days|         |
|                | | Stock in and out: 3 · 40 in · 5 out          |         |
|                | | Stock counts: 1 · 2 missing · 0 extra        |         |
|                | | Damage flags: 1 approved · 0 rejected · 0 waiting |    |
|                | | Decisions for others: 0                      |         |
|                | +-------------+ +-------------+ +-------------+         |
+----------------+---------------------------------------------------------+
```

"Today" is in Bangladesh time.

## W13. Staff (/staff, S01 page 01.4 and S08 page 08.1; Owner only)

```
+----------------+---------------------------------------------------------+
| (menu)         | Staff (h1)                                              |
|                | Add the people who work with you, and choose what each  |
|                | can do.                                                 |
|                | +-----------------------------------------------------+ |
|                | | Add a staff member (h2)                             | |
|                | | Name [        ]  Phone number [          ]          | |
|                | |   They sign in with this number.                    | |
|                | | Password [          ][Show]  Role [Warehouse worker v]| |
|                | | [ Add staff member ]                                | |
|                | +-----------------------------------------------------+ |
|                | Your team (h2)                              4 people    |
|                | Name        Phone        Role              Status   Actions |
|                | Mr. Haque   01711…       Owner             Active   That's you |
|                | Karim       01811…       Warehouse worker  Active          |
|                |                     [Reset password] [Deactivate]        |
|                | Nasima      01911…       Supervisor        Active          |
+----------------+---------------------------------------------------------+
```

Reset password opens "New password for Karim" with "Tell them the new password. They are signed out everywhere and sign in with it." and Set password / Cancel. States: "Karim can now sign in."; "This phone number is already registered"; "Karim's password is changed. Tell them the new one."; Deactivated people show Reactivate.

## W14. My password (/account, S08 page 08.2)

```
+----------------+---------------------------------------------------------+
| (menu)         | My password (h1)                                        |
|                | Current password [            ][Show]                   |
|                | New password     [            ][Show]                   |
|                |   At least 8 characters.                                |
|                | [ Change password ]                                     |
+----------------+---------------------------------------------------------+
```

States: "Password changed. Other phones signed in as you are signed out."; "Your current password is not correct."

## Assumptions & Open Questions

None.
