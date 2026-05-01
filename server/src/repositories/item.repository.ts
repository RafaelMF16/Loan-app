import { pool } from '../database/connection';
import { Item } from '../types';

const PAGE_SIZE = 10;
const ITEM_COLUMNS = `id, name, description, status, status_detail AS "statusDetail", icon, created_at`;

export interface PaginatedItems {
  rows: Item[];
  total: number;
}

export const itemRepository = {
  async findAll(page: number, search: string): Promise<PaginatedItems> {
    const offset = (page - 1) * PAGE_SIZE;
    const pattern = `%${search}%`;

    const [dataResult, countResult] = await Promise.all([
      pool.query<Item>({
        name: 'items-paginated',
        text: `SELECT ${ITEM_COLUMNS} FROM items
               WHERE name ILIKE $1 OR description ILIKE $1
               ORDER BY created_at DESC
               LIMIT $2 OFFSET $3`,
        values: [pattern, PAGE_SIZE, offset],
      }),
      pool.query<{ count: string }>({
        name: 'items-count',
        text: `SELECT COUNT(*) AS count FROM items WHERE name ILIKE $1 OR description ILIKE $1`,
        values: [pattern],
      }),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findById(id: number): Promise<Item | null> {
    const result = await pool.query<Item>({
      name: 'items-by-id',
      text: `SELECT ${ITEM_COLUMNS} FROM items WHERE id = $1`,
      values: [id],
    });
    return result.rows[0] ?? null;
  },

  async create(data: Omit<Item, 'id' | 'created_at'>): Promise<Item> {
    const result = await pool.query<Item>({
      name: 'items-create',
      text: `INSERT INTO items (name, description, status, status_detail, icon)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING ${ITEM_COLUMNS}`,
      values: [data.name, data.description, data.status, data.statusDetail ?? null, data.icon],
    });
    return result.rows[0];
  },

  async update(id: number, data: Omit<Item, 'id' | 'created_at'>): Promise<Item | null> {
    const result = await pool.query<Item>({
      name: 'items-update',
      text: `UPDATE items
             SET name=$1, description=$2, status=$3, status_detail=$4, icon=$5
             WHERE id=$6
             RETURNING ${ITEM_COLUMNS}`,
      values: [data.name, data.description, data.status, data.statusDetail ?? null, data.icon, id],
    });
    return result.rows[0] ?? null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query({
      name: 'items-delete',
      text: 'DELETE FROM items WHERE id = $1',
      values: [id],
    });
    return (result.rowCount ?? 0) > 0;
  },
};
