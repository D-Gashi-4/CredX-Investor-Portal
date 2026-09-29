// CredX — CRM store: organisations we deal with and the people inside them.
// Panel firms (brokers, solicitors, surveyors, banks, auditors, accountants,
// insurers, packagers, agents, compliance advisers) are held here outright.
// Borrowers and investors are MIRRORED from the loan book / investor register:
// they appear in the CRM read-only until something is written against them
// (activity, next action, rating), at which point ensureMirror() materialises a
// stored record linked back to the source by mirror = { kind, ref }.
//
// Exposes window.CredXCRM — all / byType / get / add / update / remove /
// logActivity / followUps / ensureMirror / subscribe / reset
(function () {
  const KEY = 'credx-crm-v2';   // v2: relationship lifecycle statuses (Prospective / Onboarded / Active)
  const subs = new Set();

  const TYPES = [
    { key: 'broker',     label: 'Brokers / introducers', short: 'Broker' },
    { key: 'solicitor',  label: 'Solicitors',            short: 'Solicitor' },
    { key: 'surveyor',   label: 'Surveyors / valuers',   short: 'Surveyor' },
    { key: 'bank',       label: 'Banks / lenders',       short: 'Bank' },
    { key: 'auditor',    label: 'Auditors',              short: 'Auditor' },
    { key: 'accountant', label: 'Accountants',           short: 'Accountant' },
    { key: 'insurer',    label: 'Insurers',              short: 'Insurer' },
    { key: 'packager',   label: 'Packagers',             short: 'Packager' },
    { key: 'agent',      label: 'Estate agents',         short: 'Agent' },
    { key: 'compliance', label: 'Compliance advisers',   short: 'Compliance' },
    { key: 'borrower',   label: 'Borrowers',             short: 'Borrower' },
    { key: 'investor',   label: 'Investors',             short: 'Investor' }
  ];
  const STATUSES = ['Prospective', 'Onboarded', 'Active'];
  // Statuses were Approved / Pending / Off-panel before the relationship
  // lifecycle was settled — migrate any records already in local storage.
  const STATUS_MIGRATION = { 'Approved': 'Active', 'Pending': 'Prospective', 'Off-panel': 'Prospective' };
  const ACTIVITY_KINDS = ['Call', 'Email', 'Meeting', 'Note'];

  const d = (offset) => { const t = new Date(); t.setDate(t.getDate() + offset); return t.toISOString().slice(0, 10); };
  const uid = () => 'crm-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e4).toString(36);

  const blank = () => ({
    id: '', type: 'broker', org: '', status: 'Prospective', rating: 0,
    contacts: [], regRefs: [], feeTerms: '', commissionPct: null,
    coverage: [], bank: { name: '', sortCode: '', account: '' },
    docs: [], activity: [], nextAction: { what: '', due: '' },
    notes: '', mirror: null, createdAt: d(0),
    // record-card fields (LAMS contact layout)
    reference: '', address: '', postcode: '', companyReg: '',
    telephone: '', mobile: '', email: '', website: '', memo: '',
    managedBy: '', dob: '', nationality: '', preferred: false, updatedAt: ''
  });

  // Stable 8-digit reference derived from the record id, so every record
  // carries one without a counter to keep in sync.
  function refFor(id) {
    let h = 0;
    const s = String(id || '');
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000000;
    return String(10000000 + (h % 89999999));
  }

  function norm(r) {
    const b = blank();
    const rec = Object.assign(b, r || {});
    rec.contacts = (rec.contacts || []).map(c => Object.assign({ name: '', role: '', email: '', phone: '', mobile: '', dob: '', nationality: '', notes: '' }, c));
    if (!rec.reference) rec.reference = refFor(rec.id || rec.org);
    const c0 = rec.contacts[0];
    if (!rec.telephone && c0) rec.telephone = c0.phone || '';
    if (!rec.email && c0) rec.email = c0.email || '';
    rec.preferred = !!rec.preferred;
    rec.regRefs = (rec.regRefs || []).map(x => Object.assign({ label: '', value: '' }, x));
    rec.bank = Object.assign({ name: '', sortCode: '', account: '' }, rec.bank || {});
    rec.nextAction = Object.assign({ what: '', due: '' }, rec.nextAction || {});
    rec.docs = (rec.docs || []).map(x => Object.assign({ name: '', date: '' }, x));
    rec.activity = (rec.activity || []).map(x => Object.assign({ date: d(0), kind: 'Note', note: '', by: 'WJ' }, x));
    rec.coverage = rec.coverage || [];
    if (STATUS_MIGRATION[rec.status]) rec.status = STATUS_MIGRATION[rec.status];
    return rec;
  }

  function seed() {
    const R = (o) => norm(Object.assign({ id: uid() }, o));
    return [
      R({ type: 'broker', org: 'Credcorp Ltd', status: 'Active', rating: 5, commissionPct: 1.0,
        feeTerms: '1.00% of gross, paid on completion from the drawdown.',
        coverage: ['London', 'South East', 'Residential bridging'],
        contacts: [{ name: 'Simmy Singh', role: 'Director', email: 'simmy@credcorp.co.uk', phone: '07360 006807' },
                   { name: 'Dev Patel', role: 'Case manager', email: 'cases@credcorp.co.uk', phone: '0204 628 0991' }],
        regRefs: [{ label: 'FCA (AR)', value: '921456' }],
        bank: { name: 'Credcorp Ltd', sortCode: '20-45-77', account: '4013 8892' },
        docs: [{ name: 'Introducer terms of business', date: d(-320) }, { name: 'AML questionnaire', date: d(-180) }],
        nextAction: { what: 'Quarterly pipeline review call', due: d(6) },
        activity: [{ date: d(-4), kind: 'Call', note: 'Two Dartford bridges coming in August; both refinance exits.', by: 'WJ' },
                   { date: d(-31), kind: 'Meeting', note: 'Terms of business refreshed, commission held at 1.00%.', by: 'WJ' }],
        notes: 'Largest single source of introduced volume. Wants same-day DIPs.' }),
      R({ type: 'broker', org: 'Bridging Direct', status: 'Active', rating: 4, commissionPct: 1.5,
        feeTerms: '1.50% of gross. Invoices separately, paid on completion.',
        coverage: ['National', 'Commercial'],
        contacts: [{ name: 'Laura Kemp', role: 'Head of lending', email: 'laura@bridgingdirect.co.uk', phone: '0161 244 8890' }],
        regRefs: [{ label: 'FCA', value: '674211' }],
        nextAction: { what: 'Chase signed 2026 terms of business', due: d(-2) },
        activity: [{ date: d(-9), kind: 'Email', note: 'Sent updated 2026 terms of business for signature.', by: 'WJ' }] }),
      R({ type: 'broker', org: 'Y3S Bridging Loans', status: 'Active', rating: 3, commissionPct: 1.0,
        feeTerms: '1.00% of gross.', coverage: ['Wales', 'South West'],
        contacts: [{ name: 'Owen Hughes', role: 'Broker', email: 'owen@y3s.example', phone: '029 2000 1188' }] }),
      R({ type: 'broker', org: 'Brightstar Financial', status: 'Active', rating: 4, commissionPct: 1.25,
        feeTerms: '1.25% of gross.', coverage: ['National', 'Specialist residential'],
        contacts: [{ name: 'Priya Nandra', role: 'Senior packager', email: 'priya@brightstar.example', phone: '01277 500 900' }] }),
      R({ type: 'broker', org: 'Enness Global', status: 'Prospective', rating: 3, commissionPct: 1.5,
        feeTerms: '1.50% of gross — terms not yet countersigned.',
        coverage: ['High net worth', 'London prime'],
        contacts: [{ name: 'Marcus Deane', role: 'Associate director', email: 'marcus@enness.example', phone: '020 3758 9222' }],
        nextAction: { what: 'Complete onboarding pack before first case', due: d(12) } }),
      R({ type: 'broker', org: 'Hank Zarihs Associates', status: 'Onboarded', rating: 3, commissionPct: 0.75,
        feeTerms: '0.75% of gross.', coverage: ['Development finance'],
        contacts: [{ name: 'Aisha Rahman', role: 'Broker', email: 'aisha@hza.example', phone: '020 3900 4455' }] }),

      R({ type: 'solicitor', org: 'Ashfords LLP', status: 'Active', rating: 5,
        feeTerms: "Lender's fee scale: £1,450 + VAT to £500k, £1,950 + VAT above.",
        coverage: ['Security & charge work', 'England & Wales'],
        contacts: [{ name: 'Helen Marsh', role: 'Partner, real estate finance', email: 'h.marsh@ashfords.example', phone: '0117 321 8000' }],
        regRefs: [{ label: 'SRA', value: '447040' }],
        docs: [{ name: 'Engagement letter', date: d(-410) }, { name: 'PI cover certificate', date: d(-95) }],
        activity: [{ date: d(-6), kind: 'Call', note: 'CXP-522 charge registered; TR1 lodged with HMLR.', by: 'WJ' }],
        notes: 'Default choice for our side on residential security.' }),
      R({ type: 'solicitor', org: 'Knight & Partners', status: 'Onboarded', rating: 4,
        feeTerms: 'Fixed £1,250 + VAT per standard charge.',
        coverage: ['Kent', 'Residential'],
        contacts: [{ name: 'Tom Brady', role: 'Solicitor', email: 't.brady@knightpartners.example', phone: '01634 220 110' }],
        regRefs: [{ label: 'SRA', value: '512889' }] }),
      R({ type: 'solicitor', org: 'Brecher LLP', status: 'Onboarded', rating: 4,
        feeTerms: 'Hourly, capped per matter by agreement.',
        coverage: ['London', 'Commercial security'],
        contacts: [{ name: 'Ravi Sharma', role: 'Partner', email: 'r.sharma@brecher.example', phone: '020 7563 9500' }],
        regRefs: [{ label: 'SRA', value: '392011' }],
        nextAction: { what: 'Refresh panel appointment letter', due: d(21) } }),
      R({ type: 'solicitor', org: 'Memery Crystal', status: 'Prospective', rating: 3,
        feeTerms: 'Quoted per matter.', coverage: ['London', 'Corporate'],
        contacts: [{ name: 'Claire Dunn', role: 'Senior associate', email: 'c.dunn@memery.example', phone: '020 7242 5905' }],
        regRefs: [{ label: 'SRA', value: '118222' }] }),

      R({ type: 'surveyor', org: 'Marshall Property Surveys', status: 'Active', rating: 5,
        feeTerms: '£650 + VAT residential up to £750k; drive-by £395 + VAT.',
        coverage: ['Kent', 'South East', 'Residential'],
        contacts: [{ name: 'Greg Marshall', role: 'MRICS, principal', email: 'greg@marshallsurveys.example', phone: '01322 470 900' }],
        regRefs: [{ label: 'RICS', value: '0088471' }],
        docs: [{ name: 'PI cover certificate', date: d(-60) }, { name: 'Panel agreement', date: d(-300) }],
        activity: [{ date: d(-13), kind: 'Email', note: 'Turnaround now 4 working days for drive-by inspections.', by: 'WJ' }] }),
      R({ type: 'surveyor', org: 'Cushman & Wakefield', status: 'Active', rating: 4,
        feeTerms: 'Quoted per instruction; commercial only.',
        coverage: ['National', 'Commercial', 'Semi-commercial'],
        contacts: [{ name: 'Neil Osborne', role: 'MRICS, valuation', email: 'neil.osborne@cw.example', phone: '020 3296 3000' }],
        regRefs: [{ label: 'RICS', value: '0021990' }] }),
      R({ type: 'surveyor', org: 'Knight Frank', status: 'Onboarded', rating: 4,
        feeTerms: 'Quoted per instruction.', coverage: ['London prime', 'Development'],
        contacts: [{ name: 'Sophie Ellery', role: 'Valuation partner', email: 's.ellery@knightfrank.example', phone: '020 7629 8171' }],
        regRefs: [{ label: 'RICS', value: '0033120' }] }),
      R({ type: 'surveyor', org: 'Carter Jonas', status: 'Prospective', rating: 3,
        feeTerms: 'Panel rates under negotiation.', coverage: ['Midlands', 'Rural'],
        contacts: [{ name: 'James Rowe', role: 'MRICS', email: 'james.rowe@carterjonas.example', phone: '0121 306 0300' }],
        nextAction: { what: 'Agree panel fee scale', due: d(9) } }),

      R({ type: 'bank', org: 'Barclays Business Banking', status: 'Active', rating: 4,
        feeTerms: 'Client money and operating accounts. No facility in place.',
        coverage: ['Operating account', 'Client account'],
        contacts: [{ name: 'Denise Clark', role: 'Relationship manager', email: 'denise.clark@barclays.example', phone: '0345 605 2345' }],
        bank: { name: 'CredX Ltd — operating', sortCode: '20-45-77', account: '7712 4408' },
        activity: [{ date: d(-22), kind: 'Meeting', note: 'Reviewed transaction monitoring flags on investor inflows.', by: 'WJ' }] }),
      R({ type: 'bank', org: 'Shawbrook Bank', status: 'Prospective', rating: 3,
        feeTerms: 'Exploring a senior facility to sit behind the book.',
        coverage: ['Wholesale funding'],
        contacts: [{ name: 'Paul Egerton', role: 'Director, specialist finance', email: 'paul.egerton@shawbrook.example', phone: '0345 850 5555' }],
        nextAction: { what: 'Send book performance pack for credit review', due: d(3) } }),

      R({ type: 'auditor', org: 'Haines Watts', status: 'Active', rating: 4,
        feeTerms: 'Statutory audit £14,500 + VAT per annum.',
        coverage: ['Statutory audit', 'Year end 31 March'],
        contacts: [{ name: 'Elaine Foster', role: 'Audit partner', email: 'elaine.foster@hw.example', phone: '020 7025 4600' }],
        regRefs: [{ label: 'ICAEW', value: 'C004239812' }],
        docs: [{ name: 'Audit engagement letter FY26', date: d(-140) }],
        nextAction: { what: 'Provide loan book reconciliation for FY26 audit', due: d(17) } }),
      R({ type: 'accountant', org: 'Wain & Co Accountants', status: 'Active', rating: 5,
        feeTerms: 'Monthly bookkeeping and management accounts, £850 + VAT pcm.',
        coverage: ['Management accounts', 'VAT', 'Payroll'],
        contacts: [{ name: 'Michael Wain', role: 'Principal', email: 'michael@wainco.example', phone: '01322 555 120' }],
        regRefs: [{ label: 'ICAEW', value: 'C001887420' }],
        activity: [{ date: d(-2), kind: 'Email', note: 'July management accounts issued; interest income reconciled to the book.', by: 'WJ' }] }),
      R({ type: 'insurer', org: 'Gallagher Insurance Brokers', status: 'Active', rating: 4,
        feeTerms: 'PI and D&O placement; commission taken from insurer.',
        coverage: ['Professional indemnity', 'D&O', 'Property owners'],
        contacts: [{ name: 'Kirsty Doyle', role: 'Account executive', email: 'kirsty.doyle@ajg.example', phone: '0121 233 1000' }],
        docs: [{ name: 'PI schedule 2026/27', date: d(-75) }],
        nextAction: { what: 'Renewal terms for PI cover', due: d(28) } }),
      R({ type: 'packager', org: 'Pilot Fish Finance', status: 'Onboarded', rating: 3,
        feeTerms: 'Packaging fee retained from borrower, no CredX commission.',
        coverage: ['Residential bridging', 'Second charge'],
        contacts: [{ name: 'Danny Cole', role: 'Packaging manager', email: 'danny@pilotfish.example', phone: '0203 700 8811' }] }),
      R({ type: 'agent', org: 'Sealey & Sons', status: 'Onboarded', rating: 4,
        feeTerms: 'Sales and LPA receiver disposals, 1.25% + VAT.',
        coverage: ['Dartford', 'Gravesend', 'Residential sales'],
        contacts: [{ name: 'Rob Sealey', role: 'Director', email: 'rob@sealeyandsons.example', phone: '01322 220 445' }],
        notes: 'Used for exit valuations and forced-sale opinions.' }),
      R({ type: 'compliance', org: 'Thistle Compliance', status: 'Active', rating: 4,
        feeTerms: 'Retained advisory, £1,200 + VAT per quarter.',
        coverage: ['AML', 'Financial promotions', 'Appropriateness testing'],
        contacts: [{ name: 'Fiona Bell', role: 'Compliance consultant', email: 'fiona@thistlecompliance.example', phone: '0131 555 8020' }],
        nextAction: { what: 'Sign off investor appropriateness test wording', due: d(1) },
        activity: [{ date: d(-8), kind: 'Meeting', note: 'Reviewed the investor portal knowledge test and risk warnings.', by: 'WJ' }] })
    ];
  }

  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(j)) return j.map(norm); } catch (e) {}
    const s = seed();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  let store = load();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
  const emit = () => subs.forEach(fn => { try { fn(); } catch (e) {} });

  window.CredXCRM = {
    TYPES, STATUSES, ACTIVITY_KINDS, refFor,
    typeLabel(key) { const t = TYPES.find(x => x.key === key); return t ? t.label : key; },
    typeShort(key) { const t = TYPES.find(x => x.key === key); return t ? t.short : key; },
    all() { return store.map(r => Object.assign({}, r)); },
    byType(type) { return store.filter(r => r.type === type).map(r => Object.assign({}, r)); },
    get(id) { const r = store.find(x => x.id === id); return r ? Object.assign({}, r) : null; },
    add(rec) {
      const r = norm(Object.assign({}, rec, { id: uid(), createdAt: d(0) }));
      store = store.concat(r); persist(); emit();
      return r;
    },
    update(id, patch) {
      store = store.map(r => r.id === id
        ? norm(Object.assign({}, r, patch, { updatedAt: d(0) })) : r);
      persist(); emit();
    },
    remove(id) { store = store.filter(r => r.id !== id); persist(); emit(); },
    logActivity(id, entry) {
      store = store.map(r => r.id === id
        ? norm(Object.assign({}, r, { activity: [Object.assign({ date: d(0), by: 'WJ' }, entry)].concat(r.activity || []) }))
        : r);
      persist(); emit();
    },
    // Materialise a stored record for a mirrored borrower/investor the first
    // time anything is written against it. Returns the stored record.
    ensureMirror(seedRec) {
      const m = seedRec && seedRec.mirror;
      if (!m) return null;
      const found = store.find(r => r.mirror && r.mirror.kind === m.kind && r.mirror.ref === m.ref);
      if (found) return Object.assign({}, found);
      return this.add(Object.assign({}, seedRec, { id: undefined }));
    },
    mirrorOf(kind, ref) {
      const r = store.find(x => x.mirror && x.mirror.kind === kind && x.mirror.ref === ref);
      return r ? Object.assign({}, r) : null;
    },
    // Open next actions, soonest first — feeds the dashboard Alerts badge.
    followUps() {
      const today = d(0);
      return store
        .filter(r => r.nextAction && r.nextAction.what && r.nextAction.due)
        .map(r => ({
          id: r.id, org: r.org, type: r.type,
          what: r.nextAction.what, due: r.nextAction.due,
          overdue: r.nextAction.due < today
        }))
        .sort((a, b) => a.due.localeCompare(b.due));
    },
    clearNextAction(id) { this.update(id, { nextAction: { what: '', due: '' } }); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    reset() { store = seed(); persist(); emit(); }
  };
})();
