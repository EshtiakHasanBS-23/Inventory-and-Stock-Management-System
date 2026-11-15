import type { Product, StockReport } from "@mojud/contracts";
import { sql } from "kysely";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { AppBundle } from "../../src/app.js";
import { dhakaDateTime, toCsv } from "../../src/platform/csv.js";
import type { Db } from "../../src/platform/db/db.js";
import {
  buildTestApp,
  postWithCsrf,
  type SignedInAgent,
} from "../helpers/app.js";
import { closeTestDb, truncateIdentity, useTestDb } from "../helpers/db.js";
import { twoBusinesses } from "../helpers/twoBusinesses.js";

const IMPORT = "/api/v1/products/import";

function aRow(overrides: Record<string, unknown> = {}) {
  return {
    sku: "RICE-25",
    name: "Miniket rice",
    unit: "bag",
    unitCost: 1250.5,
    minStock: 5,
    openingStock: 10,
    ...overrides,
  };
}

/** Splits a CSV body (after the BOM) into lines of cells, for simple files. */
function csvLines(text: string): string[] {
  expect(text.startsWith(String.fromCharCode(0xfeff))).toBe(true);
  return text.slice(1).trimEnd().split("\r\n");
}

describe("CSV writer", () => {
  it("quotes where needed and neutralises formulas", () => {
    const csv = toCsv(
      ["a", "b"],
      [
        ["plain", 12.5],
        ['say "hi", ok', null],
        ["=HYPERLINK(1)", "-5"],
        ["@cmd", "+1"],
      ],
    );
    expect(csvLines(csv)).toEqual([
      "a,b",
      "plain,12.5",
      '"say ""hi"", ok",',
      "'=HYPERLINK(1),'-5",
      "'@cmd,'+1",
    ]);
  });

  it("writes dates in Dhaka time", () => {
    expect(dhakaDateTime("2026-11-16T08:30:00.000Z")).toBe("2026-11-16 14:30");
  });
});

describe("import, export and report", () => {
  let db: Db;
  let bundle: AppBundle;
  let a: SignedInAgent;
  let b: SignedInAgent;

  async function setRole(who: SignedInAgent, role: string): Promise<void> {
    await sql`UPDATE users SET role = ${role} WHERE id = ${who.session.userId}`.execute(
      db,
    );
  }

  async function move(
    productId: string,
    direction: "in" | "out",
    quantity: number,
    reason: string,
  ) {
    const res = await postWithCsrf(a, "/api/v1/stock/movements").send({
      productId,
      direction,
      reason,
      quantity,
    });
    expect(res.status).toBe(201);
  }

  /** Moves the movements made in the last hour to the given time (test-only). */
  async function backdateAll(iso: string): Promise<void> {
    await sql`ALTER TABLE stock_movements DISABLE TRIGGER stock_movements_no_update_or_delete`.execute(
      db,
    );
    await sql`UPDATE stock_movements SET created_at = ${iso}::timestamptz WHERE created_at > now() - interval '1 hour'`.execute(
      db,
    );
    await sql`ALTER TABLE stock_movements ENABLE TRIGGER stock_movements_no_update_or_delete`.execute(
      db,
    );
  }

  beforeAll(() => {
    db = useTestDb();
    bundle = buildTestApp({ db });
  });

  beforeEach(async () => {
    await truncateIdentity(db);
    ({ a, b } = await twoBusinesses(bundle.app));
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe("product import", () => {
    it("creates products with opening stock recorded as movements", async () => {
      const res = await postWithCsrf(a, IMPORT).send({
        rows: [
          aRow(),
          aRow({ sku: "OIL-5", name: "Oil", unitCost: 0, openingStock: 0 }),
        ],
      });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ created: 2, openingUnits: 10 });

      const products = (await a.agent.get("/api/v1/products"))
        .body as Product[];
      expect(products.map((p) => [p.sku, p.onHand, p.unitCost])).toEqual([
        ["RICE-25", 10, 1250.5],
        ["OIL-5", 0, 0],
      ]);
      const history = await a.agent.get("/api/v1/stock/movements");
      expect(history.body).toHaveLength(1);
      expect(history.body[0]).toMatchObject({
        reason: "opening",
        quantity: 10,
        balanceAfter: 10,
        value: 12505,
        note: "Imported opening stock",
      });
    });

    it("names the spreadsheet row and field of the first bad value", async () => {
      const res = await postWithCsrf(a, IMPORT).send({
        rows: [aRow(), aRow({ sku: "B", name: "" })],
      });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        field: "rows",
        message: "Row 3: Enter a product name.",
      });
      expect((await a.agent.get("/api/v1/products")).body).toEqual([]);
    });

    it("refuses a SKU repeated in the file or already in use, saving nothing", async () => {
      const repeated = await postWithCsrf(a, IMPORT).send({
        rows: [aRow(), aRow({ sku: "X" }), aRow()],
      });
      expect(repeated.body.message).toBe(
        "Row 4: SKU RICE-25 is also on row 2.",
      );

      await postWithCsrf(a, IMPORT).send({ rows: [aRow({ sku: "OLD" })] });
      const existing = await postWithCsrf(a, IMPORT).send({
        rows: [aRow({ sku: "NEW" }), aRow({ sku: "OLD" })],
      });
      expect(existing.body.message).toBe(
        "Row 3: a product with SKU OLD already exists.",
      );
      const skus = (
        (await a.agent.get("/api/v1/products")).body as Product[]
      ).map((p) => p.sku);
      expect(skus).toEqual(["OLD"]);

      // Another business may use the same SKU.
      expect(
        (await postWithCsrf(b, IMPORT).send({ rows: [aRow({ sku: "OLD" })] }))
          .status,
      ).toBe(201);
    });

    it("refuses an empty file and roles that cannot manage products", async () => {
      const empty = await postWithCsrf(a, IMPORT).send({ rows: [] });
      expect(empty.status).toBe(400);
      expect(empty.body.message).toBe(
        "The file has no product rows, or more than 1000.",
      );

      await setRole(a, "warehouse_worker");
      expect(
        (await postWithCsrf(a, IMPORT).send({ rows: [aRow()] })).status,
      ).toBe(403);
    });
  });

  describe("CSV exports", () => {
    it("exports products with stock and value, only for the caller's business", async () => {
      await postWithCsrf(a, IMPORT).send({
        rows: [aRow(), aRow({ sku: "EVIL", name: "=cmd()", openingStock: 0 })],
      });

      const res = await a.agent.get("/api/v1/products/export.csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toBe(
        'attachment; filename="products.csv"',
      );
      expect(csvLines(res.text)).toEqual([
        "SKU,Name,Unit,In stock,Minimum stock,Status,Unit cost (BDT),Stock value (BDT)",
        "EVIL,'=cmd(),bag,0,5,out,1250.5,0",
        "RICE-25,Miniket rice,bag,10,5,ok,1250.5,12505",
      ]);

      const other = await b.agent.get("/api/v1/products/export.csv");
      expect(csvLines(other.text)).toHaveLength(1);
      expect(
        (await request(bundle.app).get("/api/v1/products/export.csv")).status,
      ).toBe(401);
    });

    it("exports the filtered history, ignoring paging", async () => {
      await postWithCsrf(a, IMPORT).send({ rows: [aRow()] });
      const [rice] = (await a.agent.get("/api/v1/products")).body as Product[];
      await move(rice?.id ?? "", "out", 2, "damage");
      await move(rice?.id ?? "", "out", 1, "sale");

      const all = await a.agent
        .get("/api/v1/stock/movements/export.csv")
        .query({ limit: 1, offset: 5 });
      expect(csvLines(all.text)).toHaveLength(4);
      expect(csvLines(all.text)[0]).toBe(
        "Date (Dhaka time),SKU,Product,Direction,Reason,Quantity,Unit,Balance after,Value (BDT),By,Note",
      );

      const damage = await a.agent
        .get("/api/v1/stock/movements/export.csv")
        .query({ reason: "damage" });
      const lines = csvLines(damage.text);
      expect(lines).toHaveLength(2);
      expect(lines[1]).toMatch(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2},RICE-25,Miniket rice,out,damage,2,bag,8,2501,Abdul Haque,$/,
      );

      const bad = await a.agent
        .get("/api/v1/stock/movements/export.csv")
        .query({ reason: "theft" });
      expect(bad.status).toBe(400);
    });
  });

  describe("stock report", () => {
    it("shows opening, each kind of change, closing and values for the range", async () => {
      // Before the range: 10 bags opening stock (October).
      await postWithCsrf(a, IMPORT).send({
        rows: [
          aRow({ unitCost: 100 }),
          aRow({ sku: "IDLE", name: "Idle", openingStock: 0 }),
        ],
      });
      const [, rice] = (await a.agent.get("/api/v1/products"))
        .body as Product[];
      const riceId = rice?.id ?? "";
      await backdateAll("2026-10-20T06:00:00Z");

      // In the range (November): +20 purchase, -5 sale, -2 damage,
      // count finds 1 missing, +1 adjustment.
      await move(riceId, "in", 20, "purchase");
      await move(riceId, "out", 5, "sale");
      await move(riceId, "out", 2, "damage");
      await postWithCsrf(a, "/api/v1/stock/counts").send({
        productId: riceId,
        countedQuantity: 22,
      });
      await move(riceId, "in", 1, "adjustment");
      await backdateAll("2026-11-10T06:00:00Z");

      // After the range: -3 sale on 5 December, not counted in November.
      await move(riceId, "out", 3, "sale");
      await backdateAll("2026-12-05T06:00:00Z");

      const res = await a.agent.get("/api/v1/reports/stock").query({
        from: "2026-11-01T00:00:00.000Z",
        to: "2026-12-01T00:00:00.000Z",
      });
      expect(res.status).toBe(200);
      const report = res.body as StockReport;
      expect(report.lines).toEqual([
        {
          productId: riceId,
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
        },
      ]);
      expect(report.totals).toMatchObject({ opening: 10, closing: 23 });

      const october = await a.agent.get("/api/v1/reports/stock").query({
        from: "2026-10-01T00:00:00.000Z",
        to: "2026-11-01T00:00:00.000Z",
      });
      expect(october.body.lines[0]).toMatchObject({
        opening: 0,
        received: 10,
        closing: 10,
        receivedValue: 1000,
      });

      const csv = await a.agent.get("/api/v1/reports/stock.csv").query({
        from: "2026-11-01T00:00:00.000Z",
        to: "2026-12-01T00:00:00.000Z",
      });
      const lines = csvLines(csv.text);
      expect(lines[1]).toBe(
        "RICE-25,Miniket rice,bag,10,20,5,2,-1,1,23,2000,500,200,100",
      );
      expect(lines[2]).toBe(",Total,,10,20,5,2,-1,1,23,2000,500,200,100");
    });

    it("refuses a missing or backwards range", async () => {
      const missing = await a.agent
        .get("/api/v1/reports/stock")
        .query({ from: "2026-11-01T00:00:00.000Z" });
      expect(missing.status).toBe(400);
      expect(missing.body.field).toBe("to");

      const backwards = await a.agent.get("/api/v1/reports/stock").query({
        from: "2026-11-02T00:00:00.000Z",
        to: "2026-11-01T00:00:00.000Z",
      });
      expect(backwards.status).toBe(400);
      expect(backwards.body.message).toBe(
        "The end date must be on or after the start date.",
      );
    });
  });
});
