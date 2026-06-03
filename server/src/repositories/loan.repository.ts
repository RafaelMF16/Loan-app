import { Pool, PoolClient } from 'pg';
import { pool } from '../database/connection';
import { Loan, LoanWithDetails } from '../types';

const PAGE_SIZE = 10;

const LOAN_COLUMNS = `
  l.id,
  l.item_id AS "itemId",
  l.created_by AS "createdBy",
  l.borrower_name AS "borrowerName",
  l.borrower_email AS "borrowerEmail",
  l.borrower_contact AS "borrowerContact",
  l.notes,
  l.loan_date AS "loanDate",
  l.expected_return_date AS "expectedReturnDate",
  l.actual_return_date AS "actualReturnDate",
  l.status,
  l.created_at AS "createdAt",
  i.name AS "itemName",
  i.icon AS "itemIcon",
  u.name AS "createdByName"
`;

export interface PaginatedLoansResult {
  rows: LoanWithDetails[];
  total: number;
}

export interface CreateLoanData {
  itemId: number;
  createdBy: number;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  expectedReturnDate?: string;
  notes?: string;
}

export interface LoanFilters {
  status?: string;
  itemId?: number;
  startDate?: string;
  endDate?: string;
}

export const loanRepository = {
  async updateOverdueStatuses(): Promise<void> {
    await pool.query(
      `UPDATE loans SET status = 'atrasado'
       WHERE status = 'ativo'
         AND expected_return_date IS NOT NULL
         AND expected_return_date < CURRENT_DATE`
    );
  },

  async findAll(
    page: number,
    filters: LoanFilters,
    userId: number
  ): Promise<PaginatedLoansResult> {
    const offset = (page - 1) * PAGE_SIZE;
    const conditions: string[] = ['i.user_id = $1'];
    const values: (string | number)[] = [userId];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`l.status = $${values.length}`);
    }
    if (filters.itemId) {
      values.push(filters.itemId);
      conditions.push(`l.item_id = $${values.length}`);
    }
    if (filters.startDate) {
      values.push(filters.startDate);
      conditions.push(`l.loan_date >= $${values.length}::date`);
    }
    if (filters.endDate) {
      values.push(filters.endDate);
      conditions.push(`l.loan_date < ($${values.length}::date + INTERVAL '1 day')`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countValues = [...values];
    values.push(PAGE_SIZE, offset);

    const [dataResult, countResult] = await Promise.all([
      pool.query<LoanWithDetails>({
        text: `SELECT ${LOAN_COLUMNS}
               FROM loans l
               JOIN items i ON i.id = l.item_id
               JOIN users u ON u.id = l.created_by
               ${where}
               ORDER BY l.created_at DESC
               LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values,
      }),
      pool.query<{ count: string }>({
        text: `SELECT COUNT(*) AS count
               FROM loans l
               JOIN items i ON i.id = l.item_id
               ${where}`,
        values: countValues,
      }),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findAllAdmin(
    page: number,
    filters: { status?: string }
  ): Promise<PaginatedLoansResult> {
    const offset = (page - 1) * PAGE_SIZE;
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`l.status = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    values.push(PAGE_SIZE, offset);

    const [dataResult, countResult] = await Promise.all([
      pool.query<LoanWithDetails>({
        text: `SELECT ${LOAN_COLUMNS}
               FROM loans l
               JOIN items i ON i.id = l.item_id
               JOIN users u ON u.id = l.created_by
               ${where}
               ORDER BY l.created_at DESC
               LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values,
      }),
      pool.query<{ count: string }>({
        text: `SELECT COUNT(*) AS count
               FROM loans l
               JOIN items i ON i.id = l.item_id
               ${where}`,
        values: countValues,
      }),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findById(id: number, userId: number): Promise<LoanWithDetails | null> {
    const result = await pool.query<LoanWithDetails>({
      name: 'loans-by-id-v2',
      text: `SELECT ${LOAN_COLUMNS}
             FROM loans l
             JOIN items i ON i.id = l.item_id
             JOIN users u ON u.id = l.created_by
             WHERE l.id = $1 AND i.user_id = $2`,
      values: [id, userId],
    });
    return result.rows[0] ?? null;
  },

  async findByItemId(itemId: number, page: number): Promise<PaginatedLoansResult> {
    const offset = (page - 1) * PAGE_SIZE;
    const [dataResult, countResult] = await Promise.all([
      pool.query<LoanWithDetails>({
        text: `SELECT ${LOAN_COLUMNS}
               FROM loans l
               JOIN items i ON i.id = l.item_id
               JOIN users u ON u.id = l.created_by
               WHERE l.item_id = $1
               ORDER BY l.created_at DESC
               LIMIT $2 OFFSET $3`,
        values: [itemId, PAGE_SIZE, offset],
      }),
      pool.query<{ count: string }>({
        text: `SELECT COUNT(*) AS count FROM loans WHERE item_id = $1`,
        values: [itemId],
      }),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async create(data: CreateLoanData, client?: PoolClient): Promise<Loan> {
    const executor: Pool | PoolClient = client ?? pool;
    const result = await executor.query<Loan>({
      text: `INSERT INTO loans
               (item_id, created_by, borrower_name, borrower_email, borrower_contact,
                expected_return_date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING
               id,
               item_id AS "itemId",
               created_by AS "createdBy",
               borrower_name AS "borrowerName",
               borrower_email AS "borrowerEmail",
               borrower_contact AS "borrowerContact",
               notes,
               loan_date AS "loanDate",
               expected_return_date AS "expectedReturnDate",
               actual_return_date AS "actualReturnDate",
               status,
               created_at AS "createdAt"`,
      values: [
        data.itemId,
        data.createdBy,
        data.borrowerName,
        data.borrowerEmail ?? null,
        data.borrowerContact ?? null,
        data.expectedReturnDate ?? null,
        data.notes ?? null,
      ],
    });
    return result.rows[0];
  },

  async markReturned(id: number, client?: PoolClient): Promise<void> {
    const executor: Pool | PoolClient = client ?? pool;
    await executor.query({
      text: `UPDATE loans
             SET actual_return_date = NOW(), status = 'devolvido'
             WHERE id = $1`,
      values: [id],
    });
  },
};
