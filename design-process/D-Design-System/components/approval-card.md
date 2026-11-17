# Approval Card

**Code:** `ApprovalCard` in `apps/web/src/pages/stock/ApprovalsPage.tsx` · **Classes:** `.approval-list`, `.approval`, `.approval--damage`, `.approval--reversal`, `.approval__head`, `.approval__kind`, `.approval__value`, `.approval__title`, `.approval__note`, `.approval__actions`, `.approval__waiting`
**Mockups:** [key-approvals.html](../../../_bmad-output/planning-artifacts/ux-designs/ux-E2E_IAM-2026-10-22/mockups/key-approvals.html)
**Tokens:** [design-tokens.md](../design-tokens.md) · **Index:** [00-design-system.md](../00-design-system.md#components)

---

## What it is

One request that needs a second person: a **Damage flag** or a **Reversal**. Cards sit in a responsive grid on the Approvals page under the Waiting / Decided [tabs](tabs.md).

## Anatomy (top to bottom)

1. **Head:** kind (alert icon "DAMAGE FLAG" or swap icon "REVERSAL", meta size, uppercase, 0.04em tracking, muted) and value in taka (title size, 700, `--colors-danger`, tabular).
2. **Title:** product name + quantity as a [change pill](change-pill.md) `--out`.
3. **Reversal only:** "Undo Purchase of 3 Nov, 09:40" (muted).
4. **Note** in italics and quotes, when given.
5. "Asked by Karim · 3 Nov, 09:40" (muted).
6. **Footer**, one of:
   - Waiting, may decide: [Approve](button-approve.md) + Reject in two columns.
   - Waiting, may not decide: "Waiting for someone else to decide." (`.approval__waiting`: muted on `--colors-surface-alt`, `--rounded-sm`).
   - Decided: an outcome [pill](stock-state-pill.md) "Approved by Nasima · 3 Nov, 10:15" (ok) or "Rejected by …" (out).

## Variants

| Variant | Top edge |
|---|---|
| `--damage` | 4px `--colors-warning` |
| `--reversal` | 4px `--colors-info` |

## Styling

List: grid `repeat(auto-fill, minmax(18rem, 1fr))`, gap `--spacing-4`. Card: grid, gap `--spacing-2`, padding `--spacing-4`, `--colors-surface`, 1px `--colors-border`, `--rounded-md`, `--shadow-card`. Actions: two equal columns, gap `--spacing-2`, margin-top `--spacing-2`. Motion allowed: fades up, lifts 2px with `--shadow-raised` on hover.

## Behaviour

Nobody sees decision buttons for their own request (`canDecide` from the API). A decision locks the row on the server; if someone else decided first, the page shows "This was already decided." as a [refusal](refusal-message.md). Success shows a [toast](confirmation-toast.md).

## Used on

/approvals (page 03.2, and the reversal decision in scenario S05).
