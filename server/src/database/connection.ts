import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://loan_user:loan_password@localhost:5432/loan_app',
});
