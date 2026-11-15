/**
 * Staff users (improvement plan, item 3). Only the Owner adds, lists,
 * deactivates and reactivates people in their own business. A deactivated
 * person cannot sign in, and their open sessions end on their next request
 * (resolveSession). Nobody can deactivate the Owner.
 */
import {
  CreateStaffSchema,
  normalizePhone,
  SetStaffActiveSchema,
  STAFF_FIELD_MESSAGES,
  type StaffMember,
} from "@mojud/contracts";
import { z } from "zod";
import {
  AppError,
  uniqueViolationConstraint,
} from "../../../platform/errors.js";
import { validate } from "../../../platform/validation.js";
import { passwordHasher } from "./password.js";
import { authorize, type IdentityDeps } from "./service.js";
import type { Caller } from "./types.js";

const IdSchema = z.uuid();

function requireOwner(caller: Caller | undefined, action: string): Caller {
  authorize(caller, action);
  const checked = caller as Caller;
  if (checked.role !== "owner") {
    throw new AppError(
      "FORBIDDEN",
      undefined,
      "Only the owner can manage staff.",
    );
  }
  return checked;
}

const STAFF_COLUMNS = [
  "id",
  "name",
  "phone",
  "role",
  "active",
  "created_at",
] as const;

function toStaff(row: {
  id: string;
  name: string;
  phone: string;
  role: StaffMember["role"];
  active: boolean;
  created_at: Date;
}): StaffMember {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    role: row.role,
    active: row.active,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listStaff(
  deps: Pick<IdentityDeps, "db">,
  caller: Caller | undefined,
): Promise<StaffMember[]> {
  const { businessId } = requireOwner(caller, "identity.staff.list");
  const rows = await deps.db
    .selectFrom("users")
    .select(STAFF_COLUMNS)
    .where("business_id", "=", businessId)
    .orderBy("created_at")
    .execute();
  return rows.map(toStaff);
}

export async function createStaff(
  deps: IdentityDeps,
  caller: Caller | undefined,
  body: unknown,
): Promise<StaffMember> {
  const { businessId } = requireOwner(caller, "identity.staff.create");
  const input = validate(CreateStaffSchema, body, STAFF_FIELD_MESSAGES);
  const phone = normalizePhone(input.phone);
  if (!phone) {
    throw new AppError(
      "VALIDATION_FAILED",
      "phone",
      STAFF_FIELD_MESSAGES.phone,
    );
  }
  const passwordHash = await passwordHasher.hash(input.password, deps.argon2);
  try {
    const row = await deps.db
      .insertInto("users")
      .values({
        business_id: businessId,
        name: input.name,
        phone,
        role: input.role,
        password_hash: passwordHash,
      })
      .returning(STAFF_COLUMNS)
      .executeTakeFirstOrThrow();
    return toStaff(row);
  } catch (error) {
    if (uniqueViolationConstraint(error) === "users_phone_key") {
      throw new AppError("DUPLICATE", "phone");
    }
    throw error;
  }
}

export async function setStaffActive(
  deps: Pick<IdentityDeps, "db">,
  caller: Caller | undefined,
  id: unknown,
  body: unknown,
): Promise<StaffMember> {
  const { businessId } = requireOwner(caller, "identity.staff.update");
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) throw new AppError("NOT_FOUND");
  const input = validate(SetStaffActiveSchema, body, STAFF_FIELD_MESSAGES);
  const row = await deps.db
    .updateTable("users")
    .set({ active: input.active })
    .where("id", "=", parsedId.data)
    .where("business_id", "=", businessId)
    .where("role", "<>", "owner")
    .returning(STAFF_COLUMNS)
    .executeTakeFirst();
  if (!row) {
    const owner = await deps.db
      .selectFrom("users")
      .select("id")
      .where("id", "=", parsedId.data)
      .where("business_id", "=", businessId)
      .executeTakeFirst();
    if (owner) {
      throw new AppError(
        "FORBIDDEN",
        undefined,
        "The owner cannot be deactivated.",
      );
    }
    throw new AppError("NOT_FOUND");
  }
  return toStaff(row);
}
