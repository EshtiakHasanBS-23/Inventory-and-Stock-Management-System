import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCountUp } from "../src/useCountUp";
import { aSession, EMPTY_STOCK, renderApp, stubFetch } from "./helpers";

function Counter({ value }: { value: number }) {
  return <output data-testid="count">{Math.round(useCountUp(value))}</output>;
}

function mockMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi
      .fn()
      .mockReturnValue({ matches: reduce }) as unknown as typeof matchMedia,
  );
}

describe("count-up figures", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shows the number at once when there is no motion support", () => {
    render(<Counter value={42} />);
    expect(screen.getByTestId("count")).toHaveTextContent("42");
  });

  it("shows the number at once when the person asked for reduced motion", () => {
    mockMotion(true);
    render(<Counter value={42} />);
    expect(screen.getByTestId("count")).toHaveTextContent("42");
  });

  it("counts up to the number and lands on it exactly", async () => {
    mockMotion(false);
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
    render(<Counter value={100} />);
    expect(screen.getByTestId("count")).toHaveTextContent("0");

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    const midway = Number(screen.getByTestId("count").textContent);
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(100);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("count")).toHaveTextContent("100");
  });
});

describe("Stock in / out choice tiles", () => {
  it("are real radios with names, chosen by click or keyboard", async () => {
    const user = userEvent.setup();
    renderApp({
      path: "/stock",
      probe: false,
      fetchFn: stubFetch({
        ...EMPTY_STOCK,
        "GET /api/v1/auth/me": { status: 200, body: aSession() },
      }),
    });
    const stockIn = await screen.findByRole("radio", { name: /Stock in/ });
    const stockOut = screen.getByRole("radio", { name: /Stock out/ });
    expect(stockIn).toBeChecked();

    await user.click(screen.getByText("Sale, damage or adjustment"));
    expect(stockOut).toBeChecked();

    await user.keyboard("{ArrowLeft}");
    expect(stockIn).toBeChecked();
  });
});
