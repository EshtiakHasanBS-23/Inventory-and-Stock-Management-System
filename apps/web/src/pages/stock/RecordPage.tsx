/**
 * My record (PRD FR-51): a person's own work today, this week and this
 * month, as proof of what they did. Owners and Managers can pick anyone.
 */
import type { RecordPeriod } from "@mojud/contracts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePeople, useWorkRecord } from "../../api/stock";
import { Icon, type IconName } from "../../components/Icons";
import { SelectField } from "../../components/SelectField";
import { canManageProducts } from "../../session/roles";
import { useSession } from "../../session/SessionProvider";
import { usePageTitle } from "../usePageTitle";

function Line({
  icon,
  label,
  value,
  detail,
}: {
  icon: IconName;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="record-line">
      <span className="record-line__icon">
        <Icon name={icon} />
      </span>
      <span className="record-line__text">
        <span className="record-line__label">{label}</span>
        <span className="muted">{detail}</span>
      </span>
      <span className="record-line__value">{value}</span>
    </div>
  );
}

function Period({
  title,
  period,
  testId,
}: {
  title: string;
  period: RecordPeriod;
  testId: string;
}) {
  const { t } = useTranslation();
  return (
    <section className="card" data-testid={testId}>
      <h2>{title}</h2>
      <Line
        icon="swap"
        label={t("record.movements")}
        value={period.movements}
        detail={t("record.unitsInOut", {
          in: period.unitsIn,
          out: period.unitsOut,
        })}
      />
      <Line
        icon="clipboard"
        label={t("record.counts")}
        value={period.counts}
        detail={t("record.countDiff", {
          missing: period.countMissing,
          extra: period.countExtra,
        })}
      />
      <Line
        icon="alert"
        label={t("record.flags")}
        value={period.flagsRaised}
        detail={t("record.flagOutcome", {
          approved: period.flagsApproved,
          rejected: period.flagsRejected,
          pending: period.flagsPending,
        })}
      />
      <Line
        icon="check"
        label={t("record.decisions")}
        value={period.decisions}
        detail=""
      />
    </section>
  );
}

export function RecordPage() {
  const { t } = useTranslation();
  usePageTitle(t("record.title"));
  const { session } = useSession();
  const canPick = session ? canManageProducts(session.role) : false;
  const [userId, setUserId] = useState("");
  const people = usePeople();
  const record = useWorkRecord(userId);

  return (
    <section data-testid="record-page">
      <div className="page-header">
        <h1>{t("record.title")}</h1>
        <p className="page-header__sub">{t("record.intro")}</p>
      </div>
      {canPick ? (
        <div className="toolbar">
          <SelectField
            id="record-person"
            label={t("record.person")}
            value={userId}
            placeholder={t("record.me")}
            options={(people.data ?? [])
              .filter((person) => person.id !== session?.userId)
              .map((person) => ({ value: person.id, label: person.name }))}
            onChange={setUserId}
            testId="record-person-select"
          />
        </div>
      ) : null}
      {record.isPending ? <p>{t("app.loading")}</p> : null}
      {record.isError ? (
        <p className="refusal">{t("errors.loadFailed")}</p>
      ) : null}
      {record.data ? (
        <>
          <p className="record-name" data-testid="record-name">
            {record.data.name}
          </p>
          <div className="record-grid">
            <Period
              title={t("record.today")}
              period={record.data.today}
              testId="record-today"
            />
            <Period
              title={t("record.week")}
              period={record.data.week}
              testId="record-week"
            />
            <Period
              title={t("record.month")}
              period={record.data.month}
              testId="record-month"
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
