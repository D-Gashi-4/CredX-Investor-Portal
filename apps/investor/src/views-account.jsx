// views-account.jsx - fully functional Account section.
// Tabs: Profile & identity / Banking / Communication / Notifications / Security / Tax
// All preferences persist in localStorage so refresh-survives like the rest of the portal.

const ACCT_TABS = [
  ["profile",   "Profile & identity"],
  ["documents", "Verification"],
  ["banking",   "Banking"],
  ["comms",     "Communication"],
  ["notifs",    "Notifications"],
  ["security",  "Security"],
  ["display",   "Display"],
  ["tax",       "Tax"],
];

// ── shared local-storage helpers ────────────────────────────────
const ACCT_KEY = "credx-account-settings-v2";
const DEFAULT_ACCT = {
  profile: {
    name: "Dorant Gashi",
    email: "d.gashi@example.co.uk",
    phone: "+44 7700 900421",
    address: "17 Westfield Court, Sevenoaks, Kent TN13 1QQ",
    dob: "1972-08-14",
    avatar: null,           // null = initials fallback; otherwise a key from avatars.jsx
    initialsBg: "#0e1418",  // bg colour used when avatar is null
    animalBg:   "#0e1418",  // bg colour for the animal avatar circle
  },
  banking: {
    bank:    "Lloyds Bank",
    sort:    "30-12-XX",
    account: "XXXXXX4421",
    holder:  "Dorant Gashi",
    verified: "26 May 2026",
    // Bank statements uploaded to support each banking-detail change.
    // Each entry: { id, name, size (bytes), uploadedAt, reason }
    statements: [
      { id: "bks-003", name: "Lloyds-statement-Apr-2026.pdf", size: 421400, uploadedAt: "26 May 2026", reason: "Name verification - approved" },
      { id: "bks-002", name: "Lloyds-statement-Mar-2026.pdf", size: 398200, uploadedAt: "26 May 2026", reason: "Name verification - approved" },
      { id: "bks-001", name: "Lloyds-statement-Jan-2026.pdf", size: 412800, uploadedAt: "12 Feb 2026", reason: "Initial verification" },
    ],
  },
  comms: {
    preferredChannel: "email",
    mailing: {
      sameAsResidence: true,
      address: "",
    },
    marketing: {
      quarterlyLetter: true,
      educational: true,
      events: false,
      partners: false,
    },
  },
  notifs: {
    newOpportunities: { email: true,  sms: false },
    statements:        { email: true,  sms: false },
    dealUpdates:       { email: true,  sms: true  },
    materialEvents:    { email: true,  sms: true  },
    distributions:     { email: true,  sms: true  },
    weeklyDigest:      { email: false, sms: false },
  },
  security: {
    twoFA: true,
    recoveryCodesGenerated: "12 Feb 2026",
  },
  tax: {
    residency: "United Kingdom",
    utr: "1234567890",
    nino: "QQ123456C",
    withholding: "gross",
  },
};

function loadAcct() {
  try {
    const s = localStorage.getItem(ACCT_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      return {
        ...DEFAULT_ACCT,
        ...parsed,
        // deep merge each section so new keys backfill from defaults
        profile:  { ...DEFAULT_ACCT.profile,  ...(parsed.profile  || {}) },
        banking:  { ...DEFAULT_ACCT.banking,  ...(parsed.banking  || {}) },
        comms:    { ...DEFAULT_ACCT.comms,    ...(parsed.comms    || {}) },
        notifs:   { ...DEFAULT_ACCT.notifs,   ...(parsed.notifs   || {}) },
        security: { ...DEFAULT_ACCT.security, ...(parsed.security || {}) },
        tax:      { ...DEFAULT_ACCT.tax,      ...(parsed.tax      || {}) },
      };
    }
  } catch {}
  return DEFAULT_ACCT;
}

function useAcct() {
  const [acct, setAcct] = React.useState(loadAcct);
  const update = (section, patch) => setAcct(prev => {
    const next = { ...prev, [section]: { ...prev[section], ...patch } };
    try { localStorage.setItem(ACCT_KEY, JSON.stringify(next)); } catch {}
    return next;
  });
  return [acct, update];
}

// ── Top-level AccountView ───────────────────────────────────────
function AccountView({ initialTab = "profile", tweaks, setTweak, accents }) {
  const [tab, setTab] = React.useState(initialTab);
  React.useEffect(() => { setTab(initialTab); }, [initialTab]);
  const [acct, update] = useAcct();
  const [savedToast, setSavedToast] = React.useState("");

  const onSaved = (label = "Changes saved") => {
    setSavedToast(label);
    setTimeout(() => setSavedToast(""), 2400);
  };

  const tabLabel = ACCT_TABS.find(([id]) => id === tab)[1];

  return (
    <div className="acct-layout" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "240px 1fr", gap: 0, alignItems: "flex-start" }}>
      <div className="acct-side" style={{ borderRight: "1px solid var(--border)", paddingRight: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Settings</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ACCT_TABS.map(([id, label]) => {
            const on = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px",
                  background: on ? "var(--bg-elev)" : "transparent",
                  color: on ? "var(--ink)" : "var(--ink-2)",
                  fontSize: 13.5,
                  fontWeight: on ? 600 : 400,
                  border: "1px solid " + (on ? "var(--border)" : "transparent"),
                  borderRight: 0,
                  marginRight: -25,
                  textAlign: "left",
                }}>
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Funder reference</div>
          <div className="mono" style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{INVESTOR.accountId}</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, letterSpacing: "0.04em" }}>
            Member since 12 Feb 2026
          </div>
        </div>
      </div>

      <div className="acct-main" style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 28, position: "relative" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{tabLabel}</div>
          <h2 className="h-sect">{
            tab === "profile"  ? "Investor profile" :
            tab === "documents" ? "Documents & verification" :
            tab === "banking"  ? "Nominated banking" :
            tab === "comms"    ? "Communication preferences" :
            tab === "notifs"   ? "Notifications" :
            tab === "security" ? "Security & access" :
            tab === "display"  ? "Display & appearance" :
            tab === "tax"      ? "Tax information" : ""
          }</h2>
        </div>

        {tab === "profile"  && <TabProfile  acct={acct} update={update} onSaved={onSaved} />}
        {tab === "documents" && <TabDocuments onSaved={onSaved} />}
        {tab === "banking"  && <TabBanking  acct={acct} update={update} onSaved={onSaved} />}
        {tab === "comms"    && <TabComms    acct={acct} update={update} onSaved={onSaved} />}
        {tab === "notifs"   && <TabNotifs   acct={acct} update={update} onSaved={onSaved} />}
        {tab === "security" && <TabSecurity acct={acct} update={update} onSaved={onSaved} />}
        {tab === "display"  && <TabDisplay  tweaks={tweaks} setTweak={setTweak} accents={accents} onSaved={onSaved} />}
        {tab === "tax"      && <TabTax      acct={acct} update={update} onSaved={onSaved} />}

        {savedToast && (
          <div style={{
            position: "fixed", bottom: 24, right: 24,
            background: "var(--ink)", color: "var(--bg-elev)",
            padding: "10px 16px",
            fontSize: 13, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 8px 24px rgba(14,20,24,.22)",
            zIndex: 250,
          }}>
            <span style={{ color: "var(--pos)" }}><I.check /></span>
            {savedToast}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Profile & identity
// ─────────────────────────────────────────────────────────────────
function TabProfile({ acct, update, onSaved }) {
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState(acct.profile);
  // Separate edit state for the avatar picker — opening the grid stages
  // changes into `avatarDraft`; Save commits, Cancel reverts.
  const [editingAvatar, setEditingAvatar] = React.useState(false);
  const [avatarDraft, setAvatarDraft] = React.useState({
    avatar:     acct.profile.avatar,
    initialsBg: acct.profile.initialsBg,
    animalBg:   acct.profile.animalBg,
  });
  React.useEffect(() => { setLocal(acct.profile); }, [acct.profile, editing]);
  React.useEffect(() => {
    if (!editingAvatar) {
      setAvatarDraft({
        avatar:     acct.profile.avatar,
        initialsBg: acct.profile.initialsBg,
        animalBg:   acct.profile.animalBg,
      });
    }
  }, [acct.profile, editingAvatar]);

  const save = () => {
    update("profile", local);
    setEditing(false);
    onSaved("Profile updated");
    window.dispatchEvent(new Event("credx-profile"));
  };

  const saveAvatar = () => {
    const next = { ...local, ...avatarDraft };
    setLocal(next);
    update("profile", next);
    setEditingAvatar(false);
    onSaved("Profile picture updated");
    window.dispatchEvent(new Event("credx-profile"));
  };
  const cancelAvatar = () => {
    setAvatarDraft({
      avatar:     acct.profile.avatar,
      initialsBg: acct.profile.initialsBg,
      animalBg:   acct.profile.animalBg,
    });
    setEditingAvatar(false);
  };

  // The avatar preview & inline pickers all read from avatarDraft when
  // editing, otherwise from the committed acct.profile values.
  const view = editingAvatar ? avatarDraft : acct.profile;

  return (
    <>
      {/* Avatar / profile picture */}
      <div className="card" id="profile-picture-card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Profile picture</h3>
          {!editingAvatar
            ? <button className="btn btn-sm btn-ghost" onClick={() => setEditingAvatar(true)}>Edit profile picture</button>
            : <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm" onClick={cancelAvatar}>Cancel</button>
                <button className="btn btn-sm btn-primary" onClick={saveAvatar}>Save</button>
              </div>
          }
        </div>
        <div style={{ padding: "16px 20px 20px" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div>
              <InvestorAvatar
                avatarId={view.avatar}
                initials={INVESTOR.initials}
                size={84}
                initialsBg={view.initialsBg}
                animalBg={view.animalBg}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: editingAvatar ? 0 : 8 }}>
                Choose an avatar - this shows in the top-right of the portal, in your account menu, and on any internal CredX comms about your account.
              </div>
              {!editingAvatar && (
                <button className="btn btn-sm" onClick={() => setEditingAvatar(true)}>
                  Edit profile picture
                </button>
              )}
              {editingAvatar && view.avatar && (
                <button className="btn btn-sm btn-ghost" style={{ marginTop: 8 }} onClick={() => {
                  setAvatarDraft({ ...avatarDraft, avatar: null });
                }}>Use initials instead</button>
              )}
            </div>
          </div>

          {editingAvatar && (
            <>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
                paddingTop: 16, marginTop: 16, borderTop: "1px solid var(--border)",
              }}>
                {AVATAR_KEYS.map(k => {
                  const on = avatarDraft.avatar === k;
                  const meta = AVATAR_META[k] || { name: k, desc: "" };
                  return (
                    <button key={k} type="button"
                      onClick={() => setAvatarDraft({ ...avatarDraft, avatar: k })}
                      title={meta.name}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: "12px 8px 10px",
                        background: on ? "var(--accent-tint)" : "var(--bg)",
                        border: "1px solid " + (on ? "var(--accent)" : "var(--border-2)"),
                        cursor: "pointer",
                      }}>
                      <AnimalAvatar id={k} size={64} bg={on ? avatarDraft.animalBg : undefined} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: on ? "var(--accent-ink)" : "var(--ink)" }}>{meta.name}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.3 }}>{meta.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Animal-avatar background colour picker - only when an animal is chosen */}
              {avatarDraft.avatar && (
                <div style={{ paddingTop: 16, marginTop: 16, borderTop: "1px solid var(--border)" }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Background colour</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["#0e1418", "#117a82", "#7a2b2b", "#3b6a3b", "#d97757", "#5a3a2a", "#c79256", "#777e84"].map(c => {
                      const on = (avatarDraft.animalBg || "#0e1418").toLowerCase() === c.toLowerCase();
                      return (
                        <button key={c} type="button"
                          onClick={() => setAvatarDraft({ ...avatarDraft, animalBg: c })}
                          title={c}
                          style={{
                            width: 34, height: 34,
                            background: c,
                            border: "2px solid " + (on ? "var(--accent)" : "transparent"),
                            outline: on ? "none" : "1px solid var(--border-2)",
                            cursor: "pointer",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {on && <I.check style={{ width: 14, height: 14, color: "#fff", filter: "drop-shadow(0 0 1px rgba(0,0,0,.6))" }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Initials background colour picker - only relevant if no animal is chosen */}
              {!avatarDraft.avatar && (
                <div style={{ paddingTop: 16, marginTop: 16, borderTop: "1px solid var(--border)" }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Background colour for initials</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["#0e1418", "#117a82", "#7a2b2b", "#3b6a3b", "#d97757", "#5a3a2a", "#c79256", "#777e84"].map(c => {
                      const on = (avatarDraft.initialsBg || "#0e1418").toLowerCase() === c.toLowerCase();
                      return (
                        <button key={c} type="button"
                          onClick={() => setAvatarDraft({ ...avatarDraft, initialsBg: c })}
                          title={c}
                          style={{
                            width: 34, height: 34,
                            background: c,
                            border: "2px solid " + (on ? "var(--accent)" : "transparent"),
                            outline: on ? "none" : "1px solid var(--border-2)",
                            outlineOffset: 0,
                            cursor: "pointer",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {on && <I.check style={{ width: 14, height: 14, color: "#fff", filter: "drop-shadow(0 0 1px rgba(0,0,0,.6))" }} />}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 10, lineHeight: 1.5 }}>
                    Text colour adjusts automatically for contrast.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Identity</h3>
          {!editing
            ? <button className="btn btn-sm btn-ghost" onClick={() => setEditing(true)}>Edit</button>
            : <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-sm btn-primary" onClick={save}>Save</button>
              </div>
          }
        </div>
        <div style={{ padding: "8px 20px 20px" }}>
          {!editing ? (
            <dl className="dl" style={{ borderTop: 0 }}>
              <div><dt>Legal name</dt><dd>{local.name}</dd></div>
              <div><dt>Account ID</dt><dd className="mono">{INVESTOR.accountId}</dd></div>
              <div><dt>Email</dt><dd>{local.email}</dd></div>
              <div><dt>Phone</dt><dd>{local.phone}</dd></div>
              <div><dt>Address</dt><dd>{local.address}</dd></div>
              <div><dt>Date of birth</dt><dd>{local.dob}</dd></div>
            </dl>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
              <div className="field"><label>Legal name</label><input value={local.name}   onChange={e => setLocal({ ...local, name: e.target.value })} /></div>
              <div className="field"><label>Email</label>      <input type="email" value={local.email}  onChange={e => setLocal({ ...local, email: e.target.value })} /></div>
              <div className="field"><label>Phone</label>      <input type="tel"   value={local.phone}  onChange={e => setLocal({ ...local, phone: e.target.value })} /></div>
              <div className="field"><label>Date of birth</label><input type="date" value={local.dob} onChange={e => setLocal({ ...local, dob: e.target.value })} /></div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Address</label>
                <textarea rows={2} value={local.address} onChange={e => setLocal({ ...local, address: e.target.value })} />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <div className="help">Significant changes (name, address, DOB) trigger a re-verification with GoIdentity for AML compliance.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Investor classification</h3>
          <span className="tag" style={{ background: "var(--pos-tint)", color: "var(--pos)", borderColor: "transparent" }}>
            <I.check style={{ marginRight: 4 }} /> Verified
          </span>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Classification</div>
            <div style={{ fontFamily: "var(--ff-serif)", fontSize: 22, letterSpacing: "-0.005em" }}>Sophisticated Investor</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>Self-certified · valid through 12 Feb 2027</div>
            <button className="btn btn-sm" style={{ marginTop: 12 }}>Re-certify</button>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>KYC / AML</div>
            <div style={{ fontFamily: "var(--ff-serif)", fontSize: 22, letterSpacing: "-0.005em" }}>Complete</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>Verified by GoIdentity · 12 Feb 2026</div>
            <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => onSaved("GoIdentity re-verification email sent")}>Re-verify via GoIdentity</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Your CredX contact</h3>
        </div>
        <div style={{ padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>cX</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{INVESTOR.rm.name}</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{INVESTOR.rm.title} · 24-48 hr response</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
              <a href={"mailto:" + INVESTOR.rm.email}>{INVESTOR.rm.email}</a>{" · "}
              <a href={"tel:" + INVESTOR.rm.phone.replace(/\s/g, "")}>{INVESTOR.rm.phone}</a>
            </div>
          </div>
          <a className="btn" href={"mailto:" + INVESTOR.rm.email}>Email</a>
          <a className="btn" href={"tel:" + INVESTOR.rm.phone.replace(/\s/g, "")}>Call</a>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Banking
// ─────────────────────────────────────────────────────────────────
function TabBanking({ acct, update, onSaved }) {
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState(acct.banking);
  // Newly-staged statement uploads, only attached on Save
  const [stagedFiles, setStagedFiles] = React.useState([]);
  const [dragging, setDragging] = React.useState(false);
  const [fileError, setFileError] = React.useState("");
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    setLocal(acct.banking);
    if (!editing) { setStagedFiles([]); setFileError(""); }
  }, [acct.banking, editing]);

  // Did any of the actual bank-detail fields change?
  const detailsChanged = (
    local.holder !== acct.banking.holder ||
    local.bank   !== acct.banking.bank ||
    local.sort   !== acct.banking.sort ||
    local.account !== acct.banking.account
  );
  // Name on the bank account must match the name on the investor account.
  // We normalise both sides (case + whitespace) before comparing so a
  // stray capital or extra space doesn't flag.
  const normaliseName = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
  const investorName = acct.profile && acct.profile.name;
  const holderMatches = normaliseName(local.holder) === normaliseName(investorName);
  const showNameError = editing && local.holder.trim().length > 0 && !holderMatches;
  const needsStatements = detailsChanged;
  const canSave = (!needsStatements || stagedFiles.length >= 2) && holderMatches;

  const fmtSize = (b) => b >= 1024 * 1024
    ? (b / (1024 * 1024)).toFixed(2) + " MB"
    : (b / 1024).toFixed(0) + " KB";

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const acceptFile = (file) => {
    setFileError("");
    const ok = /\.(pdf|jpg|jpeg|png|heic)$/i.test(file.name);
    if (!ok)              { setFileError("Only PDF, JPG, PNG or HEIC files are accepted."); return; }
    if (file.size > 10 * 1024 * 1024) { setFileError("Each statement must be under 10 MB."); return; }
    setStagedFiles(prev => [...prev, {
      id: "bks-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      name: file.name,
      size: file.size,
      uploadedAt: today,
      reason: "Banking update " + today,
    }]);
  };

  const onFilesPicked = (files) => {
    Array.from(files).forEach(acceptFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStaged = (id) => setStagedFiles(prev => prev.filter(f => f.id !== id));

  const save = () => {
    const merged = {
      ...local,
      statements: [...stagedFiles, ...(acct.banking.statements || [])],
      verified: needsStatements ? "Pending re-verification" : acct.banking.verified,
    };
    update("banking", merged);
    setEditing(false);
    setStagedFiles([]);
    onSaved(needsStatements
      ? "Banking updated · " + stagedFiles.length + " statement" + (stagedFiles.length === 1 ? "" : "s") + " uploaded. Re-verification email sent."
      : "Banking saved.");
  };

  const isVerified = acct.banking.verified && !acct.banking.verified.includes("Pending");
  const statementsOnFile = acct.banking.statements || [];

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Nominated account</h3>
          {!editing
            ? <button className="btn btn-sm btn-ghost" onClick={() => setEditing(true)}>Update</button>
            : <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-sm btn-primary" onClick={save}
                        disabled={!canSave}
                        style={!canSave ? { opacity: 0.45, cursor: "not-allowed" } : undefined}>Save</button>
              </div>
          }
        </div>
        <div style={{ padding: 20 }}>
          {!editing ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "var(--bg-sunk)", border: "1px solid var(--border)" }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Account holder</div>
                  <div style={{ fontFamily: "var(--ff-serif)", fontSize: 20, letterSpacing: "-0.005em" }}>{acct.banking.holder}</div>
                  <div className="mono" style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>
                    {acct.banking.bank} · {acct.banking.sort} · ••{acct.banking.account.slice(-4)}
                  </div>
                </div>
                <span className="tag" style={{
                  background: isVerified ? "var(--pos-tint)" : "var(--warn-tint)",
                  color: isVerified ? "var(--pos)" : "var(--warn)",
                  borderColor: "transparent",
                }}>{isVerified ? "Verified " + acct.banking.verified : acct.banking.verified}</span>
              </div>
              {/* Persistent mismatch warning on the read-only view */}
              {!holderMatches && acct.banking.holder && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "var(--neg-tint)",
                  borderLeft: "3px solid var(--neg)",
                  fontSize: 12.5, color: "var(--neg)", lineHeight: 1.55,
                }}>
                  <strong>Name mismatch.</strong> The account holder on file (<span className="mono" style={{ color: "var(--ink)" }}>{acct.banking.holder}</span>) doesn't match the investor account name (<span className="mono" style={{ color: "var(--ink)" }}>{investorName}</span>). Update your banking or contact CredX before your next distribution.
                </div>
              )}
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 14, lineHeight: 1.55 }}>
                All distributions and redemptions are paid into this account. CredX never holds investor funds - capital moves directly between you and the appointed solicitor's client account.
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Account holder name</label>
                <input value={local.holder}
                       onChange={e => setLocal({ ...local, holder: e.target.value })}
                       style={showNameError ? { borderColor: "var(--neg)" } : undefined} />
                {showNameError ? (
                  <div style={{
                    marginTop: 6,
                    padding: "8px 10px",
                    background: "var(--neg-tint)",
                    borderLeft: "3px solid var(--neg)",
                    fontSize: 12, color: "var(--neg)", lineHeight: 1.5,
                  }}>
                    <strong>Name doesn't match your account.</strong> The bank account holder must exactly match the name registered to your investor account
                    {investorName ? <> (<span className="mono" style={{ color: "var(--ink)" }}>{investorName}</span>)</> : null}
                    . Update the name above, or contact CredX if you bank under a different legal name.
                  </div>
                ) : (
                  <div className="help">Must exactly match the name registered to your investor account{investorName ? <>: <strong className="mono" style={{ color: "var(--ink-2)" }}>{investorName}</strong></> : null}.</div>
                )}
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Bank</label>
                <input value={local.bank} onChange={e => setLocal({ ...local, bank: e.target.value })} />
              </div>
              <div className="field">
                <label>Sort code</label>
                <input value={local.sort} onChange={e => setLocal({ ...local, sort: e.target.value })} placeholder="00-00-00" />
              </div>
              <div className="field">
                <label>Account number</label>
                <input value={local.account} onChange={e => setLocal({ ...local, account: e.target.value })} placeholder="00000000" />
              </div>

              {/* ─── Statement upload step (always visible in edit mode) ─── */}
              <div style={{ gridColumn: "1 / -1", marginTop: 6 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}>
                    <label style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "var(--ink-3)",
                    }}>
                      Bank statements
                      {needsStatements && <span style={{ color: "var(--neg)" }}> · required</span>}
                    </label>
                    <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {stagedFiles.length} / 2 minimum
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.55, marginBottom: 10 }}>
                    Upload your <strong style={{ color: "var(--ink-2)" }}>two most recent bank statements</strong> (last 3 months) showing the account holder name and the new account details. PDF, JPG, PNG or HEIC, max 10 MB each.
                  </div>

                  {/* Drop zone with explicit upload button */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault(); setDragging(false);
                      if (e.dataTransfer.files) onFilesPicked(e.dataTransfer.files);
                    }}
                    style={{
                      padding: "22px 18px",
                      border: "1.5px dashed " + (dragging ? "var(--accent)" : "var(--border-2)"),
                      background: dragging ? "var(--accent-tint)" : "var(--bg-sunk)",
                      textAlign: "center",
                      transition: "background .12s ease, border-color .12s ease",
                    }}>
                    <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 12 }}>
                      {dragging ? "Drop your statements here" : "Drag statements here, or"}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <I.download style={{ transform: "rotate(180deg)" }} />
                      Upload statement{stagedFiles.length > 0 ? "s" : ""}
                    </button>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 10 }}>
                      PDF · JPG · PNG · HEIC · up to 10 MB each
                    </div>
                    <input ref={fileInputRef} type="file" multiple
                           accept=".pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/*"
                           onChange={(e) => onFilesPicked(e.target.files)}
                           style={{ display: "none" }} />
                  </div>

                  {fileError && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--neg-tint)", color: "var(--neg)", fontSize: 12.5, borderLeft: "3px solid var(--neg)" }}>
                      {fileError}
                    </div>
                  )}

                  {/* Staged file list */}
                  {stagedFiles.length > 0 && (
                    <div style={{ marginTop: 12, border: "1px solid var(--border)" }}>
                      {stagedFiles.map((f, i) => (
                        <div key={f.id} style={{
                          display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12,
                          alignItems: "center",
                          padding: "10px 14px",
                          borderTop: i > 0 ? "1px solid var(--border)" : 0,
                          background: "var(--bg-elev)",
                        }}>
                          <I.doc style={{ color: "var(--accent)" }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{fmtSize(f.size)}</div>
                          </div>
                          <span className="tag" style={{ background: "var(--pos-tint)", color: "var(--pos)", borderColor: "transparent", fontSize: 10 }}>
                            <I.check style={{ width: 10, height: 10, marginRight: 4 }} />Staged
                          </span>
                          <button type="button" className="iconbtn" onClick={() => removeStaged(f.id)} title="Remove">
                            <I.close />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              <div style={{
                gridColumn: "1 / -1",
                padding: 12,
                background: "var(--warn-tint)",
                borderLeft: "3px solid var(--warn)",
                fontSize: 12.5, color: "var(--ink-2)",
                lineHeight: 1.55,
              }}>
                Changing bank details requires statement upload and re-verification. CredX will review the documents within 1 business day and issue a small penny-test before the new account becomes live for distributions.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Statements on file ─── */}
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Statements on file</h3>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
            {statementsOnFile.length} document{statementsOnFile.length === 1 ? "" : "s"}
          </span>
        </div>
        <div>
          {statementsOnFile.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              No statements uploaded yet. Update your nominated account to attach statements.
            </div>
          ) : (
            <table className="t">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Uploaded</th>
                  <th>Reason</th>
                  <th className="right">Size</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {statementsOnFile.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <I.doc style={{ color: "var(--ink-3)" }} />
                        <span className="strong">{s.name}</span>
                      </div>
                    </td>
                    <td className="muted mono" style={{ fontSize: 12 }}>{s.uploadedAt}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{s.reason}</td>
                    <td className="num muted">{fmtSize(s.size)}</td>
                    <td className="right">
                      <button className="iconbtn" title="View"><I.download /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Appointed solicitor</h3>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Lender side</div>
            <div style={{ fontFamily: "var(--ff-serif)", fontSize: 18 }}>JMW Solicitors</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>Drafted the Funder Agreement that governs your deployment with CredX.</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Funder side</div>
            <div style={{ fontFamily: "var(--ff-serif)", fontSize: 18 }}>Assigned per deal</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>Dual representation is handled on a case-by-case basis - the appointed firm for each transaction is confirmed in your deal pack.</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Communication
// ─────────────────────────────────────────────────────────────────
function TabComms({ acct, update, onSaved }) {
  const c = acct.comms;
  const setPref = (patch) => update("comms", { ...c, ...patch });
  const setMkt = (k, v) => setPref({ marketing: { ...c.marketing, [k]: v } });
  const setMailing = (patch) => setPref({ mailing: { ...c.mailing, ...patch } });

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Preferred channel</h3>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              ["email", "Email",     "Default for all portal communications"],
              ["phone", "Phone",     "Call you for urgent material events"],
              ["both",  "Email + phone", "Both, depending on urgency"],
            ].map(([k, l, sub]) => {
              const on = c.preferredChannel === k;
              return (
                <button key={k}
                  onClick={() => { setPref({ preferredChannel: k }); onSaved("Channel preference saved"); }}
                  style={{
                    padding: 16, textAlign: "left",
                    border: "1px solid " + (on ? "var(--accent)" : "var(--border-2)"),
                    background: on ? "var(--accent-tint)" : "var(--bg)",
                    color: on ? "var(--accent-ink)" : "var(--ink-2)",
                  }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 11.5, marginTop: 4, color: on ? "var(--accent-ink)" : "var(--ink-3)", lineHeight: 1.4 }}>{sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Mailing address</h3>
        </div>
        <div style={{ padding: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", fontSize: 13 }}>
            <input type="checkbox" checked={c.mailing.sameAsResidence}
                   onChange={e => { setMailing({ sameAsResidence: e.target.checked }); onSaved("Mailing preference saved"); }} />
            Same as residential address
          </label>
          {!c.mailing.sameAsResidence && (
            <div className="field" style={{ marginTop: 8 }}>
              <label>Mailing address</label>
              <textarea rows={3} value={c.mailing.address}
                        onChange={e => setMailing({ address: e.target.value })}
                        placeholder="House name/number, street, town, postcode" />
              <button className="btn btn-sm btn-primary" style={{ marginTop: 10 }} onClick={() => onSaved("Mailing address saved")}>Save address</button>
            </div>
          )}
          {c.mailing.sameAsResidence && (
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-2)" }}>
              Physical mail will be sent to: <span className="mono" style={{ color: "var(--ink)" }}>{acct.profile.address}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Marketing &amp; updates</h3>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>GDPR consent</span>
        </div>
        <div style={{ padding: "8px 20px 20px" }}>
          {[
            ["quarterlyLetter", "Quarterly investor letter",       "Book composition, redemptions and pipeline. Once per quarter."],
            ["educational",     "Educational content",              "How bridging works, market commentary, regulatory news."],
            ["events",          "Investor events",                  "Occasional in-person briefings in Kent and London."],
            ["partners",        "Trusted-partner offers",           "Independent legal, tax and wealth advisers."],
          ].map(([k, l, d]) => (
            <PrefRow key={k}
              title={l} sub={d}
              on={c.marketing[k]}
              onChange={(v) => { setMkt(k, v); onSaved(l + (v ? " enabled" : " disabled")); }}
            />
          ))}
          <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.55 }}>
            You can withdraw consent at any time. Transactional emails (statements, deal updates, material events) are always sent regardless of these preferences.
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────
function TabNotifs({ acct, update, onSaved }) {
  const n = acct.notifs;
  const setN = (key, channel, v) => {
    const next = { ...n, [key]: { ...n[key], [channel]: v } };
    update("notifs", next);
    // Mirror to the bridge so the CredX backend knows how to reach this
    // investor about new opportunities, statements, deal updates etc.
    if (window.CredXBridge) window.CredXBridge.setNotifPrefs({ ref: INVESTOR.accountId, prefs: next });
    onSaved("Notification preference saved");
  };

  const rows = [
    ["newOpportunities", "New opportunities",   "When a deal matching your criteria goes live."],
    ["statements",       "Statements ready",    "Quarterly + annual investor statements."],
    ["dealUpdates",      "Deal updates",        "Borrower progress, exit confirmations, redemptions."],
    ["materialEvents",   "Material events",     "Default, arrears, waiver, enforcement notices."],
    ["distributions",    "Distributions",       "Interest payments and capital returns to your nominated account."],
    ["weeklyDigest",     "Weekly digest",       "A single Friday summary in lieu of individual emails."],
  ];

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Channels &amp; events</h3>
          <button className="btn btn-sm" onClick={() => onSaved("Test notification sent")}>
            <I.bell /> Send test notification
          </button>
        </div>
        <table className="t">
          <thead>
            <tr>
              <th>Event</th>
              <th style={{ textAlign: "center", width: 100 }}>Email</th>
              <th style={{ textAlign: "center", width: 100 }}>SMS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, l, d]) => (
              <tr key={k}>
                <td>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{l}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{d}</div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <ChannelSwitch on={n[k].email} onChange={v => setN(k, "email", v)} />
                </td>
                <td style={{ textAlign: "center" }}>
                  <ChannelSwitch on={n[k].sms} onChange={v => setN(k, "sms", v)} />
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: 14, background: "var(--bg-elev)", border: "1px solid var(--border)",
        display: "flex", gap: 12, alignItems: "flex-start",
        fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55,
      }}>
        <I.lock style={{ color: "var(--ink-3)", marginTop: 2 }} />
        <div>
          <strong style={{ color: "var(--ink)" }}>Critical communications cannot be turned off.</strong>
          {" "}Material events (defaults, enforcement) and KYC re-verification requests are always sent by both email and SMS, regardless of these preferences. This is a regulatory requirement.
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Security
// ─────────────────────────────────────────────────────────────────
function TabSecurity({ acct, update, onSaved }) {
  const [pwOpen, setPwOpen] = React.useState(false);
  const [twoFAOpen, setTwoFAOpen] = React.useState(false);

  // mock session + login history
  const sessions = [
    { id: 1, device: "Chrome on macOS · Sevenoaks, UK", lastActive: "Right now", current: true },
    { id: 2, device: "Safari on iPhone · Sevenoaks, UK", lastActive: "2 hours ago", current: false },
    { id: 3, device: "Firefox on Windows · London, UK",  lastActive: "3 days ago",  current: false },
  ];
  const history = [
    { date: "21 May 2026 · 09:14", ip: "82.41.XX.XX", loc: "Sevenoaks, UK", method: "Password + 2FA", ok: true },
    { date: "20 May 2026 · 18:42", ip: "82.41.XX.XX", loc: "Sevenoaks, UK", method: "Password + 2FA", ok: true },
    { date: "19 May 2026 · 12:08", ip: "82.41.XX.XX", loc: "Sevenoaks, UK", method: "Trusted device",  ok: true },
    { date: "17 May 2026 · 22:31", ip: "172.58.XX.XX",loc: "London, UK",    method: "Password + 2FA", ok: true },
    { date: "12 May 2026 · 07:55", ip: "82.41.XX.XX", loc: "Sevenoaks, UK", method: "Password + 2FA", ok: true },
  ];

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Password</h3>
        </div>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Last changed 78 days ago</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>Strong · 14+ characters · meets all complexity rules</div>
          </div>
          <button className="btn" onClick={() => setPwOpen(true)}>Change password</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Two-factor authentication</h3>
          <span className="tag" style={{
            background: acct.security.twoFA ? "var(--pos-tint)" : "var(--warn-tint)",
            color: acct.security.twoFA ? "var(--pos)" : "var(--warn)",
            borderColor: "transparent",
          }}>{acct.security.twoFA ? "● Enabled" : "● Disabled"}</span>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Authenticator app</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>
                Time-based one-time passcodes via Google Authenticator, 1Password or any RFC 6238 app.
                Required for every sign-in.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => setTwoFAOpen(true)}>Manage</button>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Recovery codes</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  Generated {acct.security.recoveryCodesGenerated} · 10 single-use codes
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => { update("security", { recoveryCodesGenerated: "Today" }); onSaved("New recovery codes generated"); }}>Generate new</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Active sessions</h3>
          <button className="btn btn-sm" onClick={() => onSaved("All other sessions signed out")}>Sign out all other sessions</button>
        </div>
        <table className="t">
          <thead>
            <tr>
              <th>Device · Location</th>
              <th>Last active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                    {s.device}
                    {s.current && <span className="tag" style={{ marginLeft: 10, background: "var(--accent-tint)", color: "var(--accent-ink)", borderColor: "transparent", fontSize: 10 }}>This device</span>}
                  </div>
                </td>
                <td className="muted">{s.lastActive}</td>
                <td className="right">
                  {!s.current && <button className="btn btn-sm btn-ghost" onClick={() => onSaved("Session signed out")}>Sign out</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Login history</h3>
          <button className="btn btn-sm btn-ghost">View full history</button>
        </div>
        <table className="t">
          <thead>
            <tr>
              <th>Date &amp; time</th>
              <th>IP</th>
              <th>Location</th>
              <th>Method</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 12 }}>{h.date}</td>
                <td className="mono" style={{ fontSize: 12 }}>{h.ip}</td>
                <td>{h.loc}</td>
                <td>{h.method}</td>
                <td>
                  <span className="tag" style={{ background: "var(--pos-tint)", color: "var(--pos)", borderColor: "transparent" }}>● OK</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: 14, background: "var(--bg-elev)", border: "1px solid var(--border)",
        borderLeft: "3px solid var(--accent)",
        display: "flex", gap: 12, alignItems: "flex-start",
        fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55,
      }}>
        <I.lock style={{ color: "var(--accent)", marginTop: 2 }} />
        <div>
          <strong style={{ color: "var(--ink)" }}>UK GDPR data rights.</strong>
          {" "}You can request a copy of all personal data CredX holds about you, ask us to correct it, or request erasure (subject to AML record-keeping obligations).
          {" "}<a href={"mailto:" + COMPANY.email + "?subject=" + encodeURIComponent("Data subject access request - " + INVESTOR.accountId)} style={{ color: "var(--accent)", fontWeight: 500 }}>Submit a data request</a>.
        </div>
      </div>

      {/* Inline change-password modal */}
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} onSaved={() => { setPwOpen(false); onSaved("Password updated"); }} />
      <TwoFAModal open={twoFAOpen} onClose={() => setTwoFAOpen(false)} enabled={acct.security.twoFA}
                  onToggle={(v) => { update("security", { twoFA: v }); setTwoFAOpen(false); onSaved("Two-factor " + (v ? "enabled" : "disabled")); }} />
    </>
  );
}

function ChangePasswordModal({ open, onClose, onSaved }) {
  const [cur, setCur]   = React.useState("");
  const [n1, setN1]     = React.useState("");
  const [n2, setN2]     = React.useState("");
  const [err, setErr]   = React.useState("");
  React.useEffect(() => { if (open) { setCur(""); setN1(""); setN2(""); setErr(""); } }, [open]);
  const submit = () => {
    if (cur.length < 4) return setErr("Enter your current password.");
    if (n1.length < 10) return setErr("New password must be at least 10 characters.");
    if (n1 !== n2)      return setErr("Passwords don't match.");
    onSaved();
  };
  return (
    <Modal open={open} onClose={onClose} title="Change password" width={460}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>Update password</button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="field"><label>Current password</label><input type="password" value={cur} onChange={e => setCur(e.target.value)} autoFocus /></div>
        <div className="field"><label>New password</label><input type="password" value={n1} onChange={e => setN1(e.target.value)} /><div className="help">Minimum 10 characters with at least one number and one symbol.</div></div>
        <div className="field"><label>Confirm new password</label><input type="password" value={n2} onChange={e => setN2(e.target.value)} /></div>
        {err && <div style={{ padding: "8px 12px", background: "var(--neg-tint)", borderLeft: "3px solid var(--neg)", color: "var(--neg)", fontSize: 12.5 }}>{err}</div>}
      </div>
    </Modal>
  );
}

function TwoFAModal({ open, onClose, enabled, onToggle }) {
  return (
    <Modal open={open} onClose={onClose} title={enabled ? "Two-factor authentication" : "Enable two-factor"} width={520}
      footer={<>
        <button className="btn" onClick={onClose}>Close</button>
        {enabled
          ? <button className="btn" style={{ borderColor: "var(--neg)", color: "var(--neg)" }} onClick={() => onToggle(false)}>Disable 2FA</button>
          : <button className="btn btn-primary" onClick={() => onToggle(true)}>Enable 2FA</button>
        }
      </>}>
      {enabled ? (
        <div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: "var(--pos-tint)", color: "var(--pos)" }}>
            <I.check />
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>2FA is enabled on this account.</span>
          </div>
          <p style={{ marginTop: 16, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            You're using an authenticator app for one-time codes. To change apps, disable 2FA first, then re-enable and re-scan the QR code with the new app. Recovery codes still apply.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            Scan the QR with your authenticator app (Google Authenticator, 1Password, Authy or similar). You'll be asked for a code on your next sign-in.
          </p>
          <div style={{
            margin: "16px auto",
            width: 160, height: 160,
            background: "var(--bg-sunk)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--ff-mono)", fontSize: 10, color: "var(--ink-3)",
            border: "1px solid var(--border)",
          }}>QR PLACEHOLDER</div>
          <div className="field">
            <label>Manual setup key</label>
            <input value="CRDX FNDR 0421 ABCD EFGH IJKL" readOnly className="mono" />
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Display & appearance
//   Lets the investor change theme (light/dark), accent colour, and
//   layout density - the same set the Tweaks panel exposes, surfaced
//   inside Account for power users who'd never enable Tweaks.
//   All three controls write through the same useTweaks hook used by
//   the panel, so changes apply instantly and persist.
// ─────────────────────────────────────────────────────────────────
function TabDisplay({ tweaks, setTweak, accents, onSaved }) {
  if (!tweaks || !setTweak || !accents) return null;

  const accentEntries = Object.entries(accents);

  return (
    <>
      {/* Theme */}
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Theme</h3>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["light", "Light", "Warm off-white background. Default."],
              ["dark",  "Dark",  "Deep ink background. Easier on the eyes after hours."],
            ].map(([k, l, h]) => {
              const on = (k === "dark") === tweaks.dark;
              return (
                <button key={k} type="button"
                  onClick={() => { setTweak("dark", k === "dark"); onSaved && onSaved("Theme updated"); }}
                  style={{
                    display: "flex", flexDirection: "column", gap: 12,
                    padding: 16,
                    border: "1px solid " + (on ? "var(--accent)" : "var(--border-2)"),
                    background: on ? "var(--accent-tint)" : "var(--bg)",
                    color: on ? "var(--accent-ink)" : "var(--ink-2)",
                    cursor: "pointer", textAlign: "left",
                  }}>
                  {/* Mini preview */}
                  <div style={{
                    height: 64,
                    background: k === "dark" ? "#0e1418" : "#f7f5f0",
                    border: "1px solid " + (k === "dark" ? "#232b31" : "#e6e2d8"),
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 8,
                    alignItems: "center",
                    padding: "0 12px",
                  }}>
                    <span style={{
                      fontFamily: "var(--ff-serif)", fontSize: 14, fontWeight: 500,
                      color: k === "dark" ? "#f4f1ea" : "#0e1418",
                    }}>credX</span>
                    <span style={{ height: 6, background: k === "dark" ? "#232b31" : "#e6e2d8" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {k === "dark" ? <I.moon /> : <I.sun />} {l}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4 }}>{h}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Accent */}
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Accent colour</h3>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{(accents[tweaks.accent] || {}).name}</span>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {accentEntries.map(([hex, meta]) => {
              const on = tweaks.accent === hex;
              return (
                <button key={hex} type="button"
                  onClick={() => { setTweak("accent", hex); onSaved && onSaved("Accent updated"); }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 14,
                    alignItems: "center",
                    padding: "14px 16px",
                    border: "1px solid " + (on ? hex : "var(--border-2)"),
                    background: on ? meta.tint : "var(--bg)",
                    cursor: "pointer", textAlign: "left",
                  }}>
                  <span style={{
                    width: 36, height: 36,
                    background: hex,
                    border: "1px solid rgba(0,0,0,.08)",
                  }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{meta.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, letterSpacing: "0.04em" }}>{hex.toUpperCase()}</div>
                  </div>
                  {on && <span style={{ color: hex }}><I.check /></span>}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.55 }}>
            Affects buttons, links, chart fills, status pills and any highlighted state across the portal. Saved instantly.
          </div>
        </div>
      </div>

      {/* Density */}
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Density</h3>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["comfortable", "Comfortable", "Generous padding. Best for large screens."],
              ["compact",     "Compact",     "Tighter rows. Fits more data on screen."],
            ].map(([k, l, h]) => {
              const on = tweaks.density === k;
              return (
                <button key={k} type="button"
                  onClick={() => { setTweak("density", k); onSaved && onSaved("Density updated"); }}
                  style={{
                    display: "flex", flexDirection: "column", gap: 10,
                    padding: 16,
                    border: "1px solid " + (on ? "var(--accent)" : "var(--border-2)"),
                    background: on ? "var(--accent-tint)" : "var(--bg)",
                    color: on ? "var(--accent-ink)" : "var(--ink-2)",
                    cursor: "pointer", textAlign: "left",
                  }}>
                  {/* Stacked-row preview */}
                  <div style={{ display: "flex", flexDirection: "column", gap: k === "compact" ? 3 : 7 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "32px 1fr 40px", gap: 8, alignItems: "center",
                        padding: k === "compact" ? "4px 8px" : "8px 10px",
                        background: "var(--bg-elev)",
                        border: "1px solid var(--border)",
                      }}>
                        <span style={{ height: 4, background: "var(--border-2)" }} />
                        <span style={{ height: 4, background: "var(--border-2)" }} />
                        <span style={{ height: 4, background: "var(--border-2)" }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.4 }}>{h}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tax
// ─────────────────────────────────────────────────────────────────
function TabTax({ acct, update, onSaved }) {
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState(acct.tax);
  React.useEffect(() => { setLocal(acct.tax); }, [acct.tax, editing]);
  const save = () => { update("tax", local); setEditing(false); onSaved("Tax details updated"); };

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Tax residency &amp; references</h3>
          {!editing
            ? <button className="btn btn-sm btn-ghost" onClick={() => setEditing(true)}>Edit</button>
            : <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-sm btn-primary" onClick={save}>Save</button>
              </div>
          }
        </div>
        <div style={{ padding: "8px 20px 20px" }}>
          {!editing ? (
            <dl className="dl" style={{ borderTop: 0 }}>
              <div><dt>Tax residency</dt><dd>{local.residency}</dd></div>
              <div><dt>UTR (HMRC)</dt><dd className="mono">{local.utr}</dd></div>
              <div><dt>National Insurance</dt><dd className="mono">{local.nino}</dd></div>
              <div><dt>Withholding</dt><dd>{local.withholding === "gross" ? "Paid gross (no UK WHT on interest)" : "Withholding requested"}</dd></div>
            </dl>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
              <div className="field">
                <label>Tax residency</label>
                <select value={local.residency} onChange={e => setLocal({ ...local, residency: e.target.value })}>
                  <option>United Kingdom</option>
                  <option>Isle of Man</option>
                  <option>Jersey</option>
                  <option>Guernsey</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label>UTR (HMRC)</label>
                <input className="mono" value={local.utr} onChange={e => setLocal({ ...local, utr: e.target.value })} placeholder="10-digit reference" />
              </div>
              <div className="field">
                <label>National Insurance number</label>
                <input className="mono" value={local.nino} onChange={e => setLocal({ ...local, nino: e.target.value })} placeholder="AA 00 00 00 A" />
              </div>
              <div className="field">
                <label>Withholding preference</label>
                <select value={local.withholding} onChange={e => setLocal({ ...local, withholding: e.target.value })}>
                  <option value="gross">Paid gross (default)</option>
                  <option value="hold">Hold WHT in escrow</option>
                </select>
                <div className="help">CredX does not deduct UK withholding tax on interest paid to UK-resident Funders.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Annual interest summary</h3>
        </div>
        <table className="t">
          <thead>
            <tr>
              <th>Tax year</th>
              <th className="right">Interest paid (gross)</th>
              <th>Status</th>
              <th className="right" style={{ width: 240 }} />
            </tr>
          </thead>
          <tbody>
            {[
              ["2025/26 (in progress)", 41124,  "In progress", false],
              ["2024/25",               94821,  "Issued",      true],
              ["2023/24",               48205,  "Issued",      true],
            ].map(([year, gross, status, ready]) => (
              <tr key={year}>
                <td className="mono" style={{ fontSize: 13 }}>{year}</td>
                <td className="num strong">{fmtGBP(gross)}</td>
                <td>
                  <span className="tag" style={{
                    background: ready ? "var(--pos-tint)" : "var(--warn-tint)",
                    color: ready ? "var(--pos)" : "var(--warn)",
                    borderColor: "transparent",
                  }}>● {status}</span>
                </td>
                <td className="right">
                  <button className="btn btn-sm" disabled={!ready}
                          style={!ready ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                          onClick={() => { if (ready) onSaved("Annual statement downloading…"); }}>
                    <I.download /> {ready ? "Download (CSV)" : "Pending year-end"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: 14, background: "var(--bg-elev)", border: "1px solid var(--border)",
        display: "flex", gap: 12, alignItems: "flex-start",
        fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55,
      }}>
        <I.doc style={{ color: "var(--ink-3)", marginTop: 2 }} />
        <div>
          <strong style={{ color: "var(--ink)" }}>Tax treatment.</strong>
          {" "}Interest paid by CredX is treated as savings income for UK tax purposes and should be declared on your Self Assessment. Annual summaries match HMRC's expected format. CredX does not provide tax advice - please speak with your accountant.
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function PrefRow({ title, sub, on, onChange }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      gap: 16, alignItems: "center",
      padding: "12px 0", borderTop: "1px solid var(--border)",
    }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <Switch on={on} onChange={() => onChange(!on)} />
    </div>
  );
}

function ChannelSwitch({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!on)} role="switch" aria-checked={on}
      style={{
        width: 36, height: 20,
        background: on ? "var(--accent)" : "var(--border-2)",
        position: "relative",
        borderRadius: 999,
        flexShrink: 0,
        padding: 0, border: 0,
        cursor: "pointer",
      }}>
      <span style={{
        position: "absolute",
        top: 2,
        left: on ? 18 : 2,
        width: 16, height: 16,
        background: "white",
        borderRadius: "50%",
        transition: "left .15s ease",
        boxShadow: "0 1px 2px rgba(0,0,0,.22)",
      }} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Documents & verification — investor uploads (KYC/ID/bank/source of
// funds). Each upload becomes a submission to the CredX backend that
// the Investor Relations team approves. Documents the team has placed
// on file (and NDA status) are read back from the shared bridge.
// ─────────────────────────────────────────────────────────────────
const PORTAL_DOC_CATS = ["Certified ID", "Proof of address", "Bank statements", "Source of funds", "Suitability / self-cert", "Other"];

function TabDocuments({ onSaved }) {
  const [, tick] = React.useState(0);
  const [cat, setCat] = React.useState("Certified ID");
  const bridge = window.CredXBridge;
  React.useEffect(() => bridge ? bridge.subscribe(() => tick(t => t + 1)) : undefined, []);

  const ref = INVESTOR.accountId;
  const onFile = bridge ? bridge.getInvestorDocs(ref) : [];
  const mySubs = bridge ? bridge.getSubmissions(ref).filter(s => s.kind === "document") : [];
  const nda = bridge ? bridge.getNda(ref) : null;
  const ndaSigned = (nda && nda.signed) || INVESTOR.institutionalNda || INVESTOR.platformNdaFromBackend;

  const onUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !bridge) return;
    bridge.addSubmission({ ref, kind: "document", payload: { name: file.name, category: cat, size: file.size } });
    e.target.value = "";
    onSaved("Document submitted for approval");
  };

  const statusChip = (status) => {
    const map = {
      pending:  ["var(--warn)", "Pending approval"],
      approved: ["var(--pos)", "Approved"],
      rejected: ["var(--neg, #c0392b)", "Rejected"],
    };
    const [c, l] = map[status] || map.pending;
    return <span style={{ fontSize: 11, fontWeight: 600, color: c, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />{l}</span>;
  };

  const fileRow = (name, meta, right) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{
        width: 34, height: 34, flexShrink: 0, background: "var(--bg-sunk)", color: "var(--ink-3)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--ff-mono)", fontSize: 10, fontWeight: 600,
      }}>{(name.split(".").pop() || "DOC").slice(0, 3).toUpperCase()}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", wordBreak: "break-word" }}>{name}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{meta}</div>
      </div>
      {right}
    </div>
  );

  return (
    <>
      {/* NDA status */}
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Mutual NDA</h3>
          {ndaSigned
            ? <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pos)", display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--pos)" }} />On file</span>
            : <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>Not signed</span>}
        </div>
        <div style={{ padding: "16px 20px 18px", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
          {ndaSigned
            ? <>Your mutual NDA is on file{nda && nda.signedAt ? " (recorded " + nda.signedAt + ")" : ""}. Tier-2 underwriting detail is unlocked across the Opportunities you can view.</>
            : <>Your signed NDA isn't on file yet. The CredX Investor Relations team will countersign and upload it; it then unlocks Tier-2 deal detail automatically. You can also sign in-app from any opportunity.</>}
        </div>
      </div>

      {/* Upload */}
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>Upload a document</h3>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>Reviewed by CredX</span>
        </div>
        <div style={{ padding: "16px 20px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 14 }}>
            Upload identity and verification documents. Each is sent to the CredX Investor Relations team for approval before it is added to your file.
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select className="acct-input" value={cat} onChange={e => setCat(e.target.value)}
              style={{ maxWidth: 240, padding: "9px 12px", border: "1px solid var(--border-2)", background: "var(--bg-elev)", color: "var(--ink)", fontSize: 13 }}>
              {PORTAL_DOC_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
              <I.arrowUp /> Choose file
              <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={onUpload} hidden />
            </label>
          </div>
        </div>
      </div>

      {/* Submitted by you */}
      {mySubs.length > 0 && (
        <div className="card">
          <div className="card-head"><h3 className="h-card" style={{ color: "var(--ink)" }}>Submitted by you</h3></div>
          <div style={{ padding: "4px 20px 12px" }}>
            {mySubs.map(s => fileRow(
              s.payload.name,
              (s.payload.category || "Document") + " · submitted " + (s.submittedAt || "").slice(0, 10),
              statusChip(s.status)
            ))}
          </div>
        </div>
      )}

      {/* On file (placed by CredX) */}
      <div className="card">
        <div className="card-head">
          <h3 className="h-card" style={{ color: "var(--ink)" }}>On file</h3>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{onFile.length} document{onFile.length === 1 ? "" : "s"}</span>
        </div>
        <div style={{ padding: "4px 20px 14px" }}>
          {onFile.length === 0
            ? <div style={{ padding: "24px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>No documents on file yet. Approved uploads and items added by CredX appear here.</div>
            : onFile.map(d => fileRow(d.name, d.category + " · added by " + d.by + " · " + d.date, <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pos)" }}>Verified</span>))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { AccountView });
