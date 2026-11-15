/**
 * `/api/v1/products`, `/api/v1/stock/*` and `/api/v1/dashboard`. All of them
 * sit behind authentication and the CSRF check (mounted as protected).
 */
import { Router } from "express";
import "../../../platform/http.js";
import {
  createProduct,
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
    res.json(
      await listMovements(deps, req.caller, {
        productId: queryText(req.query.productId),
        limit: queryText(req.query.limit),
      }),
    );
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

  router.get("/dashboard", async (req, res) => {
    res.json(await getDashboard(deps, req.caller));
  });

  return router;
}
