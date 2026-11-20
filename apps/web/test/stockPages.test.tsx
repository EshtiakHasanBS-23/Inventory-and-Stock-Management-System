import type { Movement, Product, Role } from "@mojud/contracts";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
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
const MOVEMENTS = "GET /api/v1/stock/movements?limit=50";

const RICE_ID = "11111111-1111-4111-8111-111111111111";
const OIL_ID = "22222222-2222-4222-8222-222222222222";

function aProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: RICE_ID,
    sku: "RICE-25",
    name: "Miniket rice",
    unit: "bag",
    minStock: 5,
    onHand: 12,
    unitCost: 1250.5,
    stockValue: 15006,
    damaged: 0,
    status: "ok",
    ...overrides,
  };
}

const OIL = aProduct({
  id: OIL_ID,
  sku: "OIL-5",
  name: "Soybean oil",
  unit: "ctn",
  onHand: 2,
  status: "low",
});

function aMovement(overrides: Partial<Movement> = {}): Movement {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    productId: RICE_ID,
    productName: "Miniket rice",
    sku: "RICE-25",
    unit: "bag",
    direction: "in",
    reason: "purchase",
    quantity: 10,
    balanceAfter: 12,
    value: 12505,
    reversesMovementId: null,
    note: null,
    userName: "Abdul Haque",
    createdAt: "2026-11-16T08:30:00.000Z",
    ...overrides,
  };
}

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

function callsTo(fetchFn: ReturnType<typeof stubFetch>, key: string) {
  return fetchFn.mock.calls
    .map((_, index) => callOf(fetchFn, index))
    .filter((call) => `${call.method ?? "GET"} ${call.url}` === key);
}

describe("Dashboard (S4)", () => {
  it("shows totals, products that need restocking and recent movements", async () => {
    const { container } = setup("/dashboard", {
      "GET /api/v1/dashboard": {
        status: 200,
        body: {
          ...EMPTY_DASHBOARD,
          productCount: 2,
          totalUnits: 14,
          lowStockCount: 1,
          outOfStockCount: 0,
          lowStock: [OIL],
          recentMovements: [aMovement()],
        },
      },
    });

    expect(await screen.findByTestId("stat-products")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-units")).toHaveTextContent("14");
    expect(screen.getByTestId("stat-low")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-out")).toHaveTextContent("0");
    const attention = screen.getByTestId("attention-list");
    expect(attention).toHaveTextContent("Soybean oil");
    expect(attention).toHaveTextContent("2 ctn (min 5)");
    expect(
      within(attention).getByRole("link", { name: "Stock in" }),
    ).toHaveAttribute("href", `/stock?productId=${OIL_ID}`);
    expect(screen.getByTestId("recent-movements")).toHaveTextContent("+10 bag");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("says when nothing needs restocking and nothing has moved", async () => {
    setup("/dashboard", {
      "GET /api/v1/dashboard": { status: 200, body: EMPTY_DASHBOARD },
    });

    expect(await screen.findByTestId("attention-empty")).toBeInTheDocument();
    expect(screen.getByTestId("recent-movements-empty")).toBeInTheDocument();
  });

  it("says so when the dashboard cannot load", async () => {
    setup("/dashboard", {
      "GET /api/v1/dashboard": {
        status: 500,
        body: { code: "INTERNAL_ERROR", message: "x" },
      },
    });

    expect(
      await screen.findByText(
        "Couldn't load this. Refresh the page to try again.",
      ),
    ).toBeInTheDocument();
  });
});

describe("Products (S1, S3)", () => {
  it("shows 50 products at a time with Load more, and starts again on a new search", async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 120 }, (_, i) =>
      aProduct({
        id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
        sku: `SKU-${String(i).padStart(3, "0")}`,
        name: `Product ${String(i).padStart(3, "0")}`,
      }),
    );
    setup("/products", {
      [PRODUCTS]: { status: 200, body: many },
      "GET /api/v1/products?q=Product": { status: 200, body: many },
    });
    const table = await screen.findByTestId("products-table");
    const rows = () => table.querySelectorAll("tbody tr").length;
    expect(rows()).toBe(50);
    expect(screen.getByTestId("products-showing")).toHaveTextContent(
      "Showing 50 of 120",
    );

    await user.click(screen.getByTestId("products-load-more"));
    expect(rows()).toBe(100);
    await user.click(screen.getByTestId("products-load-more"));
    expect(rows()).toBe(120);
    expect(screen.queryByTestId("products-load-more")).toBeNull();
    expect(screen.queryByTestId("products-showing")).toBeNull();

    await user.click(screen.getByTestId("product-search-input"));
    await user.paste("Product");
    await waitFor(() =>
      expect(
        screen.getByTestId("products-table").querySelectorAll("tbody tr"),
      ).toHaveLength(50),
    );
  });

  it("lists products with their stock and a text status badge", async () => {
    const { container } = setup("/products", {
      [PRODUCTS]: { status: 200, body: [aProduct(), OIL] },
    });

    const rice = await screen.findByTestId("product-row-RICE-25");
    expect(rice).toHaveTextContent("12 bag");
    expect(within(rice).getByTestId("stock-badge")).toHaveTextContent("OK");
    expect(
      within(screen.getByTestId("product-row-OIL-5")).getByTestId(
        "stock-badge",
      ),
    ).toHaveTextContent("Low");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("searches by name or SKU", async () => {
    const user = userEvent.setup();
    const { fetchFn } = setup("/products", {
      [PRODUCTS]: { status: 200, body: [aProduct(), OIL] },
      "GET /api/v1/products?q=zzz": { status: 200, body: [] },
    });
    await screen.findByTestId("products-table");

    await user.click(screen.getByTestId("product-search-input"));
    await user.paste("zzz");

    expect(await screen.findByTestId("products-empty")).toHaveTextContent(
      "No products match this search.",
    );
    expect(callsTo(fetchFn, "GET /api/v1/products?q=zzz")).not.toHaveLength(0);
  });

  it("adds a product and refreshes the list", async () => {
    const user = userEvent.setup();
    let created = false;
    const { fetchFn } = setup("/products", {
      [PRODUCTS]: () => ({
        status: 200,
        body: created ? [aProduct({ onHand: 0, status: "out" })] : [],
      }),
      "POST /api/v1/products": () => {
        created = true;
        return { status: 201, body: aProduct({ onHand: 0, status: "out" }) };
      },
    });
    expect(await screen.findByTestId("products-empty")).toHaveTextContent(
      "No products yet.",
    );

    await user.type(screen.getByTestId("product-sku-input"), "RICE-25");
    await user.type(screen.getByTestId("product-name-input"), "Miniket rice");
    await user.clear(screen.getByTestId("product-unit-input"));
    await user.type(screen.getByTestId("product-unit-input"), "bag");
    await user.clear(screen.getByTestId("product-min-input"));
    await user.type(screen.getByTestId("product-min-input"), "5");
    await user.click(screen.getByTestId("product-save-button"));

    expect(await screen.findByTestId("product-row-RICE-25")).toHaveTextContent(
      "Out",
    );
    expect(callsTo(fetchFn, "POST /api/v1/products")[0]?.body).toEqual({
      sku: "RICE-25",
      name: "Miniket rice",
      unit: "bag",
      minStock: 5,
      unitCost: 0,
    });
    expect(screen.getByTestId("product-sku-input")).toHaveValue("");
  });

  it("shows a server field error under the field and keeps the values", async () => {
    const user = userEvent.setup();
    setup("/products", {
      "POST /api/v1/products": {
        status: 409,
        body: {
          code: "DUPLICATE",
          field: "sku",
          message: "A product with this SKU already exists.",
        },
      },
    });
    await screen.findByTestId("products-empty");

    await user.type(screen.getByTestId("product-sku-input"), "RICE-25");
    await user.type(screen.getByTestId("product-name-input"), "Rice");
    await user.click(screen.getByTestId("product-save-button"));

    expect(
      await screen.findByText("A product with this SKU already exists."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("product-sku-input")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByTestId("product-sku-input")).toHaveValue("RICE-25");
  });

  it("shows a form message when saving fails without a field", async () => {
    const user = userEvent.setup();
    setup("/products", {
      "POST /api/v1/products": {
        status: 500,
        body: { code: "INTERNAL_ERROR", message: "x" },
      },
    });
    await screen.findByTestId("products-empty");

    await user.click(screen.getByTestId("product-save-button"));

    expect(
      await screen.findByTestId("product-error-summary"),
    ).toHaveTextContent("Couldn't save. Try again.");
  });

  it("edits a product's minimum stock", async () => {
    const user = userEvent.setup();
    const { fetchFn } = setup("/products", {
      [PRODUCTS]: { status: 200, body: [aProduct()] },
      [`PATCH /api/v1/products/${RICE_ID}`]: {
        status: 200,
        body: aProduct({ minStock: 20, status: "low" }),
      },
    });
    await user.click(await screen.findByTestId("product-edit-RICE-25"));

    expect(
      screen.getByRole("heading", { name: "Edit RICE-25" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("product-sku-input")).not.toBeInTheDocument();
    await user.clear(screen.getByTestId("product-min-input"));
    await user.type(screen.getByTestId("product-min-input"), "20");
    await user.click(screen.getByTestId("product-save-button"));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Add a product" }),
      ).toBeInTheDocument(),
    );
    expect(
      callsTo(fetchFn, `PATCH /api/v1/products/${RICE_ID}`)[0]?.body,
    ).toEqual({
      name: "Miniket rice",
      unit: "bag",
      minStock: 20,
      unitCost: 1250.5,
    });
  });

  it("cancels an edit", async () => {
    const user = userEvent.setup();
    setup("/products", { [PRODUCTS]: { status: 200, body: [aProduct()] } });
    await user.click(await screen.findByTestId("product-edit-RICE-25"));

    await user.click(screen.getByTestId("product-cancel-button"));

    expect(
      screen.getByRole("heading", { name: "Add a product" }),
    ).toBeInTheDocument();
  });

  it("hides the add and edit controls from roles that cannot manage products", async () => {
    setup(
      "/products",
      { [PRODUCTS]: { status: 200, body: [aProduct()] } },
      "warehouse_worker",
    );

    await screen.findByTestId("products-table");
    expect(screen.queryByTestId("product-form")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("product-edit-RICE-25"),
    ).not.toBeInTheDocument();
  });
});

describe("Stock in / out (S2)", () => {
  it("records a stock-out and confirms the new balance", async () => {
    const user = userEvent.setup();
    const { fetchFn, container } = setup("/stock", {
      [PRODUCTS]: { status: 200, body: [aProduct(), OIL] },
      "POST /api/v1/stock/movements": {
        status: 201,
        body: aMovement({
          direction: "out",
          reason: "damage",
          quantity: 2,
          balanceAfter: 10,
          note: "torn",
        }),
      },
    });
    await screen.findByRole("option", { name: "Miniket rice (RICE-25)" });
    expect(await axe(container)).toHaveNoViolations();

    await user.selectOptions(
      screen.getByTestId("stock-product-select"),
      RICE_ID,
    );
    expect(screen.getByTestId("stock-on-hand")).toHaveTextContent(
      "In stock now: 12 bag",
    );
    await user.click(screen.getByTestId("stock-direction-out"));
    expect(
      within(screen.getByTestId("stock-reason-select"))
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["Sale", "Damaged", "Count adjustment"]);
    await user.selectOptions(
      screen.getByTestId("stock-reason-select"),
      "damage",
    );
    await user.type(screen.getByTestId("stock-quantity-input"), "2");
    await user.type(screen.getByTestId("stock-note-input"), "torn");
    await user.click(screen.getByTestId("stock-save-button"));

    expect(await screen.findByTestId("stock-saved")).toHaveTextContent(
      "Saved. Stock out 2 bag of Miniket rice. Now 10 bag in stock.",
    );
    expect(callsTo(fetchFn, "POST /api/v1/stock/movements")[0]?.body).toEqual({
      productId: RICE_ID,
      direction: "out",
      reason: "damage",
      quantity: 2,
      note: "torn",
    });
    expect(screen.getByTestId("stock-quantity-input")).toHaveValue("");
  });

  it("preselects the product from the link and shows a refusal under the quantity", async () => {
    const user = userEvent.setup();
    setup(`/stock?productId=${OIL_ID}`, {
      [PRODUCTS]: { status: 200, body: [aProduct(), OIL] },
      "POST /api/v1/stock/movements": {
        status: 409,
        body: {
          code: "INSUFFICIENT_STOCK",
          field: "quantity",
          message: "Only 2 ctn in stock.",
        },
      },
    });
    expect(await screen.findByTestId("stock-on-hand")).toHaveTextContent(
      "2 ctn",
    );

    await user.click(screen.getByTestId("stock-direction-out"));
    await user.type(screen.getByTestId("stock-quantity-input"), "5");
    await user.click(screen.getByTestId("stock-save-button"));

    expect(await screen.findByText("Only 2 ctn in stock.")).toBeInTheDocument();
    expect(screen.getByTestId("stock-quantity-input")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("shows a form message when saving fails without a field", async () => {
    const user = userEvent.setup();
    setup("/stock", {
      [PRODUCTS]: { status: 200, body: [aProduct()] },
      "POST /api/v1/stock/movements": {
        status: 403,
        body: { code: "FORBIDDEN", message: "Not allowed here." },
      },
    });
    await screen.findByRole("option", { name: "Miniket rice (RICE-25)" });

    await user.click(screen.getByTestId("stock-save-button"));

    expect(await screen.findByTestId("stock-error-summary")).toHaveTextContent(
      "Not allowed here.",
    );
  });

  it("points to Products when there are none yet", async () => {
    setup("/stock", {});

    expect(await screen.findByTestId("stock-no-products")).toHaveTextContent(
      "There are no products yet.",
    );
  });
});

describe("History (S4)", () => {
  it("lists movements and filters them by product", async () => {
    const user = userEvent.setup();
    const { container } = setup("/history", {
      [PRODUCTS]: { status: 200, body: [aProduct(), OIL] },
      [MOVEMENTS]: {
        status: 200,
        body: [
          aMovement({
            id: "a",
            direction: "out",
            reason: "sale",
            quantity: 1,
            balanceAfter: 11,
            note: "shop 4",
          }),
          aMovement({ id: "b" }),
        ],
      },
      [`GET /api/v1/stock/movements?productId=${OIL_ID}&limit=50`]: {
        status: 200,
        body: [],
      },
    });

    const table = await screen.findByTestId("history-table");
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent("−1 bag");
    expect(rows[1]).toHaveTextContent("Sale · shop 4");
    expect(rows[1]).toHaveTextContent("Abdul Haque");
    expect(await axe(container)).toHaveNoViolations();

    await screen.findByRole("option", { name: "Soybean oil (OIL-5)" });
    await user.selectOptions(
      screen.getByTestId("history-product-select"),
      OIL_ID,
    );

    expect(await screen.findByTestId("history-table-empty")).toHaveTextContent(
      "No stock movements yet.",
    );
    await user.selectOptions(screen.getByTestId("history-product-select"), "");
    expect(await screen.findByTestId("history-table")).toBeInTheDocument();
  });
});
