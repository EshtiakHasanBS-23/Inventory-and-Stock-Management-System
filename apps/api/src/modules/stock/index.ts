/**
 * Stock module: the only public surface of `modules/stock`
 * (simplified-plan.md S1–S4). Products, stock movements and the dashboard.
 */
export { createStockRouter } from "./internal/routes.js";
export type { StockDeps } from "./internal/service.js";
