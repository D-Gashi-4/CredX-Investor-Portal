// views-overview.jsx - investor portfolio overview
const { useState: useStateO } = React;

function OverviewView({ goTo, openDeal, openOpp }) {
  const sparkData = PERF_SERIES.map(d => d.deployed);
  const earnedSpark = PERF_SERIES.map(d => d.earned);

  return (
    <div>
      {/* hero KPIs */}
      <div className="kpi-grid" style={{ marginTop: 24 }}>
        <KPI
          label="Capital deployed"
          value={compactGBPValue(KPIS.capitalDeployed)}
          unit="before"
          delta="+£75k"
          deltaPositive={true}
          sub="across 6 facilities"
          spark={sparkData}
        />
        <KPI
          label="Net IRR · YTD"
          value={KPIS.netIrrYtd.toFixed(2)}
          unit="after"
          delta="+0.32"
          deltaPositive={true}
          sub="vs prior quarter"
          spark={earnedSpark}
        />
        <KPI
          label="Weighted LTV"
          value={(KPIS.weightedLtv * 100).toFixed(1)}
          unit="after"
          delta="-1.4"
          deltaPositive={true}
          sub="portfolio average"
        />
        <KPI
          label="Available capital"
          value={compactGBPValue(KPIS.capitalAvailable)}
          unit="before"
          sub="ready to deploy"
        />
      </div>

      {/* performance chart + composition */}
      <div className="cols-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Performance</div>
              <div className="h-card" style={{ color: "var(--ink)", fontFamily: "var(--ff-serif)", fontSize: 18, fontWeight: 420, textTransform: "none", letterSpacing: 0 }}>Capital deployed &amp; interest earned · last 12 months</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-sm">12M</button>
              <button className="btn btn-sm" style={{ borderColor: "var(--ink)", background: "var(--bg-sunk)" }}>YTD</button>
              <button className="btn btn-sm">All</button>
            </div>
          </div>
          <div className="chart-wrap">
            <div className="chart-legend">
              <span><span className="sw" style={{ background: "var(--accent)" }}></span>Capital deployed</span>
              <span><span className="sw" style={{ background: "var(--ink-2)", borderTop: "2px dashed var(--ink-2)", height: 2 }}></span>Interest earned</span>
            </div>
            <PerfChart series={PERF_SERIES} height={260} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Composition</div>
              <div className="h-card" style={{ color: "var(--ink)", fontFamily: "var(--ff-serif)", fontSize: 18, fontWeight: 420, textTransform: "none", letterSpacing: 0 }}>Allocation by security type</div>
            </div>
          </div>
          <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Donut
              size={170}
              stroke={22}
              segments={[
                { v: 745, color: "var(--accent)", label: "Commercial" },
                { v: 295, color: "var(--ink)",    label: "Residential" },
              ]}
              label="£1.04m"
              sub="Total exposure"
            />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              {[
                { c: "var(--accent)", l: "Commercial bridging", v: "£745,000", pct: "71.6%" },
                { c: "var(--ink)", l: "Residential bridging", v: "£295,000", pct: "28.4%" },
              ].map(r => (
                <div key={r.l} style={{ display: "grid", gridTemplateColumns: "12px 1fr auto auto", gap: 10, alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                  <span style={{ background: r.c, width: 10, height: 10 }} />
                  <span style={{ color: "var(--ink-2)" }}>{r.l}</span>
                  <span className="mono" style={{ color: "var(--ink)" }}>{r.v}</span>
                  <span className="mono" style={{ color: "var(--ink-3)", width: 50, textAlign: "right" }}>{r.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active deals snapshot + Updates */}
      <div className="cols-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Live positions</div>
              <div className="h-card" style={{ color: "var(--ink)", fontFamily: "var(--ff-serif)", fontSize: 18, fontWeight: 420, textTransform: "none", letterSpacing: 0 }}>Active facilities</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => goTo("portfolio")}>
              View all <I.arrowRight />
            </button>
          </div>
          <table className="t">
            <thead>
              <tr>
                <th>Facility</th>
                <th className="right">Position</th>
                <th className="right">Rate</th>
                <th className="right">Maturity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {LIVE_DEALS.slice(0, 4).map(d => (
                <tr key={d.id} className="row" onClick={() => openDeal(d)}>
                  <td>
                    <div className="strong">{d.title}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{d.id} · {d.property}</div>
                  </td>
                  <td className="num strong">{fmtGBP(d.position)}</td>
                  <td className="num">{fmtPct(d.rate, 2)}</td>
                  <td className="num muted">{d.maturity}</td>
                  <td className="right"><span className="iconbtn"><I.chevron /></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>From CredX</div>
              <div className="h-card" style={{ color: "var(--ink)", fontFamily: "var(--ff-serif)", fontSize: 18, fontWeight: 420, textTransform: "none", letterSpacing: 0 }}>Latest updates</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => goTo("updates")}>
              All updates <I.arrowRight />
            </button>
          </div>
          <div style={{ padding: "8px 20px 4px" }}>
            {UPDATES.slice(0, 3).map(u => (
              <div key={u.id} style={{
                padding: "16px 0", borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{u.date}</span>
                  <span style={{ width: 3, height: 3, background: "var(--ink-4)", borderRadius: "50%" }} />
                  <span className="eyebrow" style={{ fontSize: 10 }}>{u.kind}</span>
                  {u.pinned && <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, color: "var(--accent)", fontSize: 11 }}><I.pin /> Pinned</span>}
                </div>
                <div style={{ fontFamily: "var(--ff-serif)", fontSize: 16, lineHeight: 1.2, letterSpacing: "-0.005em" }}>{u.title}</div>
                <div style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 6, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {u.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunities preview + Distributions */}
      <div className="cols-2" style={{ marginTop: 24, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4, color: "var(--accent)" }}>
                <span className="live-dot" /> Open to investors
              </div>
              <div className="h-card" style={{ color: "var(--ink)", fontFamily: "var(--ff-serif)", fontSize: 18, fontWeight: 420, textTransform: "none", letterSpacing: 0 }}>New opportunities</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => goTo("opportunities")}>
              Browse all <I.arrowRight />
            </button>
          </div>
          <div style={{ padding: "8px 20px 20px" }}>
            {OPPORTUNITIES.slice(0, 3).map(o => (
              <div key={o.id} onClick={() => openOpp(o)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "center",
                  gap: 18,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {o.hot && <span style={{ background: "var(--accent-tint)", color: "var(--accent-ink)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 6px" }}>Closing soon</span>}
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.id}</span>
                  </div>
                  <div style={{ fontFamily: "var(--ff-serif)", fontSize: 17, letterSpacing: "-0.005em" }}>{o.title}</div>
                  <div style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 4 }}>{o.property}</div>
                  <div className="progress" style={{ marginTop: 10, width: 220 }}>
                    <span style={{ width: (o.raisedPct * 100) + "%" }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Coupon</div>
                  <div style={{ fontFamily: "var(--ff-serif)", fontSize: 22, fontWeight: 380, letterSpacing: "-0.01em" }}>{fmtPct(o.rate, 2)}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.term}-mo term</div>
                </div>
                <span className="iconbtn"><I.chevron /></span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Cashflow</div>
              <div className="h-card" style={{ color: "var(--ink)", fontFamily: "var(--ff-serif)", fontSize: 18, fontWeight: 420, textTransform: "none", letterSpacing: 0 }}>Upcoming distributions</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Next 30 days</span>
          </div>
          <table className="t">
            <thead>
              <tr>
                <th>Date</th>
                <th>Facility</th>
                <th>Type</th>
                <th className="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {DISTRIBUTIONS.map((d, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 12 }}>{d.date}</td>
                  <td>
                    <div className="strong" style={{ fontSize: 13 }}>{d.label.split(" - ")[0]}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{d.deal}</div>
                  </td>
                  <td>
                    <span className="tag" style={{
                      background: d.kind === "redemption" ? "var(--accent-tint)" : "var(--bg-sunk)",
                      borderColor: d.kind === "redemption" ? "transparent" : "var(--border)",
                      color: d.kind === "redemption" ? "var(--accent-ink)" : "var(--ink-2)",
                    }}>{d.kind === "redemption" ? "Redemption" : "Interest"}</span>
                  </td>
                  <td className="num strong">{fmtGBP(d.amount, { decimals: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="card-foot">
            <span>Total expected · next 30 days</span>
            <span className="mono" style={{ color: "var(--ink)", fontWeight: 600, fontSize: 14 }}>
              {fmtGBP(DISTRIBUTIONS.reduce((s, x) => s + x.amount, 0), { decimals: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OverviewView });
