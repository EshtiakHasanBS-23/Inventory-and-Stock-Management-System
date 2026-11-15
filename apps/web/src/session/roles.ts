import { ROLES, type Role } from "@mojud/contracts";

/** Every role lands on the dashboard (simplified-plan.md). */
export const ROLE_HOME: Readonly<Record<Role, string>> = {
  owner: "/dashboard",
  manager: "/dashboard",
  sales_rep: "/dashboard",
  warehouse_worker: "/dashboard",
  supervisor: "/dashboard",
  accountant: "/dashboard",
};

export interface NavItem {
  to: string;
  labelKey: string;
  testId: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  {
    to: "/dashboard",
    labelKey: "nav.dashboard",
    testId: "side-nav-dashboard-link",
  },
  {
    to: "/products",
    labelKey: "nav.products",
    testId: "side-nav-products-link",
  },
  { to: "/stock", labelKey: "nav.stock", testId: "side-nav-stock-link" },
  { to: "/history", labelKey: "nav.history", testId: "side-nav-history-link" },
];

/** Side navigation items per role: the same four pages for everyone. */
export const ROLE_NAV: Readonly<Record<Role, readonly NavItem[]>> = {
  owner: NAV_ITEMS,
  manager: NAV_ITEMS,
  sales_rep: NAV_ITEMS,
  warehouse_worker: NAV_ITEMS,
  supervisor: NAV_ITEMS,
  accountant: NAV_ITEMS,
};

/** Who may open each signed-in route: every role. */
export const ROUTE_ROLES: Readonly<Record<string, readonly Role[]>> = {
  "/dashboard": ROLES,
  "/products": ROLES,
  "/stock": ROLES,
  "/history": ROLES,
};

/** Only these roles may create or edit products (matches the API). */
export function canManageProducts(role: Role): boolean {
  return role === "owner" || role === "manager";
}
