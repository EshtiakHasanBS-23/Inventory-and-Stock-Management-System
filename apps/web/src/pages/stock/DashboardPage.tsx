/**
 * Dashboard (Owner view, mockup key-dashboard): big metric tiles for stock
 * value, losses and low stock, the products that need restocking as rows
 * with a chevron, and recent movements. Figures count up when they load.
 */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDashboard } from "../../api/stock";
import { Icon } from "../../components/Icons";
import { formatTaka } from "../../format";
import { useCountUp } from "../../useCountUp";
import { usePageTitle } from "../usePageTitle";
import { MovementTable } from "./MovementTable";
import { StockBadge } from "./StockBadge";

function Figure({
  value,
  money = false,
  testId,
}: {
  value: number;
  money?: boolean;
  testId: string;
}) {
  const shown = useCountUp(value);
  // Whole numbers while counting; the exact figure (with poisha) at the end.
  const rounded = shown === value ? value : Math.round(shown);
  return (
    <span data-testid={testId}>{money ? formatTaka(rounded) : rounded}</span>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  usePageTitle(t("dashboard.title"));
  const { data, isPending, isError } = useDashboard();

  return (
    <section data-testid="dashboard-page">
      <div className="page-header">
        <h1>{t("dashboard.title")}</h1>
        <p className="page-header__sub">{t("dashboard.subtitle")}</p>
      </div>
      {isPending ? (
        <div className="skeleton-grid" aria-busy="true">
          <p className="visually-hidden">{t("app.loading")}</p>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      ) : null}
      {isError ? <p className="refusal">{t("errors.loadFailed")}</p> : null}
      {data ? (
        <>
          {data.pendingApprovals > 0 ? (
            <Link
              className="banner"
              to="/approvals"
              data-testid="pending-approvals"
            >
              <Icon name="alert" />
              <span>
                {t("dashboard.pending", { count: data.pendingApprovals })}
                {data.damagedValue > 0 ? (
                  <span className="banner__sub">
                    {t("dashboard.held", {
                      value: formatTaka(data.damagedValue),
                    })}
                  </span>
                ) : null}
              </span>
              <Icon name="chevron" />
            </Link>
          ) : null}
          <dl className="hero-grid">
            <div className="tile tile--hero">
              <dt className="tile__label">
                <Icon name="box" /> {t("dashboard.value")}
              </dt>
              <dd className="tile__value tile__value--primary">
                <Figure value={data.stockValue} money testId="stat-value" />
              </dd>
              <dd className="tile__meta">
                {t("dashboard.unitsIn", {
                  units: data.totalUnits,
                  products: data.productCount,
                })}
              </dd>
            </div>
            <div className="tile tile--hero">
              <dt className="tile__label">
                <Icon name="alert" /> {t("dashboard.losses")}
              </dt>
              <dd className="tile__value tile__value--danger">
                <Figure value={data.lossValue30d} money testId="stat-losses" />
              </dd>
              <dd className="tile__meta">
                <ul className="loss-rows" data-testid="loss-breakdown">
                  {(
                    [
                      ["lossDamage", data.lossBreakdown.damage, "damage"],
                      [
                        "lossFlags",
                        data.lossBreakdown.damageFlagged,
                        "damage_flagged",
                      ],
                      ["lossMissing", data.lossBreakdown.missing, "count"],
                    ] as const
                  ).map(([key, value, reason]) => (
                    <li key={key}>
                      <Link
                        className="loss-row"
                        to={`/history?reason=${reason}`}
                        data-testid={`loss-${reason}`}
                      >
                        <span>{t(`dashboard.${key}`)}</span>
                        <b>{formatTaka(value)}</b>
                        <Icon name="chevron" size={16} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="tile">
              <dt className="tile__label">{t("dashboard.low")}</dt>
              <dd className="tile__value tile__value--warning">
                <Icon name="alert" size={26} />
                <Figure value={data.lowStockCount} testId="stat-low" />
              </dd>
            </div>
            <div className="tile">
              <dt className="tile__label">{t("dashboard.out")}</dt>
              <dd className="tile__value tile__value--danger">
                <Icon name="x" size={26} />
                <Figure value={data.outOfStockCount} testId="stat-out" />
              </dd>
            </div>
            <div className="tile">
              <dt className="tile__label">{t("dashboard.products")}</dt>
              <dd className="tile__value">
                <Figure value={data.productCount} testId="stat-products" />
              </dd>
            </div>
            <div className="tile">
              <dt className="tile__label">{t("dashboard.units")}</dt>
              <dd className="tile__value">
                <Figure value={data.totalUnits} testId="stat-units" />
              </dd>
            </div>
          </dl>

          <div className="dash-columns">
            <section className="card" aria-labelledby="attention-heading">
              <h2 id="attention-heading">{t("dashboard.attention")}</h2>
              {data.lowStock.length === 0 ? (
                <p className="empty-state" data-testid="attention-empty">
                  <Icon name="check" size={28} />
                  {t("dashboard.allGood")}
                </p>
              ) : (
                <ul className="attention-list" data-testid="attention-list">
                  {data.lowStock.map((product) => (
                    <li key={product.id}>
                      <span className="attention-list__name">
                        {product.name}
                        <span className="muted">
                          {t("dashboard.onHand", {
                            count: product.onHand,
                            unit: product.unit,
                            min: product.minStock,
                          })}
                        </span>
                      </span>
                      <StockBadge status={product.status} />
                      <Link
                        className="go"
                        to={`/stock?productId=${product.id}`}
                      >
                        {t("dashboard.restock")}
                        <Icon name="chevron" size={16} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card" aria-labelledby="recent-heading">
              <h2 id="recent-heading">{t("dashboard.recent")}</h2>
              <MovementTable
                movements={data.recentMovements}
                testId="recent-movements"
                compact
              />
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
