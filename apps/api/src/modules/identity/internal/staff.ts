/**
 * Staff users (improvement plan, item 3). Only the Owner adds, lists,
 * deactivates and reactivates people in their own business. A deactivated
 * person cannot sign in, and their open sessions end on their next request
 * (resolveSession). Nobody can deactivate the Owner.
 */
import {
  ChangePasswordSchema,
  CreateStaffSchema,
  normalizePhone,
  PASSWORD_FIELD_MESSAGES,
  ResetPasswordSchema,
  SetStaffActiveSchema,
  STAFF_FIELD_MESSAGES,
  WRONG_CURRENT_PASSWORD,
  type PersonName,
  type StaffMember,
} from "@mojud/contracts";
import { z } from "zod";
import {
  AppError,
  uniqueViolationConstraint,
} from "../../../platform/errors.js";
import { validate } from "../../../platform/validation.js";
import { passwordHasher } from "./password.js";
import {
  authorize,
  type IdentityDeps,
  type ResolvedSession,
} from "./service.js";
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

/** Everyone in the caller's business, any role: names for history filters. */
export async function listPeople(
  deps: Pick<IdentityDeps, "db">,
  caller: Caller | undefined,
): Promise<PersonName[]> {
  authorize(caller, "identity.people.list");
  const { businessId } = caller as Caller;
  return deps.db
    .selectFrom("users")
    .select(["id", "name"])
    .where("business_id", "=", businessId)
    .orderBy("name")
    .execute();
}

/**
 * Anyone changes their own password after giving the current one. Their
 * other sessions end; the session making the change stays signed in.
 */
export async function changeOwnPassword(
  deps: IdentityDeps,
  session: ResolvedSession | undefined,
  body: unknown,
): Promise<void> {
  authorize(session?.caller, "identity.password.change");
  const { caller, idHash } = session as ResolvedSession;
  const input = validate(ChangePasswordSchema, body, PASSWORD_FIELD_MESSAGES);
  const user = await deps.db
    .selectFrom("users")
    .select("password_hash")
    .where("id", "=", caller.userId)
    .executeTakeFirstOrThrow();
  if (
    !(await passwordHasher.verify(user.password_hash, input.currentPassword))
  ) {
    throw new AppError(
      "VALIDATION_FAILED",
      "currentPassword",
      WRONG_CURRENT_PASSWORD,
    );
  }
  const passwordHash = await passwordHasher.hash(
    input.newPassword,
    deps.argon2,
  );
  await deps.db.transaction().execute(async (trx) => {
    await trx
      .updateTable("users")
      .set({ password_hash: passwordHash })
      .where("id", "=", caller.userId)
      .execute();
    await trx
      .deleteFrom("sessions")
      .where("user_id", "=", caller.userId)
      .where("id_hash", "<>", idHash)
      .execute();
  });
}

/**
 * The Owner sets a new password for a staff member who forgot theirs. All of
 * that person's sessions end. The Owner's own password is changed only
 * through changeOwnPassword.
 */
export async function resetStaffPassword(
  deps: IdentityDeps,
  caller: Caller | undefined,
  id: unknown,
  body: unknown,
): Promise<void> {
  const { businessId } = requireOwner(caller, "identity.staff.password");
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) throw new AppError("NOT_FOUND");
  const input = validate(ResetPasswordSchema, body, PASSWORD_FIELD_MESSAGES);
  const member = await deps.db
    .selectFrom("users")
    .select(["id", "role"])
    .where("id", "=", parsedId.data)
    .where("business_id", "=", businessId)
    .executeTakeFirst();
  if (!member) throw new AppError("NOT_FOUND");
  if (member.role === "owner") {
    throw new AppError(
      "FORBIDDEN",
      undefined,
      "Change your own password on the My password page.",
    );
  }
  const passwordHash = await passwordHasher.hash(
    input.newPassword,
    deps.argon2,
  );
  await deps.db.transaction().execute(async (trx) => {
    await trx
      .updateTable("users")
      .set({ password_hash: passwordHash })
      .where("id", "=", member.id)
      .execute();
    await trx.deleteFrom("sessions").where("user_id", "=", member.id).execute();
  });
}
