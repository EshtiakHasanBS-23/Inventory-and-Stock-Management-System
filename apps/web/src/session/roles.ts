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
  { to: "/count", labelKey: "nav.count", testId: "side-nav-count-link" },
  { to: "/history", labelKey: "nav.history", testId: "side-nav-history-link" },
];

const ACCOUNT_ITEM: NavItem = {
  to: "/account",
  labelKey: "nav.account",
  testId: "side-nav-account-link",
};

const STAFF_ITEM: NavItem = {
  to: "/staff",
  labelKey: "nav.staff",
  testId: "side-nav-staff-link",
};

/** Side navigation per role: the stock pages for everyone, Staff for the Owner. */
export const ROLE_NAV: Readonly<Record<Role, readonly NavItem[]>> = {
  owner: [...NAV_ITEMS, STAFF_ITEM, ACCOUNT_ITEM],
  manager: [...NAV_ITEMS, ACCOUNT_ITEM],
  sales_rep: [...NAV_ITEMS, ACCOUNT_ITEM],
  warehouse_worker: [...NAV_ITEMS, ACCOUNT_ITEM],
  supervisor: [...NAV_ITEMS, ACCOUNT_ITEM],
  accountant: [...NAV_ITEMS, ACCOUNT_ITEM],
};

/** Who may open each signed-in route: every role. */
export const ROUTE_ROLES: Readonly<Record<string, readonly Role[]>> = {
  "/dashboard": ROLES,
  "/products": ROLES,
  "/stock": ROLES,
  "/history": ROLES,
  "/count": ROLES,
  "/staff": ["owner"],
  "/account": ROLES,
};

/** Only these roles may create or edit products (matches the API). */
export function canManageProducts(role: Role): boolean {
  return role === "owner" || role === "manager";
}
