/**
 * Stock module: the only public surface of `modules/stock`
 * (simplified-plan.md). Products, stock movements, counts, import/export, report,
 * dashboard, damage flags, approvals, reversals and My record.
 */
export { createStockRouter } from "./internal/routes.js";
export type { StockDeps } from "./internal/service.js";
