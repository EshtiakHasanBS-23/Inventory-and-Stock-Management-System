import type { Movement } from "@mojud/contracts";
import { useTranslation } from "react-i18next";

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** The movement history table: when, product, change, reason, balance, who. */
export function MovementTable({
  movements,
  testId,
}: {
  movements: readonly Movement[];
  testId: string;
}) {
  const { t } = useTranslation();
  if (movements.length === 0) {
    return <p data-testid={`${testId}-empty`}>{t("history.empty")}</p>;
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
            <th scope="col">{t("history.reason")}</th>
            <th scope="col" className="num">
              {t("history.balance")}
            </th>
            <th scope="col">{t("history.by")}</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{formatDateTime(m.createdAt)}</td>
              <td>
                {m.productName} <span className="muted">{m.sku}</span>
              </td>
              <td className={`num change change--${m.direction}`}>
                {m.direction === "in" ? "+" : "−"}
                {m.quantity} {m.unit}
              </td>
              <td>
                {t(`stock.reasons.${m.reason}`)}
                {m.note ? <span className="muted"> · {m.note}</span> : null}
              </td>
              <td className="num">{m.balanceAfter}</td>
              <td>{m.userName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
