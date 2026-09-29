import { Pool } from 'pg';

const postgresSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('INVESTOR', 'ADMIN', 'STAFF')),
    password_hash TEXT
  );
  CREATE TABLE IF NOT EXISTS investors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    reference TEXT NOT NULL UNIQUE,
    classification TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    property TEXT NOT NULL,
    asset TEXT NOT NULL,
    type TEXT NOT NULL,
    principal DOUBLE PRECISION NOT NULL,
    coupon DOUBLE PRECISION NOT NULL,
    ltv DOUBLE PRECISION NOT NULL,
    maturity TEXT NOT NULL,
    status TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS allocations (
    id SERIAL PRIMARY KEY,
    investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    rate DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL,
    UNIQUE (investor_id, loan_id)
  );
  CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    file_name TEXT NOT NULL,
    status TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS registered_interests (
    id SERIAL PRIMARY KEY,
    investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    opportunity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL CHECK (amount >= 25000),
    status TEXT NOT NULL,
    registered_at TEXT NOT NULL,
    UNIQUE (investor_id, opportunity_id)
  );
`;

function postgresPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function wrapSqlite(sqlite) {
  return {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        get: async (...params) => statement.get(...params),
        all: async (...params) => statement.all(...params),
        run: async (...params) => statement.run(...params),
      };
    },
    close: async () => {},
  };
}

export async function createDatabase() {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL is required in production.');
    }
    const { getDatabase } = await import('./db.js');
    return wrapSqlite(getDatabase());
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(postgresSchema);

  return {
    prepare(sql) {
      const query = postgresPlaceholders(sql);
      return {
        get: async (...params) => (await pool.query(query, params)).rows[0],
        all: async (...params) => (await pool.query(query, params)).rows,
        run: async (...params) => {
          const result = await pool.query(query, params);
          return { changes: result.rowCount };
        },
      };
    },
    close: () => pool.end(),
  };
}