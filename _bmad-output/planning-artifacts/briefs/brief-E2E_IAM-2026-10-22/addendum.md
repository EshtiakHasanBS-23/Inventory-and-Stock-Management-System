---
title: "Addendum: Inventory and Stock Control for Bangladeshi FMCG Distributors"
created: 2026-10-22
updated: 2026-11-16
---

# Addendum: Inventory and Stock Control for Bangladeshi FMCG Distributors

> **Updated 2026-11-16 to match the built app.** Only research and principles
> that support the built scope are kept. Requirement IDs (FR-1 … FR-23) refer
> to the as-built specification.

This addendum holds detail that supports the brief but is too deep for it.

## A. Competitive and market landscape (desk research, Oct 2026)

Figures are as reported by the sources and have not been checked with vendors or distributors.

### Existing tools

| Tool | What it is | Relevance to our customer |
|---|---|---|
| TallyKhata (Progoti Systems) | Bangla digital khata for shops: sales, purchases, stock, expenses, QR payments. Claims 1M+ MAU and 1 crore (10 million) downloads. | Shop-level bookkeeping, not a staff-level loss trail. |
| Hishabee | Smartphone "digital manager": sales, inventory, dues, online selling. No public pricing. | Shop-level. |
| TallyPrime (Tally Solutions) | Desktop accounting with stock entries. | Accounting-first, not built for quick recording on a phone. |
| Sokrio | Dhaka-based distributor management system (DMS) for FMCG brands: sales force, orders, inventory. Seed funding from BVCL (2024). | Sold to brands, not to small distributors. |
| Field Buzz | Mobile software for FMCG field agents' orders, deliveries and credit. | Field sales, not stock control. |
| Generic local packages (BDStall listings) | Distribution management roughly ৳12,500–55,000 one-time. | Desktop or ERP style. |
| Odoo partners (Metamorphosis, Brain Station 23, BJIT, Bdcalling, Xsellence) | ERP implementation projects. | Much heavier than a small distributor needs. |

**Gap pattern (inference):** available tools are either shop-level khata apps or
brand-side DMS/ERP. No tool was found that keeps a permanent stock record with
second-person approval for write-offs and corrections and shows losses in taka
for a small distributor.

### Segment size

- No authoritative count of FMCG distributors in Bangladesh was found. This is the biggest evidence gap.
- There are about 2M micro-merchant retailers, mostly cash-based (UNCDF).
- Innovision (2025) reports that many FMCG firms still rely on manual reporting and fragmented inventory tracking.
- Mokam/ShopUp reports 200+ distribution centres (company claim).

### Phone use

- 72.4% of households own a smartphone: 80.8% urban, 68.8% rural (BBS FY2024-25).
- 59.2% of individuals use the internet and 65.6% own a mobile phone (BBS, Apr–Jun 2026).
- Individual smartphone use is 41% urban and 26% rural (GSMA 2024).
- Implication: staff may use small or shared phones, which supports a layout
  that works from 320 px wide and a sign-out that ends the session at once (FR-2).

### To verify with primary research

- Number of FMCG distributors in the target segment (one stock location, a handful of staff)
- Whether any local tool offers a staff-level loss trail with second-person approval

### Sources

- https://www.tallykhata.com/en/home-eng/
- https://blog.hishabee.io/?p=327
- https://tallysolutions.com/bd/en/inventory-management-software
- https://startupbangladesh.vc/?p=20673
- https://www.gsma.com/mobilefordevelopment/wp-content/uploads/2020/05/Field-Buzz-Deploying-mobile-technology-to-manage-last-mile-distribution-and-operations-in-Bangladesh.pdf
- https://www.bdstall.com/details/distribution-management-software-with-powerful-inventory-19299/
- https://www.uncdf.org/article/7065/digital-transformations-of-fast-moving-consumer-goods-fmcg-supply-chain-operations-and-payments-in-bangladesh-challenges-opportunities-and-way-forward
- https://innovision-bd.com/reports/digital-transformation-of-fmcg-supply-chain-operations-and-payments-in-bangladesh
- https://futurestartup.com/?p=32707
- https://www.dhakatribune.com/business/420730/bbs-survey-66%25-of-population-own-a-mobile-phone
- https://meatechwatch.com/2025/12/22/steady-rise-in-internet-use-across-bangladesh-bbs-survey-shows/
- https://www.tbsnews.net/node/1013061

## B. Design principles (as built)

1. **Every change is a permanent movement.** Who, when, why, quantity, balance
   after and unit cost at that moment are kept; the database refuses edits and
   deletes (FR-11).
2. **Stock never goes below zero**, enforced in one database transaction (FR-10).
3. **Mistakes are reversed, never edited.** A reversal is an opposite movement
   linked to the original and approved by a second person (FR-15).
4. **Every figure has its value in taka**, at the cost of its moment, so past
   losses keep their value (FR-17).
5. **Every record gives the person recording it something back straight away:**
   a saved message with the new balance, and My record (FR-9, FR-22).
6. **Segregation of duties:** floor staff flag damage instead of writing it off,
   and nobody decides their own damage flag or reversal (FR-14, FR-16, FR-23).
7. **Every figure shown to the owner can be traced back to evidence:** each
   loss tile opens the filtered movement history (FR-18, FR-19).
8. **Protect honest workers:** the same record that holds people accountable
   also proves what they did.
