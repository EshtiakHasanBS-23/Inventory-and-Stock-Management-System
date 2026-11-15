import type { StockStatus } from "@mojud/contracts";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "../../components/Icons";

const ICON: Record<StockStatus, IconName> = {
  ok: "check",
  low: "alert",
  out: "x",
};

/** A stock-state pill: tint, icon and text, so it never relies on colour alone. */
export function StockBadge({ status }: { status: StockStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`badge badge--${status}`} data-testid="stock-badge">
      <Icon name={ICON[status]} size={14} />
      {t(`stock.status.${status}`)}
    </span>
  );
}
