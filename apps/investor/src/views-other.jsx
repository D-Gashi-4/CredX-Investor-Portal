// views-other.jsx - Updates, Documents, Account

// ─────────────────────────────────────────────────────────────────
// Updates feed
// ─────────────────────────────────────────────────────────────────
function UpdatesView() {
  const [filter, setFilter] = React.useState("all");
  const list = UPDATES.filter(u => {
    if (filter === "all") return true;
    if (filter === "platform") return u.kind === "Platform";
    if (filter === "deals") return u.kind === "Deal update";
    if (filter === "statements") return u.kind === "Statement";
    return true;
  });

  return (
    <div>
      <div className="filter-bar" style={{ marginTop: 24 }}>
        <div className="chip-grp">
          {[
            ["all", "All updates"],
            ["platform", "Platform"],
            ["deals", "Deal updates"],
            ["statements", "Statements"],
          ].map(([k, l]) => (
            <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="search">
          <I.search />
          <input placeholder="Search updates" />
        </div>
      </div>

      <div className="card" style={{ borderTop: 0, padding: "0 28px" }}>
        <div className="feed">
          {list.map(u => (
            <article key={u.id} className="feed-item">
              <div className="meta">
                <div className="date">{u.date}</div>
                <div className="kind">{u.kind}</div>
                {u.pinned && <div style={{ marginTop: 8, color: "var(--accent)", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}><I.pin /> Pinned</div>}
              </div>
              <div>
                {u.dealId && (
                  <div style={{ marginBottom: 6 }}>
                    <span className="tag" style={{ background: "var(--accent-tint)", borderColor: "transparent", color: "var(--accent-ink)" }} className="mono">
                      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.04em" }}>{u.dealId}</span>
                    </span>
                  </div>
                )}
                <h4>{u.title}</h4>
                <p>{u.body}</p>
                {u.attachments.length > 0 && u.attachments.map((a, i) => (
                  <a key={i} className="attach" href="#" onClick={e => e.preventDefault()}>
                    <I.doc /> {a}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
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
