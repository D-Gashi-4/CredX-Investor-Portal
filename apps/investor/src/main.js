const API_URL = 'http://localhost:4000';
const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
const percent = value => `${Number(value).toFixed(2)}%`;
const date = value => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

function setStatus(message, tone = '') {
  const status = document.querySelector('#status');
  status.textContent = message;
  status.className = `status ${tone}`;
}

function renderPortfolio(portfolio) {
  const rows = portfolio.allocations || [];
  const capital = rows.reduce((sum, row) => sum + row.amount, 0);
  const weightedCoupon = capital ? rows.reduce((sum, row) => sum + row.amount * row.rate, 0) / capital : 0;
  const weightedLtv = capital ? rows.reduce((sum, row) => sum + row.amount * row.ltv, 0) / capital : 0;
  const commercial = rows.filter(row => row.type === 'Commercial').reduce((sum, row) => sum + row.amount, 0);
  const residential = rows.filter(row => row.type === 'Residential').reduce((sum, row) => sum + row.amount, 0);

  document.querySelector('#status').remove();
  document.querySelector('#overview').innerHTML = [
    ['Capital deployed', money(capital), `${rows.length} active facilities`],
    ['Weighted coupon', percent(weightedCoupon), 'Position weighted'],
    ['Weighted LTV', percent(weightedLtv), 'Portfolio average'],
    ['Account reference', portfolio.reference, 'Verified investor']
  ].map(([label, value, note]) => `<article class="kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');

  document.querySelector('#facility-count').textContent = `${rows.length} positions`;
  document.querySelector('#facility-table').innerHTML = `<table><thead><tr><th>Facility</th><th>Position</th><th>Rate</th><th>LTV</th><th>Maturity</th></tr></thead><tbody>${rows.map(row => `<tr><td><strong>${row.title}</strong><small>${row.loan_id} · ${row.property} · ${row.asset}</small></td><td>${money(row.amount)}</td><td>${percent(row.rate)}</td><td>${percent(row.ltv)}</td><td>${date(row.maturity)}</td></tr>`).join('')}</tbody></table>`;

  const max = Math.max(...rows.map(row => row.amount), 1);
  document.querySelector('#chart').innerHTML = rows.map(row => `<div class="bar-row"><span>${row.title}</span><i><b class="${row.type === 'Commercial' ? 'commercial' : 'residential'}" style="width:${row.amount / max * 100}%"></b></i><strong>${money(row.amount)}</strong></div>`).join('');
  document.querySelector('#composition').innerHTML = [['Commercial bridging', commercial, 'commercial'], ['Residential bridging', residential, 'residential']].map(([label, value, tone]) => `<div class="composition-row"><div><span class="dot ${tone}"></span><strong>${label}</strong></div><strong>${money(value)}</strong><small>${capital ? (value / capital * 100).toFixed(1) : '0.0'}%</small></div>`).join('');
}

async function loadPortfolio() {
  try {
    const response = await fetch(`${API_URL}/api/portfolio`, { headers: { 'x-credx-role': 'INVESTOR' } });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    renderPortfolio(await response.json());
  } catch (error) {
    setStatus(`Could not load live portfolio: ${error.message}`, 'error');
  }
}

loadPortfolio();
