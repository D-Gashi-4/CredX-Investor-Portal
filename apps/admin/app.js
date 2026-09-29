const API = 'http://localhost:4000';
const sessionKey = 'credx-admin-session-v1';
const app = document.querySelector('#app');
const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value || 0);

function session() { try { return JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch { return null; } }
function saveSession(value) { sessionStorage.setItem(sessionKey, JSON.stringify(value)); }
function clearSession() { sessionStorage.removeItem(sessionKey); }
async function api(path, options = {}) {
  const current = session();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (current?.token) headers.Authorization = `Bearer ${current.token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `API returned ${response.status}`);
  return response.status === 204 ? null : response.json();
}

function renderLogin(error = '') {
  app.innerHTML = `<main class="login"><div class="login-mark">C</div><p class="eyebrow">CredX operations</p><h1>Admin Portal</h1><p class="muted">Manage investors, facilities, allocations and platform communications.</p><form id="login-form"><label>Email<input type="email" value="admin@credx.co.uk" required></label><label>Password<input type="password" required></label>${error ? `<div class="error">${error}</div>` : ''}<button>Sign in</button><small>Demo admin password: CredXAdmin2026!</small></form></main>`;
  app.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault();
    const inputs = [...event.currentTarget.querySelectorAll('input')];
    try {
      const result = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inputs[0].value, password: inputs[1].value }) });
      if (!result.ok) throw new Error('Invalid admin credentials');
      const data = await result.json();
      if (data.user.role !== 'ADMIN' && data.user.role !== 'STAFF') throw new Error('Admin access required');
      saveSession(data); renderDashboard();
    } catch (error) { renderLogin(error.message); }
  });
}

async function renderDashboard() {
  app.innerHTML = `<div class="admin-shell"><aside><div class="brand"><span>C</span><div><small>CredX operations</small><strong>Admin Portal</strong></div></div><nav><a class="active">Overview</a><a>Loans</a><a>Investors</a><a>Registered interest</a><a>Documents</a></nav><button id="logout" class="logout">Sign out</button></aside><main><header><div><p class="eyebrow">Operations / Live book</p><h1>Control centre</h1><p class="muted">Shared records across the CredX investor platform.</p></div><div class="operator"><strong>CredX Admin</strong><small>Administrator</small></div></header><div id="status" class="status">Loading records...</div><section id="metrics" class="metrics"></section><section class="grid"><article class="panel"><div class="panel-head"><div><p class="eyebrow">Loan register</p><h2>Active facilities</h2></div><span id="loan-count" class="muted"></span></div><div id="loans" class="table-wrap"></div></article><article class="panel"><div class="panel-head"><div><p class="eyebrow">Investor register</p><h2>Investors</h2></div><span id="investor-count" class="muted"></span></div><div id="investors" class="table-wrap"></div></article></section></main></div>`;
  document.querySelector('#logout').onclick = async () => { try { await api('/api/auth/logout', { method: 'POST' }); } finally { clearSession(); renderLogin(); } };
  try {
    const [loans, investors] = await Promise.all([api('/api/admin/loans'), api('/api/admin/investors')]);
    const capital = loans.reduce((sum, loan) => sum + loan.principal, 0);
    document.querySelector('#status').remove();
    document.querySelector('#metrics').innerHTML = [['Active facilities', loans.length], ['Capital deployed', money(capital)], ['Investors', investors.length], ['Open reviews', investors.reduce((sum, investor) => sum + investor.allocation_count, 0)]].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`).join('');
    document.querySelector('#loan-count').textContent = `${loans.length} records`;
    document.querySelector('#investor-count').textContent = `${investors.length} records`;
    document.querySelector('#loans').innerHTML = `<table><thead><tr><th>Facility</th><th>Principal</th><th>Rate</th><th>Status</th></tr></thead><tbody>${loans.map(loan => `<tr><td><strong>${loan.title}</strong><small>${loan.id} · ${loan.property}</small></td><td>${money(loan.principal)}</td><td>${loan.coupon.toFixed(2)}%</td><td><span class="badge">${loan.status}</span></td></tr>`).join('')}</tbody></table>`;
    document.querySelector('#investors').innerHTML = `<table><thead><tr><th>Investor</th><th>Reference</th><th>Allocations</th></tr></thead><tbody>${investors.map(investor => `<tr><td><strong>${investor.display_name}</strong><small>${investor.email}</small></td><td>${investor.reference}</td><td>${investor.allocation_count}</td></tr>`).join('')}</tbody></table>`;
  } catch (error) { document.querySelector('#status').textContent = error.message; document.querySelector('#status').className = 'status error'; }
}

session() ? renderDashboard() : renderLogin();
