// ui.jsx - shared primitives for the CredX investor portal
const { useState, useMemo, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────────
// CredX wordmark — the ONLY logo render site in the app.
//
// The wordmark is drawn inline from the vector paths in
// src/credx-logo-svg.js (window.CREDX_LOGO_PATHS), so it stays crisp at
// any size and in print, and there is no asset for the standalone
// bundler to miss.
//
// `variant`:
//   "auto"  → reads data-theme on <html> and flips reactively
//   "dark"  → ink wordmark (for light backgrounds)
//   "light" → cream wordmark (for dark backgrounds)
//
// All consumers (header, login, future screens) MUST use this
// component. Do not hand-roll an <img src="assets/..."> again.
// ─────────────────────────────────────────────────────────────────
function CredXMark({ height = 28, variant = "auto" }) {
  const vb = window.CREDX_LOGO_VIEWBOX || "0 0 583.24 209";
  const [, , vbW, vbH] = vb.split(" ").map(Number);
  const w = Math.round(height * (vbW / vbH));

  // Subscribe to theme changes so the wordmark flips with dark mode.
  const readTheme = () =>
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";
  const [autoVariant, setAutoVariant] = useState(readTheme);
  useEffect(() => {
    if (variant !== "auto") return undefined;
    const obs = new MutationObserver(() => setAutoVariant(readTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, [variant]);

  const resolved = variant === "auto" ? autoVariant : variant;
  const fill = resolved === "light" ? "#f4f1ea" : "var(--ink, #0e1418)";
  const paths = window.CREDX_LOGO_PATHS || [];

  return (
    <svg viewBox={vb} width={w} height={height} role="img" aria-label="CredX"
         style={{ display: "inline-block", flexShrink: 0 }}>
      <g fill={fill}>
        {paths.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Icons - minimal line set
// ─────────────────────────────────────────────────────────────────
const I = {
  search: (p) => <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5 L14 14" strokeLinecap="round" /></svg>,
  bell: (p) => <svg width={18} height={18} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M5 13.5 V9 a5 5 0 0 1 10 0 v4.5 l1.5 1.5 H3.5 Z" strokeLinejoin="round" /><path d="M8 16.5 a2 2 0 0 0 4 0" /></svg>,
  doc: (p) => <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M3.5 1.5 H10 L13.5 5 V14.5 H3.5 Z" strokeLinejoin="round" /><path d="M10 1.5 V5 H13.5" /><path d="M5.5 8 H11" /><path d="M5.5 10.5 H11" /><path d="M5.5 13 H8.5" /></svg>,
  arrowUp: (p) => <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M6 9.5 V2.5 M3 5.5 L6 2.5 L9 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  arrowDown: (p) => <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M6 2.5 V9.5 M3 6.5 L6 9.5 L9 6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  arrowRight: (p) => <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 7 H11 M7.5 3.5 L11 7 L7.5 10.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  close: (p) => <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3.5 3.5 L12.5 12.5 M12.5 3.5 L3.5 12.5" strokeLinecap="round" /></svg>,
  download: (p) => <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M7 1.5 V9 M4 6 L7 9 L10 6" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 11.5 H12" strokeLinecap="round" /></svg>,
  filter: (p) => <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M1.5 3 H12.5 M3.5 7 H10.5 M5.5 11 H8.5" strokeLinecap="round" /></svg>,
  external: (p) => <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 3 H9 V9 M9 3 L3 9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  check: (p) => <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M2.5 7.5 L5.5 10.5 L11.5 4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  lock: (p) => <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2.5" y="6.5" width="9" height="6" /><path d="M4.5 6.5 V4.5 a2.5 2.5 0 0 1 5 0 V6.5" /></svg>,
  pin: (p) => <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M7 1.5 L10.5 5 L8.5 7 L9.5 11 L7 9 L4.5 11 L5.5 7 L3.5 5 Z" strokeLinejoin="round" /></svg>,
  chevron: (p) => <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M4 3 L7.5 6 L4 9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  building: (p) => <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><rect x="2.5" y="2.5" width="9" height="10" /><path d="M5 5 H6 M8 5 H9 M5 7.5 H6 M8 7.5 H9 M5 10 H6 M8 10 H9" /></svg>,
  sun: (p) => <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="8" cy="8" r="3" /><path d="M8 1.5 V3 M8 13 V14.5 M1.5 8 H3 M13 8 H14.5 M3.4 3.4 L4.5 4.5 M11.5 11.5 L12.6 12.6 M3.4 12.6 L4.5 11.5 M11.5 4.5 L12.6 3.4" strokeLinecap="round" /></svg>,
  moon: (p) => <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M13 9.5 A6 6 0 1 1 6.5 3 A4.5 4.5 0 0 0 13 9.5 Z" strokeLinejoin="round" /></svg>,
  logout: (p) => <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M8.5 2.5 H2.5 V11.5 H8.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 7 H12.5 M10 4.5 L12.5 7 L10 9.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  eye:    (p) => <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M1.5 8 Q4.5 3.5 8 3.5 Q11.5 3.5 14.5 8 Q11.5 12.5 8 12.5 Q4.5 12.5 1.5 8 Z" strokeLinejoin="round" /><circle cx="8" cy="8" r="2.2" /></svg>,
  eyeOff: (p) => <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 8 Q4 5 6.4 4.1 M9.6 4.1 Q12 5 14 8 Q12.4 10.4 10.5 11.5 M6 11.6 Q4 10.8 2 8" strokeLinejoin="round" strokeLinecap="round" /><path d="M2.5 2.5 L13.5 13.5" strokeLinecap="round" /></svg>,
};

// ─────────────────────────────────────────────────────────────────
// Performance area+line chart (custom SVG)
// ─────────────────────────────────────────────────────────────────
function PerfChart({ series, height = 240 }) {
  // measure the container so the SVG uses real pixel units: with a fixed
  // viewBox + preserveAspectRatio="none" the axis labels get squashed
  // horizontally on narrow screens and become illegible.
  const wrapRef = React.useRef(null);
  const [W, setW] = React.useState(800);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setW(Math.max(280, el.clientWidth || 800));
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el); else window.addEventListener("resize", measure);
    return () => { if (ro) ro.disconnect(); else window.removeEventListener("resize", measure); };
  }, []);
  const narrow = W < 520;
  const H = height;
  const padL = narrow ? 46 : 52, padR = narrow ? 10 : 16, padT = 16, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xs = series.map((_, i) => padL + (i / (series.length - 1)) * innerW);
  const maxDep = Math.max(...series.map(d => d.deployed));
  const maxEarn = Math.max(...series.map(d => d.earned));
  // series are in £k — step the axis in £500k instalments
  const step = 500;
  const axisMax = Math.max(step, Math.ceil(maxDep / step) * step);
  const nTicks = axisMax / step;
  const yDep = (v) => padT + innerH - (v / axisMax) * innerH;
  const yEarn = (v) => padT + innerH - (v / (maxEarn * 1.5)) * innerH;
  // series are in £k: switch to millions once a tick reaches 1,000k
  const fmtTick = (v) => {
    if (v === 0) return "0";
    if (v >= 1000) {
      const m = v / 1000;
      return "£" + (m % 1 === 0 ? m : m.toFixed(m < 10 ? 2 : 1).replace(/0$/, "")) + "m";
    }
    return "£" + (Number.isInteger(v) ? v : +v.toFixed(1)) + "k";
  };
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${yDep(series[i].deployed)}`).join(" ");
  const areaPath = `${linePath} L ${xs[xs.length - 1]} ${padT + innerH} L ${xs[0]} ${padT + innerH} Z`;
  const earnPath = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${yEarn(series[i].earned)}`).join(" ");

  const tickVals = Array.from({ length: nTicks + 1 }, (_, i) => step * i);

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id="dep-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {tickVals.map((v, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={yDep(v)} y2={yDep(v)}
                stroke="var(--border)" strokeDasharray={i === 0 ? "" : "2 3"} strokeWidth="1" />
          <text x={padL - 8} y={yDep(v) + 4} textAnchor="end"
                style={{ fontFamily: "var(--ff-mono)", fontSize: 11, fill: "var(--ink-3)" }}>
            {fmtTick(v)}
          </text>
        </g>
      ))}
      {/* x labels */}
      {series.map((d, i) => (
        (narrow && i % 2 === 1) ? null : (
        <text key={i} x={xs[i]} y={H - 10} textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
              style={{ fontFamily: "var(--ff-mono)", fontSize: 11, fill: "var(--ink-3)" }}>
          {narrow ? String(d.m).split(" ")[0] : d.m}
        </text>)
      ))}
      {/* deployed area + line */}
      <path d={areaPath} fill="url(#dep-fill)" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      {/* earned dashed */}
      <path d={earnPath} fill="none" stroke="var(--ink-2)" strokeWidth="1.2" strokeDasharray="3 3" />
      {/* dots */}
      {series.map((d, i) => (
        <circle key={i} cx={xs[i]} cy={yDep(d.deployed)} r="3" fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth="1.5" />
      ))}
    </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────
function Spark({ data, width = 80, height = 24, color = "var(--accent)" }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const xs = data.map((_, i) => (i / (data.length - 1)) * width);
  const ys = data.map(v => height - ((v - min) / range) * height);
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Donut (small, e.g. for LTV / portfolio composition)
// ─────────────────────────────────────────────────────────────────
function Donut({ segments, size = 120, stroke = 18, label, sub }) {
  // segments: [{ v: number, color: string, label: string }]
  const total = segments.reduce((s, x) => s + x.v, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-sunk)" strokeWidth={stroke} fill="none" />
        {segments.map((s, i) => {
          const len = (s.v / total) * c;
          const dash = `${len} ${c - len}`;
          const offset = c * 0.25 - acc; // start at top
          acc += len;
          return (
            <circle key={i} cx={size/2} cy={size/2} r={r}
                    stroke={s.color} strokeWidth={stroke} fill="none"
                    strokeDasharray={dash} strokeDashoffset={offset}
                    transform={`rotate(-90 ${size/2} ${size/2})`} />
          );
        })}
      </svg>
      {(label || sub) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          {label && <div style={{ fontFamily: "var(--ff-serif)", fontWeight: 380, fontSize: 22, letterSpacing: "-0.01em" }}>{label}</div>}
          {sub && <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// KPI tile
// ─────────────────────────────────────────────────────────────────
function KPI({ label, value, unit, delta, deltaPositive, sub, spark }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {unit === "before" && value ? <span className="unit">£</span> : null}
        <span className="tabnum">{value}</span>
        {unit === "after" ? <span className="unit" style={{marginLeft: 4}}>%</span> : null}
      </div>
      <div className="kpi-sub" style={{ justifyContent: "space-between" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {delta != null && (
            <span className="chip" style={{
              color: deltaPositive ? "var(--pos)" : "var(--neg)",
              display: "inline-flex", alignItems: "center", gap: 2,
            }}>
              {deltaPositive ? <I.arrowUp /> : <I.arrowDown />}
              {delta}
            </span>
          )}
          <span style={{ color: "var(--ink-3)" }}>{sub}</span>
        </span>
        {spark && <Spark data={spark} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Status pill
// ─────────────────────────────────────────────────────────────────
function Status({ kind }) {
  const labels = {
    live: "Active",
    pending: "Closing",
    funding: "Funding",
    repaid: "Repaid",
    default: "In default",
  };
  return <span className={"status " + kind}>{labels[kind] || kind}</span>;
}

// ─────────────────────────────────────────────────────────────────
// Drawer / Modal scaffolds
// ─────────────────────────────────────────────────────────────────
function Drawer({ open, onClose, title, eyebrow, children, actions }) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
            <h2 className="h-sect">{title}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {actions}
            <button className="close" onClick={onClose} aria-label="Close"><I.close /></button>
          </div>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </>
  );
}

function Modal({ open, onClose, title, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" style={width ? { width } : undefined} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2 className="h-sect">{title}</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Close"><I.close /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Placeholder image (for property hero)
// ─────────────────────────────────────────────────────────────────
function PropPlaceholder({ label, height = 200 }) {
  return (
    <div className="placeholder-image" style={{ height, width: "100%", position: "relative" }}>
      <span>{label || "PROPERTY IMAGE · TO BE PROVIDED"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────────
function SectionTitle({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", margin: "32px 0 16px" }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <h2 className="h-sect">{title}</h2>
      </div>
      {action}
    </div>
  );
}

Object.assign(window, {
  CredXMark, I, PerfChart, Spark, Donut, KPI, Status, Drawer, Modal, PropPlaceholder, SectionTitle,
  RangeFilter, CheckboxGroup,
});

// ─────────────────────────────────────────────────────────────────
// Range filter - two number inputs with min/max guards and a
// visual range bar. Shared between the Opportunities Filters panel
// and the Deal-alert Criteria editor.
// ─────────────────────────────────────────────────────────────────
function RangeFilter({ label, bounds, value, onChange, step, format }) {
  const [lo, hi] = value;
  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid var(--border-2)",
    background: "var(--bg)",
    fontSize: 13,
    fontFamily: "var(--ff-mono)",
    fontVariantNumeric: "tabular-nums",
    outline: 0,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{label}</label>
        <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--ff-mono)" }}>
          {format(bounds[0])} - {format(bounds[1])}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 12px 1fr", gap: 6, alignItems: "center" }}>
        <input
          type="number" min={bounds[0]} max={hi} step={step} value={lo}
          onChange={e => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange([Math.max(bounds[0], Math.min(v, hi)), hi]);
          }}
          style={inputStyle}
        />
        <span style={{ textAlign: "center", color: "var(--ink-3)" }}>-</span>
        <input
          type="number" min={lo} max={bounds[1]} step={step} value={hi}
          onChange={e => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange([lo, Math.min(bounds[1], Math.max(v, lo))]);
          }}
          style={inputStyle}
        />
      </div>
      <div style={{ position: "relative", height: 4, background: "var(--bg-sunk)", marginTop: 2 }}>
        <div style={{
          position: "absolute",
          left:  ((lo - bounds[0]) / (bounds[1] - bounds[0]) * 100) + "%",
          right: ((bounds[1] - hi) / (bounds[1] - bounds[0]) * 100) + "%",
          top: 0, bottom: 0,
          background: "var(--accent)",
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Checkbox group - pressed-chip style multi-select
// ─────────────────────────────────────────────────────────────────
function CheckboxGroup({ label, options, formatOption, selected, onToggle }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{label}</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(o => {
          const on = selected.has(o);
          return (
            <button key={o} type="button"
              onClick={() => onToggle(o)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 14px",
                border: "1px solid " + (on ? "var(--accent)" : "var(--border-2)"),
                background: on ? "var(--accent-tint)" : "var(--bg)",
                color: on ? "var(--accent-ink)" : "var(--ink-2)",
                fontSize: 13, fontWeight: 500,
              }}>
              <span style={{
                width: 14, height: 14,
                border: "1.5px solid " + (on ? "var(--accent)" : "var(--border-2)"),
                background: on ? "var(--accent)" : "transparent",
                color: "var(--on-accent)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>{on && <I.check style={{ width: 10, height: 10 }} />}</span>
              {formatOption ? formatOption(o) : o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
