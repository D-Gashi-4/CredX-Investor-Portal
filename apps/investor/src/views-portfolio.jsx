// views-portfolio.jsx - single Portfolio page with Active / Redeemed sub-tabs.
// "Active" is your live facilities; "Redeemed" is the historical archive.
// CredX adds positions to either tab on completion / on redemption.

function PortfolioView({ openDeal }) {
  const [tab, setTab] = React.useState("active");

  return (
    <div>
      {/* managed-by-CredX banner */}
      <div style={{
        marginTop: 24,
        padding: "14px 18px",
        background: "var(--bg-elev)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--accent)",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        fontSize: 12.5,
        color: "var(--ink-2)",
        lineHeight: 1.55,
      }}>
        <I.lock style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
        <div>
          <strong style={{ color: "var(--ink)" }}>Positions in this view are added and maintained by the CredX team.</strong>
          {" "}Once your funds reach the appointed solicitor's client account and the legal charge is registered on completion, the facility appears under <strong>Active</strong>; on redemption it moves to <strong>Redeemed</strong>. CredX never holds Funder capital - your money moves directly between your account and the solicitor.
        </div>
      </div>

      {/* sub-tabs */}
      <div style={{ marginTop: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {[
            ["active",   "Active",   LIVE_DEALS.length],
            ["redeemed", "Redeemed", COMPLETED_DEALS.length],
          ].map(([id, l, n]) => (
            <button key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "14px 0",
                marginRight: 28,
                fontSize: 14,
                fontWeight: tab === id ? 600 : 500,
                color: tab === id ? "var(--ink)" : "var(--ink-3)",
                borderBottom: "2px solid " + (tab === id ? "var(--accent)" : "transparent"),
                marginBottom: -1,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
              {l}
              <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11.5 }}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "active"   && <ActivePortfolio openDeal={openDeal} />}
      {tab === "redeemed" && <RedeemedPortfolio />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ACTIVE - live facilities
// ─────────────────────────────────────────────────────────────────
function ActivePortfolio({ openDeal }) {
  const [filter, setFilter] = React.useState("all");
  const [q, setQ] = React.useState("");
  const filtered = LIVE_DEALS.filter(d => {
    const matchFilter = filter === "all" || d.type.toLowerCase() === filter;
    const matchQ = !q || d.title.toLowerCase().includes(q.toLowerCase()) || d.id.toLowerCase().includes(q.toLowerCase());
    return matchFilter && matchQ;
  });

  const totalPos = filtered.reduce((s, d) => s + d.position, 0);
  const totalAccrued = filtered.reduce((s, d) => s + d.interestAccrued, 0);
  const wtdRate = filtered.length ? filtered.reduce((s, d) => s + d.rate * d.position, 0) / Math.max(totalPos, 1) : 0;

  return (
    <div>
      {/* summary KPIs */}
      <div className="kpi-grid" style={{ marginTop: 20 }}>
        <KPI label="Active positions" value={filtered.length} sub={"of " + LIVE_DEALS.length + " in book"} />
        <KPI label="Total capital out" value={compactGBPValue(totalPos)} unit="before" sub="across active facilities" />
        <KPI label="Weighted coupon" value={wtdRate.toFixed(2)} unit="after" sub="position-weighted" />
        <KPI label="Interest accrued" value={compactGBPValue(totalAccrued)} unit="before" sub="not yet paid" />
      </div>

      {/* filter bar */}
      <div className="filter-bar" style={{ marginTop: 24 }}>
        <div className="chip-grp">
          {[
            ["all", "All facilities", LIVE_DEALS.length],
            ["commercial", "Commercial", LIVE_DEALS.filter(d => d.type === "Commercial").length],
            ["residential", "Residential", LIVE_DEALS.filter(d => d.type === "Residential").length],
          ].map(([k, l, n]) => (
            <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {l} <span style={{ marginLeft: 6, color: "var(--ink-3)" }} className="mono">{n}</span>
            </button>
          ))}
        </div>
        <div className="search">
          <I.search />
          <input placeholder="Search by deal ID or title" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {/* table */}
      <div className="card" style={{ borderTop: 0, marginBottom: 32 }}>
        <table className="t">
          <thead>
            <tr>
              <th>Facility</th>
              <th>Property</th>
              <th className="right">Position</th>
              <th className="right">Coupon</th>
              <th className="right">LTV</th>
              <th className="right">Drawn</th>
              <th className="right">Maturity</th>
              <th>Term progress</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="row" onClick={() => openDeal(d)}>
                <td>
                  <div className="strong">{d.title}</div>
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>{d.id}</div>
                </td>
                <td>
                  <div style={{ fontSize: 13 }}>{d.property.split(" · ")[0]}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{d.property.split(" · ")[1]}</div>
                </td>
                <td className="num strong">{fmtGBP(d.position)}</td>
                <td className="num">{fmtPct(d.rate, 2)}</td>
                <td className="num">{(d.ltv * 100).toFixed(0)}%</td>
                <td className="num muted">{d.drawn}</td>
                <td className="num">{d.maturity}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 140 }}>
                    <div className="progress" style={{ flex: 1, height: 4 }}>
                      <span style={{ width: (d.progress * 100) + "%", background: d.status === "pending" ? "var(--warn)" : "var(--accent)" }} />
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{Math.round(d.progress * 100)}%</span>
                  </div>
                </td>
                <td><Status kind={d.status} /></td>
                <td className="right"><span className="iconbtn"><I.chevron /></span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="10" style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>No facilities match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// REDEEMED - historical archive
// ─────────────────────────────────────────────────────────────────
function RedeemedPortfolio() {
  const [year, setYear] = React.useState("all");
  const filtered = COMPLETED_DEALS.filter(d => year === "all" || d.redeemed.endsWith(year));

  const totalReturned   = filtered.reduce((s, d) => s + d.position, 0);
  const totalInterest   = filtered.reduce((s, d) => s + d.interestEarned, 0);
  const avgTerm         = filtered.length ? filtered.reduce((s, d) => s + d.actualTerm, 0) / filtered.length : 0;
  const realisedYield   = filtered.length
    ? (totalInterest / filtered.reduce((s, d) => s + d.position * d.actualTerm / 12, 1)) * 100
    : 0;

  // sort newest redemption first
  const sorted = [...filtered].sort((a, b) => parseDate(b.redeemed) - parseDate(a.redeemed));

  return (
    <div>
      {/* KPI strip */}
      <div className="kpi-grid" style={{ marginTop: 20 }}>
        <KPI label="Redemptions" value={filtered.length} sub="capital returned in full" />
        <KPI label="Capital returned" value={compactGBPValue(totalReturned)} unit="before" sub="lifetime" />
        <KPI label="Interest realised" value={compactGBPValue(totalInterest)} unit="before" sub="paid to your account" />
        <KPI label="Realised yield" value={realisedYield.toFixed(2)} unit="after" sub={"avg term " + avgTerm.toFixed(1) + " mo"} />
      </div>

      {/* cumulative interest chart */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Cumulative interest realised</div>
            <div className="h-card" style={{ color: "var(--ink)", fontFamily: "var(--ff-serif)", fontSize: 18, fontWeight: 420, textTransform: "none", letterSpacing: 0 }}>
              {fmtGBP(CUMULATIVE_INTEREST[CUMULATIVE_INTEREST.length - 1].v, { decimals: 0 })} earned since joining CredX
            </div>
          </div>
        </div>
        <div className="chart-wrap">
          <CumulativeChart data={CUMULATIVE_INTEREST} height={220} />
        </div>
      </div>

      {/* filter bar */}
      <div className="filter-bar" style={{ marginTop: 24 }}>
        <div className="chip-grp">
          {[
            ["all", "All vintages", COMPLETED_DEALS.length],
            ["2025", "Redeemed 2025", COMPLETED_DEALS.filter(d => d.redeemed.endsWith("2025")).length],
            ["2024", "Redeemed 2024", COMPLETED_DEALS.filter(d => d.redeemed.endsWith("2024")).length],
          ].map(([k, l, n]) => (
            <button key={k} className="chip" aria-pressed={year === k} onClick={() => setYear(k)}>
              {l} <span style={{ marginLeft: 6, color: "var(--ink-3)" }} className="mono">{n}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", padding: "0 14px", borderLeft: "1px solid var(--border)" }}>
          <button className="btn btn-sm btn-ghost" style={{ padding: "12px 0" }} onClick={() => exportPositions("redeemed")}>
            <I.download /> Export CSV
          </button>
        </div>
      </div>

      {/* table */}
      <div className="card" style={{ borderTop: 0, marginBottom: 32 }}>
        <table className="t">
          <thead>
            <tr>
              <th>Facility</th>
              <th>Property</th>
              <th>Type</th>
              <th className="right">Principal</th>
              <th className="right">Coupon</th>
              <th className="right">LTV</th>
              <th className="right">Drawn</th>
              <th className="right">Redeemed</th>
              <th className="right">Actual term</th>
              <th className="right">Interest realised</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(d => (
              <tr key={d.id}>
                <td>
                  <div className="strong">{d.title}</div>
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>{d.id}</div>
                </td>
                <td>
                  <div style={{ fontSize: 13 }}>{d.property.split(" · ")[0]}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{d.property.split(" · ")[1]}</div>
                </td>
                <td className="muted">{d.type}</td>
                <td className="num strong">{fmtGBP(d.position)}</td>
                <td className="num">{fmtPct(d.rate, 2)}</td>
                <td className="num">{Math.round(d.ltv * 100)}%</td>
                <td className="num muted">{d.drawn}</td>
                <td className="num">{d.redeemed}</td>
                <td className="num">{d.actualTerm} mo</td>
                <td className="num strong" style={{ color: "var(--pos)" }}>{fmtGBP(d.interestEarned, { decimals: 0 })}</td>
                <td>
                  <span className="tag" style={{ background: "var(--pos-tint)", color: "var(--pos)", borderColor: "transparent" }}>
                    ● Redeemed in full
                  </span>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan="11" style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>No redemptions in this vintage.</td></tr>
            )}
          </tbody>
        </table>
        <div className="card-foot">
          <span>{sorted.length} redeemed facilit{sorted.length === 1 ? "y" : "ies"}</span>
          <span>
            <span style={{ color: "var(--ink-3)" }}>Capital returned · </span>
            <span className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>{fmtGBP(totalReturned)}</span>
            <span style={{ color: "var(--ink-3)", margin: "0 16px" }}>·</span>
            <span style={{ color: "var(--ink-3)" }}>Interest · </span>
            <span className="mono" style={{ color: "var(--pos)", fontWeight: 600 }}>{fmtGBP(totalInterest, { decimals: 0 })}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Cumulative interest chart - stepped area
// ─────────────────────────────────────────────────────────────────
function CumulativeChart({ data, height = 240 }) {
  const W = 900, H = height;
  const padL = 56, padR = 16, padT = 16, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xs = data.map((_, i) => padL + (i / (data.length - 1)) * innerW);
  const max = Math.max(...data.map(d => d.v));
  const y = (v) => padT + innerH - (v / (max * 1.1)) * innerH;
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${y(data[i].v)}`).join(" ");
  const area = `${line} L ${xs[xs.length - 1]} ${padT + innerH} L ${xs[0]} ${padT + innerH} Z`;
  const tickCount = 5;
  const tickVals = Array.from({ length: tickCount + 1 }, (_, i) => (max * 1.1 * i) / tickCount);
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id="cum-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {tickVals.map((v, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)}
            stroke="var(--border)" strokeDasharray={i === 0 ? "" : "2 3"} strokeWidth="1" />
          <text x={padL - 8} y={y(v) + 4} textAnchor="end"
            style={{ fontFamily: "var(--ff-mono)", fontSize: 10, fill: "var(--ink-3)" }}>
            £{Math.round(v / 1000)}k
          </text>
        </g>
      ))}
      {data.map((d, i) => i % labelEvery === 0 ? (
        <text key={i} x={xs[i]} y={H - 10} textAnchor="middle"
          style={{ fontFamily: "var(--ff-mono)", fontSize: 10, fill: "var(--ink-3)" }}>
          {d.m}
        </text>
      ) : null)}
      <path d={area} fill="url(#cum-fill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={y(data[data.length - 1].v)} r="4" fill="var(--accent)" />
      <line x1={xs[xs.length - 1]} y1={y(data[data.length - 1].v)} x2={xs[xs.length - 1]} y2={padT + 8}
            stroke="var(--border-2)" strokeDasharray="2 3" />
      <text x={xs[xs.length - 1] - 6} y={padT + 18} textAnchor="end"
        style={{ fontFamily: "var(--ff-serif)", fontSize: 15, fontWeight: 500, fill: "var(--ink)" }}>
        £{(data[data.length - 1].v / 1000).toFixed(1)}k
      </text>
    </svg>
  );
}

function parseDate(s) {
  const m = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const [d, mo, y] = s.split(" ");
  return new Date(parseInt(y), m[mo], parseInt(d)).getTime();
}

Object.assign(window, { PortfolioView });
