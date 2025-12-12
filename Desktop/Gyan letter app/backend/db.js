import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()

// PostgreSQL connection pool
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gyan_letter_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
})

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Initialize database schema
export async function initDatabase() {
  try {
    // Create records table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create index on JSONB data for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_records_data_gin ON records USING GIN (data)
    `)

    // Create function to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)

    // Create trigger to auto-update updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_records_updated_at ON records;
      CREATE TRIGGER update_records_updated_at
      BEFORE UPDATE ON records
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `)

    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}


