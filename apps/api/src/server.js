import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDatabase } from './db.js';

const app = express();
const db = getDatabase();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.header('x-credx-role');
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    req.role = role;
    next();
  };
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'credx-api' }));

app.get('/api/me', requireRole('INVESTOR', 'ADMIN', 'STAFF'), (req, res) => {
  const user = db.prepare(`SELECT users.*, investors.reference, investors.classification FROM users LEFT JOIN investors ON investors.user_id = users.id WHERE users.role = ? LIMIT 1`).get(req.role);
  res.json(user || null);
});

app.get('/api/portfolio', requireRole('INVESTOR'), (req, res) => {
  const investor = db.prepare(`SELECT * FROM investors WHERE user_id = (SELECT id FROM users WHERE role = 'INVESTOR' LIMIT 1)`).get();
  if (!investor) return res.status(404).json({ error: 'Investor not found' });
  const allocations = db.prepare(`SELECT allocations.*, loans.title, loans.property, loans.asset, loans.type, loans.principal, loans.coupon, loans.ltv, loans.maturity, loans.status AS loan_status FROM allocations JOIN loans ON loans.id = allocations.loan_id WHERE allocations.investor_id = ? ORDER BY loans.maturity`).all(investor.id);
  const documents = db.prepare(`SELECT * FROM documents WHERE investor_id = ? ORDER BY id DESC`).all(investor.id);
  res.json({ ...investor, allocations, documents });
});

app.get('/api/admin/loans', requireRole('ADMIN', 'STAFF'), (_req, res) => {
  res.json(db.prepare(`SELECT loans.*, COUNT(allocations.id) AS allocation_count FROM loans LEFT JOIN allocations ON allocations.loan_id = loans.id GROUP BY loans.id ORDER BY loans.maturity`).all());
});

app.get('/api/admin/investors', requireRole('ADMIN', 'STAFF'), (_req, res) => {
  res.json(db.prepare(`SELECT investors.*, users.email, users.display_name, COUNT(allocations.id) AS allocation_count FROM investors JOIN users ON users.id = investors.user_id LEFT JOIN allocations ON allocations.investor_id = investors.id GROUP BY investors.id`).all());
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => console.log(`CredX API listening on http://localhost:${port}`));
