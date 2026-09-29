import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const databasePath = resolve(process.env.DATABASE_FILE || './apps/api/data/credx.db');
mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('INVESTOR', 'ADMIN', 'STAFF')),
    password_hash TEXT
  );
  CREATE TABLE IF NOT EXISTS investors (
    id INTEGER PRIMARY KEY,
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
    principal REAL NOT NULL,
    coupon REAL NOT NULL,
    ltv REAL NOT NULL,
    maturity TEXT NOT NULL,
    status TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS allocations (
    id INTEGER PRIMARY KEY,
    investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    rate REAL NOT NULL,
    status TEXT NOT NULL,
    UNIQUE (investor_id, loan_id)
  );
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY,
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
    id INTEGER PRIMARY KEY,
    investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    opportunity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 25000),
    status TEXT NOT NULL,
    registered_at TEXT NOT NULL,
    UNIQUE (investor_id, opportunity_id)
  );
`);

const userColumns = db.prepare(`PRAGMA table_info(users)`).all();
if (!userColumns.some(column => column.name === 'password_hash')) {
  db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${digest}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, expected] = stored.split(':');
  const actual = scryptSync(password, salt, 64).toString('hex');
  return expected.length === actual.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();
  db.prepare(`INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`).run(token, userId, expiresAt, now.toISOString());
  return { token, expiresAt };
}

export function findSession(token) {
  const session = db.prepare(`SELECT sessions.*, users.email, users.display_name, users.role, investors.id AS investor_id, investors.reference, investors.classification FROM sessions JOIN users ON users.id = sessions.user_id LEFT JOIN investors ON investors.user_id = users.id WHERE sessions.token = ?`).get(token);
  if (!session || new Date(session.expires_at) <= new Date()) {
    if (session) db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
    return null;
  }
  return session;
}

export function deleteSession(token) {
  db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}

const seedUser = db.prepare(`INSERT OR IGNORE INTO users (id, email, display_name, role) VALUES (1, ?, ?, ?)`);
seedUser.run('d.gashi@example.co.uk', 'Dorant Gashi', 'INVESTOR');
db.prepare(`UPDATE users SET password_hash = COALESCE(password_hash, ?) WHERE id = 1`).run(hashPassword('CredX2026!'));
const seedInvestor = db.prepare(`INSERT OR IGNORE INTO investors (id, user_id, reference, classification) VALUES (1, 1, ?, ?)`);
seedInvestor.run('CX-INV-0421', 'Self-certified sophisticated investor');

const facilities = [
  ['CX-2604-K', 'Sevenoaks Mixed-Use Refinance', 'Sevenoaks, Kent', 'Mixed-use parade', 'Commercial', 250000, 11.4, 58, '2026-11-14'],
  ['CX-2598-K', 'Tunbridge Wells Office Acquisition', 'Tunbridge Wells, Kent', 'Class E commercial office', 'Commercial', 175000, 11, 55, '2026-09-03'],
  ['CX-2581-R', 'Whitstable Residential Auction', 'Whitstable, Kent', 'Detached residential dwelling', 'Residential', 95000, 10.5, 52, '2026-07-21'],
  ['CX-2572-D', 'Maidstone Light Industrial', 'Maidstone, Kent', 'Light industrial unit', 'Commercial', 320000, 11.75, 61, '2027-01-08'],
  ['CX-2540-K', 'Canterbury HMO Conversion', 'Canterbury, Kent', 'Six-bedroom HMO conversion', 'Residential', 140000, 10.95, 49, '2026-06-12'],
  ['CX-2511-R', 'Folkestone Residential Refurb', 'Folkestone, Kent', 'Terraced residential dwelling', 'Residential', 60000, 10.25, 46, '2026-05-29']
];
const seedLoan = db.prepare(`INSERT OR IGNORE INTO loans (id, title, property, asset, type, principal, coupon, ltv, maturity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`);
const seedAllocation = db.prepare(`INSERT OR IGNORE INTO allocations (investor_id, loan_id, amount, rate, status) VALUES (1, ?, ?, ?, 'Active')`);
for (const facility of facilities) {
  seedLoan.run(...facility);
  seedAllocation.run(facility[0], facility[5], facility[6]);
}

const seedDocument = db.prepare(`INSERT OR IGNORE INTO documents (id, investor_id, category, file_name, status) VALUES (?, 1, ?, ?, 'Verified')`);
seedDocument.run(1, 'Statements', 'Q1 2026 Investor Statement.pdf');
seedDocument.run(2, 'Reports', 'May 2026 Investor Letter.pdf');
seedDocument.run(3, 'KYC', 'Sophisticated Investor Self-Certification.pdf');

export function getDatabase() {
  return db;
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll('\\', '/')}`) {
  console.log(`CredX SQLite database ready at ${databasePath}`);
}
