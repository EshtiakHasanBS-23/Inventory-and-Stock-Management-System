/**
 * `/api/v1/products`, `/api/v1/stock/*` and `/api/v1/dashboard`. All of them
 * sit behind authentication and the CSRF check (mounted as protected).
 */
import { Router } from "express";
import { sendCsv } from "../../../platform/csv.js";
import {
  decideApproval,
  flagDamage,
  getWorkRecord,
  listApprovals,
  requestReversal,
} from "./approvals.js";
import "../../../platform/http.js";
import {
  createProduct,
  exportMovementsCsv,
  exportProductsCsv,
  exportReportCsv,
  getStockReport,
  importProducts,
  getDashboard,
  listMovements,
  listProducts,
  recordCount,
  recordMovement,
  updateProduct,
  type StockDeps,
} from "./service.js";

function queryText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function createStockRouter(deps: StockDeps): Router {
  const router = Router();

  router.get("/products", async (req, res) => {
    res.json(await listProducts(deps, req.caller, queryText(req.query.q)));
  });

  router.get("/products/export.csv", async (req, res) => {
    sendCsv(res, "products.csv", await exportProductsCsv(deps, req.caller));
  });

  router.post("/products/import", async (req, res) => {
    const result = await importProducts(deps, req.caller, req.body);
    req.log.info(
      { event: "stock.products_imported", ...result },
      "products imported",
    );
    res.status(201).json(result);
  });

  router.get("/stock/movements/export.csv", async (req, res) => {
    sendCsv(
      res,
      "stock-history.csv",
      await exportMovementsCsv(deps, req.caller, req.query),
    );
  });

  router.get("/reports/stock", async (req, res) => {
    res.json(await getStockReport(deps, req.caller, req.query));
  });

  router.get("/reports/stock.csv", async (req, res) => {
    sendCsv(
      res,
      "stock-report.csv",
      await exportReportCsv(deps, req.caller, req.query),
    );
  });

  router.post("/products", async (req, res) => {
    const product = await createProduct(deps, req.caller, req.body);
    req.log.info(
      { event: "stock.product_created", productId: product.id },
      "product created",
    );
    res.status(201).json(product);
  });

  router.patch("/products/:id", async (req, res) => {
    const product = await updateProduct(
      deps,
      req.caller,
      req.params.id,
      req.body,
    );
    req.log.info(
      { event: "stock.product_updated", productId: product.id },
      "product updated",
    );
    res.json(product);
  });

  router.get("/stock/movements", async (req, res) => {
    res.json(await listMovements(deps, req.caller, req.query));
  });

  router.post("/stock/movements", async (req, res) => {
    const movement = await recordMovement(deps, req.caller, req.body);
    req.log.info(
      {
        event: "stock.movement_recorded",
        movementId: movement.id,
        productId: movement.productId,
        direction: movement.direction,
        quantity: movement.quantity,
      },
      "stock movement recorded",
    );
    res.status(201).json(movement);
  });

  router.post("/stock/counts", async (req, res) => {
    const result = await recordCount(deps, req.caller, req.body);
    req.log.info(
      {
        event: "stock.count_recorded",
        productId: result.movement?.productId,
        difference: result.difference,
      },
      "stock count recorded",
    );
    res.status(201).json(result);
  });

  router.post("/stock/damage-flags", async (req, res) => {
    const approval = await flagDamage(deps, req.caller, req.body);
    req.log.info(
      {
        event: "stock.damage_flagged",
        approvalId: approval.id,
        quantity: approval.quantity,
      },
      "damage flagged",
    );
    res.status(201).json(approval);
  });

  router.get("/approvals", async (req, res) => {
    res.json(await listApprovals(deps, req.caller, req.query));
  });

  router.post("/approvals/reversals", async (req, res) => {
    const approval = await requestReversal(deps, req.caller, req.body);
    req.log.info(
      { event: "stock.reversal_requested", approvalId: approval.id },
      "reversal requested",
    );
    res.status(201).json(approval);
  });

  for (const [path, approve] of [
    ["approve", true],
    ["reject", false],
  ] as const) {
    router.post(`/approvals/:id/${path}`, async (req, res) => {
      const approval = await decideApproval(
        deps,
        req.caller,
        req.params.id,
        approve,
      );
      req.log.info(
        {
          event: "stock.approval_decided",
          approvalId: approval.id,
          kind: approval.kind,
          status: approval.status,
        },
        "approval decided",
      );
      res.json(approval);
    });
  }

  router.get("/me/record", async (req, res) => {
    res.json(await getWorkRecord(deps, req.caller, req.query));
  });

  router.get("/dashboard", async (req, res) => {
    res.json(await getDashboard(deps, req.caller));
  });

  return router;
}
