/** S4 Movement history: who, when, why and the balance after, per product. */
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useMovements, useProducts } from "../../api/stock";
import { SelectField } from "../../components/SelectField";
import { usePageTitle } from "../usePageTitle";
import { MovementTable } from "./MovementTable";

export function HistoryPage() {
  const { t } = useTranslation();
  usePageTitle(t("history.title"));
  const [params, setParams] = useSearchParams();
  const productId = params.get("productId") ?? "";
  const products = useProducts();
  const movements = useMovements(productId);

  return (
    <section data-testid="history-page">
      <h1>{t("history.title")}</h1>
      <div className="toolbar">
        <SelectField
          id="history-product"
          label={t("history.filter")}
          value={productId}
          placeholder={t("history.allProducts")}
          options={(products.data ?? []).map((p) => ({
            value: p.id,
            label: `${p.name} (${p.sku})`,
          }))}
          onChange={(value) =>
            setParams(value ? { productId: value } : {}, { replace: true })
          }
          testId="history-product-select"
        />
      </div>
      {movements.isPending ? <p>{t("app.loading")}</p> : null}
      {movements.isError ? (
        <p className="refusal">{t("errors.loadFailed")}</p>
      ) : null}
      {movements.data ? (
        <MovementTable movements={movements.data} testId="history-table" />
      ) : null}
    </section>
  );
}
