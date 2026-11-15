/**
 * Movement history: who, when, why and the balance after. Filters by product,
 * reason, person and date range live in the URL, so a filtered view can be
 * shared or bookmarked. Pages of 50 load with "Load more".
 */
import { ALL_REASONS } from "@mojud/contracts";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  movementsExportHref,
  useHistory,
  usePeople,
  useProducts,
  type HistoryFilters,
} from "../../api/stock";
import { ButtonSecondary } from "../../components/Buttons";
import { DownloadLink } from "../../components/DownloadLink";
import { InputField } from "../../components/InputField";
import { SelectField } from "../../components/SelectField";
import { dayStartIso, nextDayStartIso } from "../../format";
import { usePageTitle } from "../usePageTitle";
import { MovementTable } from "./MovementTable";

const FILTER_KEYS = ["productId", "reason", "userId", "from", "to"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

/** A full YYYY-MM-DD date; anything else (half-typed) is ignored. */
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function HistoryPage() {
  const { t } = useTranslation();
  usePageTitle(t("history.title"));
  const [params, setParams] = useSearchParams();
  const value = (key: FilterKey) => params.get(key) ?? "";
  const from = value("from");
  const to = value("to");
  const filters: HistoryFilters = {
    productId: value("productId") || undefined,
    reason: value("reason") || undefined,
    userId: value("userId") || undefined,
    from: DAY.test(from) ? dayStartIso(from) : undefined,
    to: DAY.test(to) ? nextDayStartIso(to) : undefined,
  };
  const products = useProducts();
  const people = usePeople();
  const history = useHistory(filters);
  const movements = history.data?.pages.flat() ?? [];
  const anyFilter = FILTER_KEYS.some((key) => value(key));

  const setFilter = (key: FilterKey) => (next: string) => {
    const updated = new URLSearchParams(params);
    if (next) updated.set(key, next);
    else updated.delete(key);
    setParams(updated, { replace: true });
  };

  return (
    <section data-testid="history-page">
      <h1>{t("history.title")}</h1>
      <div className="filter-grid" data-testid="history-filters">
        <SelectField
          id="history-product"
          label={t("history.filter")}
          value={value("productId")}
          placeholder={t("history.allProducts")}
          options={(products.data ?? []).map((p) => ({
            value: p.id,
            label: `${p.name} (${p.sku})`,
          }))}
          onChange={setFilter("productId")}
          testId="history-product-select"
        />
        <SelectField
          id="history-reason"
          label={t("history.reason")}
          value={value("reason")}
          placeholder={t("history.allReasons")}
          options={ALL_REASONS.map((reason) => ({
            value: reason,
            label: t(`stock.reasons.${reason}`),
          }))}
          onChange={setFilter("reason")}
          testId="history-reason-select"
        />
        <SelectField
          id="history-person"
          label={t("history.by")}
          value={value("userId")}
          placeholder={t("history.everyone")}
          options={(people.data ?? []).map((person) => ({
            value: person.id,
            label: person.name,
          }))}
          onChange={setFilter("userId")}
          testId="history-person-select"
        />
        <InputField
          id="history-from"
          label={t("history.from")}
          type="date"
          value={from}
          onChange={setFilter("from")}
          testId="history-from-input"
        />
        <InputField
          id="history-to"
          label={t("history.to")}
          type="date"
          value={to}
          onChange={setFilter("to")}
          testId="history-to-input"
        />
      </div>
      <div className="page-actions">
        <DownloadLink
          href={movementsExportHref(filters)}
          label={t("history.download")}
          testId="history-download"
        />
      </div>
      {anyFilter ? (
        <p>
          <button
            type="button"
            className="link-button"
            data-testid="history-clear-filters"
            onClick={() => setParams({}, { replace: true })}
          >
            {t("history.clear")}
          </button>
        </p>
      ) : null}
      {history.isPending ? <p>{t("app.loading")}</p> : null}
      {history.isError ? (
        <p className="refusal">{t("errors.loadFailed")}</p>
      ) : null}
      {history.data ? (
        <>
          <MovementTable movements={movements} testId="history-table" />
          {history.hasNextPage ? (
            <div className="load-more">
              <ButtonSecondary
                testId="history-load-more"
                onClick={() => void history.fetchNextPage()}
              >
                {history.isFetchingNextPage
                  ? t("app.loading")
                  : t("history.loadMore")}
              </ButtonSecondary>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
