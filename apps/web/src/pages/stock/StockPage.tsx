/**
 * S2 Stock in / out: pick a product, direction, reason and quantity. The API
 * refuses a stock-out larger than the quantity on hand.
 */
import {
  REASONS,
  type Direction,
  type Movement,
  type Reason,
} from "@mojud/contracts";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import {
  toFailure,
  useProducts,
  useRecordMovement,
  type FormFailure,
} from "../../api/stock";
import { ButtonPrimary } from "../../components/Buttons";
import { FormErrorSummary } from "../../components/FormErrorSummary";
import { InputField } from "../../components/InputField";
import { SelectField } from "../../components/SelectField";
import { usePageTitle } from "../usePageTitle";

export function StockPage() {
  const { t } = useTranslation();
  usePageTitle(t("stock.title"));
  const [params] = useSearchParams();
  const products = useProducts();
  const record = useRecordMovement();
  const [productId, setProductId] = useState(params.get("productId") ?? "");
  const [direction, setDirection] = useState<Direction>("in");
  const [reason, setReason] = useState<Reason>("purchase");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [saved, setSaved] = useState<Movement | null>(null);
  const [submitCount, setSubmitCount] = useState(0);

  const selected = products.data?.find((p) => p.id === productId);
  const fieldError = (field: string) =>
    failure?.field === field ? failure.message : undefined;

  const changeDirection = (next: Direction) => {
    setDirection(next);
    setReason(REASONS[next][0]);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (record.isPending) return;
    setFailure(null);
    setSaved(null);
    try {
      const movement = await record.mutateAsync({
        productId,
        direction,
        reason,
        quantity: quantity.trim() === "" ? Number.NaN : Number(quantity),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setSaved(movement);
      setQuantity("");
      setNote("");
    } catch (error) {
      setFailure(toFailure(error, t("errors.saveFailed")));
      setSubmitCount((count) => count + 1);
    }
  };

  return (
    <section data-testid="stock-page">
      <h1>{t("stock.title")}</h1>
      {saved ? (
        <p className="success" role="status" data-testid="stock-saved">
          {t("stock.saved", {
            direction: t(`stock.direction.${saved.direction}`),
            quantity: saved.quantity,
            unit: saved.unit,
            product: saved.productName,
            balance: saved.balanceAfter,
          })}
        </p>
      ) : null}
      {products.data && products.data.length === 0 ? (
        <p data-testid="stock-no-products">
          {t("stock.noProducts")}{" "}
          <Link to="/products">{t("stock.addProducts")}</Link>
        </p>
      ) : null}
      <form
        className="panel"
        noValidate
        onSubmit={submit}
        data-testid="stock-form"
      >
        <FormErrorSummary
          id="stock-error-summary"
          testId="stock-error-summary"
          formMessage={failure && !failure.field ? failure.message : undefined}
          focusKey={submitCount}
        />
        <SelectField
          id="stock-product"
          label={t("stock.product")}
          value={productId}
          placeholder={t("stock.chooseProduct")}
          options={(products.data ?? []).map((p) => ({
            value: p.id,
            label: `${p.name} (${p.sku})`,
          }))}
          error={fieldError("productId")}
          onChange={setProductId}
          testId="stock-product-select"
        />
        {selected ? (
          <p className="muted" data-testid="stock-on-hand">
            {t("stock.onHand", { count: selected.onHand, unit: selected.unit })}
          </p>
        ) : null}
        <fieldset className="segmented">
          <legend>{t("stock.directionLabel")}</legend>
          {(["in", "out"] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="stock-direction"
                value={value}
                checked={direction === value}
                onChange={() => changeDirection(value)}
                data-testid={`stock-direction-${value}`}
              />
              {t(`stock.direction.${value}`)}
            </label>
          ))}
        </fieldset>
        <div className="form-grid">
          <SelectField
            id="stock-reason"
            label={t("stock.reason")}
            value={reason}
            options={REASONS[direction].map((value) => ({
              value,
              label: t(`stock.reasons.${value}`),
            }))}
            error={fieldError("reason")}
            onChange={(value) => setReason(value as Reason)}
            testId="stock-reason-select"
          />
          <InputField
            id="stock-quantity"
            label={t("stock.quantity")}
            value={quantity}
            inputMode="numeric"
            error={fieldError("quantity")}
            onChange={setQuantity}
            testId="stock-quantity-input"
          />
        </div>
        <InputField
          id="stock-note"
          label={t("stock.note")}
          value={note}
          error={fieldError("note")}
          onChange={setNote}
          testId="stock-note-input"
        />
        <ButtonPrimary testId="stock-save-button" busy={record.isPending}>
          {t("stock.save")}
        </ButtonPrimary>
      </form>
    </section>
  );
}
