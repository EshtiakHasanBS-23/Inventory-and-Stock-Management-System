-- 0005_approvals: damage flags held for a decision, and reversal requests
-- (PRD FR-15, FR-29, FR-30). Forward-only migration.

-- Units flagged as damaged wait here, out of the sellable quantity
-- (on_hand), until a second person approves or rejects the flag.
ALTER TABLE products
  ADD COLUMN damaged integer NOT NULL DEFAULT 0
    CONSTRAINT products_damaged_not_negative CHECK (damaged >= 0);

-- New movement reasons:
--   damage_flagged   out of on_hand into the Damaged hold
--   damage_rejected  back from the Damaged hold into on_hand
--   reversal         the opposite of an earlier movement, approved by a
--                    second Owner or Manager
ALTER TABLE stock_movements DROP CONSTRAINT stock_movements_reason_check;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_reason_check CHECK (
  reason IN (
    'purchase', 'return', 'sale', 'damage', 'adjustment', 'count', 'opening',
    'damage_flagged', 'damage_rejected', 'reversal'
  )
);

-- A reversal points at the movement it undoes.
ALTER TABLE stock_movements
  ADD COLUMN reverses_movement_id uuid REFERENCES stock_movements (id);

-- One inbox for everything that needs a second person's decision.
CREATE TABLE approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses (id),
  kind text NOT NULL CHECK (kind IN ('damage', 'reversal')),
  product_id uuid NOT NULL REFERENCES products (id),
  quantity integer NOT NULL CHECK (quantity > 0),
  -- Poisha, at the time of the request.
  unit_cost integer NOT NULL CHECK (unit_cost >= 0),
  note text CHECK (note IS NULL OR length(note) <= 200),
  -- damage: the damage_flagged movement; reversal: the movement to undo.
  movement_id uuid NOT NULL REFERENCES stock_movements (id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by uuid NOT NULL REFERENCES users (id),
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_by uuid REFERENCES users (id),
  decided_at timestamptz,
  -- The movement the decision wrote (a rejection's return, or a reversal).
  result_movement_id uuid REFERENCES stock_movements (id),
  CONSTRAINT approvals_decided_by_someone_else
    CHECK (decided_by IS NULL OR decided_by <> requested_by),
  CONSTRAINT approvals_decision_complete CHECK (
    (status = 'pending' AND decided_by IS NULL AND decided_at IS NULL)
    OR (status <> 'pending' AND decided_by IS NOT NULL AND decided_at IS NOT NULL)
  )
);

CREATE INDEX approvals_business_status_idx
  ON approvals (business_id, status, requested_at DESC);

-- A movement can have at most one open or approved reversal.
CREATE UNIQUE INDEX approvals_one_reversal_per_movement
  ON approvals (movement_id)
  WHERE kind = 'reversal' AND status IN ('pending', 'approved');
