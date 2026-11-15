import { CSRF_HEADER, type Movement } from "@mojud/contracts";
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
import { uniquePhone } from "../helpers/factories.js";
import { twoBusinesses } from "../helpers/twoBusinesses.js";

const MOVEMENTS = "/api/v1/stock/movements";

describe("history filters and passwords", () => {
  let db: Db;
  let bundle: AppBundle;
  let a: SignedInAgent;
  let b: SignedInAgent;

  async function product(who: SignedInAgent, sku: string): Promise<string> {
    const res = await postWithCsrf(who, "/api/v1/products").send({
      sku,
      name: sku,
      unit: "pcs",
      minStock: 0,
      unitCost: 10,
    });
    return (res.body as { id: string }).id;
  }

  function move(
    who: { agent: SignedInAgent["agent"]; csrf: string },
    productId: string,
    direction: "in" | "out",
    quantity: number,
    reason: string,
  ) {
    return who.agent
      .post(MOVEMENTS)
      .set("Origin", TEST_ORIGIN)
      .set(CSRF_HEADER, who.csrf)
      .send({ productId, direction, reason, quantity });
  }

  const as = (who: SignedInAgent) => ({
    agent: who.agent,
    csrf: who.session.csrfToken,
  });

  async function addWorker(phone: string, password = "worker pass 1") {
    const res = await postWithCsrf(a, "/api/v1/users").send({
      name: "Karim",
      phone,
      password,
      role: "warehouse_worker",
    });
    return (res.body as { id: string }).id;
  }

  async function signIn(phone: string, password: string) {
    const agent = request.agent(bundle.app);
    const res = await agent
      .post("/api/v1/auth/signin")
      .set("Origin", TEST_ORIGIN)
      .send({ phone, password });
    return { agent, res, csrf: (res.body as { csrfToken?: string }).csrfToken };
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

  describe("history filters", () => {
    it("filters by reason, person and product, and pages with offset", async () => {
      const rice = await product(a, "RICE");
      const oil = await product(a, "OIL");
      const phone = uniquePhone();
      const workerId = await addWorker(phone);
      const worker = await signIn(phone, "worker pass 1");
      const workerAs = { agent: worker.agent, csrf: worker.csrf ?? "" };

      await move(as(a), rice, "in", 10, "purchase");
      await move(as(a), oil, "in", 5, "purchase");
      await move(workerAs, rice, "out", 2, "damage");
      await move(workerAs, oil, "out", 1, "sale");

      const damage = await a.agent.get(MOVEMENTS).query({ reason: "damage" });
      expect(damage.body.map((m: Movement) => m.quantity)).toEqual([2]);

      const byWorker = await a.agent.get(MOVEMENTS).query({ userId: workerId });
      expect(byWorker.body.map((m: Movement) => m.reason)).toEqual([
        "sale",
        "damage",
      ]);

      const riceByOwner = await a.agent
        .get(MOVEMENTS)
        .query({ productId: rice, userId: a.session.userId });
      expect(riceByOwner.body).toHaveLength(1);

      const page1 = await a.agent.get(MOVEMENTS).query({ limit: 3 });
      const page2 = await a.agent.get(MOVEMENTS).query({ limit: 3, offset: 3 });
      expect(page1.body).toHaveLength(3);
      expect(page2.body).toHaveLength(1);
      expect(page2.body[0].reason).toBe("purchase");
      expect(
        new Set([...page1.body, ...page2.body].map((m: Movement) => m.id)).size,
      ).toBe(4);

      const empty = await a.agent
        .get(MOVEMENTS)
        .query({ reason: "", userId: "", productId: "" });
      expect(empty.body).toHaveLength(4);
    });

    it("filters by date range, start inclusive and end exclusive", async () => {
      const rice = await product(a, "RICE");
      await move(as(a), rice, "in", 1, "purchase");
      await move(as(a), rice, "in", 2, "purchase");
      // Move the first movement back in time (the trigger forbids UPDATE, so
      // the test switches it off for this one statement, then back on).
      await sql`ALTER TABLE stock_movements DISABLE TRIGGER stock_movements_no_update_or_delete`.execute(
        db,
      );
      await sql`UPDATE stock_movements SET created_at = '2026-10-15T10:00:00Z' WHERE quantity = 1`.execute(
        db,
      );
      await sql`ALTER TABLE stock_movements ENABLE TRIGGER stock_movements_no_update_or_delete`.execute(
        db,
      );

      const october = await a.agent.get(MOVEMENTS).query({
        from: "2026-10-01T00:00:00.000Z",
        to: "2026-11-01T00:00:00.000Z",
      });
      expect(october.body.map((m: Movement) => m.quantity)).toEqual([1]);

      const exactStart = await a.agent.get(MOVEMENTS).query({
        from: "2026-10-15T10:00:00.000Z",
        to: "2026-10-15T10:00:01.000Z",
      });
      expect(exactStart.body).toHaveLength(1);
      const exactEnd = await a.agent
        .get(MOVEMENTS)
        .query({ to: "2026-10-15T10:00:00.000Z" });
      expect(exactEnd.body).toHaveLength(0);
    });

    it("refuses invalid filters, naming the field", async () => {
      for (const [field, value] of [
        ["reason", "theft"],
        ["from", "yesterday"],
        ["userId", "nobody"],
        ["limit", "0"],
        ["offset", "-1"],
      ] as const) {
        const res = await a.agent.get(MOVEMENTS).query({ [field]: value });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe(field);
      }
    });

    it("lists people's names for every role, only in the caller's business", async () => {
      const phone = uniquePhone();
      await addWorker(phone);
      const worker = await signIn(phone, "worker pass 1");

      const names = await worker.agent.get("/api/v1/users/names");
      expect(names.status).toBe(200);
      expect(names.body.map((p: { name: string }) => p.name)).toEqual([
        a.session.name,
        "Karim",
      ]);
      expect(names.body[0]).toEqual({
        id: expect.any(String),
        name: a.session.name,
      });
      expect((await b.agent.get("/api/v1/users/names")).body).toHaveLength(1);
    });
  });

  describe("passwords", () => {
    it("changes your own password, keeping this session and ending the others", async () => {
      const other = await signIn(a.input.phone, a.input.password);
      expect(other.res.status).toBe(200);

      const res = await postWithCsrf(a, "/api/v1/auth/password").send({
        currentPassword: a.input.password,
        newPassword: "a brand new password",
      });
      expect(res.status).toBe(204);

      expect((await a.agent.get("/api/v1/auth/me")).status).toBe(200);
      const ended = await other.agent.get("/api/v1/auth/me");
      expect(ended.status).toBe(401);
      expect((await signIn(a.input.phone, a.input.password)).res.status).toBe(
        401,
      );
      expect(
        (await signIn(a.input.phone, "a brand new password")).res.status,
      ).toBe(200);
    });

    it("refuses a wrong current password and a short new one", async () => {
      const wrong = await postWithCsrf(a, "/api/v1/auth/password").send({
        currentPassword: "not my password",
        newPassword: "a brand new password",
      });
      expect(wrong.status).toBe(400);
      expect(wrong.body).toMatchObject({
        field: "currentPassword",
        message: "Your current password is not correct.",
      });

      const short = await postWithCsrf(a, "/api/v1/auth/password").send({
        currentPassword: a.input.password,
        newPassword: "short",
      });
      expect(short.body.field).toBe("newPassword");
      expect((await signIn(a.input.phone, a.input.password)).res.status).toBe(
        200,
      );
    });

    it("lets the owner reset a staff password, ending that person's sessions", async () => {
      const phone = uniquePhone();
      const workerId = await addWorker(phone);
      const worker = await signIn(phone, "worker pass 1");

      const res = await postWithCsrf(
        a,
        `/api/v1/users/${workerId}/password`,
      ).send({ newPassword: "fresh worker pass" });
      expect(res.status).toBe(204);

      expect((await worker.agent.get("/api/v1/auth/me")).status).toBe(401);
      expect((await signIn(phone, "worker pass 1")).res.status).toBe(401);
      expect((await signIn(phone, "fresh worker pass")).res.status).toBe(200);
    });

    it("refuses resets by non-owners, of the owner, and across businesses", async () => {
      const phone = uniquePhone();
      const workerId = await addWorker(phone);
      const worker = await signIn(phone, "worker pass 1");

      const byWorker = await worker.agent
        .post(`/api/v1/users/${workerId}/password`)
        .set("Origin", TEST_ORIGIN)
        .set(CSRF_HEADER, worker.csrf ?? "")
        .send({ newPassword: "fresh worker pass" });
      expect(byWorker.status).toBe(403);

      const owner = await postWithCsrf(
        a,
        `/api/v1/users/${a.session.userId}/password`,
      ).send({ newPassword: "fresh owner pass" });
      expect(owner.status).toBe(403);

      const other = await postWithCsrf(
        b,
        `/api/v1/users/${workerId}/password`,
      ).send({ newPassword: "fresh worker pass" });
      expect(other.status).toBe(404);
      const badId = await postWithCsrf(b, "/api/v1/users/nope/password").send({
        newPassword: "fresh worker pass",
      });
      expect(badId.status).toBe(404);
    });
  });
});
