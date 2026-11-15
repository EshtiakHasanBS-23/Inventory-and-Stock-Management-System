/** Taka with lakh grouping and up to 2 decimals: ৳12,45,000 or ৳1,250.5. */
const TAKA = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatTaka(value: number): string {
  return `৳${TAKA.format(value)}`;
}

/** Start of a local calendar day ("2026-11-16"), as an ISO date-time. */
export function dayStartIso(day: string): string {
  return new Date(`${day}T00:00:00`).toISOString();
}

/** Start of the day after a local calendar day: an exclusive end. */
export function nextDayStartIso(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}
