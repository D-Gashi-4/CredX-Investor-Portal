// statement-builder.jsx — investor-facing "Build a statement" modal for the
// CredX investor portal. Lets the investor pick a custom date range and which
// sections to include, then download an official PDF (branded, letterheaded,
// signed) and/or a data export. All heavy lifting lives in:
//   • buildPortalStatementModel()  (data.jsx)  → normalised model
//   • openInvestorStatement()      (credx-statement-doc.js) → official PDF
//   • downloadStatementData()      (credx-statement-doc.js) → XLSX / CSV

const STMT_SECTIONS = [
  ["summary",  "Holdings summary",          "Headline capital, interest realised & accruing."],
  ["active",   "Active positions",          "Every live facility, coupon, maturity & accrued interest."],
  ["redeemed", "Redeemed positions",        "Completed facilities and the interest you realised."],
  ["ledger",   "Transaction ledger",        "Capital out, capital & interest in, running balance."],
  ["tax",      "Interest by UK tax year",   "Realised interest grouped by tax year — handy for HMRC."],
];

// ── date helpers (return YYYY-MM-DD) ────────────────────────────
function _iso(d) { return d.toISOString().slice(0, 10); }
function _statementPresets() {
  const today = new Date();
  const y = today.getFullYear();
  // UK tax year starts 6 April
  const beforeApr6 = (today.getMonth() < 3) || (today.getMonth() === 3 && today.getDate() < 6);
  const taxStart = new Date(beforeApr6 ? y - 1 : y, 3, 6);
  const last12 = new Date(today); last12.setFullYear(last12.getFullYear() - 1);
  return [
    { id: "all",  label: "All time",        from: "",            to: "" },
    { id: "tax",  label: "This tax year",   from: _iso(taxStart), to: _iso(today) },
    { id: "ytd",  label: "Year to date",    from: _iso(new Date(y, 0, 1)), to: _iso(today) },
    { id: "12m",  label: "Last 12 months",  from: _iso(last12),  to: _iso(today) },
  ];
}

function StatementBuilderModal({ open, onClose }) {
  const presets = React.useMemo(_statementPresets, []);
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [activePreset, setActivePreset] = React.useState("all");
  const [include, setInclude] = React.useState({
    summary: true, active: true, redeemed: true, ledger: true, tax: true,
  });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setFrom(""); setTo(""); setActivePreset("all");
      setInclude({ summary: true, active: true, redeemed: true, ledger: true, tax: true });
    }
  }, [open]);

  const applyPreset = (p) => { setFrom(p.from); setTo(p.to); setActivePreset(p.id); };
  const onFrom = (v) => { setFrom(v); setActivePreset(null); };
  const onTo   = (v) => { setTo(v);   setActivePreset(null); };

  const toggle = (key) => setInclude(prev => ({ ...prev, [key]: !prev[key] }));
  const anySection = Object.values(include).some(Boolean);
  const rangeInvalid = from && to && from > to;
  const canBuild = anySection && !rangeInvalid;

  const model = () => window.buildPortalStatementModel({ from, to, include });

  const genPDF = () => {
    if (!canBuild) return;
    window.openInvestorStatement(model());
  };
  const genData = () => {
    if (!canBuild) return;
    setBusy(true);
    try { window.downloadStatementData(model()); }
    finally { setTimeout(() => setBusy(false), 400); }
  };

  const periodText = (!from && !to)
    ? "Full account history to date"
    : (from || "Inception") + "  →  " + (to || "Today");

  return (
    <Modal open={open} onClose={onClose} title="Build an investor statement" width={680}
      footer={
        <>
          <div style={{ fontSize: 12, color: rangeInvalid ? "var(--neg)" : "var(--ink-3)", marginRight: "auto" }}>
            {rangeInvalid ? "“From” date is after “To” date." : (!anySection ? "Select at least one section." : "Official document · letterheaded & signed by CredX.")}
          </div>
          <button className="btn" onClick={genData} disabled={!canBuild || busy}
            style={!canBuild ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
            <I.download /> {window.XLSX ? "Download data (Excel)" : "Download data (CSV)"}
          </button>
          <button className="btn btn-primary" onClick={genPDF} disabled={!canBuild}
            style={!canBuild ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
            <I.doc /> Generate official statement
          </button>
        </>
      }
    >
      <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
        Choose the period and the sections you'd like, then download an official, letterheaded
        statement (PDF) or the underlying data. Statements carry a unique reference and an
        authorised CredX signatory block.
      </p>

      {/* ── period ── */}
      <div className="eyebrow" style={{ marginBottom: 10 }}>Statement period</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {presets.map(p => {
          const on = activePreset === p.id;
          return (
            <button key={p.id} className="chip" aria-pressed={on} onClick={() => applyPreset(p)}
              style={on ? { borderColor: "var(--accent)", background: "var(--accent-tint)", color: "var(--accent-ink)" } : undefined}>
              {p.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
        <div className="field">
          <label>From</label>
          <input type="date" value={from} max={to || undefined} onChange={e => onFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>To</label>
          <input type="date" value={to} min={from || undefined} onChange={e => onTo(e.target.value)} />
        </div>
      </div>
      <div style={{
        padding: "9px 12px", background: "var(--bg-sunk)", border: "1px solid var(--border)",
        fontSize: 12.5, color: "var(--ink-2)", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <I.doc style={{ color: "var(--ink-3)" }} />
        <span>Covering: <strong className="mono" style={{ color: "var(--ink)" }}>{periodText}</strong></span>
      </div>

      {/* ── sections ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div className="eyebrow">Sections to include</div>
        <button className="btn-link-sm"
          style={{ fontSize: 12, color: "var(--accent)", background: "none", border: 0, cursor: "pointer", padding: 0 }}
          onClick={() => {
            const allOn = Object.values(include).every(Boolean);
            const next = {}; STMT_SECTIONS.forEach(([k]) => next[k] = !allOn);
            setInclude(next);
          }}>
          {Object.values(include).every(Boolean) ? "Clear all" : "Select all"}
        </button>
      </div>
      <div style={{ border: "1px solid var(--border)" }}>
        {STMT_SECTIONS.map(([key, label, desc], i) => {
          const on = include[key];
          return (
            <label key={key} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "13px 16px", cursor: "pointer",
              borderTop: i > 0 ? "1px solid var(--border)" : 0,
              background: on ? "var(--accent-tint)" : "var(--bg-elev)",
            }}>
              <input type="checkbox" checked={on} onChange={() => toggle(key)}
                style={{ width: 17, height: 17, accentColor: "var(--accent)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: on ? "var(--accent-ink)" : "var(--ink)" }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
              </div>
            </label>
          );
        })}
      </div>
    </Modal>
  );
}

Object.assign(window, { StatementBuilderModal });
