import type { Role } from "@mojud/contracts";
import type { BusinessId, UserId } from "./ids.js";

/**
 * The caller context handed to every module (contract C2, BR2.7). It is
 * read-only. `warehouseIds` is always empty (one stock location per business).
 */
export interface Caller {
  readonly userId: UserId;
  readonly businessId: BusinessId;
  readonly businessName: string;
  readonly name: string;
  readonly role: Role;
  readonly warehouseIds: readonly string[];
  readonly active: boolean;
}
