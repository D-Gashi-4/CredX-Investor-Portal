// views-other.jsx - Updates, Documents, Account

// ─────────────────────────────────────────────────────────────────
// Updates feed
// ─────────────────────────────────────────────────────────────────
const UPD_FILTERS = [
  ["all", "All updates", null],
  ["platform", "Platform", "Platform"],
  ["deals", "Deal updates", "Deal update"],
  ["market", "Market insight", "Market insight"],
  ["statements", "Statements", "Statement"],
  ["events", "Events", "Events"],
];

// Normalise attachments: bridge-pushed updates may carry plain strings.
function updAttachments(u) {
  return (u.attachments || []).map(a => {
    const att = typeof a === "string" ? { name: a.replace(/\s*\(PDF[^)]*\)\s*$/i, "") } : a;
    const doc = att.doc || {
      title: u.title, subtitle: u.kind + (u.dealId ? " · " + u.dealId : ""), ref: "CX-UPD-" + String(u.id).replace(/\D/g, ""),
      date: u.date, author: u.author || "CredX Ltd",
      blocks: u.article || [["p", u.body]],
    };
    return { ...att, doc: { eyebrow: u.kind, ...doc } };
  });
}
const openAtt = (a, e) => { if (e) { e.preventDefault(); e.stopPropagation(); } window.openUpdateDoc && window.openUpdateDoc(a.doc); };

function UpdBlocks({ blocks }) {
  return (blocks || []).map((b, i) => {
    const [t, v] = b;
    if (t === "h") return <h3 key={i} className="upd-h">{v}</h3>;
    if (t === "p") return <p key={i} className="upd-p">{v}</p>;
    if (t === "note") return <div key={i} className="upd-note">{v}</div>;
    if (t === "list") return <ul key={i} className="upd-list">{v.map((x, j) => <li key={j}>{x}</li>)}</ul>;
    if (t === "kpis") return (
      <div key={i} className="upd-kpis">
        {v.map(([l, val, s], j) => (
          <div key={j} className="upd-kpi"><div className="eyebrow">{l}</div><div className="v">{val}</div>{s && <div className="s">{s}</div>}</div>
        ))}
      </div>
    );
    if (t === "table") {
      const r = (k) => v.align && v.align[k] === "right" ? "num" : "";
      return (
        <div key={i} className="card" style={{ margin: "4px 0 18px", overflowX: "auto" }}>
          <table className="t">
            <thead><tr>{v.cols.map((c, k) => <th key={k} className={r(k) ? "right" : ""}>{c}</th>)}</tr></thead>
            <tbody>
              {v.rows.map((row, j) => <tr key={j}>{row.map((c, k) => <td key={k} className={r(k)}>{c}</td>)}</tr>)}
              {v.total && <tr className="upd-total">{v.total.map((c, k) => <td key={k} className={r(k)}>{c}</td>)}</tr>}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  });
}

function UpdAttachChip({ a }) {
  return (
    <a className="attach upd-attach" href="#" onClick={e => openAtt(a, e)}>
      <I.doc /> <span>{a.name}</span>
      <span className="mono upd-attach-meta">PDF{a.pages ? " · " + a.pages + "pp" : ""}{a.size ? " · " + a.size : ""}</span>
    </a>
  );
}

function UpdateReader({ u, onClose }) {
  const atts = u ? updAttachments(u) : [];
  return (
    <Drawer open={!!u} onClose={onClose} eyebrow={u ? u.kind + " · " + u.date : ""} title={u ? u.title : ""}
      actions={atts[0] && <button className="btn btn-sm" onClick={() => openAtt(atts[0])}><I.download /> PDF</button>}>
      {u && (
        <div className="upd-reader">
          <div className="upd-byline">
            {u.dealId && <span className="tag mono" style={{ background: "var(--accent-tint)", borderColor: "transparent", color: "var(--accent-ink)", fontSize: 11 }}>{u.dealId}</span>}
            <span>{u.author || "CredX"}</span>
            {u.readTime && <><span className="dot" /><span>{u.readTime}</span></>}
          </div>
          {u.article ? <UpdBlocks blocks={u.article} /> : <p className="upd-p">{u.body}</p>}
          {atts.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Attachments</div>
              <div className="card">
                {atts.map((a, i) => (
                  <div key={i} className="upd-file">
                    <div className="upd-file-ico">PDF</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="strong">{a.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{a.doc.ref}{a.pages ? " · " + a.pages + " pages" : ""}{a.size ? " · " + a.size : ""}</div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => openAtt(a)}>Open</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

function UpdatesView() {
  const [filter, setFilter] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(null);
  const kindOf = (k) => (UPD_FILTERS.find(f => f[0] === k) || [])[2];
  const query = q.trim().toLowerCase();
  const matches = (u) => !query || [u.title, u.body, u.dealId, u.kind].some(s => s && s.toLowerCase().includes(query));
  const list = UPDATES.filter(u => (filter === "all" || u.kind === kindOf(filter)) && matches(u));
  const featured = filter === "all" && !query ? UPDATES.find(u => u.pinned) : null;
  const feed = featured ? list.filter(u => u !== featured) : list;
  const library = UPDATES.flatMap(u => updAttachments(u).map(a => ({ ...a, u })));

  return (
    <div>
      <div className="filter-bar" style={{ marginTop: 24 }}>
        <div className="chip-grp">
          {UPD_FILTERS.map(([k, l, kind]) => {
            const n = kind ? UPDATES.filter(u => u.kind === kind).length : UPDATES.length;
            if (!n) return null;
            return <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l} <span className="mono" style={{ opacity: .6, fontSize: 10.5 }}>{n}</span></button>;
          })}
        </div>
        <div className="search">
          <I.search />
          <input placeholder="Search updates" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div className="upd-layout">
        <div style={{ minWidth: 0 }}>
          {featured && (
            <article className="card upd-feature" onClick={() => setOpen(featured)}>
              <div className="upd-feature-meta">
                <span className="eyebrow" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 4 }}><I.pin /> Pinned · {featured.kind}</span>
                <span className="mono">{featured.date}</span>
              </div>
              <h2>{featured.title}</h2>
              <p>{featured.body}</p>
              {(featured.article || []).filter(b => b[0] === "kpis").slice(0, 1).map((b, i) => <UpdBlocks key={i} blocks={[b]} />)}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); setOpen(featured); }}>Read letter <I.arrowRight /></button>
                {updAttachments(featured).map((a, i) => <UpdAttachChip key={i} a={a} />)}
              </div>
            </article>
          )}

          <div className="card" style={{ padding: "0 28px", marginTop: featured ? 16 : 0 }}>
            {feed.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>No updates match your search.</div>}
            <div className="feed">
              {feed.map(u => (
                <article key={u.id} className="feed-item upd-item" onClick={() => setOpen(u)}>
                  <div className="meta">
                    <div className="date">{u.date}</div>
                    <div className="kind">{u.kind}</div>
                    {u.readTime && <div style={{ marginTop: 6, fontSize: 11 }}>{u.readTime}</div>}
                  </div>
                  <div>
                    {u.dealId && (
                      <div style={{ marginBottom: 6 }}>
                        <span className="tag mono" style={{ background: "var(--accent-tint)", borderColor: "transparent", color: "var(--accent-ink)", fontSize: 11, letterSpacing: "0.04em" }}>{u.dealId}</span>
                      </div>
                    )}
                    <h4>{u.title}</h4>
                    <p>{u.body}</p>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                      {updAttachments(u).map((a, i) => <UpdAttachChip key={i} a={a} />)}
                      <span className="upd-more">Read more <I.arrowRight /></span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="upd-side">
          <div className="card">
            <div className="card-head"><h3 className="h-card" style={{ color: "var(--ink)" }}>Reports &amp; PDFs</h3><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{library.length}</span></div>
            <div>
              {library.map((a, i) => (
                <a key={i} href="#" className="upd-lib" onClick={e => openAtt(a, e)}>
                  <div className="upd-file-ico">PDF</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="upd-lib-name">{a.name}</div>
                    <div className="mono upd-lib-meta">{a.u.date}{a.pages ? " · " + a.pages + "pp" : ""}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginTop: 16, padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Questions</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>Contact the investor team at <a href="mailto:info@credx.co.uk">info@credx.co.uk</a> or 0204 628 0990.</div>
          </div>
        </aside>
      </div>

      <UpdateReader u={open} onClose={() => setOpen(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Documents vault
// ─────────────────────────────────────────────────────────────────
function DocumentsView() {
  const [cat, setCat] = React.useState("All");
  const categories = ["All", ...Array.from(new Set(DOCUMENTS.map(d => d.category)))];
  const list = DOCUMENTS.filter(d => cat === "All" || d.category === cat);

  return (
    <div>
      <div className="cols-2" style={{ gridTemplateColumns: "240px 1fr", marginTop: 24, gap: 0, alignItems: "flex-start" }}>
        {/* Categories */}
        <div style={{ borderRight: "1px solid var(--border)", paddingRight: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Categories</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {categories.map(c => {
              const n = c === "All" ? DOCUMENTS.length : DOCUMENTS.filter(d => d.category === c).length;
              return (
                <button key={c}
                  onClick={() => setCat(c)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px",
                    background: cat === c ? "var(--bg-elev)" : "transparent",
                    color: cat === c ? "var(--ink)" : "var(--ink-2)",
                    fontSize: 13.5,
                    fontWeight: cat === c ? 600 : 400,
                    border: "1px solid " + (cat === c ? "var(--border)" : "transparent"),
                    borderRight: 0,
                    marginRight: -25,
                    textAlign: "left",
                  }}>
                  <span>{c}</span>
                  <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ paddingLeft: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{cat}</div>
              <h2 className="h-sect">{list.length} document{list.length === 1 ? "" : "s"}</h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm"><I.filter /> Filter</button>
              <button className="btn btn-sm btn-primary"><I.download /> Download all</button>
            </div>
          </div>
          <div className="card">
            <table className="t">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Category</th>
                  <th>Linked facility</th>
                  <th className="right">Date</th>
                  <th className="right">Size</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map(d => (
                  <tr key={d.id} className="row">
                    <td>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <I.doc style={{ color: "var(--ink-3)" }} />
                        <div className="strong">{d.name}</div>
                      </div>
                    </td>
                    <td className="muted">{d.category}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{d.deal || "-"}</td>
                    <td className="num muted">{d.date}</td>
                    <td className="num muted">{d.size}</td>
                    <td className="right"><button className="iconbtn"><I.download /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
Object.assign(window, { UpdatesView, DocumentsView });
