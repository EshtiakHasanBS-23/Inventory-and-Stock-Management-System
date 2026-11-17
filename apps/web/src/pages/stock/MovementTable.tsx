import { REVERSIBLE_REASONS, type Movement } from "@mojud/contracts";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icons";
import { formatTaka } from "../../format";

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Change({ movement }: { movement: Movement }) {
  return (
    <span className={`change change--${movement.direction}`}>
      <Icon name={movement.direction} size={14} />
      {movement.direction === "in" ? "+" : "−"}
      {movement.quantity} {movement.unit}
    </span>
  );
}

/**
 * The movement history table: when, product, change, value, reason, balance,
 * who. `compact` (dashboard) is a short list: product, reason, who, when and
 * the change, which reads well on a phone.
 */
export function MovementTable({
  movements,
  testId,
  compact = false,
  onReverse,
}: {
  movements: readonly Movement[];
  testId: string;
  compact?: boolean;
  /** When given, reversible rows get a "Reverse…" action (Owner, Manager). */
  onReverse?: (movement: Movement) => void;
}) {
  const { t } = useTranslation();
  if (movements.length === 0) {
    return (
      <p className="empty-state" data-testid={`${testId}-empty`}>
        <Icon name="clock" size={28} />
        {t("history.empty")}
      </p>
    );
  }
  if (compact) {
    return (
      <ul className="movement-list" data-testid={testId}>
        {movements.map((m) => (
          <li key={m.id}>
            <span className="movement-list__main">
              <span className="movement-list__name">{m.productName}</span>
              <span className="muted">
                {t(`stock.reasons.${m.reason}`)} · {m.userName} ·{" "}
                {formatDateTime(m.createdAt)}
              </span>
            </span>
            <Change movement={m} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="table-wrap">
      <table className="data-table" data-testid={testId}>
        <thead>
          <tr>
            <th scope="col">{t("history.when")}</th>
            <th scope="col">{t("history.product")}</th>
            <th scope="col" className="num">
              {t("history.change")}
            </th>
            <th scope="col" className="num">
              {t("history.value")}
            </th>
            <th scope="col">{t("history.reason")}</th>
            <th scope="col" className="num">
              {t("history.balance")}
            </th>
            <th scope="col">{t("history.by")}</th>
            {onReverse ? (
              <th scope="col">
                <span className="visually-hidden">{t("products.actions")}</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{formatDateTime(m.createdAt)}</td>
              <td>
                {m.productName} <span className="muted">{m.sku}</span>
              </td>
              <td className="num">
                <Change movement={m} />
              </td>
              <td className="num">{formatTaka(m.value)}</td>
              <td>
                {t(`stock.reasons.${m.reason}`)}
                {m.note ? <span className="muted"> · {m.note}</span> : null}
              </td>
              <td className="num">{m.balanceAfter}</td>
              <td>{m.userName}</td>
              {onReverse ? (
                <td>
                  {REVERSIBLE_REASONS.includes(m.reason) ? (
                    <button
                      type="button"
                      className="link-button"
                      data-testid={`reverse-${m.id}`}
                      aria-label={t("reversal.label", {
                        reason: t(`stock.reasons.${m.reason}`),
                        quantity: m.quantity,
                        unit: m.unit,
                        product: m.productName,
                      })}
                      onClick={() => onReverse(m)}
                    >
                      {t("reversal.action")}
                    </button>
                  ) : null}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
