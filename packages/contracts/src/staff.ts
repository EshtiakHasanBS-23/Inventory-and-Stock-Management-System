import { z } from "zod";
import { type Role } from "./roles.js";
import {
  NAME_MAX_LENGTH,
  NewPasswordSchema,
  PhoneInputSchema,
} from "./schemas.js";

/** Roles an owner can give a staff member (one owner per business). */
export const STAFF_ROLES = [
  "manager",
  "warehouse_worker",
  "sales_rep",
  "supervisor",
  "accountant",
] as const satisfies readonly Role[];

export type StaffRole = (typeof STAFF_ROLES)[number];

/** `POST /api/v1/users` body: the owner adds a staff member. */
export const CreateStaffSchema = z.strictObject({
  name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  phone: PhoneInputSchema,
  password: NewPasswordSchema,
  role: z.enum(STAFF_ROLES),
});

export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;

/** `PATCH /api/v1/users/:id` body: deactivate or reactivate a staff member. */
export const SetStaffActiveSchema = z.strictObject({ active: z.boolean() });

export const STAFF_FIELD_MESSAGES = {
  name: "Enter the person's name.",
  phone: "Enter a phone number of 6 to 15 digits.",
  password: "At least 8 characters.",
  role: "Choose a role.",
  active: "Choose active or not.",
} as const;

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: Role;
  active: boolean;
  createdAt: string;
}
