/**
 * S1 Products and S3 stock list: search, current quantity with a low / out
 * badge, and (for an owner or manager) a form to add or edit a product.
 */
import type { Product } from "@mojud/contracts";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  PRODUCTS_EXPORT_HREF,
  toFailure,
  useProducts,
  useSaveProduct,
  type FormFailure,
} from "../../api/stock";
import { ButtonPrimary, ButtonSecondary } from "../../components/Buttons";
import { DownloadLink } from "../../components/DownloadLink";
import { FormErrorSummary } from "../../components/FormErrorSummary";
import { Icon } from "../../components/Icons";
import { InputField } from "../../components/InputField";
import { formatTaka } from "../../format";
import { canManageProducts } from "../../session/roles";
import { useSession } from "../../session/SessionProvider";
import { usePageTitle } from "../usePageTitle";
import { StockBadge } from "./StockBadge";

interface Draft {
  sku: string;
  name: string;
  unit: string;
  minStock: string;
  unitCost: string;
}

const EMPTY: Draft = {
  sku: "",
  name: "",
  unit: "pcs",
  minStock: "0",
  unitCost: "0",
};

/** A typed number, or NaN for an empty box so the server names the field. */
function toNumber(text: string): number {
  return text.trim() === "" ? Number.NaN : Number(text);
}

function ProductForm({
  editing,
  onDone,
}: {
  editing: Product | null;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const save = useSaveProduct();
  const [draft, setDraft] = useState<Draft>(
    editing
      ? {
          sku: editing.sku,
          name: editing.name,
          unit: editing.unit,
          minStock: String(editing.minStock),
          unitCost: String(editing.unitCost),
        }
      : EMPTY,
  );
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const set = (key: keyof Draft) => (value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const fieldError = (field: string) =>
    failure?.field === field ? failure.message : undefined;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (save.isPending) return;
    setFailure(null);
    const common = {
      name: draft.name,
      unit: draft.unit,
      minStock: toNumber(draft.minStock),
      unitCost: toNumber(draft.unitCost),
    };
    try {
      await save.mutateAsync(
        editing
          ? { id: editing.id, body: common }
          : { body: { ...common, sku: draft.sku } },
      );
      setDraft(EMPTY);
      onDone();
    } catch (error) {
      setFailure(toFailure(error, t("errors.saveFailed")));
      setSubmitCount((count) => count + 1);
    }
  };

  return (
    <form
      className="panel panel--wide"
      noValidate
      onSubmit={submit}
      data-testid="product-form"
    >
      <h2>
        {editing
          ? t("products.editHeading", { sku: editing.sku })
          : t("products.addHeading")}
      </h2>
      <FormErrorSummary
        id="product-error-summary"
        testId="product-error-summary"
        formMessage={failure && !failure.field ? failure.message : undefined}
        focusKey={submitCount}
      />
      <div className="form-grid form-grid--3">
        {editing ? null : (
          <InputField
            id="product-sku"
            label={t("products.sku")}
            value={draft.sku}
            error={fieldError("sku")}
            onChange={set("sku")}
            testId="product-sku-input"
          />
        )}
        <InputField
          id="product-name"
          label={t("products.name")}
          wide
          value={draft.name}
          error={fieldError("name")}
          onChange={set("name")}
          testId="product-name-input"
        />
        <InputField
          id="product-unit"
          label={t("products.unit")}
          hint={t("products.unitHint")}
          value={draft.unit}
          error={fieldError("unit")}
          onChange={set("unit")}
          testId="product-unit-input"
        />
        <InputField
          id="product-min"
          label={t("products.minStock")}
          hint={t("products.minStockHint")}
          value={draft.minStock}
          inputMode="numeric"
          error={fieldError("minStock")}
          onChange={set("minStock")}
          testId="product-min-input"
        />
        <InputField
          id="product-cost"
          label={t("products.unitCost")}
          hint={t("products.unitCostHint")}
          value={draft.unitCost}
          inputMode="decimal"
          error={fieldError("unitCost")}
          onChange={set("unitCost")}
          testId="product-cost-input"
        />
      </div>
      <div className="form-actions">
        <ButtonPrimary testId="product-save-button" busy={save.isPending}>
          {editing ? t("products.saveChanges") : t("products.add")}
        </ButtonPrimary>
        {editing ? (
          <ButtonSecondary testId="product-cancel-button" onClick={onDone}>
            {t("common.cancel")}
          </ButtonSecondary>
        ) : null}
      </div>
    </form>
  );
}

export function ProductsPage() {
  const { t } = useTranslation();
  usePageTitle(t("products.title"));
  const { session } = useSession();
  const canManage = session ? canManageProducts(session.role) : false;
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const products = useProducts(search.trim());

  return (
    <section data-testid="products-page">
      <div className="page-header page-header--split">
        <div>
          <h1>{t("products.title")}</h1>
          <p className="page-header__sub">{t("products.subtitle")}</p>
        </div>
        <div className="page-actions">
          {canManage ? (
            <Link
              className="button button--secondary"
              to="/products/import"
              data-testid="products-import-link"
            >
              <Icon name="upload" />
              {t("import.title")}
            </Link>
          ) : null}
          <DownloadLink
            href={PRODUCTS_EXPORT_HREF}
            label={t("products.download")}
            testId="products-download"
          />
        </div>
      </div>
      {canManage ? (
        <ProductForm
          key={editing?.id ?? "new"}
          editing={editing}
          onDone={() => setEditing(null)}
        />
      ) : null}

      <div className="list-toolbar">
        <div className="list-toolbar__search">
          <InputField
            id="product-search"
            label={t("products.search")}
            value={search}
            onChange={setSearch}
            testId="product-search-input"
          />
        </div>
        {products.data ? (
          <p className="list-toolbar__count" data-testid="products-count">
            {t("products.count", { count: products.data.length })}
          </p>
        ) : null}
      </div>

      {products.isPending ? <p>{t("app.loading")}</p> : null}
      {products.isError ? (
        <p className="refusal">{t("errors.loadFailed")}</p>
      ) : null}
      {products.data && products.data.length === 0 ? (
        <p className="empty-state" data-testid="products-empty">
          <Icon name="box" size={28} />
          {search ? t("products.noMatch") : t("products.empty")}
        </p>
      ) : null}
      {products.data && products.data.length > 0 ? (
        <div className="table-wrap">
          <table
            className="data-table data-table--stack"
            data-testid="products-table"
          >
            <thead>
              <tr>
                <th scope="col">{t("products.colProduct")}</th>
                <th scope="col" className="num">
                  {t("products.onHand")}
                </th>
                <th scope="col" className="num">
                  {t("products.colMin")}
                </th>
                <th scope="col" className="num">
                  {t("products.colCost")}
                </th>
                <th scope="col" className="num">
                  {t("products.colValue")}
                </th>
                <th scope="col">{t("products.status")}</th>
                <th scope="col">
                  <span className="visually-hidden">
                    {t("products.actions")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.data.map((product) => (
                <tr key={product.id} data-testid={`product-row-${product.sku}`}>
                  <td className="cell-title" data-label={t("products.name")}>
                    <span className="cell-name">
                      {product.name}
                      <span className="cell-code">{product.sku}</span>
                    </span>
                  </td>
                  <td className="num" data-label={t("products.onHand")}>
                    <span className="cell-strong">
                      {product.onHand} {product.unit}
                    </span>
                    {product.damaged > 0 ? (
                      <span className="held">
                        {t("products.held", { count: product.damaged })}
                      </span>
                    ) : null}
                  </td>
                  <td className="num" data-label={t("products.colMin")}>
                    {product.minStock}
                  </td>
                  <td className="num" data-label={t("products.colCost")}>
                    {formatTaka(product.unitCost)}
                  </td>
                  <td className="num" data-label={t("products.colValue")}>
                    {formatTaka(product.stockValue)}
                  </td>
                  <td data-label={t("products.status")}>
                    <StockBadge status={product.status} />
                  </td>
                  <td className="cell-actions">
                    <div className="row-actions">
                      <Link
                        className="chip-button"
                        to={`/stock?productId=${product.id}`}
                      >
                        <Icon name="swap" size={16} />
                        {t("products.move")}
                      </Link>
                      <Link
                        className="chip-button chip-button--danger"
                        to={`/damage?productId=${product.id}`}
                      >
                        <Icon name="alert" size={16} />
                        {t("products.flag")}
                      </Link>
                      <Link
                        className="chip-button"
                        to={`/history?productId=${product.id}`}
                      >
                        <Icon name="clock" size={16} />
                        {t("products.history")}
                      </Link>
                      {canManage ? (
                        <button
                          type="button"
                          className="chip-button"
                          data-testid={`product-edit-${product.sku}`}
                          onClick={() => setEditing(product)}
                        >
                          {t("products.edit")}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
