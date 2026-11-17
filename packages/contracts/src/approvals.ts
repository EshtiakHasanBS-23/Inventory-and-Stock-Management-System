import { z } from "zod";
import { NOTE_MAX_LENGTH, QUANTITY_MAX, type Reason } from "./stock.js";

/**
 * Damage flags and reversal requests: anything that needs a second person's
 * decision (PRD FR-15, FR-29, FR-30). The person who asked can never decide.
 */

/** `POST /api/v1/stock/damage-flags`: anyone flags damaged stock. */
export const FlagDamageSchema = z.strictObject({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(QUANTITY_MAX),
  note: z.string().trim().max(NOTE_MAX_LENGTH).optional(),
});

export type FlagDamageInput = z.infer<typeof FlagDamageSchema>;

export const FLAG_FIELD_MESSAGES = {
  productId: "Choose a product.",
  quantity: "Enter a whole number, 1 or more.",
  note: "Keep the note under 200 characters.",
} as const;

/** `POST /api/v1/approvals/reversals`: an Owner or Manager asks to undo a movement. */
export const RequestReversalSchema = z.strictObject({
  movementId: z.uuid(),
  note: z.string().trim().min(1).max(NOTE_MAX_LENGTH),
});

export type RequestReversalInput = z.infer<typeof RequestReversalSchema>;

export const REVERSAL_FIELD_MESSAGES = {
  movementId: "Choose a movement from the history.",
  note: "Say why it should be reversed.",
} as const;

export const APPROVAL_KINDS = ["damage", "reversal"] as const;
export type ApprovalKind = (typeof APPROVAL_KINDS)[number];

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/** Roles that may decide a damage flag (never their own). */
export const DAMAGE_DECIDER_ROLES = ["owner", "manager", "supervisor"] as const;
/** Roles that may request and decide reversals (never their own). */
export const REVERSAL_ROLES = ["owner", "manager"] as const;

export interface Approval {
  id: string;
  kind: ApprovalKind;
  status: ApprovalStatus;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  /** quantity × unit cost at the time of the request, in taka. */
  value: number;
  note: string | null;
  /** For a reversal: what is being undone. */
  movement: {
    id: string;
    direction: "in" | "out";
    reason: Reason;
    createdAt: string;
  };
  requestedBy: string;
  requestedAt: string;
  decidedBy: string | null;
  decidedAt: string | null;
  /** True when the caller may approve or reject it now. */
  canDecide: boolean;
}

/** `GET /api/v1/approvals?status=`: open ones, or decided ones. */
export const ApprovalQuerySchema = z.object({
  status: z.enum(["pending", "decided"]).default("pending"),
});

/** One person's work for a period (PRD FR-51, "My record"). */
export interface RecordPeriod {
  /** Stock movements they recorded, in and out (not counts or flags). */
  movements: number;
  unitsIn: number;
  unitsOut: number;
  /** Stock counts they did, and the units found missing or extra. */
  counts: number;
  countMissing: number;
  countExtra: number;
  /** Damage flags they raised, by outcome. */
  flagsRaised: number;
  flagsApproved: number;
  flagsRejected: number;
  flagsPending: number;
  /** Approvals they decided for other people. */
  decisions: number;
}

export interface WorkRecord {
  userId: string;
  name: string;
  today: RecordPeriod;
  week: RecordPeriod;
  month: RecordPeriod;
}
