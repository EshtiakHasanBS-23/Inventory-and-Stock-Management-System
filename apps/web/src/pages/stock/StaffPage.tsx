/**
 * Staff (Owner only): add people with a role, and deactivate or reactivate
 * them. A deactivated person cannot sign in; their history stays.
 */
import {
  STAFF_ROLES,
  type StaffMember,
  type StaffRole,
} from "@mojud/contracts";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  toFailure,
  useAddStaff,
  useResetStaffPassword,
  useSetStaffActive,
  useStaff,
  type FormFailure,
} from "../../api/stock";
import { ButtonPrimary, ButtonSecondary } from "../../components/Buttons";
import { FormErrorSummary } from "../../components/FormErrorSummary";
import { Icon } from "../../components/Icons";
import { InputField } from "../../components/InputField";
import { PasswordField } from "../../components/PasswordField";
import { SelectField } from "../../components/SelectField";
import { usePageTitle } from "../usePageTitle";

function AddStaffForm() {
  const { t } = useTranslation();
  const add = useAddStaff();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("warehouse_worker");
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const fieldError = (field: string) =>
    failure?.field === field ? failure.message : undefined;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (add.isPending) return;
    setFailure(null);
    setAdded(null);
    try {
      const member = await add.mutateAsync({ name, phone, password, role });
      setAdded(t("staff.added", { name: member.name }));
      setName("");
      setPhone("");
      setPassword("");
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
      data-testid="staff-form"
    >
      <h2>{t("staff.addHeading")}</h2>
      {added ? (
        <p className="success" role="status" data-testid="staff-added">
          {added}
        </p>
      ) : null}
      <FormErrorSummary
        id="staff-error-summary"
        testId="staff-error-summary"
        formMessage={failure && !failure.field ? failure.message : undefined}
        focusKey={submitCount}
      />
      <div className="form-grid form-grid--4">
        <InputField
          id="staff-name"
          label={t("staff.name")}
          value={name}
          error={fieldError("name")}
          onChange={setName}
          testId="staff-name-input"
        />
        <InputField
          id="staff-phone"
          label={t("staff.phone")}
          hint={t("staff.phoneHint")}
          value={phone}
          type="tel"
          inputMode="tel"
          error={fieldError("phone")}
          onChange={setPhone}
          testId="staff-phone-input"
        />
        <PasswordField
          id="staff-password"
          label={t("staff.password")}
          value={password}
          autoComplete="new-password"
          error={fieldError("password")}
          testId="staff-password-input"
          onChange={setPassword}
        />
        <SelectField
          id="staff-role"
          label={t("staff.role")}
          value={role}
          options={STAFF_ROLES.map((value) => ({
            value,
            label: t(`roles.${value}`),
          }))}
          error={fieldError("role")}
          onChange={(value) => setRole(value as StaffRole)}
          testId="staff-role-select"
        />
      </div>
      <div className="form-actions">
        <ButtonPrimary testId="staff-save-button" busy={add.isPending}>
          {t("staff.add")}
        </ButtonPrimary>
      </div>
    </form>
  );
}

/** The Owner sets a new password for someone who forgot theirs. */
function ResetPasswordForm({
  member,
  onDone,
}: {
  member: StaffMember;
  onDone: (message: string | null) => void;
}) {
  const { t } = useTranslation();
  const reset = useResetStaffPassword();
  const [newPassword, setNewPassword] = useState("");
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [submitCount, setSubmitCount] = useState(0);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (reset.isPending) return;
    setFailure(null);
    try {
      await reset.mutateAsync({ id: member.id, newPassword });
      onDone(t("staff.passwordReset", { name: member.name }));
    } catch (error) {
      setFailure(toFailure(error, t("errors.saveFailed")));
      setSubmitCount((count) => count + 1);
    }
  };

  return (
    <form
      className="panel"
      noValidate
      onSubmit={submit}
      data-testid="reset-form"
    >
      <h2>{t("staff.resetHeading", { name: member.name })}</h2>
      <p className="muted">{t("staff.resetIntro")}</p>
      <FormErrorSummary
        id="reset-error-summary"
        testId="reset-error-summary"
        formMessage={failure && !failure.field ? failure.message : undefined}
        focusKey={submitCount}
      />
      <PasswordField
        id="reset-password"
        label={t("staff.newPassword")}
        hint={t("signup.passwordHint")}
        value={newPassword}
        autoComplete="new-password"
        error={failure?.field === "newPassword" ? failure.message : undefined}
        testId="reset-password-input"
        onChange={setNewPassword}
      />
      <div className="form-actions">
        <ButtonPrimary testId="reset-save-button" busy={reset.isPending}>
          {t("staff.setPassword")}
        </ButtonPrimary>
        <ButtonSecondary
          testId="reset-cancel-button"
          onClick={() => onDone(null)}
        >
          {t("common.cancel")}
        </ButtonSecondary>
      </div>
    </form>
  );
}

export function StaffPage() {
  const { t } = useTranslation();
  usePageTitle(t("staff.title"));
  const staff = useStaff();
  const setActive = useSetStaffActive();
  const [rowError, setRowError] = useState<string | null>(null);
  const [resetting, setResetting] = useState<StaffMember | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const toggle = async (id: string, active: boolean) => {
    setRowError(null);
    try {
      await setActive.mutateAsync({ id, active });
    } catch (error) {
      setRowError(toFailure(error, t("errors.saveFailed")).message);
    }
  };

  return (
    <section data-testid="staff-page">
      <div className="page-header">
        <h1>{t("staff.title")}</h1>
        <p className="page-header__sub">{t("staff.subtitle")}</p>
      </div>
      {notice ? (
        <p className="success" role="status" data-testid="staff-notice">
          {notice}
        </p>
      ) : null}
      {resetting ? (
        <ResetPasswordForm
          key={resetting.id}
          member={resetting}
          onDone={(message) => {
            setResetting(null);
            setNotice(message);
          }}
        />
      ) : (
        <AddStaffForm />
      )}
      {rowError ? (
        <p className="refusal" role="alert">
          {rowError}
        </p>
      ) : null}
      {staff.isPending ? <p>{t("app.loading")}</p> : null}
      {staff.isError ? (
        <p className="refusal">{t("errors.loadFailed")}</p>
      ) : null}
      {staff.data ? (
        <>
          <div className="list-toolbar">
            <h2 className="list-toolbar__title">{t("staff.team")}</h2>
            <p className="list-toolbar__count" data-testid="staff-count">
              {t("staff.count", { count: staff.data.length })}
            </p>
          </div>
          <div className="table-wrap">
            <table
              className="data-table data-table--stack"
              data-testid="staff-table"
            >
              <thead>
                <tr>
                  <th scope="col">{t("staff.name")}</th>
                  <th scope="col">{t("staff.phone")}</th>
                  <th scope="col">{t("staff.role")}</th>
                  <th scope="col">{t("staff.status")}</th>
                  <th scope="col">
                    <span className="visually-hidden">
                      {t("products.actions")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.data.map((member) => (
                  <tr
                    key={member.id}
                    data-testid={`staff-row-${member.phone}`}
                    className={member.active ? undefined : "row--inactive"}
                  >
                    <td className="cell-title" data-label={t("staff.name")}>
                      <span className="person">
                        <span className="person__avatar" aria-hidden="true">
                          {member.name.trim().charAt(0).toUpperCase()}
                        </span>
                        {member.name}
                      </span>
                    </td>
                    <td className="cell-code" data-label={t("staff.phone")}>
                      {member.phone}
                    </td>
                    <td data-label={t("staff.role")}>
                      <span
                        className={`pill pill--role${member.role === "owner" ? " pill--owner" : ""}`}
                      >
                        {t(`roles.${member.role}`)}
                      </span>
                    </td>
                    <td data-label={t("staff.status")}>
                      <span
                        className={`badge ${member.active ? "badge--ok" : "badge--muted"}`}
                      >
                        <Icon name={member.active ? "check" : "x"} size={14} />
                        {member.active
                          ? t("staff.active")
                          : t("staff.inactive")}
                      </span>
                    </td>
                    <td className="cell-actions">
                      {member.role === "owner" ? (
                        <span className="muted">{t("staff.ownerNote")}</span>
                      ) : (
                        <div className="row-actions">
                          <button
                            type="button"
                            className="chip-button"
                            data-testid={`staff-reset-${member.phone}`}
                            aria-label={t("staff.resetPassword", {
                              name: member.name,
                            })}
                            onClick={() => {
                              setNotice(null);
                              setResetting(member);
                            }}
                          >
                            <Icon name="key" size={16} />
                            {t("staff.resetShort")}
                          </button>
                          <button
                            type="button"
                            className={`chip-button${member.active ? " chip-button--danger" : ""}`}
                            data-testid={`staff-toggle-${member.phone}`}
                            aria-label={
                              member.active
                                ? t("staff.deactivate", { name: member.name })
                                : t("staff.reactivate", { name: member.name })
                            }
                            onClick={() =>
                              void toggle(member.id, !member.active)
                            }
                          >
                            <Icon
                              name={member.active ? "x" : "check"}
                              size={16}
                            />
                            {member.active
                              ? t("staff.deactivateShort")
                              : t("staff.reactivateShort")}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
