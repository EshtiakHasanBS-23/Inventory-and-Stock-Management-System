/**
 * Flag damage (PRD FR-13): the units leave sellable stock now and wait,
 * as damaged, for a supervisor, manager or owner to approve or reject.
 */
import type { Approval } from "@mojud/contracts";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  toFailure,
  useFlagDamage,
  useProducts,
  type FormFailure,
} from "../../api/stock";
import { FormErrorSummary } from "../../components/FormErrorSummary";
import { Icon } from "../../components/Icons";
import { InputField } from "../../components/InputField";
import { SelectField } from "../../components/SelectField";
import { formatTaka } from "../../format";
import { usePageTitle } from "../usePageTitle";

export function DamagePage() {
  const { t } = useTranslation();
  usePageTitle(t("damage.title"));
  const [params] = useSearchParams();
  const products = useProducts();
  const flag = useFlagDamage();
  const [productId, setProductId] = useState(params.get("productId") ?? "");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [saved, setSaved] = useState<Approval | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const selected = products.data?.find((p) => p.id === productId);
  const fieldError = (field: string) =>
    failure?.field === field ? failure.message : undefined;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (flag.isPending) return;
    setFailure(null);
    setSaved(null);
    try {
      setSaved(
        await flag.mutateAsync({
          productId,
          quantity: quantity.trim() === "" ? Number.NaN : Number(quantity),
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      );
      setQuantity("1");
      setNote("");
    } catch (error) {
      setFailure(toFailure(error, t("errors.saveFailed")));
      setSubmitCount((count) => count + 1);
    }
  };

  return (
    <section data-testid="damage-page">
      <div className="page-header">
        <h1>{t("damage.title")}</h1>
        <p className="page-header__sub">{t("damage.intro")}</p>
      </div>
      {saved ? (
        <p className="success" role="status" data-testid="damage-saved">
          {t("damage.saved", {
            quantity: saved.quantity,
            unit: saved.unit,
            product: saved.productName,
            value: formatTaka(saved.value),
          })}
        </p>
      ) : null}
      <form
        className="panel"
        noValidate
        onSubmit={submit}
        data-testid="damage-form"
      >
        <FormErrorSummary
          id="damage-error-summary"
          testId="damage-error-summary"
          formMessage={failure && !failure.field ? failure.message : undefined}
          focusKey={submitCount}
        />
        <SelectField
          id="damage-product"
          label={t("stock.product")}
          value={productId}
          placeholder={t("stock.chooseProduct")}
          options={(products.data ?? []).map((p) => ({
            value: p.id,
            label: `${p.name} (${p.sku})`,
          }))}
          error={fieldError("productId")}
          onChange={setProductId}
          testId="damage-product-select"
        />
        {selected ? (
          <p className="muted" data-testid="damage-on-hand">
            {t("stock.onHand", {
              count: selected.onHand,
              unit: selected.unit,
            })}
          </p>
        ) : null}
        <InputField
          id="damage-quantity"
          label={t("damage.quantity")}
          value={quantity}
          inputMode="numeric"
          error={fieldError("quantity")}
          onChange={setQuantity}
          testId="damage-quantity-input"
        />
        <InputField
          id="damage-note"
          label={t("stock.note")}
          value={note}
          error={fieldError("note")}
          onChange={setNote}
          testId="damage-note-input"
        />
        <button
          type="submit"
          className="button button--danger"
          data-testid="damage-save-button"
          aria-busy={flag.isPending || undefined}
        >
          <Icon name="alert" />
          {t("damage.save")}
        </button>
      </form>
    </section>
  );
}
