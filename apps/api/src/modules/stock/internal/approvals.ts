/**
 * Approvals (PRD FR-15, FR-29, FR-30, FR-51): damage flags and reversal
 * requests that need a second person's decision, and each person's record.
 *
 * - Flag damage: anyone. The units move from on_hand into the product's
 *   Damaged hold with a `damage_flagged` movement, and a pending approval
 *   opens. Approve writes them off (they leave the hold); reject returns
 *   them with a `damage_rejected` movement.
 * - Reversal: an Owner or Manager asks to undo a movement. Approve records
 *   the opposite movement (`reversal`), linked to the original.
 * - Nobody decides their own request (also a database check). A decision
 *   locks the approval row, so two people deciding at once cannot both win.
 */
import {
  ApprovalQuerySchema,
  DAMAGE_DECIDER_ROLES,
  FLAG_FIELD_MESSAGES,
  FlagDamageSchema,
  fromPoisha,
  REVERSAL_FIELD_MESSAGES,
  REVERSAL_ROLES,
  RequestReversalSchema,
  REVERSIBLE_REASONS,
  type Approval,
  type ApprovalKind,
  type RecordPeriod,
  type WorkRecord,
} from "@mojud/contracts";
import { sql, type Transaction } from "kysely";
import { z } from "zod";
import type { Database } from "../../../platform/db/db.js";
import {
  AppError,
  uniqueViolationConstraint,
} from "../../../platform/errors.js";
import { validate } from "../../../platform/validation.js";
import { authorize, type Caller } from "../../identity/index.js";
import { applyMovement, withoutEmpty, type StockDeps } from "./service.js";

const IdSchema = z.uuid();

function requireCaller(caller: Caller | undefined, action: string): Caller {
  authorize(caller, action);
  return caller as Caller;
}

const DECIDERS: Record<ApprovalKind, readonly string[]> = {
  damage: DAMAGE_DECIDER_ROLES,
  reversal: REVERSAL_ROLES,
};

function mayDecide(
  caller: Caller,
  kind: ApprovalKind,
  requestedBy: string,
): boolean {
  return DECIDERS[kind].includes(caller.role) && requestedBy !== caller.userId;
}

/** Loads approvals with their product, movement and people, newest first. */
async function queryApprovals(
  db: StockDeps["db"] | Transaction<Database>,
  caller: Caller,
  filter: { status?: "pending" | "decided"; id?: string },
): Promise<Approval[]> {
  let query = db
    .selectFrom("approvals as a")
    .innerJoin("products as p", "p.id", "a.product_id")
    .innerJoin("stock_movements as m", "m.id", "a.movement_id")
    .innerJoin("users as r", "r.id", "a.requested_by")
    .leftJoin("users as d", "d.id", "a.decided_by")
    .select([
      "a.id",
      "a.kind",
      "a.status",
      "a.product_id",
      "p.name as product_name",
      "p.sku",
      "p.unit",
      "a.quantity",
      "a.unit_cost",
      "a.note",
      "m.id as movement_id",
      "m.direction",
      "m.reason",
      "m.created_at as movement_at",
      "a.requested_by",
      "r.name as requested_by_name",
      "a.requested_at",
      "d.name as decided_by_name",
      "a.decided_at",
    ])
    .where("a.business_id", "=", caller.businessId);
  if (filter.id) query = query.where("a.id", "=", filter.id);
  if (filter.status === "pending")
    query = query.where("a.status", "=", "pending");
  if (filter.status === "decided")
    query = query.where("a.status", "<>", "pending");
  const rows = await query
    .orderBy(
      filter.status === "decided" ? "a.decided_at" : "a.requested_at",
      "desc",
    )
    .orderBy("a.id", "desc")
    .limit(200)
    .execute();
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    status: row.status,
    productId: row.product_id,
    productName: row.product_name,
    sku: row.sku,
    unit: row.unit,
    quantity: row.quantity,
    value: fromPoisha(row.quantity * row.unit_cost),
    note: row.note,
    movement: {
      id: row.movement_id,
      direction: row.direction,
      reason: row.reason,
      createdAt: row.movement_at.toISOString(),
    },
    requestedBy: row.requested_by_name,
    requestedAt: row.requested_at.toISOString(),
    decidedBy: row.decided_by_name,
    decidedAt: row.decided_at?.toISOString() ?? null,
    canDecide:
      row.status === "pending" && mayDecide(caller, row.kind, row.requested_by),
  }));
}

async function loadOne(
  db: StockDeps["db"] | Transaction<Database>,
  caller: Caller,
  id: string,
): Promise<Approval> {
  const [approval] = await queryApprovals(db, caller, { id });
  if (!approval) throw new AppError("NOT_FOUND");
  return approval;
}

/** Anyone flags damaged stock; it waits in the Damaged hold for a decision. */
export async function flagDamage(
  deps: StockDeps,
  caller: Caller | undefined,
  body: unknown,
): Promise<Approval> {
  const checked = requireCaller(caller, "stock.damage.flag");
  const input = validate(FlagDamageSchema, body, FLAG_FIELD_MESSAGES);
  const id = await deps.db.transaction().execute(async (trx) => {
    const movement = await applyMovement(trx, checked, {
      productId: input.productId,
      direction: "out",
      reason: "damage_flagged",
      quantity: input.quantity,
      note: input.note ? input.note : null,
    });
    const product = await trx
      .updateTable("products")
      .set((eb) => ({ damaged: eb("damaged", "+", input.quantity) }))
      .where("id", "=", input.productId)
      .returning("unit_cost")
      .executeTakeFirstOrThrow();
    const approval = await trx
      .insertInto("approvals")
      .values({
        business_id: checked.businessId,
        kind: "damage",
        product_id: input.productId,
        quantity: input.quantity,
        unit_cost: product.unit_cost,
        note: input.note ? input.note : null,
        movement_id: movement.id,
        requested_by: checked.userId,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return approval.id;
  });
  return loadOne(deps.db, checked, id);
}

/** An Owner or Manager asks to undo a movement, giving the reason. */
export async function requestReversal(
  deps: StockDeps,
  caller: Caller | undefined,
  body: unknown,
): Promise<Approval> {
  const checked = requireCaller(caller, "stock.reversal.request");
  if (!(REVERSAL_ROLES as readonly string[]).includes(checked.role)) {
    throw new AppError(
      "FORBIDDEN",
      undefined,
      "Only an owner or manager can ask for a reversal.",
    );
  }
  const input = validate(RequestReversalSchema, body, REVERSAL_FIELD_MESSAGES);
  const movement = await deps.db
    .selectFrom("stock_movements as m")
    .innerJoin("products as p", "p.id", "m.product_id")
    .select(["m.id", "m.product_id", "m.reason", "m.quantity", "p.unit_cost"])
    .where("m.id", "=", input.movementId)
    .where("m.business_id", "=", checked.businessId)
    .executeTakeFirst();
  if (!movement) {
    throw new AppError(
      "VALIDATION_FAILED",
      "movementId",
      REVERSAL_FIELD_MESSAGES.movementId,
    );
  }
  if (!REVERSIBLE_REASONS.includes(movement.reason)) {
    throw new AppError(
      "VALIDATION_FAILED",
      "movementId",
      movement.reason === "count"
        ? "A stock count cannot be reversed. Count the product again."
        : "This movement cannot be reversed.",
    );
  }
  try {
    const approval = await deps.db
      .insertInto("approvals")
      .values({
        business_id: checked.businessId,
        kind: "reversal",
        product_id: movement.product_id,
        quantity: movement.quantity,
        unit_cost: movement.unit_cost,
        note: input.note,
        movement_id: movement.id,
        requested_by: checked.userId,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return await loadOne(deps.db, checked, approval.id);
  } catch (error) {
    if (
      uniqueViolationConstraint(error) === "approvals_one_reversal_per_movement"
    ) {
      throw new AppError(
        "DUPLICATE",
        "movementId",
        "This movement already has a reversal, asked for or approved.",
      );
    }
    throw error;
  }
}

export async function listApprovals(
  deps: StockDeps,
  caller: Caller | undefined,
  query: Record<string, unknown>,
): Promise<Approval[]> {
  const checked = requireCaller(caller, "stock.approvals.list");
  const { status } = validate(ApprovalQuerySchema, withoutEmpty(query), {
    status: "Choose pending or decided.",
  });
  return queryApprovals(deps.db, checked, { status });
}

/** Approve or reject, once, by someone allowed who did not ask. */
export async function decideApproval(
  deps: StockDeps,
  caller: Caller | undefined,
  id: unknown,
  approve: boolean,
): Promise<Approval> {
  const checked = requireCaller(caller, "stock.approvals.decide");
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) throw new AppError("NOT_FOUND");
  await deps.db.transaction().execute(async (trx) => {
    const approval = await trx
      .selectFrom("approvals")
      .selectAll()
      .where("id", "=", parsedId.data)
      .where("business_id", "=", checked.businessId)
      .forUpdate()
      .executeTakeFirst();
    if (!approval) throw new AppError("NOT_FOUND");
    if (approval.status !== "pending") {
      throw new AppError("DUPLICATE", undefined, "This was already decided.");
    }
    if (approval.requested_by === checked.userId) {
      throw new AppError(
        "FORBIDDEN",
        undefined,
        "Someone else must decide your own request.",
      );
    }
    if (!DECIDERS[approval.kind].includes(checked.role)) {
      throw new AppError(
        "FORBIDDEN",
        undefined,
        approval.kind === "damage"
          ? "A supervisor, manager or owner decides damage."
          : "An owner or manager decides reversals.",
      );
    }

    let resultMovementId: string | null = null;
    if (approval.kind === "damage") {
      await trx
        .updateTable("products")
        .set((eb) => ({ damaged: eb("damaged", "-", approval.quantity) }))
        .where("id", "=", approval.product_id)
        .execute();
      if (!approve) {
        const back = await applyMovement(trx, checked, {
          productId: approval.product_id,
          direction: "in",
          reason: "damage_rejected",
          quantity: approval.quantity,
          note: "Damage flag rejected: back in stock",
        });
        resultMovementId = back.id;
      }
    } else if (approve) {
      const original = await trx
        .selectFrom("stock_movements")
        .select(["direction", "reason"])
        .where("id", "=", approval.movement_id)
        .executeTakeFirstOrThrow();
      const reversal = await applyMovement(trx, checked, {
        productId: approval.product_id,
        direction: original.direction === "in" ? "out" : "in",
        reason: "reversal",
        quantity: approval.quantity,
        note: `Reverses ${original.reason}: ${approval.note ?? ""}`.trim(),
        reversesMovementId: approval.movement_id,
      });
      resultMovementId = reversal.id;
    }

    await trx
      .updateTable("approvals")
      .set({
        status: approve ? "approved" : "rejected",
        decided_by: checked.userId,
        decided_at: sql<Date>`now()`,
        result_movement_id: resultMovementId,
      })
      .where("id", "=", approval.id)
      .execute();
  });
  return loadOne(deps.db, checked, parsedId.data);
}

/** Bangladesh has no daylight saving: local time is always UTC+6. */
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function emptyPeriod(): RecordPeriod {
  return {
    movements: 0,
    unitsIn: 0,
    unitsOut: 0,
    counts: 0,
    countMissing: 0,
    countExtra: 0,
    flagsRaised: 0,
    flagsApproved: 0,
    flagsRejected: 0,
    flagsPending: 0,
    decisions: 0,
  };
}

/**
 * One person's work today (Dhaka time), in the last 7 days and in the last
 * 30 days (PRD FR-51). Everyone sees their own; an Owner or Manager may look
 * at anyone in the business.
 */
export async function getWorkRecord(
  deps: StockDeps,
  caller: Caller | undefined,
  query: Record<string, unknown>,
): Promise<WorkRecord> {
  const checked = requireCaller(caller, "stock.record");
  const asked = withoutEmpty(query).userId;
  let userId: string = checked.userId;
  if (asked !== undefined && asked !== checked.userId) {
    if (!(REVERSAL_ROLES as readonly string[]).includes(checked.role)) {
      throw new AppError(
        "FORBIDDEN",
        undefined,
        "You can see only your own record.",
      );
    }
    const parsed = IdSchema.safeParse(asked);
    if (!parsed.success) throw new AppError("NOT_FOUND");
    userId = parsed.data;
  }
  const person = await deps.db
    .selectFrom("users")
    .select(["id", "name"])
    .where("id", "=", userId)
    .where("business_id", "=", checked.businessId)
    .executeTakeFirst();
  if (!person) throw new AppError("NOT_FOUND");

  const now = Date.now();
  const todayStart =
    Math.floor((now + DHAKA_OFFSET_MS) / DAY_MS) * DAY_MS - DHAKA_OFFSET_MS;
  const weekStart = now - 7 * DAY_MS;
  const monthStart = now - 30 * DAY_MS;
  const since = new Date(Math.min(todayStart, monthStart));

  const movements = await deps.db
    .selectFrom("stock_movements")
    .select(["direction", "reason", "quantity", "created_at"])
    .where("business_id", "=", checked.businessId)
    .where("user_id", "=", userId)
    .where("created_at", ">=", since)
    .execute();
  const flags = await deps.db
    .selectFrom("approvals")
    .select(["status", "requested_at"])
    .where("business_id", "=", checked.businessId)
    .where("kind", "=", "damage")
    .where("requested_by", "=", userId)
    .where("requested_at", ">=", since)
    .execute();
  const decisions = await deps.db
    .selectFrom("approvals")
    .select(["decided_at"])
    .where("business_id", "=", checked.businessId)
    .where("decided_by", "=", userId)
    .where("decided_at", ">=", since)
    .execute();

  const periods = {
    today: { start: todayStart, data: emptyPeriod() },
    week: { start: weekStart, data: emptyPeriod() },
    month: { start: monthStart, data: emptyPeriod() },
  };
  const each = (at: Date, add: (p: RecordPeriod) => void) => {
    for (const period of Object.values(periods)) {
      if (at.getTime() >= period.start) add(period.data);
    }
  };
  for (const m of movements) {
    each(m.created_at, (p) => {
      if (m.reason === "count") {
        p.counts += 1;
        if (m.direction === "out") p.countMissing += m.quantity;
        else p.countExtra += m.quantity;
      } else if (
        m.reason !== "damage_flagged" &&
        m.reason !== "damage_rejected"
      ) {
        p.movements += 1;
        if (m.direction === "in") p.unitsIn += m.quantity;
        else p.unitsOut += m.quantity;
      }
    });
  }
  for (const f of flags) {
    each(f.requested_at, (p) => {
      p.flagsRaised += 1;
      if (f.status === "approved") p.flagsApproved += 1;
      else if (f.status === "rejected") p.flagsRejected += 1;
      else p.flagsPending += 1;
    });
  }
  for (const d of decisions) {
    if (d.decided_at) each(d.decided_at, (p) => (p.decisions += 1));
  }

  return {
    userId: person.id,
    name: person.name,
    today: periods.today.data,
    week: periods.week.data,
    month: periods.month.data,
  };
}
