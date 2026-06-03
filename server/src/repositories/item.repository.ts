import { Pool, PoolClient } from 'pg';
import { pool } from '../database/connection';
import { Item } from '../types';

const PAGE_SIZE = 10;
const ITEM_COLUMNS = `id, name, description, status, status_detail AS "statusDetail", icon, user_id AS "userId", created_at`;

export interface PaginatedItems {
  rows: Item[];
  total: number;
}

export const itemRepository = {
  async findAll(page: number, search: string, userId: number, status?: string): Promise<PaginatedItems> {
    const offset = (page - 1) * PAGE_SIZE;
    const pattern = `%${search}%`;

    const conditions: string[] = ['(name ILIKE $1 OR description ILIKE $1)', 'user_id = $2'];
    const values: (string | number)[] = [pattern, userId];

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countValues = [...values];
    values.push(PAGE_SIZE, offset);

    const [dataResult, countResult] = await Promise.all([
      pool.query<Item>({
        text: `SELECT ${ITEM_COLUMNS} FROM items ${where}
               ORDER BY created_at DESC
               LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values,
      }),
      pool.query<{ count: string }>({
        text: `SELECT COUNT(*) AS count FROM items ${where}`,
        values: countValues,
      }),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findById(id: number, userId: number): Promise<Item | null> {
    const result = await pool.query<Item>({
      name: 'items-by-id-v2',
      text: `SELECT ${ITEM_COLUMNS} FROM items WHERE id = $1 AND user_id = $2`,
      values: [id, userId],
    });
    return result.rows[0] ?? null;
  },

  async create(data: Omit<Item, 'id' | 'created_at'> & { userId: number }): Promise<Item> {
    const result = await pool.query<Item>({
      name: 'items-create-v2',
      text: `INSERT INTO items (name, description, status, status_detail, icon, user_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING ${ITEM_COLUMNS}`,
      values: [data.name, data.description, data.status, data.statusDetail ?? null, data.icon, data.userId],
    });
    return result.rows[0];
  },

  async update(id: number, data: Omit<Item, 'id' | 'created_at'>, userId: number): Promise<Item | null> {
    const result = await pool.query<Item>({
      name: 'items-update-v2',
      text: `UPDATE items
             SET name=$1, description=$2, status=$3, status_detail=$4, icon=$5
             WHERE id=$6 AND user_id=$7
             RETURNING ${ITEM_COLUMNS}`,
      values: [data.name, data.description, data.status, data.statusDetail ?? null, data.icon, id, userId],
    });
    return result.rows[0] ?? null;
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query({
      name: 'items-delete-v2',
      text: 'DELETE FROM items WHERE id = $1 AND user_id = $2',
      values: [id, userId],
    });
    return (result.rowCount ?? 0) > 0;
  },

  async updateStatus(id: number, status: Item['status'], client?: PoolClient): Promise<void> {
    const executor: Pool | PoolClient = client ?? pool;
    await executor.query({
      text: `UPDATE items SET status = $1 WHERE id = $2`,
      values: [status, id],
    });
  },

  async findAllAdmin(page: number, search: string): Promise<PaginatedItems> {
    const offset = (page - 1) * PAGE_SIZE;
    const pattern = `%${search}%`;

    const [dataResult, countResult] = await Promise.all([
      pool.query<Item>({
        text: `SELECT ${ITEM_COLUMNS} FROM items
               WHERE (name ILIKE $1 OR description ILIKE $1)
               ORDER BY created_at DESC
               LIMIT $2 OFFSET $3`,
        values: [pattern, PAGE_SIZE, offset],
      }),
      pool.query<{ count: string }>({
        text: `SELECT COUNT(*) AS count FROM items
               WHERE (name ILIKE $1 OR description ILIKE $1)`,
        values: [pattern],
      }),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },
};
