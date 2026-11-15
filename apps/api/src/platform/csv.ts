/**
 * CSV for Excel: comma-separated, CRLF line ends, a UTF-8 byte order mark so
 * Excel reads Bangla names correctly, and quoting where needed. A text cell
 * starting with = + - @ (or a tab or carriage return) gets a leading
 * apostrophe, so a product named "=HYPERLINK(...)" is shown as text instead
 * of running as a formula (CSV injection). Numbers are written as numbers.
 */
import type { Response } from "express";

export type CsvCell = string | number | null | undefined;

const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(
  headers: readonly string[],
  rows: readonly (readonly CsvCell[])[],
): string {
  const lines = [headers, ...rows].map((row) => row.map(cell).join(","));
  const BOM = "\uFEFF";
  return `${BOM}${lines.join("\r\n")}\r\n`;
}

/** Sends CSV text as a file download with the given name. */
export function sendCsv(res: Response, filename: string, csv: string): void {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(csv);
}

const DHAKA = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "2026-11-16 14:30" in Bangladesh time, which Excel reads as a date. */
export function dhakaDateTime(iso: string): string {
  const parts = Object.fromEntries(
    DHAKA.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
