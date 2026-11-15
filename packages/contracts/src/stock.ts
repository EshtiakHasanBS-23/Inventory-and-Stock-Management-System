import { z } from "zod";

/** Products, stock movements and the dashboard (simplified-plan.md S1–S4). */

export const SKU_MAX_LENGTH = 40;
export const PRODUCT_NAME_MAX_LENGTH = 100;
export const UNIT_MAX_LENGTH = 20;
export const NOTE_MAX_LENGTH = 200;
/** Upper bound on one movement or a minimum stock level (input size cap). */
export const QUANTITY_MAX = 1_000_000;

const quantity = z.number().int().min(1).max(QUANTITY_MAX);
const minStock = z.number().int().min(0).max(QUANTITY_MAX);

/** `POST /api/v1/products` body. */
export const CreateProductSchema = z.strictObject({
  sku: z.string().trim().min(1).max(SKU_MAX_LENGTH),
  name: z.string().trim().min(1).max(PRODUCT_NAME_MAX_LENGTH),
  unit: z.string().trim().min(1).max(UNIT_MAX_LENGTH),
  minStock,
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
} as const;

export type StockStatus = "ok" | "low" | "out";

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  minStock: number;
  onHand: number;
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

export const ALL_REASONS = [
  "purchase",
  "return",
  "sale",
  "damage",
  "adjustment",
] as const;
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
  note: string | null;
  userName: string;
  createdAt: string;
}

export interface Dashboard {
  productCount: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStock: Product[];
  recentMovements: Movement[];
}
