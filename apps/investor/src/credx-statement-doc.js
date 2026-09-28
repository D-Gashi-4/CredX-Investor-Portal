// credx-statement-doc.js — shared "Official Investor Statement" generator.
// Used by BOTH the investor portal (index.html) and the employee backend
// (CredX Platform.html). Plain script — exposes three globals:
//
//   window.buildInvestorStatementHTML(model)  → print-ready, letterheaded HTML string
//   window.openInvestorStatement(model)       → opens that document in a new tab
//   window.downloadStatementData(model, base) → data export: XLSX if available, else CSV
//
// Each surface assembles the same normalised `model` from its own data, so
// the official document looks identical regardless of where it was issued.
//
// model = {
//   docTitle,                 // "Investor Statement"
//   ref,                      // "CX-STMT-0421-20260609"
//   generatedAt,              // "9 June 2026"
//   period: { label },        // "1 January 2026 – 9 June 2026"
//   investor: { name, ref, classification, address, email },
//   company:  { name, no, ico, address, email, phone, office },  // optional, falls back to CredX
//   summary:  [ { label, value, sub } ],                          // KPI cards (optional)
//   tables:   [ { id, title, note, columns:[{label,align}], rows:[[...]], total:[...] } ],
//   signatory:{ name, title, statement },                         // "issued by" block
//   disclaimer,               // optional override
// }
(function () {
  "use strict";

  const CREDX = {
    name: "CredX Ltd",
    no: "16640225",
    ico: "ZB991146",
    address: "Suite F16, St George's Business Park, Castle Road, Sittingbourne, Kent ME10 3TB",
    email: "info@credx.co.uk",
    phone: "0204 628 0990",
    office: "Suite F16 ● St George's Business Park ● Castle Road ● Sittingbourne ● Kent ME10 3TB",
  };

  // Official CredX wordmark as inline SVG (recolourable via `fill`/currentColor).
  // viewBox 0 0 583.24 209. Used in the letterhead and the issued stamp.
  const LOGO_PATHS =
    '<path d="M114,192.25c-10.75,9.25-25.5,16.75-46.5,16.75s-36.75-5.5-49-17.75S0,162.75,0,142.75v-2.5c1-40,28.25-68,68.5-68,18.25,0,34.25,6.75,42.25,15,2.25,2.25,3.5,5,3.5,7.5,0,3.25-2.5,6.25-6,6.25-2.5,0-4.75-1.5-6.25-4-5.5-9.75-17.25-17.25-34.25-17.25-29,0-51,23-51,60.25s21,60,51.5,60c17.5,0,26.75-4.5,39.75-15.5,1.75-1.5,3.5-2.25,5-2.25,2.5,0,4.25,1.75,4.25,4.25,0,1.75-1,3.75-3.25,5.75Z"/>' +
    '<path d="M215,207.25c-2,0-4.25-.75-5.75-2.75l-46.5-58.25c-1.75-2.25-3-4.75-3-7,0-.75,0-1.25.25-2,.75-2.75,3.5-3.75,6-3.75h3.25c22,0,33-8.75,33-25.5s-11-25.5-33-25.5h-15.5c-4.5,0-6.75,2.5-6.75,6.75v110.75c0,4-3.25,7.25-7.25,7.25s-7.25-3.25-7.25-7.25v-118c0-4,3.25-7.25,7.25-7.25h32.25c32.25,0,46,14,46,33.25,0,18.25-12.5,31.5-41.25,32.75l44,55c1,1.25,1.5,2.75,1.5,4.25,0,4.25-2.75,7.25-7.25,7.25Z"/>' +
    '<path d="M312.25,206.25h-48c-18.75,0-25.75-7-25.75-25.75v-80c0-18.75,7-25.75,25.75-25.75h48c2.25,0,3.75,1.75,3.75,4,0,2-1.5,3.75-3.75,3.75h-44.5c-9.5,0-14.75,5.25-14.75,14.75v33.25c0,2,1,2.75,3,2.75h56.25c2,0,3.75,1.75,3.75,4,0,2-1.75,3.75-3.75,3.75h-56.25c-2,0-3,1-3,3v39.75c0,9.5,5.25,15,14.75,15h44.5c2.25,0,3.75,1.5,3.75,3.75,0,2-1.5,3.75-3.75,3.75Z"/>' +
    '<path d="M442.74,199c0,4-3.25,7.25-7.25,7.25h-38c-40.75,0-68-26.5-68-65.75s27.25-65.75,68-65.75h28c2,0,2.75-.75,2.75-3V7.25c0-4,3.25-7.25,7.25-7.25s7.25,3.25,7.25,7.25v191.75ZM428.24,85.5c0-2-.75-2.75-2.75-2.75h-28c-30.75,0-51.25,23.25-51.25,58s20.5,58,51.25,58h24c4.5,0,6.75-2.5,6.75-6.75v-106.5Z"/>' +
    '<path d="M574.74,207.5c-2.5,0-5.25-1.25-6.75-3.75l-46-68.75c-.5-1-1.25-1.25-2-1.25s-1.5.25-2.25,1.25l-49,70.5c-1,1.25-2.5,2-4,2-2.75,0-5-1.5-5-4.5,0-1,.25-2.25,1-3.25l50.5-72.5c1-1.25,1.5-2.75,1.5-4,0-1.5-.5-2.75-1.5-4.25l-46.5-68.5c-1-1.5-1.5-3.25-1.5-5,0-4.75,3.5-8,8.25-8,2.75,0,5.5,1.25,7,3.5l43.75,64.5c.5.75,1.25,1.25,2,1.25s1.75-.25,2.25-1.25l46-66c1-1.5,2.75-2.25,4.25-2.25,3.25,0,4.75,2.25,4.75,4.75,0,1-.5,2.25-1,3l-47.5,68.25c-.75,1.25-1.25,2.75-1.25,4,0,1.5.5,2.75,1.25,4l48.75,73.25c1,1.5,1.5,3,1.5,4.5,0,5-3.75,8.5-8.5,8.5Z"/>';
  const logoSvg = (cls) =>
    '<svg class="' + cls + '" viewBox="0 0 583.24 209" xmlns="http://www.w3.org/2000/svg" fill="currentColor" role="img" aria-label="CredX">' + LOGO_PATHS + '</svg>';

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // ── reference + date helpers ─────────────────────────────────────
  function makeRef(investorRef) {
    const d = new Date();
    const ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    const tail = (investorRef || "INV").replace(/[^A-Za-z0-9]/g, "").slice(-4).toUpperCase() || "INV";
    return "CX-STMT-" + tail + "-" + ymd;
  }
  function longDate(d) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  // Fills in derived defaults so callers can pass a partial model.
  function normalise(model) {
    const m = Object.assign({}, model);
    m.docTitle   = m.docTitle || "Investor Statement";
    m.company    = Object.assign({}, CREDX, m.company || {});
    m.investor   = m.investor || {};
    m.ref        = m.ref || makeRef(m.investor.ref);
    m.generatedAt = m.generatedAt || longDate(new Date());
    m.period     = m.period || { label: "Full account history" };
    m.summary    = m.summary || [];
    m.tables     = (m.tables || []).filter(t => t && t.rows && t.rows.length);
    m.signatory  = m.signatory || {};
    m.signatory.name  = m.signatory.name  || "For and on behalf of CredX Ltd";
    m.signatory.title = m.signatory.title || "Funder Relations · Authorised signatory";
    m.signatory.statement = m.signatory.statement ||
      ("This statement is issued by " + m.company.name + " and is a true reflection of the account records held as at the statement date.");
    m.disclaimer = m.disclaimer ||
      "CredX Ltd is not authorised or regulated by the Financial Conduct Authority and does not hold Funder capital. Capital deployed is transferred directly to the appointed solicitor's client account on completion. Capital is at risk. This statement is provided for information only and does not constitute financial advice. Figures shown as 'accruing' are calculated pro-rata to the statement date and are not yet paid.";
    return m;
  }

  // ── table renderer ───────────────────────────────────────────────
  function renderTable(t) {
    const cols = t.columns || [];
    const align = (i) => (cols[i] && cols[i].align) || "left";
    const head = cols.map((c, i) =>
      '<th class="al-' + align(i) + '">' + esc(c.label) + "</th>").join("");
    const body = t.rows.map(r => {
      const tds = r.map((cell, i) =>
        '<td class="al-' + align(i) + '">' + esc(cell) + "</td>").join("");
      return "<tr>" + tds + "</tr>";
    }).join("");
    const total = t.total
      ? '<tr class="st-total">' + t.total.map((cell, i) =>
          '<td class="al-' + align(i) + '">' + esc(cell) + "</td>").join("") + "</tr>"
      : "";
    return (
      '<section class="st-block">' +
        '<div class="st-block-head"><h3>' + esc(t.title) + "</h3>" +
          (t.note ? '<span class="st-note">' + esc(t.note) + "</span>" : "") +
        "</div>" +
        '<table class="st-table"><thead><tr>' + head + "</tr></thead>" +
        "<tbody>" + body + total + "</tbody></table>" +
      "</section>"
    );
  }

  function renderSummary(cards) {
    if (!cards.length) return "";
    const items = cards.map(c =>
      '<div class="st-kpi">' +
        '<div class="st-kpi-label">' + esc(c.label) + "</div>" +
        '<div class="st-kpi-val">' + esc(c.value) + "</div>" +
        (c.sub ? '<div class="st-kpi-sub">' + esc(c.sub) + "</div>" : "") +
      "</div>").join("");
    return (
      '<section class="st-block">' +
        '<div class="st-block-head"><h3>Holdings summary</h3></div>' +
        '<div class="st-kpis">' + items + "</div>" +
      "</section>"
    );
  }

  // ── document builder ─────────────────────────────────────────────
  function buildInvestorStatementHTML(model) {
    const m = normalise(model);
    const co = m.company;
    const inv = m.investor;

    const metaRow = (label, val) => val
      ? '<div class="st-meta-item"><span>' + esc(label) + "</span><strong>" + esc(val) + "</strong></div>"
      : "";

    return (
'<!doctype html><html lang="en"><head><meta charset="utf-8">' +
'<title>' + esc(m.docTitle) + " — " + esc(inv.name || "Investor") + " (" + esc(m.ref) + ')</title>' +
'<link rel="preconnect" href="https://fonts.googleapis.com">' +
'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
'<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400..700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">' +
"<style>" + CSS + "</style></head><body>" +

// ── toolbar (screen only) ──
'<div class="st-toolbar">' +
  '<div><strong>' + esc(m.docTitle) + '</strong> <span class="muted">— ' + esc(inv.name || "Investor") + " · " + esc(m.ref) + "</span></div>" +
  '<div class="st-toolbar-btns">' +
    '<button class="ghost" onclick="window.close()">Close</button>' +
    '<button onclick="window.print()">Print / Save as PDF</button>' +
  "</div>" +
"</div>" +

'<div class="st-page">' +

  // ── letterhead ──
  '<header class="st-letterhead">' +
    '<div class="st-brand">' + logoSvg("st-logo") + "</div>" +
    '<div class="st-office">' + esc(co.office || co.address) + "<br>" +
      "Company No. " + esc(co.no) + " &nbsp;·&nbsp; ICO Reg. " + esc(co.ico) + "<br>" +
      esc(co.email) + " &nbsp;·&nbsp; " + esc(co.phone) +
    "</div>" +
  "</header>" +

  // ── title band ──
  '<div class="st-titleband">' +
    '<div><div class="st-eyebrow">Official document</div>' +
      "<h1>" + esc(m.docTitle) + "</h1></div>" +
    '<div class="st-ref"><div class="st-eyebrow">Statement ref.</div>' +
      '<div class="st-ref-no">' + esc(m.ref) + "</div></div>" +
  "</div>" +

  // ── meta grid: who / period / generated ──
  '<div class="st-meta">' +
    metaRow("Account holder", inv.name) +
    metaRow("Account reference", inv.ref) +
    (inv.classification ? metaRow("Classification", inv.classification) : "") +
    metaRow("Statement period", m.period.label) +
    metaRow("Generated", m.generatedAt) +
    (inv.address ? metaRow("Registered address", inv.address) : "") +
  "</div>" +

  // ── body ──
  renderSummary(m.summary) +
  m.tables.map(renderTable).join("") +

  // ── signatory / issued-by block ──
  '<section class="st-sign">' +
    '<div class="st-sign-statement">' + esc(m.signatory.statement) + "</div>" +
    '<div class="st-sign-row">' +
      '<div class="st-sign-col">' +
        '<div class="st-sign-line"></div>' +
        '<div class="st-sign-name">' + esc(m.signatory.name) + "</div>" +
        '<div class="st-sign-title">' + esc(m.signatory.title) + "</div>" +
      "</div>" +
      '<div class="st-sign-col">' +
        '<div class="st-sign-line"></div>' +
        '<div class="st-sign-name">Date of issue</div>' +
        '<div class="st-sign-title">' + esc(m.generatedAt) + "</div>" +
      "</div>" +
      '<div class="st-stamp"><div class="st-stamp-inner">' +
        logoSvg("st-stamp-logo") +
        '<span class="st-stamp-sub">ISSUED</span>' +
        '<span class="st-stamp-ref">' + esc(m.ref) + "</span>" +
      "</div></div>" +
    "</div>" +
  "</section>" +

  // ── verification + disclaimer footer ──
  '<footer class="st-foot">' +
    '<div class="st-verify"><strong>Verify this statement.</strong> ' +
      "Quote reference <span class=\"mono\">" + esc(m.ref) + "</span> to " + esc(co.name) +
      " at " + esc(co.email) + " or " + esc(co.phone) + ". Issued by " + esc(co.name) +
      ", registered in England &amp; Wales (Co. " + esc(co.no) + "), registered office " + esc(co.address) + ".</div>" +
    '<div class="st-disclaimer">' + esc(m.disclaimer) + "</div>" +
  "</footer>" +

"</div></body></html>"
    );
  }

  function openInvestorStatement(model) {
    const html = buildInvestorStatementHTML(model);
    const w = window.open("", "_blank");
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    else { // popup blocked → fall back to a blob download
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      triggerDownload(URL.createObjectURL(blob), (normalise(model).ref || "CredX_Statement") + ".html");
    }
  }

  // ── data export (XLSX when available, else CSV) ──────────────────
  function triggerDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }

  function modelToSheets(m) {
    // Each sheet = { name, aoa } (array of arrays)
    const sheets = [];
    const meta = [
      [m.docTitle],
      [],
      ["Statement ref.", m.ref],
      ["Account holder", m.investor.name || ""],
      ["Account reference", m.investor.ref || ""],
    ];
    if (m.investor.classification) meta.push(["Classification", m.investor.classification]);
    meta.push(["Statement period", m.period.label]);
    meta.push(["Generated", m.generatedAt]);
    meta.push(["Issued by", m.company.name + " (Co. " + m.company.no + " · ICO " + m.company.ico + ")"]);
    if (m.summary.length) {
      meta.push([]);
      meta.push(["HOLDINGS SUMMARY"]);
      m.summary.forEach(c => meta.push([c.label, c.value, c.sub || ""]));
    }
    sheets.push({ name: "Summary", aoa: meta });

    m.tables.forEach(t => {
      const aoa = [];
      aoa.push([t.title]);
      if (t.note) aoa.push([t.note]);
      aoa.push([]);
      aoa.push(t.columns.map(c => c.label));
      t.rows.forEach(r => aoa.push(r.slice()));
      if (t.total) aoa.push(t.total.slice());
      sheets.push({ name: (t.id || t.title || "Sheet").slice(0, 28), aoa });
    });
    return sheets;
  }

  function downloadStatementData(model, base) {
    const m = normalise(model);
    const filenameBase = base || ("CredX_Statement_" + (m.investor.ref || "INV") + "_" +
      new Date().toISOString().slice(0, 10));
    const sheets = modelToSheets(m);

    if (window.XLSX) {
      const wb = window.XLSX.utils.book_new();
      const used = {};
      sheets.forEach(s => {
        let name = s.name.replace(/[\\/?*\[\]:]/g, " ").slice(0, 28) || "Sheet";
        while (used[name.toLowerCase()]) name = name.slice(0, 26) + "·" + (Object.keys(used).length);
        used[name.toLowerCase()] = true;
        const ws = window.XLSX.utils.aoa_to_sheet(s.aoa);
        window.XLSX.utils.book_append_sheet(wb, ws, name);
      });
      window.XLSX.writeFile(wb, filenameBase + ".xlsx");
      return;
    }

    // CSV fallback — one file, sections separated by blank lines.
    const escCsv = (v) => {
      const s = String(v == null ? "" : v);
      return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lines = [];
    sheets.forEach((s, i) => {
      if (i > 0) { lines.push(""); lines.push(""); }
      s.aoa.forEach(row => lines.push(row.map(escCsv).join(",")));
    });
    const csv = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    triggerDownload(URL.createObjectURL(blob), filenameBase + ".csv");
  }

  // ── stylesheet (inlined into the generated document) ─────────────
  const CSS = `
  * { box-sizing: border-box; }
  :root {
    --ink: #15201d; --ink-2: #46535a; --ink-3: #7a858c;
    --teal: #117a82; --teal-ink: #0b5a60;
    --line: #d9d8d0; --line-2: #e8e6dd;
    --paper: #ffffff; --sunk: #f4f2ec; --tint: rgba(17,122,130,.07);
  }
  body { font-family: 'Manrope', system-ui, sans-serif; color: var(--ink);
    margin: 0; background: #ece9e1; font-size: 13px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
  .muted { color: rgba(244,241,234,.6); }

  .st-toolbar { position: sticky; top: 0; z-index: 10; background: #0e1418; color: #f4f1ea;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 12px 24px; font-size: 13px; }
  .st-toolbar-btns { display: flex; gap: 8px; }
  .st-toolbar button { font: inherit; font-weight: 600; cursor: pointer; border: 0;
    padding: 9px 16px; background: var(--teal); color: #fff; }
  .st-toolbar button.ghost { background: transparent; color: #f4f1ea; border: 1px solid rgba(244,241,234,.3); }

  .st-page { max-width: 860px; margin: 28px auto 90px; background: var(--paper);
    padding: 56px 60px 48px; box-shadow: 0 12px 44px rgba(0,0,0,.14); }

  .st-letterhead { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
    border-bottom: 2px solid var(--ink); padding-bottom: 16px; }
  .st-brand { display: flex; flex-direction: column; }
  .st-logo { height: 44px; width: auto; display: block; color: var(--ink); }
  .st-mark { font-family: 'Source Serif 4', Georgia, serif; font-weight: 700; font-size: 30px;
    letter-spacing: -0.5px; line-height: 1; color: var(--ink); }
  .st-mark span { color: var(--teal); }
  .st-brand-sub { font-size: 10px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--ink-3); margin-top: 6px; }
  .st-office { text-align: right; font-size: 10px; line-height: 1.65; color: var(--ink-3); max-width: 360px; }

  .st-titleband { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin: 26px 0 22px; }
  .st-eyebrow { font-size: 9.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--teal-ink); }
  .st-titleband h1 { font-family: 'Source Serif 4', Georgia, serif; font-weight: 600;
    font-size: 30px; letter-spacing: -0.01em; margin: 6px 0 0; color: var(--ink); white-space: nowrap; }
  .st-ref { text-align: right; flex-shrink: 0; }
  .st-ref-no { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; margin-top: 6px; color: var(--ink); }

  .st-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--line);
    background: var(--sunk); margin-bottom: 30px; }
  .st-meta-item { display: flex; flex-direction: column; gap: 3px; padding: 11px 16px; border-bottom: 1px solid var(--line-2); }
  .st-meta-item:nth-child(odd) { border-right: 1px solid var(--line-2); }
  .st-meta-item span { font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
  .st-meta-item strong { font-size: 13.5px; font-weight: 600; color: var(--ink); }

  .st-block { margin: 0 0 30px; }
  .st-block-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
    flex-wrap: nowrap; border-bottom: 1.5px solid var(--ink); padding-bottom: 7px; margin-bottom: 14px; }
  .st-block-head h3 { font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; font-size: 17px; margin: 0; color: var(--ink); white-space: nowrap; }
  .st-note { font-size: 11px; color: var(--ink-3); text-align: right; flex-shrink: 0; white-space: nowrap; }

  .st-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--line-2); border: 1px solid var(--line-2); }
  .st-kpi { background: var(--paper); padding: 14px 16px; }
  .st-kpi-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
  .st-kpi-val { font-family: 'Source Serif 4', Georgia, serif; font-size: 22px; font-weight: 600; margin-top: 7px; color: var(--ink); letter-spacing: -0.01em; }
  .st-kpi-sub { font-size: 10.5px; color: var(--ink-3); margin-top: 4px; line-height: 1.4; }

  .st-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .st-table thead th { text-align: left; font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ink-3); padding: 0 10px 7px; border-bottom: 1px solid var(--line); white-space: nowrap; }
  .st-table tbody td { padding: 8px 10px; border-bottom: 1px solid var(--line-2); color: var(--ink-2); vertical-align: top; }
  .st-table tbody tr:nth-child(even) td { background: #faf9f5; }
  .st-table td:first-child, .st-table th:first-child { padding-left: 2px; }
  .st-table td:last-child, .st-table th:last-child { padding-right: 2px; }
  .al-right { text-align: right; font-variant-numeric: tabular-nums; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; }
  .al-center { text-align: center; }
  tr.st-total td { border-top: 1.5px solid var(--ink); border-bottom: none; font-weight: 700; color: var(--ink);
    background: var(--tint) !important; padding-top: 9px; padding-bottom: 9px; }

  .st-sign { margin: 38px 0 0; border-top: 1px solid var(--line); padding-top: 22px; page-break-inside: avoid; }
  .st-sign-statement { font-size: 12px; color: var(--ink-2); line-height: 1.6; max-width: 78%; margin-bottom: 30px; }
  .st-sign-row { display: flex; align-items: flex-end; gap: 36px; }
  .st-sign-col { flex: 1; }
  .st-sign-line { height: 36px; border-bottom: 1px solid var(--ink); }
  .st-sign-name { font-size: 12.5px; font-weight: 600; margin-top: 7px; color: var(--ink); }
  .st-sign-title { font-size: 11px; color: var(--ink-3); margin-top: 2px; }
  .st-stamp { width: 116px; height: 116px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--teal); border-radius: 50%; transform: rotate(-9deg); opacity: .92; }
  .st-stamp-inner { display: flex; flex-direction: column; align-items: center; gap: 5px; text-align: center;
    border: 1px solid rgba(17,122,130,.4); border-radius: 50%; width: 98px; height: 98px; justify-content: center; }
  .st-stamp-logo { height: 15px; width: auto; color: var(--teal); }
  .st-stamp-mark { font-family: 'Source Serif 4', Georgia, serif; font-weight: 700; font-size: 19px; color: var(--teal); line-height: 1; }
  .st-stamp-mark span { color: var(--ink); }
  .st-stamp-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.28em; color: var(--teal-ink); }
  .st-stamp-ref { font-family: 'JetBrains Mono', monospace; font-size: 7px; color: var(--ink-3); letter-spacing: 0.02em; }

  .st-foot { margin-top: 34px; border-top: 1px solid var(--line); padding-top: 16px; }
  .st-verify { font-size: 11px; color: var(--ink-2); line-height: 1.6; margin-bottom: 12px; }
  .st-verify .mono { font-weight: 600; color: var(--ink); }
  .st-disclaimer { font-size: 10px; color: var(--ink-3); line-height: 1.6; }

  @media print {
    @page { size: A4; margin: 14mm; }
    body { background: #fff; font-size: 11px; }
    .st-toolbar { display: none !important; }
    .st-page { box-shadow: none; margin: 0; max-width: none; padding: 0; }
    .st-block, .st-table tr { page-break-inside: avoid; }
    .st-table thead { display: table-header-group; }
  }`;

  Object.assign(window, {
    buildInvestorStatementHTML,
    openInvestorStatement,
    downloadStatementData,
    _statementMakeRef: makeRef,
  });
})();
