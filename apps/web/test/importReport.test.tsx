import type { ImportRow, Role, StockReport } from "@mojud/contracts";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import {
  parseCsv,
  PRODUCT_TEMPLATE_CSV,
  readProductCsv,
} from "../src/csvImport";
import { dayStartIso, nextDayStartIso } from "../src/format";
import { thisMonth } from "../src/pages/stock/ReportPage";
import {
  aSession,
  callOf,
  EMPTY_STOCK,
  renderApp,
  stubFetch,
  type Handler,
} from "./helpers";

const ME = "GET /api/v1/auth/me";

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

const csvFile = (text: string, name = "products.csv") =>
  new File([text], name, { type: "text/csv" });

describe("reading a product CSV", () => {
  it("handles quotes, escaped quotes, CRLF, a BOM and blank lines", () => {
    expect(
      parseCsv(
        `${String.fromCharCode(0xfeff)}a,b\r\n"x, y","say ""hi"""\r\n\r\nlast,1`,
      ),
    ).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
      ["last", "1"],
    ]);
  });

  it("reads semicolon files saved by Excel in some regions", () => {
    expect(parseCsv("sku;name\nA;Rice\n")).toEqual([
      ["sku", "name"],
      ["A", "Rice"],
    ]);
  });

  it("matches headers loosely, reads Excel numbers and defaults empty numbers to 0", () => {
    const preview = readProductCsv(
      'SKU,Name,Unit,Unit Cost (BDT),MIN_STOCK,Opening stock\nRICE,Rice,bag,"1,250.50",5,40\nOIL,Oil,ctn,৳ 99,,\n',
    );
    expect(preview.problems).toEqual([]);
    expect(preview.rows).toEqual<ImportRow[]>([
      {
        sku: "RICE",
        name: "Rice",
        unit: "bag",
        unitCost: 1250.5,
        minStock: 5,
        openingStock: 40,
      },
      {
        sku: "OIL",
        name: "Oil",
        unit: "ctn",
        unitCost: 99,
        minStock: 0,
        openingStock: 0,
      },
    ]);
  });

  it("accepts its own template", () => {
    expect(readProductCsv(PRODUCT_TEMPLATE_CSV).rows).toHaveLength(1);
  });

  it("lists each bad row by its spreadsheet row number", () => {
    const preview = readProductCsv(
      "sku,name,unit,opening_stock\nA,Rice,bag,1\nB,,bag,1\nA,Again,bag,1\nC,Salt,kg,-2\n",
    );
    expect(preview.rows.map((r) => r.sku)).toEqual(["A"]);
    expect(preview.problems).toEqual([
      { row: 3, message: "Enter a product name." },
      { row: 4, message: "SKU A is also on row 2." },
      { row: 5, message: "Enter a whole number, 0 or more." },
    ]);
  });

  it.each([
    ["", "The file is empty."],
    ["sku,name\nA,Rice\n", "Missing column: unit. Use the template."],
    ["sku,name,unit\n", "The file has no product rows."],
    [
      `sku,name,unit\n${Array.from({ length: 1001 }, (_, i) => `S${i},N,pcs`).join("\n")}`,
      "Import at most 1000 products at a time.",
    ],
  ])("refuses a file that cannot be imported (%#)", (text, message) => {
    const preview = readProductCsv(text);
    expect(preview.rows).toEqual([]);
    expect(preview.problems[0]?.message).toBe(message);
  });
});

describe("Import page", () => {
  it("previews a good file and imports every row", async () => {
    const user = userEvent.setup();
    const { fetchFn, container } = setup("/products/import", {
      "POST /api/v1/products/import": {
        status: 201,
        body: { created: 2, openingUnits: 40 },
      },
    });
    await screen.findByRole("heading", { level: 1, name: "Import from Excel" });
    expect(screen.getByTestId("import-template-link")).toHaveAttribute(
      "download",
      "mojud-products-template.csv",
    );
    expect(await axe(container)).toHaveNoViolations();

    await user.upload(
      screen.getByTestId("import-file-input"),
      csvFile("sku,name,unit,opening_stock\nA,Rice,bag,40\nB,Oil,ctn,0\n"),
    );

    expect(await screen.findByTestId("import-ready")).toHaveTextContent(
      "2 products are ready to import.",
    );
    expect(
      within(screen.getByTestId("import-preview")).getAllByRole("row"),
    ).toHaveLength(3);
    await user.click(screen.getByTestId("import-save-button"));

    expect(await screen.findByTestId("import-done")).toHaveTextContent(
      "Imported 2 products with 40 units of opening stock.",
    );
    expect(
      bodiesSentTo(fetchFn, "POST /api/v1/products/import")[0],
    ).toMatchObject({
      rows: [
        { sku: "A", openingStock: 40 },
        { sku: "B", openingStock: 0 },
      ],
    });
  });

  it("lists problems and offers no import button", async () => {
    const user = userEvent.setup();
    setup("/products/import", {});
    await screen.findByRole("heading", { level: 1, name: "Import from Excel" });

    await user.upload(
      screen.getByTestId("import-file-input"),
      csvFile("sku,name,unit\nA,,bag\n", "bad.csv"),
    );

    const problems = await screen.findByTestId("import-problems");
    expect(problems).toHaveTextContent("bad.csv has 1 problem.");
    expect(problems).toHaveTextContent("Row 2: Enter a product name.");
    expect(screen.queryByTestId("import-save-button")).not.toBeInTheDocument();
  });

  it("shows the server's refusal", async () => {
    const user = userEvent.setup();
    setup("/products/import", {
      "POST /api/v1/products/import": {
        status: 400,
        body: {
          code: "VALIDATION_FAILED",
          field: "rows",
          message: "Row 2: a product with SKU A already exists.",
        },
      },
    });
    await screen.findByRole("heading", { level: 1, name: "Import from Excel" });
    await user.upload(
      screen.getByTestId("import-file-input"),
      csvFile("sku,name,unit\nA,Rice,bag\n"),
    );
    await user.click(await screen.findByTestId("import-save-button"));

    expect(await screen.findByTestId("import-server-error")).toHaveTextContent(
      "Row 2: a product with SKU A already exists.",
    );
  });

  it("is only for owners and managers", async () => {
    setup("/products/import", {}, "warehouse_worker");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});

describe("CSV download links", () => {
  it("offers import and download on Products, import only for managers", async () => {
    setup("/products", {});
    await screen.findByRole("heading", { level: 1, name: "Products" });
    expect(screen.getByTestId("products-download")).toHaveAttribute(
      "href",
      "/api/v1/products/export.csv",
    );
    expect(screen.getByTestId("products-import-link")).toHaveAttribute(
      "href",
      "/products/import",
    );
  });

  it("hides import from a worker", async () => {
    setup("/products", {}, "warehouse_worker");
    await screen.findByTestId("products-download");
    expect(
      screen.queryByTestId("products-import-link"),
    ).not.toBeInTheDocument();
  });

  it("downloads history with the same filters, without paging", async () => {
    setup("/history?reason=damage", {
      "GET /api/v1/stock/movements?reason=damage&limit=50": {
        status: 200,
        body: [],
      },
    });
    expect(await screen.findByTestId("history-download")).toHaveAttribute(
      "href",
      "/api/v1/stock/movements/export.csv?reason=damage",
    );
  });
});

describe("Report page", () => {
  const LINE = {
    productId: "11111111-1111-4111-8111-111111111111",
    sku: "RICE-25",
    name: "Miniket rice",
    unit: "bag",
    opening: 10,
    received: 20,
    sold: 5,
    damaged: 2,
    countDifference: -1,
    adjusted: 1,
    closing: 23,
    receivedValue: 2000,
    soldValue: 500,
    damagedValue: 200,
    missingValue: 100,
  };

  function reportKey(fromDay: string, toDay: string) {
    const query = new URLSearchParams({
      from: dayStartIso(fromDay),
      to: nextDayStartIso(toDay),
    });
    return `GET /api/v1/reports/stock?${query.toString()}`;
  }

  function aReport(lines = [LINE]): StockReport {
    const { productId: _p, sku: _s, name: _n, unit: _u, ...totals } = LINE;
    return { from: "x", to: "y", lines, totals };
  }

  it("shows 50 report lines at a time, with the total for every line", async () => {
    const user = userEvent.setup();
    const month = thisMonth();
    const lines = Array.from({ length: 60 }, (_, i) => ({
      ...LINE,
      productId: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      sku: `SKU-${i}`,
    }));
    setup("/reports", {
      [reportKey(month.from, month.to)]: { status: 200, body: aReport(lines) },
    });
    const table = await screen.findByTestId("report-table");
    const rows = () => table.querySelectorAll("tbody tr").length;
    expect(rows()).toBe(50);
    expect(screen.getByTestId("report-total")).toBeInTheDocument();
    expect(screen.getByTestId("report-showing")).toHaveTextContent(
      "Showing 50 of 60",
    );

    await user.click(screen.getByTestId("report-load-more"));
    expect(rows()).toBe(60);
    expect(screen.queryByTestId("report-load-more")).toBeNull();
  });

  it("works out this month in local dates", () => {
    expect(thisMonth(new Date(2026, 10, 16, 9))).toEqual({
      from: "2026-11-01",
      to: "2026-11-16",
    });
  });

  it("shows this month by default, with totals in taka and a CSV link", async () => {
    const month = thisMonth();
    const { container } = setup("/reports", {
      [reportKey(month.from, month.to)]: { status: 200, body: aReport() },
    });

    const table = await screen.findByTestId("report-table");
    const row = within(table).getAllByRole("row")[1];
    expect(row).toHaveTextContent("Miniket rice");
    expect(row).toHaveTextContent("−1");
    expect(row).toHaveTextContent("−৳100");
    expect(row).toHaveTextContent("+1");
    expect(screen.getByTestId("report-total")).toHaveTextContent("23");
    expect(screen.getByTestId("report-sold-value")).toHaveTextContent("৳500");
    expect(screen.getByTestId("report-lost-value")).toHaveTextContent("৳300");
    expect(screen.getByTestId("report-download")).toHaveAttribute(
      "href",
      expect.stringContaining("/api/v1/reports/stock.csv?from="),
    );
    expect(screen.getByTestId("report-from-input")).toHaveValue(month.from);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses the dates in the address and says when nothing moved", async () => {
    setup("/reports?from=2026-10-01&to=2026-10-31", {
      [reportKey("2026-10-01", "2026-10-31")]: {
        status: 200,
        body: aReport([]),
      },
    });
    expect(await screen.findByTestId("report-empty")).toHaveTextContent(
      "No stock in this period.",
    );
  });

  it("asks for a valid range instead of loading", async () => {
    setup("/reports?from=2026-11-10&to=2026-11-01", {});
    expect(await screen.findByTestId("report-bad-range")).toHaveTextContent(
      "Choose a start date on or before the end date.",
    );
  });

  it("changes the range from the date boxes", async () => {
    const user = userEvent.setup();
    setup("/reports?from=2026-10-01&to=2026-10-31", {
      [reportKey("2026-10-01", "2026-10-31")]: {
        status: 200,
        body: aReport([]),
      },
      [reportKey("2026-09-01", "2026-10-31")]: {
        status: 200,
        body: aReport(),
      },
    });
    await screen.findByTestId("report-empty");

    const from = screen.getByTestId("report-from-input");
    await user.clear(from);
    await user.type(from, "2026-09-01");

    expect(await screen.findByTestId("report-table")).toBeInTheDocument();
  });

  it("says so when the report cannot load", async () => {
    setup("/reports?from=2026-10-01&to=2026-10-31", {
      [reportKey("2026-10-01", "2026-10-31")]: {
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
