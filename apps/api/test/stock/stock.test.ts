import { CSRF_HEADER, type Movement, type Product } from "@mojud/contracts";
import { sql } from "kysely";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { AppBundle } from "../../src/app.js";
import type { Db } from "../../src/platform/db/db.js";
import {
  buildTestApp,
  postWithCsrf,
  TEST_ORIGIN,
  type SignedInAgent,
} from "../helpers/app.js";
import { closeTestDb, truncateIdentity, useTestDb } from "../helpers/db.js";
import { twoBusinesses } from "../helpers/twoBusinesses.js";

const PRODUCTS = "/api/v1/products";
const MOVEMENTS = "/api/v1/stock/movements";
const DASHBOARD = "/api/v1/dashboard";

function patchWithCsrf(signedIn: SignedInAgent, path: string) {
  return signedIn.agent
    .patch(path)
    .set("Origin", TEST_ORIGIN)
    .set(CSRF_HEADER, signedIn.session.csrfToken);
}

describe("stock module", () => {
  let db: Db;
  let bundle: AppBundle;
  let a: SignedInAgent;
  let b: SignedInAgent;

  async function createProduct(
    who: SignedInAgent,
    overrides: Record<string, unknown> = {},
  ): Promise<Product> {
    const res = await postWithCsrf(who, PRODUCTS).send({
      sku: "RICE-25",
      name: "Miniket rice 25kg",
      unit: "bag",
      minStock: 5,
      ...overrides,
    });
    expect(res.status).toBe(201);
    return res.body as Product;
  }

  function move(
    who: SignedInAgent,
    productId: string,
    direction: "in" | "out",
    quantity: number,
    reason = direction === "in" ? "purchase" : "sale",
  ) {
    return postWithCsrf(who, MOVEMENTS).send({
      productId,
      direction,
      reason,
      quantity,
    });
  }

  async function setRole(who: SignedInAgent, role: string): Promise<void> {
    await sql`UPDATE users SET role = ${role} WHERE id = ${who.session.userId}`.execute(
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

  describe("products (S1)", () => {
    it("creates a product with zero stock and lists it", async () => {
      const product = await createProduct(a);
      expect(product).toMatchObject({
        sku: "RICE-25",
        name: "Miniket rice 25kg",
        unit: "bag",
        minStock: 5,
        onHand: 0,
        status: "out",
      });

      const res = await a.agent.get(PRODUCTS);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([product]);
    });

    it("searches by name or SKU, treating wildcards as text", async () => {
      await createProduct(a, { sku: "RICE-25", name: "Miniket rice" });
      await createProduct(a, { sku: "OIL-5", name: "Soybean oil 5L" });
      await createProduct(a, { sku: "SALT", name: "Salt 100% pure" });

      const byName = await a.agent.get(PRODUCTS).query({ q: "soy" });
      expect(byName.body.map((p: Product) => p.sku)).toEqual(["OIL-5"]);
      const bySku = await a.agent.get(PRODUCTS).query({ q: "rice-2" });
      expect(bySku.body.map((p: Product) => p.sku)).toEqual(["RICE-25"]);
      const wildcard = await a.agent.get(PRODUCTS).query({ q: "%" });
      expect(wildcard.body.map((p: Product) => p.sku)).toEqual(["SALT"]);
    });

    it("refuses a duplicate SKU within one business but allows it in another", async () => {
      await createProduct(a);
      const dup = await postWithCsrf(a, PRODUCTS).send({
        sku: "RICE-25",
        name: "Other",
        unit: "bag",
        minStock: 0,
      });
      expect(dup.status).toBe(409);
      expect(dup.body).toMatchObject({ code: "DUPLICATE", field: "sku" });

      await createProduct(b);
    });

    it("refuses invalid fields, naming the field", async () => {
      const res = await postWithCsrf(a, PRODUCTS).send({
        sku: "X",
        name: " ",
        unit: "pcs",
        minStock: 0,
      });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "VALIDATION_FAILED",
        field: "name",
      });

      const negative = await postWithCsrf(a, PRODUCTS).send({
        sku: "X",
        name: "X",
        unit: "pcs",
        minStock: -1,
      });
      expect(negative.body).toMatchObject({ field: "minStock" });
    });

    it("updates name, unit and minimum stock", async () => {
      const product = await createProduct(a);
      const res = await patchWithCsrf(a, `${PRODUCTS}/${product.id}`).send({
        minStock: 0,
        unit: "sack",
      });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        minStock: 0,
        unit: "sack",
        sku: "RICE-25",
      });

      const empty = await patchWithCsrf(a, `${PRODUCTS}/${product.id}`).send(
        {},
      );
      expect(empty.status).toBe(400);
    });

    it("lets only an owner or manager create or edit products", async () => {
      const product = await createProduct(a);
      await setRole(a, "warehouse_worker");

      const create = await postWithCsrf(a, PRODUCTS).send({
        sku: "NEW",
        name: "New",
        unit: "pcs",
        minStock: 0,
      });
      expect(create.status).toBe(403);
      const edit = await patchWithCsrf(a, `${PRODUCTS}/${product.id}`).send({
        minStock: 1,
      });
      expect(edit.status).toBe(403);

      expect((await a.agent.get(PRODUCTS)).status).toBe(200);
      expect((await move(a, product.id, "in", 3)).status).toBe(201);

      await setRole(a, "manager");
      expect(
        (
          await patchWithCsrf(a, `${PRODUCTS}/${product.id}`).send({
            minStock: 1,
          })
        ).status,
      ).toBe(200);
    });

    it("keeps each business's products private", async () => {
      const product = await createProduct(a);

      expect((await b.agent.get(PRODUCTS)).body).toEqual([]);
      const edit = await patchWithCsrf(b, `${PRODUCTS}/${product.id}`).send({
        name: "Stolen",
      });
      expect(edit.status).toBe(404);
      expect(
        (await patchWithCsrf(b, `${PRODUCTS}/not-a-uuid`).send({ name: "x" }))
          .status,
      ).toBe(404);
    });
  });

  describe("stock in and out (S2)", () => {
    it("adds and removes stock, recording the balance after each move", async () => {
      const product = await createProduct(a);

      const stockIn = await move(a, product.id, "in", 10);
      expect(stockIn.status).toBe(201);
      expect(stockIn.body).toMatchObject({
        direction: "in",
        reason: "purchase",
        quantity: 10,
        balanceAfter: 10,
        userName: a.session.name,
        productName: "Miniket rice 25kg",
      });

      const stockOut = await postWithCsrf(a, MOVEMENTS).send({
        productId: product.id,
        direction: "out",
        reason: "damage",
        quantity: 3,
        note: "torn bag",
      });
      expect(stockOut.body).toMatchObject({
        balanceAfter: 7,
        note: "torn bag",
      });

      const list = await a.agent.get(PRODUCTS);
      expect(list.body[0]).toMatchObject({ onHand: 7, status: "ok" });
    });

    it("never lets stock go below zero", async () => {
      const product = await createProduct(a);
      await move(a, product.id, "in", 2);

      const res = await move(a, product.id, "out", 3);
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "INSUFFICIENT_STOCK",
        field: "quantity",
        message: "Only 2 bag in stock.",
      });
      const rows = await db.selectFrom("stock_movements").selectAll().execute();
      expect(rows).toHaveLength(1);
      expect((await a.agent.get(PRODUCTS)).body[0].onHand).toBe(2);
    });

    it("lets only one of two simultaneous requests take the last unit", async () => {
      const product = await createProduct(a);
      await move(a, product.id, "in", 1);

      const results = await Promise.all([
        move(a, product.id, "out", 1),
        move(a, product.id, "out", 1),
      ]);
      expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
      expect((await a.agent.get(PRODUCTS)).body[0].onHand).toBe(0);
    });

    it("keeps the quantity equal to the sum of its movements", async () => {
      const product = await createProduct(a);
      await move(a, product.id, "in", 20);
      await move(a, product.id, "out", 5);
      await move(a, product.id, "in", 2, "return");
      await move(a, product.id, "out", 4, "adjustment");

      const sum = await sql<{ total: number }>`
        SELECT SUM(CASE WHEN direction = 'in' THEN quantity ELSE -quantity END)::int AS total
        FROM stock_movements WHERE product_id = ${product.id}`.execute(db);
      expect(sum.rows[0]?.total).toBe(13);
      expect((await a.agent.get(PRODUCTS)).body[0].onHand).toBe(13);
    });

    it("refuses a reason that does not fit the direction", async () => {
      const product = await createProduct(a);
      const res = await move(a, product.id, "in", 1, "sale");
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ field: "reason" });
    });

    it("refuses zero, fractional and missing quantities", async () => {
      const product = await createProduct(a);
      for (const quantity of [0, 1.5, undefined]) {
        const res = await postWithCsrf(a, MOVEMENTS).send({
          productId: product.id,
          direction: "in",
          reason: "purchase",
          quantity,
        });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe("quantity");
      }
    });

    it("refuses another business's product as if it did not exist", async () => {
      const product = await createProduct(a);
      const res = await move(b, product.id, "in", 5);
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ field: "productId" });
      expect((await a.agent.get(PRODUCTS)).body[0].onHand).toBe(0);
    });

    it("makes movements permanent: the database refuses updates and deletes", async () => {
      const product = await createProduct(a);
      const { body } = await move(a, product.id, "in", 5);

      await expect(
        sql`UPDATE stock_movements SET quantity = 1 WHERE id = ${body.id}`.execute(
          db,
        ),
      ).rejects.toThrow(/cannot be changed or deleted/);
      await expect(
        sql`DELETE FROM stock_movements WHERE id = ${body.id}`.execute(db),
      ).rejects.toThrow(/cannot be changed or deleted/);
    });

    it("needs a signed-in caller and a CSRF token", async () => {
      expect((await request(bundle.app).get(PRODUCTS)).status).toBe(401);
      const noCsrf = await a.agent
        .post(MOVEMENTS)
        .set("Origin", TEST_ORIGIN)
        .send({});
      expect(noCsrf.status).toBe(403);
    });
  });

  describe("history and dashboard (S3, S4)", () => {
    it("lists movements newest first, filtered by product, scoped to the business", async () => {
      const rice = await createProduct(a);
      const oil = await createProduct(a, { sku: "OIL", name: "Oil" });
      await move(a, rice.id, "in", 5);
      await move(a, oil.id, "in", 2);
      await move(a, rice.id, "out", 1);

      const all = await a.agent.get(MOVEMENTS);
      expect(all.status).toBe(200);
      expect(all.body.map((m: Movement) => m.balanceAfter)).toEqual([4, 2, 5]);

      const riceOnly = await a.agent
        .get(MOVEMENTS)
        .query({ productId: rice.id });
      expect(riceOnly.body).toHaveLength(2);
      const limited = await a.agent.get(MOVEMENTS).query({ limit: "1" });
      expect(limited.body).toHaveLength(1);

      expect((await b.agent.get(MOVEMENTS)).body).toEqual([]);
      expect(
        (await a.agent.get(MOVEMENTS).query({ productId: "nope" })).status,
      ).toBe(404);
    });

    it("summarises stock on the dashboard", async () => {
      const rice = await createProduct(a, { minStock: 5 });
      const oil = await createProduct(a, {
        sku: "OIL",
        name: "Oil",
        minStock: 2,
      });
      await createProduct(a, { sku: "SALT", name: "Salt", minStock: 0 });
      await move(a, rice.id, "in", 4);
      await move(a, oil.id, "in", 10);

      const res = await a.agent.get(DASHBOARD);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        productCount: 3,
        totalUnits: 14,
        lowStockCount: 1,
        outOfStockCount: 1,
      });
      expect(res.body.lowStock.map((p: Product) => p.sku)).toEqual([
        "SALT",
        "RICE-25",
      ]);
      expect(res.body.recentMovements).toHaveLength(2);

      const empty = await b.agent.get(DASHBOARD);
      expect(empty.body).toMatchObject({ productCount: 0, totalUnits: 0 });
    });
  });
});
