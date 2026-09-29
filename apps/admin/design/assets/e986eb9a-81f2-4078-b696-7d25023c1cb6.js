// credx-crm-record.jsx — full record card for one CRM organisation, laid out
// like the LAMS contact screen: a Contact form on the left, a tabbed work area
// on the right (Additional Contacts · Borrower Loans · Investor Loans · Notes ·
// Diary · Terms & panel). Fields save straight to CredXCRM on blur/change.
// Mirrored borrower/investor records materialise on first write.

const CRM_NATIONALITIES = ['British', 'Irish', 'Indian', 'Pakistani', 'Polish', 'Romanian',
  'Nigerian', 'South African', 'American', 'Australian', 'Other'];

function crmManagers() {
  const p = window.UW_PEOPLE && window.UW_PEOPLE.underwriters;
  return (p && p.length ? p : ['William Jarvis', 'Priya Shah', 'Daniel Okafor']);
}

function crmAge(dob) {
  if (!dob) return '';
  const b = new Date(dob); if (isNaN(b)) return '';
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a >= 0 && a < 130 ? String(a) : '';
}

function LamsRow({ label, children, hint }) {
  return (
    <div className="lams-row">
      <div className="lams-lbl">{label}</div>
      <div className="lams-ctl">{children}{hint && <div className="lams-hint">{hint}</div>}</div>
    </div>
  );
}

function LamsStars({ value, onChange }) {
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

// ------------------------------------------------------------------ record
function CrmRecordScreen({ rec, data, openLoan, onBack, onChangeId }) {
  const [tab, setTab] = React.useState('contacts');
  const [f, setF] = React.useState({});
  const [kind, setKind] = React.useState('Call');
  const [note, setNote] = React.useState('');
  const [confirmDel, setConfirmDel] = React.useState(false);

  React.useEffect(() => { setF({}); setConfirmDel(false); }, [rec.id]);

  // Mirrored records become real the moment anything is written against them.
  const storedId = () => {
    if (!rec._readOnly) return rec.id;
    const made = window.CredXCRM.ensureMirror(Object.assign({}, rec, { _readOnly: undefined }));
    if (made) { onChangeId(made.id); return made.id; }
    return null;
  };
  const save = (patch) => { const id = storedId(); if (id) window.CredXCRM.update(id, patch); };
  const val = (k) => (f[k] !== undefined ? f[k] : (rec[k] == null ? '' : rec[k]));
  const draft = (k, v) => setF(prev => Object.assign({}, prev, { [k]: v }));
  const commit = (k) => { if (f[k] !== undefined && f[k] !== rec[k]) save({ [k]: f[k] }); };
  const text = (k, extra) => Object.assign({
    className: 'lams-input', value: val(k),
    onChange: e => draft(k, e.target.value),
    onBlur: () => commit(k),
    onKeyDown: e => { if (e.key === 'Enter') e.target.blur(); }
  }, extra || {});

  const contacts = rec.contacts || [];
  const main = contacts[0] || {};
  const setMain = (patch) => {
    const list = contacts.slice();
    list[0] = Object.assign({ name: '', role: '', email: '', phone: '' }, list[0], patch);
    save({ contacts: list });
  };

  const linked = window.crmLinkedLoans ? window.crmLinkedLoans(rec, data) : [];
  const borrowerLoans = (data.LOANS || []).filter(l => (l.borrower || '') === rec.org);
  const introduced = rec.type === 'broker' ? linked : [];
  const invRef = (rec.mirror && rec.mirror.kind === 'investor' && rec.mirror.ref) ||
    ((rec.regRefs || []).find(r => /investor/i.test(r.label)) || {}).value || '';
  const allocs = invRef && window.getInvestorAllocations ? window.getInvestorAllocations(invRef) : [];
  const stats = rec.type === 'broker' && window.crmBrokerStats ? window.crmBrokerStats(rec, data) : null;

  const tabs = [
    ['contacts', 'Additional Contacts', Math.max(contacts.length - 1, 0)],
    ['borrower', 'Borrower Loans', borrowerLoans.length + introduced.length],
    ['investor', 'Investor Loans', allocs.length],
    ['notes', 'Notes', (rec.docs || []).length],
    ['diary', 'Diary', (rec.activity || []).length],
    ['terms', 'Terms & panel', 0]
  ];

  return (
    <div className="view lams-view">
      <div className="lams-topbar">
        <button className="lams-back" onClick={onBack}>← Register</button>
        <Avatar name={rec.org} size={28}/>
        <div className="lams-title">{rec.org || 'New contact'}</div>
        <span className="crm-type-tag">{window.CredXCRM.typeLabel(rec.type)}</span>
        <LamsStars value={rec.rating} onChange={v => save({ rating: v })}/>
        <div style={{ flex: 1 }}/>
        <span className="muted small">Ref {rec.reference}</span>
        {!rec._readOnly && (confirmDel
          ? <React.Fragment>
              <span className="lams-del-q">Delete this record?</span>
              <button className="wz-btn wz-btn-ghost" onClick={() => setConfirmDel(false)}>Keep</button>
              <button className="wz-btn wz-btn-link" onClick={() => { window.CredXCRM.remove(rec.id); onBack(); }}>Delete</button>
            </React.Fragment>
          : <button className="wz-btn wz-btn-ghost" onClick={() => setConfirmDel(true)}>Delete</button>)}
      </div>

      {rec._readOnly && (
        <div className="crm-mirror-note">Mirrored from the {rec.type === 'borrower' ? 'loan book' : 'investor register'}. Editing any field here creates a CRM record linked to it.</div>
      )}

      <div className="lams-panes">
        <section className="lams-panel">
          <div className="lams-panel-head">Contact</div>
          <div className="lams-form">
            <LamsRow label="Category">
              <select className="lams-input" value={rec.type} onChange={e => save({ type: e.target.value })}>
                {window.CredXCRM.TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </LamsRow>
            <LamsRow label="Reference">
              <input className="lams-input lams-ro" value={rec.reference} readOnly/>
            </LamsRow>
            <LamsRow label="Company">
              <input {...text('org')}/>
            </LamsRow>
            <LamsRow label="Main Contact">
              <input className="lams-input" value={f._main !== undefined ? f._main : (main.name || '')}
                     onChange={e => draft('_main', e.target.value)}
                     onBlur={() => { if (f._main !== undefined && f._main !== (main.name || '')) setMain({ name: f._main }); }}/>
            </LamsRow>
            <LamsRow label="Address">
              <textarea {...text('address', { className: 'lams-input lams-area' })}/>
            </LamsRow>
            <LamsRow label="Postcode"><input {...text('postcode')}/></LamsRow>
            <LamsRow label="Comp.Reg.No."><input {...text('companyReg')}/></LamsRow>
            <LamsRow label="Telephone"><input {...text('telephone')}/></LamsRow>
            <LamsRow label="Mobile"><input {...text('mobile')}/></LamsRow>
            <LamsRow label="Email"><input {...text('email', { type: 'email' })}/></LamsRow>
            <LamsRow label="Website"><input {...text('website')}/></LamsRow>
            <LamsRow label="Memo"><textarea {...text('memo', { className: 'lams-input lams-area lams-area-sm' })}/></LamsRow>
            <LamsRow label="Managed By">
              <select className="lams-input" value={rec.managedBy || ''} onChange={e => save({ managedBy: e.target.value })}>
                <option value="">Select…</option>
                {crmManagers().map(n => <option key={n}>{n}</option>)}
              </select>
            </LamsRow>
            <LamsRow label="Status">
              <select className="lams-input" value={rec.status || ''} onChange={e => save({ status: e.target.value })}>
                <option value="">—</option>
                {window.CredXCRM.STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </LamsRow>
            <LamsRow label="D.O.B.">
              <div className="lams-inline">
                <input className="lams-input" type="date" value={rec.dob || ''}
                       onChange={e => save({ dob: e.target.value })}/>
                <span className="lams-sublbl">Age</span>
                <input className="lams-input lams-ro lams-age" value={crmAge(rec.dob)} readOnly/>
              </div>
            </LamsRow>
            <LamsRow label="Nationality">
              <select className="lams-input" value={rec.nationality || ''} onChange={e => save({ nationality: e.target.value })}>
                <option value="">Select …</option>
                {CRM_NATIONALITIES.map(n => <option key={n}>{n}</option>)}
              </select>
            </LamsRow>
            <div className="lams-row">
              <div className="lams-lbl"/>
              <label className="lams-check">
                <input type="checkbox" checked={!!rec.preferred} onChange={e => save({ preferred: e.target.checked })}/>
                Preferred (Accredited)
              </label>
            </div>
            <LamsRow label="Last Updated">
              <input className="lams-input lams-ro lams-date" value={rec.updatedAt ? fmtDate(rec.updatedAt) : '—'} readOnly/>
            </LamsRow>
          </div>
        </section>

        <section className="lams-panel lams-work">
          <div className="lams-tabs" role="tablist">
            {tabs.map(([k, label, n]) => (
              <button key={k} role="tab" aria-selected={tab === k}
                      className={'lams-tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>
                {label}{n ? <span className="lams-tab-n">{n}</span> : null}
              </button>
            ))}
          </div>
          <div className="lams-work-body">
            {tab === 'contacts' && <LamsContactsGrid rec={rec} save={save}/>}
            {tab === 'borrower' && (
              <LamsLoanGrid rows={borrowerLoans} introduced={introduced} openLoan={openLoan}/>
            )}
            {tab === 'investor' && <LamsAllocGrid allocs={allocs} invRef={invRef} openLoan={openLoan}/>}
            {tab === 'notes' && (
              <div className="lams-pad">
                <div className="section-head">Notes</div>
                <textarea className="lams-input lams-area-lg" value={val('notes')}
                          placeholder="Anything worth knowing about this relationship."
                          onChange={e => draft('notes', e.target.value)} onBlur={() => commit('notes')}/>
                <div className="section-head">Documents on file <span className="section-meta">{(rec.docs || []).length}</span></div>
                {(rec.docs || []).length === 0
                  ? <div className="empty-state">No documents recorded.</div>
                  : (rec.docs || []).map((d, i) => <StatRow key={i} label={d.name} value={fmtDate(d.date)}/>)}
              </div>
            )}
            {tab === 'diary' && <LamsDiary rec={rec} save={save} storedId={storedId} kind={kind} setKind={setKind}
                                           note={note} setNote={setNote}/>}
            {tab === 'terms' && <LamsTerms rec={rec} stats={stats} openLoan={openLoan} save={save}
                                           val={val} draft={draft} commit={commit}/>}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------- additional contacts
function LamsContactsGrid({ rec, save }) {
  const contacts = rec.contacts || [];
  const rows = contacts.slice(1);
  const write = (i, patch) => {
    const list = contacts.slice();
    list[i + 1] = Object.assign({ name: '', role: '', email: '', phone: '', mobile: '', dob: '', nationality: '', notes: '' }, list[i + 1], patch);
    save({ contacts: list });
  };
  const addRow = () => save({ contacts: contacts.concat([{ name: '', role: '', email: '', phone: '', mobile: '', dob: '', nationality: '', notes: '' }]) });
  const del = (i) => save({ contacts: contacts.filter((c, idx) => idx !== i + 1) });

  const cols = [['name', 'Contact Name'], ['phone', 'Telephone'], ['mobile', 'Mobile'],
    ['email', 'Email'], ['dob', 'D.O.B.'], ['nationality', 'Nationality'], ['notes', 'Notes']];

  return (
    <div className="lams-grid-wrap">
      <table className="lams-grid">
        <thead>
          <tr>{cols.map(([k, l]) => <th key={k} className={'lg-' + k}>{l}</th>)}<th className="lg-x"/></tr>
        </thead>
        <tbody>
          <tr className="lams-grid-add"><td colSpan={8}>
            <button onClick={addRow}>Click here to add a new row</button>
          </td></tr>
          {rows.map((c, i) => (
            <tr key={i}>
              {cols.map(([k]) => (
                <td key={k} className={'lg-' + k}>
                  <input className="lams-cell" type={k === 'dob' ? 'date' : 'text'} value={c[k] || ''}
                         onChange={e => write(i, { [k]: e.target.value })}/>
                </td>
              ))}
              <td className="lg-x">
                <button className="lams-rowdel" onClick={() => del(i)} aria-label="Remove contact">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="lams-grid-empty">No additional contacts on this record.</div>}
    </div>
  );
}

// ---------------------------------------------------------------- loans
function LamsLoanGrid({ rows, introduced, openLoan }) {
  const all = rows.concat(introduced.filter(l => !rows.some(r => r.id === l.id))
    .map(l => Object.assign({}, l, { _intro: true })));
  if (all.length === 0) return <div className="lams-pad"><div className="empty-state">No loans on the book for this contact.</div></div>;
  return (
    <div className="lams-grid-wrap">
      <table className="lams-grid lams-grid-read">
        <thead><tr><th>Reference</th><th>Borrower</th><th>Role</th><th className="num">Gross</th><th>Status</th></tr></thead>
        <tbody>
          {all.map(l => (
            <tr key={l.id} className="clickable" onClick={() => openLoan && openLoan(l.id)}>
              <td className="mono">{l.id}</td>
              <td>{l.borrower}</td>
              <td className="muted">{l._intro ? 'Introduced' : 'Borrower'}</td>
              <td className="num">{fmtGBP(l.grossLoan)}</td>
              <td><StatusBadge status={l.status}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LamsAllocGrid({ allocs, invRef, openLoan }) {
  if (!invRef) return <div className="lams-pad"><div className="empty-state">This contact is not an investor on the register.</div></div>;
  if (allocs.length === 0) return <div className="lams-pad"><div className="empty-state">No allocations against investor {invRef}.</div></div>;
  const loans = window.CREDX_DATA ? window.CREDX_DATA.LOANS : [];
  const nameOf = (id) => { const l = loans.find(x => x.id === id); return l ? l.borrower : '—'; };
  return (
    <div className="lams-grid-wrap">
      <table className="lams-grid lams-grid-read">
        <thead><tr><th>Loan</th><th>Borrower</th><th className="num">Amount</th><th className="num">Rate</th><th>Funded</th><th>Status</th></tr></thead>
        <tbody>
          {allocs.map((a, i) => (
            <tr key={a.id || i} className="clickable" onClick={() => openLoan && openLoan(a.loanId)}>
              <td className="mono">{a.loanId}</td>
              <td>{nameOf(a.loanId)}</td>
              <td className="num">{fmtGBP(a.amount)}</td>
              <td className="num">{fmtPct(a.rate, 2)}</td>
              <td>{a.fundingDate ? fmtDate(a.fundingDate) : '—'}</td>
              <td><StatusBadge status={a.status || 'Active'}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- diary
function LamsDiary({ rec, save, storedId, kind, setKind, note, setNote }) {
  const [naWhat, setNaWhat] = React.useState((rec.nextAction || {}).what || '');
  const [naDue, setNaDue] = React.useState((rec.nextAction || {}).due || '');
  React.useEffect(() => {
    setNaWhat((rec.nextAction || {}).what || '');
    setNaDue((rec.nextAction || {}).due || '');
  }, [rec.id]);

  const logIt = () => {
    if (!note.trim()) return;
    const id = storedId(); if (!id) return;
    window.CredXCRM.logActivity(id, { kind, note: note.trim() });
    setNote('');
  };

  return (
    <div className="lams-pad">
      <div className="section-head">Next action</div>
      <div className="crm-na">
        <input className="wz-input" value={naWhat} placeholder="What needs doing"
               onChange={e => setNaWhat(e.target.value)}/>
        <input className="wz-input" type="date" value={naDue || ''} onChange={e => setNaDue(e.target.value)}/>
        <Btn size="sm" variant="soft" onClick={() => save({ nextAction: { what: naWhat.trim(), due: naDue } })}>Save</Btn>
      </div>

      <div className="section-head">Diary entries</div>
      <div className="crm-log-row">
        <select className="wz-input" value={kind} onChange={e => setKind(e.target.value)}>
          {window.CredXCRM.ACTIVITY_KINDS.map(k => <option key={k}>{k}</option>)}
        </select>
        <input className="wz-input" value={note} placeholder="What was said or agreed"
               onChange={e => setNote(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') logIt(); }}/>
        <Btn size="sm" onClick={logIt}>Log</Btn>
      </div>
      {(rec.activity || []).length === 0 ? <div className="empty-state">Nothing logged yet.</div> : (
        <div className="crm-timeline">
          {rec.activity.map((a, i) => (
            <div className="crm-tl-item" key={i}>
              <div className="crm-tl-dot"/>
              <div className="crm-tl-body">
                <div className="crm-tl-head"><b>{a.kind}</b><span className="muted small">{fmtDate(a.date)} · {a.by}</span></div>
                <div className="crm-tl-note">{a.note}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------- terms & panel
function LamsTerms({ rec, stats, openLoan, save, val, draft, commit }) {
  const isInvestor = rec.type === 'investor';
  return (
    <div className="lams-pad">
      {!isInvestor && (
        <React.Fragment>
          <div className="section-head">Fee / commission terms</div>
          <textarea className="lams-input lams-area-sm" value={val('feeTerms')}
                    placeholder="e.g. 1.00% of gross on completion"
                    onChange={e => draft('feeTerms', e.target.value)} onBlur={() => commit('feeTerms')}/>
          <div className="lams-two">
            <LamsRow label="Default commission %">
              <input className="lams-input" type="number" step="0.01"
                     value={rec.commissionPct == null ? '' : rec.commissionPct}
                     onChange={e => save({ commissionPct: e.target.value === '' ? null : parseFloat(e.target.value) })}/>
            </LamsRow>
          </div>
        </React.Fragment>
      )}

      <div className="section-head">Credentials</div>
      {(rec.regRefs || []).length === 0
        ? <div className="empty-state">No regulator reference recorded.</div>
        : (rec.regRefs || []).map((r, i) => <StatRow key={i} label={r.label} value={r.value}/>)}
      {(rec.coverage || []).length > 0 && (
        <div className="crm-tags">{rec.coverage.map(c => <span className="crm-tag" key={c}>{c}</span>)}</div>
      )}

      <div className="section-head">Bank details</div>
      <StatRow label="Account name" value={(rec.bank && rec.bank.name) || '—'}/>
      <StatRow label="Sort code" value={(rec.bank && rec.bank.sortCode) || '—'}/>
      <StatRow label="Account number" value={(rec.bank && rec.bank.account) || '—'}/>

      {stats && (
        <React.Fragment>
          <div className="section-head">Introduced business</div>
          {stats.deals === 0 ? <div className="empty-state">No deals on the book attributed to this introducer yet.</div> : (
            <div className="crm-perf">
              <div><div className="crm-perf-lbl">Deals introduced</div><div className="crm-perf-val">{stats.deals}</div></div>
              <div><div className="crm-perf-lbl">Completed</div><div className="crm-perf-val">{stats.completed}</div></div>
              <div><div className="crm-perf-lbl">Gross volume</div><div className="crm-perf-val">{fmtGBP(stats.volume, { abbreviate: true })}</div></div>
              <div><div className="crm-perf-lbl">Commission paid</div><div className="crm-perf-val">{fmtGBP(stats.commission)}</div></div>
              <div><div className="crm-perf-lbl">Conversion</div><div className="crm-perf-val">{fmtPct(stats.conversion, 0)}</div></div>
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { CrmRecordScreen, LamsRow, crmAge, crmManagers });
