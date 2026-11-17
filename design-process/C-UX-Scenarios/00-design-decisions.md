# Cross-Cutting Design Decisions: Mojud

> Decisions that apply to every page spec and are visible in the built app
> (rewritten 2026-11-16 to match the build). Where a page spec and this file
> disagree, this file wins.

| ID | Decision | Where it shows | Applies to |
|---|---|---|---|
| DD-1 | **A second person decides every damage write-off by a non-manager and every reversal.** Anyone flags damage; a Supervisor, Manager or Owner who did not raise the flag approves or rejects it. Only an Owner or Manager asks for a reversal, and a different Owner or Manager decides it. Nobody decides their own request (checked in the API and by a database rule). | "Damaged" reason offered only to Owner and Manager; "Waiting for someone else to decide." on your own request | 02.2, 03.1, 03.2, 05.2 |
| DD-2 | **The stock record is append-only.** Every change is a movement with who, when, why, quantity, balance after and value in taka. The database refuses any update or delete of a movement. Mistakes are corrected by a linked "Reversal" movement, never by editing. Stock counts and damage-flag movements cannot be reversed. | History has no edit action, only "Reverse…" | 02.2, 03.1, 04.1, 05.2 |
| DD-3 | **Stock never goes below zero.** A change that would is refused with "Only N <unit> in stock." under the quantity box. | Stock in / out, Flag damage, reversal approval | 02.2, 03.1, 03.2 |
| DD-4 | **Money in taka, counted in poisha.** Values show as taka with lakh grouping (৳12,45,000; up to 2 decimals). Each movement keeps the unit cost of its moment, so past losses keep their value. | Every value cell, tile and message | all |
| DD-5 | **Hints sit below the input, then the error.** Label above, box, hint, then the refusal message, all linked with `aria-describedby`; boxes in one form row line up. After a failed submit, the server's message appears under the field it names (or at the top of the form when it names none). On Sign up, an error summary at the top takes focus and links to each field; on the other forms focus stays where it was. | All forms | all forms |
| DD-6 | **One saved message per action.** A green box with a check mark (`role="status"`) above the form says what was saved and the new balance or outcome. A count that found missing stock uses the amber variant. | `*-saved` testids | all forms |
| DD-7 | **Desktop side menu, phone bottom tab bar, cards on phones.** Below 1024 px the menu becomes a bottom tab bar that scrolls sideways; below 700 px the Products and Staff tables become one card per row with a label beside each value. Other tables scroll sideways. Works from 320 px. | Shared frame | all signed-in pages |
| DD-8 | **State is never shown by colour alone.** Status pills carry an icon and a word: "OK" (check), "Low" (alert), "Out" (cross); "Active" / "Deactivated"; "Approved" / "Rejected". | Products, Dashboard, Staff, Approvals | all |
| DD-9 | **English UI.** All copy lives in `apps/web/src/i18n/en.json`; Western digits. | all | all |
| DD-10 | **Light, dark and device themes.** "Theme" switch in the app bar (Light, Dark, Device). Every text colour pair meets 4.5:1 in both themes (tested). | App bar | all |
| DD-11 | **Gentle motion only when allowed.** Fade and slide-in on cards, count-up figures on the dashboard and the button spinner are switched off when the device asks for reduced motion; figures then show their final value at once. | Dashboard, toasts, buttons | all |
| DD-12 | **Keyboard path.** "Skip to content" is the first focusable element; focus is always visible; the current menu item has `aria-current="page"`. | Shared frame | all |
| DD-13 | **No double submit.** A busy primary button shows a spinner, announces "Saving…" and ignores further clicks. | All primary buttons | all forms |
| DD-14 | **Filters live in the address.** History filters and the Report date range are kept in the URL, so a filtered view can be shared or bookmarked. | `/history?…`, `/reports?from=…&to=…` | 05.1, 05.2, 07.1 |
| DD-15 | **Everyone lands on the Dashboard.** After sign-up or sign-in each role goes to `/dashboard`, or back to the page they first asked for. | Sign in, Sign up | 01.1, 02.1 |
