/** S4 Dashboard: totals, products that need attention and recent movements. */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDashboard } from "../../api/stock";
import { formatTaka } from "../../format";
import { usePageTitle } from "../usePageTitle";
import { MovementTable } from "./MovementTable";
import { StockBadge } from "./StockBadge";

export function DashboardPage() {
  const { t } = useTranslation();
  usePageTitle(t("dashboard.title"));
  const { data, isPending, isError } = useDashboard();

  return (
    <section data-testid="dashboard-page">
      <h1>{t("dashboard.title")}</h1>
      {isPending ? <p>{t("app.loading")}</p> : null}
      {isError ? <p className="refusal">{t("errors.loadFailed")}</p> : null}
      {data ? (
        <>
          <dl className="stat-grid">
            <div className="stat">
              <dt>{t("dashboard.value")}</dt>
              <dd data-testid="stat-value">{formatTaka(data.stockValue)}</dd>
            </div>
            <div className="stat stat--out">
              <dt>{t("dashboard.losses")}</dt>
              <dd data-testid="stat-losses">{formatTaka(data.lossValue30d)}</dd>
            </div>
            <div className="stat">
              <dt>{t("dashboard.products")}</dt>
              <dd data-testid="stat-products">{data.productCount}</dd>
            </div>
            <div className="stat">
              <dt>{t("dashboard.units")}</dt>
              <dd data-testid="stat-units">{data.totalUnits}</dd>
            </div>
            <div className="stat stat--low">
              <dt>{t("dashboard.low")}</dt>
              <dd data-testid="stat-low">{data.lowStockCount}</dd>
            </div>
            <div className="stat stat--out">
              <dt>{t("dashboard.out")}</dt>
              <dd data-testid="stat-out">{data.outOfStockCount}</dd>
            </div>
          </dl>

          <h2>{t("dashboard.attention")}</h2>
          {data.lowStock.length === 0 ? (
            <p data-testid="attention-empty">{t("dashboard.allGood")}</p>
          ) : (
            <ul className="attention-list" data-testid="attention-list">
              {data.lowStock.map((product) => (
                <li key={product.id}>
                  <span>
                    {product.name} <span className="muted">{product.sku}</span>
                  </span>
                  <span>
                    {t("dashboard.onHand", {
                      count: product.onHand,
                      unit: product.unit,
                      min: product.minStock,
                    })}
                  </span>
                  <StockBadge status={product.status} />
                  <Link to={`/stock?productId=${product.id}`}>
                    {t("dashboard.restock")}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h2>{t("dashboard.recent")}</h2>
          <MovementTable
            movements={data.recentMovements}
            testId="recent-movements"
          />
        </>
      ) : null}
    </section>
  );
}
