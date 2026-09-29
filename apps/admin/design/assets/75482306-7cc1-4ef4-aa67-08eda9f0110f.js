// credx-investor-page.jsx — full-page investor record (opens in its own tab).
// Tabs: Overview · Statement of account · Allocations · Profile & documents.
// Includes the New allocation flow and Facility Agreement generation.
// Relies on globals from the backend app: fmtGBP, fmtPct, fmtDate,
// fmtDateShort, daysFromAsOf, Avatar, Btn, DataTable, MaturityChip, etc.

// ---- date helpers ----
function faAddMonths(iso, n) {
  if (!iso) return null;
  const d = new Date(iso); d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

// All allocations for an investor: seed book + any added via New allocation,
// minus any seed allocations pulled off a pre-completion deal in the backend
// (recorded in the shared bridge so the removal reaches this page too).
function getInvestorAllocations(ref) {
  const removed = window.CredXBridge ? window.CredXBridge.getRemovedAllocs() : [];
  const isRemoved = (a) => window.CredXBridge ? removed.includes(window.CredXBridge.seedAllocKey(a)) : false;
  const seed = (window.CREDX_DATA.ALLOCATIONS || []).filter(a => a.investorRef === ref && !isRemoved(a));
  const live = (window.CredXBridge ? window.CredXBridge.getAllocations() : []).filter(a => a.investorRef === ref);
  return [...live, ...seed];
}

// Build a bank-statement-style ledger from an investor's allocations:
// capital deployed (out), monthly interest (in), capital returned (in),
// with running "capital deployed" and "interest to date" balances.
function buildInvestorLedger(allocs, loanById, asOfISO) {
  const asOf = new Date(asOfISO);
  const txns = [];
  allocs.forEach(a => {
    const loan = loanById[a.loanId] || {};
    const borrower = loan.borrower || a.loanId;
    if (a.fundingDate) {
      txns.push({ date: a.fundingDate, loanId: a.loanId, borrower, type: "Capital",
        desc: "Capital deployed", out: a.amount, in: 0 });
    }
    const rate = a.rate != null ? a.rate : (loan.investorRate || 0);
    const monthly = a.monthlyInterest != null ? a.monthlyInterest : (a.amount * rate / 12);
    const redeem = a.expectedRedemption ? new Date(a.expectedRedemption) : null;
    if (a.fundingDate) {
      let cursor = faAddMonths(a.fundingDate, 1), guard = 0;
      while (cursor && new Date(cursor) <= asOf && (!redeem || new Date(cursor) <= redeem) && guard < 120) {
        txns.push({ date: cursor, loanId: a.loanId, borrower, type: "Interest",
          desc: "Interest received", out: 0, in: monthly });
        cursor = faAddMonths(cursor, 1); guard++;
      }
    }
    const redeemed = (a.status || "").toLowerCase() === "redeemed" || (redeem && redeem <= asOf);
    if (redeemed && a.expectedRedemption) {
      txns.push({ date: a.expectedRedemption, loanId: a.loanId, borrower, type: "Capital",
        desc: "Capital returned", out: 0, in: a.amount });
    }
  });
  // Actual extension-interest distributions released to this investor sit
  // alongside the projected monthly interest — they are real cash movements.
  const ref = allocs.length ? allocs[0].investorRef : null;
  if (ref && window.CredXServicing) {
    const seen = new Set();
    allocs.forEach(a => seen.add(a.loanId));
    seen.forEach(loanId => {
      const loan = loanById[loanId] || {};
      window.CredXServicing.getReceipts(loanId).forEach(r => {
        if (r.coverType !== "extension") return;
        r.distributions.filter(d => d.investorRef === ref && d.paidDate).forEach(d => {
          txns.push({
            date: d.paidDate, loanId, borrower: loan.borrower || loanId, type: "Interest",
            desc: "Extension interest · " + (r.coverMonths || 1) + " month" + ((r.coverMonths || 1) === 1 ? "" : "s"),
            out: 0, in: d.amount,
          });
        });
      });
    });
  }
  txns.sort((x, y) => x.date < y.date ? -1 : x.date > y.date ? 1 : 0);
  let deployed = 0, interest = 0;
  txns.forEach(t => {
    if (t.type === "Capital" && t.out) deployed += t.out;
    if (t.type === "Capital" && t.in) deployed -= t.in;
    if (t.type === "Interest") interest += t.in;
    t.deployed = deployed; t.interestToDate = interest;
  });
  return txns;
}

// ---- Facility Agreement ----
function generateFacilityAgreement(investor, alloc, loan) {
  const portion = loan && loan.grossLoan ? (alloc.amount / loan.grossLoan * 100) : null;
  const rate = alloc.rate != null ? alloc.rate : (loan ? loan.investorRate : 0);
  const data = {
    funderName: investor.name,
    funderAddress: investor.address || "",
    funderEmail: investor.email,
    customerName: loan ? loan.borrower : "",
    funderPortionPct: portion,
    interestRate: rate != null ? rate * 100 : null,
    loanAmount: alloc.amount,
    securityProperty: (loan && loan.securityProperty) || "",
    loanRef: alloc.loanId,
    facilityRef: loan && loan.facilityRef ? loan.facilityRef : ("CX-FA-" + alloc.loanId),
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
  };
  if (window.CredXBridge) {
    window.CredXBridge.addAgreement({
      investorRef: investor.ref, loanId: alloc.loanId, allocId: alloc.id || null,
      funderName: investor.name, amount: alloc.amount, ref: data.facilityRef,
    });
  }
  const html = window.buildFacilityAgreementHTML(data);
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}

// ───────────────────────── New allocation modal ─────────────────────────
function NewAllocationModal({ investor, data, onClose, onCreated }) {
  const eligible = data.LOANS.filter(l => l.status === "Pipeline" || l.status === "Active");
  const [loanId, setLoanId] = React.useState(eligible[0] ? eligible[0].id : "");
  const loan = data.LOANS.find(l => l.id === loanId);
  const [amount, setAmount] = React.useState("");
  const [rate, setRate] = React.useState(loan ? String((loan.investorRate * 100).toFixed(1)).replace(/\.0$/, "") : "10");
  const [term, setTerm] = React.useState(loan ? String(loan.termMonths) : "6");
  const [fundDate, setFundDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [genAgreement, setGenAgreement] = React.useState(true);

  React.useEffect(() => {
    if (loan) {
      setRate(String((loan.investorRate * 100).toFixed(1)).replace(/\.0$/, ""));
      setTerm(String(loan.termMonths));
    }
  }, [loanId]);

  const amt = parseFloat(amount) || 0;
  const rateDec = (parseFloat(rate) || 0) / 100;
  const months = parseInt(term, 10) || 0;
  const monthly = amt * rateDec / 12;
  const totalInterest = monthly * months;
  const portionPct = loan && loan.grossLoan ? (amt / loan.grossLoan * 100) : 0;
  const overcommit = loan && amt > loan.grossLoan;
  const canCreate = loanId && amt > 0 && months > 0;

  const create = () => {
    if (!canCreate) return;
    const alloc = {
      investorRef: investor.ref, loanId, amount: amt, rate: rateDec, termMonths: months,
      fundingDate: fundDate, expectedRedemption: faAddMonths(fundDate, months),
      monthlyInterest: monthly, totalInterest, totalRepayment: amt + totalInterest, status: "Active",
    };
    const id = window.CredXBridge ? window.CredXBridge.addAllocation(alloc) : null;
    if (genAgreement) generateFacilityAgreement(investor, { ...alloc, id }, loan);
    onCreated && onCreated();
    onClose();
  };

  const moneyField = (val, set, ph) => {
    const has = val !== "" && !isNaN(parseFloat(val));
    return <input className="wz-input" inputMode="numeric"
      value={has ? "£" + Math.round(parseFloat(val)).toLocaleString("en-GB") : ""}
      placeholder={ph || "£0"}
      onChange={e => { const d = e.target.value.replace(/[^0-9]/g, ""); set(d === "" ? "" : d); }} />;
  };

  return (
    <div className="pub-backdrop" onClick={onClose}>
      <div className="pub-modal" style={{ width: "min(640px,100%)" }} onClick={e => e.stopPropagation()}>
        <div className="pub-head">
          <div>
            <div className="pub-head-title">New allocation <span className="wz-ref">{investor.ref}</span></div>
            <div className="muted small">{investor.name} · link this investor to a loan</div>
          </div>
          <button className="wz-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pub-body">
          <div className="wz-grid wz-g2">
            <label className="wz-fld" style={{ gridColumn: "1 / -1" }}>
              <div className="wz-lbl">Deal</div>
              <select className="wz-input" value={loanId} onChange={e => setLoanId(e.target.value)}>
                {eligible.length === 0 && <option value="">No eligible loans</option>}
                {eligible.map(l => (
                  <option key={l.id} value={l.id}>{l.id} · {l.borrower} · {fmtGBP(l.grossLoan)} ({l.status})</option>
                ))}
              </select>
            </label>
            <label className="wz-fld">
              <div className="wz-lbl">Investment amount</div>
              {moneyField(amount, setAmount, "£0")}
              {loan && <div className="wz-hint">{overcommit ? "⚠ Exceeds gross loan of " + fmtGBP(loan.grossLoan) : "Funder's portion: " + portionPct.toFixed(1) + "% of " + fmtGBP(loan.grossLoan)}</div>}
            </label>
            <label className="wz-fld">
              <div className="wz-lbl">Investor rate (% p.a.)</div>
              <input className="wz-input" inputMode="decimal" value={rate}
                onChange={e => setRate(e.target.value.replace(/[^0-9.]/g, ""))} />
            </label>
            <label className="wz-fld">
              <div className="wz-lbl">Term (months)</div>
              <input className="wz-input" inputMode="numeric" value={term}
                onChange={e => setTerm(e.target.value.replace(/[^0-9]/g, ""))} />
            </label>
            <label className="wz-fld">
              <div className="wz-lbl">Funding date</div>
              <input className="wz-input" type="date" value={fundDate} onChange={e => setFundDate(e.target.value)} />
            </label>
          </div>

          <div className="alloc-calc">
            <div><span className="muted small">Monthly interest</span><div className="strong">{fmtGBP(monthly, { decimals: 2 })}</div></div>
            <div><span className="muted small">Total interest ({months}m)</span><div className="strong">{fmtGBP(totalInterest, { decimals: 2 })}</div></div>
            <div><span className="muted small">Expected redemption</span><div className="strong">{fmtDate(faAddMonths(fundDate, months))}</div></div>
            <div><span className="muted small">Total repayable</span><div className="strong accent">{fmtGBP(amt + totalInterest, { decimals: 2 })}</div></div>
          </div>

          <label className="pub-redact" style={{ marginTop: 4 }}>
            <input type="checkbox" checked={genAgreement} onChange={e => setGenAgreement(e.target.checked)} />
            Generate and open the populated Facility Agreement on create
          </label>
        </div>

        <div className="pub-foot">
          <div className="muted small">{canCreate ? "Ready to allocate." : "Pick a deal and enter an amount."}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="wz-btn wz-btn-link" onClick={onClose}>Cancel</button>
            <button className={"wz-btn wz-btn-primary" + (canCreate ? "" : " wz-btn-disabled")} disabled={!canCreate} onClick={create}>
              Create allocation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Official statement (employee) ────────────────
// Normalises an investor's allocations + ledger into the shared statement
// model (see credx-statement-doc.js). Honours a date range + section map so
// CredX staff can custom-build and download an official statement for any
// investor on the register.
function _empTaxYear(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const beforeApr6 = (d.getMonth() < 3) || (d.getMonth() === 3 && d.getDate() < 6);
  const start = beforeApr6 ? y - 1 : y;
  return start + "/" + String(start + 1).slice(2);
}

function buildEmployeeStatementModel(opts) {
  const { investor, allocs, loanById, asOf } = opts;
  const inc = Object.assign(
    { summary: true, positions: true, ledger: true, tax: true },
    opts.include || {}
  );
  const from = opts.from || "";
  const to   = opts.to   || "";
  const ledger = buildInvestorLedger(allocs, loanById, asOf);
  const inRange = (iso) => (!from || iso >= from) && (!to || iso <= to);
  const gbp = (n) => fmtGBP(n, { decimals: 0 });
  const fdate = (iso) => fmtDate(iso);
  const endLabel = fdate(to || asOf);
  const periodLabel = (from || to)
    ? (fdate(from) + " \u2013 " + endLabel)
    : ("Full account history to " + endLabel);

  const deployedNow   = ledger.length ? ledger[ledger.length - 1].deployed : 0;
  const interestToDate = ledger.length ? ledger[ledger.length - 1].interestToDate : 0;
  const monthly = allocs.reduce((s, a) => s + (a.monthlyInterest || 0), 0);
  const totalInvested = allocs.reduce((s, a) => s + (a.amount || 0), 0);

  const tables = [];

  if (inc.positions) {
    tables.push({
      id: "Allocations",
      title: "Allocations",
      note: allocs.length + " " + (allocs.length === 1 ? "position" : "positions"),
      columns: [
        { label: "Reference" }, { label: "Borrower" },
        { label: "Funded", align: "right" }, { label: "Redemption", align: "right" },
        { label: "Rate", align: "right" }, { label: "Term", align: "right" },
        { label: "Amount", align: "right" }, { label: "Interest", align: "right" },
      ],
      rows: allocs.map(a => {
        const loan = loanById[a.loanId] || {};
        const rate = a.rate != null ? a.rate : (loan.investorRate || 0);
        return [
          a.loanId, loan.borrower || "\u2014",
          a.fundingDate ? fdate(a.fundingDate) : "\u2014",
          a.expectedRedemption ? fdate(a.expectedRedemption) : "\u2014",
          (rate * 100).toFixed(rate * 100 % 1 ? 2 : 0) + "%",
          (a.termMonths || "\u2014") + "m",
          gbp(a.amount || 0), gbp(a.totalInterest || 0),
        ];
      }),
      total: ["Total", allocs.length + " positions", "", "", "", "", gbp(totalInvested),
        gbp(allocs.reduce((s, a) => s + (a.totalInterest || 0), 0))],
    });
  }

  if (inc.ledger) {
    const rows = ledger.filter(t => inRange(t.date)).map(t => [
      fdate(t.date), t.loanId, t.borrower, t.desc,
      t.out ? gbp(t.out) : "\u2014",
      t.in ? gbp(t.in) : "\u2014",
      gbp(t.deployed),
    ]);
    const sumIn  = ledger.filter(t => inRange(t.date)).reduce((s, t) => s + t.in, 0);
    const sumOut = ledger.filter(t => inRange(t.date)).reduce((s, t) => s + t.out, 0);
    tables.push({
      id: "Transaction ledger",
      title: "Statement of account",
      note: rows.length + " transactions",
      columns: [
        { label: "Date" }, { label: "Reference" }, { label: "Borrower" }, { label: "Description" },
        { label: "Out", align: "right" }, { label: "In", align: "right" },
        { label: "Capital deployed", align: "right" },
      ],
      rows: rows.length ? rows : [["\u2014", "\u2014", "\u2014", "No transactions in this period", "\u2014", "\u2014", "\u2014"]],
      total: rows.length ? ["", "", "", "Period total", gbp(sumOut), gbp(sumIn), gbp(deployedNow)] : null,
    });
  }

  if (inc.tax) {
    const byYear = {};
    ledger.filter(t => t.type === "Interest" && t.in && inRange(t.date)).forEach(t => {
      const ty = _empTaxYear(t.date);
      byYear[ty] = (byYear[ty] || 0) + t.in;
    });
    const years = Object.keys(byYear).sort();
    tables.push({
      id: "Interest by tax year",
      title: "Interest summary by UK tax year",
      note: "Interest received \u00b7 for the investor's records / HMRC",
      columns: [{ label: "UK tax year" }, { label: "Interest received", align: "right" }],
      rows: years.length
        ? years.map(y => [y, gbp(byYear[y])])
        : [["\u2014", "No interest received in this period"]],
      total: years.length ? ["Total", gbp(years.reduce((s, y) => s + byYear[y], 0))] : null,
    });
  }

  const summary = inc.summary ? [
    { label: "Capital deployed", value: gbp(deployedNow), sub: allocs.length + " allocations" },
    { label: "Interest to date", value: gbp(interestToDate), sub: "Received across the account" },
    { label: "Monthly income", value: gbp(monthly), sub: "Current run-rate" },
    { label: "Total invested", value: gbp(totalInvested), sub: "Across all allocations" },
  ] : [];

  return {
    docTitle: "Investor Statement",
    period: { label: periodLabel },
    investor: {
      name: investor.name,
      ref: investor.ref,
      classification: investor.classification || investor.type || "",
      email: investor.email,
      address: investor.address || "",
    },
    company: window.COMPANY,
    summary,
    tables,
    signatory: {
      name: "For and on behalf of CredX Ltd",
      title: "Funder Relations \u00b7 Authorised signatory",
    },
  };
}

const EMP_STMT_SECTIONS = [
  ["summary",   "Holdings summary",         "Capital deployed, interest to date, monthly income."],
  ["positions", "Allocations",              "Every position: amount, rate, term, projected interest."],
  ["ledger",    "Statement of account",     "Full transaction ledger with running capital balance."],
  ["tax",       "Interest by UK tax year",  "Interest received grouped by tax year."],
];

function StatementDownloadModal({ investor, allocs, loanById, asOf, from, to, onClose }) {
  const [f, setF] = React.useState(from || "");
  const [t, setT] = React.useState(to || "");
  const [include, setInclude] = React.useState({ summary: true, positions: true, ledger: true, tax: true });
  const toggle = (k) => setInclude(prev => ({ ...prev, [k]: !prev[k] }));
  const any = Object.values(include).some(Boolean);
  const rangeBad = f && t && f > t;
  const ok = any && !rangeBad;
  const model = () => buildEmployeeStatementModel({ investor, allocs, loanById, asOf, from: f, to: t, include });

  return (
    <div className="pub-backdrop" onClick={onClose}>
      <div className="pub-modal" style={{ width: "min(620px,100%)" }} onClick={e => e.stopPropagation()}>
        <div className="pub-head">
          <div>
            <div className="pub-head-title">Official statement <span className="wz-ref">{investor.ref}</span></div>
            <div className="muted small">{investor.name} · build &amp; download a signed investor statement</div>
          </div>
          <button className="wz-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pub-body">
          <div className="wz-grid wz-g2">
            <label className="wz-fld">
              <div className="wz-lbl">From</div>
              <input className="wz-input" type="date" value={f} max={t || undefined} onChange={e => setF(e.target.value)} />
            </label>
            <label className="wz-fld">
              <div className="wz-lbl">To</div>
              <input className="wz-input" type="date" value={t} min={f || undefined} onChange={e => setT(e.target.value)} />
            </label>
          </div>
          <div className="muted small" style={{ margin: "2px 0 14px" }}>
            {f || t ? ("Covering " + (f || "inception") + " \u2192 " + (t || "today")) : "Covering the full account history."}
          </div>

          <div className="wz-lbl" style={{ marginBottom: 8 }}>Sections to include</div>
          <div style={{ border: "1px solid var(--line, #e2e0d8)" }}>
            {EMP_STMT_SECTIONS.map(([key, label, desc], i) => (
              <label key={key} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", cursor: "pointer",
                borderTop: i > 0 ? "1px solid var(--line, #e8e6dd)" : 0,
                background: include[key] ? "rgba(17,122,130,.06)" : "transparent",
              }}>
                <input type="checkbox" checked={include[key]} onChange={() => toggle(key)}
                  style={{ width: 16, height: 16, accentColor: "#117a82", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div className="muted small" style={{ marginTop: 1 }}>{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="pub-foot">
          <div className="muted small">{rangeBad ? "\u201cFrom\u201d is after \u201cTo\u201d." : (any ? "Letterheaded \u00b7 signed \u00b7 unique reference." : "Pick at least one section.")}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={"wz-btn" + (ok ? "" : " wz-btn-disabled")} disabled={!ok}
              onClick={() => window.downloadStatementData(model())}>Export data</button>
            <button className={"wz-btn wz-btn-primary" + (ok ? "" : " wz-btn-disabled")} disabled={!ok}
              onClick={() => window.openInvestorStatement(model())}>Official statement →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Statement of account ─────────────────────────
function StatementOfAccount({ allocs, loanById, asOf, investor }) {
  const ledger = React.useMemo(() => buildInvestorLedger(allocs, loanById, asOf), [allocs, asOf]);
  const [view, setView] = React.useState("all");      // all | interest | capital
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [q, setQ] = React.useState("");
  const [dlOpen, setDlOpen] = React.useState(false);

  const rows = ledger.filter(t => {
    if (view === "interest" && t.type !== "Interest") return false;
    if (view === "capital" && t.type !== "Capital") return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (q) {
      const s = (t.loanId + " " + t.borrower + " " + t.desc).toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const sums = rows.reduce((a, t) => ({ in: a.in + t.in, out: a.out + t.out }), { in: 0, out: 0 });
  const interestToDate = ledger.length ? ledger[ledger.length - 1].interestToDate : 0;
  const deployedNow = ledger.length ? ledger[ledger.length - 1].deployed : 0;
  const clear = () => { setFrom(""); setTo(""); setQ(""); setView("all"); };

  const columns = [
    { key: "date", label: "Date", width: 110, render: r => fmtDateShort(r.date) },
    { key: "loanId", label: "Reference", width: 96, render: r => <span className="loan-id">{r.loanId}</span> },
    { key: "borrower", label: "Borrower", render: r => <span className="cell-ellipsis" title={r.borrower}>{r.borrower}</span> },
    { key: "desc", label: "Description", render: r => (
        <span className={"stmt-type stmt-" + r.type.toLowerCase()}>{r.desc}</span>) },
    { key: "out", label: "Out", width: 110, align: "right", render: r => r.out ? <span className="num stmt-out">{fmtGBP(r.out, { decimals: 2 })}</span> : <span className="muted">—</span> },
    { key: "in", label: "In", width: 110, align: "right", render: r => r.in ? <span className="num stmt-in">{fmtGBP(r.in, { decimals: 2 })}</span> : <span className="muted">—</span> },
    { key: "deployed", label: "Capital deployed", width: 130, align: "right", render: r => <span className="num">{fmtGBP(r.deployed, { decimals: 0 })}</span> },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="muted small">Generate an official, letterheaded statement for this investor — choose the period and sections.</div>
        <Btn variant="primary" onClick={() => setDlOpen(true)}>↓ Official statement</Btn>
      </div>

      <div className="agg-row" style={{ marginBottom: 18 }}>
        <div className="agg-card"><div className="agg-label">Capital deployed</div><div className="agg-val">{fmtGBP(deployedNow)}</div></div>
        <div className="agg-card"><div className="agg-label">Interest to date</div><div className="agg-val accent">{fmtGBP(interestToDate)}</div></div>
        <div className="agg-card"><div className="agg-label">Transactions</div><div className="agg-val">{ledger.length}</div></div>
        <div className="agg-card"><div className="agg-label">Statement period</div><div className="agg-val" style={{ fontSize: 15 }}>{ledger.length ? fmtDateShort(ledger[0].date) + " – " + fmtDateShort(asOf) : "—"}</div></div>
      </div>

      <div className="stmt-toolbar">
        <div className="seg">
          {[["all", "All transactions"], ["interest", "Interest"], ["capital", "Capital movements"]].map(([k, l]) => (
            <button key={k} className={"seg-btn" + (view === k ? " on" : "")} onClick={() => setView(k)}>{l}</button>
          ))}
        </div>
        <div className="stmt-filters">
          <label className="stmt-date">From <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label className="stmt-date">To <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
          <div className="stmt-search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="M11 11l3 3" /></svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search reference, borrower…" />
          </div>
          {(from || to || q || view !== "all") && <button className="btn-link-sm" onClick={clear}>Clear</button>}
        </div>
      </div>

      <div className="stmt-resultbar">
        <span>{rows.length} of {ledger.length} transactions</span>
        <span>In <strong className="stmt-in">{fmtGBP(sums.in, { decimals: 2 })}</strong> · Out <strong className="stmt-out">{fmtGBP(sums.out, { decimals: 2 })}</strong></span>
      </div>

      <DataTable columns={columns} rows={rows.map((r, i) => ({ ...r, _key: i }))} dense
        empty={ledger.length ? "No transactions match these filters." : "No transactions yet — add an allocation to start the account."} />

      {dlOpen && (
        <StatementDownloadModal
          investor={investor} allocs={allocs} loanById={loanById} asOf={asOf}
          from={from} to={to} onClose={() => setDlOpen(false)} />
      )}
    </div>
  );
}

// ───────────────────────── Allocations tab ─────────────────────────
// Per-allocation performance: live status (Active / Repaid), term progress,
// and interest accrued to date. Each row expands to "open up" the deal.
function allocPerf(a, loan, asOfISO) {
  const now = new Date(asOfISO);
  const start = a.fundingDate ? new Date(a.fundingDate) : null;
  const end = a.expectedRedemption ? new Date(a.expectedRedemption) : null;
  const repaid = (loan && /redeem|repaid/i.test(loan.status || "")) ||
                 /redeem|repaid/i.test(a.status || "") ||
                 (!!end && now >= end);
  const projected = a.totalInterest != null ? a.totalInterest : ((a.monthlyInterest || 0) * (a.termMonths || 0));
  let pct = 0, daysElapsed = 0, daysTotal = 0, daysToMaturity = null;
  if (start && end) {
    daysTotal = Math.max(1, Math.round((end - start) / 86400000));
    daysElapsed = Math.round((now - start) / 86400000);
    pct = Math.max(0, Math.min(1, daysElapsed / daysTotal));
    daysToMaturity = Math.round((end - now) / 86400000);
  }
  const accrued = repaid ? projected : projected * pct;
  if (repaid) pct = 1;
  return { repaid, start, end, pct, daysElapsed: Math.max(0, daysElapsed), daysTotal, daysToMaturity, accrued, projected, monthly: a.monthlyInterest || 0 };
}

function AllocPerfPanel({ inv, a, loan, perf, portion }) {
  const rate = a.rate != null ? a.rate : (loan ? loan.investorRate : 0);
  const detail = [
    ["Deal", a.loanId],
    ["Borrower", loan ? loan.borrower : "—"],
    ["Investor rate", fmtPct(rate, 1)],
    ["Term", (a.termMonths || "—") + " months"],
    ["Funded", a.fundingDate ? fmtDate(a.fundingDate) : "—"],
    [perf.repaid ? "Redeemed" : "Expected redemption", a.expectedRedemption ? fmtDate(a.expectedRedemption) : "—"],
    ["Portion of facility", portion != null ? portion.toFixed(1) + "%" : "—"],
    ["Loan status", loan ? (loan.status || "—") : "—"],
  ];
  return (
    <div className="ip-alloc-perf">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <div className="muted small">
          {perf.repaid
            ? "Facility redeemed in full" + (a.expectedRedemption ? " · " + fmtDate(a.expectedRedemption) : "")
            : (perf.daysToMaturity != null
                ? "Day " + perf.daysElapsed + " of " + perf.daysTotal + " · " + perf.daysToMaturity + " days to maturity"
                : "In progress")}
        </div>
        <div className="muted small">{Math.round(perf.pct * 100)}% of term elapsed</div>
      </div>
      <div className="alloc-bar-wrap" style={{ marginBottom: 16 }}>
        <div className="alloc-bar-fill" style={{ width: (perf.pct * 100) + "%", background: perf.repaid ? "var(--green, #3b6a3b)" : "var(--teal-600)" }} />
      </div>

      <div className="agg-row" style={{ marginBottom: 16 }}>
        <div className="agg-card"><div className="agg-label">Capital deployed</div><div className="agg-val">{fmtGBP(a.amount)}</div></div>
        <div className="agg-card"><div className="agg-label">Interest accrued to date</div><div className="agg-val" style={{ color: "var(--teal-700)" }}>{fmtGBP(perf.accrued, { decimals: 0 })}</div></div>
        <div className="agg-card"><div className="agg-label">{perf.repaid ? "Interest earned" : "Projected interest"}</div><div className="agg-val">{fmtGBP(perf.projected, { decimals: 0 })}</div></div>
        <div className="agg-card"><div className="agg-label">{perf.repaid ? "Status" : "Monthly income"}</div><div className="agg-val">{perf.repaid ? "Repaid" : fmtGBP(perf.monthly, { decimals: 0 })}</div></div>
      </div>

      <div className="alloc-detail-grid" style={{ marginBottom: 16 }}>
        {detail.map(([l, v]) => (
          <div key={l}><span className="muted small">{l}</span>{v}</div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="ghost" onClick={() => generateFacilityAgreement(inv, a, loan)}>Facility agreement</Btn>
      </div>
    </div>
  );
}

function AllocationsTab({ inv, allocs, loanById, asOf }) {
  const [filter, setFilter] = React.useState("all");
  const [openKey, setOpenKey] = React.useState(null);

  const rows = allocs.map((a, i) => {
    const loan = loanById[a.loanId];
    return { a, key: a.id || (a.loanId + "-" + i), loan, perf: allocPerf(a, loan, asOf) };
  });
  const counts = {
    all: rows.length,
    active: rows.filter(r => !r.perf.repaid).length,
    repaid: rows.filter(r => r.perf.repaid).length,
  };
  const list = rows.filter(r => filter === "all" || (filter === "active" ? !r.perf.repaid : r.perf.repaid));
  const totals = list.reduce((s, r) => ({
    amount: s.amount + (r.a.amount || 0),
    accrued: s.accrued + r.perf.accrued,
    monthly: s.monthly + (r.perf.repaid ? 0 : r.perf.monthly),
  }), { amount: 0, accrued: 0, monthly: 0 });

  const segs = [["all", "All"], ["active", "Active"], ["repaid", "Repaid"]];

  return (
    <div>
      <div className="section-head" style={{ borderBottom: 0, paddingBottom: 4 }}>Allocations</div>
      <div className="stmt-toolbar">
        <div className="seg">
          {segs.map(([k, l]) => (
            <button key={k} className={"seg-btn" + (filter === k ? " on" : "")} onClick={() => { setFilter(k); setOpenKey(null); }}>
              {l} <span style={{ opacity: 0.55 }}>{counts[k]}</span>
            </button>
          ))}
        </div>
        <div className="section-meta">
          {fmtGBP(totals.amount)} deployed · {fmtGBP(totals.accrued, { decimals: 0 })} interest accrued{totals.monthly ? " · " + fmtGBP(totals.monthly, { decimals: 0 }) + "/mo" : ""}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">No {filter === "all" ? "" : filter + " "}allocations{filter === "all" ? ". Use “New allocation” to link this investor to a loan." : "."}</div>
      ) : (
        <div className="ip-alloc-list">
          {list.map(({ a, key, loan, perf }) => {
            const open = openKey === key;
            const portion = loan && loan.grossLoan ? (a.amount / loan.grossLoan * 100) : null;
            return (
              <div key={key} className="ip-alloc-item">
                <div className={"ip-alloc-row" + (open ? " open" : "")} role="button" tabIndex={0}
                  onClick={() => setOpenKey(open ? null : key)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenKey(open ? null : key); } }}>
                  <div style={{ minWidth: 0 }}>
                    <span className="loan-id">{a.loanId}</span>
                    <div className="strong">{loan ? loan.borrower : "—"}</div>
                    <div className="muted small">{fmtDate(a.fundingDate)} → {fmtDate(a.expectedRedemption)}{portion != null ? " · " + portion.toFixed(1) + "% of facility" : ""}</div>
                  </div>
                  <div className="num"><strong>{fmtGBP(a.amount)}</strong><div className="muted small">{fmtPct(a.rate != null ? a.rate : (loan ? loan.investorRate : 0), 1)} · {a.termMonths}m</div></div>
                  <div className="num">{fmtGBP(perf.accrued, { decimals: 0 })}<div className="muted small">{perf.repaid ? "interest earned" : "accrued of " + fmtGBP(perf.projected, { decimals: 0 })}</div></div>
                  <div className="alloc-actions">
                    <span className={"alloc-pill " + (perf.repaid ? "repaid" : "active")}>{perf.repaid ? "Repaid" : "Active"}</span>
                    <span className={"alloc-chev" + (open ? " open" : "")}>›</span>
                  </div>
                </div>
                {open && <AllocPerfPanel inv={inv} a={a} loan={loan} perf={perf} portion={portion} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Investor page ─────────────────────────
function InvestorPage({ investorRef, data, onBack, embedded }) {
  const [tab, setTab] = React.useState("overview");
  const [allocModal, setAllocModal] = React.useState(false);
  const [, tick] = React.useState(0);
  React.useEffect(() => window.CredXBridge ? window.CredXBridge.subscribe(() => tick(t => t + 1)) : undefined, []);

  const inv = data.INVESTORS.find(i => i.ref === investorRef);
  const loanById = React.useMemo(() => Object.fromEntries(data.LOANS.map(l => [l.id, l])), [data.LOANS]);
  const allocs = getInvestorAllocations(investorRef);

  if (!inv) {
    return <div className="ip-shell"><div className="ip-main"><div className="empty-state">Investor {investorRef} not found.</div></div></div>;
  }

  const totals = allocs.reduce((a, x) => ({
    amount: a.amount + x.amount, monthly: a.monthly + (x.monthlyInterest || 0), interest: a.interest + (x.totalInterest || 0),
  }), { amount: 0, monthly: 0, interest: 0 });
  const docs = window.CredXBridge ? window.CredXBridge.getInvestorDocs(investorRef) : [];
  const nda = window.CredXBridge ? window.CredXBridge.getNda(investorRef) : null;

  const tabs = [["overview", "Overview"], ["statement", "Statement of account"], ["allocations", "Allocations"], ["interest", "Interest received"], ["profile", "Profile & documents"]];

  return (
    <div className={"ip-shell" + (embedded ? " ip-embedded" : "")}>
      {!embedded && (
        <header className="ip-top">
          <div className="ip-top-inner">
            <button className="ip-back" onClick={onBack}>← Investor register</button>
            <div className="ip-brand"><span className="ip-mark">CRE<span>D</span>X</span><span className="ip-brand-sub">Fund management</span></div>
          </div>
        </header>
      )}

      <div className="ip-main">
        <div className="ip-hero">
          <Avatar name={inv.name} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ip-name">{inv.name}{inv.isInternal && <span className="internal-tag">internal</span>}</div>
            <div className="muted">{inv.ref} · {inv.contact} · <a href={"mailto:" + inv.email}>{inv.email}</a> · {inv.phone || "—"}</div>
          </div>
          <Btn variant="primary" icon="+" onClick={() => setAllocModal(true)}>New allocation</Btn>
        </div>

        <div className="ip-kpis">
          <div className="ip-kpi"><div className="agg-label">Total invested</div><div className="ip-kpi-val">{fmtGBP(totals.amount || inv.totalInvested)}</div></div>
          <div className="ip-kpi"><div className="agg-label">Allocations</div><div className="ip-kpi-val">{allocs.length}</div></div>
          <div className="ip-kpi"><div className="agg-label">Monthly income</div><div className="ip-kpi-val">{fmtGBP(totals.monthly, { decimals: 0 })}</div></div>
          <div className="ip-kpi"><div className="agg-label">Default rate</div><div className="ip-kpi-val accent">{fmtPct(inv.defaultRate, 1)}</div></div>
        </div>

        <div className="ip-tabs">
          {tabs.map(([k, l]) => (
            <button key={k} className={"ip-tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        <div className="ip-panel">
          {tab === "overview" && (
            <div>
              <div className="section-head">Holdings summary</div>
              <div className="contact-grid">
                <div><span className="muted small">Total invested</span><br />{fmtGBP(totals.amount || inv.totalInvested)}</div>
                <div><span className="muted small">Active allocations</span><br />{allocs.length}</div>
                <div><span className="muted small">Projected interest</span><br />{fmtGBP(totals.interest)}</div>
                <div><span className="muted small">Onboarded</span><br />{fmtDate(inv.onboarded) || "—"}</div>
              </div>
              {inv.notes && <><div className="section-head">Notes</div><div className="notes-box">{inv.notes}</div></>}
              <div className="section-head">NDA</div>
              <div className="muted small">{nda && nda.signed ? "Signed " + (nda.signedAt || "") + (nda.by ? " · " + nda.by : "") : "Not on file."}</div>
            </div>
          )}

          {tab === "statement" && <StatementOfAccount allocs={allocs} loanById={loanById} asOf={data.ASOF_DATE} investor={inv} />}

          {tab === "allocations" && (
            <AllocationsTab inv={inv} allocs={allocs} loanById={loanById} asOf={data.ASOF_DATE} />
          )}

          {tab === "interest" && window.InvestorInterestPanel && (
            <InvestorInterestPanel investorRef={investorRef} data={data} />
          )}

          {tab === "profile" && (
            <div>
              <div className="section-head">Contact</div>
              <div className="contact-grid">
                <div><span className="muted small">Contact name</span><br />{inv.contact}</div>
                <div><span className="muted small">Email</span><br /><a href={"mailto:" + inv.email}>{inv.email}</a></div>
                <div><span className="muted small">Phone</span><br />{inv.phone || "—"}</div>
                <div><span className="muted small">Address</span><br />{inv.address || "Not on file"}</div>
              </div>
              {/* Full investor-relations controls: approvals inbox, NDA upload
                  + mark-signed, and IR document upload (moved here from the
                  old drawer now that investors open as a full page). */}
              {window.InvestorProfileExtras
                ? <InvestorProfileExtras inv={inv} />
                : <div className="muted small" style={{ marginTop: 12 }}>Document tools unavailable.</div>}
            </div>
          )}
        </div>
      </div>

      {allocModal && <NewAllocationModal investor={inv} data={data} onClose={() => setAllocModal(false)} onCreated={() => tick(t => t + 1)} />}
    </div>
  );
}

Object.assign(window, { InvestorPage, NewAllocationModal, StatementOfAccount, generateFacilityAgreement, getInvestorAllocations });
