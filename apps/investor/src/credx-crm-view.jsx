// CredX — CRM view: one register of every organisation we deal with, with type
// tabs across the top. Panel firms are stored in CredXCRM; borrowers and
// investors are mirrored in from the loan book and investor register.
// Exposes window.CRMView plus the wizard pickers (CrmBorrowerPicker,
// CrmBrokerPicker) so a DIP can only name a borrower/broker held in the CRM.

const CRM_TYPE_TABS = () => (window.CredXCRM ? window.CredXCRM.TYPES : []);

// ---- mirrored records: borrowers from the loan book, investors from the register ----
function crmMirrors(data) {
  const out = [];
  const loans = data.LOANS || [];
  const byBorrower = new Map();
  loans.forEach(l => {
    const key = (l.borrower || '').trim();
    if (!key) return;
    if (!byBorrower.has(key)) byBorrower.set(key, []);
    byBorrower.get(key).push(l);
  });
  byBorrower.forEach((ls, name) => {
    const doc = (ls.find(l => l.dipDoc) || {}).dipDoc || {};
    const stored = window.CredXCRM.mirrorOf('borrower', name);
    out.push(stored || {
      id: 'mir:borrower:' + name, type: 'borrower', org: name, status: '', rating: 0,
      reference: window.CredXCRM.refFor('mir:borrower:' + name),
      contacts: [{ name: doc.contact || '', role: 'Borrower contact', email: doc.email || '', phone: doc.phone || '' }]
        .filter(c => c.name || c.email || c.phone),
      regRefs: doc.companyReg ? [{ label: 'Company reg', value: doc.companyReg }] : [],
      feeTerms: '', coverage: [], bank: { name: '', sortCode: '', account: '' }, docs: [],
      activity: [], nextAction: { what: '', due: '' }, notes: '',
      mirror: { kind: 'borrower', ref: name }, _readOnly: true
    });
  });
  (data.INVESTORS || []).forEach(i => {
    const stored = window.CredXCRM.mirrorOf('investor', i.ref);
    out.push(stored || {
      id: 'mir:investor:' + i.ref, type: 'investor', org: i.name, status: '', rating: 0,
      reference: window.CredXCRM.refFor('mir:investor:' + i.ref),
      telephone: i.phone || '', email: i.email || '',
      contacts: [{ name: i.contact || i.name, role: 'Investor', email: i.email || '', phone: i.phone || '' }],
      regRefs: [{ label: 'Investor ref', value: i.ref }],
      feeTerms: '',
      coverage: [], bank: { name: '', sortCode: '', account: '' }, docs: [],
      activity: [], nextAction: { what: '', due: '' }, notes: '',
      mirror: { kind: 'investor', ref: i.ref }, _readOnly: true
    });
  });
  return out;
}

function crmAllRecords(data) {
  const stored = window.CredXCRM.all().filter(r => !r.mirror);
  return stored.concat(crmMirrors(data));
}

// Loans introduced by a broker / borrowed by a borrower.
function crmLinkedLoans(rec, data) {
  const loans = data.LOANS || [];
  if (rec.type === 'broker') {
    return loans.filter(l => {
      const b = l.introducer || (l.dipDoc && l.dipDoc.broker) || '';
      return b === rec.org || (l.notes || '').includes('via ' + rec.org);
    });
  }
  if (rec.type === 'borrower') return loans.filter(l => (l.borrower || '') === rec.org);
  if (rec.type === 'surveyor') {
    return loans.filter(l => (l.surveyor || (l.dipDoc && l.dipDoc.surveyor) || '') === rec.org);
  }
  return [];
}

function crmBrokerStats(rec, data) {
  const ls = crmLinkedLoans(rec, data);
  const completed = ls.filter(l => l.status === 'Active' || l.status === 'Redeemed');
  const volume = ls.reduce((s, l) => s + (l.grossLoan || 0), 0);
  const commission = ls.reduce((s, l) => s + (l.introFee || 0), 0);
  return {
    deals: ls.length, completed: completed.length, volume, commission,
    conversion: ls.length ? completed.length / ls.length : 0, loans: ls
  };
}

function CrmStars({ value, onChange }) {
  return (
    <span className="crm-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" className={'crm-star' + (n <= (value || 0) ? ' on' : '')}
                onClick={onChange ? () => onChange(n === value ? 0 : n) : undefined}
                disabled={!onChange} aria-label={n + ' of 5'}>★</button>
      ))}
    </span>
  );
}

function CrmStatusChip({ status }) {
  if (!status) return <span className="muted">-</span>;
  const map = { 'Active': 'crm-chip-ok', 'Onboarded': 'crm-chip-on', 'Prospective': 'crm-chip-warn' };
  return <span className={'crm-chip ' + (map[status] || '')}>{status}</span>;
}

// ---------------------------------------------------------------- register
function CRMView({ data, openLoan }) {
  const [ver, setVer] = React.useState(0);
  const [type, setType] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [openId, setOpenId] = React.useState(null);
  const [adding, setAdding] = React.useState(null);   // type key or null
  const [colF, setColF] = React.useState({ reference: '', company: '', name: '', telephone: '', mobile: '', email: '', status: '', managedBy: '' });
  const [sort, setSort] = React.useState({ key: 'company', dir: 1 });
  const [sel, setSel] = React.useState([]);
  const setCol = (k, val) => setColF(prev => Object.assign({}, prev, { [k]: val }));
  React.useEffect(() => window.CredXCRM.subscribe(() => setVer(v => v + 1)), []);

  const records = React.useMemo(() => crmAllRecords(data), [data, ver]);
  const counts = React.useMemo(() => {
    const c = {};
    records.forEach(r => { c[r.type] = (c[r.type] || 0) + 1; });
    return c;
  }, [records]);

  // Flatten each record to the register's columns, then filter per column.
  const rows = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    const has = (v, f) => !f || String(v || '').toLowerCase().includes(f.trim().toLowerCase());
    const list = records
      .map(r => {
        const c = (r.contacts || [])[0] || {};
        return Object.assign({}, r, {
          _key: r.id,
          _cat: window.CredXCRM.typeShort(r.type),
          _name: c.name || '',
          _tel: r.telephone || c.phone || '',
          _mob: r.mobile || '',
          _email: r.email || c.email || ''
        });
      })
      .filter(r => type === 'all' || r.type === type)
      .filter(r => has(r.reference, colF.reference) && has(r.org, colF.company) &&
        has(r._name, colF.name) && has(r._tel, colF.telephone) && has(r._mob, colF.mobile) &&
        has(r._email, colF.email) &&
        (!colF.status || r.status === colF.status) &&
        (!colF.managedBy || (r.managedBy || '') === colF.managedBy))
      .filter(r => !term || (r.org || '').toLowerCase().includes(term) ||
        (r.contacts || []).some(c => (c.name || '').toLowerCase().includes(term) || (c.email || '').toLowerCase().includes(term)) ||
        (r.coverage || []).some(x => x.toLowerCase().includes(term)));
    const key = { category: '_cat', reference: 'reference', company: 'org', name: '_name',
      telephone: '_tel', mobile: '_mob', email: '_email', status: 'status', managedBy: 'managedBy' }[sort.key] || 'org';
    return list.sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || '')) * sort.dir);
  }, [records, type, q, colF, sort]);

  const managers = React.useMemo(() => {
    const set = new Set(records.map(r => r.managedBy).filter(Boolean));
    (window.crmManagers ? window.crmManagers() : []).forEach(n => set.add(n));
    return Array.from(set).sort();
  }, [records]);
  const anyColF = Object.values(colF).some(Boolean);
  const allSel = rows.length > 0 && rows.every(r => sel.includes(r.id));
  const toggleSel = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : s.concat([id]));

  const today = new Date().toISOString().slice(0, 10);
  const follow = window.CredXCRM.followUps();
  const overdue = follow.filter(f => f.overdue).length;
  const dueSoon = follow.filter(f => !f.overdue && f.due <= new Date(Date.now() + 12096e5).toISOString().slice(0, 10)).length;

  const tabs = [{ value: 'all', label: 'All', count: records.length }]
    .concat(CRM_TYPE_TABS().map(t => ({
      value: t.key,
      label: t.short === 'Compliance' ? 'Compliance' : t.short + 's',
      count: counts[t.key] || 0
    })));

  const rec = openId ? records.find(r => r.id === openId) : null;

  if (rec) return <CrmRecordScreen rec={rec} data={data} openLoan={openLoan}
                                   onBack={() => setOpenId(null)} onChangeId={setOpenId}/>;

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <div className="eyebrow">CRM</div>
          <h1>Relationships</h1>
          <div className="view-sub">Panel firms, funders, introducers, borrowers and investors — terms, contacts and the running conversation.</div>
        </div>
        <div className="view-actions crm-newbtn">
          <Btn onClick={() => setAdding(type === 'all' ? 'broker' : type)}>+ New organisation</Btn>
        </div>
      </header>

      <div className="crm-kpis">
        <KPI label="Organisations" value={records.length} sub={CRM_TYPE_TABS().length + ' relationship types'}/>
        <KPI label="Active" value={records.filter(r => r.status === 'Active').length} sub="currently working with us"/>
        <KPI label="Prospective" value={records.filter(r => r.status === 'Prospective').length} sub="not yet onboarded"/>
        <KPI label="Follow-ups" value={follow.length} accent={overdue ? 'red' : null}
             sub={overdue ? overdue + ' overdue · ' + dueSoon + ' due in 14d' : dueSoon + ' due in 14 days'}/>
      </div>

      <div className="crm-searchbar">
        <SearchBox value={q} onChange={setQ}
                   placeholder="Search organisation, contact name, email, coverage or terms…"/>
        <div className="crm-search-meta">
          {q.trim()
            ? <React.Fragment>{rows.length} match{rows.length === 1 ? '' : 'es'}
                {type !== 'all' && ' in ' + window.CredXCRM.typeLabel(type)}
                <button className="crm-search-clear" onClick={() => setQ('')}>Clear</button></React.Fragment>
            : <span className="muted">{rows.length} shown</span>}
        </div>
      </div>
      <div className="crm-tabsrow">
        <FilterPills options={tabs} value={type} onChange={setType}/>
      </div>

      {(sel.length > 0 || anyColF) && (
        <div className="crmreg-bar">
          {sel.length > 0 && <span>{sel.length} selected</span>}
          {sel.length > 0 && <button className="crmreg-bar-btn" onClick={() => setSel([])}>Clear selection</button>}
          {anyColF && <span className="muted">Column filters active</span>}
          {anyColF && <button className="crmreg-bar-btn" onClick={() => setColF({ reference: '', company: '', name: '', telephone: '', mobile: '', email: '', status: '', managedBy: '' })}>Clear filters</button>}
        </div>
      )}

      <div className="crmreg-wrap">
        <table className="crmreg-grid">
          <thead>
            <tr>
              <th className="rg-check">
                <input type="checkbox" checked={allSel} aria-label="Select all"
                       onChange={e => setSel(e.target.checked ? rows.map(r => r.id) : [])}/>
              </th>
              {[['category', 'Contact type'], ['reference', 'Reference'], ['company', 'Company'],
                ['name', 'Name'], ['telephone', 'Telephone'], ['mobile', 'Mobile'],
                ['email', 'Email'], ['status', 'Status'], ['managedBy', 'Managed By']].map(([k, label]) => (
                <th key={k} className={'rg-' + k}>
                  <button className="rg-sort" onClick={() => setSort(s => ({ key: k, dir: s.key === k ? -s.dir : 1 }))}>
                    {label}<span className="rg-arrow">{sort.key === k ? (sort.dir === 1 ? '▲' : '▼') : ''}</span>
                  </button>
                </th>
              ))}
            </tr>
            <tr className="rg-filters">
              <th/>
              <th>
                <select className="rg-f" value={type} onChange={e => setType(e.target.value)}>
                  <option value="all">All types</option>
                  {CRM_TYPE_TABS().map(t => <option key={t.key} value={t.key}>{t.short}</option>)}
                </select>
              </th>
              {['reference', 'company', 'name', 'telephone', 'mobile', 'email'].map(k => (
                <th key={k}>
                  <input className="rg-f" value={colF[k]} placeholder="Filter"
                         onChange={e => setCol(k, e.target.value)}/>
                </th>
              ))}
              <th>
                <select className="rg-f" value={colF.status} onChange={e => setCol('status', e.target.value)}>
                  <option value="">All</option>
                  {window.CredXCRM.STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </th>
              <th>
                <select className="rg-f" value={colF.managedBy} onChange={e => setCol('managedBy', e.target.value)}>
                  <option value="">All</option>
                  {managers.map(n => <option key={n}>{n}</option>)}
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className={'clickable' + (sel.includes(r.id) ? ' on' : '')} onClick={() => setOpenId(r.id)}>
                <td className="rg-check" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={sel.includes(r.id)} aria-label={'Select ' + r.org}
                         onChange={() => toggleSel(r.id)}/>
                </td>
                <td className="rg-category">{r._cat}{r._readOnly && <span className="crm-mirror-tag">mirrored</span>}</td>
                <td className="rg-reference mono">{r.reference}</td>
                <td className="rg-company"><span className="crm-org-name">{r.org}</span></td>
                <td className="rg-name">{r._name || <span className="muted">—</span>}</td>
                <td className="rg-telephone">{r._tel || <span className="muted">—</span>}</td>
                <td className="rg-mobile">{r._mob || <span className="muted">—</span>}</td>
                <td className="rg-email">{r._email ? <a href={'mailto:' + r._email} onClick={e => e.stopPropagation()}>{r._email}</a> : <span className="muted">—</span>}</td>
                <td className="rg-status"><CrmStatusChip status={r.status}/></td>
                <td className="rg-managedBy">{r.managedBy || <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="lams-grid-empty">{q.trim() || anyColF ? 'Nothing matches the current filters.' : 'No organisations of this type yet.'}</div>
        )}
      </div>

      {adding && <CrmEditModal type={adding} onClose={() => setAdding(null)}
                               onSaved={(r) => { setAdding(null); setOpenId(r.id); }}/>}
    </div>
  );
}

// ---------------------------------------------------------------- add / edit
function CrmEditModal({ rec, type, onClose, onSaved, compact }) {
  const [f, setF] = React.useState(() => ({
    type: (rec && rec.type) || type || 'broker',
    org: (rec && rec.org) || '',
    status: (rec && rec.status) || 'Prospective',
    feeTerms: (rec && rec.feeTerms) || '',
    commissionPct: rec && rec.commissionPct != null ? rec.commissionPct : '',
    coverage: (rec && (rec.coverage || []).join(', ')) || '',
    notes: (rec && rec.notes) || '',
    regLabel: (rec && rec.regRefs && rec.regRefs[0] ? rec.regRefs[0].label : ''),
    regValue: (rec && rec.regRefs && rec.regRefs[0] ? rec.regRefs[0].value : ''),
    bankName: (rec && rec.bank && rec.bank.name) || '',
    bankSort: (rec && rec.bank && rec.bank.sortCode) || '',
    bankAcct: (rec && rec.bank && rec.bank.account) || '',
    cName: (rec && rec.contacts && rec.contacts[0] ? rec.contacts[0].name : ''),
    cRole: (rec && rec.contacts && rec.contacts[0] ? rec.contacts[0].role : ''),
    cEmail: (rec && rec.contacts && rec.contacts[0] ? rec.contacts[0].email : ''),
    cPhone: (rec && rec.contacts && rec.contacts[0] ? rec.contacts[0].phone : ''),
    address: (rec && rec.address) || '', postcode: (rec && rec.postcode) || '',
    companyReg: (rec && rec.companyReg) || '', managedBy: (rec && rec.managedBy) || ''
  }));
  const set = (p) => setF(prev => Object.assign({}, prev, p));
  const [err, setErr] = React.useState(false);

  const save = () => {
    if (!f.org.trim()) { setErr(true); return; }
    const contacts = (f.cName || f.cEmail || f.cPhone)
      ? [{ name: f.cName, role: f.cRole, email: f.cEmail, phone: f.cPhone }] : [];
    const patch = {
      type: f.type, org: f.org.trim(), status: f.status, feeTerms: f.feeTerms,
      commissionPct: f.commissionPct === '' ? null : parseFloat(f.commissionPct),
      coverage: f.coverage.split(',').map(s => s.trim()).filter(Boolean),
      notes: f.notes, address: f.address, postcode: f.postcode, companyReg: f.companyReg,
      managedBy: f.managedBy,
      regRefs: f.regLabel || f.regValue ? [{ label: f.regLabel || 'Reference', value: f.regValue }] : [],
      bank: { name: f.bankName, sortCode: f.bankSort, account: f.bankAcct }
    };
    if (rec && !rec._readOnly) {
      const merged = (rec.contacts || []).slice();
      if (contacts.length) merged[0] = contacts[0];
      window.CredXCRM.update(rec.id, Object.assign(patch, { contacts: merged }));
      onSaved(rec);
    } else {
      const made = window.CredXCRM.add(Object.assign(patch, { contacts }));
      onSaved(made);
    }
  };

  const isBorrower = f.type === 'borrower';
  return (
    <div className="wz-backdrop" onClick={onClose}>
      <div className="crm-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="crm-modal-head">
          <div className="crm-modal-title">{rec ? 'Edit ' + rec.org : 'New organisation'}</div>
          <button className="wz-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="crm-modal-body">
          <div className="wz-grid wz-g2">
            <WzField label="Relationship type" req>
              <select className="wz-input" value={f.type} onChange={e => set({ type: e.target.value })}>
                {window.CredXCRM.TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </WzField>
            <WzField label="Relationship status">
              <select className="wz-input" value={f.status} onChange={e => set({ status: e.target.value })}>
                {window.CredXCRM.STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </WzField>
            <WzField label={isBorrower ? 'Borrower legal name' : 'Organisation'} req span="2">
              <input className={'wz-input' + (err && !f.org.trim() ? ' wz-input-err' : '')} value={f.org}
                     placeholder={isBorrower ? 'Company name or individual' : 'Firm name'}
                     onChange={e => set({ org: e.target.value })}/>
            </WzField>
            <WzField label="Primary contact">
              <input className="wz-input" value={f.cName} onChange={e => set({ cName: e.target.value })}/>
            </WzField>
            <WzField label="Role">
              <input className="wz-input" value={f.cRole} onChange={e => set({ cRole: e.target.value })}/>
            </WzField>
            <WzField label="Email">
              <input className="wz-input" type="email" value={f.cEmail} onChange={e => set({ cEmail: e.target.value })}/>
            </WzField>
            <WzField label="Telephone">
              <input className="wz-input" value={f.cPhone} onChange={e => set({ cPhone: e.target.value })}/>
            </WzField>
            {(
              <React.Fragment>
                <WzField label="Address" span="2">
                  <textarea className="wz-input wz-area" value={f.address} onChange={e => set({ address: e.target.value })}/>
                </WzField>
                <WzField label="Postcode">
                  <input className="wz-input" value={f.postcode} onChange={e => set({ postcode: e.target.value })}/>
                </WzField>
                <WzField label={isBorrower ? 'Company reg. no.' : 'Comp. reg. no.'}>
                  <input className="wz-input" value={f.companyReg} onChange={e => set({ companyReg: e.target.value })}/>
                </WzField>
                <WzField label="Managed by" hint="Who owns this relationship.">
                  <select className="wz-input" value={f.managedBy} onChange={e => set({ managedBy: e.target.value })}>
                    <option value="">Select…</option>
                    {(window.crmManagers ? window.crmManagers() : []).map(n => <option key={n}>{n}</option>)}
                  </select>
                </WzField>
              </React.Fragment>
            )}
            {!compact && (
              <React.Fragment>
                {f.type !== 'investor' && (
                  <React.Fragment>
                    <WzField label="Fee / commission terms" span="2">
                      <input className="wz-input" value={f.feeTerms} placeholder="e.g. 1.00% of gross on completion"
                             onChange={e => set({ feeTerms: e.target.value })}/>
                    </WzField>
                    <WzField label="Default commission %" hint="Brokers only — pre-fills the DIP.">
                      <input className="wz-input" type="number" step="0.01" value={f.commissionPct}
                             onChange={e => set({ commissionPct: e.target.value })}/>
                    </WzField>
                  </React.Fragment>
                )}
                <WzField label="Coverage / specialisms" hint="Comma separated.">
                  <input className="wz-input" value={f.coverage} onChange={e => set({ coverage: e.target.value })}/>
                </WzField>
                <WzField label="Regulator">
                  <input className="wz-input" value={f.regLabel} placeholder="SRA / RICS / FCA / ICAEW"
                         onChange={e => set({ regLabel: e.target.value })}/>
                </WzField>
                <WzField label="Reference no.">
                  <input className="wz-input" value={f.regValue} onChange={e => set({ regValue: e.target.value })}/>
                </WzField>
                <WzField label="Bank account name">
                  <input className="wz-input" value={f.bankName} onChange={e => set({ bankName: e.target.value })}/>
                </WzField>
                <WzField label="Sort code">
                  <input className="wz-input" value={f.bankSort} placeholder="00-00-00"
                         onChange={e => set({ bankSort: e.target.value })}/>
                </WzField>
                <WzField label="Account number">
                  <input className="wz-input" value={f.bankAcct} onChange={e => set({ bankAcct: e.target.value })}/>
                </WzField>
                <WzField label="Notes" span="2">
                  <textarea className="wz-input wz-area" value={f.notes} onChange={e => set({ notes: e.target.value })}/>
                </WzField>
              </React.Fragment>
            )}
          </div>
        </div>
        <div className="crm-modal-foot">
          {rec && !rec._readOnly && (
            <button className="wz-btn wz-btn-link" onClick={() => { window.CredXCRM.remove(rec.id); onClose(); }}>Delete</button>
          )}
          <div style={{ flex: 1 }}/>
          <button className="wz-btn wz-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="wz-btn wz-btn-primary" onClick={save}>{rec ? 'Save' : 'Add to CRM'}</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------- wizard pickers (CRM-gated)
// A DIP can only be raised against a borrower and a broker held in the CRM.
function CrmBorrowerPicker({ data, value, onPick, invalid }) {
  const [ver, setVer] = React.useState(0);
  const [q, setQ] = React.useState(value || '');
  const [open, setOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  React.useEffect(() => window.CredXCRM.subscribe(() => setVer(v => v + 1)), []);
  React.useEffect(() => { setQ(value || ''); }, [value]);

  const list = React.useMemo(
    () => crmAllRecords(data).filter(r => r.type === 'borrower'), [data, ver]);
  const term = q.trim().toLowerCase();
  const matches = list.filter(r => !term || (r.org || '').toLowerCase().includes(term));

  const pick = (r) => {
    const c = (r.contacts || [])[0] || {};
    const reg = (r.regRefs || []).find(x => /reg/i.test(x.label));
    onPick({
      borrowerName: r.org, crmId: r.id,
      contactName: c.name || '', email: c.email || '', phone: c.phone || '',
      address: r.address || '', postcode: r.postcode || '', companyReg: r.companyReg || (reg ? reg.value : '')
    });
    setQ(r.org); setOpen(false);
  };

  return (
    <div className="wz-combo">
      <input className={'wz-input' + (invalid ? ' wz-input-err' : '')} value={q}
             placeholder="Search CRM borrowers"
             onChange={e => { setQ(e.target.value); setOpen(true); if (value) onPick({ borrowerName: '', crmId: '' }); }}
             onFocus={() => setOpen(true)}
             onBlur={() => setTimeout(() => setOpen(false), 160)}/>
      {open && (
        <div className="wz-combo-menu">
          <div className="wz-combo-head">In CRM · {matches.length}</div>
          {matches.slice(0, 7).map(r => (
            <div key={r.id} className="wz-combo-opt" onMouseDown={() => pick(r)}>
              {r.org}
              <span className="muted small"> · {(r.contacts[0] && r.contacts[0].name) || 'no contact'}</span>
            </div>
          ))}
          <div className="wz-combo-opt crm-combo-add" onMouseDown={() => { setAdding(true); setOpen(false); }}>
            + Add “{q.trim() || 'new borrower'}” to the CRM
          </div>
        </div>
      )}
      {adding && (
        <CrmEditModal type="borrower" compact
                      rec={{ org: q.trim(), type: 'borrower', status: 'Prospective' }}
                      onClose={() => setAdding(false)}
                      onSaved={(made) => { setAdding(false); pick(made); }}/>
      )}
    </div>
  );
}

function CrmBrokerPicker({ value, onPick, invalid }) {
  const [ver, setVer] = React.useState(0);
  const [adding, setAdding] = React.useState(false);
  React.useEffect(() => window.CredXCRM.subscribe(() => setVer(v => v + 1)), []);
  const brokers = React.useMemo(() => window.CredXCRM.byType('broker'), [ver]);

  return (
    <React.Fragment>
      <select className={'wz-input' + (invalid ? ' wz-input-err' : '')} value={value}
              onChange={e => {
                if (e.target.value === '__add') { setAdding(true); return; }
                const b = brokers.find(x => x.org === e.target.value);
                onPick({ broker: e.target.value, commission: b && b.commissionPct != null ? b.commissionPct : 0, brokerCrmId: b ? b.id : '' });
              }}>
        <option value="Direct (no introducer)">Direct (no introducer)</option>
        {brokers.map(b => <option key={b.id} value={b.org}>{b.org}{b.status !== 'Active' ? ' · ' + b.status : ''}</option>)}
        <option value="__add">+ Add a broker to the CRM…</option>
      </select>
      {adding && (
        <CrmEditModal type="broker" rec={{ type: 'broker', status: 'Prospective' }}
                      onClose={() => setAdding(false)}
                      onSaved={(made) => {
                        setAdding(false);
                        onPick({ broker: made.org, commission: made.commissionPct != null ? made.commissionPct : 0, brokerCrmId: made.id });
                      }}/>
      )}
    </React.Fragment>
  );
}

Object.assign(window, {
  CRMView, CrmEditModal, CrmBorrowerPicker, CrmBrokerPicker,
  crmAllRecords, crmMirrors, crmBrokerStats, crmLinkedLoans, CrmStars, CrmStatusChip
});
