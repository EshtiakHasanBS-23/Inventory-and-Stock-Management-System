-- 0003_value_and_count: stock value in taka and stock counts.
-- Forward-only migration (team Deployment practice).

-- Cost of one unit, in poisha (1 taka = 100 poisha), so money stays exact.
ALTER TABLE products
  ADD COLUMN unit_cost integer NOT NULL DEFAULT 0
    CONSTRAINT products_unit_cost_not_negative CHECK (unit_cost >= 0);

-- The product's unit cost when the movement happened, so the taka value of
-- past damage does not change when the price changes later. Adding a column
-- with a default does not fire the append-only row trigger.
ALTER TABLE stock_movements
  ADD COLUMN unit_cost integer NOT NULL DEFAULT 0 CHECK (unit_cost >= 0);

-- A stock count records its difference as its own reason.
ALTER TABLE stock_movements DROP CONSTRAINT stock_movements_reason_check;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_reason_check CHECK (
  reason IN ('purchase', 'return', 'sale', 'damage', 'adjustment', 'count')
);
