import { z } from "zod";
import {
  CreateProductSchema,
  PRODUCT_FIELD_MESSAGES,
  QUANTITY_MAX,
} from "./stock.js";

/** Most rows one import may hold (request body cap is 100 KB as well). */
export const IMPORT_MAX_ROWS = 1000;

/**
 * The CSV columns of a product import, in template order. Headers are
 * matched without regard to case, spaces or underscores.
 */
export const IMPORT_COLUMNS = [
  "sku",
  "name",
  "unit",
  "unitCost",
  "minStock",
  "openingStock",
] as const;

export type ImportColumn = (typeof IMPORT_COLUMNS)[number];

/** One product row: a new product plus its opening quantity. */
export const ImportRowSchema = CreateProductSchema.extend({
  openingStock: z.number().int().min(0).max(QUANTITY_MAX),
});

export type ImportRow = z.infer<typeof ImportRowSchema>;

/** `POST /api/v1/products/import` body. */
export const ImportProductsSchema = z.strictObject({
  rows: z.array(ImportRowSchema).min(1).max(IMPORT_MAX_ROWS),
});

export const IMPORT_FIELD_MESSAGES: Readonly<Record<ImportColumn, string>> = {
  ...PRODUCT_FIELD_MESSAGES,
  openingStock: "Enter a whole number, 0 or more.",
};

export interface ImportResult {
  created: number;
  /** Units added as opening stock, across all rows. */
  openingUnits: number;
}

/** One product's line in the stock report for a date range. */
export interface ReportLine {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  /** Quantity at the start of the range. */
  opening: number;
  /** Purchases, returns and opening stock. */
  received: number;
  sold: number;
  damaged: number;
  /** Stock count differences: extra minus missing (below zero: missing). */
  countDifference: number;
  /** Hand adjustments: in minus out. */
  adjusted: number;
  /** Quantity at the end of the range. */
  closing: number;
  /** Taka, at the unit cost when each movement happened. */
  receivedValue: number;
  soldValue: number;
  damagedValue: number;
  /** Count shortfalls only, in taka. */
  missingValue: number;
}

export interface StockReport {
  from: string;
  to: string;
  lines: ReportLine[];
  totals: Omit<ReportLine, "productId" | "sku" | "name" | "unit">;
}

/** `GET /api/v1/reports/stock` query: a required range, `to` exclusive. */
export const ReportQuerySchema = z.object({
  from: z.iso.datetime(),
  to: z.iso.datetime(),
});

export const REPORT_QUERY_FIELD_MESSAGES = {
  from: "Enter a valid start date.",
  to: "Enter a valid end date.",
} as const;
