// CredX — Underwriting: case workspace (checklist, documents, conditions,
// escalations, sign-off gate, post-completion management).
// Exposes: window.CaseWorkspace, window.UwDrawerPanel
const { useState: cwState, useMemo: cwMemo } = React;

const DOC_KINDS = ['ID', 'Proof of address', 'AML certificate', 'Source of funds', 'Credit report',
  'Bank statements', 'Companies House', 'UBO statement', 'Title / Land Registry', 'Valuation report',
  'Heads of Terms', 'Security documents', 'Report on Title', 'Build documents', 'Other'];

function cwGet(ref) { return window.CredXCases.get(ref); }

// ── Small pieces ──────────────────────────────────────────────────────────────
function UwStateSelect({ value, onChange }) {
  return (
    <select className={'uw-state-select uw-tone-' + ((window.UW_ITEM_STATES[value] || {}).tone || 'idle')}
            value={value === 'escalated' ? 'progress' : value}
            onChange={e => onChange(e.target.value)}>
      <option value="outstanding">Outstanding</option>
      <option value="progress">In progress</option>
      <option value="satisfied">Satisfied</option>
      <option value="na">Not applicable</option>
    </select>
  );
}

function ItemRow({ c, stage, item, today, onMutate }) {
  const rec = (c.items && c.items[item.id]) || {};
  const state = rec.state || 'outstanding';
  const [noteOpen, setNoteOpen] = cwState(false);
  const [noteDraft, setNoteDraft] = cwState(rec.note || '');
  const [attachOpen, setAttachOpen] = cwState(false);
  const [aName, setAName] = cwState('');
  const [aDrag, setADrag] = cwState(false);
  const fileRef = React.useRef(null);
  const [aKind, setAKind] = cwState(item.id.startsWith('06') ? 'Title / Land Registry' : DOC_KINDS[0]);
  const [escOpen, setEscOpen] = cwState(false);
  const [escReason, setEscReason] = cwState('');

  const setState = (st) => window.CredXCases.setItem(c.ref, item.id, { state: st, by: c.owner, date: today });
  const saveNote = () => { window.CredXCases.setItem(c.ref, item.id, { note: noteDraft.trim() || undefined }); setNoteOpen(false); onMutate && onMutate(); };
  const addDoc = () => {
    if (!aName.trim()) return;
    const docs = (rec.docs || []).concat({ name: aName.trim(), kind: aKind, date: today, by: c.owner });
    window.CredXCases.setItem(c.ref, item.id, { docs });
    setAName(''); setAttachOpen(false);
  };
  const onFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const added = files.map(f => ({ name: f.name, kind: aKind, date: today, by: c.owner }));
    const docs = (rec.docs || []).concat(added);
    window.CredXCases.setItem(c.ref, item.id, { docs });
    setAName(''); setAttachOpen(false);
  };
  const removeDoc = (i) => {
    const docs = (rec.docs || []).slice(); docs.splice(i, 1);
    window.CredXCases.setItem(c.ref, item.id, { docs });
  };
  const escalate = () => {
    if (!escReason.trim()) return;
    window.CredXCases.setItem(c.ref, item.id, { state: 'escalated', by: c.owner, date: today, note: escReason.trim() });
    const escs = (c.escalations || []).concat({ id: 'esc-' + Date.now(), itemId: item.id, reason: escReason.trim(), raisedBy: c.owner, date: today, status: 'open' });
    window.CredXCases.update(c.ref, { escalations: escs });
    setEscReason(''); setEscOpen(false);
  };
  const resolveEsc = () => {
    window.CredXCases.setItem(c.ref, item.id, { state: 'progress' });
    const escs = (c.escalations || []).map(e => e.itemId === item.id && e.status === 'open' ? { ...e, status: 'resolved', resolvedDate: today } : e);
    window.CredXCases.update(c.ref, { escalations: escs });
  };

  const docs = rec.docs || [];
  return (
    <div className={'uw-item' + (state === 'escalated' ? ' uw-item-esc' : '') + (uwHelpers.uwIsDone(state) ? ' uw-item-done' : '')}>
      <div className="uw-item-marker">
        <span className={'uw-dot uw-tone-' + ((window.UW_ITEM_STATES[state] || {}).tone || 'idle')}>
          {state === 'satisfied' ? '✓' : state === 'na' ? '–' : state === 'escalated' ? '⚑' : ''}
        </span>
      </div>
      <div className="uw-item-main">
        <div className="uw-item-label">
          {item.label}
          <span className="uw-item-id">{item.id}</span>
          {item.secondUw && <span className="uw-tag-2uw">2nd UW</span>}
        </div>
        <div className="uw-item-detail">{item.detail}</div>

        {rec.note && state !== 'escalated' && (
          <div className="uw-item-note">{rec.note}{rec.by ? ' — ' + rec.by : ''}</div>
        )}
        {state === 'escalated' && (
          <div className="uw-item-escbar">
            <span className="uw-escbar-l">⚑ Escalated to CRO</span>
            <span className="uw-escbar-t">{rec.note}</span>
            <button className="uw-mini-btn" onClick={resolveEsc}>Mark resolved</button>
          </div>
        )}

        {docs.length > 0 && (
          <div className="uw-item-docs">
            {docs.map((d, i) => (
              <span key={i} className="uw-doc-chip" title={d.kind + ' · ' + fmtDateShort(d.date)}>
                <span className="uw-doc-ic">▦</span>{d.name}
                <button className="uw-doc-x" onClick={() => removeDoc(i)} aria-label="Remove">✕</button>
              </span>
            ))}
          </div>
        )}

        {noteOpen && (
          <div className="uw-inline-form">
            <textarea className="wz-input wz-area" rows={2} value={noteDraft} placeholder="Add a note for the file…"
                      onChange={e => setNoteDraft(e.target.value)} autoFocus/>
            <div className="uw-inline-actions">
              <button className="uw-mini-btn" onClick={saveNote}>Save note</button>
              <button className="uw-mini-btn ghost" onClick={() => setNoteOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
        {attachOpen && (
          <div className="uw-inline-form">
            <div className={'uw-dropzone' + (aDrag ? ' drag' : '')}
                 onDragOver={e => { e.preventDefault(); setADrag(true); }}
                 onDragLeave={() => setADrag(false)}
                 onDrop={e => { e.preventDefault(); setADrag(false); onFiles(e.dataTransfer.files); }}
                 onClick={() => fileRef.current && fileRef.current.click()}>
              <input ref={fileRef} type="file" multiple className="uw-file-hidden"
                     onChange={e => { onFiles(e.target.files); e.target.value = ''; }}/>
              <span className="uw-dz-ic">⤓</span>
              <span className="uw-dz-main">Drag &amp; drop a file here, or <span className="uw-dz-link">browse</span></span>
              <span className="uw-dz-sub">PDF, JPG or PNG · or type a name below</span>
            </div>
            <div className="uw-attach-row">
              <input className="wz-input" placeholder="…or enter a document name manually" value={aName}
                     onChange={e => setAName(e.target.value)}
                     onKeyDown={e => { if (e.key === 'Enter') addDoc(); }}/>
              <button className="uw-mini-btn" onClick={addDoc}>Attach</button>
              <button className="uw-mini-btn ghost" onClick={() => setAttachOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
        {escOpen && (
          <div className="uw-inline-form">
            <textarea className="wz-input wz-area" rows={2} value={escReason} placeholder="Reason for escalation to CRO…"
                      onChange={e => setEscReason(e.target.value)} autoFocus/>
            <div className="uw-inline-actions">
              <button className="uw-mini-btn danger" onClick={escalate}>Escalate to CRO</button>
              <button className="uw-mini-btn ghost" onClick={() => setEscOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="uw-item-tools">
          <button className="uw-tool" onClick={() => { setNoteDraft(rec.note || ''); setNoteOpen(o => !o); }}>＋ Note</button>
          <button className="uw-tool" onClick={() => setAttachOpen(o => !o)}>＋ Attach</button>
          {state !== 'escalated' && <button className="uw-tool uw-tool-danger" onClick={() => setEscOpen(o => !o)}>⚑ Escalate</button>}
        </div>
      </div>
      <div className="uw-item-side">
        <UwStateSelect value={state} onChange={setState}/>
      </div>
    </div>
  );
}

// ── Stage card ────────────────────────────────────────────────────────────────
function StageCard({ c, stage, today, expanded, onToggle, onMutate, signoff }) {
  const st = uwHelpers.uwStageState(c, stage);
  const done = stage.items.filter(it => uwHelpers.uwIsDone(uwHelpers.uwItemState(c, it.id))).length;
  return (
    <div className={'uw-stage uw-stage-' + st}>
      <button className="uw-stage-head" onClick={onToggle}>
        <span className="uw-stage-num">{stage.n}</span>
        <div className="uw-stage-headmain">
          <div className="uw-stage-title">{stage.title}</div>
          <div className="uw-stage-meta">
            <span className="uw-area-tag">{stage.area}</span>
            <span className="muted small">{stage.role}</span>
            {stage.devOnly && <span className="uw-type uw-type-dev">Dev only</span>}
          </div>
        </div>
        <div className="uw-stage-right">
          <span className={'uw-stage-status uw-sstate-' + st}>
            {st === 'done' ? 'Complete' : st === 'escalated' ? 'Escalated' : st === 'current' ? 'In progress' : 'Not started'}
          </span>
          <span className="uw-stage-count">{done}/{stage.items.length}</span>
          <span className={'uw-chev' + (expanded ? ' open' : '')}>›</span>
        </div>
      </button>
      {expanded && (
        <div className="uw-stage-body">
          {stage.note && <div className="uw-stage-note">{stage.note}</div>}
          <div className="uw-evidence"><span className="muted small">Evidence required:</span> <span className="small">{stage.evidence}</span> · <span className="muted small">Escalation:</span> <span className="small">{stage.escalation}</span></div>
          {stage.items.map(it => (
            it.isSignoff
              ? <SignoffGate key={it.id} c={c} item={it} today={today}/>
              : it.isCall
              ? <SecurityCall key={it.id} c={c} item={it} today={today}/>
              : <ItemRow key={it.id} c={c} stage={stage} item={it} today={today} onMutate={onMutate}/>
          ))}
        </div>
      )}
    </div>
  );
}

// Security call (stage 10.1)
function SecurityCall({ c, item, today }) {
  const rec = (c.items && c.items[item.id]) || {};
  const done = rec.state === 'satisfied';
  const logCall = () => window.CredXCases.setItem(c.ref, item.id, { state: 'satisfied', by: c.owner, date: today, note: 'Security call completed via Teams — recording saved to file.', call: { done: true, date: today, covers: ['GDPR', 'Purpose', 'Amount', 'Term'] } });
  return (
    <div className={'uw-item uw-item-call' + (done ? ' uw-item-done' : '')}>
      <div className="uw-item-marker"><span className={'uw-dot uw-tone-' + (done ? 'ok' : 'idle')}>{done ? '✓' : '☎'}</span></div>
      <div className="uw-item-main">
        <div className="uw-item-label">{item.label}<span className="uw-item-id">{item.id}</span></div>
        <div className="uw-item-detail">{item.detail}</div>
        {done
          ? <div className="uw-call-done">Recorded {fmtDateShort(rec.date)} · covered GDPR · Purpose · Amount · Term</div>
          : <div className="uw-call-covers">{['GDPR confirmation', 'Loan purpose', 'Amount borrowed', 'Loan term'].map(x => <span key={x} className="uw-cover-chip">{x}</span>)}</div>}
      </div>
      <div className="uw-item-side">
        {!done && <button className="uw-mini-btn" onClick={logCall}>Log call</button>}
      </div>
    </div>
  );
}

// Sign-off gate (stage 10.2) — requires all prior items done.
function SignoffGate({ c, item, today }) {
  const all = uwHelpers.uwAllItems(c.loanType).filter(it => it.id !== '10.2');
  const outstanding = all.filter(it => !uwHelpers.uwIsDone(uwHelpers.uwItemState(c, it.id)));
  const rec = (c.items && c.items[item.id]) || {};
  const signed = rec.state === 'satisfied';
  const ready = outstanding.length === 0;
  const signOff = (role, who) => {
    window.CredXCases.setItem(c.ref, item.id, { state: 'satisfied', by: who, date: today, signoff: { role, by: who, date: today } });
    window.CredXCases.update(c.ref, { completed: true, completedDate: today });
  };
  return (
    <div className={'uw-signoff' + (signed ? ' done' : ready ? ' ready' : ' blocked')}>
      <div className="uw-signoff-head">
        <span className="uw-signoff-ic">{signed ? '✓' : '🔒'}</span>
        <div>
          <div className="uw-signoff-title">{item.label}<span className="uw-item-id">{item.id}</span></div>
          <div className="uw-item-detail">{item.detail}</div>
        </div>
      </div>
      {signed ? (
        <div className="uw-signoff-stamp">Signed off by {rec.signoff ? rec.signoff.by + ' (' + rec.signoff.role + ')' : c.owner} · {fmtDateShort(rec.date)} · funds released</div>
      ) : ready ? (
        <div className="uw-signoff-actions">
          <div className="muted small">All {all.length} underwriting points satisfied. Final authorisation required before funds release.</div>
          <div className="uw-signoff-btns">
            <button className="uw-signoff-btn" onClick={() => signOff('CRO', window.UW_PEOPLE.cro)}>Sign off as CRO ({window.UW_PEOPLE.cro})</button>
            <button className="uw-signoff-btn alt" onClick={() => signOff('CEO', window.UW_PEOPLE.ceo)}>Sign off as CEO ({window.UW_PEOPLE.ceo})</button>
          </div>
        </div>
      ) : (
        <div className="uw-signoff-blocked">
          <span className="uw-lock-txt">{outstanding.length} point{outstanding.length > 1 ? 's' : ''} outstanding before sign-off:</span>
          <div className="uw-block-list">{outstanding.slice(0, 6).map(it => <span key={it.id} className="uw-block-chip">{it.id} {it.label}</span>)}{outstanding.length > 6 && <span className="muted small">+{outstanding.length - 6} more</span>}</div>
        </div>
      )}
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────────
function ChecklistTab({ c, today }) {
  const stages = uwHelpers.uwStagesFor(c.loanType);
  const cur = uwHelpers.uwCurrentStage(c);
  const initial = {};
  stages.forEach(s => { const st = uwHelpers.uwStageState(c, s); initial[s.n] = (st === 'current' || st === 'escalated' || (cur && s.n === cur.n)); });
  if (cur) initial[cur.n] = true;
  const [exp, setExp] = cwState(initial);
  const [, force] = cwState(0);
  const toggle = (n) => setExp(e => ({ ...e, [n]: !e[n] }));
  const allOpen = stages.every(s => exp[s.n]);
  const setAll = (v) => { const o = {}; stages.forEach(s => o[s.n] = v); setExp(o); };

  return (
    <div className="uw-checklist">
      <UwStepper c={c} stages={stages} onJump={(n) => setExp(e => ({ ...e, [n]: true }))}/>
      <div className="uw-checklist-tools">
        <button className="uw-mini-btn ghost" onClick={() => setAll(!allOpen)}>{allOpen ? 'Collapse all' : 'Expand all'}</button>
      </div>
      {stages.map(s => (
        <StageCard key={s.n} c={c} stage={s} today={today} expanded={!!exp[s.n]} onToggle={() => toggle(s.n)} onMutate={() => force(x => x + 1)}/>
      ))}
    </div>
  );
}

function UwStepper({ c, stages, onJump }) {
  return (
    <div className="uw-stepper">
      {stages.map((s, i) => {
        const st = uwHelpers.uwStageState(c, s);
        return (
          <React.Fragment key={s.n}>
            {i > 0 && <span className={'uw-step-line uw-line-' + (st === 'done' ? 'done' : 'todo')}/>}
            <button className={'uw-step uw-step-' + st} onClick={() => onJump(s.n)} title={s.title}>
              <span className="uw-step-dot">{st === 'done' ? '✓' : st === 'escalated' ? '⚑' : s.n}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DocumentsTab({ c, today }) {
  const items = uwHelpers.uwAllItems(c.loanType);
  const docs = [];
  items.forEach(it => {
    const rec = (c.items && c.items[it.id]) || {};
    (rec.docs || []).forEach(d => docs.push({ ...d, stage: it.stage, point: it.id, pointLabel: it.label }));
  });
  (c.documents || []).forEach(d => docs.push({ ...d, point: '—', pointLabel: 'General case file' }));
  docs.sort((a, b) => (a.date < b.date ? 1 : -1));

  const [name, setName] = cwState('');
  const [kind, setKind] = cwState(DOC_KINDS[0]);
  const addGeneral = () => {
    if (!name.trim()) return;
    const list = (c.documents || []).concat({ name: name.trim(), kind, date: today, by: c.owner });
    window.CredXCases.update(c.ref, { documents: list });
    setName('');
  };
  return (
    <div className="uw-pane">
      <div className="uw-pane-head">
        <h3>Document vault</h3>
        <span className="muted small">{docs.length} document{docs.length !== 1 ? 's' : ''} on file</span>
      </div>
      <div className="uw-addbar">
        <input className="wz-input" placeholder="Document name…" value={name} onChange={e => setName(e.target.value)}/>
        <select className="wz-input" value={kind} onChange={e => setKind(e.target.value)}>{DOC_KINDS.map(k => <option key={k}>{k}</option>)}</select>
        <button className="uw-mini-btn" onClick={addGeneral}>Add to case file</button>
      </div>
      {docs.length === 0 ? <div className="empty-state">No documents stored yet.</div> : (
        <table className="uw-table">
          <thead><tr><th>Document</th><th>Type</th><th>Linked point</th><th>Added</th><th>By</th></tr></thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i}>
                <td><span className="uw-doc-ic">▦</span> {d.name}</td>
                <td><span className="uw-kind">{d.kind}</span></td>
                <td className="small">{d.point !== '—' ? <span className="uw-point-ref">{d.point}</span> : null} {d.pointLabel}</td>
                <td className="small muted">{fmtDateShort(d.date)}</td>
                <td className="small">{d.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ConditionsTab({ c, today }) {
  const conditions = c.conditions || [];
  const [type, setType] = cwState('CP');
  const [text, setText] = cwState('');
  const [due, setDue] = cwState('');
  const add = () => {
    if (!text.trim()) return;
    const list = conditions.concat({ id: 'cnd-' + Date.now(), type, text: text.trim(), due: due || null, status: 'open' });
    window.CredXCases.update(c.ref, { conditions: list });
    setText(''); setDue('');
  };
  const toggle = (id) => {
    const list = conditions.map(x => x.id === id ? { ...x, status: x.status === 'open' ? 'satisfied' : 'open', satisfiedDate: x.status === 'open' ? today : undefined } : x);
    window.CredXCases.update(c.ref, { conditions: list });
  };
  const remove = (id) => window.CredXCases.update(c.ref, { conditions: conditions.filter(x => x.id !== id) });
  const cps = conditions.filter(x => x.type === 'CP');
  const css = conditions.filter(x => x.type === 'CS');
  const Section = ({ title, list, sub }) => (
    <div className="uw-cond-sec">
      <div className="uw-cond-sectitle">{title} <span className="muted small">{sub}</span></div>
      {list.length === 0 ? <div className="empty-state small">None recorded.</div> : list.map(x => (
        <div key={x.id} className={'uw-cond' + (x.status === 'satisfied' ? ' sat' : '')}>
          <button className={'uw-cond-check' + (x.status === 'satisfied' ? ' on' : '')} onClick={() => toggle(x.id)}>{x.status === 'satisfied' ? '✓' : ''}</button>
          <div className="uw-cond-body">
            <div className="uw-cond-text">{x.text}</div>
            <div className="uw-cond-meta">
              {x.due && <span className={'uw-due' + (x.status === 'open' && x.due < today ? ' overdue' : '')}>Due {fmtDateShort(x.due)}</span>}
              {x.status === 'satisfied' && <span className="uw-sat-tag">Satisfied{x.satisfiedDate ? ' ' + fmtDateShort(x.satisfiedDate) : ''}</span>}
            </div>
          </div>
          <button className="uw-doc-x" onClick={() => remove(x.id)} aria-label="Remove">✕</button>
        </div>
      ))}
    </div>
  );
  return (
    <div className="uw-pane">
      <div className="uw-pane-head"><h3>Conditions</h3><span className="muted small">Precedent &amp; subsequent</span></div>
      <div className="uw-addbar">
        <select className="wz-input uw-narrow" value={type} onChange={e => setType(e.target.value)}><option value="CP">Precedent (CP)</option><option value="CS">Subsequent (CS)</option></select>
        <input className="wz-input" placeholder="Condition wording…" value={text} onChange={e => setText(e.target.value)}/>
        <input className="wz-input uw-narrow" type="date" value={due} onChange={e => setDue(e.target.value)}/>
        <button className="uw-mini-btn" onClick={add}>Add</button>
      </div>
      <Section title="Conditions Precedent" sub="before drawdown" list={cps}/>
      <Section title="Conditions Subsequent" sub="post-completion obligations" list={css}/>
    </div>
  );
}

function EscalationsTab({ c, today }) {
  const escs = c.escalations || [];
  const [reason, setReason] = cwState('');
  const [resolveId, setResolveId] = cwState(null);
  const [resolution, setResolution] = cwState('');
  const raise = () => {
    if (!reason.trim()) return;
    window.CredXCases.update(c.ref, { escalations: escs.concat({ id: 'esc-' + Date.now(), itemId: null, reason: reason.trim(), raisedBy: c.owner, date: today, status: 'open' }) });
    setReason('');
  };
  const resolve = (id) => {
    window.CredXCases.update(c.ref, { escalations: escs.map(e => e.id === id ? { ...e, status: 'resolved', resolvedDate: today, resolution: resolution.trim() || 'Resolved with CRO.' } : e) });
    setResolveId(null); setResolution('');
  };
  return (
    <div className="uw-pane">
      <div className="uw-pane-head"><h3>Escalations</h3><span className="muted small">CRO referrals &amp; resolutions</span></div>
      <div className="uw-callout">Escalate immediately on PEP / Sanction alerts, signs of money laundering, regulated loan purpose, or material adverse findings. No further steps until CRO guidance is documented.</div>
      <div className="uw-addbar">
        <input className="wz-input" placeholder="Raise a new escalation to the CRO…" value={reason} onChange={e => setReason(e.target.value)}/>
        <button className="uw-mini-btn danger" onClick={raise}>Raise to CRO</button>
      </div>
      {escs.length === 0 ? <div className="empty-state">No escalations on this case.</div> : escs.map(e => (
        <div key={e.id} className={'uw-esc' + (e.status === 'resolved' ? ' resolved' : '')}>
          <span className="uw-esc-ic">⚑</span>
          <div className="uw-esc-body">
            <div className="uw-esc-reason">{e.reason}</div>
            <div className="uw-esc-meta">
              {e.itemId && <span className="uw-point-ref">{e.itemId}</span>}
              <span className="small">Raised by {e.raisedBy} · {fmtDateShort(e.date)}</span>
              <span className={'uw-esc-status ' + e.status}>{e.status === 'open' ? 'Open' : 'Resolved' + (e.resolvedDate ? ' ' + fmtDateShort(e.resolvedDate) : '')}</span>
            </div>
            {e.resolution && <div className="uw-esc-resolution">Resolution: {e.resolution}</div>}
            {e.status === 'open' && resolveId === e.id && (
              <div className="uw-inline-form">
                <textarea className="wz-input wz-area" rows={2} placeholder="CRO guidance / resolution to document on file…" value={resolution} onChange={ev => setResolution(ev.target.value)}/>
                <div className="uw-inline-actions"><button className="uw-mini-btn" onClick={() => resolve(e.id)}>Save resolution</button><button className="uw-mini-btn ghost" onClick={() => setResolveId(null)}>Cancel</button></div>
              </div>
            )}
          </div>
          {e.status === 'open' && resolveId !== e.id && <button className="uw-mini-btn ghost" onClick={() => setResolveId(e.id)}>Resolve</button>}
        </div>
      ))}
    </div>
  );
}

function PostCompletionTab({ c, today, data }) {
  const loan = (data.LOANS || []).find(l => l.id === c.loanId);
  const css = (c.conditions || []).filter(x => x.type === 'CS');
  const log = c.contactLog || [];
  const vars = c.variations || [];
  const [note, setNote] = cwState('');
  const [channel, setChannel] = cwState('Call');
  const addLog = () => { if (!note.trim()) return; window.CredXCases.update(c.ref, { contactLog: log.concat({ id: 'cl-' + Date.now(), date: today, by: c.owner, channel, note: note.trim() }) }); setNote(''); };
  const [vType, setVType] = cwState('Extension');
  const [vDetail, setVDetail] = cwState('');
  const addVar = () => { if (!vDetail.trim()) return; window.CredXCases.update(c.ref, { variations: vars.concat({ id: 'v-' + Date.now(), date: today, type: vType, detail: vDetail.trim(), by: c.owner }) }); setVDetail(''); };

  const redemption = loan ? loan.expectedRedemption : null;
  const daysToMat = redemption ? daysFromAsOf(redemption, data.ASOF_DATE) : null;
  const M = (n) => n != null ? fmtGBP(n) : '—';

  return (
    <div className="uw-pane">
      <div className="uw-pane-head"><h3>Post-completion management</h3><span className="muted small">Completed {c.completedDate ? fmtDateShort(c.completedDate) : ''}</span></div>

      <div className="uw-pc-grid">
        <div className="uw-pc-stat"><div className="uw-pc-l">Gross facility</div><div className="uw-pc-v">{M(c.gross || (loan && loan.grossLoan))}</div></div>
        <div className="uw-pc-stat"><div className="uw-pc-l">Term</div><div className="uw-pc-v">{loan ? loan.termMonths + ' mo' : '—'}</div></div>
        <div className="uw-pc-stat"><div className="uw-pc-l">Expected redemption</div><div className="uw-pc-v">{redemption ? fmtDateShort(redemption) : '—'}</div></div>
        <div className="uw-pc-stat"><div className="uw-pc-l">Days to maturity</div><div className={'uw-pc-v' + (daysToMat != null && daysToMat <= 30 ? ' amber' : '')}>{daysToMat != null ? daysToMat + 'd' : '—'}</div></div>
        <div className="uw-pc-stat"><div className="uw-pc-l">Retained interest</div><div className="uw-pc-v">{M(loan && loan.retainedInterest)}</div></div>
        <div className="uw-pc-stat"><div className="uw-pc-l">Redemption figure</div><div className="uw-pc-v">{M(loan && (loan.grossLoan))}</div></div>
      </div>

      <div className="uw-pc-sec">
        <div className="uw-cond-sectitle">Conditions Subsequent <span className="muted small">ongoing obligations</span></div>
        {css.length === 0 ? <div className="empty-state small">None.</div> : css.map(x => (
          <div key={x.id} className={'uw-cond' + (x.status === 'satisfied' ? ' sat' : '')}>
            <span className={'uw-cond-check' + (x.status === 'satisfied' ? ' on' : '')}>{x.status === 'satisfied' ? '✓' : ''}</span>
            <div className="uw-cond-body"><div className="uw-cond-text">{x.text}</div><div className="uw-cond-meta">{x.due && <span className={'uw-due' + (x.status === 'open' && x.due < today ? ' overdue' : '')}>Due {fmtDateShort(x.due)}</span>}{x.status === 'satisfied' && <span className="uw-sat-tag">Satisfied</span>}</div></div>
          </div>
        ))}
      </div>

      <div className="uw-pc-cols">
        <div className="uw-pc-sec">
          <div className="uw-cond-sectitle">Variations &amp; redemptions</div>
          <div className="uw-addbar">
            <select className="wz-input uw-narrow" value={vType} onChange={e => setVType(e.target.value)}><option>Extension</option><option>Variation</option><option>Partial redemption</option><option>Redemption</option></select>
            <input className="wz-input" placeholder="Detail…" value={vDetail} onChange={e => setVDetail(e.target.value)}/>
            <button className="uw-mini-btn" onClick={addVar}>Log</button>
          </div>
          {vars.length === 0 ? <div className="empty-state small">No variations recorded.</div> : vars.map(v => (
            <div key={v.id} className="uw-logrow"><span className="uw-var-type">{v.type}</span><span className="uw-log-text">{v.detail}</span><span className="muted small">{fmtDateShort(v.date)}</span></div>
          ))}
        </div>

        <div className="uw-pc-sec">
          <div className="uw-cond-sectitle">Borrower contact log</div>
          <div className="uw-addbar">
            <select className="wz-input uw-narrow" value={channel} onChange={e => setChannel(e.target.value)}><option>Call</option><option>Email</option><option>Meeting</option><option>Note</option></select>
            <input className="wz-input" placeholder="Contact note…" value={note} onChange={e => setNote(e.target.value)}/>
            <button className="uw-mini-btn" onClick={addLog}>Add</button>
          </div>
          {log.length === 0 ? <div className="empty-state small">No contact logged.</div> : log.slice().reverse().map(l => (
            <div key={l.id} className="uw-logrow"><span className="uw-var-type alt">{l.channel}</span><span className="uw-log-text">{l.note}</span><span className="muted small">{l.by} · {fmtDateShort(l.date)}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Workspace shell ─────────────────────────────────────────────────────────────
function CaseWorkspace({ caseRef, data, openLoan, caseVer }) {
  const c = cwMemo(() => cwGet(caseRef), [caseRef, caseVer]);
  const [tab, setTab] = cwState('checklist');
  if (!c) return <div className="empty-state" style={{ margin: 40 }}>Case not found.</div>;
  const today = data.ASOF_DATE;
  const p = uwHelpers.uwProgress(c);
  const status = uwHelpers.uwCaseStatus(c);
  const cur = uwHelpers.uwCurrentStage(c);
  const openEsc = (c.escalations || []).filter(e => e.status === 'open').length;
  const loanInBook = (data.LOANS || []).some(l => l.id === c.loanId);

  const tabs = [
    ['checklist', 'Checklist', p.outstanding ? p.outstanding : null],
    ['documents', 'Documents', null],
    ['conditions', 'Conditions', (c.conditions || []).filter(x => x.status === 'open').length || null],
    ['escalations', 'Escalations', openEsc || null],
  ];
  if (c.completed) tabs.push(['post', 'Post-completion', null]);

  const reassign = () => {
    const names = window.UW_PEOPLE.underwriters;
    const i = names.indexOf(c.owner);
    window.CredXCases.update(c.ref, { owner: names[(i + 1) % names.length] });
  };

  return (
    <div className="uw-workspace">
      <div className="uw-ws-head">
        <div className="uw-ws-headtop">
          <div className="uw-ws-ident">
            <span className="uw-ws-ref">{c.ref}</span>
            <UwBadge status={status}/>
            {openEsc > 0 && <span className="uw-flag">⚑ {openEsc} open</span>}
            <span className={'uw-type uw-type-' + (c.loanType === 'Development' ? 'dev' : 'bridge')}>{c.loanType}</span>
          </div>
          {loanInBook && <button className="uw-mini-btn ghost" onClick={() => openLoan(c.loanId)}>Open loan {c.loanId} →</button>}
        </div>
        <div className="uw-ws-borrower">
          <Avatar name={c.borrower} size={40}/>
          <div>
            <div className="uw-ws-name">{c.borrower}</div>
            <div className="muted small">{c.entity} · {c.purpose} · {fmtGBP(c.gross)} · {c.security}</div>
          </div>
        </div>
        <div className="uw-ws-metarow">
          <div className="uw-ws-meta"><span className="uw-meta-l">Owner</span><button className="uw-owner-btn" onClick={reassign} title="Reassign"><Avatar name={c.owner} size={20}/>{c.owner}</button></div>
          {c.secondUw && <div className="uw-ws-meta"><span className="uw-meta-l">2nd UW</span><span className="small"><Avatar name={c.secondUw} size={20}/> {c.secondUw}</span></div>}
          <div className="uw-ws-meta"><span className="uw-meta-l">Opened</span><span className="small">{fmtDateShort(c.opened)}</span></div>
          <div className="uw-ws-meta"><span className="uw-meta-l">Target</span><span className={'small' + (!c.completed && c.target < today ? ' uw-overdue-txt' : '')}>{fmtDateShort(c.target)}</span></div>
          <div className="uw-ws-meta uw-ws-prog"><span className="uw-meta-l">Progress</span><div className="uw-ws-progbar"><UwBar pct={p.pct} tone={p.escalated ? 'danger' : status === 'Completed' ? 'ok' : 'progress'}/><span className="small strong">{p.pct}%</span></div></div>
        </div>
      </div>

      <div className="uw-tabs">
        {tabs.map(([id, label, badge]) => (
          <button key={id} className={'uw-tab' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>
            {label}{badge != null && <span className="uw-tab-badge">{badge}</span>}
          </button>
        ))}
      </div>

      <div className="uw-ws-body">
        {tab === 'checklist' && <ChecklistTab c={c} today={today}/>}
        {tab === 'documents' && <DocumentsTab c={c} today={today}/>}
        {tab === 'conditions' && <ConditionsTab c={c} today={today}/>}
        {tab === 'escalations' && <EscalationsTab c={c} today={today}/>}
        {tab === 'post' && <PostCompletionTab c={c} today={today} data={data}/>}
      </div>
    </div>
  );
}

// Compact panel for the loan drawer.
function UwDrawerPanel({ loanId, data, openCase, caseVer }) {
  const c = cwMemo(() => window.CredXCases.get(loanId), [loanId, caseVer]);
  if (!c) return null;
  const p = uwHelpers.uwProgress(c);
  const cur = uwHelpers.uwCurrentStage(c);
  const status = uwHelpers.uwCaseStatus(c);
  const openEsc = (c.escalations || []).filter(e => e.status === 'open').length;
  return (
    <div className="uw-drawerpanel">
      <div className="uw-dp-head">
        <div className="uw-dp-title">Underwriting case <span className="uw-ref">{c.ref}</span></div>
        <UwBadge status={status}/>
      </div>
      <div className="uw-dp-row">
        <UwBar pct={p.pct} tone={p.escalated ? 'danger' : status === 'Completed' ? 'ok' : 'progress'}/>
        <span className="small strong">{p.pct}%</span>
      </div>
      <div className="uw-dp-meta">
        <span>{cur ? 'Stage ' + cur.n + ' · ' + cur.title : 'All stages complete'}</span>
        <span className="muted small">{p.done}/{p.total} points{openEsc ? ' · ⚑ ' + openEsc + ' escalation' + (openEsc > 1 ? 's' : '') : ''}</span>
      </div>
      <button className="uw-dp-open" onClick={() => openCase(c.ref)}>Open underwriting case →</button>
    </div>
  );
}

Object.assign(window, { CaseWorkspace, UwDrawerPanel });
