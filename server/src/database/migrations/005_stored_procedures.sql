CREATE OR REPLACE FUNCTION sp_criar_emprestimo(
  p_item_id              INTEGER,
  p_created_by           INTEGER,
  p_borrower_name        VARCHAR(255),
  p_borrower_email       VARCHAR(255) DEFAULT NULL,
  p_borrower_contact     VARCHAR(100) DEFAULT NULL,
  p_expected_return_date DATE         DEFAULT NULL,
  p_notes                TEXT         DEFAULT NULL
)
RETURNS TABLE (
  id                   INTEGER,
  item_id              INTEGER,
  created_by           INTEGER,
  borrower_name        VARCHAR(255),
  borrower_email       VARCHAR(255),
  borrower_contact     VARCHAR(100),
  notes                TEXT,
  loan_date            TIMESTAMP,
  expected_return_date DATE,
  actual_return_date   TIMESTAMP,
  status               VARCHAR(20),
  created_at           TIMESTAMP
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_item_status VARCHAR(50);
  v_loan_id     INTEGER;
BEGIN
  SELECT i.status INTO v_item_status
  FROM items i
  WHERE i.id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item não encontrado.' USING ERRCODE = 'P0002';
  END IF;

  IF v_item_status <> 'disponivel' THEN
    RAISE EXCEPTION 'Item não está disponível para empréstimo.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO loans (
    item_id, created_by, borrower_name, borrower_email,
    borrower_contact, expected_return_date, notes
  )
  VALUES (
    p_item_id, p_created_by, p_borrower_name, p_borrower_email,
    p_borrower_contact, p_expected_return_date, p_notes
  );

  v_loan_id := lastval();

  UPDATE items SET status = 'emprestado' WHERE items.id = p_item_id;

  RETURN QUERY
  SELECT
    l.id,
    l.item_id,
    l.created_by,
    l.borrower_name,
    l.borrower_email,
    l.borrower_contact,
    l.notes,
    l.loan_date,
    l.expected_return_date,
    l.actual_return_date,
    l.status,
    l.created_at
  FROM loans l
  WHERE l.id = v_loan_id;
END;
$$;


CREATE OR REPLACE FUNCTION sp_dashboard_stats(
  p_user_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
  total_items            BIGINT,
  available_items        BIGINT,
  borrowed_items         BIGINT,
  total_loans            BIGINT,
  active_loans           BIGINT,
  returned_loans         BIGINT,
  overdue_loans          BIGINT,
  avg_loan_duration_days NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT i.id)                                                                    AS total_items,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'disponivel')                             AS available_items,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'emprestado')                             AS borrowed_items,
    COUNT(l.id)                                                                              AS total_loans,
    COUNT(l.id) FILTER (WHERE l.status = 'ativo')                                           AS active_loans,
    COUNT(l.id) FILTER (WHERE l.status = 'devolvido')                                       AS returned_loans,
    COUNT(l.id) FILTER (WHERE l.status = 'atrasado')                                        AS overdue_loans,
    ROUND(
      AVG(
        EXTRACT(EPOCH FROM (l.actual_return_date - l.loan_date)) / 86400.0
      ) FILTER (WHERE l.status = 'devolvido' AND l.actual_return_date IS NOT NULL),
      1
    )                                                                                        AS avg_loan_duration_days
  FROM items i
  LEFT JOIN loans l ON l.item_id = i.id
  WHERE (p_user_id IS NULL OR i.user_id = p_user_id);
END;
$$;
