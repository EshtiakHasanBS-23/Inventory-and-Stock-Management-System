/**
 * Stock count: enter what is physically on the shelf. The difference from
 * the recorded quantity is saved as a "Stock count" movement, so the history
 * shows who counted, when, and how much was missing or extra.
 */
import type { CountResult } from "@mojud/contracts";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import {
  toFailure,
  useProducts,
  useRecordCount,
  type FormFailure,
} from "../../api/stock";
import { ButtonPrimary } from "../../components/Buttons";
import { FormErrorSummary } from "../../components/FormErrorSummary";
import { InputField } from "../../components/InputField";
import { SelectField } from "../../components/SelectField";
import { formatTaka } from "../../format";
import { usePageTitle } from "../usePageTitle";

function resultText(
  t: (key: string, values?: Record<string, unknown>) => string,
  result: CountResult,
  unit: string,
): string {
  if (result.difference === 0) {
    return t("count.matched", { counted: result.counted, unit });
  }
  const values = {
    counted: result.counted,
    previous: result.previous,
    unit,
    amount: Math.abs(result.difference),
    value: formatTaka(result.movement?.value ?? 0),
  };
  return result.difference < 0
    ? t("count.missing", values)
    : t("count.extra", values);
}

export function CountPage() {
  const { t } = useTranslation();
  usePageTitle(t("count.title"));
  const [params] = useSearchParams();
  const products = useProducts();
  const record = useRecordCount();
  const [productId, setProductId] = useState(params.get("productId") ?? "");
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [saved, setSaved] = useState<{ text: string; short: boolean } | null>(
    null,
  );
  const [submitCount, setSubmitCount] = useState(0);

  const selected = products.data?.find((p) => p.id === productId);
  const fieldError = (field: string) =>
    failure?.field === field ? failure.message : undefined;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (record.isPending) return;
    setFailure(null);
    setSaved(null);
    const unit = selected?.unit ?? "";
    try {
      const result = await record.mutateAsync({
        productId,
        countedQuantity: counted.trim() === "" ? Number.NaN : Number(counted),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setSaved({
        text: resultText(t, result, unit),
        short: result.difference < 0,
      });
      setCounted("");
      setNote("");
    } catch (error) {
      setFailure(toFailure(error, t("errors.saveFailed")));
      setSubmitCount((count) => count + 1);
    }
  };

  return (
    <section data-testid="count-page">
      <h1>{t("count.title")}</h1>
      <p className="muted">{t("count.intro")}</p>
      {saved ? (
        <p
          className={saved.short ? "success success--warning" : "success"}
          role="status"
          data-testid="count-saved"
        >
          {saved.text}
        </p>
      ) : null}
      {products.data && products.data.length === 0 ? (
        <p data-testid="count-no-products">
          {t("stock.noProducts")}{" "}
          <Link to="/products">{t("stock.addProducts")}</Link>
        </p>
      ) : null}
      <form
        className="panel"
        noValidate
        onSubmit={submit}
        data-testid="count-form"
      >
        <FormErrorSummary
          id="count-error-summary"
          testId="count-error-summary"
          formMessage={failure && !failure.field ? failure.message : undefined}
          focusKey={submitCount}
        />
        <SelectField
          id="count-product"
          label={t("stock.product")}
          value={productId}
          placeholder={t("stock.chooseProduct")}
          options={(products.data ?? []).map((p) => ({
            value: p.id,
            label: `${p.name} (${p.sku})`,
          }))}
          error={fieldError("productId")}
          onChange={setProductId}
          testId="count-product-select"
        />
        {selected ? (
          <p className="muted" data-testid="count-recorded">
            {t("count.recorded", {
              count: selected.onHand,
              unit: selected.unit,
            })}
          </p>
        ) : null}
        <InputField
          id="count-quantity"
          label={t("count.counted")}
          value={counted}
          inputMode="numeric"
          error={fieldError("countedQuantity")}
          onChange={setCounted}
          testId="count-quantity-input"
        />
        <InputField
          id="count-note"
          label={t("stock.note")}
          value={note}
          error={fieldError("note")}
          onChange={setNote}
          testId="count-note-input"
        />
        <ButtonPrimary testId="count-save-button" busy={record.isPending}>
          {t("count.save")}
        </ButtonPrimary>
      </form>
    </section>
  );
}
