/**
 * Import products from Excel (saved as CSV). The file is read and checked in
 * the browser first: every problem is listed by row, and Import stays off
 * until there are none. The server checks again and saves all rows or none.
 */
import type { ImportResult } from "@mojud/contracts";
import { useMemo, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toFailure, useImportProducts } from "../../api/stock";
import { ButtonPrimary } from "../../components/Buttons";
import {
  PRODUCT_TEMPLATE_CSV,
  readProductCsv,
  type ImportPreview,
} from "../../csvImport";
import { formatTaka } from "../../format";
import { usePageTitle } from "../usePageTitle";

const PREVIEW_ROWS = 20;

export function ImportPage() {
  const { t } = useTranslation();
  usePageTitle(t("import.title"));
  const importProducts = useImportProducts();
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const templateHref = useMemo(
    () =>
      `data:text/csv;charset=utf-8,${encodeURIComponent(PRODUCT_TEMPLATE_CSV)}`,
    [],
  );

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setResult(null);
    setServerError(null);
    if (!file) {
      setPreview(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    setPreview(readProductCsv(await file.text()));
  };

  const upload = async () => {
    if (!preview || preview.problems.length > 0 || importProducts.isPending)
      return;
    setServerError(null);
    try {
      setResult(await importProducts.mutateAsync(preview.rows));
      setPreview(null);
      setFileName(null);
    } catch (error) {
      setServerError(toFailure(error, t("errors.saveFailed")).message);
    }
  };

  const ready = preview && preview.problems.length === 0;

  return (
    <section data-testid="import-page">
      <h1>{t("import.title")}</h1>
      <ol className="steps">
        <li>
          {t("import.step1")}{" "}
          <a
            href={templateHref}
            download="mojud-products-template.csv"
            data-testid="import-template-link"
          >
            {t("import.template")}
          </a>
        </li>
        <li>{t("import.step2")}</li>
        <li>{t("import.step3")}</li>
      </ol>

      {result ? (
        <p className="success" role="status" data-testid="import-done">
          {t("import.done", {
            count: result.created,
            units: result.openingUnits,
          })}{" "}
          <Link to="/products">{t("import.seeProducts")}</Link>
        </p>
      ) : null}

      <div className="panel">
        <div className="field">
          <label htmlFor="import-file">{t("import.file")}</label>
          <input
            id="import-file"
            type="file"
            accept=".csv,text/csv"
            data-testid="import-file-input"
            onChange={(event) => void choose(event)}
          />
        </div>

        {preview && preview.problems.length > 0 ? (
          <div
            className="error-summary"
            role="alert"
            data-testid="import-problems"
          >
            <p className="error-summary__title">
              {t("import.problems", {
                count: preview.problems.length,
                file: fileName ?? "",
              })}
            </p>
            <ul>
              {preview.problems.slice(0, 20).map((problem) => (
                <li key={`${problem.row}-${problem.message}`}>
                  {problem.row > 0
                    ? t("import.rowProblem", {
                        row: problem.row,
                        message: problem.message,
                      })
                    : problem.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {serverError ? (
          <p className="refusal" role="alert" data-testid="import-server-error">
            {serverError}
          </p>
        ) : null}

        {ready ? (
          <>
            <p data-testid="import-ready">
              {t("import.ready", { count: preview.rows.length })}
            </p>
            <div className="table-wrap">
              <table className="data-table" data-testid="import-preview">
                <thead>
                  <tr>
                    <th scope="col">{t("products.sku")}</th>
                    <th scope="col">{t("products.name")}</th>
                    <th scope="col">{t("products.unit")}</th>
                    <th scope="col" className="num">
                      {t("products.unitCost")}
                    </th>
                    <th scope="col" className="num">
                      {t("products.minStock")}
                    </th>
                    <th scope="col" className="num">
                      {t("import.opening")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, PREVIEW_ROWS).map((row) => (
                    <tr key={row.sku}>
                      <td>{row.sku}</td>
                      <td>{row.name}</td>
                      <td>{row.unit}</td>
                      <td className="num">{formatTaka(row.unitCost)}</td>
                      <td className="num">{row.minStock}</td>
                      <td className="num">{row.openingStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.rows.length > PREVIEW_ROWS ? (
              <p className="muted">
                {t("import.more", {
                  count: preview.rows.length - PREVIEW_ROWS,
                })}
              </p>
            ) : null}
            <div className="form-actions">
              <ButtonPrimary
                type="button"
                testId="import-save-button"
                busy={importProducts.isPending}
                onClick={() => void upload()}
              >
                {t("import.save", { count: preview.rows.length })}
              </ButtonPrimary>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
