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

/** `POST /api/v1/auth/password`: anyone changes their own password. */
export const ChangePasswordSchema = z.strictObject({
  currentPassword: z.string().min(1).max(128),
  newPassword: NewPasswordSchema,
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

/** `POST /api/v1/users/:id/password`: the Owner sets a staff member's password. */
export const ResetPasswordSchema = z.strictObject({
  newPassword: NewPasswordSchema,
});

export const PASSWORD_FIELD_MESSAGES = {
  currentPassword: "Enter your current password.",
  newPassword: "At least 8 characters.",
} as const;

export const WRONG_CURRENT_PASSWORD = "Your current password is not correct.";

/** `GET /api/v1/users/names`: everyone in the business, for history filters. */
export interface PersonName {
  id: string;
  name: string;
}
