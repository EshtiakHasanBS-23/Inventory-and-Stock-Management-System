import type { Movement, StaffMember } from "@mojud/contracts";
import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { movementsPath } from "../src/api/stock";
import { dayStartIso, nextDayStartIso } from "../src/format";
import {
  aSession,
  callOf,
  EMPTY_STOCK,
  renderApp,
  stubFetch,
  type Handler,
} from "./helpers";

const ME = "GET /api/v1/auth/me";
const KARIM_ID = "44444444-4444-4444-8444-444444444444";
const get = (filters: Parameters<typeof movementsPath>[0], offset = 0) =>
  `GET /api/v1${movementsPath(filters, offset)}`;

function aMovement(index: number, overrides: Partial<Movement> = {}): Movement {
  return {
    id: `m-${index}`,
    productId: "11111111-1111-4111-8111-111111111111",
    productName: "Miniket rice",
    sku: "RICE-25",
    unit: "bag",
    direction: "in",
    reason: "purchase",
    quantity: index + 1,
    balanceAfter: 100,
    value: 0,
    note: null,
    userName: "Abdul Haque",
    createdAt: "2026-11-16T08:30:00.000Z",
    ...overrides,
  };
}

function setup(path: string, handlers: Record<string, Handler>) {
  const fetchFn = stubFetch({
    ...EMPTY_STOCK,
    [ME]: { status: 200, body: aSession("owner") },
    "GET /api/v1/users/names": {
      status: 200,
      body: [
        { id: "4b0f8f43-34a1-4f0e-9d3a-6b2a5d1e7c11", name: "Abdul Haque" },
        { id: KARIM_ID, name: "Karim" },
      ],
    },
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

describe("History filters", () => {
  it("builds the URL with filters in a fixed order and pages with offset", () => {
    expect(movementsPath({})).toBe("/stock/movements?limit=50");
    expect(
      movementsPath({ userId: "u", reason: "sale", productId: "p" }, 100),
    ).toBe(
      "/stock/movements?productId=p&reason=sale&userId=u&limit=50&offset=100",
    );
  });

  it("filters by reason, person and dates, then clears the filters", async () => {
    const user = userEvent.setup();
    const from = dayStartIso("2026-11-01");
    const to = nextDayStartIso("2026-11-30");
    const { container } = setup("/history", {
      [get({})]: { status: 200, body: [aMovement(1), aMovement(2)] },
      [get({ reason: "damage" })]: {
        status: 200,
        body: [aMovement(3, { reason: "damage", direction: "out" })],
      },
      [get({ reason: "damage", userId: KARIM_ID })]: {
        status: 200,
        body: [],
      },
      [get({ reason: "damage", userId: KARIM_ID, from })]: {
        status: 200,
        body: [],
      },
      [get({ reason: "damage", userId: KARIM_ID, from, to })]: {
        status: 200,
        body: [
          aMovement(4, {
            reason: "damage",
            direction: "out",
            userName: "Karim",
          }),
        ],
      },
    });
    const table = await screen.findByTestId("history-table");
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
    expect(
      screen.queryByTestId("history-clear-filters"),
    ).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByTestId("history-reason-select"),
      "damage",
    );
    expect(
      await screen.findByRole("cell", { name: "Damaged" }),
    ).toBeInTheDocument();

    await screen.findByRole("option", { name: "Karim" });
    await user.selectOptions(
      screen.getByTestId("history-person-select"),
      KARIM_ID,
    );
    expect(
      await screen.findByTestId("history-table-empty"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("history-from-input"), {
      target: { value: "2026-11-01" },
    });
    fireEvent.change(screen.getByTestId("history-to-input"), {
      target: { value: "2026-11-30" },
    });
    expect(await screen.findByText("Karim")).toBeInTheDocument();

    await user.click(screen.getByTestId("history-clear-filters"));
    expect(
      await screen.findByRole("cell", { name: /^\+2 bag$/ }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("history-reason-select")).toHaveValue("");
  });

  it("loads more movements until there are no more", async () => {
    const user = userEvent.setup();
    const firstPage = Array.from({ length: 50 }, (_, i) => aMovement(i));
    setup("/history", {
      [get({})]: { status: 200, body: firstPage },
      [get({}, 50)]: {
        status: 200,
        body: [aMovement(50), aMovement(51), aMovement(52)],
      },
    });
    const table = await screen.findByTestId("history-table");
    expect(within(table).getAllByRole("row")).toHaveLength(51);

    await user.click(screen.getByTestId("history-load-more"));

    expect(
      await screen.findByRole("cell", { name: /^\+53 bag$/ }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("history-table")).getAllByRole("row"),
    ).toHaveLength(54);
    expect(screen.queryByTestId("history-load-more")).not.toBeInTheDocument();
  });

  it("says so when history cannot load", async () => {
    setup("/history", {
      [get({})]: {
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

describe("My password", () => {
  it("changes the password and clears the form", async () => {
    const user = userEvent.setup();
    const { fetchFn, container } = setup("/account", {
      "POST /api/v1/auth/password": { status: 204 },
    });
    await screen.findByRole("heading", { level: 1, name: "My password" });
    expect(await axe(container)).toHaveNoViolations();

    await user.type(screen.getByTestId("account-current-input"), "old pass 1");
    await user.type(screen.getByTestId("account-new-input"), "new pass 12");
    await user.click(screen.getByTestId("account-save-button"));

    expect(await screen.findByTestId("account-saved")).toHaveTextContent(
      "Password changed.",
    );
    expect(bodiesSentTo(fetchFn, "POST /api/v1/auth/password")[0]).toEqual({
      currentPassword: "old pass 1",
      newPassword: "new pass 12",
    });
    expect(screen.getByTestId("account-current-input")).toHaveValue("");
  });

  it("shows a wrong current password under its field, and other failures in the summary", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    setup("/account", {
      "POST /api/v1/auth/password": () => {
        attempt += 1;
        return attempt === 1
          ? {
              status: 400,
              body: {
                code: "VALIDATION_FAILED",
                field: "currentPassword",
                message: "Your current password is not correct.",
              },
            }
          : { status: 500, body: { code: "INTERNAL_ERROR", message: "x" } };
      },
    });
    await screen.findByRole("heading", { level: 1, name: "My password" });

    await user.click(screen.getByTestId("account-save-button"));
    expect(
      await screen.findByText("Your current password is not correct."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("account-current-input")).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    await user.click(screen.getByTestId("account-save-button"));
    expect(
      await screen.findByTestId("account-error-summary"),
    ).toHaveTextContent("Couldn't save. Try again.");
  });
});

describe("Staff password reset", () => {
  const OWNER: StaffMember = {
    id: "4b0f8f43-34a1-4f0e-9d3a-6b2a5d1e7c11",
    name: "Abdul Haque",
    phone: "01711000001",
    role: "owner",
    active: true,
    createdAt: "2026-11-01T08:00:00.000Z",
  };
  const KARIM: StaffMember = {
    id: KARIM_ID,
    name: "Karim",
    phone: "01811000002",
    role: "warehouse_worker",
    active: true,
    createdAt: "2026-11-02T08:00:00.000Z",
  };
  const USERS = { status: 200, body: [OWNER, KARIM] };

  it("sets a new password for a staff member", async () => {
    const user = userEvent.setup();
    const { fetchFn } = setup("/staff", {
      "GET /api/v1/users": USERS,
      [`POST /api/v1/users/${KARIM_ID}/password`]: { status: 204 },
    });
    expect(
      screen.queryByTestId(`staff-reset-${OWNER.phone}`),
    ).not.toBeInTheDocument();

    await user.click(
      await screen.findByRole("button", { name: "Reset password for Karim" }),
    );
    expect(
      screen.getByRole("heading", { name: "New password for Karim" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("staff-form")).not.toBeInTheDocument();
    await user.type(screen.getByTestId("reset-password-input"), "fresh pass 1");
    await user.click(screen.getByTestId("reset-save-button"));

    expect(await screen.findByTestId("staff-notice")).toHaveTextContent(
      "Karim's password is changed. Tell them the new one.",
    );
    expect(screen.getByTestId("staff-form")).toBeInTheDocument();
    expect(
      bodiesSentTo(fetchFn, `POST /api/v1/users/${KARIM_ID}/password`),
    ).toEqual([{ newPassword: "fresh pass 1" }]);
  });

  it("shows a short password under the field, a failure in the summary, and cancels", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    setup("/staff", {
      "GET /api/v1/users": USERS,
      [`POST /api/v1/users/${KARIM_ID}/password`]: () => {
        attempt += 1;
        return attempt === 1
          ? {
              status: 400,
              body: {
                code: "VALIDATION_FAILED",
                field: "newPassword",
                message: "At least 8 characters.",
              },
            }
          : { status: 500, body: { code: "INTERNAL_ERROR", message: "x" } };
      },
    });
    await user.click(
      await screen.findByRole("button", { name: "Reset password for Karim" }),
    );

    await user.click(screen.getByTestId("reset-save-button"));
    expect(
      await screen.findByText("At least 8 characters.", {
        selector: ".refusal",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("reset-save-button"));
    expect(await screen.findByTestId("reset-error-summary")).toHaveTextContent(
      "Couldn't save. Try again.",
    );

    await user.click(screen.getByTestId("reset-cancel-button"));
    expect(screen.queryByTestId("reset-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("staff-notice")).not.toBeInTheDocument();
  });
});
