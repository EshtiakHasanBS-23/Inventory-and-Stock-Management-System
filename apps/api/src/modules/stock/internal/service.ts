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
  IMPORT_FIELD_MESSAGES,
  ImportProductsSchema,
  REPORT_QUERY_FIELD_MESSAGES,
  ReportQuerySchema,
  type ImportColumn,
  type ImportResult,
  type ReportLine,
  type StockReport,
  CreateProductSchema,
  fromPoisha,
  LOSS_REASONS,
  MOVEMENT_FIELD_MESSAGES,
  MOVEMENT_QUERY_FIELD_MESSAGES,
  MovementQuerySchema,
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
  type MovementQuery,
  type Product,
  type Reason,
} from "@mojud/contracts";
import { sql, type Transaction } from "kysely";
import { z } from "zod";
import { dhakaDateTime, toCsv } from "../../../platform/csv.js";
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
  damaged: number;
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
    damaged: row.damaged,
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
  "damaged",
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

export interface MovementRequest {
  productId: string;
  direction: Direction;
  reason: Reason;
  quantity: number;
  note: string | null;
  /** For a reversal: the movement it undoes. */
  reversesMovementId?: string;
}

/**
 * Applies one movement inside the caller's transaction: the conditional
 * quantity update, then the append-only movement row with the unit cost at
 * this moment. Refuses stock that would go below zero.
 */
export async function applyMovement(
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
      reverses_movement_id: request.reversesMovementId ?? null,
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
    reversesMovementId: request.reversesMovementId ?? null,
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
  // Segregation of duties (PRD FR-5, FR-29): only an Owner or Manager writes
  // damage off directly; everyone else flags it for a second person.
  if (input.reason === "damage" && !MANAGE_PRODUCTS_ROLES.has(checked.role)) {
    throw new AppError(
      "VALIDATION_FAILED",
      "reason",
      "Use Flag damage: a supervisor, manager or owner decides it.",
    );
  }
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
  options: Partial<MovementQuery> & { limit: number },
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
      "m.reverses_movement_id",
      "m.note",
      "u.name as user_name",
      "m.created_at",
    ])
    .where("m.business_id", "=", businessId);
  if (options.productId)
    query = query.where("m.product_id", "=", options.productId);
  if (options.userId) query = query.where("m.user_id", "=", options.userId);
  if (options.reason) query = query.where("m.reason", "=", options.reason);
  if (options.from)
    query = query.where("m.created_at", ">=", new Date(options.from));
  if (options.to)
    query = query.where("m.created_at", "<", new Date(options.to));
  const rows = await query
    .orderBy("m.created_at", "desc")
    .orderBy("m.id", "desc")
    .limit(options.limit)
    .offset(options.offset ?? 0)
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
    reversesMovementId: row.reverses_movement_id,
    note: row.note,
    userName: row.user_name,
    createdAt: row.created_at.toISOString(),
  }));
}

/** Drops empty query values, so `?reason=` means "any reason". */
export function withoutEmpty(
  query: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => typeof value === "string" && value !== "",
    ),
  );
}

export async function listMovements(
  deps: StockDeps,
  caller: Caller | undefined,
  query: Record<string, unknown>,
): Promise<Movement[]> {
  const { businessId } = requireCaller(caller, "stock.movements.list");
  const options = validate(
    MovementQuerySchema,
    withoutEmpty(query),
    MOVEMENT_QUERY_FIELD_MESSAGES,
  );
  return queryMovements(deps.db, businessId, options);
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
    .select(["direction", "reason", "quantity", "unit_cost"])
    .where("business_id", "=", businessId)
    .where("reason", "in", [...LOSS_REASONS, "damage_rejected"])
    .where("created_at", ">=", sql<Date>`now() - interval '30 days'`)
    .execute();
  // Poisha per source: direct write-offs, flags less rejections, and count
  // shortfalls (a count that found extra stock is not a loss).
  const lossPoisha = { damage: 0, damageFlagged: 0, missing: 0 };
  for (const row of losses) {
    const money = row.quantity * row.unit_cost;
    if (row.reason === "damage") lossPoisha.damage += money;
    else if (row.reason === "damage_flagged") lossPoisha.damageFlagged += money;
    else if (row.reason === "damage_rejected")
      lossPoisha.damageFlagged -= money;
    else if (row.reason === "count" && row.direction === "out")
      lossPoisha.missing += money;
  }
  const pending = await deps.db
    .selectFrom("approvals")
    .select((eb) => eb.fn.countAll<string>().as("n"))
    .where("business_id", "=", businessId)
    .where("status", "=", "pending")
    .executeTakeFirstOrThrow();
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
      lossPoisha.damage + lossPoisha.damageFlagged + lossPoisha.missing,
    ),
    lossBreakdown: {
      damage: fromPoisha(lossPoisha.damage),
      damageFlagged: fromPoisha(lossPoisha.damageFlagged),
      missing: fromPoisha(lossPoisha.missing),
    },
    pendingApprovals: Number(pending.n),
    damagedValue: fromPoisha(
      rows.reduce((sum, row) => sum + row.damaged * row.unit_cost, 0),
    ),
    lowStockCount: products.filter((product) => product.status === "low")
      .length,
    outOfStockCount: products.filter((product) => product.status === "out")
      .length,
    lowStock: needsAttention.slice(0, 10),
    recentMovements: await queryMovements(deps.db, businessId, { limit: 10 }),
  };
}

/**
 * Imports new products with their opening stock, all or nothing. Rows are
 * numbered as in the spreadsheet (row 1 is the header), so a refusal says
 * "Row 4: ..." for the person to fix. Opening stock is written as an
 * `opening` movement in the same transaction as the product.
 */
export async function importProducts(
  deps: StockDeps,
  caller: Caller | undefined,
  body: unknown,
): Promise<ImportResult> {
  const checked = requireManager(caller, "stock.products.import");
  const parsed = ImportProductsSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const [, index, field] = issue?.path ?? [];
    if (typeof index === "number" && typeof field === "string") {
      const message =
        IMPORT_FIELD_MESSAGES[field as ImportColumn] ?? "Check this row.";
      throw new AppError(
        "VALIDATION_FAILED",
        "rows",
        `Row ${index + 2}: ${message}`,
      );
    }
    throw new AppError(
      "VALIDATION_FAILED",
      "rows",
      "The file has no product rows, or more than 1000.",
    );
  }
  const rows = parsed.data.rows;

  const firstRowBySku = new Map<string, number>();
  rows.forEach((row, index) => {
    const earlier = firstRowBySku.get(row.sku);
    if (earlier !== undefined) {
      throw new AppError(
        "VALIDATION_FAILED",
        "rows",
        `Row ${index + 2}: SKU ${row.sku} is also on row ${earlier + 2}.`,
      );
    }
    firstRowBySku.set(row.sku, index);
  });

  return deps.db.transaction().execute(async (trx) => {
    const existing = await trx
      .selectFrom("products")
      .select("sku")
      .where("business_id", "=", checked.businessId)
      .where("sku", "in", [...firstRowBySku.keys()])
      .execute();
    const taken = existing[0];
    if (taken) {
      const row = (firstRowBySku.get(taken.sku) ?? 0) + 2;
      throw new AppError(
        "VALIDATION_FAILED",
        "rows",
        `Row ${row}: a product with SKU ${taken.sku} already exists.`,
      );
    }

    const created = await trx
      .insertInto("products")
      .values(
        rows.map((row) => ({
          business_id: checked.businessId,
          sku: row.sku,
          name: row.name,
          unit: row.unit,
          min_stock: row.minStock,
          unit_cost: toPoisha(row.unitCost),
          on_hand: row.openingStock,
        })),
      )
      .returning(["id", "sku", "on_hand", "unit_cost"])
      .execute();

    const opening = created.filter((product) => product.on_hand > 0);
    if (opening.length > 0) {
      await trx
        .insertInto("stock_movements")
        .values(
          opening.map((product) => ({
            business_id: checked.businessId,
            product_id: product.id,
            direction: "in" as const,
            reason: "opening" as const,
            quantity: product.on_hand,
            balance_after: product.on_hand,
            unit_cost: product.unit_cost,
            note: "Imported opening stock",
            user_id: checked.userId,
          })),
        )
        .execute();
    }
    return {
      created: created.length,
      openingUnits: opening.reduce((sum, p) => sum + p.on_hand, 0),
    };
  });
}

/** Every product with its stock and value, as CSV. */
export async function exportProductsCsv(
  deps: StockDeps,
  caller: Caller | undefined,
): Promise<string> {
  const products = await listProducts(deps, caller);
  return toCsv(
    [
      "SKU",
      "Name",
      "Unit",
      "In stock",
      "Minimum stock",
      "Status",
      "Unit cost (BDT)",
      "Stock value (BDT)",
    ],
    products.map((p) => [
      p.sku,
      p.name,
      p.unit,
      p.onHand,
      p.minStock,
      p.status,
      p.unitCost,
      p.stockValue,
    ]),
  );
}

/** Most movements one history export holds. */
const EXPORT_MAX_MOVEMENTS = 10_000;

/** The filtered history (same filters as the page, no paging), as CSV. */
export async function exportMovementsCsv(
  deps: StockDeps,
  caller: Caller | undefined,
  query: Record<string, unknown>,
): Promise<string> {
  const { businessId } = requireCaller(caller, "stock.movements.export");
  const { limit: _limit, offset: _offset, ...filters } = withoutEmpty(query);
  const options = validate(
    MovementQuerySchema,
    filters,
    MOVEMENT_QUERY_FIELD_MESSAGES,
  );
  const movements = await queryMovements(deps.db, businessId, {
    ...options,
    limit: EXPORT_MAX_MOVEMENTS,
    offset: 0,
  });
  return toCsv(
    [
      "Date (Dhaka time)",
      "SKU",
      "Product",
      "Direction",
      "Reason",
      "Quantity",
      "Unit",
      "Balance after",
      "Value (BDT)",
      "By",
      "Note",
    ],
    movements.map((m) => [
      dhakaDateTime(m.createdAt),
      m.sku,
      m.productName,
      m.direction,
      m.reason,
      m.quantity,
      m.unit,
      m.balanceAfter,
      m.value,
      m.userName,
      m.note,
    ]),
  );
}

type Totals = StockReport["totals"];

const EMPTY_TOTALS: Totals = {
  opening: 0,
  received: 0,
  sold: 0,
  damaged: 0,
  countDifference: 0,
  adjusted: 0,
  closing: 0,
  receivedValue: 0,
  soldValue: 0,
  damagedValue: 0,
  missingValue: 0,
};

const MONEY_KEYS = [
  "receivedValue",
  "soldValue",
  "damagedValue",
  "missingValue",
] as const;

/**
 * What happened to each product between `from` (inclusive) and `to`
 * (exclusive). Quantities at the start and end are worked back from today's
 * quantity and the movements since, so they always agree with the ledger.
 * Money is added up in poisha and converted once, so totals stay exact.
 */
export async function getStockReport(
  deps: StockDeps,
  caller: Caller | undefined,
  query: Record<string, unknown>,
): Promise<StockReport> {
  const { businessId } = requireCaller(caller, "stock.report");
  const range = validate(
    ReportQuerySchema,
    withoutEmpty(query),
    REPORT_QUERY_FIELD_MESSAGES,
  );
  const from = new Date(range.from);
  const to = new Date(range.to);
  if (to.getTime() <= from.getTime()) {
    throw new AppError(
      "VALIDATION_FAILED",
      "to",
      "The end date must be on or after the start date.",
    );
  }

  const products = await deps.db
    .selectFrom("products")
    .select(["id", "sku", "name", "unit", "on_hand"])
    .where("business_id", "=", businessId)
    .orderBy("name")
    .orderBy("sku")
    .execute();
  const movements = await deps.db
    .selectFrom("stock_movements")
    .select([
      "product_id",
      "direction",
      "reason",
      "quantity",
      "unit_cost",
      "created_at",
    ])
    .where("business_id", "=", businessId)
    .where("created_at", ">=", from)
    .execute();

  interface Work {
    line: Omit<ReportLine, (typeof MONEY_KEYS)[number]>;
    poisha: Record<(typeof MONEY_KEYS)[number], number>;
    netSinceFrom: number;
    netSinceTo: number;
    moved: boolean;
  }
  const work = new Map<string, Work>();
  for (const p of products) {
    work.set(p.id, {
      line: {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        unit: p.unit,
        opening: 0,
        received: 0,
        sold: 0,
        damaged: 0,
        countDifference: 0,
        adjusted: 0,
        closing: 0,
      },
      poisha: {
        receivedValue: 0,
        soldValue: 0,
        damagedValue: 0,
        missingValue: 0,
      },
      netSinceFrom: 0,
      netSinceTo: 0,
      moved: false,
    });
  }

  for (const m of movements) {
    const w = work.get(m.product_id);
    if (!w) continue;
    const signed = m.direction === "in" ? m.quantity : -m.quantity;
    const money = m.quantity * m.unit_cost;
    w.netSinceFrom += signed;
    if (m.created_at.getTime() >= to.getTime()) {
      w.netSinceTo += signed;
      continue;
    }
    w.moved = true;
    switch (m.reason) {
      case "purchase":
      case "return":
      case "opening":
        w.line.received += m.quantity;
        w.poisha.receivedValue += money;
        break;
      case "sale":
        w.line.sold += m.quantity;
        w.poisha.soldValue += money;
        break;
      case "damage":
      case "damage_flagged":
        w.line.damaged += m.quantity;
        w.poisha.damagedValue += money;
        break;
      case "damage_rejected":
        w.line.damaged -= m.quantity;
        w.poisha.damagedValue -= money;
        break;
      case "count":
        w.line.countDifference += signed;
        if (m.direction === "out") w.poisha.missingValue += money;
        break;
      case "adjustment":
      case "reversal":
        w.line.adjusted += signed;
        break;
    }
  }

  const lines: ReportLine[] = [];
  const totals: Totals = { ...EMPTY_TOTALS };
  const totalPoisha = {
    receivedValue: 0,
    soldValue: 0,
    damagedValue: 0,
    missingValue: 0,
  };
  for (const p of products) {
    const w = work.get(p.id);
    if (!w) continue;
    w.line.opening = p.on_hand - w.netSinceFrom;
    w.line.closing = p.on_hand - w.netSinceTo;
    if (!w.moved && w.line.opening === 0 && w.line.closing === 0) continue;
    const line: ReportLine = {
      ...w.line,
      receivedValue: fromPoisha(w.poisha.receivedValue),
      soldValue: fromPoisha(w.poisha.soldValue),
      damagedValue: fromPoisha(w.poisha.damagedValue),
      missingValue: fromPoisha(w.poisha.missingValue),
    };
    lines.push(line);
    for (const key of [
      "opening",
      "received",
      "sold",
      "damaged",
      "countDifference",
      "adjusted",
      "closing",
    ] as const) {
      totals[key] += line[key];
    }
    for (const key of MONEY_KEYS) totalPoisha[key] += w.poisha[key];
  }
  for (const key of MONEY_KEYS) totals[key] = fromPoisha(totalPoisha[key]);

  return { from: range.from, to: range.to, lines, totals };
}

/** The stock report with a total line, as CSV. */
export async function exportReportCsv(
  deps: StockDeps,
  caller: Caller | undefined,
  query: Record<string, unknown>,
): Promise<string> {
  const report = await getStockReport(deps, caller, query);
  const numbers = (r: Totals) => [
    r.opening,
    r.received,
    r.sold,
    r.damaged,
    r.countDifference,
    r.adjusted,
    r.closing,
    r.receivedValue,
    r.soldValue,
    r.damagedValue,
    r.missingValue,
  ];
  return toCsv(
    [
      "SKU",
      "Product",
      "Unit",
      "Opening",
      "Received",
      "Sold",
      "Damaged",
      "Count difference",
      "Adjusted",
      "Closing",
      "Received value (BDT)",
      "Sold value (BDT)",
      "Damaged value (BDT)",
      "Missing value (BDT)",
    ],
    [
      ...report.lines.map((line) => [
        line.sku,
        line.name,
        line.unit,
        ...numbers(line),
      ]),
      ["", "Total", "", ...numbers(report.totals)],
    ],
  );
}
