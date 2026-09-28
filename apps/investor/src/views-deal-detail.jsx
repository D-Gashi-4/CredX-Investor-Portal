// views-deal-detail.jsx - drawer detail for a single active facility.
// Opened from the Portfolio (Active) tab and from the Overview's live-positions snapshot.

function DealDetail({ deal, open, onClose }) {
  if (!deal) return null;

  // simulate interest schedule
  const schedule = React.useMemo(() => {
    if (!deal) return [];
    const items = [];
    const monthly = (deal.position * deal.rate / 100) / 12;
    for (let i = 1; i <= deal.term; i++) {
      const isPast = i <= Math.floor(deal.term * deal.progress);
      items.push({
        n: i,
        date: addMonths(deal.drawn, i),
        amount: monthly,
        kind: i === deal.term ? "Redemption + interest" : "Interest",
        status: isPast ? "paid" : i === Math.ceil(deal.term * deal.progress) ? "next" : "scheduled",
      });
    }
    return items;
  }, [deal]);

  return (
    <Drawer open={open} onClose={onClose}
      eyebrow={deal.id + " · " + deal.type + " bridging"}
      title={deal.title}
      actions={<button className="btn btn-sm" onClick={() => exportDealStatement(deal)}><I.download /> Statement</button>}
    >
      {/* hero strip */}
      <div className="deal-hero-grid" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, marginTop: 20, marginBottom: 20 }}>
        <div style={{ height: 150 }}>
          <PropIllustration dealId={deal.id} type={deal.type} />
        </div>
        <div>
          <div className="eyebrow">Your position</div>
          <div style={{ fontFamily: "var(--ff-serif)", fontSize: 36, fontWeight: 380, letterSpacing: "-0.015em", lineHeight: 1, margin: "8px 0 12px" }}>
            {fmtGBP(deal.position)}
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--ink-2)" }}>
            <span><span style={{ color: "var(--ink-3)" }}>Coupon</span> <strong className="mono" style={{ color: "var(--ink)", marginLeft: 4 }}>{fmtPct(deal.rate, 2)}</strong></span>
            <span><span style={{ color: "var(--ink-3)" }}>LTV</span> <strong className="mono" style={{ color: "var(--ink)", marginLeft: 4 }}>{Math.round(deal.ltv * 100)}%</strong></span>
            <span><span style={{ color: "var(--ink-3)" }}>Status</span> <span style={{ marginLeft: 4 }}><Status kind={deal.status} /></span></span>
          </div>
          <div style={{ marginTop: 18, padding: 14, background: "var(--accent-tint)", border: "1px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--accent-ink)", marginBottom: 2 }}>Next event</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{deal.nextEvent.label}</div>
            </div>
            <div className="mono" style={{ fontSize: 14, color: "var(--accent-ink)", fontWeight: 600 }}>{deal.nextEvent.date}</div>
          </div>
        </div>
      </div>

      {/* facility terms */}
      <SectionTitle eyebrow="Facility" title="Terms & security" />
      <dl className="dl">
        <div><dt>Drawn</dt><dd>{deal.drawn}</dd></div>
        <div><dt>Maturity</dt><dd>{deal.maturity}</dd></div>
        <div><dt>Term</dt><dd>{deal.term} months</dd></div>
        <div><dt>Coupon</dt><dd>{fmtPct(deal.rate, 2)} per annum</dd></div>
        <div><dt>Borrower</dt><dd>{deal.borrower}</dd></div>
        <div><dt>Security</dt><dd>{deal.security}</dd></div>
        <div><dt>LTV at drawdown</dt><dd>{Math.round(deal.ltv * 100)}%</dd></div>
        <div><dt>Facility agreement</dt><dd>{deal.facilityRef} (JMW)</dd></div>
        <div style={{ gridColumn: "1 / -1" }}>
          <dt>Purpose</dt>
          <dd style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: "60ch" }}>{deal.purpose}</dd>
        </div>
      </dl>

      {/* schedule */}
      <SectionTitle eyebrow="Cashflow" title="Repayment schedule" />
      <div style={{ border: "1px solid var(--border)" }}>
        <table className="t">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>Date</th>
              <th>Event</th>
              <th className="right">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(s => (
              <tr key={s.n} style={{ opacity: s.status === "scheduled" ? 0.55 : 1 }}>
                <td className="mono" style={{ color: "var(--ink-3)" }}>{String(s.n).padStart(2, "0")}</td>
                <td className="mono" style={{ fontSize: 12 }}>{s.date}</td>
                <td>{s.kind}</td>
                <td className="num strong">{fmtGBP(s.amount, { decimals: 2 })}</td>
                <td>
                  {s.status === "paid" && <span className="tag" style={{ color: "var(--pos)", background: "var(--pos-tint)", borderColor: "transparent" }}>● Paid</span>}
                  {s.status === "next" && <span className="tag" style={{ color: "var(--accent-ink)", background: "var(--accent-tint)", borderColor: "transparent" }}>● Next</span>}
                  {s.status === "scheduled" && <span className="tag">Scheduled</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* documents */}
      <SectionTitle
        eyebrow="Documents"
        title="Deal documents"
        action={<button className="btn btn-sm btn-ghost">View all <I.arrowRight /></button>}
      />
      <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--border)" }}>
        {DOCUMENTS.filter(d => d.deal === deal.id).map(d => (
          <div key={d.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <I.doc style={{ color: "var(--ink-3)" }} />
              <div>
                <div style={{ fontSize: 13.5 }}>{d.name}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{d.size} · {d.date}</div>
              </div>
            </div>
            <button className="iconbtn"><I.download /></button>
          </div>
        ))}
        {DOCUMENTS.filter(d => d.deal === deal.id).length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            No deal-specific documents yet.
          </div>
        )}
      </div>

      <div style={{ height: 32 }} />
    </Drawer>
  );
}

function addMonths(dateStr, months) {
  const monthMap = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [d, m, y] = dateStr.split(" ");
  const date = new Date(parseInt(y), monthMap[m], parseInt(d));
  date.setMonth(date.getMonth() + months);
  return String(date.getDate()).padStart(2, "0") + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
}

Object.assign(window, { DealDetail });
