import type { StockStatus } from "@mojud/contracts";
import { useTranslation } from "react-i18next";

/** A text badge for a product's stock status (never colour alone). */
export function StockBadge({ status }: { status: StockStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`badge badge--${status}`} data-testid="stock-badge">
      {t(`stock.status.${status}`)}
    </span>
  );
}
