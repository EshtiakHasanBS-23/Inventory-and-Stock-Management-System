/**
 * Stock module: products, stock movements and the dashboard
 * (simplified-plan.md S1–S4). Every query is scoped to the caller's business.
 *
 * Stock rules:
 * - A movement and the product's new quantity are written in one transaction.
 * - The quantity update is conditional (`on_hand + delta >= 0`), so two
 *   requests racing for the last unit can never take stock below zero.
 * - Movements are append-only; the database refuses updates and deletes.
 * - A stock count locks the product row, then records the difference as a
 *   `count` movement through the same path.
 * Money is stored in poisha and sent to the web app in taka.
 */
import {
  COUNT_FIELD_MESSAGES,
  CreateProductSchema,
  fromPoisha,
  LOSS_REASONS,
  MOVEMENT_FIELD_MESSAGES,
  PRODUCT_FIELD_MESSAGES,
  RecordCountSchema,
  RecordMovementSchema,
  stockStatus,
  toPoisha,
  UpdateProductSchema,
  type CountResult,
  type Dashboard,
  type Direction,
  type Movement,
  type Product,
  type Reason,
} from "@mojud/contracts";
import { sql, type Transaction } from "kysely";
import { z } from "zod";
import type { Database, Db } from "../../../platform/db/db.js";
import {
  AppError,
  uniqueViolationConstraint,
} from "../../../platform/errors.js";
import { validate } from "../../../platform/validation.js";
import { authorize, type Caller } from "../../identity/index.js";

export interface StockDeps {
  db: Db;
}

const MANAGE_PRODUCTS_ROLES: ReadonlySet<string> = new Set([
  "owner",
  "manager",
]);

const IdSchema = z.uuid();
const MOVEMENT_LIMIT_MAX = 200;

function requireCaller(caller: Caller | undefined, action: string): Caller {
  authorize(caller, action);
  return caller as Caller;
}

function requireManager(caller: Caller | undefined, action: string): Caller {
  const checked = requireCaller(caller, action);
  if (!MANAGE_PRODUCTS_ROLES.has(checked.role)) {
    throw new AppError(
      "FORBIDDEN",
      undefined,
      "Only an owner or manager can do this.",
    );
  }
  return checked;
}

/** Any id that is not a UUID can never name a row: answer NOT_FOUND. */
function parseId(value: unknown): string {
  const result = IdSchema.safeParse(value);
  if (!result.success) throw new AppError("NOT_FOUND");
  return result.data;
}

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  unit: string;
  min_stock: number;
  on_hand: number;
  unit_cost: number;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    unit: row.unit,
    minStock: row.min_stock,
    onHand: row.on_hand,
    unitCost: fromPoisha(row.unit_cost),
    stockValue: fromPoisha(row.on_hand * row.unit_cost),
    status: stockStatus(row.on_hand, row.min_stock),
  };
}

const PRODUCT_COLUMNS = [
  "id",
  "sku",
  "name",
  "unit",
  "min_stock",
  "on_hand",
  "unit_cost",
] as const;

/** Escapes LIKE wildcards so a search for "50%" matches the text "50%". */
function likePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function listProducts(
  deps: StockDeps,
  caller: Caller | undefined,
  search?: string,
): Promise<Product[]> {
  const { businessId } = requireCaller(caller, "stock.products.list");
  let query = deps.db
    .selectFrom("products")
    .select(PRODUCT_COLUMNS)
    .where("business_id", "=", businessId);
  const text = search?.trim().slice(0, 100);
  if (text) {
    const pattern = likePattern(text);
    query = query.where((eb) =>
      eb.or([eb("name", "ilike", pattern), eb("sku", "ilike", pattern)]),
    );
  }
  const rows = await query.orderBy("name").orderBy("sku").execute();
  return rows.map(toProduct);
}

export async function createProduct(
  deps: StockDeps,
  caller: Caller | undefined,
  body: unknown,
): Promise<Product> {
  const { businessId } = requireManager(caller, "stock.products.create");
  const input = validate(CreateProductSchema, body, PRODUCT_FIELD_MESSAGES);
  try {
    const row = await deps.db
      .insertInto("products")
      .values({
        business_id: businessId,
        sku: input.sku,
        name: input.name,
        unit: input.unit,
        min_stock: input.minStock,
        unit_cost: toPoisha(input.unitCost),
      })
      .returning(PRODUCT_COLUMNS)
      .executeTakeFirstOrThrow();
    return toProduct(row);
  } catch (error) {
    if (uniqueViolationConstraint(error) === "products_business_sku_key") {
      throw new AppError(
        "DUPLICATE",
        "sku",
        "A product with this SKU already exists.",
      );
    }
    throw error;
  }
}

export async function updateProduct(
  deps: StockDeps,
  caller: Caller | undefined,
  id: unknown,
  body: unknown,
): Promise<Product> {
  const { businessId } = requireManager(caller, "stock.products.update");
  const productId = parseId(id);
  const input = validate(UpdateProductSchema, body, PRODUCT_FIELD_MESSAGES);
  const row = await deps.db
    .updateTable("products")
    .set({
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.unit === undefined ? {} : { unit: input.unit }),
      ...(input.minStock === undefined ? {} : { min_stock: input.minStock }),
      ...(input.unitCost === undefined
        ? {}
        : { unit_cost: toPoisha(input.unitCost) }),
    })
    .where("id", "=", productId)
    .where("business_id", "=", businessId)
    .returning(PRODUCT_COLUMNS)
    .executeTakeFirst();
  if (!row) throw new AppError("NOT_FOUND");
  return toProduct(row);
}

interface MovementRequest {
  productId: string;
  direction: Direction;
  reason: Reason;
  quantity: number;
  note: string | null;
}

/**
 * Applies one movement inside the caller's transaction: the conditional
 * quantity update, then the append-only movement row with the unit cost at
 * this moment. Refuses stock that would go below zero.
 */
async function applyMovement(
  trx: Transaction<Database>,
  caller: Caller,
  request: MovementRequest,
): Promise<Movement> {
  const delta =
    request.direction === "in" ? request.quantity : -request.quantity;
  const product = await trx
    .updateTable("products")
    .set((eb) => ({ on_hand: eb("on_hand", "+", delta) }))
    .where("id", "=", request.productId)
    .where("business_id", "=", caller.businessId)
    .where((eb) => eb(eb("on_hand", "+", delta), ">=", 0))
    .returning(["id", "sku", "name", "unit", "on_hand", "unit_cost"])
    .executeTakeFirst();

  if (!product) {
    const existing = await trx
      .selectFrom("products")
      .select(["on_hand", "unit"])
      .where("id", "=", request.productId)
      .where("business_id", "=", caller.businessId)
      .executeTakeFirst();
    if (!existing) {
      throw new AppError(
        "VALIDATION_FAILED",
        "productId",
        MOVEMENT_FIELD_MESSAGES.productId,
      );
    }
    throw new AppError(
      "INSUFFICIENT_STOCK",
      "quantity",
      `Only ${existing.on_hand} ${existing.unit} in stock.`,
    );
  }

  const movement = await trx
    .insertInto("stock_movements")
    .values({
      business_id: caller.businessId,
      product_id: product.id,
      direction: request.direction,
      reason: request.reason,
      quantity: request.quantity,
      balance_after: product.on_hand,
      unit_cost: product.unit_cost,
      note: request.note,
      user_id: caller.userId,
    })
    .returning(["id", "created_at"])
    .executeTakeFirstOrThrow();

  return {
    id: movement.id,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    unit: product.unit,
    direction: request.direction,
    reason: request.reason,
    quantity: request.quantity,
    balanceAfter: product.on_hand,
    value: fromPoisha(request.quantity * product.unit_cost),
    note: request.note,
    userName: caller.name,
    createdAt: movement.created_at.toISOString(),
  };
}

export async function recordMovement(
  deps: StockDeps,
  caller: Caller | undefined,
  body: unknown,
): Promise<Movement> {
  const checked = requireCaller(caller, "stock.movements.record");
  const input = validate(RecordMovementSchema, body, MOVEMENT_FIELD_MESSAGES);
  return deps.db.transaction().execute((trx) =>
    applyMovement(trx, checked, {
      productId: input.productId,
      direction: input.direction,
      reason: input.reason,
      quantity: input.quantity,
      note: input.note ? input.note : null,
    }),
  );
}

/**
 * Records a physical count. The product row is locked first, so a movement
 * saved at the same moment cannot slip between reading the quantity and
 * writing the difference.
 */
export async function recordCount(
  deps: StockDeps,
  caller: Caller | undefined,
  body: unknown,
): Promise<CountResult> {
  const checked = requireCaller(caller, "stock.counts.record");
  const input = validate(RecordCountSchema, body, COUNT_FIELD_MESSAGES);
  return deps.db.transaction().execute(async (trx) => {
    const product = await trx
      .selectFrom("products")
      .select(["on_hand"])
      .where("id", "=", input.productId)
      .where("business_id", "=", checked.businessId)
      .forUpdate()
      .executeTakeFirst();
    if (!product) {
      throw new AppError(
        "VALIDATION_FAILED",
        "productId",
        COUNT_FIELD_MESSAGES.productId,
      );
    }
    const difference = input.countedQuantity - product.on_hand;
    const counted = `Counted ${input.countedQuantity}, system had ${product.on_hand}.`;
    const movement =
      difference === 0
        ? null
        : await applyMovement(trx, checked, {
            productId: input.productId,
            direction: difference > 0 ? "in" : "out",
            reason: "count",
            quantity: Math.abs(difference),
            note: input.note ? `${counted} ${input.note}` : counted,
          });
    return {
      previous: product.on_hand,
      counted: input.countedQuantity,
      difference,
      movement,
    };
  });
}

async function queryMovements(
  db: Db,
  businessId: string,
  options: { productId?: string; limit: number },
): Promise<Movement[]> {
  let query = db
    .selectFrom("stock_movements as m")
    .innerJoin("products as p", "p.id", "m.product_id")
    .innerJoin("users as u", "u.id", "m.user_id")
    .select([
      "m.id",
      "m.product_id",
      "p.name as product_name",
      "p.sku",
      "p.unit",
      "m.direction",
      "m.reason",
      "m.quantity",
      "m.balance_after",
      "m.unit_cost",
      "m.note",
      "u.name as user_name",
      "m.created_at",
    ])
    .where("m.business_id", "=", businessId);
  if (options.productId)
    query = query.where("m.product_id", "=", options.productId);
  const rows = await query
    .orderBy("m.created_at", "desc")
    .orderBy("m.id", "desc")
    .limit(options.limit)
    .execute();
  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    sku: row.sku,
    unit: row.unit,
    direction: row.direction,
    reason: row.reason,
    quantity: row.quantity,
    balanceAfter: row.balance_after,
    value: fromPoisha(row.quantity * row.unit_cost),
    note: row.note,
    userName: row.user_name,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function listMovements(
  deps: StockDeps,
  caller: Caller | undefined,
  options: { productId?: unknown; limit?: unknown },
): Promise<Movement[]> {
  const { businessId } = requireCaller(caller, "stock.movements.list");
  const productId =
    options.productId === undefined || options.productId === ""
      ? undefined
      : parseId(options.productId);
  const parsedLimit = Number(options.limit);
  const limit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, MOVEMENT_LIMIT_MAX)
      : 100;
  return queryMovements(deps.db, businessId, { productId, limit });
}

export async function getDashboard(
  deps: StockDeps,
  caller: Caller | undefined,
): Promise<Dashboard> {
  const { businessId } = requireCaller(caller, "stock.dashboard");
  const rows = await deps.db
    .selectFrom("products")
    .select(PRODUCT_COLUMNS)
    .where("business_id", "=", businessId)
    .orderBy("name")
    .execute();
  const products = rows.map(toProduct);
  const losses = await deps.db
    .selectFrom("stock_movements")
    .select(["quantity", "unit_cost"])
    .where("business_id", "=", businessId)
    .where("direction", "=", "out")
    .where("reason", "in", LOSS_REASONS)
    .where("created_at", ">=", sql<Date>`now() - interval '30 days'`)
    .execute();
  const needsAttention = products
    .filter((product) => product.status !== "ok")
    .sort((a, b) => a.onHand - b.onHand);
  return {
    productCount: products.length,
    totalUnits: products.reduce((sum, product) => sum + product.onHand, 0),
    stockValue: fromPoisha(
      rows.reduce((sum, row) => sum + row.on_hand * row.unit_cost, 0),
    ),
    lossValue30d: fromPoisha(
      losses.reduce((sum, row) => sum + row.quantity * row.unit_cost, 0),
    ),
    lowStockCount: products.filter((product) => product.status === "low")
      .length,
    outOfStockCount: products.filter((product) => product.status === "out")
      .length,
    lowStock: needsAttention.slice(0, 10),
    recentMovements: await queryMovements(deps.db, businessId, { limit: 10 }),
  };
}
