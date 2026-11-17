import type {
  Approval,
  Movement,
  Product,
  RecordPeriod,
  Role,
  WorkRecord,
} from "@mojud/contracts";
import { screen, within } from "@testing-library/react";
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
const RICE_ID = "11111111-1111-4111-8111-111111111111";
const FLAG_ID = "55555555-5555-4555-8555-555555555555";
const REV_ID = "66666666-6666-4666-8666-666666666666";

const RICE: Product = {
  id: RICE_ID,
  sku: "RICE-25",
  name: "Miniket rice",
  unit: "bag",
  minStock: 0,
  onHand: 8,
  unitCost: 100,
  stockValue: 800,
  damaged: 2,
  status: "ok",
};

function anApproval(overrides: Partial<Approval> = {}): Approval {
  return {
    id: FLAG_ID,
    kind: "damage",
    status: "pending",
    productId: RICE_ID,
    productName: "Miniket rice",
    sku: "RICE-25",
    unit: "bag",
    quantity: 2,
    value: 200,
    note: "torn bags",
    movement: {
      id: "m-1",
      direction: "out",
      reason: "damage_flagged",
      createdAt: "2026-11-16T08:30:00.000Z",
    },
    requestedBy: "Karim",
    requestedAt: "2026-11-16T08:30:00.000Z",
    decidedBy: null,
    decidedAt: null,
    canDecide: true,
    ...overrides,
  };
}

function aMovement(overrides: Partial<Movement> = {}): Movement {
  return {
    id: "mv-sale",
    productId: RICE_ID,
    productName: "Miniket rice",
    sku: "RICE-25",
    unit: "bag",
    direction: "out",
    reason: "sale",
    quantity: 4,
    balanceAfter: 6,
    value: 400,
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
    "GET /api/v1/approvals?status=pending": { status: 200, body: [] },
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

describe("Approvals inbox", () => {
  it("approves a damage flag in one tap", async () => {
    const user = userEvent.setup();
    let decided = false;
    const { fetchFn, container } = setup("/approvals", {
      "GET /api/v1/approvals?status=pending": () => ({
        status: 200,
        body: decided ? [] : [anApproval()],
      }),
      [`POST /api/v1/approvals/${FLAG_ID}/approve`]: () => {
        decided = true;
        return {
          status: 200,
          body: anApproval({ status: "approved", decidedBy: "Abdul Haque" }),
        };
      },
    });
    const card = await screen.findByTestId(`approval-${FLAG_ID}`);
    expect(card).toHaveTextContent("Damage flag");
    expect(card).toHaveTextContent("৳200");
    expect(card).toHaveTextContent("“torn bags”");
    expect(card).toHaveTextContent("Asked by Karim");
    expect(await axe(container)).toHaveNoViolations();

    await user.click(
      within(card).getByRole("button", { name: "Approve: write off" }),
    );

    expect(await screen.findByTestId("approvals-notice")).toHaveTextContent(
      "Approved: Miniket rice.",
    );
    expect(await screen.findByTestId("approvals-empty")).toBeInTheDocument();
    expect(
      bodiesSentTo(fetchFn, `POST /api/v1/approvals/${FLAG_ID}/approve`),
    ).toHaveLength(1);
  });

  it("rejects a reversal and shows a refusal from the server", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    setup("/approvals", {
      "GET /api/v1/approvals?status=pending": {
        status: 200,
        body: [
          anApproval({
            id: REV_ID,
            kind: "reversal",
            note: "wrong shop",
            movement: {
              id: "mv-sale",
              direction: "out",
              reason: "sale",
              createdAt: "2026-11-16T08:30:00.000Z",
            },
          }),
        ],
      },
      [`POST /api/v1/approvals/${REV_ID}/reject`]: () => {
        attempt += 1;
        return attempt === 1
          ? {
              status: 409,
              body: { code: "DUPLICATE", message: "This was already decided." },
            }
          : {
              status: 200,
              body: anApproval({ id: REV_ID, status: "rejected" }),
            };
      },
    });
    const card = await screen.findByTestId(`approval-${REV_ID}`);
    expect(card).toHaveTextContent("Reversal");
    expect(card).toHaveTextContent("Undo Sale of");

    await user.click(within(card).getByRole("button", { name: "Reject" }));
    expect(await screen.findByTestId("approvals-error")).toHaveTextContent(
      "This was already decided.",
    );

    await user.click(within(card).getByRole("button", { name: "Reject" }));
    expect(await screen.findByTestId("approvals-notice")).toHaveTextContent(
      "Rejected",
    );
  });

  it("says who must decide when you cannot, and lists decided ones", async () => {
    const user = userEvent.setup();
    setup(
      "/approvals",
      {
        "GET /api/v1/approvals?status=pending": {
          status: 200,
          body: [anApproval({ canDecide: false })],
        },
        "GET /api/v1/approvals?status=decided": {
          status: 200,
          body: [
            anApproval({
              status: "approved",
              canDecide: false,
              decidedBy: "Jamal",
              decidedAt: "2026-11-16T09:00:00.000Z",
            }),
          ],
        },
      },
      "warehouse_worker",
    );
    const card = await screen.findByTestId(`approval-${FLAG_ID}`);
    expect(card).toHaveTextContent("Waiting for someone else to decide.");
    expect(within(card).queryByRole("button")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("approvals-tab-decided"));
    expect(await screen.findByText(/Approved by Jamal/)).toBeInTheDocument();
    expect(screen.getByTestId("approvals-tab-decided")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("says when nothing has been decided", async () => {
    setup("/approvals?status=decided", {
      "GET /api/v1/approvals?status=decided": { status: 200, body: [] },
    });
    expect(await screen.findByTestId("approvals-empty")).toHaveTextContent(
      "Nothing has been decided yet.",
    );
  });
});

describe("Flag damage", () => {
  it("flags damaged stock for a decision", async () => {
    const user = userEvent.setup();
    const { fetchFn, container } = setup(
      `/damage?productId=${RICE_ID}`,
      {
        "GET /api/v1/products": { status: 200, body: [RICE] },
        "POST /api/v1/stock/damage-flags": { status: 201, body: anApproval() },
      },
      "warehouse_worker",
    );
    expect(await screen.findByTestId("damage-on-hand")).toHaveTextContent(
      "8 bag",
    );
    expect(await axe(container)).toHaveNoViolations();

    const quantity = screen.getByTestId("damage-quantity-input");
    await user.clear(quantity);
    await user.type(quantity, "2");
    await user.type(screen.getByTestId("damage-note-input"), "torn bags");
    await user.click(screen.getByTestId("damage-save-button"));

    expect(await screen.findByTestId("damage-saved")).toHaveTextContent(
      "Flagged 2 bag of Miniket rice (৳200). Waiting for a decision.",
    );
    expect(bodiesSentTo(fetchFn, "POST /api/v1/stock/damage-flags")[0]).toEqual(
      { productId: RICE_ID, quantity: 2, note: "torn bags" },
    );
  });

  it("shows a refusal under the field, or in the summary", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    setup(`/damage?productId=${RICE_ID}`, {
      "GET /api/v1/products": { status: 200, body: [RICE] },
      "POST /api/v1/stock/damage-flags": () => {
        attempt += 1;
        return attempt === 1
          ? {
              status: 409,
              body: {
                code: "INSUFFICIENT_STOCK",
                field: "quantity",
                message: "Only 8 bag in stock.",
              },
            }
          : { status: 500, body: { code: "INTERNAL_ERROR", message: "x" } };
      },
    });
    await screen.findByTestId("damage-on-hand");

    await user.click(screen.getByTestId("damage-save-button"));
    expect(await screen.findByText("Only 8 bag in stock.")).toBeInTheDocument();
    await user.click(screen.getByTestId("damage-save-button"));
    expect(await screen.findByTestId("damage-error-summary")).toHaveTextContent(
      "Couldn't save. Try again.",
    );
  });
});

describe("damage on other screens", () => {
  it("hides the direct Damaged reason from a worker and offers Flag damage", async () => {
    const user = userEvent.setup();
    setup(
      `/stock?productId=${RICE_ID}`,
      { "GET /api/v1/products": { status: 200, body: [RICE] } },
      "warehouse_worker",
    );
    await user.click(await screen.findByTestId("stock-direction-out"));
    const reasons = within(screen.getByTestId("stock-reason-select"))
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(reasons).toEqual(["Sale", "Count adjustment"]);
    expect(screen.getByTestId("stock-flag-link")).toHaveAttribute(
      "href",
      `/damage?productId=${RICE_ID}`,
    );
  });

  it("shows held damage on Products with a flag link", async () => {
    setup("/products", {
      "GET /api/v1/products": { status: 200, body: [RICE] },
    });
    const row = await screen.findByTestId("product-row-RICE-25");
    expect(row).toHaveTextContent("2 held as damaged");
    expect(
      within(row).getByRole("link", { name: "Flag damage" }),
    ).toHaveAttribute("href", `/damage?productId=${RICE_ID}`);
  });

  it("splits losses by source on the dashboard and points to approvals", async () => {
    setup("/dashboard", {
      "GET /api/v1/dashboard": {
        status: 200,
        body: {
          ...EMPTY_DASHBOARD,
          lossValue30d: 650,
          lossBreakdown: { damage: 100, damageFlagged: 200, missing: 350 },
          pendingApprovals: 2,
          damagedValue: 200,
        },
      },
    });
    expect(await screen.findByTestId("loss-damage")).toHaveTextContent(
      "Written off৳100",
    );
    expect(screen.getByTestId("loss-damage_flagged")).toHaveAttribute(
      "href",
      "/history?reason=damage_flagged",
    );
    expect(screen.getByTestId("loss-count")).toHaveTextContent("৳350");
    const banner = screen.getByTestId("pending-approvals");
    expect(banner).toHaveTextContent("2 requests waiting for approval");
    expect(banner).toHaveTextContent("৳200 held as damaged");
    expect(banner).toHaveAttribute("href", "/approvals");
  });
});

describe("Reverse a movement from History", () => {
  const history = {
    "GET /api/v1/stock/movements?limit=50": {
      status: 200,
      body: [
        aMovement(),
        aMovement({ id: "mv-count", reason: "count", quantity: 1 }),
      ],
    },
  };

  it("lets an owner ask for a reversal with a reason", async () => {
    const user = userEvent.setup();
    const { fetchFn } = setup("/history", {
      ...history,
      "POST /api/v1/approvals/reversals": {
        status: 201,
        body: anApproval({ kind: "reversal" }),
      },
    });
    await screen.findByTestId("history-table");
    expect(screen.queryByTestId("reverse-mv-count")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Reverse Sale of 4 bag Miniket rice",
      }),
    );
    await user.type(
      screen.getByTestId("reversal-note-input"),
      "Sold to the wrong shop",
    );
    await user.click(screen.getByTestId("reversal-send-button"));

    expect(await screen.findByTestId("reversal-sent")).toHaveTextContent(
      "Another owner or manager must approve it.",
    );
    expect(
      bodiesSentTo(fetchFn, "POST /api/v1/approvals/reversals")[0],
    ).toEqual({ movementId: "mv-sale", note: "Sold to the wrong shop" });
  });

  it("shows a refusal and can be cancelled", async () => {
    const user = userEvent.setup();
    setup("/history", {
      ...history,
      "POST /api/v1/approvals/reversals": {
        status: 409,
        body: {
          code: "DUPLICATE",
          field: "movementId",
          message:
            "This movement already has a reversal, asked for or approved.",
        },
      },
    });
    await user.click(await screen.findByTestId("reverse-mv-sale"));
    await user.click(screen.getByTestId("reversal-send-button"));
    expect(
      await screen.findByText(
        "This movement already has a reversal, asked for or approved.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("reversal-cancel-button"));
    expect(screen.queryByTestId("reversal-form")).not.toBeInTheDocument();
  });

  it("offers no reversal to a worker", async () => {
    setup("/history", history, "warehouse_worker");
    await screen.findByTestId("history-table");
    expect(screen.queryByTestId("reverse-mv-sale")).not.toBeInTheDocument();
  });
});

describe("My record", () => {
  const period = (n: number): RecordPeriod => ({
    movements: n,
    unitsIn: 1,
    unitsOut: 2,
    counts: 1,
    countMissing: 1,
    countExtra: 0,
    flagsRaised: 3,
    flagsApproved: 1,
    flagsRejected: 1,
    flagsPending: 1,
    decisions: 0,
  });
  const record = (name: string): WorkRecord => ({
    userId: "u",
    name,
    today: period(1),
    week: period(5),
    month: period(9),
  });

  it("shows a worker their own work for three periods", async () => {
    const { container } = setup(
      "/record",
      { "GET /api/v1/me/record": { status: 200, body: record("Karim") } },
      "warehouse_worker",
    );
    expect(await screen.findByTestId("record-name")).toHaveTextContent("Karim");
    const today = screen.getByTestId("record-today");
    expect(today).toHaveTextContent("1 in · 2 out");
    expect(today).toHaveTextContent("1 approved · 1 rejected · 1 waiting");
    expect(screen.getByTestId("record-month")).toHaveTextContent("9");
    expect(
      screen.queryByTestId("record-person-select"),
    ).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lets an owner look at someone else's record", async () => {
    const user = userEvent.setup();
    setup("/record", {
      "GET /api/v1/me/record": { status: 200, body: record("Abdul Haque") },
      "GET /api/v1/users/names": {
        status: 200,
        body: [
          { id: "4b0f8f43-34a1-4f0e-9d3a-6b2a5d1e7c11", name: "Abdul Haque" },
          { id: "k-1", name: "Karim" },
        ],
      },
      "GET /api/v1/me/record?userId=k-1": {
        status: 200,
        body: record("Karim"),
      },
    });
    await screen.findByTestId("record-name");
    await screen.findByRole("option", { name: "Karim" });
    expect(
      within(screen.getByTestId("record-person-select")).queryByRole("option", {
        name: "Abdul Haque",
      }),
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByTestId("record-person-select"), "k-1");
    expect(
      await screen.findByText("Karim", { selector: ".record-name" }),
    ).toBeInTheDocument();
  });
});
