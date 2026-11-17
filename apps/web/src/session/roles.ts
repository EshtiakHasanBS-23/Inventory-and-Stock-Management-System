import { ROLES, type Role } from "@mojud/contracts";
import type { IconName } from "../components/Icons";

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
  icon: IconName;
}

const NAV_ITEMS: readonly NavItem[] = [
  {
    to: "/dashboard",
    labelKey: "nav.dashboard",
    testId: "side-nav-dashboard-link",
    icon: "dashboard",
  },
  {
    to: "/products",
    labelKey: "nav.products",
    testId: "side-nav-products-link",
    icon: "box",
  },
  {
    to: "/stock",
    labelKey: "nav.stock",
    testId: "side-nav-stock-link",
    icon: "swap",
  },
  {
    to: "/count",
    labelKey: "nav.count",
    testId: "side-nav-count-link",
    icon: "clipboard",
  },
  {
    to: "/history",
    labelKey: "nav.history",
    testId: "side-nav-history-link",
    icon: "clock",
  },
  {
    to: "/approvals",
    labelKey: "nav.approvals",
    testId: "side-nav-approvals-link",
    icon: "check",
  },
  {
    to: "/reports",
    labelKey: "nav.report",
    testId: "side-nav-report-link",
    icon: "chart",
  },
];

const RECORD_ITEM: NavItem = {
  to: "/record",
  labelKey: "nav.record",
  testId: "side-nav-record-link",
  icon: "person",
};

const ACCOUNT_ITEM: NavItem = {
  to: "/account",
  labelKey: "nav.account",
  testId: "side-nav-account-link",
  icon: "key",
};

const STAFF_ITEM: NavItem = {
  to: "/staff",
  labelKey: "nav.staff",
  testId: "side-nav-staff-link",
  icon: "users",
};

/** Side navigation per role: the stock pages for everyone, Staff for the Owner. */
export const ROLE_NAV: Readonly<Record<Role, readonly NavItem[]>> = {
  owner: [...NAV_ITEMS, RECORD_ITEM, STAFF_ITEM, ACCOUNT_ITEM],
  manager: [...NAV_ITEMS, RECORD_ITEM, ACCOUNT_ITEM],
  sales_rep: [...NAV_ITEMS, RECORD_ITEM, ACCOUNT_ITEM],
  warehouse_worker: [...NAV_ITEMS, RECORD_ITEM, ACCOUNT_ITEM],
  supervisor: [...NAV_ITEMS, RECORD_ITEM, ACCOUNT_ITEM],
  accountant: [...NAV_ITEMS, RECORD_ITEM, ACCOUNT_ITEM],
};

/** Who may open each signed-in route: every role. */
export const ROUTE_ROLES: Readonly<Record<string, readonly Role[]>> = {
  "/dashboard": ROLES,
  "/products": ROLES,
  "/stock": ROLES,
  "/history": ROLES,
  "/count": ROLES,
  "/staff": ["owner"],
  "/approvals": ROLES,
  "/record": ROLES,
  "/damage": ROLES,
  "/reports": ROLES,
  "/products/import": ["owner", "manager"],
  "/account": ROLES,
};

/** Only these roles may create or edit products (matches the API). */
export function canManageProducts(role: Role): boolean {
  return role === "owner" || role === "manager";
}
