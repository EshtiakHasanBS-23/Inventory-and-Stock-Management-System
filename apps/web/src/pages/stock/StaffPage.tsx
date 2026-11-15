/**
 * Staff (Owner only): add people with a role, and deactivate or reactivate
 * them. A deactivated person cannot sign in; their history stays.
 */
import { STAFF_ROLES, type StaffRole } from "@mojud/contracts";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  toFailure,
  useAddStaff,
  useSetStaffActive,
  useStaff,
  type FormFailure,
} from "../../api/stock";
import { ButtonPrimary } from "../../components/Buttons";
import { FormErrorSummary } from "../../components/FormErrorSummary";
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
      className="panel"
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
      <div className="form-grid">
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

export function StaffPage() {
  const { t } = useTranslation();
  usePageTitle(t("staff.title"));
  const staff = useStaff();
  const setActive = useSetStaffActive();
  const [rowError, setRowError] = useState<string | null>(null);

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
      <h1>{t("staff.title")}</h1>
      <AddStaffForm />
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
        <div className="table-wrap">
          <table className="data-table" data-testid="staff-table">
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
                <tr key={member.id} data-testid={`staff-row-${member.phone}`}>
                  <td>{member.name}</td>
                  <td>{member.phone}</td>
                  <td>{t(`roles.${member.role}`)}</td>
                  <td>
                    {member.active ? t("staff.active") : t("staff.inactive")}
                  </td>
                  <td>
                    {member.role === "owner" ? null : (
                      <button
                        type="button"
                        className="link-button"
                        data-testid={`staff-toggle-${member.phone}`}
                        onClick={() => void toggle(member.id, !member.active)}
                      >
                        {member.active
                          ? t("staff.deactivate", { name: member.name })
                          : t("staff.reactivate", { name: member.name })}
                      </button>
                    )}
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
