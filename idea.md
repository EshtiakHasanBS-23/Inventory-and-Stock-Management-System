# Idea: Inventory and Stock Management System

## 1. Vision

Build a simple, reliable stock-keeping system for small distribution
businesses. It should replace notebooks and spreadsheets with one place where
the owner and staff can see what is in stock, what it is worth, and who changed
it, when and why.

The first version should focus on getting the stock numbers right and making
every change traceable, rather than covering every possible inventory feature.

## 2. The Problem

Small distributors often keep stock in notebooks or spreadsheets, and the
numbers slowly drift away from what is really on the shelf.

Common problems include:

- **Wrong stock levels:** the record does not match the physical stock.
- **Late restocking:** products run out because nobody noticed they were low.
- **Unexplained losses:** stock goes missing or is written off as damaged, and
  nobody can say who did it or why.
- **No history:** it is hard to find out when, why and by whom stock was added,
  removed or corrected.
- **Weak accountability:** one person can change the numbers with no check
  from anyone else.
- **Slow reporting:** working out stock value and monthly movement takes hours
  by hand.

These problems lead to lost sales, hidden losses and arguments about whose
numbers are right.

## 3. Proposed Solution

A system that keeps a permanent record of every stock change and works out the
current stock, its value and any losses from that record.

Authorized users should be able to:

1. Set up their business and add the people who work with them.
2. Keep a list of products with a code, unit, cost and minimum stock level.
3. Record stock coming in and going out, always with a reason.
4. Count the physical stock and record any difference from the system.
5. Report damaged or expired stock, with someone else deciding whether to
   accept it.
6. See the full history of stock changes and who made them.
7. See at a glance what is low, what is out of stock, what the stock is worth
   and what has been lost.
8. Get a simple monthly report of stock received, sold and lost.

## 4. Target Users

- **Business owners:** want to know what the stock is worth, what is being
  lost, and who is doing what.
- **Managers:** look after the product list and the stock, and check losses.
- **Supervisors:** keep an eye on the floor and confirm damage reports.
- **Warehouse workers:** receive, count and send out stock.
- **Sales staff:** need to know what is available and record what goes out.
- **Accountants:** need stock value and monthly movement figures.

Each kind of user should only be able to do what their job needs.

## 5. Core Capabilities

### 5.1 Business and People

- An owner creates the business and their own account.
- The owner adds staff and gives each one a role.
- The owner can reset a staff member's password or stop them from signing in.
- Everyone can change their own password.

### 5.2 Products

- Add, edit and search products.
- Give each product a unique code (SKU), a name, a unit such as pieces, cartons
  or bags, a cost and a minimum stock level.
- Bring in an existing product list from a spreadsheet, including the stock
  already on hand.

### 5.3 Stock In and Out

- Record stock coming in, for example from a purchase or a customer return.
- Record stock going out, for example for a sale, damage or a correction.
- Every change should say who made it, when, why, and what the stock was
  afterwards.
- Stock should never be allowed to go below zero.
- Past records should never be edited or deleted; mistakes should be fixed by
  recording a new change.

### 5.4 Stock Counts

- Let staff count what is on the shelf and enter the number.
- If the count differs from the record, save the difference as its own change
  so missing stock is visible.

### 5.5 Damage and Corrections

- Anyone should be able to report damaged or expired stock.
- Someone in a senior role should approve or reject the report.
- Undoing a past change should also need a second person's approval.
- Nobody should be able to approve their own request.

### 5.6 History and Accountability

- Show the full history of stock changes, filterable by product, reason,
  person and date.
- Let each person see their own record of changes.
- Allow the history to be downloaded.

### 5.7 Dashboard and Report

Dashboard information should include:

- Number of products and total units in stock.
- Total stock value.
- Low-stock and out-of-stock products that need restocking.
- Recent stock changes.
- Requests waiting for approval.
- Losses over the last month (damage and stock missing in counts).

A monthly report should show, for each product, the stock at the start, what
came in, what was sold, what was lost or corrected, and the stock at the end,
with an option to download it.

## 6. Guiding Principles

1. **Accuracy first:** the record should match the shelf and never go
   negative.
2. **Nothing changes silently:** every change is kept as part of the history.
3. **Two people for losses:** losses and corrections need a second person.
4. **Simple workflows:** common tasks should take as few steps as possible.
5. **Clear visibility:** what is low, lost and worth money should be obvious.
6. **Controlled access:** each role can only do what it needs.
7. **Easy to use:** people who are not technical should understand it quickly,
   on a phone or a computer.

## 7. Potential Business Value

- Fewer unexplained stock losses.
- Fewer products running out unnoticed.
- Clear accountability for every stock change.
- Less time spent on manual stock records and reports.
- A clear picture of how much money is tied up in stock.

## 8. Success Criteria

- Stock levels always match the history of changes and never go below zero.
- Every stock change has a person, time and reason.
- Every loss is visible with its value.
- No damage report or correction is approved by the person who asked for it.
- An owner can see stock value, low stock and losses without building a
  spreadsheet.

### Desired Outcome

Agree on a clear product direction, confirm the target customer and their
needs, prioritise the most important capabilities, and record the assumptions
and constraints that will shape the requirements.

**End of idea document.**
