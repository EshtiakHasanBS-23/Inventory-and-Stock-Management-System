/**
 * Approvals inbox (PRD FR-14 to FR-16; mockup key-approvals): damage flags
 * and reversal requests, each decided in one tap by a second person.
 */
import type { Approval } from "@mojud/contracts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toFailure, useApprovals, useDecideApproval } from "../../api/stock";
import { ButtonSecondary } from "../../components/Buttons";
import { Icon } from "../../components/Icons";
import { LoadMore } from "../../components/LoadMore";
import { formatTaka } from "../../format";
import { usePageTitle } from "../usePageTitle";
import { formatDateTime } from "./MovementTable";

function ApprovalCard({
  approval,
  onDecided,
  onError,
}: {
  approval: Approval;
  onDecided: (message: string) => void;
  onError: (message: string) => void;
}) {
  const { t } = useTranslation();
  const decide = useDecideApproval();
  const isDamage = approval.kind === "damage";

  const run = async (approve: boolean) => {
    if (decide.isPending) return;
    try {
      const result = await decide.mutateAsync({ id: approval.id, approve });
      onDecided(
        t("approvals.done", {
          status: t(`approvals.${result.status}`),
          product: result.productName,
        }),
      );
    } catch (error) {
      onError(toFailure(error, t("errors.saveFailed")).message);
    }
  };

  return (
    <li
      className={`approval approval--${approval.kind}`}
      data-testid={`approval-${approval.id}`}
    >
      <div className="approval__head">
        <span className="approval__kind">
          <Icon name={isDamage ? "alert" : "swap"} size={18} />
          {t(`approvals.${approval.kind}`)}
        </span>
        <span className="approval__value">{formatTaka(approval.value)}</span>
      </div>
      <p className="approval__title">
        {approval.productName}{" "}
        <span className="change change--out">
          {approval.quantity} {approval.unit}
        </span>
      </p>
      {isDamage ? null : (
        <p className="muted">
          {t("approvals.reverses", {
            reason: t(`stock.reasons.${approval.movement.reason}`),
            time: formatDateTime(approval.movement.createdAt),
          })}
        </p>
      )}
      {approval.note ? (
        <p className="approval__note">“{approval.note}”</p>
      ) : null}
      <p className="muted">
        {t("approvals.by", {
          name: approval.requestedBy,
          time: formatDateTime(approval.requestedAt),
        })}
      </p>
      {approval.status === "pending" ? (
        approval.canDecide ? (
          <div className="approval__actions">
            <button
              type="button"
              className="button button--approve"
              data-testid={`approve-${approval.id}`}
              aria-busy={decide.isPending || undefined}
              onClick={() => void run(true)}
            >
              <Icon name="check" />
              {isDamage ? t("approvals.approveDamage") : t("approvals.approve")}
            </button>
            <ButtonSecondary
              testId={`reject-${approval.id}`}
              onClick={() => void run(false)}
            >
              {isDamage ? t("approvals.rejectDamage") : t("approvals.reject")}
            </ButtonSecondary>
          </div>
        ) : (
          <p className="approval__waiting">{t("approvals.waitingOther")}</p>
        )
      ) : (
        <p>
          <span
            className={`badge badge--${approval.status === "approved" ? "ok" : "out"}`}
          >
            <Icon
              name={approval.status === "approved" ? "check" : "x"}
              size={14}
            />
            {t("approvals.decidedBy", {
              status: t(`approvals.${approval.status}`),
              name: approval.decidedBy ?? "",
              time: formatDateTime(approval.decidedAt ?? approval.requestedAt),
            })}
          </span>
        </p>
      )}
    </li>
  );
}

export function ApprovalsPage() {
  const { t } = useTranslation();
  usePageTitle(t("approvals.title"));
  const [params, setParams] = useSearchParams();
  const status = params.get("status") === "decided" ? "decided" : "pending";
  const approvals = useApprovals(status);
  const items = approvals.data?.pages.flat();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section data-testid="approvals-page">
      <div className="page-header">
        <h1>{t("approvals.title")}</h1>
        <p className="page-header__sub">{t("approvals.intro")}</p>
      </div>
      <div className="tabs" role="group" aria-label={t("approvals.title")}>
        {(["pending", "decided"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className="tab"
            aria-pressed={status === value}
            data-testid={`approvals-tab-${value}`}
            onClick={() => {
              setNotice(null);
              setError(null);
              setParams(value === "pending" ? {} : { status: value });
            }}
          >
            {t(`approvals.${value}`)}
          </button>
        ))}
      </div>
      {notice ? (
        <p className="success" role="status" data-testid="approvals-notice">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="refusal" role="alert" data-testid="approvals-error">
          {error}
        </p>
      ) : null}
      {approvals.isPending ? <p>{t("app.loading")}</p> : null}
      {approvals.isError ? (
        <p className="refusal">{t("errors.loadFailed")}</p>
      ) : null}
      {items && items.length === 0 ? (
        <p className="empty-state" data-testid="approvals-empty">
          <Icon name="check" size={28} />
          {status === "pending"
            ? t("approvals.empty")
            : t("approvals.emptyDecided")}
        </p>
      ) : null}
      {items && items.length > 0 ? (
        <ul className="approval-list" data-testid="approval-list">
          {items.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onDecided={(message) => {
                setError(null);
                setNotice(message);
              }}
              onError={(message) => {
                setNotice(null);
                setError(message);
              }}
            />
          ))}
        </ul>
      ) : null}
      {approvals.hasNextPage ? (
        <LoadMore
          testId="approvals-load-more"
          loading={approvals.isFetchingNextPage}
          onClick={() => void approvals.fetchNextPage()}
        />
      ) : null}
    </section>
  );
}
