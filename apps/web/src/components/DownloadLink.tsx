/**
 * A link that downloads a CSV from the API. A plain GET carries the session
 * cookie, so no script is needed.
 */
export function DownloadLink({
  href,
  label,
  testId,
}: {
  href: string;
  label: string;
  testId: string;
}) {
  return (
    <a
      className="button button--secondary"
      href={href}
      download
      data-testid={testId}
    >
      {label}
    </a>
  );
}
