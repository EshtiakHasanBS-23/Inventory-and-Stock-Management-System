-- 0002_stock: products and stock movements (simplified-plan.md S1–S4).
-- Forward-only migration (team Deployment practice).

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses (id),
  sku text NOT NULL CHECK (length(btrim(sku)) BETWEEN 1 AND 40),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  unit text NOT NULL CHECK (length(btrim(unit)) BETWEEN 1 AND 20),
  min_stock integer NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  -- The current quantity. Changed only together with a stock_movements row.
  on_hand integer NOT NULL DEFAULT 0
    CONSTRAINT products_on_hand_not_negative CHECK (on_hand >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_business_sku_key UNIQUE (business_id, sku)
);

CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses (id),
  product_id uuid NOT NULL REFERENCES products (id),
  direction text NOT NULL CHECK (direction IN ('in', 'out')),
  reason text NOT NULL CHECK (
    reason IN ('purchase', 'return', 'sale', 'damage', 'adjustment')
  ),
  quantity integer NOT NULL CHECK (quantity > 0),
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  note text CHECK (note IS NULL OR length(note) <= 200),
  user_id uuid NOT NULL REFERENCES users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX stock_movements_business_created_idx
  ON stock_movements (business_id, created_at DESC);
CREATE INDEX stock_movements_product_created_idx
  ON stock_movements (product_id, created_at DESC);

-- Movements are permanent: no row may be changed or deleted.
CREATE FUNCTION stock_movements_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'stock movements cannot be changed or deleted'
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_movements_no_update_or_delete
  BEFORE UPDATE OR DELETE ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION stock_movements_append_only();
