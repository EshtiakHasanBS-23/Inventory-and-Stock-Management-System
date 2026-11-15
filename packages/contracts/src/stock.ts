import { z } from "zod";

/** Products, stock movements and the dashboard (simplified-plan.md S1–S4). */

export const SKU_MAX_LENGTH = 40;
export const PRODUCT_NAME_MAX_LENGTH = 100;
export const UNIT_MAX_LENGTH = 20;
export const NOTE_MAX_LENGTH = 200;
/** Upper bound on one movement or a minimum stock level (input size cap). */
export const QUANTITY_MAX = 1_000_000;

/** Upper bound on one unit's cost, in taka. */
export const UNIT_COST_MAX = 10_000_000;

const quantity = z.number().int().min(1).max(QUANTITY_MAX);
const minStock = z.number().int().min(0).max(QUANTITY_MAX);
/** Taka with at most two decimals (whole poisha). */
const unitCost = z
  .number()
  .min(0)
  .max(UNIT_COST_MAX)
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6);

/** Money is stored in poisha (1 taka = 100 poisha) so sums stay exact. */
export function toPoisha(taka: number): number {
  return Math.round(taka * 100);
}

export function fromPoisha(poisha: number): number {
  return poisha / 100;
}

/** `POST /api/v1/products` body. */
export const CreateProductSchema = z.strictObject({
  sku: z.string().trim().min(1).max(SKU_MAX_LENGTH),
  name: z.string().trim().min(1).max(PRODUCT_NAME_MAX_LENGTH),
  unit: z.string().trim().min(1).max(UNIT_MAX_LENGTH),
  minStock,
  unitCost,
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

/** `PATCH /api/v1/products/:id` body: any of name, unit and minStock. */
export const UpdateProductSchema = CreateProductSchema.omit({ sku: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const PRODUCT_FIELD_MESSAGES = {
  sku: "Enter a SKU of up to 40 characters.",
  name: "Enter a product name.",
  unit: "Enter a unit, such as pcs or ctn.",
  minStock: "Enter a whole number, 0 or more.",
  unitCost: "Enter a cost in taka, 0 or more, with up to 2 decimals.",
} as const;

export type StockStatus = "ok" | "low" | "out";

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  minStock: number;
  onHand: number;
  /** Cost of one unit, in taka. */
  unitCost: number;
  /** onHand × unitCost, in taka. */
  stockValue: number;
  status: StockStatus;
}

/** A product is out at 0 and low at or below its minimum stock. */
export function stockStatus(onHand: number, min: number): StockStatus {
  if (onHand === 0) return "out";
  if (onHand <= min) return "low";
  return "ok";
}

export const DIRECTIONS = ["in", "out"] as const;
export type Direction = (typeof DIRECTIONS)[number];

/** The reasons allowed for each direction. */
export const REASONS = {
  in: ["purchase", "return", "adjustment"],
  out: ["sale", "damage", "adjustment"],
} as const satisfies Record<Direction, readonly string[]>;

/** `count` is only written by a stock count, never chosen by hand. */
export const ALL_REASONS = [
  "purchase",
  "return",
  "sale",
  "damage",
  "adjustment",
  "count",
] as const;

/** Stock leaving for these reasons is a loss, shown in taka. */
export const LOSS_REASONS: readonly Reason[] = ["damage", "count"];
export type Reason = (typeof ALL_REASONS)[number];

/** `POST /api/v1/stock/movements` body. */
export const RecordMovementSchema = z
  .strictObject({
    productId: z.uuid(),
    direction: z.enum(DIRECTIONS),
    reason: z.enum(ALL_REASONS),
    quantity,
    note: z.string().trim().max(NOTE_MAX_LENGTH).optional(),
  })
  .refine(
    (value) =>
      (REASONS[value.direction] as readonly string[]).includes(value.reason),
    { path: ["reason"] },
  );

export type RecordMovementInput = z.infer<typeof RecordMovementSchema>;

export const MOVEMENT_FIELD_MESSAGES = {
  productId: "Choose a product.",
  direction: "Choose stock in or stock out.",
  reason: "Choose a reason that fits the direction.",
  quantity: "Enter a whole number, 1 or more.",
  note: "Keep the note under 200 characters.",
} as const;

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  direction: Direction;
  reason: Reason;
  quantity: number;
  balanceAfter: number;
  /** quantity × the unit cost at the time, in taka. */
  value: number;
  note: string | null;
  userName: string;
  createdAt: string;
}

/** `POST /api/v1/stock/counts` body: the quantity physically counted. */
export const RecordCountSchema = z.strictObject({
  productId: z.uuid(),
  countedQuantity: z.number().int().min(0).max(QUANTITY_MAX),
  note: z.string().trim().max(NOTE_MAX_LENGTH).optional(),
});

export type RecordCountInput = z.infer<typeof RecordCountSchema>;

export const COUNT_FIELD_MESSAGES = {
  productId: "Choose a product.",
  countedQuantity: "Enter the counted quantity, 0 or more.",
  note: "Keep the note under 200 characters.",
} as const;

export interface CountResult {
  /** The quantity the system had before the count. */
  previous: number;
  counted: number;
  /** counted − previous: below zero means stock is missing. */
  difference: number;
  /** The count adjustment, or null when the count matched. */
  movement: Movement | null;
}

export interface Dashboard {
  productCount: number;
  totalUnits: number;
  /** Sum of every product's stock value, in taka. */
  stockValue: number;
  /** Damage and count shortfalls in the last 30 days, in taka. */
  lossValue30d: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStock: Product[];
  recentMovements: Movement[];
}
