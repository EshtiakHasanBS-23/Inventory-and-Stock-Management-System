# Button Approve

**Code:** `ApprovalCard` in `apps/web/src/pages/stock/ApprovalsPage.tsx` · **Class:** `.button.button--approve`
**Mockups:** [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

The green one-tap "Approve" in an [approval card](approval-card.md). It sits in a two-column grid (`.approval__actions`) beside a [button-secondary](button-secondary.md) "Reject".

## Labels

| Card kind | Approve | Reject |
|---|---|---|
| Damage flag | "Approve: write off" | "Reject: back to stock" |
| Reversal | "Approve" | "Reject" |

The Approve button starts with a `check` icon.

## States

Default `--colors-on-success` on `--colors-success` (6.3:1 light, 9.5:1 dark); hover `--shadow-raised`; active `scale(0.98)`; [focus ring](focus-ring.md); busy: `aria-busy="true"` while the decision is sent, and further clicks are ignored.

## Styling

`.button--approve` sets min-height `--spacing-button-desk` and label-button size, but inside `.approval__actions` both buttons are min-height `--spacing-target-min` (48px), padding 0 `--spacing-2`, body size, so the pair fits a 18rem card.

## Behaviour

Shown only when `approval.canDecide` is true (an allowed role who did not ask). Otherwise the card shows "Waiting for someone else to decide." in place of both buttons. After a decision a [confirmation toast](confirmation-toast.md) reads "Approved: Rice 25 kg." (or Rejected); a failure (e.g. "This was already decided.") shows as a [refusal message](refusal-message.md) with `role="alert"`.

Test ids: `approve-<id>`, `reject-<id>`.

## Used on

/approvals (page 03.2; also where Rafiq approves the reversal asked for in scenario S05).
