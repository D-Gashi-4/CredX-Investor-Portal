// app.jsx - root shell, top nav, view routing, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "#117a82",
  "density": "comfortable"
}/*EDITMODE-END*/;

const ACCENTS = {
  "#117a82": { name: "CredX teal",   ink: "#0b5a60", tint: "rgba(17,122,130,.10)", tint2: "rgba(17,122,130,.18)" },
  "#7a2b2b": { name: "Oxblood",      ink: "#561c1c", tint: "rgba(122,43,43,.10)",  tint2: "rgba(122,43,43,.18)" },
  "#3b6a3b": { name: "British racing", ink: "#264826", tint: "rgba(59,106,59,.10)", tint2: "rgba(59,106,59,.18)" },
  "#fcc101": { name: "Saffron gold", ink: "#8a6800", tint: "rgba(252,193,1,.12)",  tint2: "rgba(252,193,1,.22)" },
};

const VIEWS = [
  { id: "overview",       label: "Overview" },
  { id: "portfolio",      label: "Portfolio", pill: "14" },
  { id: "opportunities",  label: "Opportunities", pill: "6" },
  { id: "updates",        label: "Updates" },
  { id: "documents",      label: "Documents" },
  { id: "account",        label: "Account" },
];

const ACTIVE_VIEW_KEY = "credx-active-view-v1";

function readActiveView() {
  try {
    const saved = localStorage.getItem(ACTIVE_VIEW_KEY);
    return VIEWS.some(view => view.id === saved) ? saved : "overview";
  } catch {
    return "overview";
  }
}

// Read the saved profile avatar so the nav can react to changes made in
// TabProfile without prop drilling. TabProfile dispatches a `credx-profile`
// event on save; this hook re-reads then.
function useProfileAvatar() {
  const read = () => {
    try {
      const s = JSON.parse(localStorage.getItem("credx-account-settings-v2") || "{}");
      return s && s.profile
        ? { avatar: s.profile.avatar || null,
            initialsBg: s.profile.initialsBg || "#0e1418",
            animalBg:   s.profile.animalBg   || "#0e1418" }
        : { avatar: null, initialsBg: "#0e1418", animalBg: "#0e1418" };
    } catch { return { avatar: null, initialsBg: "#0e1418", animalBg: "#0e1418" }; }
  };
  const [avatar, setAvatar] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => setAvatar(read());
    window.addEventListener("credx-profile", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("credx-profile", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return avatar;
}

function App() {
  const { session, signIn, signOut } = useAuth();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const investorAvatar = useProfileAvatar();
  const [view, setViewState] = React.useState(readActiveView);
  const setView = (nextView) => {
    if (!VIEWS.some(item => item.id === nextView)) return;
    setViewState(nextView);
    try { localStorage.setItem(ACTIVE_VIEW_KEY, nextView); } catch {}
  };
  const [accountTab, setAccountTab] = React.useState("profile");
  const [dealDetail, setDealDetail] = React.useState(null);
  const [oppDetail, setOppDetail] = React.useState(null);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [acctOpen, setAcctOpen]   = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [statementOpen, setStatementOpen] = React.useState(false);
  const [menuOpen, setMenuOpen]   = React.useState(false);   // mobile hamburger

  // Live bridge sync — re-merge posted deals / updates from the employee
  // backend whenever the shared store changes, then force a re-render so
  // a deal posted (or flipped to "live") while this tab is open shows up
  // immediately, no manual reload needed.
  const [, setBridgeVer] = React.useState(0);
  React.useEffect(() => {
    if (!window.CredXBridge) return undefined;
    window.CredXSyncBridge && window.CredXSyncBridge();
    return window.CredXBridge.subscribe(() => {
      window.CredXSyncBridge && window.CredXSyncBridge();
      setBridgeVer(v => v + 1);
    });
  }, []);

  // Apply theme + density + accent via data attributes / CSS vars
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    root.setAttribute("data-density", t.density === "compact" ? "compact" : "regular");
    const a = ACCENTS[t.accent] || ACCENTS["#117a82"];
    // In dark mode, brighten the teal a touch so chart lines, donut
    // fills and active nav underlines read clearly against the deep
    // navy-charcoal background.
    const accentHex = (t.dark && t.accent === "#117a82") ? "#1a9aa3" : t.accent;
    root.style.setProperty("--accent", accentHex);
    root.style.setProperty("--accent-ink", a.ink);
    root.style.setProperty("--accent-tint", a.tint);
    root.style.setProperty("--accent-tint-2", a.tint2);
  }, [t.dark, t.density, t.accent]);

  // close popovers on Escape; Cmd/Ctrl+K opens search
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setNotifOpen(false); setAcctOpen(false); setSearchOpen(false); setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── auth gate ────────────────────────────────────────────────
  if (!session) {
    return <AuthScreen onSignIn={signIn} />;
  }

  const openDeal = (d) => setDealDetail(d);
  const closeDeal = () => setDealDetail(null);
  const openOpp = (o) => setOppDetail(o);
  const closeOpp = () => setOppDetail(null);

  const viewMeta = VIEWS.find(v => v.id === view);

  return (
    <div className="app">
      {/* ───── top nav ───── */}
      <header className="nav" data-screen-label={"Nav · " + viewMeta.label}>
        <div className="shell">
          <div className="nav-inner">
            <div className="nav-brand">
              <button className="mobile-menu-btn mobile-only" aria-label="Open menu"
                      onClick={() => { setMenuOpen(true); setNotifOpen(false); setAcctOpen(false); }}>
                <MobileIcon name="menu" />
              </button>
              <CredXMark height={40} />
              <span style={{ marginLeft: 12, fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)", borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>
                Investor Portal
              </span>
            </div>
            <nav className="nav-tabs">
              {VIEWS.map(v => (
                <button key={v.id}
                  className="nav-tab"
                  aria-current={view === v.id ? "page" : undefined}
                  onClick={() => setView(v.id)}>
                  {v.label}
                  {v.pill && <span className="pill">{v.pill}</span>}
                </button>
              ))}
            </nav>
            <div className="nav-right">
              <button className="nav-icon" title={t.dark ? "Switch to light mode" : "Switch to dark mode"}
                      onClick={() => setTweak("dark", !t.dark)}
                      aria-label={t.dark ? "Switch to light mode" : "Switch to dark mode"}>
                {t.dark ? <I.sun /> : <I.moon />}
              </button>
              <button className="nav-icon" title="Search (⌘K)" onClick={() => setSearchOpen(true)}><I.search /></button>

              <div className="nav-popover-anchor">
                <button className="nav-icon" title="Notifications" onClick={() => { setNotifOpen(o => !o); setAcctOpen(false); }}>
                  <I.bell /><span className="dot" />
                </button>
                {notifOpen && (
                  <NotificationsPopover
                    onClose={() => setNotifOpen(false)}
                    goTo={(v) => { setNotifOpen(false); setView(v); }}
                  />
                )}
              </div>

              <div className="nav-popover-anchor">
                <button className="nav-account" onClick={() => { setAcctOpen(o => !o); setNotifOpen(false); }}>
                  <InvestorAvatar avatarId={investorAvatar.avatar} initials={INVESTOR.initials} size={36} initialsBg={investorAvatar.initialsBg} animalBg={investorAvatar.animalBg} />
                  <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, textAlign: "left" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{INVESTOR.name}</span>
                    <span style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{INVESTOR.classification}</span>
                  </span>
                  <I.chevron style={{ color: "var(--ink-3)", marginLeft: 4, transform: acctOpen ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .14s ease" }} />
                </button>
                {acctOpen && (
                  <AccountMenu
                    onClose={() => setAcctOpen(false)}
                    goTo={(v) => { setAcctOpen(false); setView(v); }}
                    goToAccountTab={(tab) => { setAcctOpen(false); setAccountTab(tab); setView("account"); }}
                    investorAvatar={investorAvatar}
                    onSignOut={signOut}
                    dark={t.dark}
                    onToggleDark={() => setTweak("dark", !t.dark)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ───── page header ───── */}
      <div className="shell">
        <div className="page-header" data-screen-label={viewMeta.label}>
          <div>
            <div className="eyebrow">
              {view === "overview" && "Dashboard · Live"}
              {view === "portfolio" && "Your positions"}
              {view === "opportunities" && (<>
                <span className="live-dot" /> Open to investors
              </>)}
              {view === "updates" && "From CredX"}
              {view === "documents" && "Document vault"}
              {view === "account" && "Settings"}
            </div>
            <h1 className="h-page" style={{ marginTop: 6 }}>
              {view === "overview" && <>{(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; })()}, <span style={{ color: "var(--ink-3)" }}>{INVESTOR.name.split(" ")[0]}.</span></>}
              {view === "portfolio" && "Your portfolio"}
              {view === "opportunities" && "New opportunities"}
              {view === "updates" && "Platform & deal updates"}
              {view === "documents" && "Documents"}
              {view === "account" && "Your account"}
            </h1>
            {view === "overview" && (() => {
              // Rotate the opening sentence daily - all phrasings are
              // derived from live data so they stay truthful.
              const total       = LIVE_DEALS.length;
              const firstCharge = LIVE_DEALS.filter(d => /first/i.test(d.security || "")).length;
              const secondChrg  = total - firstCharge;
              const totalPos    = LIVE_DEALS.reduce((s, d) => s + d.position, 0);
              const wtdLtv      = LIVE_DEALS.reduce((s, d) => s + d.ltv * d.position, 0) / totalPos;
              const wtdRate     = LIVE_DEALS.reduce((s, d) => s + d.rate * d.position, 0) / totalPos;
              const counties    = Array.from(new Set(LIVE_DEALS.map(d => {
                const m = (d.property || "").match(/^([^,·]+?)(?:,|·|$)/);
                return m ? m[1].trim() : null;
              }).filter(Boolean)));
              const types       = Array.from(new Set(LIVE_DEALS.map(d => d.type).filter(Boolean)))
                                  .map(t => t.toLowerCase());
              const typeList    = types.length <= 2
                                  ? types.join(" and ")
                                  : types.slice(0, -1).join(", ") + " and " + types[types.length - 1];

              const patterns = [
                `${total} facilities active across South East England.`,
                `${total} facilities active - ${firstCharge} first-charge${secondChrg > 0 ? `, ${secondChrg} second-charge` : ""}.`,
                `${total} facilities active · average LTV ${Math.round(wtdLtv * 100)}%.`,
                `${total} facilities active · weighted coupon ${wtdRate.toFixed(2)}%.`,
                `${total} facilities active · ${compactGBPValue(totalPos)} deployed across ${typeList}.`,
                `${total} facilities spread across ${counties.slice(0, 3).join(", ")}.`,
              ];
              // Pick a fresh phrasing on each page load.
              const opener = patterns[Math.floor(Math.random() * patterns.length)];

              return (
                <div style={{ marginTop: 10, color: "var(--ink-2)", fontSize: 14, maxWidth: "64ch" }}>
                  {opener} Your next event is the Folkestone redemption on <strong className="mono" style={{ color: "var(--ink)" }}>29 May</strong> - funds return to your nominated account same day.
                </div>
              );
            })()}
            {view === "portfolio" && (
              <div style={{ marginTop: 10, color: "var(--ink-2)", fontSize: 14, maxWidth: "64ch" }}>
                <strong className="mono" style={{ color: "var(--ink)" }}>6</strong> facilities active, <strong className="mono" style={{ color: "var(--ink)" }}>8</strong> redeemed. <strong className="mono" style={{ color: "var(--ink)" }}>£184k</strong> interest realised to date.
              </div>
            )}
          </div>
          <div className="page-actions">
            {view === "overview" && (
              <>
                <button className="btn" onClick={() => setStatementOpen(true)}><I.download /> Statement</button>
                <button className="btn btn-primary" onClick={() => setView("opportunities")}>Browse opportunities <I.arrowRight /></button>
              </>
            )}
            {view === "portfolio" && (
              <>
                <button className="btn" onClick={() => exportPositions("all")}><I.download /> Export positions (CSV)</button>
                <button className="btn btn-primary" onClick={() => setView("opportunities")}>New opportunities <I.arrowRight /></button>
              </>
            )}
            {view === "opportunities" && <DealAlertsButton />}
            {view === "updates" && (
              <button className="btn"><I.bell /> Notification settings</button>
            )}
            {view === "documents" && (
              <button className="btn btn-primary" onClick={() => setStatementOpen(true)}><I.doc /> Build a statement</button>
            )}
          </div>
        </div>

        {/* ───── main view ───── */}
        <main style={{ paddingBottom: 60 }}>
          {view === "overview" && <OverviewView goTo={setView} openDeal={openDeal} openOpp={openOpp} />}
          {view === "portfolio" && <PortfolioView openDeal={openDeal} />}
          {view === "opportunities" && <OpportunitiesView openOpp={openOpp} />}
          {view === "updates" && <UpdatesView />}
          {view === "documents" && <DocumentsView />}
          {view === "account" && <AccountView initialTab={accountTab} tweaks={t} setTweak={setTweak} accents={ACCENTS} />}
        </main>
      </div>

      {/* ───── footer ───── */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elev)", marginTop: "auto" }}>
        <div className="shell" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", fontSize: 12, color: "var(--ink-3)", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <span>{COMPANY.name} · Company No. {COMPANY.no} · ICO Reg. {COMPANY.ico}</span>
            <span>{COMPANY.address}</span>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a>
            <a href={"tel:" + COMPANY.phone.replace(/\s/g, "")}>{COMPANY.phone}</a>
            <a href="#">Risk warnings</a>
          </div>
        </div>
        <div className="shell" style={{ padding: "0 40px 18px", fontSize: 11, color: "var(--ink-3)", lineHeight: 1.55, maxWidth: 1440 }}>
          For information purposes only. Not financial advice or an invitation to invest. Capital is at risk.
          CredX Ltd is <strong style={{ color: "var(--ink-2)" }}>not authorised or regulated by the Financial Conduct Authority</strong> and does not hold Funder capital - funds, where deployed, are transferred directly to the appointed solicitor's client account.
          Independent legal and financial advice is strongly recommended.
        </div>
      </footer>

      {/* ───── mobile bottom tab bar + hamburger menu ───── */}
      <MobileTabBar view={view} setView={setView} openMenu={() => setMenuOpen(true)} />
      {menuOpen && (
        <MobileMenu
          view={view}
          onClose={() => setMenuOpen(false)}
          goTo={(v) => { setView(v); setMenuOpen(false); }}
          openSearch={() => { setMenuOpen(false); setSearchOpen(true); }}
          investorAvatar={investorAvatar}
          dark={t.dark}
          onToggleDark={() => setTweak("dark", !t.dark)}
          onSignOut={signOut}
        />
      )}

      {/* ───── overlays ───── */}
      <DealDetail deal={dealDetail} open={!!dealDetail} onClose={closeDeal} />
      <OpportunityDetail opp={oppDetail} open={!!oppDetail} onClose={closeOpp} />
      <SearchPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        goTo={(v) => { setSearchOpen(false); setView(v); }}
        openDeal={(d) => { setSearchOpen(false); setDealDetail(d); }}
        openOpp={(o) => { setSearchOpen(false); setOppDetail(o); }}
      />

      <StatementBuilderModal open={statementOpen} onClose={() => setStatementOpen(false)} />

      {/* ───── Tweaks ───── */}
      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={Object.keys(ACCENTS)}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["comfortable", "compact"]}
          onChange={(v) => setTweak("density", v)}
        />
      </TweaksPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Mobile navigation — bottom tab bar (primary sections) + hamburger
// slide-in menu (everything else). Rendered always; CSS shows them
// only below the mobile breakpoint.
// ─────────────────────────────────────────────────────────────────
function MobileIcon({ name, ...p }) {
  const icons = {
    menu:    <><path d="M3 6h18M3 12h18M3 18h18" /></>,
    home:    <><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v10h12V10" /></>,
    portfolio: <><rect x="3" y="10" width="4" height="10" /><rect x="10" y="4" width="4" height="16" /><rect x="17" y="13" width="4" height="7" /></>,
    opps:    <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 3" /></>,
    account: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></>,
    updates: <><path d="M6 14V9a6 6 0 0 1 12 0v5l1.8 1.8H4.2L6 14Z" /><path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" /></>,
    documents: <><path d="M6 3h8l4 4v14H6Z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h6" /></>,
    search:  <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" {...p}>
      {icons[name]}
    </svg>
  );
}

const MOBILE_TABS = [
  { id: "overview",      label: "Home",      icon: "home" },
  { id: "portfolio",     label: "Portfolio", icon: "portfolio" },
  { id: "opportunities", label: "Deals",     icon: "opps" },
  { id: "account",       label: "Account",   icon: "account" },
];

function MobileTabBar({ view, setView, openMenu }) {
  const oppsPill = (VIEWS.find(v => v.id === "opportunities") || {}).pill;
  return (
    <nav className="mobile-tabbar" aria-label="Primary">
      {MOBILE_TABS.map(tab => (
        <button key={tab.id} className="mobile-tab"
                aria-current={view === tab.id ? "page" : undefined}
                onClick={() => { setView(tab.id); window.scrollTo({ top: 0 }); }}>
          <MobileIcon name={tab.icon} />
          {tab.id === "opportunities" && oppsPill && <span className="tab-pill">{oppsPill}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
      <button className="mobile-tab" onClick={openMenu}>
        <MobileIcon name="menu" />
        <span>More</span>
      </button>
    </nav>
  );
}

function MobileMenu({ view, onClose, goTo, openSearch, investorAvatar, dark, onToggleDark, onSignOut }) {
  const items = [
    { id: "overview",      label: "Overview",     icon: "home" },
    { id: "portfolio",     label: "Portfolio",    icon: "portfolio" },
    { id: "opportunities", label: "Opportunities", icon: "opps" },
    { id: "updates",       label: "Updates",      icon: "updates" },
    { id: "documents",     label: "Documents",    icon: "documents" },
    { id: "account",       label: "Account",      icon: "account" },
  ];
  return (
    <>
      <div className="mobile-menu-scrim" onClick={onClose} />
      <div className="mobile-menu" role="dialog" aria-modal="true">
        <div className="mobile-menu-head">
          <CredXMark height={34} />
          <button className="nav-icon" aria-label="Close menu" onClick={onClose}><I.close /></button>
        </div>
        <div className="mobile-menu-acct">
          <InvestorAvatar avatarId={investorAvatar.avatar} initials={INVESTOR.initials} size={42}
                          initialsBg={investorAvatar.initialsBg} animalBg={investorAvatar.animalBg} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{INVESTOR.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{INVESTOR.classification}</div>
          </div>
        </div>
        <nav className="mobile-menu-nav">
          {items.map(it => {
            const meta = VIEWS.find(v => v.id === it.id) || {};
            return (
              <button key={it.id} className="mobile-menu-item"
                      aria-current={view === it.id ? "page" : undefined}
                      onClick={() => goTo(it.id)}>
                <MobileIcon name={it.icon} />
                <span>{it.label}</span>
                {meta.pill && <span className="pill">{meta.pill}</span>}
              </button>
            );
          })}
          <div className="mobile-menu-divider" />
          <button className="mobile-menu-item" onClick={openSearch}>
            <MobileIcon name="search" />
            <span>Search</span>
          </button>
          <button className="mobile-menu-item" onClick={onToggleDark}>
            {dark ? <I.sun style={{ width: 20, height: 20 }} /> : <I.moon style={{ width: 20, height: 20 }} />}
            <span>{dark ? "Light mode" : "Dark mode"}</span>
          </button>
        </nav>
        <div className="mobile-menu-foot">
          <button className="btn" onClick={onSignOut} style={{ color: "var(--neg)", borderColor: "var(--border-2)" }}>
            <I.logout /> Sign out
          </button>
          <div style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "center" }}>
            {COMPANY.name} · {COMPANY.phone}
          </div>
        </div>
      </div>
    </>
  );
}

// Babel text/babel scripts with `src` load asynchronously, so we can't
// assume every module's globals exist the instant this file runs. Defer
// the initial render to the next tick so all sibling scripts have had
// a chance to register their components on window.
function __renderApp() {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}
if (document.readyState === "complete") {
  setTimeout(__renderApp, 0);
} else {
  window.addEventListener("load", () => setTimeout(__renderApp, 0), { once: true });
}

// ─────────────────────────────────────────────────────────────────
// Notifications popover - latest updates feed, click to navigate
// ─────────────────────────────────────────────────────────────────
function NotificationsPopover({ onClose, goTo }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    // defer so the opening click doesn't immediately close it
    const id = setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", onDoc); };
  }, [onClose]);

  return (
    <>
    <div className="popover-scrim mobile-only" onClick={onClose} />
    <div ref={ref} className="nav-popover" style={{ width: 400 }}>
      <div className="nav-popover-head">
        <h3>Notifications</h3>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
          {UPDATES.length} unread
        </span>
        <button className="popover-close mobile-only" onClick={onClose} aria-label="Close"><I.close /></button>
      </div>
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {UPDATES.slice(0, 5).map((u, i) => (
          <div key={u.id} className={"notif-item " + (i > 2 ? "read" : "")} onClick={() => goTo("updates")}>
            <span className="marker" />
            <div className="body">
              <h4>{u.title}</h4>
              <p>{u.body}</p>
              <span className="meta">
                <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{u.kind}</span>
                {u.dealId && <span className="mono" style={{ color: "var(--accent-ink)" }}>{u.dealId}</span>}
              </span>
            </div>
            <span className="when">{u.timeAgo || u.date}</span>
          </div>
        ))}
      </div>
      <div className="nav-popover-foot">
        <span>{UPDATES.length} total updates</span>
        <a href="#" onClick={(e) => { e.preventDefault(); goTo("updates"); }}>
          View all <I.arrowRight style={{ verticalAlign: "middle", marginLeft: 2 }} />
        </a>
      </div>
    </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Account menu - fully fleshed-out dropdown from the avatar.
//   Header  : avatar + name + email + account ID + classification
//   Status  : KYC verified by GoIdentity · 2FA on
//   Settings: deep-links to each Account sub-tab
//   Help    : contact CredX + call team
//   Quick   : appearance toggle
//   Footer  : prominent sign-out button
// ─────────────────────────────────────────────────────────────────
function AccountMenu({ onClose, goTo, goToAccountTab, onSignOut, dark, onToggleDark, investorAvatar }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const id = setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", onDoc); };
  }, [onClose]);

  const SettingsItem = ({ tab, label }) => (
    <button className="item" onClick={() => goToAccountTab(tab)}>
      <span>{label}</span>
      <I.chevron />
    </button>
  );

  return (
    <>
    <div className="popover-scrim mobile-only" onClick={onClose} />
    <div ref={ref} className="nav-popover acct-menu" style={{ minWidth: 300 }}>
      <button className="popover-close mobile-only" onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}><I.close /></button>
      {/* Header */}
      <div className="head" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <InvestorAvatar avatarId={investorAvatar.avatar} initials={INVESTOR.initials} size={44} initialsBg={investorAvatar.initialsBg} animalBg={investorAvatar.animalBg} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {INVESTOR.name}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {INVESTOR.email}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
            {INVESTOR.accountId}
          </span>
          <span className="tag" style={{ background: "var(--accent-tint)", color: "var(--accent-ink)", borderColor: "transparent", fontSize: 10 }}>
            {INVESTOR.classification}
          </span>
        </div>
      </div>

      {/* Status row */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.4 }}>
          <span style={{ color: "var(--pos)", flexShrink: 0, marginTop: 2 }}><I.check style={{ width: 12, height: 12 }} /></span>
          <span>KYC verified by <strong style={{ color: "var(--ink)" }}>GoIdentity</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.4 }}>
          <span style={{ color: "var(--pos)", flexShrink: 0, marginTop: 2 }}><I.check style={{ width: 12, height: 12 }} /></span>
          <span>Two-factor authentication active</span>
        </div>
      </div>

      {/* Account settings */}
      <div style={{ padding: "6px 0" }}>
        <div className="eyebrow" style={{ padding: "8px 16px 4px", fontSize: 10 }}>Account</div>
        <SettingsItem tab="profile"  label="Profile & identity" />
        <button className="item" onClick={() => {
          goToAccountTab("profile");
          setTimeout(() => {
            const el = document.getElementById("profile-picture-card");
            if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }}>
          <span>Edit profile picture</span>
          <I.chevron />
        </button>
        <SettingsItem tab="banking"  label="Banking" />
        <SettingsItem tab="comms"    label="Communication" />
        <SettingsItem tab="notifs"   label="Notifications" />
        <SettingsItem tab="security" label="Security & access" />
        <SettingsItem tab="display"  label="Display" />
        <SettingsItem tab="tax"      label="Tax" />
      </div>

      <div className="divider" />

      {/* Quick links */}
      <div style={{ padding: "6px 0" }}>
        <div className="eyebrow" style={{ padding: "8px 16px 4px", fontSize: 10 }}>Quick links</div>
        <button className="item" onClick={() => goTo("documents")}>
          <span>Documents</span>
          <I.chevron />
        </button>
        <button className="item" onClick={() => goTo("updates")}>
          <span>Updates &amp; statements</span>
          <I.chevron />
        </button>
      </div>

      <div className="divider" />

      {/* Help */}
      <div style={{ padding: "6px 0" }}>
        <div className="eyebrow" style={{ padding: "8px 16px 4px", fontSize: 10 }}>Help</div>
        <a className="item" href={"mailto:" + COMPANY.email} style={{ textDecoration: "none" }}>
          <span>Email investor team</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{COMPANY.email}</span>
        </a>
        <a className="item" href={"tel:" + COMPANY.phone.replace(/\s/g, "")} style={{ textDecoration: "none" }}>
          <span>Call investor team</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{COMPANY.phone}</span>
        </a>
      </div>

      <div className="divider" />

      {/* Quick appearance toggle */}
      <button className="item" onClick={onToggleDark}>
        <span>Appearance</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontSize: 12 }}>
          {dark ? <><I.moon /> Dark</> : <><I.sun /> Light</>}
        </span>
      </button>

      {/* Sign out - prominent */}
      <div style={{ padding: "10px 12px 12px", borderTop: "1px solid var(--border)" }}>
        <button onClick={onSignOut}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%",
            padding: "10px 14px",
            border: "1px solid var(--border-2)",
            background: "var(--bg)",
            color: "var(--neg)",
            fontSize: 13, fontWeight: 600,
            cursor: "pointer",
            transition: "background .12s ease, border-color .12s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--neg-tint)"; e.currentTarget.style.borderColor = "var(--neg)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.borderColor = "var(--border-2)"; }}>
          <I.logout /> Sign out
        </button>
      </div>
    </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Search palette - cmd-K style search across facilities, opps,
// updates, documents. Single keyboard-friendly modal.
// ─────────────────────────────────────────────────────────────────
function SearchPalette({ open, onClose, goTo, openDeal, openOpp }) {
  const [q, setQ] = React.useState("");
  const [hi, setHi] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) { setQ(""); setHi(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); }
  }, [open]);

  const results = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    const m = (s) => !term || (s || "").toLowerCase().includes(term);
    const deals = LIVE_DEALS.filter(d => m(d.title) || m(d.id) || m(d.property))
      .slice(0, 4).map(d => ({ kind: "deal", title: d.title, sub: d.id + " · " + d.property, badge: "Active", payload: d }));
    const completed = COMPLETED_DEALS.filter(d => m(d.title) || m(d.id) || m(d.property))
      .slice(0, 3).map(d => ({ kind: "completed", title: d.title, sub: d.id + " · " + d.property, badge: "Redeemed", payload: d }));
    const opps = OPPORTUNITIES.filter(o => m(o.title) || m(o.id) || m(o.property))
      .slice(0, 4).map(o => ({ kind: "opp", title: o.title, sub: o.id + " · " + o.property, badge: "Open", payload: o }));
    const ups = UPDATES.filter(u => m(u.title) || m(u.body))
      .slice(0, 3).map(u => ({ kind: "update", title: u.title, sub: u.date + " · " + u.kind, badge: "Update", payload: u }));
    const docs = DOCUMENTS.filter(d => m(d.name) || m(d.category))
      .slice(0, 3).map(d => ({ kind: "doc", title: d.name, sub: d.category + " · " + d.date, badge: "Doc", payload: d }));
    return [...deals, ...completed, ...opps, ...ups, ...docs];
  }, [q]);

  const choose = (r) => {
    if (r.kind === "deal") openDeal(r.payload);
    else if (r.kind === "opp") { goTo("opportunities"); openOpp(r.payload); }
    else if (r.kind === "completed") goTo("portfolio");
    else if (r.kind === "update") goTo("updates");
    else if (r.kind === "doc") goTo("documents");
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setHi(h => Math.min(h + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
      if (e.key === "Enter" && results[hi]) { e.preventDefault(); choose(results[hi]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, hi]);

  React.useEffect(() => { setHi(0); }, [q]);

  if (!open) return null;

  const groups = [
    { label: "Active facilities", kind: "deal",      icon: <I.building /> },
    { label: "Redeemed",          kind: "completed", icon: <I.check /> },
    { label: "Opportunities",     kind: "opp",       icon: <I.arrowRight /> },
    { label: "Updates",           kind: "update",    icon: <I.bell /> },
    { label: "Documents",         kind: "doc",       icon: <I.doc /> },
  ];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="search-modal" role="dialog" aria-modal="true">
        <div className="input-row">
          <I.search style={{ color: "var(--ink-3)" }} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
                 placeholder="Search facilities, opportunities, updates, documents…" />
          <span className="kbd desktop-only">ESC</span>
          <button className="popover-close mobile-only" onClick={onClose} aria-label="Close search"><I.close /></button>
        </div>
        <div className="results">
          {results.length === 0 && (
            <div className="empty">No matches for "{q}"</div>
          )}
          {groups.map(g => {
            const gr = results.filter(r => r.kind === g.kind);
            if (gr.length === 0) return null;
            return (
              <div key={g.kind}>
                <div className="group-label">{g.label}</div>
                {gr.map((r, i) => {
                  const idx = results.indexOf(r);
                  const active = idx === hi;
                  return (
                    <div key={r.kind + i} className={"result" + (active ? " active" : "")}
                         onMouseEnter={() => setHi(idx)} onClick={() => choose(r)}>
                      <span className={"ico" + (r.kind === "opp" ? " accent" : "")}>{g.icon}</span>
                      <div>
                        <div className="title">{r.title}</div>
                        <div className="sub">{r.sub}</div>
                      </div>
                      <span className="badge">{r.badge}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="nav-popover-foot" style={{ borderTop: "1px solid var(--border)" }}>
          <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
          <span>
            <span className="kbd" style={{ marginRight: 6 }}>↑↓</span>navigate
            <span className="kbd" style={{ marginLeft: 12, marginRight: 6 }}>↵</span>open
          </span>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Deal alerts toggle - on/off switch in the Opportunities header.
// State + criteria persist in localStorage; nothing leaves the portal.
// The actual alert emails are sent by the CredX backend cron when
// new opportunities go live and match the saved criteria.
// ─────────────────────────────────────────────────────────────────

const ALERT_BOUNDS = {
  amount: [30000, 750000],   // CredX's stated loan range
  ltv:    [0, 75],
  rate:   [9, 13],
  term:   [1, 24],           // CredX max term
};
const ALERT_DEFAULTS = {
  amount: [30000, 750000],
  ltv:    [0, 75],
  rate:   [9, 13],
  term:   [1, 24],
  charges:    ["First", "Second"],
  categories: ["Residential bridging", "Commercial bridging", "Business loan"],
};

function _loadCriteria() {
  try {
    const s = localStorage.getItem("credx-alert-criteria");
    if (s) return { ...ALERT_DEFAULTS, ...JSON.parse(s) };
  } catch {}
  return ALERT_DEFAULTS;
}

function _criteriaSummary(c) {
  // Build a 1-line human summary like "Residential, Commercial · First charge · £50k-£500k"
  const parts = [];
  if (c.categories.length === 3) parts.push("All categories");
  else parts.push(c.categories.map(s => s.split(" ")[0]).join(", "));
  if (c.charges.length === 2) parts.push("All charges");
  else parts.push(c.charges.map(s => s + " charge").join(" + "));
  if (c.amount[0] > ALERT_BOUNDS.amount[0] || c.amount[1] < ALERT_BOUNDS.amount[1]) {
    parts.push(`£${(c.amount[0]/1000).toFixed(0)}k-£${(c.amount[1]/1000).toFixed(0)}k`);
  }
  if (c.ltv[0] > ALERT_BOUNDS.ltv[0] || c.ltv[1] < ALERT_BOUNDS.ltv[1]) {
    parts.push(`LTV ${c.ltv[0]}-${c.ltv[1]}%`);
  }
  return parts.join(" · ");
}

function DealAlertsButton() {
  const [on, setOn] = React.useState(() => {
    try { return localStorage.getItem("credx-deal-alerts") === "on"; } catch { return false; }
  });
  const [popOpen, setPopOpen] = React.useState(false);
  const [criteriaOpen, setCriteriaOpen] = React.useState(false);
  const [criteria, setCriteria] = React.useState(_loadCriteria);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!popOpen || criteriaOpen) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setPopOpen(false); };
    const id = setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", onDoc); };
  }, [popOpen, criteriaOpen]);

  const setState = (next) => {
    setOn(next);
    try { localStorage.setItem("credx-deal-alerts", next ? "on" : "off"); } catch {}
    // Preference is saved in-portal; the actual alert emails are sent
    // by the CredX backend when new opportunities go live.
  };

  const saveCriteria = (c) => {
    setCriteria(c);
    try { localStorage.setItem("credx-alert-criteria", JSON.stringify(c)); } catch {}
  };

  // Example of what each new-deal alert will look like
  const sampleOpp = OPPORTUNITIES[0];
  const sampleSubject = `New CredX opportunity - ${sampleOpp.title} (${sampleOpp.id})`;
  const sampleBody = [
    `Hi ${INVESTOR.name.split(" ")[0]},`,
    ``,
    `A new opportunity matching your criteria has just been published on the CredX investor portal:`,
    ``,
    `  Facility:      ${sampleOpp.id} - ${sampleOpp.title}`,
    `  Property:      ${sampleOpp.property}`,
    `  Coupon:        ${sampleOpp.rate.toFixed(2)}% p.a.`,
    `  Term:          ${sampleOpp.term} months`,
    `  LTV:           ${Math.round(sampleOpp.ltv * 100)}%`,
    `  Charge:        ${sampleOpp.chargeType} legal charge`,
    `  Facility size: £${sampleOpp.facility.toLocaleString("en-GB")}`,
    `  Min funding:   £${sampleOpp.min.toLocaleString("en-GB")}`,
    `  Closes:        ${sampleOpp.closes}`,
    ``,
    `View this opportunity in the portal:`,
    `→ https://portal.credx.co.uk/opportunities/${sampleOpp.id}`,
    ``,
    `Reply to this email or call ${COMPANY.phone} to register your interest.`,
    ``,
    `CredX Investor Team`,
    `${COMPANY.email}`,
  ].join("\n");
  const sampleMailto = `mailto:?subject=${encodeURIComponent(sampleSubject)}&body=${encodeURIComponent(sampleBody)}`;

  return (
    <div className="nav-popover-anchor" ref={ref}>
      <button className="btn" onClick={() => setPopOpen(o => !o)}
              style={on ? { borderColor: "var(--accent)", color: "var(--accent-ink)", background: "var(--accent-tint)" } : undefined}>
        {on
          ? <><span style={{ width: 8, height: 8, background: "var(--pos)", borderRadius: "50%", display: "inline-block" }} /> Deal alerts ON</>
          : <><I.bell /> Set deal alerts</>}
      </button>
      {popOpen && (
        <><div className="popover-scrim mobile-only" onClick={() => setPopOpen(false)} />
        <div className="nav-popover" style={{ width: 360 }}>
          <div className="nav-popover-head">
            <h3>Deal alerts</h3>
            <span className="mono" style={{ fontSize: 11, color: on ? "var(--pos)" : "var(--ink-3)", letterSpacing: "0.06em" }}>
              {on ? "● ACTIVE" : "OFF"}
            </span>
            <button className="popover-close mobile-only" onClick={() => setPopOpen(false)} aria-label="Close"><I.close /></button>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <div style={{ paddingRight: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Email me about new deals</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>
                  Sent the moment opportunities go live, with details and a portal link.
                </div>
              </div>
              <Switch on={on} onChange={() => setState(!on)} />
            </div>

            <div style={{
              marginTop: 14,
              padding: "12px 14px",
              background: "var(--bg-sunk)",
              border: "1px solid var(--border)",
            }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Your criteria</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
                {_criteriaSummary(criteria)}
              </div>
              <button className="btn btn-sm" style={{ marginTop: 10, width: "100%" }} onClick={() => setCriteriaOpen(true)}>
                Edit criteria
              </button>
            </div>

            <a className="btn btn-sm" href={sampleMailto}
               style={{ marginTop: 10, width: "100%", display: "inline-flex", justifyContent: "center", gap: 8 }}>
              <I.external /> Preview a sample alert
            </a>
          </div>
          <div className="nav-popover-foot">
            <span>Sent to <span className="mono" style={{ color: "var(--ink-2)" }}>{INVESTOR.email}</span></span>
            <button onClick={() => setCriteriaOpen(true)} style={{ color: "var(--accent)", fontWeight: 500, fontSize: 12, background: "none", border: 0, padding: 0, cursor: "pointer" }}>
              Manage
            </button>
          </div>
        </div>
        </>
      )}

      <CriteriaModal
        open={criteriaOpen}
        onClose={() => setCriteriaOpen(false)}
        value={criteria}
        onSave={(c) => { saveCriteria(c); setCriteriaOpen(false); }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CriteriaModal - in-portal editor for the alert filter set.
// Mirrors the Opportunities Filters panel; saves on Save.
// ─────────────────────────────────────────────────────────────────
function CriteriaModal({ open, onClose, value, onSave }) {
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => { if (open) setLocal(value); }, [open, value]);

  const toggleIn = (key) => (val) => setLocal(prev => {
    const arr = prev[key];
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    return { ...prev, [key]: next };
  });
  const setRange = (key) => (v) => setLocal(prev => ({ ...prev, [key]: v }));

  // Set objects for the CheckboxGroup component
  const chargesSet    = new Set(local.charges);
  const categoriesSet = new Set(local.categories);

  // Simulate how many current opportunities the criteria would match
  const matched = OPPORTUNITIES.filter(o =>
    local.charges.includes(o.chargeType) &&
    local.categories.includes(o.category) &&
    o.facility >= local.amount[0] && o.facility <= local.amount[1] &&
    o.ltv * 100 >= local.ltv[0] && o.ltv * 100 <= local.ltv[1] &&
    o.rate >= local.rate[0] && o.rate <= local.rate[1] &&
    o.term >= local.term[0] && o.term <= local.term[1]
  ).length;

  return (
    <Modal open={open} onClose={onClose} title="Alert criteria" width={680}
      footer={
        <>
          <button className="btn" onClick={() => setLocal(ALERT_DEFAULTS)}>Reset to defaults</button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(local)}>Save preferences</button>
          </div>
        </>
      }
    >
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
        You'll only be alerted for new facilities that match <strong>all</strong> of the criteria below.
        Saved instantly to your account - no email confirmation required.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
        <RangeFilter label="Loan amount" bounds={ALERT_BOUNDS.amount} value={local.amount} onChange={setRange("amount")}
          step={5000} format={v => "£" + (v >= 1000 ? (v/1000).toFixed(0) + "k" : v)} />
        <RangeFilter label="LTV" bounds={ALERT_BOUNDS.ltv} value={local.ltv} onChange={setRange("ltv")}
          step={1} format={v => v + "%"} />
        <RangeFilter label="Coupon (p.a.)" bounds={ALERT_BOUNDS.rate} value={local.rate} onChange={setRange("rate")}
          step={0.25} format={v => v.toFixed(2) + "%"} />
        <RangeFilter label="Term" bounds={ALERT_BOUNDS.term} value={local.term} onChange={setRange("term")}
          step={1} format={v => v + " mo"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 8 }}>
        <CheckboxGroup
          label="Charge type"
          options={["First", "Second"]}
          formatOption={o => o + " charge"}
          selected={chargesSet}
          onToggle={toggleIn("charges")}
        />
        <CheckboxGroup
          label="Category"
          options={["Residential bridging", "Commercial bridging", "Business loan"]}
          selected={categoriesSet}
          onToggle={toggleIn("categories")}
        />
      </div>

      <div style={{
        marginTop: 18,
        padding: "12px 14px",
        background: "var(--accent-tint)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 13,
        color: "var(--accent-ink)",
      }}>
        <span>With these criteria you'd be alerted to</span>
        <span className="mono" style={{ fontWeight: 600 }}>{matched} of {OPPORTUNITIES.length} live deals</span>
      </div>
    </Modal>
  );
}

function Switch({ on, onChange }) {
  return (
    <button type="button" onClick={onChange} role="switch" aria-checked={on}
      style={{
        width: 40, height: 22,
        background: on ? "var(--accent)" : "var(--border-2)",
        position: "relative",
        borderRadius: 999,
        transition: "background .15s ease",
        flexShrink: 0,
        padding: 0,
        border: 0,
        cursor: "pointer",
      }}>
      <span style={{
        position: "absolute",
        top: 2,
        left: on ? 20 : 2,
        width: 18, height: 18,
        background: "white",
        borderRadius: "50%",
        transition: "left .15s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,.22)",
      }} />
    </button>
  );
}
