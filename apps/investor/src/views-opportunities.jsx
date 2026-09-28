// views-opportunities.jsx - deal flow + commit flow

const REGISTERED_INTEREST_KEY = "credx-registered-interest-v1:";
const MIN_INTEREST_AMOUNT = 25000;

function registeredInterestKey() {
  return REGISTERED_INTEREST_KEY + (INVESTOR?.accountId || "investor");
}

function loadRegisteredInterest() {
  try {
    const value = JSON.parse(localStorage.getItem(registeredInterestKey()) || "[]");
    return Array.isArray(value) ? value.filter(item => Number(item.amount) >= MIN_INTEREST_AMOUNT) : [];
  } catch {
    return [];
  }
}

function saveRegisteredInterest(entry) {
  const current = loadRegisteredInterest();
  const next = [entry, ...current.filter(item => item.opportunityId !== entry.opportunityId)];
  localStorage.setItem(registeredInterestKey(), JSON.stringify(next));
  window.dispatchEvent(new Event("credx-registered-interest"));
}

// A deal counts as "just posted" for 7 days after the backend published
// it - drives the top-of-list float and the "Just posted" badge.
function isJustPosted(o) {
  if (!o || !o.postedAt) return false;
  const days = (Date.now() - new Date(o.postedAt).getTime()) / 86400000;
  return days >= 0 && days <= 7;
}

function OpportunitiesView({ openOpp }) {
  // Range bounds derived from the data - keeps filters self-calibrating
  const bounds = React.useMemo(() => {
    const f = OPPORTUNITIES.map(o => o.facility);
    const r = OPPORTUNITIES.map(o => o.rate);
    const t = OPPORTUNITIES.map(o => o.term);
    const l = OPPORTUNITIES.map(o => o.ltv * 100);
    return {
      amount: [Math.min(...f), Math.max(...f)],
      rate:   [Math.min(...r), Math.max(...r)],
      term:   [Math.min(...t), Math.max(...t)],
      ltv:    [Math.min(...l), Math.max(...l)],
    };
  }, []);

  const [category, setCategory]   = React.useState("all"); // chip filter
  const [sort, setSort]           = React.useState("close");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [amountRange, setAmountRange] = React.useState(bounds.amount);
  const [ltvRange, setLtvRange]       = React.useState([0, 75]);
  const [rateRange, setRateRange]     = React.useState(bounds.rate);
  const [termRange, setTermRange]     = React.useState(bounds.term);
  const [chargeTypes, setChargeTypes] = React.useState(new Set(["First", "Second"]));
  const [categoriesSet, setCategoriesSet] = React.useState(
    new Set(["Residential bridging", "Commercial bridging", "Business loan"])
  );
  const [interestOnly, setInterestOnly] = React.useState(false);
  const [interestVersion, setInterestVersion] = React.useState(0);
  const registeredInterest = React.useMemo(() => loadRegisteredInterest(), [interestVersion]);
  const registeredIds = React.useMemo(() => new Set(registeredInterest.map(item => item.opportunityId)), [registeredInterest]);

  React.useEffect(() => {
    const onInterestChange = () => setInterestVersion(value => value + 1);
    window.addEventListener("credx-registered-interest", onInterestChange);
    window.addEventListener("storage", onInterestChange);
    return () => {
      window.removeEventListener("credx-registered-interest", onInterestChange);
      window.removeEventListener("storage", onInterestChange);
    };
  }, []);

  // active filter count for the button badge
  const activeFilters =
    (amountRange[0] > bounds.amount[0] || amountRange[1] < bounds.amount[1] ? 1 : 0) +
    (ltvRange[0]    > 0                || ltvRange[1]    < 75                ? 1 : 0) +
    (rateRange[0]   > bounds.rate[0]   || rateRange[1]   < bounds.rate[1]   ? 1 : 0) +
    (termRange[0]   > bounds.term[0]   || termRange[1]   < bounds.term[1]   ? 1 : 0) +
    (chargeTypes.size < 2 ? 1 : 0) +
    (categoriesSet.size < 3 ? 1 : 0) +
    (interestOnly ? 1 : 0);

  const clearAll = () => {
    setAmountRange(bounds.amount);
    setLtvRange([0, 75]);
    setRateRange(bounds.rate);
    setTermRange(bounds.term);
    setChargeTypes(new Set(["First", "Second"]));
    setCategoriesSet(new Set(["Residential bridging", "Commercial bridging", "Business loan"]));
    setInterestOnly(false);
  };

  const list = OPPORTUNITIES
    .filter(o => {
      if (category !== "all" && o.type.toLowerCase() !== category) return false;
      if (o.facility < amountRange[0]   || o.facility > amountRange[1])  return false;
      if (o.ltv * 100 < ltvRange[0]     || o.ltv * 100 > ltvRange[1])    return false;
      if (o.rate < rateRange[0]         || o.rate > rateRange[1])        return false;
      if (o.term < termRange[0]         || o.term > termRange[1])        return false;
      if (!chargeTypes.has(o.chargeType))      return false;
      if (!categoriesSet.has(o.category))      return false;
      if (interestOnly && !registeredIds.has(o.id)) return false;
      return true;
    })
    .sort((a, b) => {
      // Freshly-posted deals from the backend always float to the top so a
      // newly-published opportunity is the first thing investors see,
      // regardless of the chosen sort. Newest posted first amongst those.
      const ap = a.postedAt ? 1 : 0, bp = b.postedAt ? 1 : 0;
      if (ap !== bp) return bp - ap;
      if (ap && bp && a.postedAt !== b.postedAt) return a.postedAt < b.postedAt ? 1 : -1;
      if (sort === "close") return parseInt(a.closes) - parseInt(b.closes);
      if (sort === "rate") return b.rate - a.rate;
      if (sort === "size") return b.facility - a.facility;
      if (sort === "ltv")  return a.ltv - b.ltv;
      return 0;
    });

  const totalHeadroom = OPPORTUNITIES.reduce((s, o) => s + o.facility * (1 - o.raisedPct), 0);
  const avgCoupon     = OPPORTUNITIES.reduce((s, o) => s + o.rate, 0) / OPPORTUNITIES.length;

  return (
    <div>
      {/* hero strip */}
      <div className="kpi-grid" style={{ marginTop: 24 }}>
        <KPI label="Open opportunities" value={OPPORTUNITIES.length} sub="across the platform" />
        <KPI label="Available to commit" value={compactGBPValue(totalHeadroom)} unit="before" sub="combined headroom" />
        <KPI label="Average coupon" value={avgCoupon.toFixed(2)} unit="after" sub="across open deals" />
        <KPI label="Your available capital" value={compactGBPValue(KPIS.capitalAvailable)} unit="before" sub="ready to deploy" />
      </div>

      {/* filter bar - quick chips + sort + filter toggle */}
      <div className="filter-bar" style={{ marginTop: 24 }}>
        <div className="chip-grp">
          {[
            ["all",         "All",         OPPORTUNITIES.length],
            ["residential", "Residential", OPPORTUNITIES.filter(o => o.type === "Residential").length],
            ["commercial",  "Commercial",  OPPORTUNITIES.filter(o => o.type === "Commercial").length],
            ["business",    "Business",    OPPORTUNITIES.filter(o => o.type === "Business").length],
          ].map(([k, l, n]) => (
            <button key={k} className="chip" aria-pressed={category === k} onClick={() => setCategory(k)}>
              {l} <span style={{ marginLeft: 6, color: "var(--ink-3)" }} className="mono">{n}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <button
            className="chip"
            aria-pressed={filtersOpen}
            onClick={() => setFiltersOpen(o => !o)}
            style={{
              padding: "8px 14px",
              borderLeft: "1px solid var(--border)",
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 12.5, fontWeight: 500, color: "var(--ink-2)",
              background: filtersOpen ? "var(--bg-sunk)" : "transparent",
            }}>
            <I.filter /> Filters
            {activeFilters > 0 && (
              <span style={{
                background: "var(--accent)", color: "var(--on-accent)",
                fontSize: 10.5, fontWeight: 600,
                padding: "1px 6px", marginLeft: 2,
                fontFamily: "var(--ff-mono)",
              }}>{activeFilters}</span>
            )}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderLeft: "1px solid var(--border)" }}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Sort</span>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ background: "transparent", border: 0, padding: "12px 0", fontSize: 13, outline: 0, fontWeight: 500 }}>
              <option value="close">Closing soon</option>
              <option value="rate">Highest coupon</option>
              <option value="size">Largest facility</option>
              <option value="ltv">Lowest LTV</option>
            </select>
          </div>
          <button
            className="chip"
            aria-pressed={interestOnly}
            onClick={() => setInterestOnly(value => !value)}
            style={{ marginLeft: 8, color: interestOnly ? "var(--accent-ink)" : "var(--ink-2)", background: interestOnly ? "var(--accent-tint)" : "transparent" }}
          >
            Your interest <span className="mono" style={{ marginLeft: 6, color: "var(--ink-3)" }}>{registeredInterest.length}</span>
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <FiltersPanel
          bounds={bounds}
          amountRange={amountRange} setAmountRange={setAmountRange}
          ltvRange={ltvRange}       setLtvRange={setLtvRange}
          rateRange={rateRange}     setRateRange={setRateRange}
          termRange={termRange}     setTermRange={setTermRange}
          chargeTypes={chargeTypes} setChargeTypes={setChargeTypes}
          categoriesSet={categoriesSet} setCategoriesSet={setCategoriesSet}
          onClear={clearAll}
          activeCount={activeFilters}
        />
      )}

      {/* results count */}
      <div style={{
        marginTop: filtersOpen ? 16 : 18,
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        fontSize: 12.5, color: "var(--ink-3)",
      }}>
        <span>
          <strong className="mono" style={{ color: "var(--ink)" }}>{list.length}</strong>
          {" "}of {OPPORTUNITIES.length} opportunities
          {activeFilters > 0 && <span style={{ marginLeft: 8 }}> · {activeFilters} filter{activeFilters === 1 ? "" : "s"} applied</span>}
        </span>
        {activeFilters > 0 && (
          <button className="btn btn-sm btn-ghost" onClick={clearAll}>Clear filters</button>
        )}
      </div>

      {/* grid */}
      <div className="opp-grid" style={{ marginTop: 14 }}>
        {list.map(o => {
          const interest = registeredInterest.find(item => item.opportunityId === o.id);
          return (
          <article key={o.id} className="opp" onClick={() => openOpp(o)}>
            <div className="opp-hero">
              <PropIllustration dealId={o.id} type={o.type} category={o.category} />
              {o.lifecycle === "live"
                ? <span className="badge" style={{ background: "var(--pos)", color: "#fff" }}>● Now live · funding closed</span>
                : isJustPosted(o)
                  ? <span className="badge" style={{ background: "var(--accent)", color: "#fff" }}>Just posted</span>
                  : o.hot
                    ? <span className="badge hot">Closing soon · {o.closes.slice(0, 6)}</span>
                    : <span className="badge">{o.typeTag}</span>
              }
            </div>
            <div className="opp-body">
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.id}</span>
                {interest && <span className="badge" style={{ background: "var(--pos-tint)", color: "var(--pos)" }}>Interest registered · {fmtGBP(interest.amount, { compact: true })}</span>}
                <span style={{ width: 3, height: 3, background: "var(--ink-4)", borderRadius: "50%" }} />
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.term}-month term</span>
                <span style={{ width: 3, height: 3, background: "var(--ink-4)", borderRadius: "50%" }} />
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.chargeType} charge</span>
              </div>
              <div className="opp-title">{o.title}</div>
              <div className="opp-loc">{o.property}</div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{o.summary}</p>

              <div className="opp-stats">
                <div className="stat">
                  <div className="lbl">Coupon</div>
                  <div className="val">{fmtPct(o.rate, 2)}</div>
                </div>
                <div className="stat">
                  <div className="lbl">LTV</div>
                  <div className="val">{Math.round(o.ltv * 100)}%</div>
                </div>
                <div className="stat">
                  <div className="lbl">Facility</div>
                  <div className="val">{fmtGBP(o.facility, { compact: true })}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-3)", marginBottom: 6 }}>
                  <span>{Math.round(o.raisedPct * 100)}% funded</span>
                  <span>Min {fmtGBP(o.min, { compact: true })}</span>
                </div>
                <div className="progress">
                  <span style={{ width: (o.raisedPct * 100) + "%" }} />
                </div>
              </div>
            </div>
          </article>
          );
        })}
        {list.length === 0 && (
          <div style={{
            gridColumn: "1 / -1",
            padding: "60px 20px",
            textAlign: "center",
            background: "var(--bg-elev)",
            border: "1px solid var(--border)",
            color: "var(--ink-3)",
          }}>
            <div style={{ fontSize: 14, marginBottom: 6 }}>No opportunities match your filters</div>
            <button className="btn btn-sm" onClick={clearAll} style={{ marginTop: 12 }}>Clear filters</button>
          </div>
        )}
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Filters panel - full filter surface for opportunities
// ─────────────────────────────────────────────────────────────────
function FiltersPanel({
  bounds,
  amountRange, setAmountRange,
  ltvRange, setLtvRange,
  rateRange, setRateRange,
  termRange, setTermRange,
  chargeTypes, setChargeTypes,
  categoriesSet, setCategoriesSet,
  onClear, activeCount,
}) {
  const toggleSet = (setter) => (val) => setter(prev => {
    const next = new Set(prev);
    if (next.has(val)) next.delete(val); else next.add(val);
    return next;
  });
  return (
    <div style={{
      background: "var(--bg-elev)",
      border: "1px solid var(--border)",
      borderTop: 0,
      padding: "20px 22px",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 20 }}>
        <RangeFilter
          label="Loan amount" bounds={bounds.amount} value={amountRange} onChange={setAmountRange}
          step={5000} format={v => "£" + (v >= 1000 ? (v/1000).toFixed(0) + "k" : v)}
          unit="£"
        />
        <RangeFilter
          label="LTV" bounds={[0, 75]} value={ltvRange} onChange={setLtvRange}
          step={1} format={v => v + "%"}
          unit="%"
        />
        <RangeFilter
          label="Coupon (p.a.)" bounds={bounds.rate} value={rateRange} onChange={setRateRange}
          step={0.25} format={v => v.toFixed(2) + "%"}
          unit="%"
        />
        <RangeFilter
          label="Term" bounds={bounds.term} value={termRange} onChange={setTermRange}
          step={1} format={v => v + " mo"}
          unit="mo"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        <CheckboxGroup
          label="Charge type"
          options={["First", "Second"]}
          formatOption={o => o + " charge"}
          selected={chargeTypes}
          onToggle={toggleSet(setChargeTypes)}
        />
        <CheckboxGroup
          label="Category"
          options={["Residential bridging", "Commercial bridging", "Business loan"]}
          selected={categoriesSet}
          onToggle={toggleSet(setCategoriesSet)}
        />
      </div>

      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
          {activeCount === 0 ? "No filters applied" : activeCount + " filter" + (activeCount === 1 ? "" : "s") + " applied"}
        </span>
        <button className="btn btn-sm" onClick={onClear}>Reset to defaults</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Opportunity detail drawer (with commit flow)
// ─────────────────────────────────────────────────────────────────
function OpportunityDetail({ opp, open, onClose }) {
  const [commitOpen, setCommitOpen] = React.useState(false);
  if (!opp) return null;
  const registered = loadRegisteredInterest().find(item => item.opportunityId === opp.id);
  // NDA gating removed - all content unlocked by default.
  const unlocked = true;
  const lockLevel = "";
  const requestUnlock = () => {};
  return (
    <>
      <Drawer open={open} onClose={onClose}
        eyebrow={opp.id + " · " + opp.typeTag}
        title={opp.title}
        actions={
          opp.lifecycle === "live"
            ? <span className="badge" style={{ background: "var(--pos)", color: "#fff", padding: "7px 12px" }}>● Now live · funding closed</span>
            : <button className="btn btn-primary btn-sm" onClick={() => setCommitOpen(true)}>
                Register interest <I.arrowRight />
              </button>
        }
      >
        {registered && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--pos-tint)", color: "var(--pos)", borderLeft: "3px solid var(--pos)", fontSize: 12.5 }}>
            <strong>Interest registered:</strong> {fmtGBP(registered.amount)} · {registered.status}
          </div>
        )}
        {opp.lifecycle === "live" && (
          <div style={{
            marginTop: 16, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start",
            background: "var(--bg-sunk)", border: "1px solid var(--border)",
            borderLeft: "3px solid var(--pos)",
          }}>
            <span style={{ color: "var(--pos)", marginTop: 1 }}><I.check /></span>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
              <strong style={{ color: "var(--ink)" }}>This facility is now live.</strong> It has been drawn and deployed, so funding is closed to new commitments. It remains here for reference and tracking.
            </div>
          </div>
        )}
        <div style={{ marginTop: 20, height: 220 }}>
          <PropIllustration dealId={opp.id} type={opp.type} category={opp.category} />
        </div>

        {/* headline metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: "1px solid var(--border)", borderTop: 0 }}>
          {[
            ["Coupon", fmtPct(opp.rate, 2)],
            ["LTV", Math.round(opp.ltv * 100) + "%"],
            ["Term", opp.term + " months"],
            ["Facility", fmtGBP(opp.facility, { compact: true })],
          ].map(([l, v], i) => (
            <div key={i} style={{ padding: "18px 16px", borderRight: i < 3 ? "1px solid var(--border)" : 0 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{l}</div>
              <div style={{ fontFamily: "var(--ff-serif)", fontSize: 22, fontWeight: 380, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* progress */}
        <div style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)", marginBottom: 8 }}>
            <span>{fmtGBP(Math.round(opp.facility * opp.raisedPct))} committed</span>
            <span>Closes {opp.closes}</span>
          </div>
          <div className="progress" style={{ height: 8 }}>
            <span style={{ width: (opp.raisedPct * 100) + "%" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11.5, color: "var(--ink-3)" }}>
            <span>{Math.round(opp.raisedPct * 100)}% funded</span>
            <span>{fmtGBP(opp.facility - Math.round(opp.facility * opp.raisedPct))} remaining</span>
          </div>
        </div>

        <SectionTitle eyebrow="Summary" title="Investment thesis" />
        <p style={{ fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.65, maxWidth: "62ch" }}>{opp.summary}</p>
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
          {opp.bullets.map((b, i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
              <span style={{ color: "var(--accent)", marginTop: 4 }}><I.check /></span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* ─── Documents - investor deal pack ──────────────────── */}
        <SectionTitle
          eyebrow="Deal pack"
          title="Documents"
          action={
            unlocked
              ? <span style={{ fontSize: 11.5, color: "var(--pos)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <I.check style={{ width: 12, height: 12 }} /> Unlocked
                </span>
              : <button className="btn btn-sm btn-primary" onClick={() => requestUnlock()}>
                  <I.lock /> {lockLevel === "deal" ? "Sign deal NDA" : "Unlock with NDA"}
                </button>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { kind: "Investor Term Sheet", ref: opp.dip ? opp.dip.reference.replace("CXP-", "CXP-") : opp.id, ext: "PDF", size: "412 KB", desc: "Headline security, terms, fees, exit and investor returns." },
            { kind: "Decision in Principle", ref: opp.dip ? opp.dip.reference : "CXP--", ext: "PDF", size: "186 KB", desc: "Non-binding indicative offer issued to the borrower." },
            { kind: "Valuation Report", ref: opp.security ? opp.security.valuerRef : "-", ext: "PDF", size: "1.4 MB", desc: opp.security ? opp.security.valuer + ", " + opp.security.valuationDate : "-" },
            { kind: "Title Plan & Register", ref: opp.security ? opp.security.tenure.split("(")[1]?.replace(")", "") || "Title TBC" : "-", ext: "PDF", size: "224 KB", desc: "HM Land Registry official copies." },
          ].map((d, i) => (
            unlocked
              ? <div key={i} style={{
                  padding: 14,
                  background: "var(--bg-elev)",
                  border: "1px solid var(--border)",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 12,
                  alignItems: "center",
                }}>
                  <span style={{
                    width: 36, height: 36,
                    background: "var(--accent-tint)", color: "var(--accent-ink)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <I.doc />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d.kind}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>{d.desc}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 4, letterSpacing: "0.04em" }}>
                      {d.ref} · {d.ext} · {d.size}
                    </div>
                  </div>
                  <button className="iconbtn" title="Download"><I.download /></button>
                </div>
              : <LockedDoc key={i} doc={d} onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
          ))}
        </div>

        {/* ─── Security & valuation ────────────────────────────── */}
        {opp.security && (
          <>
            <SectionTitle
              eyebrow="Security"
              title="Property & valuation"
              action={!unlocked && (
                <button className="btn btn-sm" onClick={() => requestUnlock()}>
                  <I.lock /> {lockLevel === "deal" ? "Sign deal NDA" : "Unlock with NDA"}
                </button>
              )}
            />
            <dl className="dl" style={{ borderTop: "1px solid var(--border)" }}>
              {unlocked ? (
                <>
                  <div><dt>Tenure</dt><dd>{opp.security.tenure}</dd></div>
                  <div><dt>Valuer</dt><dd>{opp.security.valuer} · {opp.security.valuationDate}</dd></div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <dt>Description</dt>
                    <dd style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: "62ch" }}>
                      {opp.security.description}
                    </dd>
                  </div>
                  <div><dt>Tenancy</dt><dd style={{ fontSize: 13.5 }}>{opp.security.tenancy}</dd></div>
                  <div><dt>EPC / Council Tax</dt><dd style={{ fontSize: 13.5 }}>{opp.security.epc} · {opp.security.councilTax}</dd></div>
                  <div><dt>Market Value</dt><dd>{fmtGBP(opp.security.marketValue)}</dd></div>
                  <div><dt>180-day restricted</dt><dd>{fmtGBP(opp.security.restricted180)}</dd></div>
                  <div><dt>90-day restricted</dt><dd>{fmtGBP(opp.security.restricted90)}</dd></div>
                  <div><dt>Initial LTV</dt><dd>{(opp.ltv * 100).toFixed(2)}%</dd></div>
                  {opp.security.monthlyRent != null && (
                    <div><dt>Indicative monthly rent</dt><dd>{fmtGBP(opp.security.monthlyRent)} pcm</dd></div>
                  )}
                  {opp.security.gdv && (
                    <div><dt>GDV (post-works)</dt><dd>{fmtGBP(opp.security.gdv)}</dd></div>
                  )}
                  {opp.security.seniorFacility && (
                    <>
                      <div><dt>Senior facility ahead</dt><dd>{fmtGBP(opp.security.seniorFacility)} ({opp.security.seniorLender})</dd></div>
                      <div><dt>Combined LTV</dt><dd>{Math.round(opp.security.combinedLTV * 100)}%</dd></div>
                    </>
                  )}
                  {opp.security.tradingEBITDA && (
                    <div><dt>Trading EBITDA (LTM)</dt><dd>{fmtGBP(opp.security.tradingEBITDA)}</dd></div>
                  )}
                </>
              ) : (
                <>
                  <LockedField label="Tenure & title number" onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                  <LockedField label="Valuer & report date"  onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                  <LockedField label="Property description"  full onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                  <LockedField label="Tenancy specifics"     onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                  <LockedField label="EPC / Council Tax"     onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                  <LockedField label="Market Value"          onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                  <LockedField label="180-day restricted"    onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                  <LockedField label="90-day restricted"     onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                  <div><dt>Initial LTV</dt><dd>{(opp.ltv * 100).toFixed(2)}%</dd></div>
                  <LockedField label="Indicative monthly rent" onUnlock={() => requestUnlock()} dealLevel={lockLevel === "deal"} />
                </>
              )}
            </dl>
          </>
        )}

        {/* ─── Decision in Principle - borrower-side terms ─────── */}
        {opp.dip && (
          <>
            <SectionTitle
              eyebrow="Underwriting"
              title="Decision in Principle"
              action={unlocked
                ? <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "var(--pos-tint)", color: "var(--pos)",
                    padding: "4px 10px",
                    fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>
                    <I.check style={{ width: 12, height: 12 }} /> Approved
                  </span>
                : <button className="btn btn-sm" onClick={() => requestUnlock()}>
                    <I.lock /> {lockLevel === "deal" ? "Sign deal NDA" : "Unlock with NDA"}
                  </button>
              }
            />
            <div style={{
              background: "var(--bg-elev)",
              border: "1px solid var(--border)",
              padding: "16px 20px 20px",
            }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
                padding: "0 0 14px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>DIP Reference</div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{opp.dip.reference}</div>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Issued</div>
                  <div className="mono" style={{ fontSize: 14 }}>{opp.dip.date}</div>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Validity</div>
                  <div className="mono" style={{ fontSize: 14 }}>{opp.dip.validity}</div>
                </div>
              </div>

              {unlocked ? (
                <>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
                    padding: "8px 0 0",
                  }}>
                    {[
                      ["Borrower",             "Available in Term Sheet - see Documents above"],
                      ["Introducer",           "Disclosed in Term Sheet"],
                      ["Product",              opp.dip.product],
                      ["Loan purpose",         opp.summary],
                      ["Interest rate to borrower", opp.dip.borrowerRate.toFixed(2) + "% per annum"],
                      ["Monthly interest",     fmtGBP(opp.dip.monthlyInterest, { decimals: 2 })],
                      ["Term",                 opp.dip.term + " months (minimum " + opp.dip.minTerm + ")"],
                      ["Initial LTV",          (opp.ltv * 100).toFixed(2) + "%"],
                      ["Gross drawdown",       fmtGBP(opp.dip.grossLoan)],
                      ["Net to borrower",      fmtGBP(opp.dip.netDrawdown)],
                      ["Arrangement fee",      fmtGBP(opp.dip.arrangementFee) + " (" + ((opp.dip.arrangementFee / opp.dip.grossLoan) * 100).toFixed(2) + "%)"],
                      ["Broker fee",           fmtGBP(opp.dip.brokerFee) + " (" + ((opp.dip.brokerFee / opp.dip.grossLoan) * 100).toFixed(2) + "%)"],
                      ["Setup fee",            fmtGBP(opp.dip.setupFee)],
                      ["Retained interest",    fmtGBP(opp.dip.retainedInterest) + " (" + opp.dip.term + " months)"],
                      ["Application fee",      fmtGBP(opp.dip.applicationFee) + " (paid by borrower)"],
                      ["Redemption fee",       fmtGBP(opp.dip.redemptionFee)],
                      ["Default fee",          opp.dip.defaultFee],
                      ["Early repayment",      opp.dip.earlyRepayment],
                    ].map(([k, v], i) => (
                      <div key={i} style={{
                        padding: "10px 0",
                        borderBottom: "1px solid var(--border)",
                        paddingRight: i % 2 === 0 ? 16 : 0,
                        paddingLeft:  i % 2 === 1 ? 16 : 0,
                        borderLeft:   i % 2 === 1 ? "1px solid var(--border)" : "none",
                      }}>
                        <div className="eyebrow" style={{ marginBottom: 3 }}>{k}</div>
                        <div style={{ fontSize: 13.5, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Conditions & comments</div>
                    <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {opp.dip.conditions.map((c, i) => (
                        <li key={i} style={{
                          display: "grid", gridTemplateColumns: "18px 1fr", gap: 10,
                          alignItems: "flex-start",
                          fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5,
                        }}>
                          <span style={{ color: "var(--warn)", marginTop: 1, fontSize: 14 }}>•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                lockLevel === "deal"
                  ? <DealNdaPanel dealId={opp.id} onSign={() => requestUnlock()} />
                  : <div style={{
                      margin: "16px 0 0",
                      padding: "32px 24px",
                      background: "var(--bg-sunk)",
                      border: "1px dashed var(--border-2)",
                      textAlign: "center",
                    }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 40, height: 40,
                        background: "var(--ink)", color: "var(--bg)",
                        marginBottom: 12,
                      }}>
                        <I.lock />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                        Underwriting detail is NDA-gated
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: "44ch", margin: "0 auto 14px" }}>
                        Borrower &amp; introducer identity, full fee structure, conditions and underwriting commentary unlock once you've signed CredX's mutual NDA.
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => requestUnlock()}>
                        <I.lock /> Sign NDA to view
                      </button>
                    </div>
              )}

              <div style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "var(--bg-sunk)",
                border: "1px dashed var(--border-2)",
                fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.55,
              }}>
                Non-binding indicative offer issued to the borrower. CredX Ltd does not provide regulated mortgages; all loans are unregulated. ESG: <strong style={{ color: "var(--pos)" }}>{opp.dip.esg}</strong>.
              </div>
            </div>
          </>
        )}

        <SectionTitle eyebrow="Process" title="How this facility works" />
        <ol style={{ paddingLeft: 0, listStyle: "none", margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["Register interest", "Tell the CredX team you'd like to fund this facility and the amount you have in mind. The team comes back to you within 24-48 hours."],
            ["Full deal pack issued", "CredX sends you the term sheet, RICS valuation (or Hometrack AVM), credit assessment and indicative net return. You decide independently - no pressure, no pooling."],
            ["Facility Agreement executed", "JMW prepares a bespoke Facility Agreement between you (Funder) and CredX (Lender). Independent legal advice is encouraged. Both parties execute."],
            ["KYC / AML & funds transfer", "Two-stage KYC - CredX via GoIdentity, then the appointed solicitor. On approval, you transfer your Funder's Portion directly to the solicitor's client account. CredX never holds your funds."],
            ["Completion & active management", "Solicitor completes the transaction; legal charge registered. CredX monitors the loan and notifies you promptly of any material events."],
            ["Redemption & return of capital", "At maturity the borrower redeems via sale or refinance. The waterfall returns your capital and interest in full to your nominated account, with CredX taking its margin only after you are paid."],
          ].map(([h, d], i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 16, alignItems: "flex-start" }}>
              <span style={{
                width: 28, height: 28,
                background: "var(--bg-elev)",
                border: "1px solid var(--border-2)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--ff-mono)", fontSize: 12, fontWeight: 600, color: "var(--ink-2)"
              }}>{i + 1}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{h}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.55, maxWidth: "60ch" }}>{d}</div>
              </div>
            </li>
          ))}
        </ol>

        <div style={{ marginTop: 28, padding: 16, background: "var(--bg-sunk)", border: "1px solid var(--border)", display: "flex", gap: 12 }}>
          <I.lock style={{ color: "var(--ink-3)", marginTop: 2 }} />
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
            Registering interest is non-binding. The CredX team will respond within 24-48 hours with the full deal pack - term sheet, valuation, credit assessment and draft Facility Agreement - so you can make an independent, informed decision. Capital is at risk. CredX Ltd is not authorised or regulated by the FCA.
          </div>
        </div>

        <div style={{ height: 32 }} />
      </Drawer>

      <RegisterInterest opp={opp} open={commitOpen} onClose={() => setCommitOpen(false)} onDone={() => { setCommitOpen(false); onClose(); }} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Register Interest - opens a prepared email to info@credx.co.uk
// CredX is not FCA authorised and cannot take in client funds;
// this flow simply notifies the team. They follow up within 24-48h
// with the full deal pack and the bespoke Facility Agreement.
// ─────────────────────────────────────────────────────────────────
function RegisterInterest({ opp, open, onClose, onDone }) {
  const [step, setStep] = React.useState(0);
  const [amount, setAmount] = React.useState(opp ? Math.max(opp.min, MIN_INTEREST_AMOUNT) : MIN_INTEREST_AMOUNT);
  const [phone, setPhone] = React.useState("");
  const [callback, setCallback] = React.useState("either");
  const [notes, setNotes] = React.useState("");
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setStep(0);
      setAmount(opp ? Math.max(opp.min, MIN_INTEREST_AMOUNT) : MIN_INTEREST_AMOUNT);
      setPhone("");
      setCallback("either");
      setNotes("");
      setSent(false);
    }
  }, [open, opp]);

  if (!opp) return null;

  const monthlyInterest = (amount * opp.rate / 100) / 12;
  const totalReturn = monthlyInterest * opp.term;
  const minimum = Math.max(opp.min, MIN_INTEREST_AMOUNT);
  const valid = amount >= minimum;

  // Build mailto with a clean, formatted body
  const subject = `Investment interest - ${opp.id} (${opp.title})`;
  const body = [
    `Hello CredX team,`,
    ``,
    `I'd like to register interest in the following facility:`,
    ``,
    `  Facility:      ${opp.id} - ${opp.title}`,
    `  Property:      ${opp.property}`,
    `  Indicative coupon: ${opp.rate.toFixed(2)}% p.a.`,
    `  Term:          ${opp.term} months`,
    `  LTV:           ${Math.round(opp.ltv * 100)}%`,
    ``,
    `Amount I would like to fund: £${amount.toLocaleString("en-GB")}`,
    `Expected monthly interest:   £${monthlyInterest.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`,
    `Expected total return:       £${totalReturn.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`,
    ``,
    `Preferred contact: ${callback === "either" ? "email or phone" : callback}`,
    phone ? `Phone:           ${phone}` : null,
    ``,
    notes ? `Notes:\n${notes}\n` : null,
    `-`,
    `${INVESTOR.name}`,
    `Funder account: ${INVESTOR.accountId}`,
    `Classification: ${INVESTOR.classification}`,
    ``,
    `(Sent from the CredX investor portal - registration of interest only, non-binding.)`,
  ].filter(Boolean).join("\n");

  const mailto = `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleSend = () => {
    saveRegisteredInterest({
      opportunityId: opp.id,
      title: opp.title,
      amount,
      status: "Pending CredX response",
      registeredAt: new Date().toISOString(),
    });
    // Trigger user's mail client. Confirmation state shown either way -
    // CredX also receives the email from any subsequent send.
    window.location.href = mailto;
    setSent(true);
    setStep(2);
  };

  return (
    <Modal open={open} onClose={onClose} title="Register interest" width={620}
      footer={step < 2 ? (
        <>
          <button className="btn" onClick={step === 0 ? onClose : () => setStep(step - 1)}>
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step === 0 && (
            <button className="btn btn-primary" disabled={!valid}
              style={!valid ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
              onClick={() => setStep(1)}>
              Review <I.arrowRight />
            </button>
          )}
          {step === 1 && (
            <button className="btn btn-primary" onClick={handleSend}>
              Send to CredX <I.arrowRight />
            </button>
          )}
        </>
      ) : (
        <>
          <a className="btn" href={mailto}>
            <I.external /> Re-open in your email client
          </a>
          <button className="btn btn-primary" onClick={onDone}>Done</button>
        </>
      )}
    >
      <div className="steps">
        {["Your interest", "Review & send", "Sent"].map((s, i) => (
          <div key={s} className={"step " + (i === step ? "active" : i < step ? "done" : "")}>
            <div className="n">
              {String(i + 1).padStart(2, "0")}
              {i < step && <I.check style={{ verticalAlign: "middle", color: "var(--accent)", marginLeft: 4 }} />}
            </div>
            <div>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>{opp.id}</div>
        <h3 className="h-sect">{opp.title}</h3>
        <div style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 4 }}>
          {opp.property} · {fmtPct(opp.rate, 2)} indicative · {opp.term}-month term
        </div>
      </div>

      {step === 0 && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="field">
            <label>Amount you'd like to fund (£)</label>
            <input
              type="number" min={minimum} step={1000}
              value={amount}
              onChange={e => setAmount(parseInt(e.target.value) || 0)}
            />
            <div className="help">
              Minimum {fmtGBP(minimum)} · Facility size {fmtGBP(opp.facility)} · Indicative only - final terms agreed individually for each deployment.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[25000, 50000, 100000, 250000].filter(v => v >= minimum && v <= opp.facility).map(v => (
              <button key={v} type="button" className="btn btn-sm"
                onClick={() => setAmount(v)}
                style={amount === v ? { borderColor: "var(--accent)", color: "var(--accent-ink)" } : undefined}>
                {fmtGBP(v, { compact: true })}
              </button>
            ))}
          </div>

          <div style={{ padding: 16, background: "var(--bg-sunk)", border: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <div className="eyebrow">Monthly interest</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{fmtGBP(monthlyInterest, { decimals: 2 })}</div>
            </div>
            <div>
              <div className="eyebrow">Total return</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{fmtGBP(totalReturn, { decimals: 0 })}</div>
            </div>
            <div>
              <div className="eyebrow">Term</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{opp.term} mo</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field">
              <label>Best phone number (optional)</label>
              <input type="tel" placeholder="e.g. +44 7700 900000"
                     value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Preferred contact</label>
              <select value={callback} onChange={e => setCallback(e.target.value)}>
                <option value="either">Email or phone</option>
                <option value="email">Email only</option>
                <option value="phone">Phone call</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Notes for the CredX team (optional)</label>
            <textarea rows={3} placeholder="e.g. earliest you can deploy, specific questions on this deal…"
                      value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div style={{ padding: 12, background: "var(--accent-tint)", display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.55, color: "var(--accent-ink)" }}>
            <I.lock style={{ marginTop: 2 }} />
            <span>
              This sends an email to <strong className="mono">{COMPANY.email}</strong> and is <strong>non-binding</strong>. CredX is not FCA authorised and never holds Funder capital - funds, if you proceed, are transferred to the appointed solicitor's client account.
            </span>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ marginTop: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>You're about to send</div>
          <div style={{ border: "1px solid var(--border)", background: "var(--bg-sunk)", padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 12.5 }}>
              <span style={{ color: "var(--ink-3)" }}>To</span>
              <span className="mono">{COMPANY.email}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 12.5 }}>
              <span style={{ color: "var(--ink-3)" }}>Subject</span>
              <span>{subject}</span>
            </div>
            <pre style={{
              margin: 0,
              padding: "14px 16px",
              fontFamily: "var(--ff-mono)",
              fontSize: 11.5,
              lineHeight: 1.6,
              color: "var(--ink-2)",
              whiteSpace: "pre-wrap",
              maxHeight: 260,
              overflowY: "auto",
            }}>{body}</pre>
          </div>
          <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.55 }}>
            Pressing <strong style={{ color: "var(--ink)" }}>Send to CredX</strong> opens this in your default email client so you can review and send. We don't transmit anything until you press <em>Send</em> in your client.
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 0 8px" }}>
          <div style={{ width: 56, height: 56, background: "var(--accent-tint)", color: "var(--accent-ink)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <I.check style={{ width: 22, height: 22 }} />
          </div>
          <h3 className="h-sect" style={{ marginBottom: 6 }}>Interest registered</h3>
          <p style={{ color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.55, maxWidth: 420 }}>
            We've opened a prepared email to <strong className="mono">{COMPANY.email}</strong> for facility <strong className="mono">{opp.id}</strong> at <strong className="mono">{fmtGBP(amount)}</strong>.
            Please send it from your email client. The CredX team will be in touch within <strong>24-48 hours</strong> with the full deal pack.
          </p>
          <div style={{ marginTop: 18, display: "flex", gap: 24, fontSize: 12, color: "var(--ink-3)" }}>
            <span><span className="mono" style={{ color: "var(--ink-2)" }}>{COMPANY.phone}</span> · phone</span>
            <span><span className="mono" style={{ color: "var(--ink-2)" }}>{COMPANY.email}</span> · email</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

Object.assign(window, { OpportunitiesView, OpportunityDetail, RegisterInterest });
