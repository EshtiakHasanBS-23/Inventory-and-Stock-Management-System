import {
  CSRF_HEADER,
  type Approval,
  type Dashboard,
  type Product,
  type WorkRecord,
} from "@mojud/contracts";
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

/** A signed-in person: the owner from sign-up, or staff they added. */
interface Person {
  agent: SignedInAgent["agent"];
  csrf: string;
  userId: string;
}

describe("approvals: damage flags, reversals and my record", () => {
  let db: Db;
  let bundle: AppBundle;
  let a: SignedInAgent;
  let b: SignedInAgent;
  let owner: Person;
  let rice: Product;

  const asPerson = (who: SignedInAgent): Person => ({
    agent: who.agent,
    csrf: who.session.csrfToken,
    userId: who.session.userId,
  });

  const post = (who: Person, path: string) =>
    who.agent.post(path).set("Origin", TEST_ORIGIN).set(CSRF_HEADER, who.csrf);

  async function staff(role: string, name = role): Promise<Person> {
    const phone = uniquePhone();
    const added = await postWithCsrf(a, "/api/v1/users").send({
      name,
      phone,
      password: "staff password",
      role,
    });
    expect(added.status).toBe(201);
    const agent = request.agent(bundle.app);
    const res = await agent
      .post("/api/v1/auth/signin")
      .set("Origin", TEST_ORIGIN)
      .send({ phone, password: "staff password" });
    return { agent, csrf: res.body.csrfToken, userId: added.body.id };
  }

  const move = (
    who: Person,
    direction: "in" | "out",
    quantity: number,
    reason: string,
  ) =>
    post(who, "/api/v1/stock/movements").send({
      productId: rice.id,
      direction,
      reason,
      quantity,
    });

  const flag = (who: Person, quantity: number, note?: string) =>
    post(who, "/api/v1/stock/damage-flags").send({
      productId: rice.id,
      quantity,
      ...(note ? { note } : {}),
    });

  async function product(): Promise<Product> {
    const list = await owner.agent.get("/api/v1/products");
    return (list.body as Product[])[0] as Product;
  }

  beforeAll(() => {
    db = useTestDb();
    bundle = buildTestApp({ db });
  });

  beforeEach(async () => {
    await truncateIdentity(db);
    ({ a, b } = await twoBusinesses(bundle.app));
    owner = asPerson(a);
    const created = await postWithCsrf(a, "/api/v1/products").send({
      sku: "RICE-25",
      name: "Miniket rice",
      unit: "bag",
      minStock: 0,
      unitCost: 100,
    });
    rice = created.body as Product;
    expect((await move(owner, "in", 10, "purchase")).status).toBe(201);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe("damage flags", () => {
    it("holds flagged units out of stock until someone else decides", async () => {
      const worker = await staff("warehouse_worker", "Karim");

      const res = await flag(worker, 2, "torn bags");
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        kind: "damage",
        status: "pending",
        quantity: 2,
        value: 200,
        note: "torn bags",
        requestedBy: "Karim",
        canDecide: false,
        movement: { reason: "damage_flagged", direction: "out" },
      });
      expect(await product()).toMatchObject({ onHand: 8, damaged: 2 });

      const inbox = await owner.agent.get("/api/v1/approvals");
      expect(inbox.body).toHaveLength(1);
      expect(inbox.body[0].canDecide).toBe(true);

      const dashboard = (await owner.agent.get("/api/v1/dashboard"))
        .body as Dashboard;
      expect(dashboard).toMatchObject({
        pendingApprovals: 1,
        damagedValue: 200,
        lossBreakdown: { damage: 0, damageFlagged: 200, missing: 0 },
        lossValue30d: 200,
      });
    });

    it("writes approved damage off and keeps it as a loss", async () => {
      const worker = await staff("warehouse_worker", "Karim");
      const flagged = (await flag(worker, 3)).body as Approval;

      const res = await post(
        owner,
        `/api/v1/approvals/${flagged.id}/approve`,
      ).send();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "approved",
        decidedBy: a.session.name,
        canDecide: false,
      });
      expect(await product()).toMatchObject({ onHand: 7, damaged: 0 });
      const dashboard = (await owner.agent.get("/api/v1/dashboard"))
        .body as Dashboard;
      expect(dashboard).toMatchObject({
        pendingApprovals: 0,
        damagedValue: 0,
        lossValue30d: 300,
      });
      const decided = await owner.agent
        .get("/api/v1/approvals")
        .query({ status: "decided" });
      expect(decided.body).toHaveLength(1);
    });

    it("returns rejected damage to stock with its own movement, cancelling the loss", async () => {
      const worker = await staff("warehouse_worker");
      const flagged = (await flag(worker, 3)).body as Approval;
      const supervisor = await staff("supervisor");

      const res = await post(
        supervisor,
        `/api/v1/approvals/${flagged.id}/reject`,
      ).send();
      expect(res.body.status).toBe("rejected");
      expect(await product()).toMatchObject({ onHand: 10, damaged: 0 });

      const history = await owner.agent
        .get("/api/v1/stock/movements")
        .query({ reason: "damage_rejected" });
      expect(history.body[0]).toMatchObject({
        direction: "in",
        quantity: 3,
        balanceAfter: 10,
      });
      const dashboard = (await owner.agent.get("/api/v1/dashboard"))
        .body as Dashboard;
      expect(dashboard.lossBreakdown.damageFlagged).toBe(0);
    });

    it("never flags more than is in stock", async () => {
      const res = await flag(owner, 11);
      expect(res.status).toBe(409);
      expect(res.body.code).toBe("INSUFFICIENT_STOCK");
      expect(await product()).toMatchObject({ onHand: 10, damaged: 0 });
    });

    it("refuses deciding your own flag, by a worker, or twice", async () => {
      const worker = await staff("warehouse_worker");
      const other = await staff("warehouse_worker");
      const ownFlag = (await flag(owner, 1)).body as Approval;
      const workerFlag = (await flag(worker, 1)).body as Approval;

      const own = await post(
        owner,
        `/api/v1/approvals/${ownFlag.id}/approve`,
      ).send();
      expect(own.status).toBe(403);
      expect(own.body.message).toBe(
        "Someone else must decide your own request.",
      );

      const byWorker = await post(
        other,
        `/api/v1/approvals/${workerFlag.id}/approve`,
      ).send();
      expect(byWorker.status).toBe(403);

      await post(owner, `/api/v1/approvals/${workerFlag.id}/approve`).send();
      const again = await post(
        owner,
        `/api/v1/approvals/${workerFlag.id}/reject`,
      ).send();
      expect(again.status).toBe(409);
      expect(again.body.message).toBe("This was already decided.");
    });

    it("lets only one of two simultaneous decisions win", async () => {
      const worker = await staff("warehouse_worker");
      const manager = await staff("manager");
      const flagged = (await flag(worker, 2)).body as Approval;

      const results = await Promise.all([
        post(owner, `/api/v1/approvals/${flagged.id}/approve`).send(),
        post(manager, `/api/v1/approvals/${flagged.id}/reject`).send(),
      ]);
      expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
      const p = await product();
      expect(p.damaged).toBe(0);
      expect([8, 10]).toContain(p.onHand);
    });

    it("makes workers flag damage instead of writing it off", async () => {
      const worker = await staff("warehouse_worker");
      const direct = await move(worker, "out", 1, "damage");
      expect(direct.status).toBe(400);
      expect(direct.body).toMatchObject({
        field: "reason",
        message: "Use Flag damage: a supervisor, manager or owner decides it.",
      });
      expect((await move(owner, "out", 1, "damage")).status).toBe(201);
    });

    it("keeps the rule in the database: nobody decides their own request", async () => {
      const flagged = (await flag(owner, 1)).body as Approval;
      await expect(
        sql`UPDATE approvals SET status = 'approved', decided_by = requested_by, decided_at = now() WHERE id = ${flagged.id}`.execute(
          db,
        ),
      ).rejects.toThrow(/approvals_decided_by_someone_else/);
    });
  });

  describe("reversals", () => {
    async function saleId(): Promise<string> {
      const sale = await move(owner, "out", 4, "sale");
      return sale.body.id as string;
    }

    it("undoes a movement once a second owner or manager approves", async () => {
      const id = await saleId();
      const asked = await post(owner, "/api/v1/approvals/reversals").send({
        movementId: id,
        note: "Sold to the wrong shop",
      });
      expect(asked.status).toBe(201);
      expect(asked.body).toMatchObject({
        kind: "reversal",
        status: "pending",
        quantity: 4,
        movement: { id, reason: "sale", direction: "out" },
      });
      expect((await product()).onHand).toBe(6);

      expect(
        (await post(owner, `/api/v1/approvals/${asked.body.id}/approve`).send())
          .status,
      ).toBe(403);

      const manager = await staff("manager", "Nasima");
      const approved = await post(
        manager,
        `/api/v1/approvals/${asked.body.id}/approve`,
      ).send();
      expect(approved.body).toMatchObject({
        status: "approved",
        decidedBy: "Nasima",
      });
      expect((await product()).onHand).toBe(10);

      const history = await owner.agent
        .get("/api/v1/stock/movements")
        .query({ reason: "reversal" });
      expect(history.body[0]).toMatchObject({
        direction: "in",
        quantity: 4,
        reversesMovementId: id,
        note: "Reverses sale: Sold to the wrong shop",
        userName: "Nasima",
      });
    });

    it("allows one open or approved reversal per movement, and another after a rejection", async () => {
      const id = await saleId();
      const manager = await staff("manager");
      const first = await post(owner, "/api/v1/approvals/reversals").send({
        movementId: id,
        note: "mistake",
      });
      const second = await post(owner, "/api/v1/approvals/reversals").send({
        movementId: id,
        note: "mistake",
      });
      expect(second.status).toBe(409);

      await post(manager, `/api/v1/approvals/${first.body.id}/reject`).send();
      expect((await product()).onHand).toBe(6);
      const retry = await post(owner, "/api/v1/approvals/reversals").send({
        movementId: id,
        note: "really a mistake",
      });
      expect(retry.status).toBe(201);
    });

    it("refuses a reversal that would take stock below zero, leaving it open", async () => {
      const purchase = await owner.agent
        .get("/api/v1/stock/movements")
        .query({ reason: "purchase" });
      const manager = await staff("manager");
      const asked = await post(owner, "/api/v1/approvals/reversals").send({
        movementId: purchase.body[0].id,
        note: "never arrived",
      });
      await move(owner, "out", 5, "sale");

      const res = await post(
        manager,
        `/api/v1/approvals/${asked.body.id}/approve`,
      ).send();
      expect(res.status).toBe(409);
      expect(res.body.code).toBe("INSUFFICIENT_STOCK");
      const open = await owner.agent.get("/api/v1/approvals");
      expect(open.body[0]).toMatchObject({
        id: asked.body.id,
        status: "pending",
      });
    });

    it("refuses counts, flags, other businesses and roles below manager", async () => {
      await post(owner, "/api/v1/stock/counts").send({
        productId: rice.id,
        countedQuantity: 9,
      });
      const count = await owner.agent
        .get("/api/v1/stock/movements")
        .query({ reason: "count" });
      const countRes = await post(owner, "/api/v1/approvals/reversals").send({
        movementId: count.body[0].id,
        note: "x",
      });
      expect(countRes.status).toBe(400);
      expect(countRes.body.message).toBe(
        "A stock count cannot be reversed. Count the product again.",
      );

      const id = await saleId();
      const other = await post(asPerson(b), "/api/v1/approvals/reversals").send(
        { movementId: id, note: "x" },
      );
      expect(other.status).toBe(400);
      expect(other.body.field).toBe("movementId");

      const worker = await staff("warehouse_worker");
      expect(
        (
          await post(worker, "/api/v1/approvals/reversals").send({
            movementId: id,
            note: "x",
          })
        ).status,
      ).toBe(403);

      const noReason = await post(owner, "/api/v1/approvals/reversals").send({
        movementId: id,
        note: " ",
      });
      expect(noReason.body.field).toBe("note");
    });
  });

  describe("inbox", () => {
    it("is private to each business and validates its filter", async () => {
      await flag(owner, 1);
      expect((await b.agent.get("/api/v1/approvals")).body).toEqual([]);
      const bad = await owner.agent
        .get("/api/v1/approvals")
        .query({ status: "everything" });
      expect(bad.status).toBe(400);
      const flagged = (await owner.agent.get("/api/v1/approvals")).body[0];
      expect(
        (
          await post(
            asPerson(b),
            `/api/v1/approvals/${flagged.id}/approve`,
          ).send()
        ).status,
      ).toBe(404);
      expect(
        (await post(owner, "/api/v1/approvals/nope/approve").send()).status,
      ).toBe(404);
    });
  });

  describe("my record", () => {
    it("counts a person's movements, counts, flags and decisions", async () => {
      const worker = await staff("warehouse_worker", "Karim");
      const supervisor = await staff("supervisor", "Jamal");
      await move(worker, "out", 2, "sale");
      await move(worker, "in", 1, "return");
      await post(worker, "/api/v1/stock/counts").send({
        productId: rice.id,
        countedQuantity: 8,
      });
      const kept = (await flag(worker, 1)).body as Approval;
      const thrown = (await flag(worker, 1)).body as Approval;
      await flag(worker, 1);
      await post(supervisor, `/api/v1/approvals/${kept.id}/approve`).send();
      await post(supervisor, `/api/v1/approvals/${thrown.id}/reject`).send();

      const res = await worker.agent.get("/api/v1/me/record");
      expect(res.status).toBe(200);
      const record = res.body as WorkRecord;
      expect(record.name).toBe("Karim");
      for (const period of [record.today, record.week, record.month]) {
        expect(period).toEqual({
          movements: 2,
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
      }

      const jamal = await owner.agent
        .get("/api/v1/me/record")
        .query({ userId: supervisor.userId });
      expect(jamal.body.today.decisions).toBe(2);
    });

    it("shows other people's records only to owners and managers", async () => {
      const worker = await staff("warehouse_worker");
      const peek = await worker.agent
        .get("/api/v1/me/record")
        .query({ userId: owner.userId });
      expect(peek.status).toBe(403);
      expect(
        (
          await worker.agent
            .get("/api/v1/me/record")
            .query({ userId: worker.userId })
        ).status,
      ).toBe(200);

      const outsider = await owner.agent
        .get("/api/v1/me/record")
        .query({ userId: b.session.userId });
      expect(outsider.status).toBe(404);
      expect(
        (await owner.agent.get("/api/v1/me/record").query({ userId: "x" }))
          .status,
      ).toBe(404);
    });
  });
});
