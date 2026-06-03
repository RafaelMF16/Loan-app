import { pool } from '../database/connection';
import { User } from '../types';

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>({
      name: 'users-by-email',
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email],
    });
    return result.rows[0] ?? null;
  },

  async findById(id: number): Promise<User | null> {
    const result = await pool.query<User>({
      name: 'users-by-id',
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    });
    return result.rows[0] ?? null;
  },

  async create(name: string, email: string, hashedPassword: string): Promise<User> {
    const result = await pool.query<User>({
      name: 'users-create-v2',
      text: 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      values: [name, email, hashedPassword, 'user'],
    });
    return result.rows[0];
  },

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const result = await pool.query<Omit<User, 'password'>>({
      name: 'users-find-all',
      text: 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC',
      values: [],
    });
    return result.rows;
  },
};
