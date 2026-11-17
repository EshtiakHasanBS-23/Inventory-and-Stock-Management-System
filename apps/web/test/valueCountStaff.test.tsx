import type {
  CountResult,
  Movement,
  Product,
  Role,
  StaffMember,
} from "@mojud/contracts";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { formatTaka } from "../src/format";
import {
  aSession,
  callOf,
  EMPTY_DASHBOARD,
  EMPTY_STOCK,
  renderApp,
  stubFetch,
  type Handler,
} from "./helpers";

const ME = "GET /api/v1/auth/me";
const PRODUCTS = "GET /api/v1/products";
const USERS = "GET /api/v1/users";
const RICE_ID = "11111111-1111-4111-8111-111111111111";
const STAFF_ID = "44444444-4444-4444-8444-444444444444";

const RICE: Product = {
  id: RICE_ID,
  sku: "RICE-25",
  name: "Miniket rice",
  unit: "bag",
  minStock: 5,
  onHand: 10,
  unitCost: 1250.5,
  stockValue: 12505,
  damaged: 0,
  status: "ok",
};

function aMovement(overrides: Partial<Movement> = {}): Movement {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    productId: RICE_ID,
    productName: "Miniket rice",
    sku: "RICE-25",
    unit: "bag",
    direction: "out",
    reason: "count",
    quantity: 2,
    balanceAfter: 8,
    value: 2501,
    reversesMovementId: null,
    note: "Counted 8, system had 10.",
    userName: "Abdul Haque",
    createdAt: "2026-11-16T08:30:00.000Z",
    ...overrides,
  };
}

const OWNER: StaffMember = {
  id: "4b0f8f43-34a1-4f0e-9d3a-6b2a5d1e7c11",
  name: "Abdul Haque",
  phone: "01711000001",
  role: "owner",
  active: true,
  createdAt: "2026-11-01T08:00:00.000Z",
};

const KARIM: StaffMember = {
  id: STAFF_ID,
  name: "Karim",
  phone: "01811000002",
  role: "warehouse_worker",
  active: true,
  createdAt: "2026-11-02T08:00:00.000Z",
};

function setup(
  path: string,
  handlers: Record<string, Handler>,
  role: Role = "owner",
) {
  const fetchFn = stubFetch({
    ...EMPTY_STOCK,
    [ME]: { status: 200, body: aSession(role) },
    ...handlers,
  });
  const view = renderApp({ path, fetchFn, probe: false });
  return { fetchFn, ...view };
}

function bodiesSentTo(fetchFn: ReturnType<typeof stubFetch>, key: string) {
  return fetchFn.mock.calls
    .map((_, index) => callOf(fetchFn, index))
    .filter((call) => `${call.method ?? "GET"} ${call.url}` === key)
    .map((call) => call.body);
}

describe("taka formatting", () => {
  it("uses lakh grouping and up to two decimals", () => {
    expect(formatTaka(1245000)).toBe("৳12,45,000");
    expect(formatTaka(1250.5)).toBe("৳1,250.5");
    expect(formatTaka(0)).toBe("৳0");
  });
});

describe("stock value", () => {
  it("shows stock value and 30-day losses on the dashboard", async () => {
    setup("/dashboard", {
      "GET /api/v1/dashboard": {
        status: 200,
        body: { ...EMPTY_DASHBOARD, stockValue: 1245000, lossValue30d: 2501 },
      },
    });

    expect(await screen.findByTestId("stat-value")).toHaveTextContent(
      "৳12,45,000",
    );
    expect(screen.getByTestId("stat-losses")).toHaveTextContent("৳2,501");
  });

  it("shows unit cost and stock value per product, and sends the cost when adding", async () => {
    const user = userEvent.setup();
    const { fetchFn } = setup("/products", {
      [PRODUCTS]: { status: 200, body: [RICE] },
      "POST /api/v1/products": { status: 201, body: RICE },
    });
    const row = await screen.findByTestId("product-row-RICE-25");
    expect(row).toHaveTextContent("৳1,250.5");
    expect(row).toHaveTextContent("৳12,505");

    await user.type(screen.getByTestId("product-sku-input"), "OIL");
    await user.type(screen.getByTestId("product-name-input"), "Oil");
    await user.clear(screen.getByTestId("product-cost-input"));
    await user.type(screen.getByTestId("product-cost-input"), "99.75");
    await user.click(screen.getByTestId("product-save-button"));

    await screen.findByRole("heading", { name: "Add a product" });
    expect(bodiesSentTo(fetchFn, "POST /api/v1/products")[0]).toMatchObject({
      unitCost: 99.75,
    });
  });

  it("shows each movement's value in the history", async () => {
    setup("/history", {
      "GET /api/v1/stock/movements?limit=50": {
        status: 200,
        body: [aMovement()],
      },
    });

    const table = await screen.findByTestId("history-table");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("৳2,501");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent(
      "Stock count",
    );
  });
});

describe("Stock count", () => {
  function countResult(overrides: Partial<CountResult>): CountResult {
    return {
      previous: 10,
      counted: 8,
      difference: -2,
      movement: aMovement(),
      ...overrides,
    };
  }

  it("records a count and says how much is missing, in units and taka", async () => {
    const user = userEvent.setup();
    const { fetchFn, container } = setup("/count", {
      [PRODUCTS]: { status: 200, body: [RICE] },
      "POST /api/v1/stock/counts": { status: 201, body: countResult({}) },
    });
    await screen.findByRole("option", { name: "Miniket rice (RICE-25)" });
    expect(await axe(container)).toHaveNoViolations();

    await user.selectOptions(
      screen.getByTestId("count-product-select"),
      RICE_ID,
    );
    expect(screen.getByTestId("count-recorded")).toHaveTextContent(
      "Recorded now: 10 bag",
    );
    await user.type(screen.getByTestId("count-quantity-input"), "8");
    await user.type(screen.getByTestId("count-note-input"), "aisle 3");
    await user.click(screen.getByTestId("count-save-button"));

    expect(await screen.findByTestId("count-saved")).toHaveTextContent(
      "Counted 8, record had 10: 2 bag missing (৳2,501). Stock adjusted.",
    );
    expect(bodiesSentTo(fetchFn, "POST /api/v1/stock/counts")[0]).toEqual({
      productId: RICE_ID,
      countedQuantity: 8,
      note: "aisle 3",
    });
    expect(screen.getByTestId("count-quantity-input")).toHaveValue("");
  });

  it.each([
    [
      "extra stock",
      { counted: 12, difference: 2, movement: aMovement({ direction: "in" }) },
      "Counted 12, record had 10: 2 bag extra. Stock adjusted.",
    ],
    [
      "a matching count",
      { counted: 10, difference: 0, movement: null },
      "Count matches: 10 bag. Nothing changed.",
    ],
  ] as const)("reports %s", async (_label, result, text) => {
    const user = userEvent.setup();
    setup(`/count?productId=${RICE_ID}`, {
      [PRODUCTS]: { status: 200, body: [RICE] },
      "POST /api/v1/stock/counts": {
        status: 201,
        body: countResult(result),
      },
    });
    await screen.findByTestId("count-recorded");

    await user.type(
      screen.getByTestId("count-quantity-input"),
      String(result.counted),
    );
    await user.click(screen.getByTestId("count-save-button"));

    expect(await screen.findByTestId("count-saved")).toHaveTextContent(text);
  });

  it("shows a refusal under the field, or a form message", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    setup(`/count?productId=${RICE_ID}`, {
      [PRODUCTS]: { status: 200, body: [RICE] },
      "POST /api/v1/stock/counts": () => {
        attempt += 1;
        return attempt === 1
          ? {
              status: 400,
              body: {
                code: "VALIDATION_FAILED",
                field: "countedQuantity",
                message: "Enter the counted quantity, 0 or more.",
              },
            }
          : { status: 500, body: { code: "INTERNAL_ERROR", message: "x" } };
      },
    });
    await screen.findByTestId("count-recorded");

    await user.click(screen.getByTestId("count-save-button"));
    expect(
      await screen.findByText("Enter the counted quantity, 0 or more."),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("count-save-button"));
    expect(await screen.findByTestId("count-error-summary")).toHaveTextContent(
      "Couldn't save. Try again.",
    );
  });

  it("points to Products when there are none yet", async () => {
    setup("/count", {});
    expect(await screen.findByTestId("count-no-products")).toBeInTheDocument();
  });
});

describe("Staff (owner only)", () => {
  it("lists staff and adds a staff member with a role", async () => {
    const user = userEvent.setup();
    let added = false;
    const { fetchFn, container } = setup("/staff", {
      [USERS]: () => ({
        status: 200,
        body: added ? [OWNER, KARIM] : [OWNER],
      }),
      "POST /api/v1/users": () => {
        added = true;
        return { status: 201, body: KARIM };
      },
    });
    const table = await screen.findByTestId("staff-table");
    expect(within(table).getByText("Owner")).toBeInTheDocument();
    expect(
      screen.queryByTestId(`staff-toggle-${OWNER.phone}`),
    ).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    await user.type(screen.getByTestId("staff-name-input"), "Karim");
    await user.type(screen.getByTestId("staff-phone-input"), "01811000002");
    await user.type(
      screen.getByTestId("staff-password-input"),
      "warehouse pass",
    );
    await user.selectOptions(
      screen.getByTestId("staff-role-select"),
      "sales_rep",
    );
    await user.click(screen.getByTestId("staff-save-button"));

    expect(await screen.findByTestId("staff-added")).toHaveTextContent(
      "Karim can now sign in.",
    );
    expect(
      await screen.findByTestId(`staff-row-${KARIM.phone}`),
    ).toHaveTextContent("Warehouse worker");
    expect(bodiesSentTo(fetchFn, "POST /api/v1/users")[0]).toEqual({
      name: "Karim",
      phone: "01811000002",
      password: "warehouse pass",
      role: "sales_rep",
    });
    expect(screen.getByTestId("staff-name-input")).toHaveValue("");
  });

  it("shows a duplicate phone under the field and a failure as a form message", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    setup("/staff", {
      [USERS]: { status: 200, body: [OWNER] },
      "POST /api/v1/users": () => {
        attempt += 1;
        return attempt === 1
          ? {
              status: 409,
              body: {
                code: "DUPLICATE",
                field: "phone",
                message: "This phone number is already registered",
              },
            }
          : { status: 500, body: { code: "INTERNAL_ERROR", message: "x" } };
      },
    });
    await screen.findByTestId("staff-table");

    await user.click(screen.getByTestId("staff-save-button"));
    expect(
      await screen.findByText("This phone number is already registered"),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("staff-save-button"));
    expect(await screen.findByTestId("staff-error-summary")).toHaveTextContent(
      "Couldn't save. Try again.",
    );
  });

  it("deactivates and reactivates a staff member", async () => {
    const user = userEvent.setup();
    let active = true;
    const { fetchFn } = setup("/staff", {
      [USERS]: () => ({ status: 200, body: [OWNER, { ...KARIM, active }] }),
      [`PATCH /api/v1/users/${STAFF_ID}`]: (init) => {
        active = (JSON.parse(String(init.body)) as { active: boolean }).active;
        return { status: 200, body: { ...KARIM, active } };
      },
    });

    await user.click(
      await screen.findByRole("button", { name: "Deactivate Karim" }),
    );
    expect(
      await screen.findByRole("button", { name: "Reactivate Karim" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`staff-row-${KARIM.phone}`)).toHaveTextContent(
      "Deactivated",
    );

    await user.click(screen.getByRole("button", { name: "Reactivate Karim" }));
    expect(
      await screen.findByRole("button", { name: "Deactivate Karim" }),
    ).toBeInTheDocument();
    expect(bodiesSentTo(fetchFn, `PATCH /api/v1/users/${STAFF_ID}`)).toEqual([
      { active: false },
      { active: true },
    ]);
  });

  it("shows a refusal when a change is not allowed", async () => {
    const user = userEvent.setup();
    setup("/staff", {
      [USERS]: { status: 200, body: [OWNER, KARIM] },
      [`PATCH /api/v1/users/${STAFF_ID}`]: {
        status: 403,
        body: {
          code: "FORBIDDEN",
          message: "Only the owner can manage staff.",
        },
      },
    });

    await user.click(
      await screen.findByRole("button", { name: "Deactivate Karim" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Only the owner can manage staff.",
    );
  });

  it("sends other roles away from Staff and hides it from their menu", async () => {
    setup("/staff", {}, "manager");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("side-nav-staff-link")).not.toBeInTheDocument();
  });
});
