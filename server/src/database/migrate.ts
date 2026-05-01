import { pool } from './connection';
import * as fs from 'fs';
import * as path from 'path';

async function migrate(): Promise<void> {
  const sql = fs.readFileSync(
    path.join(__dirname, 'migrations', '001_create_tables.sql'),
    'utf-8'
  );

  try {
    await pool.query(sql);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
