/** Taka with lakh grouping and up to 2 decimals: ৳12,45,000 or ৳1,250.5. */
const TAKA = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatTaka(value: number): string {
  return `৳${TAKA.format(value)}`;
}
