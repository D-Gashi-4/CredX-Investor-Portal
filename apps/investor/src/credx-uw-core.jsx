// CredX — Underwriting core: process template, helpers, case store + seed data.
// Exposes: window.UW_STAGES, window.UW_AREAS, window.UW_PEOPLE, window.uwHelpers,
//          window.CredXCases (localStorage-backed store with subscribe()).

// ── The 10-stage underwriting process (from the CredX Underwriting Process Manual) ──
// Each stage carries its functional area, responsible role, escalation route and the
// evidence required. Sub-points are individually satisfiable underwriting "points".
const UW_AREAS = [
  'Application & Broker',
  'Identity & AML',
  'Credit & Corporate',
  'Property & Development',
  'Structuring & Legal',
  'Completion',
];

const UW_STAGES = [
  {
    n: '01', area: 'Application & Broker', title: 'Application Receipt & DIP Validation',
    role: 'Sales / Risk Team', escalation: 'CRO — regulated loan purpose',
    evidence: 'DIP, application pack, file creation',
    items: [
      { id: '01.1', label: 'Application receipt & file creation', detail: 'Application, loan proposal and supporting documents received from sales; file created immediately upon receipt.' },
      { id: '01.2', label: 'DIP validity check', detail: 'Confirm DIP issue date and that it remains valid. Validity window: 10 working days from the day after issuance. If expired, obtain a new DIP before proceeding.' },
      { id: '01.3', label: 'Loan purpose review', detail: 'Confirm the facility is an unregulated product. CredX offers unregulated loans only — any regulated purpose must be referred immediately to the CRO.' },
    ],
  },
  {
    n: '02', area: 'Application & Broker', title: 'Broker & Intermediary Compliance',
    role: 'Sales Team', escalation: 'Risk Team',
    evidence: 'FCA / ICO records on file',
    items: [
      { id: '02.1', label: 'FCA registration & permissions', detail: 'For 2nd-charge business-purpose enquiries, verify the broker is FCA authorised — directly registered, an AR of an authorised firm, HMRC-registered for AML, or a member of NACFB / FIBA / BDLA.' },
      { id: '02.2', label: 'ICO registration verification', detail: 'Confirm the broker is registered with the ICO. Record and hold the ICO registration number on file before processing.' },
    ],
  },
  {
    n: '03', area: 'Identity & AML', title: 'Identity Verification & AML',
    role: 'Underwriter', escalation: 'CRO — PEP / AML',
    evidence: 'ID copies, AML certificate, source-of-funds documents',
    items: [
      { id: '03.1', label: 'Signature verification', detail: 'Compare signatures on the application against photo ID for all applicants. Question any discrepancy before proceeding; note the comparison on file.' },
      { id: '03.2', label: 'Photo ID verification', detail: 'Acceptable: valid passport, driving licence, government-issued ID card or shotgun licence. Must be current and legible; certify copies to file.' },
      { id: '03.3', label: 'Proof of residence', detail: 'Dated within 3 months: utility bill, bank statement, council tax bill or driving licence, clearly showing name and current address.' },
      { id: '03.4', label: 'AML check via solicitor', detail: 'AML checks completed via the appointed solicitor. A copy of the AML documentation must be on file before completion.' },
      { id: '03.5', label: 'Source of funds verification', detail: 'Mandatory for all transactions. Evidence purchase funds, shortfalls, refinance proceeds and build-cost contributions. Any suspicion of money laundering escalates immediately to the CRO.' },
    ],
  },
  {
    n: '04', area: 'Credit & Corporate', title: 'Credit & Background Checks',
    role: 'Underwriter', escalation: 'CRO — vulnerable customer / ML',
    evidence: 'Credit reports, internet search, bank statements',
    items: [
      { id: '04.1', label: 'Credit report', detail: 'Full Equifax or Experian report for all applicants. Valid 2 months from issue. Any PEP or Sanction alert must be raised with the CRO for approval and the outcome saved to file.' },
      { id: '04.2', label: 'Internet search — borrower, directors & property', detail: 'Thorough search of borrower, all directors/shareholders and the security property. Save results to file; escalate any adverse publicity (reputational risk).' },
      { id: '04.3', label: 'Bank statement review', detail: 'Review 3 months of personal and business statements. Flag signs of money laundering to the CRO. If vulnerability indicators exist, follow the Vulnerable Customer process and add to the register.' },
      { id: '04.4', label: 'Insolvency & disqualified director search', detail: 'Complete for each individual applicant; save results to file. Consider any adverse findings within the overall credit assessment.' },
    ],
  },
  {
    n: '05', area: 'Credit & Corporate', title: 'Corporate Borrower Due Diligence',
    role: 'Underwriter', escalation: 'CRO — adverse findings',
    evidence: 'Companies House searches, UBO form, insolvency results',
    note: 'Corporate borrowers only — mark N/A for individual applicants.',
    items: [
      { id: '05.1', label: 'Companies House — director & company search', detail: 'Search for adverse information against the borrower as a director and any associated companies. Save results to file.' },
      { id: '05.2', label: 'Existing charges & debentures', detail: 'Confirm any registered charges / debentures against the borrowing entity — informs the priority of CredX\u2019s security position.' },
      { id: '05.3', label: 'UBO statement & company structure review', detail: 'Cross-reference the UBO statement and company structure form against Companies House. Reconcile discrepancies in writing, particularly holdings above 25% or unregistered directors.' },
      { id: '05.4', label: 'Borrower solicitor SRA check', detail: 'SRA checks for the borrower\u2019s solicitors. A minimum of 2 checks must be evidenced on file.' },
    ],
  },
  {
    n: '06', area: 'Property & Development', title: 'Property & Security Due Diligence',
    role: 'Underwriter', escalation: 'Credit Committee / CRO',
    evidence: 'Land registry, title plan, valuation report',
    items: [
      { id: '06.1', label: 'Land registry search & title plan', detail: 'Verify the seller is legal owner (purchase) or the borrower is registered proprietor (refinance). Without confirmed ownership the loan cannot complete.' },
      { id: '06.2', label: 'Planning permission review', detail: 'Investigate existing/active permissions, notices and approved drawings. Verify permission will not expire during the term if works are outstanding.' },
      { id: '06.3', label: 'Valuation report', detail: 'Instruct an approved panel valuer. Condition any issues as CP/CS, or refer serious concerns to the Credit Committee / CRO. Retain the report on file.' },
    ],
  },
  {
    n: '07', area: 'Property & Development', title: 'Development Loan Requirements',
    role: 'Underwriter', escalation: 'Credit Committee',
    evidence: 'Build docs, contractor search, developer CV',
    devOnly: true,
    items: [
      { id: '07.1', label: 'Main contractor & professional team search', detail: 'Internet searches on the main contractor and appointed professional team. Save results to file.' },
      { id: '07.2', label: 'Development documentation review', detail: 'Before instructing valuation: build-cost breakdown, cash-flow forecast, build programme, developer/borrower CV & track record, and evidence of contractor experience.' },
    ],
  },
  {
    n: '08', area: 'Structuring & Legal', title: 'Loan Structuring & Terms',
    role: 'Underwriter', escalation: 'CRO',
    evidence: 'Signed Heads of Terms',
    items: [
      { id: '08.1', label: 'Interest retention confirmation', detail: 'All CredX loans retain interest within the gross loan; serviced loans are not offered. Confirm the structure is reflected accurately across documentation and the HoTs.' },
      { id: '08.2', label: 'Heads of Terms preparation', detail: 'Produce the HoTs from the agreed parameters. Must be signed and returned by the borrower before instructing a solicitor. Retain the original signed copy on file.' },
    ],
  },
  {
    n: '09', area: 'Structuring & Legal', title: 'Legal Due Diligence',
    role: 'Underwriter + 2nd Underwriter', escalation: 'CRO',
    evidence: 'Security documents, Report on Title',
    items: [
      { id: '09.1', label: 'Solicitor instruction', detail: 'Instruct a CredX panel solicitor for legal due diligence. Where the client has no solicitor, instruct on a dual-representation basis.' },
      { id: '09.2', label: 'Security document review', detail: 'Check all legal security documents produced by CredX\u2019s solicitor against the Heads of Terms for accuracy and consistency.' },
      { id: '09.3', label: 'Dual representation — pre-population & cross-check', detail: 'On dual rep, the underwriter pre-populates all security documents and a second underwriter independently cross-checks before issue to the borrower.', secondUw: true },
      { id: '09.4', label: 'Report / Certificate on Title', detail: 'Obtain from CredX\u2019s solicitor before completion. Review, approve and save to file before any funds are released.' },
    ],
  },
  {
    n: '10', area: 'Completion', title: 'Pre-Completion Checks & Funds Release',
    role: 'Underwriter', escalation: 'CRO / CEO',
    evidence: 'Security-call recording, signed file check',
    items: [
      { id: '10.1', label: 'Security call with borrower', detail: 'Online Teams call directly with the borrower before releasing funds. Covers GDPR confirmation, loan purpose, amount borrowed and term. Recorded and saved to the borrower\u2019s file.', isCall: true },
      { id: '10.2', label: 'File sign-off by CRO / CEO', detail: 'Full file check formally signed off by the CRO or CEO before any funds transfer from the investor to the borrower. The final control gate before completion.', isSignoff: true },
    ],
  },
];

// People (for owner assignment, sign-offs and audit trail).
const UW_PEOPLE = {
  underwriters: ['Priya Shah', 'Daniel Okafor', 'Nimit Kaur'],
  secondUw: ['Aisha Khan', 'Priya Shah'],
  cro: 'Marcus Vale',
  ceo: 'Helena Crest',
};

// Item states.
const UW_ITEM_STATES = {
  outstanding: { label: 'Outstanding', short: 'Outstanding', tone: 'idle' },
  progress:    { label: 'In progress', short: 'In progress', tone: 'progress' },
  satisfied:   { label: 'Satisfied', short: 'Satisfied', tone: 'ok' },
  na:          { label: 'Not applicable', short: 'N/A', tone: 'muted' },
  escalated:   { label: 'Escalated to CRO', short: 'Escalated', tone: 'danger' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function uwStagesFor(loanType) {
  return UW_STAGES.filter(s => !s.devOnly || loanType === 'Development');
}
function uwAllItems(loanType) {
  return uwStagesFor(loanType).flatMap(s => s.items.map(it => ({ ...it, stage: s.n, area: s.area })));
}
function uwItemState(c, id) { return (c.items && c.items[id] && c.items[id].state) || 'outstanding'; }
function uwIsDone(state) { return state === 'satisfied' || state === 'na'; }

function uwProgress(c) {
  const all = uwAllItems(c.loanType);
  let done = 0, escalated = 0, outstanding = 0;
  all.forEach(it => {
    const st = uwItemState(c, it.id);
    if (uwIsDone(st)) done++;
    else if (st === 'escalated') { escalated++; outstanding++; }
    else outstanding++;
  });
  const total = all.length;
  return { done, total, outstanding, escalated, pct: total ? Math.round((done / total) * 100) : 0 };
}

// Current stage = first stage with any not-done item; null when all complete.
function uwCurrentStage(c) {
  const stages = uwStagesFor(c.loanType);
  for (const s of stages) {
    if (s.items.some(it => !uwIsDone(uwItemState(c, it.id)))) return s;
  }
  return null;
}
function uwStageState(c, stage) {
  const items = stage.items;
  const doneCount = items.filter(it => uwIsDone(uwItemState(c, it.id))).length;
  if (doneCount === items.length) return 'done';
  if (items.some(it => uwItemState(c, it.id) === 'escalated')) return 'escalated';
  const cur = uwCurrentStage(c);
  if (cur && cur.n === stage.n) return 'current';
  if (doneCount > 0) return 'current';
  return 'todo';
}

// Status badge derivation for a case.
function uwCaseStatus(c) {
  if (c.completed) return 'Completed';
  if (c.onHold) return 'On hold';
  const p = uwProgress(c);
  if (p.escalated > 0) return 'Escalated';
  const cur = uwCurrentStage(c);
  if (!cur) return 'Ready to complete';
  if (cur.n === '10') return 'Awaiting sign-off';
  return 'In underwriting';
}
function uwStatusTone(status) {
  return ({
    'Completed': 'ok', 'In underwriting': 'progress', 'Escalated': 'danger',
    'Awaiting sign-off': 'amber', 'Ready to complete': 'amber', 'On hold': 'muted',
  })[status] || 'idle';
}

const uwHelpers = {
  uwStagesFor, uwAllItems, uwItemState, uwIsDone, uwProgress,
  uwCurrentStage, uwStageState, uwCaseStatus, uwStatusTone,
};

// ── Case store (localStorage-backed, subscribe pattern like the bridge) ───────
const UW_KEY = 'credx-uw-cases-v1';
(function () {
  let cases = null;
  const subs = new Set();
  const emit = () => subs.forEach(fn => { try { fn(); } catch (e) {} });
  const persist = () => { try { localStorage.setItem(UW_KEY, JSON.stringify(cases)); } catch (e) {} };
  const load = () => {
    try { const j = JSON.parse(localStorage.getItem(UW_KEY)); if (j && Array.isArray(j)) return j; } catch (e) {}
    return null;
  };

  function ensure() {
    if (cases) return;
    cases = load();
    if (!cases) { cases = seedCases(); persist(); }
  }

  const api = {
    getAll() { ensure(); return cases.slice(); },
    get(loanRef) { ensure(); return cases.find(c => c.ref === loanRef || c.loanId === loanRef) || null; },
    save(c) {
      ensure();
      const i = cases.findIndex(x => x.ref === c.ref);
      if (i >= 0) cases[i] = c; else cases.push(c);
      persist(); emit();
    },
    update(ref, patch) {
      ensure();
      const c = cases.find(x => x.ref === ref); if (!c) return;
      Object.assign(c, typeof patch === 'function' ? patch(c) : patch);
      persist(); emit();
    },
    setItem(ref, itemId, patch) {
      ensure();
      const c = cases.find(x => x.ref === ref); if (!c) return;
      c.items = c.items || {};
      c.items[itemId] = Object.assign({}, c.items[itemId], patch);
      persist(); emit();
    },
    reset() { cases = seedCases(); persist(); emit(); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
  window.CredXCases = api;
})();

// Build seed cases spread across stages (incl. a development loan, a sign-off
// gate, an escalation and a completed loan for post-completion management).
function seedCases() {
  const today = new Date('2026-06-03');
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (base, n) => { const d = new Date(base); d.setDate(d.getDate() + n); return iso(d); };
  const sat = (by, day) => ({ state: 'satisfied', by, date: day });
  // helper to satisfy a run of item ids
  const satisfyAll = (ids, by, day, docs) => {
    const o = {};
    ids.forEach(id => { o[id] = { state: 'satisfied', by, date: day, docs: docs && docs[id] ? docs[id] : undefined }; });
    return o;
  };

  // CASE 1 — Ryan Lee (links CXP-530), bridging, at Property/Valuation stage.
  const c1items = {
    ...satisfyAll(['01.1', '01.2', '01.3'], 'Priya Shah', addDays(today, -18)),
    ...satisfyAll(['02.1', '02.2'], 'Priya Shah', addDays(today, -17)),
    ...satisfyAll(['03.1', '03.2', '03.3', '03.4', '03.5'], 'Priya Shah', addDays(today, -14)),
    ...satisfyAll(['04.1', '04.2', '04.3', '04.4'], 'Priya Shah', addDays(today, -10)),
    '05.1': { state: 'na', by: 'Priya Shah', date: addDays(today, -10), note: 'Individual applicant — no corporate borrower.' },
    '05.2': { state: 'na', by: 'Priya Shah', date: addDays(today, -10) },
    '05.3': { state: 'na', by: 'Priya Shah', date: addDays(today, -10) },
    '05.4': { state: 'satisfied', by: 'Priya Shah', date: addDays(today, -8) },
    '06.1': { state: 'satisfied', by: 'Priya Shah', date: addDays(today, -4), docs: [{ name: 'Title Register TT184552.pdf', kind: 'Title', date: addDays(today, -4), by: 'Priya Shah' }] },
    '06.2': { state: 'na', by: 'Priya Shah', date: addDays(today, -4), note: 'No works — straight refinance.' },
    '06.3': { state: 'progress', by: 'Priya Shah', date: addDays(today, -2), note: 'Panel valuer instructed (Beresford Surveyors) — report due 05 Jun.' },
  };

  // CASE 2 — Pawandeep Kaur Duggal (links CXP-534), bridging, early AML, escalation.
  const c2items = {
    ...satisfyAll(['01.1', '01.2', '01.3'], 'Daniel Okafor', addDays(today, -6)),
    ...satisfyAll(['02.1', '02.2'], 'Daniel Okafor', addDays(today, -5)),
    '03.1': { state: 'satisfied', by: 'Daniel Okafor', date: addDays(today, -4) },
    '03.2': { state: 'satisfied', by: 'Daniel Okafor', date: addDays(today, -4), docs: [{ name: 'Passport — certified.pdf', kind: 'ID', date: addDays(today, -4), by: 'Daniel Okafor' }] },
    '03.3': { state: 'satisfied', by: 'Daniel Okafor', date: addDays(today, -3) },
    '03.4': { state: 'progress', by: 'Daniel Okafor', date: addDays(today, -2), note: 'Awaiting AML certificate from appointed solicitor.' },
    '03.5': { state: 'escalated', by: 'Daniel Okafor', date: addDays(today, -1), note: 'Large unexplained deposit on bank statement — source of funds query raised to CRO.' },
  };

  // CASE 3 — Maple Court Developments Ltd, development, legal stage, 2nd UW engaged.
  const c3items = {
    ...satisfyAll(['01.1', '01.2', '01.3', '02.1', '02.2'], 'Priya Shah', addDays(today, -40)),
    ...satisfyAll(['03.1', '03.2', '03.3', '03.4', '03.5'], 'Priya Shah', addDays(today, -34)),
    ...satisfyAll(['04.1', '04.2', '04.3', '04.4'], 'Priya Shah', addDays(today, -30)),
    ...satisfyAll(['05.1', '05.2', '05.3', '05.4'], 'Priya Shah', addDays(today, -26)),
    ...satisfyAll(['06.1', '06.2', '06.3'], 'Priya Shah', addDays(today, -18)),
    ...satisfyAll(['07.1', '07.2'], 'Priya Shah', addDays(today, -16)),
    ...satisfyAll(['08.1', '08.2'], 'Priya Shah', addDays(today, -10)),
    '09.1': { state: 'satisfied', by: 'Priya Shah', date: addDays(today, -7) },
    '09.2': { state: 'satisfied', by: 'Priya Shah', date: addDays(today, -4) },
    '09.3': { state: 'progress', by: 'Aisha Khan', date: addDays(today, -1), note: '2nd underwriter cross-check of pre-populated security documents in progress.' },
    '09.4': { state: 'outstanding' },
  };

  // CASE 4 — Harlow Retail Ltd, commercial bridging, AT the sign-off gate.
  const c4items = {
    ...satisfyAll(['01.1', '01.2', '01.3', '02.1', '02.2'], 'Nimit Kaur', addDays(today, -28)),
    ...satisfyAll(['03.1', '03.2', '03.3', '03.4', '03.5'], 'Nimit Kaur', addDays(today, -24)),
    ...satisfyAll(['04.1', '04.2', '04.3', '04.4'], 'Nimit Kaur', addDays(today, -20)),
    ...satisfyAll(['05.1', '05.2', '05.3', '05.4'], 'Nimit Kaur', addDays(today, -18)),
    ...satisfyAll(['06.1', '06.2', '06.3'], 'Nimit Kaur', addDays(today, -12)),
    ...satisfyAll(['08.1', '08.2'], 'Nimit Kaur', addDays(today, -8)),
    ...satisfyAll(['09.1', '09.2', '09.3', '09.4'], 'Nimit Kaur', addDays(today, -4)),
    '10.1': { state: 'satisfied', by: 'Nimit Kaur', date: addDays(today, -1), note: 'Security call completed via Teams — recording saved to file.', call: { done: true, date: addDays(today, -1), covers: ['GDPR', 'Purpose', 'Amount', 'Term'] } },
    '10.2': { state: 'outstanding' },
  };

  // CASE 5 — Nicholas David Thomas (links CXP-522), COMPLETED — post-completion mgmt.
  const c5items = {};
  uwAllItems('Bridging').forEach(it => { c5items[it.id] = { state: 'satisfied', by: 'Priya Shah', date: addDays(today, -120) }; });
  c5items['05.1'] = c5items['05.2'] = c5items['05.3'] = { state: 'na', by: 'Priya Shah', date: addDays(today, -120) };

  return [
    {
      ref: 'UW-2401', loanId: 'CXP-530', borrower: 'Ryan Lee', entity: 'Individual',
      loanType: 'Bridging', purpose: 'Capital raise — refinance', gross: 216000, security: 'Residential property, Maidstone',
      owner: 'Priya Shah', opened: addDays(today, -18), target: addDays(today, 6),
      items: c1items, conditions: [], escalations: [], contactLog: [], variations: [],
    },
    {
      ref: 'UW-2402', loanId: 'CXP-534', borrower: 'Pawandeep Kaur Duggal', entity: 'Individual',
      loanType: 'Bridging', purpose: 'Bridging — onward purchase', gross: 163144, security: 'Residential property, Slough',
      owner: 'Daniel Okafor', opened: addDays(today, -6), target: addDays(today, 18),
      items: c2items,
      conditions: [],
      escalations: [{ id: 'esc-1', itemId: '03.5', reason: 'Large unexplained deposit on bank statement — source of funds query.', raisedBy: 'Daniel Okafor', date: addDays(today, -1), status: 'open' }],
      contactLog: [], variations: [],
    },
    {
      ref: 'UW-2403', loanId: null, borrower: 'Maple Court Developments Ltd', entity: 'Limited company',
      loanType: 'Development', purpose: 'Ground-up residential development', gross: 1240000, security: 'Development site, Chelmsford',
      owner: 'Priya Shah', secondUw: 'Aisha Khan', opened: addDays(today, -40), target: addDays(today, 9),
      items: c3items,
      conditions: [{ id: 'cp-1', type: 'CP', text: 'Building Regulations approval to be evidenced prior to first drawdown.', due: addDays(today, 9), status: 'open' }],
      escalations: [], contactLog: [], variations: [],
    },
    {
      ref: 'UW-2404', loanId: null, borrower: 'Harlow Retail Ltd', entity: 'Limited company',
      loanType: 'Bridging', purpose: 'Commercial bridging — refinance', gross: 540000, security: '4 retail units + 2 flats, Ashford',
      owner: 'Nimit Kaur', opened: addDays(today, -28), target: addDays(today, 2),
      items: c4items,
      conditions: [{ id: 'cp-2', type: 'CP', text: 'Buildings insurance with CredX noted as first loss payee.', due: addDays(today, 1), status: 'satisfied', satisfiedDate: addDays(today, -1) }],
      escalations: [], contactLog: [], variations: [],
    },
    {
      ref: 'UW-2390', loanId: 'CXP-522', borrower: 'Nicholas David Thomas', entity: 'Individual',
      loanType: 'Bridging', purpose: 'Bridging — refurbishment exit', gross: 480832, security: 'Residential property, Tunbridge Wells',
      owner: 'Priya Shah', opened: addDays(today, -126), target: addDays(today, -118),
      completed: true, completedDate: addDays(today, -118),
      items: c5items,
      conditions: [
        { id: 'cs-1', type: 'CS', text: 'Updated schedule of works to be provided within 30 days of completion.', due: addDays(today, -88), status: 'satisfied', satisfiedDate: addDays(today, -90) },
        { id: 'cs-2', type: 'CS', text: 'Quarterly site inspection photographs.', due: addDays(today, 4), status: 'open' },
      ],
      escalations: [],
      contactLog: [
        { id: 'cl-1', date: addDays(today, -110), by: 'Priya Shah', channel: 'Call', note: 'Welcome call — confirmed drawdown received and first works underway.' },
        { id: 'cl-2', date: addDays(today, -40), by: 'Daniel Okafor', channel: 'Email', note: 'Borrower confirmed refurbishment on schedule; redemption via refinance anticipated on term.' },
      ],
      variations: [],
    },
  ];
}

Object.assign(window, { UW_STAGES, UW_AREAS, UW_PEOPLE, UW_ITEM_STATES, uwHelpers });
