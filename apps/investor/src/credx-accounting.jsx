// credx-accounting.jsx — loan interest accounting: term extensions, interest
// receipts and investor distributions.
//
// Model: an extension does NOT change the debt. The borrower prepays the
// interest that would accrue over the requested months on the current
// principal at the existing borrower rate, plus an arrangement fee (% of
// principal) and a non-refundable application fee. An extension sits as
// "approved" until payment is recorded, at which point it activates and moves
// the redemption date. When interest lands it is distributed to investors: each
// gets their contractual entitlement at their own rate for the months covered,
// scaled down pro-rata if the receipt is short. Anything above the total
// entitlement, plus all fees, is CredX margin.
//
// Exposes window.LoanAccountingBlock and window.InvestorInterestPanel.

const ACC_METHODS = ['Bank transfer', 'Solicitor undertaking', 'Cheque', 'Card', 'Offset against retained'];

function useServicingVer() {
  const [ver, setVer] = React.useState(0);
  React.useEffect(() => {
    if (!window.CredXServicing) return;
    return window.CredXServicing.subscribe(() => setVer(v => v + 1));
  }, []);
  return ver;
}

function accCsv(rows) {
  return rows.map(r => r.map(c => {
    const s = c == null ? '' : String(c);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
}

function accDownload(name, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Extensions ────────────────────────────────────────────────────────────────
function ExtensionsPanel({ loan, allocations, asOf, readOnly }) {
  const [open, setOpen] = React.useState(false);
  const [months, setMonths] = React.useState(3);
  const [feePct, setFeePct] = React.useState(1);
  const [appFee, setAppFee] = React.useState(495);
  const [note, setNote] = React.useState('');
  const [payFor, setPayFor] = React.useState(null);
  const [payDate, setPayDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [payMethod, setPayMethod] = React.useState(ACC_METHODS[0]);
  const [payRef, setPayRef] = React.useState('');

  const exts = window.CredXServicing.getExtensions(loan.id);
  const quote = window.computeExtensionQuote(loan, months, {
    asOf,
    feePct: (Number(feePct) || 0) / 100,
    appFee: Number(appFee) || 0,
  });

  const submit = () => {
    if (!(Number(months) > 0)) return;
    window.CredXServicing.addExtension(loan.id, {
      months: Number(months),
      rate: quote.rate,
      principal: quote.principal,
      interest: quote.interest,
      feePct: quote.feePct,
      fee: quote.fee,
      appFee: quote.appFee,
      total: quote.total,
      fromDate: quote.fromDate,
      newRedemption: quote.newRedemption,
      note,
    });
    setOpen(false); setNote('');
  };

  const pay = (id) => {
    window.CredXServicing.payExtension(loan.id, id, {
      date: payDate, method: payMethod, reference: payRef,
    });
    setPayFor(null); setPayRef('');
  };

  const activeMonths = exts.filter(e => e.status === 'active').reduce((s, e) => s + e.months, 0);

  return (
    <div className="acc-block">
      <div className="section-head">Term extensions
        <span className="section-meta">
          {exts.length === 0 ? 'None granted'
            : exts.length + ' on record' + (activeMonths ? ' · +' + activeMonths + ' months' : '')}
        </span>
      </div>

      {exts.length === 0 ? (
        <div className="empty-state">No extensions on this facility.</div>
      ) : (
        <div className="acc-extlist">
          {exts.map(e => (
            <div className={'acc-ext acc-ext-' + e.status} key={e.id}>
              <div className="acc-ext-top">
                <div className="acc-ext-title">
                  <strong>{e.months}-month extension</strong>
                  <span className={'svc-pill svc-pill-' + (e.status === 'active' ? 'applied' : 'due')}>
                    {e.status === 'active' ? 'Paid ' + fmtDateShort(e.paidDate) : 'Approved — awaiting payment'}
                  </span>
                </div>
                <div className="acc-ext-total num">{fmtGBP(e.total, { decimals: 2 })}</div>
              </div>
              <div className="acc-ext-grid">
                <div><span className="muted small">Interest ({e.months}m @ {fmtPct(e.rate, 1)})</span><span className="num">{fmtGBP(e.interest, { decimals: 2 })}</span></div>
                <div><span className="muted small">Arrangement fee ({fmtPct(e.feePct, 2)})</span><span className="num">{fmtGBP(e.fee, { decimals: 2 })}</span></div>
                <div><span className="muted small">Application fee</span><span className="num">{fmtGBP(e.appFee, { decimals: 2 })}</span></div>
                <div><span className="muted small">Redemption moves to</span><span>{fmtDate(e.newRedemption)}</span></div>
              </div>
              {e.note && <div className="acc-ext-note muted small">{e.note}</div>}
              <div className="acc-ext-actions">
                {!readOnly && e.status === 'approved' && (payFor === e.id ? (
                  <div className="acc-form-inline">
                    <label className="acc-field">
                      <span className="muted small">Date received</span>
                      <input className="select" type="date" value={payDate} onChange={ev => setPayDate(ev.target.value)}/>
                    </label>
                    <label className="acc-field">
                      <span className="muted small">Method</span>
                      <select className="select" value={payMethod} onChange={ev => setPayMethod(ev.target.value)}>
                        {ACC_METHODS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </label>
                    <label className="acc-field acc-field-grow">
                      <span className="muted small">Reference</span>
                      <input className="select" type="text" placeholder="bank reference" value={payRef}
                             onChange={ev => setPayRef(ev.target.value)}/>
                    </label>
                    <div className="acc-form-btns">
                      <Btn variant="primary" onClick={() => pay(e.id)}>Record {fmtGBP(e.total, { decimals: 0 })} received</Btn>
                      <Btn variant="ghost" onClick={() => setPayFor(null)}>Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <Btn variant="primary" onClick={() => setPayFor(e.id)}>Record payment</Btn>
                ))}
                {!readOnly && payFor !== e.id && (
                  <button className="link-btn acc-danger" onClick={() => window.CredXServicing.removeExtension(loan.id, e.id)}>
                    {e.status === 'active' ? 'Reverse extension' : 'Withdraw'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div className="acc-form">
          <div className="acc-form-row">
            <label className="acc-field">
              <span className="muted small">Months requested</span>
              <input className="select" type="number" min="1" max="24" value={months}
                     onChange={e => setMonths(e.target.value)} autoFocus/>
            </label>
            <label className="acc-field">
              <span className="muted small">Arrangement fee %</span>
              <input className="select" type="number" min="0" step="0.25" value={feePct}
                     onChange={e => setFeePct(e.target.value)}/>
            </label>
            <label className="acc-field">
              <span className="muted small">Application fee (non-refundable)</span>
              <input className="select" type="number" min="0" step="5" value={appFee}
                     onChange={e => setAppFee(e.target.value)}/>
            </label>
            <label className="acc-field acc-field-grow">
              <span className="muted small">Note (optional)</span>
              <input className="select" type="text" placeholder="e.g. sale agreed, awaiting completion"
                     value={note} onChange={e => setNote(e.target.value)}/>
            </label>
          </div>
          <div className="acc-quote">
            <div className="acc-quote-head">Quote — debt unchanged at {fmtGBP(quote.principal)}</div>
            <div className="acc-quote-rows">
              <div><span>Interest, {quote.months} month{quote.months === 1 ? '' : 's'} @ {fmtPct(quote.rate, 1)}</span><span className="num">{fmtGBP(quote.interest, { decimals: 2 })}</span></div>
              <div><span>Arrangement fee</span><span className="num">{fmtGBP(quote.fee, { decimals: 2 })}</span></div>
              <div><span>Application fee</span><span className="num">{fmtGBP(quote.appFee, { decimals: 2 })}</span></div>
              <div className="acc-quote-total"><span>Payable up front</span><span className="num">{fmtGBP(quote.total, { decimals: 2 })}</span></div>
            </div>
            <div className="muted small">
              {fmtGBP(quote.monthlyInterest, { decimals: 2 })}/month · redemption {fmtDate(quote.fromDate)} → <strong>{fmtDate(quote.newRedemption)}</strong>
            </div>
          </div>
          <div className="acc-form-btns">
            <Btn variant="primary" onClick={submit}>Approve extension</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </div>
      ) : !readOnly ? (
        <div className="svc-actions">
          <Btn variant="ghost" icon="+" onClick={() => setOpen(true)}>Request extension</Btn>
        </div>
      ) : null}
    </div>
  );
}

// ── Interest receipts & distributions ─────────────────────────────────────────
function InterestLedgerPanel({ loan, allocations, investorName, readOnly }) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = React.useState('');
  const [method, setMethod] = React.useState(ACC_METHODS[0]);
  const [reference, setReference] = React.useState('');
  const [coverMonths, setCoverMonths] = React.useState(1);
  const [note, setNote] = React.useState('');
  const [expanded, setExpanded] = React.useState({});

  const receipts = window.CredXServicing.getReceipts(loan.id);

  const submit = () => {
    if (!(Number(amount) > 0)) return;
    window.CredXServicing.addReceipt(loan.id, {
      date, amount: Number(amount), method, reference,
      coverType: 'period', coverMonths: Number(coverMonths) || 1, note,
    });
    setOpen(false); setAmount(''); setReference(''); setNote('');
  };

  const calc = (r) => {
    const d = window.computeInterestDistribution(loan, allocations, r.amount, r.coverMonths || 1);
    window.CredXServicing.setDistributions(loan.id, r.id, d.rows);
    setExpanded(e => Object.assign({}, e, { [r.id]: true }));
  };

  const exportCsv = () => {
    const rows = [['Loan', 'Receipt date', 'Amount', 'Method', 'Reference', 'Covers', 'Months', 'Reconciled',
      'Investor', 'Entitlement', 'Distributed', 'Paid date']];
    receipts.forEach(r => {
      if (r.distributions.length === 0) {
        rows.push([loan.id, r.date, r.amount.toFixed(2), r.method, r.reference, r.coverType, r.coverMonths,
          r.reconciled ? 'Yes' : 'No', '', '', '', '']);
      }
      r.distributions.forEach(d => {
        rows.push([loan.id, r.date, r.amount.toFixed(2), r.method, r.reference, r.coverType, r.coverMonths,
          r.reconciled ? 'Yes' : 'No', investorName(d.investorRef), d.entitlement.toFixed(2),
          d.amount.toFixed(2), d.paidDate || '']);
      });
    });
    accDownload(loan.id + '-interest-ledger.csv', accCsv(rows));
  };

  return (
    <div className="acc-block">
      <div className="section-head">Interest received
        <span className="section-meta">
          {receipts.length === 0 ? 'Nothing received' : receipts.length + ' receipt' + (receipts.length === 1 ? '' : 's')}
        </span>
      </div>

      {receipts.length === 0 ? (
        <div className="empty-state">No interest payments recorded against this loan.</div>
      ) : (
        <div className="acc-rcplist">
          {receipts.map(r => {
            const allocated = r.distributions.reduce((s, d) => s + d.amount, 0);
            const paid = r.distributions.filter(d => d.paidDate).reduce((s, d) => s + d.amount, 0);
            const margin = Math.max(0, r.amount - allocated);
            const on = !!expanded[r.id];
            return (
              <div className="acc-rcp" key={r.id}>
                <div className="acc-rcp-head">
                  <button className="acc-rcp-toggle" onClick={() => setExpanded(e => Object.assign({}, e, { [r.id]: !on }))}>
                    <span className={'uw-chev' + (on ? ' open' : '')}>›</span>
                  </button>
                  <div className="acc-rcp-date">{fmtDateShort(r.date)}</div>
                  <div className="acc-rcp-desc">
                    <div>{r.coverType === 'extension' ? 'Extension interest' : 'Interest payment'}
                      {r.coverMonths ? <span className="muted small"> · {r.coverMonths} month{r.coverMonths === 1 ? '' : 's'}</span> : null}
                    </div>
                    <div className="muted small">{r.method}{r.reference ? ' · ' + r.reference : ''}{r.note ? ' · ' + r.note : ''}</div>
                  </div>
                  <div className="acc-rcp-amt num">{fmtGBP(r.amount, { decimals: 2 })}
                    {r.feesReceived > 0 && <div className="muted small">+ {fmtGBP(r.feesReceived, { decimals: 2 })} fees</div>}
                  </div>
                  <div className="acc-rcp-state">
                    {r.distributions.length === 0
                      ? <span className="svc-pill svc-pill-due">Undistributed</span>
                      : paid >= allocated - 0.005
                        ? <span className="svc-pill svc-pill-applied">Distributed</span>
                        : <span className="svc-pill svc-pill-current">{fmtGBP(allocated - paid, { decimals: 0 })} to release</span>}
                    <label className="acc-recon">
                      <input type="checkbox" checked={!!r.reconciled}
                             onChange={e => window.CredXServicing.setReceiptReconciled(loan.id, r.id, e.target.checked)}/>
                      <span className="muted small">Reconciled</span>
                    </label>
                  </div>
                  {readOnly ? <span/> : (
                    <button className="svc-led-x" title="Remove receipt"
                            onClick={() => window.CredXServicing.removeReceipt(loan.id, r.id)}>✕</button>)}
                </div>

                {on && (
                  <div className="acc-rcp-body">
                    {r.distributions.length === 0 ? (
                      <div className="acc-dist-empty">
                        <span className="muted small">
                          Split {fmtGBP(r.amount, { decimals: 2 })} across {allocations.length} investor
                          {allocations.length === 1 ? '' : 's'} for {r.coverMonths || 1} month
                          {(r.coverMonths || 1) === 1 ? '' : 's'} at their own rates.
                        </span>
                        {!readOnly && <Btn variant="primary" onClick={() => calc(r)}>Calculate split</Btn>}
                      </div>
                    ) : (
                      <>
                        <table className="acc-dist-table">
                          <thead>
                            <tr>
                              <th>Investor</th><th className="num">Capital</th><th className="num">Rate</th>
                              <th className="num">Entitlement</th><th className="num">Distributed</th><th>Status</th><th/>
                            </tr>
                          </thead>
                          <tbody>
                            {r.distributions.map(d => (
                              <tr key={d.investorRef}>
                                <td>{investorName(d.investorRef)}<div className="mono muted small">{d.investorRef}</div></td>
                                <td className="num">{fmtGBP((allocations.find(a => a.investorRef === d.investorRef) || {}).amount || 0)}</td>
                                <td className="num">{fmtPct((allocations.find(a => a.investorRef === d.investorRef) || {}).rate || 0, 2)}</td>
                                <td className="num">{fmtGBP(d.entitlement, { decimals: 2 })}</td>
                                <td className="num strong">{fmtGBP(d.amount, { decimals: 2 })}</td>
                                <td>{d.paidDate
                                  ? <span className="svc-pill svc-pill-applied">Paid {fmtDateShort(d.paidDate)}</span>
                                  : <span className="svc-pill svc-pill-due">Pending</span>}</td>
                                <td>{!readOnly && !d.paidDate && (
                                  <button className="svc-apply-btn"
                                          onClick={() => window.CredXServicing.markDistributionPaid(loan.id, r.id, d.investorRef)}>
                                    Release
                                  </button>)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={3}>CredX margin retained</td>
                              <td className="num">{fmtGBP(r.distributions.reduce((s, d) => s + d.entitlement, 0), { decimals: 2 })}</td>
                              <td className="num strong accent">{fmtGBP(margin, { decimals: 2 })}</td>
                              <td colSpan={2}/>
                            </tr>
                          </tfoot>
                        </table>
                        {!readOnly && allocated - paid > 0.005 && (
                          <div className="acc-form-btns">
                            <Btn variant="primary" onClick={() => window.CredXServicing.releaseAll(loan.id, r.id)}>
                              Release all — {fmtGBP(allocated - paid, { decimals: 2 })}
                            </Btn>
                            <button className="link-btn" onClick={() => calc(r)}>Recalculate</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {open ? (
        <div className="acc-form">
          <div className="acc-form-row">
            <label className="acc-field">
              <span className="muted small">Date received</span>
              <input className="select" type="date" value={date} onChange={e => setDate(e.target.value)}/>
            </label>
            <label className="acc-field">
              <span className="muted small">Amount</span>
              <input className="select" type="number" min="0" step="0.01" placeholder="£ amount" value={amount}
                     onChange={e => setAmount(e.target.value)} autoFocus/>
            </label>
            <label className="acc-field">
              <span className="muted small">Months covered</span>
              <input className="select" type="number" min="1" max="24" value={coverMonths}
                     onChange={e => setCoverMonths(e.target.value)}/>
            </label>
            <label className="acc-field">
              <span className="muted small">Method</span>
              <select className="select" value={method} onChange={e => setMethod(e.target.value)}>
                {ACC_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="acc-field acc-field-grow">
              <span className="muted small">Reference</span>
              <input className="select" type="text" placeholder="bank reference" value={reference}
                     onChange={e => setReference(e.target.value)}/>
            </label>
          </div>
          <div className="acc-form-btns">
            <Btn variant="primary" onClick={submit}>Record receipt</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </div>
      ) : (
        <div className="svc-actions">
          {!readOnly && <Btn variant="ghost" icon="+" onClick={() => setOpen(true)}>Record interest payment</Btn>}
          {receipts.length > 0 && <Btn variant="ghost" icon="↓" onClick={exportCsv}>Export ledger</Btn>}
        </div>
      )}
    </div>
  );
}

// ── Running interest account ──────────────────────────────────────────────────
function InterestAccountPanel({ loan, allocations, asOf }) {
  const acct = window.computeInterestAccount(loan, allocations, asOf);
  return (
    <div className="acc-block">
      <div className="section-head">Interest account
        <span className="section-meta">
          {acct.unreconciled > 0
            ? acct.unreconciled + ' receipt' + (acct.unreconciled === 1 ? '' : 's') + ' unreconciled'
            : 'All receipts reconciled'}
        </span>
      </div>
      <div className="svc-kpis acc-kpis">
        <div className="svc-kpi">
          <div className="muted small">Charged to borrower</div>
          <div className="big-num">{fmtGBP(acct.charged, { decimals: 2 })}</div>
          <div className="muted small">
            {fmtGBP(acct.chargedPeriods, { decimals: 0 })} monthly
            {acct.chargedExtensions > 0 ? ' · ' + fmtGBP(acct.chargedExtensions, { decimals: 0 }) + ' extensions' : ''}
          </div>
        </div>
        <div className="svc-kpi">
          <div className="muted small">Received</div>
          <div className="big-num">{fmtGBP(acct.received, { decimals: 2 })}</div>
          <div className="muted small">
            {acct.arrears > 0
              ? fmtGBP(acct.arrears, { decimals: 0 }) + ' in arrears'
              : acct.feesReceived > 0 ? '+ ' + fmtGBP(acct.feesReceived, { decimals: 0 }) + ' fees' : 'up to date'}
          </div>
        </div>
        <div className="svc-kpi">
          <div className="muted small">Paid to investors</div>
          <div className="big-num">{fmtGBP(acct.paidOut, { decimals: 2 })}</div>
          <div className="muted small">
            {acct.pendingRelease > 0.005 ? fmtGBP(acct.pendingRelease, { decimals: 0 }) + ' awaiting release'
              : acct.undistributed > 0.005 ? fmtGBP(acct.undistributed, { decimals: 0 }) + ' undistributed'
              : 'nothing pending'}
          </div>
        </div>
        <div className="svc-kpi">
          <div className="muted small">CredX retained</div>
          <div className="big-num accent">{fmtGBP(acct.marginRetained, { decimals: 2 })}</div>
          <div className="muted small">margin + fees</div>
        </div>
      </div>
      {acct.daysOverdue > 0 && (
        <div className="acc-warn">
          <strong>{acct.daysOverdue} days past redemption.</strong> Default interest of {fmtGBP(acct.defaultInterest, { decimals: 2 })}
          {' '}has accrued at {fmtPct(acct.accrual.rate + acct.accrual.defaultUplift, 1)}
          {' '}({fmtPct(acct.accrual.defaultUplift, 1)} uplift) and is included in the redemption figure.
        </div>
      )}
    </div>
  );
}

// ── Loan drawer block ─────────────────────────────────────────────────────────
function LoanAccountingBlock({ loan, allocations, investors, asOf }) {
  useServicingVer();
  const nameByRef = React.useMemo(() => {
    const m = {};
    (investors || []).forEach(i => { m[i.ref] = i.name; });
    return m;
  }, [investors]);
  const investorName = (ref) => nameByRef[ref] || ref;
  if (!loan || !window.CredXServicing) return null;
  // Past redemption the record stays fully visible but read-only.
  const readOnly = loan.status !== 'Active';
  return (
    <div className="acc-wrap">
      {readOnly && (
        <div className="acc-closed muted small">
          Loan {String(loan.status).toLowerCase()} — interest record shown for reference only.
        </div>
      )}
      <InterestAccountPanel loan={loan} allocations={allocations} asOf={asOf}/>
      <ExtensionsPanel loan={loan} allocations={allocations} asOf={asOf} readOnly={readOnly}/>
      <InterestLedgerPanel loan={loan} allocations={allocations} investorName={investorName} readOnly={readOnly}/>
    </div>
  );
}

// ── Investor drawer panel ─────────────────────────────────────────────────────
function InvestorInterestPanel({ investorRef, data }) {
  useServicingVer();
  if (!window.CredXServicing) return null;
  const rows = [];
  (data.LOANS || []).forEach(l => {
    window.CredXServicing.getReceipts(l.id).forEach(r => {
      r.distributions.filter(d => d.investorRef === investorRef).forEach(d => {
        rows.push({
          loanId: l.id, borrower: l.borrower, date: r.date, kind: r.coverType,
          months: r.coverMonths, entitlement: d.entitlement, amount: d.amount, paidDate: d.paidDate,
        });
      });
    });
  });
  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const paid = rows.filter(r => r.paidDate).reduce((s, r) => s + r.amount, 0);
  const pending = rows.filter(r => !r.paidDate).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="acc-block">
      <div className="section-head">Interest distributions
        <span className="section-meta">
          {fmtGBP(paid, { decimals: 2 })} received{pending > 0.005 ? ' · ' + fmtGBP(pending, { decimals: 2 }) + ' pending' : ''}
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">No interest distributions recorded yet.</div>
      ) : (
        <table className="acc-dist-table">
          <thead>
            <tr><th>Date</th><th>Loan</th><th>Covers</th><th className="num">Entitlement</th><th className="num">Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{fmtDateShort(r.date)}</td>
                <td><span className="mono">{r.loanId}</span><div className="muted small">{r.borrower}</div></td>
                <td>{r.kind === 'extension' ? 'Extension' : 'Interest'}{r.months ? ' · ' + r.months + 'm' : ''}</td>
                <td className="num">{fmtGBP(r.entitlement, { decimals: 2 })}</td>
                <td className="num strong">{fmtGBP(r.amount, { decimals: 2 })}</td>
                <td>{r.paidDate
                  ? <span className="svc-pill svc-pill-applied">Paid {fmtDateShort(r.paidDate)}</span>
                  : <span className="svc-pill svc-pill-due">Pending</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

Object.assign(window, { LoanAccountingBlock, InvestorInterestPanel });
