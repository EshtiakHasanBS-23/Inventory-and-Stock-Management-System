/**
 * My password: anyone changes their own password with their current one.
 * Other devices signed in as this person are signed out; this one stays.
 */
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  toFailure,
  useChangePassword,
  type FormFailure,
} from "../../api/stock";
import { ButtonPrimary } from "../../components/Buttons";
import { FormErrorSummary } from "../../components/FormErrorSummary";
import { PasswordField } from "../../components/PasswordField";
import { usePageTitle } from "../usePageTitle";

export function AccountPage() {
  const { t } = useTranslation();
  usePageTitle(t("account.title"));
  const change = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const fieldError = (field: string) =>
    failure?.field === field ? failure.message : undefined;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (change.isPending) return;
    setFailure(null);
    setSaved(false);
    try {
      await change.mutateAsync({ currentPassword, newPassword });
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setFailure(toFailure(error, t("errors.saveFailed")));
      setSubmitCount((count) => count + 1);
    }
  };

  return (
    <section data-testid="account-page">
      <h1>{t("account.title")}</h1>
      {saved ? (
        <p className="success" role="status" data-testid="account-saved">
          {t("account.saved")}
        </p>
      ) : null}
      <form
        className="panel"
        noValidate
        onSubmit={submit}
        data-testid="account-form"
      >
        <FormErrorSummary
          id="account-error-summary"
          testId="account-error-summary"
          formMessage={failure && !failure.field ? failure.message : undefined}
          focusKey={submitCount}
        />
        <PasswordField
          id="account-current"
          label={t("account.current")}
          value={currentPassword}
          autoComplete="current-password"
          error={fieldError("currentPassword")}
          testId="account-current-input"
          onChange={setCurrentPassword}
        />
        <PasswordField
          id="account-new"
          label={t("account.new")}
          hint={t("signup.passwordHint")}
          value={newPassword}
          autoComplete="new-password"
          error={fieldError("newPassword")}
          testId="account-new-input"
          onChange={setNewPassword}
        />
        <ButtonPrimary testId="account-save-button" busy={change.isPending}>
          {t("account.save")}
        </ButtonPrimary>
      </form>
    </section>
  );
}
