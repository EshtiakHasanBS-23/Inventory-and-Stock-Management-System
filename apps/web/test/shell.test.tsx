import type { Role } from "@mojud/contracts";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  aSession,
  callOf,
  EMPTY_STOCK,
  NOT_SIGNED_IN,
  renderApp,
  stubFetch,
} from "./helpers";

const ME = "GET /api/v1/auth/me";
const SIGNOUT = "POST /api/v1/auth/signout";
const signedInAs = (role: Role) => ({
  ...EMPTY_STOCK,
  [ME]: { status: 200, body: aSession(role) },
});

const NAV = ["Dashboard", "Products", "Stock in / out", "History"];

describe("app shell and role landing (BR4.1)", () => {
  it.each([
    ["owner", "/dashboard", "Dashboard"],
    ["manager", "/dashboard", "Dashboard"],
    ["sales_rep", "/dashboard", "Dashboard"],
    ["warehouse_worker", "/dashboard", "Dashboard"],
    ["supervisor", "/dashboard", "Dashboard"],
    ["accountant", "/dashboard", "Dashboard"],
  ] as const)("lands a %s on %s", async (role, path, heading) => {
    renderApp({ path: "/", fetchFn: stubFetch(signedInAs(role)) });

    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(path);
  });

  it.each([
    ["owner", NAV],
    ["sales_rep", NAV],
    ["warehouse_worker", NAV],
    ["accountant", NAV],
  ] as const)(
    "shows the side-nav items for a %s, marking the current one",
    async (role, items) => {
      renderApp({ path: "/", fetchFn: stubFetch(signedInAs(role)) });
      await screen.findByRole("heading", { level: 1 });

      const nav = screen.getByRole("navigation", { name: "Main" });
      const links = within(nav).queryAllByRole("link");
      expect(links.map((link) => link.textContent)).toEqual(items);
      if (links[0]) expect(links[0]).toHaveAttribute("aria-current", "page");
    },
  );

  it("sends an unknown page to the dashboard", async () => {
    renderApp({
      path: "/setup",
      fetchFn: stubFetch(signedInAs("warehouse_worker")),
    });

    expect(
      await screen.findByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("shows the name, role, Online status and theme switch in the app bar", async () => {
    renderApp({ path: "/", fetchFn: stubFetch(signedInAs("owner")) });
    await screen.findByRole("heading", { level: 1 });

    const header = screen.getByRole("banner");
    expect(within(header).getByTestId("app-bar-user-name")).toHaveTextContent(
      "Abdul Haque",
    );
    expect(within(header).getByTestId("app-bar-user-role")).toHaveTextContent(
      "Owner",
    );
    expect(within(header).getByText("Online")).toBeInTheDocument();
    expect(within(header).getByLabelText("Theme")).toBeInTheDocument();
  });

  it("sends a signed-in person who opens /signin to their role home", async () => {
    renderApp({ path: "/signin", fetchFn: stubFetch(signedInAs("sales_rep")) });

    expect(
      await screen.findByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});

describe("401 handling (frontend-components.md)", () => {
  it("shows Sign in with no message when the first /auth/me is refused, even as SESSION_ENDED", async () => {
    renderApp({
      path: "/setup",
      fetchFn: stubFetch({
        [ME]: { status: 401, body: { code: "SESSION_ENDED", message: "x" } },
      }),
    });

    expect(
      await screen.findByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("signin-session-ended"),
    ).not.toBeInTheDocument();
  });

  it("signs out with the CSRF token and shows Sign in with no message", async () => {
    const user = userEvent.setup();
    const fetchFn = stubFetch({
      ...signedInAs("owner"),
      [SIGNOUT]: { status: 204 },
    });
    renderApp({ path: "/", fetchFn });
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(screen.getByTestId("app-bar-sign-out-button"));

    expect(
      await screen.findByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("signin-session-ended"),
    ).not.toBeInTheDocument();
    const signOutIndex = fetchFn.mock.calls.findIndex(([url]) =>
      String(url).endsWith("/auth/signout"),
    );
    expect(callOf(fetchFn, signOutIndex).headers["X-CSRF-Token"]).toBe(
      "csrf-token-from-server",
    );
  });

  it('returns to Sign in with "Your session ended" when a later call gets SESSION_ENDED', async () => {
    const user = userEvent.setup();
    renderApp({
      path: "/dashboard",
      fetchFn: stubFetch({
        ...signedInAs("owner"),
        [SIGNOUT]: {
          status: 401,
          body: {
            code: "SESSION_ENDED",
            message: "Your session ended. Sign in again.",
          },
        },
      }),
    });
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(screen.getByTestId("app-bar-sign-out-button"));

    expect(await screen.findByTestId("signin-session-ended")).toHaveTextContent(
      "Your session ended. Sign in again.",
    );
  });

  it("returns to Sign in with no message when a later call gets NOT_SIGNED_IN", async () => {
    const user = userEvent.setup();
    renderApp({
      path: "/dashboard",
      fetchFn: stubFetch({ ...signedInAs("owner"), [SIGNOUT]: NOT_SIGNED_IN }),
    });
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(screen.getByTestId("app-bar-sign-out-button"));

    expect(
      await screen.findByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("signin-session-ended"),
    ).not.toBeInTheDocument();
  });

  it("keeps the person signed in and says so when sign-out fails on the server", async () => {
    const user = userEvent.setup();
    renderApp({
      path: "/dashboard",
      fetchFn: stubFetch({
        ...signedInAs("owner"),
        [SIGNOUT]: {
          status: 500,
          body: { code: "INTERNAL_ERROR", message: "x" },
        },
      }),
    });
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(screen.getByTestId("app-bar-sign-out-button"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't save. Try again.",
    );
    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});
