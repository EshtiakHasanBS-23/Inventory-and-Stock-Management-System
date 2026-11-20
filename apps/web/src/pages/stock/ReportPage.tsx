/**
 * Stock report for a date range (this month by default): per product, the
 * quantity at the start, what came in, was sold, damaged, found missing or
 * extra in counts, adjusted, and the quantity at the end, with taka values.
 */
import type { ReportLine, StockReport } from "@mojud/contracts";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { reportExportHref, useStockReport } from "../../api/stock";
import { DownloadLink } from "../../components/DownloadLink";
import { InputField } from "../../components/InputField";
import { LoadMore } from "../../components/LoadMore";
import { dayStartIso, formatTaka, nextDayStartIso } from "../../format";
import { usePageTitle } from "../usePageTitle";
import { useShowMore } from "../useShowMore";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function localDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The first day of this month and today, as local YYYY-MM-DD. */
export function thisMonth(now = new Date()): { from: string; to: string } {
  return {
    from: localDay(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: localDay(now),
  };
}

/** "+2", "−1" (a true minus sign, as in History) or "0". */
function signed(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `\u2212${Math.abs(value)}`;
  return "0";
}

function Cells({ line }: { line: StockReport["totals"] }) {
  return (
    <>
      <td className="num">{line.opening}</td>
      <td className="num">{line.received}</td>
      <td className="num">
        {line.sold}
        <span className="muted"> {formatTaka(line.soldValue)}</span>
      </td>
      <td className="num">
        {line.damaged}
        <span className="muted"> {formatTaka(line.damagedValue)}</span>
      </td>
      <td className="num">
        {signed(line.countDifference)}
        {line.missingValue > 0 ? (
          <span className="muted"> −{formatTaka(line.missingValue)}</span>
        ) : null}
      </td>
      <td className="num">{signed(line.adjusted)}</td>
      <td className="num">{line.closing}</td>
    </>
  );
}

export function ReportPage() {
  const { t } = useTranslation();
  usePageTitle(t("report.title"));
  const [params, setParams] = useSearchParams();
  const defaults = thisMonth();
  const fromDay = params.get("from") ?? defaults.from;
  const toDay = params.get("to") ?? defaults.to;
  const valid = DAY.test(fromDay) && DAY.test(toDay) && fromDay <= toDay;
  const from = valid ? dayStartIso(fromDay) : "";
  const to = valid ? nextDayStartIso(toDay) : "";
  const report = useStockReport(from, to);

  const setDay = (key: "from" | "to") => (value: string) => {
    const updated = new URLSearchParams(params);
    updated.set("from", fromDay);
    updated.set("to", toDay);
    updated.set(key, value);
    setParams(updated, { replace: true });
  };

  const data = valid ? report.data : undefined;
  const lines: ReportLine[] = data?.lines ?? [];
  const page = useShowMore(lines, `${from}|${to}`);

  return (
    <section data-testid="report-page">
      <h1>{t("report.title")}</h1>
      <div className="filter-grid">
        <InputField
          id="report-from"
          label={t("history.from")}
          type="date"
          value={fromDay}
          onChange={setDay("from")}
          testId="report-from-input"
        />
        <InputField
          id="report-to"
          label={t("history.to")}
          type="date"
          value={toDay}
          onChange={setDay("to")}
          testId="report-to-input"
        />
      </div>
      {!valid ? (
        <p className="refusal" data-testid="report-bad-range">
          {t("report.badRange")}
        </p>
      ) : null}
      {valid && report.isPending ? <p>{t("app.loading")}</p> : null}
      {valid && report.isError ? (
        <p className="refusal">{t("errors.loadFailed")}</p>
      ) : null}
      {data ? (
        <>
          <dl className="stat-grid">
            <div className="stat">
              <dt>{t("report.received")}</dt>
              <dd data-testid="report-received-value">
                {formatTaka(data.totals.receivedValue)}
              </dd>
            </div>
            <div className="stat">
              <dt>{t("report.sold")}</dt>
              <dd data-testid="report-sold-value">
                {formatTaka(data.totals.soldValue)}
              </dd>
            </div>
            <div className="stat stat--out">
              <dt>{t("report.lost")}</dt>
              <dd data-testid="report-lost-value">
                {formatTaka(
                  data.totals.damagedValue + data.totals.missingValue,
                )}
              </dd>
            </div>
          </dl>
          <p>
            <DownloadLink
              href={reportExportHref(from, to)}
              label={t("report.download")}
              testId="report-download"
            />
          </p>
          {lines.length === 0 ? (
            <p data-testid="report-empty">{t("report.empty")}</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table" data-testid="report-table">
                <thead>
                  <tr>
                    <th scope="col">{t("history.product")}</th>
                    <th scope="col" className="num">
                      {t("report.opening")}
                    </th>
                    <th scope="col" className="num">
                      {t("report.in")}
                    </th>
                    <th scope="col" className="num">
                      {t("report.soldQty")}
                    </th>
                    <th scope="col" className="num">
                      {t("report.damaged")}
                    </th>
                    <th scope="col" className="num">
                      {t("report.count")}
                    </th>
                    <th scope="col" className="num">
                      {t("report.adjusted")}
                    </th>
                    <th scope="col" className="num">
                      {t("report.closing")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.visible.map((line) => (
                    <tr key={line.productId}>
                      <th scope="row">
                        {line.name}{" "}
                        <span className="muted">
                          {line.sku} · {line.unit}
                        </span>
                      </th>
                      <Cells line={line} />
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr data-testid="report-total">
                    <th scope="row">{t("report.total")}</th>
                    <Cells line={data.totals} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          {page.hasMore ? (
            <>
              <p className="muted list-progress" data-testid="report-showing">
                {t("common.showing", {
                  shown: page.visible.length,
                  total: lines.length,
                })}
              </p>
              <LoadMore testId="report-load-more" onClick={page.showMore} />
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
