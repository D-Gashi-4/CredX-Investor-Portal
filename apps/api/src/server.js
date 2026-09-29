import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import { createDatabase } from './database.js';
import { verifyPassword } from './passwords.js';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const db = await createDatabase();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Try again later.' },
});

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
}));
app.use(express.json({ limit: '32kb' }));

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role || req.header('x-credx-role');
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    req.role = role;
    next();
  };
}

async function findSession(token) {
  const session = await db.prepare(`SELECT sessions.*, users.email, users.display_name, users.role, investors.id AS investor_id, investors.reference, investors.classification FROM sessions JOIN users ON users.id = sessions.user_id LEFT JOIN investors ON investors.user_id = users.id WHERE sessions.token = ?`).get(token);
  if (!session || new Date(session.expires_at) <= new Date()) {
    if (session) await db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
    return null;
  }
  return session;
}

async function requireAuth(req, res, next) {
  try {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  const user = token ? await findSession(token) : null;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  req.user = user;
  req.sessionToken = token;
  next();
  } catch (error) {
    next(error);
  }
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'credx-api', authenticationEnabled: !isProduction }));

app.post('/api/auth/login', authLimiter, async (req, res) => {
  if (isProduction) {
    return res.status(503).json({ error: 'Investor sign-in is disabled until registration, email verification, MFA and KYC are implemented.' });
  }
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = await db.prepare(`SELECT users.*, investors.id AS investor_id, investors.reference, investors.classification FROM users LEFT JOIN investors ON investors.user_id = users.id WHERE lower(users.email) = ? LIMIT 1`).get(email);
  if (!user || !verifyPassword(password, user.password_hash)) return res.status(401).json({ error: 'Invalid email or password' });
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();
  await db.prepare(`INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`).run(token, user.id, expiresAt, now.toISOString());
  const session = { token, expiresAt };
  res.json({ token: session.token, expiresAt: session.expiresAt, user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role, investorId: user.investor_id, reference: user.reference, classification: user.classification } });
});

app.post('/api/auth/logout', requireAuth, async (req, res) => {
  await db.prepare(`DELETE FROM sessions WHERE token = ?`).run(req.sessionToken);
  res.status(204).end();
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ id: req.user.user_id, email: req.user.email, displayName: req.user.display_name, role: req.user.role, investorId: req.user.investor_id, reference: req.user.reference, classification: req.user.classification });
});

app.get('/api/portfolio', requireAuth, requireRole('INVESTOR'), async (req, res) => {
  const investor = await db.prepare(`SELECT * FROM investors WHERE id = ?`).get(req.user.investor_id);
  if (!investor) return res.status(404).json({ error: 'Investor not found' });
  const allocations = await db.prepare(`SELECT allocations.*, loans.title, loans.property, loans.asset, loans.type, loans.principal, loans.coupon, loans.ltv, loans.maturity, loans.status AS loan_status FROM allocations JOIN loans ON loans.id = allocations.loan_id WHERE allocations.investor_id = ? ORDER BY loans.maturity`).all(investor.id);
  const documents = await db.prepare(`SELECT * FROM documents WHERE investor_id = ? ORDER BY id DESC`).all(investor.id);
  res.json({ ...investor, allocations, documents });
});

app.get('/api/interests', requireAuth, requireRole('INVESTOR'), async (req, res) => {
  res.json(await db.prepare(`SELECT opportunity_id AS opportunityId, title, amount, status, registered_at AS registeredAt FROM registered_interests WHERE investor_id = ? ORDER BY registered_at DESC`).all(req.user.investor_id));
});

app.post('/api/interests', requireAuth, requireRole('INVESTOR'), async (req, res) => {
  const opportunityId = String(req.body?.opportunityId || '').trim();
  const title = String(req.body?.title || '').trim();
  const amount = Number(req.body?.amount);
  if (!opportunityId || !title || !Number.isFinite(amount) || amount < 25000) {
    return res.status(400).json({ error: 'Minimum registered interest is £25,000' });
  }
  const registeredAt = new Date().toISOString();
  await db.prepare(`INSERT INTO registered_interests (investor_id, opportunity_id, title, amount, status, registered_at) VALUES (?, ?, ?, ?, 'Pending CredX response', ?) ON CONFLICT(investor_id, opportunity_id) DO UPDATE SET title = excluded.title, amount = excluded.amount, status = excluded.status, registered_at = excluded.registered_at`).run(req.user.investor_id, opportunityId, title, amount, registeredAt);
  res.status(201).json({ opportunityId, title, amount, status: 'Pending CredX response', registeredAt });
});

app.get('/api/admin/loans', requireAuth, requireRole('ADMIN', 'STAFF'), async (_req, res) => {
  res.json(await db.prepare(`SELECT loans.*, COUNT(allocations.id) AS allocation_count FROM loans LEFT JOIN allocations ON allocations.loan_id = loans.id GROUP BY loans.id ORDER BY loans.maturity`).all());
});

app.get('/api/admin/investors', requireAuth, requireRole('ADMIN', 'STAFF'), async (_req, res) => {
  res.json(await db.prepare(`SELECT investors.*, users.email, users.display_name, COUNT(allocations.id) AS allocation_count FROM investors JOIN users ON users.id = investors.user_id LEFT JOIN allocations ON allocations.investor_id = investors.id GROUP BY investors.id, users.email, users.display_name`).all());
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => console.log(`CredX API listening on http://localhost:${port}`));
