import { useTranslation } from "react-i18next";
import { ButtonSecondary } from "./Buttons";

export interface LoadMoreProps {
  testId: string;
  onClick: () => void;
  /** While the next page is on its way the label reads "Loading…". */
  loading?: boolean;
}

/** load-more: shows the next page of a long list below the rows on screen. */
export function LoadMore({ testId, onClick, loading = false }: LoadMoreProps) {
  const { t } = useTranslation();
  return (
    <div className="load-more">
      <ButtonSecondary testId={testId} onClick={onClick}>
        {loading ? t("app.loading") : t("common.loadMore")}
      </ButtonSecondary>
    </div>
  );
}
