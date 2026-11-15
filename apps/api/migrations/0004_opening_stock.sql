-- 0004_opening_stock: opening stock from a product import has its own reason.
-- Forward-only migration (team Deployment practice).

ALTER TABLE stock_movements DROP CONSTRAINT stock_movements_reason_check;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_reason_check CHECK (
  reason IN (
    'purchase', 'return', 'sale', 'damage', 'adjustment', 'count', 'opening'
  )
);
