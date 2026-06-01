CREATE TABLE IF NOT EXISTS loans (
  id                   SERIAL PRIMARY KEY,
  item_id              INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  created_by           INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  borrower_name        VARCHAR(255) NOT NULL,
  borrower_email       VARCHAR(255),
  borrower_contact     VARCHAR(100),
  notes                TEXT,
  loan_date            TIMESTAMP NOT NULL DEFAULT NOW(),
  expected_return_date DATE,
  actual_return_date   TIMESTAMP,
  status               VARCHAR(20) NOT NULL DEFAULT 'ativo'
                         CHECK (status IN ('ativo', 'devolvido', 'atrasado')),
  created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS loans_item_id_idx ON loans(item_id);
CREATE INDEX IF NOT EXISTS loans_status_idx  ON loans(status);
