// CredX — Underwriting: shared UI bits + pipeline overview (list / board).
// Exposes: window.UwBadge, window.UwStatePill, window.UwBar, window.UnderwritingView
const { useState: uwUseState, useMemo: uwUseMemo } = React;

// Small status badge with tone colours.
function UwBadge({ status, tone }) {
  const t = tone || (window.uwHelpers ? window.uwHelpers.uwStatusTone(status) : 'idle');
  return <span className={'uw-badge uw-tone-' + t}>{status}</span>;
}

// Item-state pill (read-only display).
function UwStatePill({ state }) {
  const meta = (window.UW_ITEM_STATES || {})[state] || { short: state, tone: 'idle' };
  return <span className={'uw-spill uw-tone-' + meta.tone}>{meta.short}</span>;
}

// Progress bar.
function UwBar({ pct, tone }) {
  return (
    <div className="uw-bar">
      <div className={'uw-bar-fill uw-tone-' + (tone || 'progress')} style={{ width: Math.max(2, pct) + '%' }}/>
    </div>
  );
}

// ── Pipeline overview ─────────────────────────────────────────────────────────
function UnderwritingView({ data, cases, openCase }) {
  const [view, setView] = uwUseState(() => { try { return localStorage.getItem('credx-uw-view') || 'list'; } catch { return 'list'; } });
  const [q, setQ] = uwUseState('');
  const [filter, setFilter] = uwUseState('live'); // live | escalated | signoff | completed | all
  const H = window.uwHelpers;

  const setViewP = (v) => { setView(v); try { localStorage.setItem('credx-uw-view', v); } catch {} };

  const enriched = uwUseMemo(() => cases.map(c => {
    const p = H.uwProgress(c);
    const cur = H.uwCurrentStage(c);
    const status = H.uwCaseStatus(c);
    return { c, p, cur, status, openEsc: (c.escalations || []).filter(e => e.status === 'open').length };
  }), [cases]);

  const counts = uwUseMemo(() => ({
    live: enriched.filter(e => !e.c.completed).length,
    escalated: enriched.filter(e => e.status === 'Escalated').length,
    signoff: enriched.filter(e => e.status === 'Awaiting sign-off' || e.status === 'Ready to complete').length,
    completed: enriched.filter(e => e.c.completed).length,
    all: enriched.length,
  }), [enriched]);

  const rows = uwUseMemo(() => {
    let r = enriched;
    if (filter === 'live') r = r.filter(e => !e.c.completed);
    else if (filter === 'escalated') r = r.filter(e => e.status === 'Escalated');
    else if (filter === 'signoff') r = r.filter(e => e.status === 'Awaiting sign-off' || e.status === 'Ready to complete');
    else if (filter === 'completed') r = r.filter(e => e.c.completed);
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter(e => (e.c.borrower + ' ' + e.c.ref + ' ' + (e.c.loanId || '') + ' ' + e.c.owner).toLowerCase().includes(s));
    }
    return r;
  }, [enriched, filter, q]);

  const filterPills = [
    ['live', 'In flight', counts.live],
    ['escalated', 'Escalated', counts.escalated],
    ['signoff', 'At sign-off', counts.signoff],
    ['completed', 'Completed', counts.completed],
    ['all', 'All', counts.all],
  ];

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1>Underwriting</h1>
          <div className="view-sub">Case pipeline across the 10-stage process · {counts.live} in flight</div>
        </div>
        <div className="view-actions">
          <div className="uw-seg">
            <button className={'uw-seg-btn' + (view === 'list' ? ' on' : '')} onClick={() => setViewP('list')}>List</button>
            <button className={'uw-seg-btn' + (view === 'board' ? ' on' : '')} onClick={() => setViewP('board')}>Board</button>
          </div>
        </div>
      </div>

      <div className="uw-toolbar">
        <div className="pills">
          {filterPills.map(([id, label, n]) => (
            <button key={id} className={'pill' + (filter === id ? ' pill-on' : '')} onClick={() => setFilter(id)}>
              {label}{n != null && <span className="pill-count">{n}</span>}
            </button>
          ))}
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search borrower, case or owner…"/>
      </div>

      {view === 'list'
        ? <UwList rows={rows} openCase={openCase}/>
        : <UwBoard rows={rows} openCase={openCase}/>}
    </div>
  );
}

function UwList({ rows, openCase }) {
  if (!rows.length) return <div className="empty-state" style={{ margin: '40px 0' }}>No cases match.</div>;
  return (
    <div className="uw-list">
      <div className="uw-list-head">
        <div>Case</div><div>Borrower</div><div>Type</div><div>Current stage</div>
        <div>Progress</div><div>Owner</div><div>Target</div><div>Status</div>
      </div>
      {rows.map(({ c, p, cur, status, openEsc }) => (
        <button key={c.ref} className="uw-list-row" onClick={() => openCase(c.ref)}>
          <div className="uw-cell-ref">
            <div className="uw-ref">{c.ref}</div>
            {c.loanId && <div className="muted small">{c.loanId}</div>}
          </div>
          <div className="uw-cell-borrower">
            <Avatar name={c.borrower} size={28}/>
            <div className="cell-stack">
              <div className="strong">{c.borrower}</div>
              <div className="muted small">{c.entity}</div>
            </div>
          </div>
          <div><span className={'uw-type uw-type-' + (c.loanType === 'Development' ? 'dev' : 'bridge')}>{c.loanType}</span></div>
          <div className="uw-cell-stage">
            {cur ? <><span className="uw-stage-no">{cur.n}</span><span className="uw-stage-name">{cur.title}</span></>
                 : <span className="muted">All stages complete</span>}
          </div>
          <div className="uw-cell-prog">
            <UwBar pct={p.pct} tone={p.escalated ? 'danger' : 'progress'}/>
            <span className="uw-prog-txt">{p.done}/{p.total}</span>
          </div>
          <div className="uw-cell-owner"><Avatar name={c.owner} size={22}/><span className="small">{c.owner}</span></div>
          <div className="small muted">{fmtDateShort ? fmtDateShort(c.target) : fmtDate(c.target)}</div>
          <div className="uw-cell-status">
            <UwBadge status={status}/>
            {openEsc > 0 && <span className="uw-flag" title={openEsc + ' open escalation(s)'}>⚑ {openEsc}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

function UwBoard({ rows, openCase }) {
  const areas = window.UW_AREAS || [];
  const cols = [...areas, 'Completed'];
  const byCol = {};
  cols.forEach(a => byCol[a] = []);
  rows.forEach(e => {
    const col = e.c.completed ? 'Completed' : (e.cur ? e.cur.area : 'Completed');
    (byCol[col] = byCol[col] || []).push(e);
  });
  return (
    <div className="uw-board">
      {cols.map(col => (
        <div key={col} className="uw-col">
          <div className="uw-col-head">
            <span className="uw-col-title">{col}</span>
            <span className="uw-col-count">{byCol[col].length}</span>
          </div>
          <div className="uw-col-body">
            {byCol[col].length === 0 && <div className="uw-col-empty">—</div>}
            {byCol[col].map(({ c, p, cur, status, openEsc }) => (
              <button key={c.ref} className="uw-card" onClick={() => openCase(c.ref)}>
                <div className="uw-card-top">
                  <span className="uw-ref">{c.ref}</span>
                  <span className={'uw-type uw-type-' + (c.loanType === 'Development' ? 'dev' : 'bridge')}>{c.loanType}</span>
                </div>
                <div className="uw-card-borrower"><Avatar name={c.borrower} size={24}/><span className="strong small">{c.borrower}</span></div>
                <div className="uw-card-stage muted small">{cur ? cur.n + ' · ' + cur.title : 'Complete'}</div>
                <UwBar pct={p.pct} tone={p.escalated ? 'danger' : 'progress'}/>
                <div className="uw-card-foot">
                  <span className="muted small">{p.done}/{p.total}</span>
                  <div className="uw-card-foot-r">
                    {openEsc > 0 && <span className="uw-flag small">⚑ {openEsc}</span>}
                    <UwBadge status={status}/>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { UwBadge, UwStatePill, UwBar, UnderwritingView });
