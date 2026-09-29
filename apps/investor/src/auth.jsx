// auth.jsx - prototype sign-in and investor onboarding flows.
// Registration, MFA, email delivery and KYC are not connected to services.

const AUTH_KEY = "credx-auth-session-v2";
const LAST_ACTIVITY_KEY = "credx-last-activity-v1";
const IDLE_TIMEOUT_MS = 20 * 60 * 1000;
const API_REQUEST_TIMEOUT_MS = 5000;
const API_BASE_URL = () => window.CREDX_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;

async function fetchApi(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE_URL()}${path}`, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function authErrorMessage(error) {
  if (error?.name === "AbortError") {
    return `The CredX API at ${API_BASE_URL()} did not respond within 5 seconds. Check that it is running, then retry.`;
  }
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return `Cannot reach the CredX API at ${API_BASE_URL()}. Start the API with node apps/api/src/server.js, then retry.`;
  }
  return error.message || "Unable to sign in.";
}

// ────────────────────────────────────────────────────────────────
// Country list + sanctions config
//   SANCTIONED_COUNTRIES - hard block (cannot submit application).
//   HIGH_RISK_COUNTRIES  - soft block: submission allowed but flagged
//                          for CRO review before GoIdentity is issued.
// Both lists are kept here so Compliance can update them without
// shipping a release; in production they'd move to a config service.
// ────────────────────────────────────────────────────────────────
const SANCTIONED_COUNTRIES = ["IR", "KP", "MM"];   // Iran, DPRK, Myanmar - sync with UK Sanctions List
const HIGH_RISK_COUNTRIES  = ["AL", "BB", "BF", "CM", "CD", "HT", "JM", "JO", "ML", "MZ", "NG", "PA", "PH", "SN", "SS", "SY", "TR", "UG", "AE", "VE", "YE"]; // FATF grey-list + internal AML high-risk

// Phone country codes - short list of the markets CredX sees most often,
// then the rest of the world alphabetically. Each entry: [iso, name, dial, sampleLen]
// sampleLen is the typical national-significant-number length used for a soft
// validity check (we accept ±1).
const PHONE_COUNTRIES = [
  ["GB","United Kingdom","+44",10],
  ["IE","Ireland","+353",9],
  ["US","United States","+1",10],
  ["CA","Canada","+1",10],
  ["AU","Australia","+61",9],
  ["NZ","New Zealand","+64",9],
  ["FR","France","+33",9],
  ["DE","Germany","+49",10],
  ["IT","Italy","+39",10],
  ["ES","Spain","+34",9],
  ["NL","Netherlands","+31",9],
  ["BE","Belgium","+32",9],
  ["CH","Switzerland","+41",9],
  ["AT","Austria","+43",10],
  ["DK","Denmark","+45",8],
  ["SE","Sweden","+46",9],
  ["NO","Norway","+47",8],
  ["FI","Finland","+358",9],
  ["PL","Poland","+48",9],
  ["PT","Portugal","+351",9],
  ["LU","Luxembourg","+352",9],
  ["MT","Malta","+356",8],
  ["CY","Cyprus","+357",8],
  ["AE","United Arab Emirates","+971",9],
  ["SA","Saudi Arabia","+966",9],
  ["QA","Qatar","+974",8],
  ["IL","Israel","+972",9],
  ["IN","India","+91",10],
  ["SG","Singapore","+65",8],
  ["HK","Hong Kong","+852",8],
  ["JP","Japan","+81",10],
  ["KR","South Korea","+82",10],
  ["CN","China","+86",11],
  ["ZA","South Africa","+27",9],
  ["BR","Brazil","+55",11],
  ["MX","Mexico","+52",10],
  ["AR","Argentina","+54",10],
  ["TR","Turkey","+90",10],
];

function dialFor(iso) {
  const row = PHONE_COUNTRIES.find(r => r[0] === iso);
  return row ? row[2] : "+44";
}
function sampleLenFor(iso) {
  const row = PHONE_COUNTRIES.find(r => r[0] === iso);
  return row ? row[3] : 9;
}
// Returns { valid, message }
function validatePhone(iso, national) {
  const digits = (national || "").replace(/\D/g, "");
  if (digits.length === 0) return { valid: false, message: "Enter your mobile number." };
  if (digits.length < 6)   return { valid: false, message: "Phone number is too short." };
  if (digits.length > 15)  return { valid: false, message: "Phone number is too long." };
  const expected = sampleLenFor(iso);
  if (Math.abs(digits.length - expected) > 1) {
    return { valid: false, message: `Looks too ${digits.length < expected ? "short" : "long"} for a ${iso} number.` };
  }
  return { valid: true, message: "" };
}
function fullPhone(iso, national) {
  return dialFor(iso) + " " + (national || "").replace(/\D/g, "");
}

// ── PhoneInput ──────────────────────────────────────────────────
// Country-code selector + national-number input + inline validation.
function PhoneInput({ countryIso, nationalNumber, onCountryChange, onNumberChange }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const id = setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", onDoc); };
  }, [open]);

  const filtered = query
    ? PHONE_COUNTRIES.filter(([code, name, dial]) =>
        name.toLowerCase().includes(query.toLowerCase()) ||
        code.toLowerCase() === query.toLowerCase() ||
        dial.includes(query))
    : PHONE_COUNTRIES;

  const current = PHONE_COUNTRIES.find(r => r[0] === countryIso) || PHONE_COUNTRIES[0];
  const validation = validatePhone(countryIso, nationalNumber);
  const showError = nationalNumber.length > 0 && !validation.valid;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 0,
        border: "1px solid " + (showError ? "var(--neg)" : "var(--border-2)"),
        background: "var(--bg)",
      }}>
        <button type="button" onClick={() => { setOpen(o => !o); setQuery(""); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 12px",
            borderRight: "1px solid var(--border-2)",
            background: "var(--bg-sunk)",
            color: "var(--ink)",
            fontSize: 14,
            cursor: "pointer",
          }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{current[0]}</span>
          <span className="mono" style={{ fontVariantNumeric: "tabular-nums" }}>{current[2]}</span>
          <I.chevron style={{ transform: open ? "rotate(-90deg)" : "rotate(90deg)", color: "var(--ink-3)" }} />
        </button>
        <input
          type="tel"
          inputMode="tel"
          value={nationalNumber}
          onChange={e => onNumberChange(e.target.value)}
          placeholder={"e.g. " + "0".repeat(sampleLenFor(countryIso))}
          style={{
            border: 0,
            background: "transparent",
            padding: "10px 12px",
            fontSize: 14,
            outline: 0,
            width: "100%",
          }}
        />
      </div>
      {showError && (
        <div style={{ fontSize: 11.5, color: "var(--neg)", marginTop: 4 }}>{validation.message}</div>
      )}
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          marginTop: 4,
          background: "var(--bg-elev)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 28px rgba(14,20,24,.12)",
          zIndex: 50,
        }}>
          <div style={{ padding: 8, borderBottom: "1px solid var(--border)" }}>
            <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                   placeholder="Search by name, code or dial…"
                   style={{
                     width: "100%",
                     border: "1px solid var(--border-2)",
                     background: "var(--bg)",
                     padding: "6px 10px",
                     fontSize: 13,
                     outline: 0,
                   }} />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filtered.map(([code, name, dial]) => (
              <button key={code} type="button"
                onClick={() => { onCountryChange(code); setOpen(false); }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  width: "100%", textAlign: "left",
                  padding: "8px 12px",
                  background: countryIso === code ? "var(--accent-tint)" : "transparent",
                  color: "var(--ink-2)",
                  fontSize: 13,
                  cursor: "pointer",
                  borderTop: "1px solid var(--border)",
                }}
                onMouseEnter={e => { if (countryIso !== code) e.currentTarget.style.background = "var(--bg-sunk)"; }}
                onMouseLeave={e => { if (countryIso !== code) e.currentTarget.style.background = "transparent"; }}>
                <span>
                  <span className="mono" style={{ color: "var(--ink-3)", marginRight: 8, fontSize: 11 }}>{code}</span>
                  {name}
                </span>
                <span className="mono" style={{ color: "var(--ink-3)", fontSize: 12 }}>{dial}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", color: "var(--ink-3)", fontSize: 12 }}>
                No countries match "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const COUNTRIES = [
  ["GB","United Kingdom"],["IE","Ireland"],["US","United States"],["CA","Canada"],["AU","Australia"],["NZ","New Zealand"],
  ["FR","France"],["DE","Germany"],["IT","Italy"],["ES","Spain"],["PT","Portugal"],["NL","Netherlands"],["BE","Belgium"],
  ["LU","Luxembourg"],["CH","Switzerland"],["AT","Austria"],["DK","Denmark"],["SE","Sweden"],["NO","Norway"],["FI","Finland"],
  ["IS","Iceland"],["PL","Poland"],["CZ","Czech Republic"],["SK","Slovakia"],["HU","Hungary"],["RO","Romania"],["BG","Bulgaria"],
  ["GR","Greece"],["CY","Cyprus"],["MT","Malta"],["HR","Croatia"],["SI","Slovenia"],["EE","Estonia"],["LV","Latvia"],["LT","Lithuania"],
  ["AE","United Arab Emirates"],["SA","Saudi Arabia"],["QA","Qatar"],["KW","Kuwait"],["BH","Bahrain"],["OM","Oman"],
  ["IL","Israel"],["JO","Jordan"],["LB","Lebanon"],["TR","Turkey"],["EG","Egypt"],["MA","Morocco"],["TN","Tunisia"],["DZ","Algeria"],
  ["ZA","South Africa"],["NG","Nigeria"],["KE","Kenya"],["GH","Ghana"],["UG","Uganda"],["TZ","Tanzania"],["RW","Rwanda"],["ET","Ethiopia"],
  ["SG","Singapore"],["HK","Hong Kong"],["JP","Japan"],["KR","South Korea"],["CN","China"],["TW","Taiwan"],["IN","India"],
  ["PK","Pakistan"],["BD","Bangladesh"],["LK","Sri Lanka"],["TH","Thailand"],["MY","Malaysia"],["ID","Indonesia"],["PH","Philippines"],
  ["VN","Vietnam"],["KH","Cambodia"],["LA","Laos"],["MN","Mongolia"],["NP","Nepal"],
  ["BR","Brazil"],["AR","Argentina"],["CL","Chile"],["CO","Colombia"],["PE","Peru"],["UY","Uruguay"],["MX","Mexico"],
  ["AD","Andorra"],["MC","Monaco"],["SM","San Marino"],["VA","Vatican City"],["LI","Liechtenstein"],
  ["RU","Russia"],["UA","Ukraine"],["BY","Belarus"],["MD","Moldova"],["GE","Georgia"],["AM","Armenia"],["AZ","Azerbaijan"],
  ["KZ","Kazakhstan"],["UZ","Uzbekistan"],["KG","Kyrgyzstan"],["TJ","Tajikistan"],["TM","Turkmenistan"],
  ["JM","Jamaica"],["BB","Barbados"],["BS","Bahamas"],["BM","Bermuda"],["KY","Cayman Islands"],["VG","British Virgin Islands"],
  ["GG","Guernsey"],["JE","Jersey"],["IM","Isle of Man"],["GI","Gibraltar"],
  ["IR","Iran"],["KP","North Korea"],["MM","Myanmar"],["SY","Syria"],["YE","Yemen"],["AF","Afghanistan"],["IQ","Iraq"],["LY","Libya"],
  ["VE","Venezuela"],["CU","Cuba"],["HT","Haiti"],["NI","Nicaragua"],["SD","Sudan"],["SS","South Sudan"],["SO","Somalia"],
  ["AL","Albania"],["RS","Serbia"],["BA","Bosnia and Herzegovina"],["MK","North Macedonia"],["ME","Montenegro"],["XK","Kosovo"],
  ["BF","Burkina Faso"],["CI","Côte d'Ivoire"],["SN","Senegal"],["CM","Cameroon"],["CD","DR Congo"],["CG","Congo"],
  ["AO","Angola"],["MZ","Mozambique"],["NA","Namibia"],["BW","Botswana"],["ZW","Zimbabwe"],["ZM","Zambia"],["ML","Mali"],
  ["MG","Madagascar"],["MU","Mauritius"],["SC","Seychelles"],
  ["PA","Panama"],["CR","Costa Rica"],["DO","Dominican Republic"],["GT","Guatemala"],["EC","Ecuador"],["BO","Bolivia"],["PY","Paraguay"],
];

function countryName(code) {
  const row = COUNTRIES.find(r => r[0] === code);
  return row ? row[1] : code;
}
function isHardBlocked(code) { return SANCTIONED_COUNTRIES.includes(code); }
function isHighRisk(code)    { return HIGH_RISK_COUNTRIES.includes(code); }

function useAuth() {
  const [session, setSession] = React.useState(() => {
    try {
      const s = sessionStorage.getItem(AUTH_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  React.useEffect(() => {
    if (!session) return undefined;
    let lastActivity = Date.now();
    try {
      lastActivity = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY)) || lastActivity;
    } catch {}

    const touch = () => {
      lastActivity = Date.now();
      try { sessionStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivity)); } catch {}
    };
    const checkIdle = () => {
      if (Date.now() - lastActivity >= IDLE_TIMEOUT_MS) signOut();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, touch, { passive: true }));
    const timer = window.setInterval(checkIdle, 30000);
    return () => {
      events.forEach(event => window.removeEventListener(event, touch));
      window.clearInterval(timer);
    };
  }, [session]);
  const signIn = async (email, password) => {
    const response = await fetchApi("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Unable to sign in");
    }
    const result = await response.json();
    const next = { ...result.user, token: result.token, signedInAt: new Date().toISOString() };
    try {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(next));
      sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } catch {}
    setSession(next);
  };
  const signOut = () => {
    if (session?.token) {
      fetch(`${API_BASE_URL()}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      }).catch(() => {});
    }
    try {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch {}
    setSession(null);
  };
  return { session, signIn, signOut };
}

function AuthScreen({ onSignIn }) {
  const [mode, setMode] = React.useState("signin"); // signin | signup
  // The appropriateness test needs more room than the rest of the flow.
  const [wide, setWide] = React.useState(false);

  return (
    <div className="auth-split" style={{
      position: "fixed", inset: 0,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--bg-elev)",
      zIndex: 1000,
    }}>
      <AuthBrandPanel />
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: 40,
        overflowY: "auto",
      }}>
        <div style={{ width: wide && mode === "signup" ? 660 : 440, maxWidth: "100%", margin: "auto", transition: "width .18s ease" }}>
          {/* Mode toggle */}
          <div style={{
            display: "flex",
            border: "1px solid var(--border)",
            marginBottom: 24,
          }}>
            {["signin", "signup"].map(m => (
              <button key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: mode === m ? "var(--bg)" : "var(--bg-elev)",
                  color: mode === m ? "var(--ink)" : "var(--ink-3)",
                  fontSize: 12.5,
                  fontWeight: mode === m ? 600 : 500,
                  letterSpacing: "0.04em",
                  borderRight: m === "signin" ? "1px solid var(--border)" : "0",
                  transition: "background .12s ease",
                }}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {mode === "signin"
            ? <SignInFlow onSignIn={onSignIn} switchToSignup={() => setMode("signup")} />
            : <SignUpFlow switchToSignin={() => setMode("signin")} onWide={setWide} />
          }
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Left brand panel - shared across sign-in and sign-up
// ────────────────────────────────────────────────────────────────
function AuthBrandPanel() {
  return (
    <div style={{
      background: "#0e1418",
      color: "#f4f1ea",
      padding: "60px 64px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      overflowY: "auto",
    }}>
      <div>
        {/* Use the shared <CredXMark> — never hand-roll an <img src="assets/..."> here.
            Forced "light" variant because this sits on the dark hero panel. */}
        <div style={{ marginBottom: 12 }}>
          <CredXMark height={46} variant="light" />
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "rgba(244,241,234,.55)",
          paddingLeft: 2,
        }}>Investor Portal</div>
      </div>

      <div style={{ maxWidth: 460 }}>
        <h1 style={{
          fontFamily: "var(--ff-serif)", fontWeight: 380, fontSize: 44,
          letterSpacing: "-0.015em", lineHeight: 1.1, margin: 0,
        }}>
          Your capital, your control.
        </h1>
        <p style={{
          marginTop: 18, fontSize: 15, lineHeight: 1.6,
          color: "rgba(244,241,234,.72)",
        }}>
          Bespoke short-term property lending in Kent, secured by a first legal charge over UK property.
          Deal-by-deal - your capital is never pooled and CredX never holds your funds.
        </p>
      </div>

      <div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["Development preview", "Investor registration, email verification, MFA and KYC are not connected."],
            ["Demo data only", "Do not enter real personal, identity or investment information."],
          ].map(([t, d]) => (
            <div key={t} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 12, alignItems: "flex-start" }}>
              <span style={{ color: "rgba(244,241,234,.55)", marginTop: 2 }}><I.check /></span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
                <div style={{ fontSize: 12, color: "rgba(244,241,234,.55)", marginTop: 2, lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 28, paddingTop: 18,
          borderTop: "1px solid rgba(244,241,234,.10)",
          fontSize: 11, color: "rgba(244,241,234,.45)",
          lineHeight: 1.5,
        }}>
          CredX Ltd · Company No. 16640225 · ICO ZB991146<br />
          Suite F16, St George's Business Park, Sittingbourne, Kent ME10 3TB
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SIGN IN
// ────────────────────────────────────────────────────────────────
function SignInFlow({ onSignIn, switchToSignup }) {
  const [step, setStep] = React.useState("creds");
  const [email, setEmail] = React.useState("d.gashi@example.co.uk");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submitCreds = async (e) => {
    e.preventDefault();
    setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Enter a valid email address."); return; }
    if (!password)                                   { setErr("Password is required."); return; }
    setBusy(true);
    try {
      const response = await fetchApi("/health");
      if (!response.ok) throw new Error(`The CredX API returned ${response.status}.`);
      setStep("twofa");
    } catch (error) {
      setErr(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const submitTwoFA = async (e) => {
    e.preventDefault();
    setErr("");
    if (!/^\d{6}$/.test(code)) { setErr("Enter the 6-digit code from your authenticator app."); return; }
    setBusy(true);
    try {
      await onSignIn(email, password);
    } catch (error) {
      setErr(authErrorMessage(error));
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
        <span className="mono" style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em",
          color: step === "creds" ? "var(--accent)" : "var(--ink-3)",
        }}>01 CREDENTIALS</span>
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span className="mono" style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em",
          color: step === "twofa" ? "var(--accent)" : "var(--ink-3)",
        }}>02 VERIFY</span>
      </div>

      <h2 className="h-sect" style={{ marginBottom: 6 }}>
        {step === "creds" ? "Sign in" : "Two-factor code"}
      </h2>
      <p style={{ color: "var(--ink-3)", fontSize: 13.5, lineHeight: 1.55, margin: "0 0 24px" }}>
        {step === "creds"
          ? "Use the email registered to your CredX Funder account."
          : <>Enter the 6-digit code from your authenticator app for <strong className="mono" style={{ color: "var(--ink-2)" }}>{email}</strong>.</>
        }
      </p>

      {step === "creds" && (
        <form onSubmit={submitCreds} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" autoComplete="username" autoFocus
                   value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="auth-pw" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Password</span>
              <span style={{ color: "var(--ink-3)", letterSpacing: 0, textTransform: "none", fontWeight: 400, fontSize: 11 }}>Password reset unavailable</span>
            </label>
            <input id="auth-pw" type="password" autoComplete="current-password"
                   value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {err && <ErrorBanner message={err} />}
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}
                  style={{ marginTop: 8, justifyContent: "center", opacity: busy ? 0.6 : 1 }}>
            {busy ? "Verifying…" : <>Continue <I.arrowRight /></>}
          </button>
        </form>
      )}

      {step === "twofa" && (
        <form onSubmit={submitTwoFA} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label htmlFor="auth-code">Authentication code</label>
            <input id="auth-code" type="text" inputMode="numeric" maxLength={6} autoFocus
                   value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                   placeholder="000000"
                   className="mono"
                   style={{ fontSize: 22, letterSpacing: "0.4em", textAlign: "center" }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
            Lost access to your authenticator? <a href="#" onClick={e => e.preventDefault()} style={{ color: "var(--accent)", fontWeight: 500 }}>Use a recovery code instead</a>.
          </div>
          {err && <ErrorBanner message={err} />}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" className="btn" onClick={() => { setStep("creds"); setCode(""); }}>Back</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}
                    style={{ flex: 1, justifyContent: "center", opacity: busy ? 0.6 : 1 }}>
              {busy ? "Signing in…" : <>Sign in <I.arrowRight /></>}
            </button>
          </div>
        </form>
      )}

      <div style={{
        marginTop: 32, paddingTop: 18,
        borderTop: "1px solid var(--border)",
        fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.55,
      }}>
        <div style={{
          padding: "10px 12px",
          background: "var(--accent-tint)",
          borderLeft: "3px solid var(--accent)",
          marginBottom: 14,
          fontSize: 11.5, color: "var(--accent-ink)",
        }}>
          <strong>Prototype only · </strong>
          The verification code is not checked by the API. Account creation and MFA are not active; do not use real credentials.
        </div>
        <div style={{ marginBottom: 6 }}>
          <strong style={{ color: "var(--ink-2)" }}>New to CredX?</strong>{" "}
          <button onClick={switchToSignup} style={{ color: "var(--accent)", fontWeight: 500, background: "none", border: 0, padding: 0, cursor: "pointer" }}>
            Create an investor account
          </button>
          {" "}or call the team to discuss your first opportunity.
        </div>
        <a href={"mailto:" + (window.COMPANY ? COMPANY.email : "info@credx.co.uk")} style={{ color: "var(--accent)", fontWeight: 500 }}>
          {window.COMPANY ? COMPANY.email : "info@credx.co.uk"}
        </a>
        {" · "}
        <a href={"tel:" + (window.COMPANY ? COMPANY.phone.replace(/\s/g, "") : "")} style={{ color: "var(--accent)", fontWeight: 500 }}>
          {window.COMPANY ? COMPANY.phone : "0204 628 0990"}
        </a>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// SIGN UP - 5-step investor onboarding
//   Step 1 · Your details          (account credentials)
//   Step 2 · Investor profile      (type, classification, capital, term)
//   Step 3 · KYC & identity        (ID type, address, SoF, GoIdentity intro)
//   Step 4 · Appropriateness test  (knowledge check, circumstances, acks)
//   Step 5 · Submitted             (next steps confirmation)
// ────────────────────────────────────────────────────────────────

const SIGNUP_STEPS = [
  { id: "details",   short: "Your details",       title: "Create your investor account",
    sub: "This local preview does not create an account or send your details to CredX." },
  { id: "profile",   short: "Investor profile",   title: "Tell us about your investment goals",
    sub: "These details help us match you to facilities that fit your strategy. Nothing is binding." },
  { id: "kyc",       short: "Identity & KYC",     title: "Identity & source of funds",
    sub: "Identity checks are not connected. Do not enter real identity or financial information." },
  { id: "risk",      short: "Appropriateness",    title: "Appropriateness assessment",
    sub: "An FCA-style appropriateness test in two short sections, followed by the risk acknowledgements. It takes most people five minutes." },
  { id: "twofa",     short: "2FA setup",          title: "Set up two-factor authentication",
    sub: "Required for every CredX account - protects your deal information from unauthorised access." },
  { id: "submitted", short: "Preview complete",    title: "Onboarding preview complete",
    sub: "No application was sent and no investor account was created. This prototype is not connected to registration or KYC services." },
];

function SignUpFlow({ switchToSignin, onWide }) {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState(() => ({
    firstName: "", lastName: "", email: "",
    phoneCountry: "GB", phoneNumber: "",
    password: "", confirm: "",
    investorType: "individual",
    classification: null,
    selfCertConfirmed: false,
    capitalRange: "50k-250k",
    targetReturn: "8-12",
    loanDuration: "any",
    enable2FA: true,
    twoFAMethod: "authenticator",
    twoFAPhone: "",
    twoFACode: "",
    idType: "passport",
    country: "GB",
    // UK address fields
    houseNumber: "", street: "", town: "", postcode: "",
    // Non-UK address fields
    addressLine1: "", addressLine2: "", city: "", region: "", postalCode: "",
    sourceOfFunds: "savings",
    ack1: false, ack2: false, ack3: false, ack4: false,
    // Appropriateness test (step 4)
    aptAnswers: {}, aptMarked: false, aptAttempts: 0, aptPassed: false, aptLocked: false,
    aptSuit: {}, aptSuitSubmitted: false,
  }));
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  // When investor type changes, the classification options shift between retail
  // and professional tiers. Reset classification so old selections don't leak.
  React.useEffect(() => {
    setForm(f => ({ ...f, classification: null, selfCertConfirmed: false }));
    // eslint-disable-next-line
  }, [form.investorType]);

  // Default ID type by jurisdiction (UK driving licence isn't a valid ID for
  // non-UK applicants in our GoIdentity flow).
  React.useEffect(() => {
    if (form.country !== "GB" && form.idType === "dvla") {
      setForm(f => ({ ...f, idType: "passport" }));
    }
    // eslint-disable-next-line
  }, [form.country]);

  const step = SIGNUP_STEPS[stepIdx];

  React.useEffect(() => { onWide && onWide(step.id === "risk"); }, [step.id]);

  // Validation per step
  const validateStep = () => {
    if (step.id === "details") {
      if (!form.firstName.trim() || !form.lastName.trim()) return "Enter your legal first and last name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   return "Enter a valid email address.";
      const ph = validatePhone(form.phoneCountry, form.phoneNumber);
      if (!ph.valid)                                          return ph.message;
      const pw = checkPassword(form.password, { name: (form.firstName + " " + form.lastName).trim(), email: form.email });
      if (!pw.allMet)                                       return "Your password doesn't meet all requirements yet.";
      if (form.password !== form.confirm)                   return "Passwords don't match.";
    }
    if (step.id === "profile") {
      if (!form.classification)                                return "Pick your investor classification.";
      const needsCert = ["sophisticated", "hnw"].includes(form.classification);
      if (needsCert && !form.selfCertConfirmed)                return "Confirm the classification self-certification statement.";
    }
    if (step.id === "kyc") {
      if (isHardBlocked(form.country)) {
        return "We cannot accept applications from " + countryName(form.country) + ". Please contact CredX directly to discuss options.";
      }
      if (form.country === "GB") {
        if (!form.houseNumber.trim() || !form.street.trim() || !form.town.trim() || !form.postcode.trim()) {
          return "Provide your full residential address - house number/name, street, town and postcode.";
        }
        if (!/^[A-Z0-9 ]{5,8}$/.test(form.postcode.trim().toUpperCase())) {
          return "Enter a valid UK postcode.";
        }
      } else {
        if (!form.addressLine1.trim() || !form.city.trim() || !form.postalCode.trim()) {
          return "Provide your address line, city/town and postal/ZIP code.";
        }
      }
    }
    if (step.id === "risk") {
      if (form.aptLocked)          return "You've used all three attempts in this preview. No retake email will be sent.";
      if (!form.aptPassed)         return "Complete section 1 - answer all three knowledge questions correctly to continue.";
      if (!form.aptSuitSubmitted)  return "Answer and submit all seven questions in section 2.";
      if (!(form.ack1 && form.ack2 && form.ack3 && form.ack4)) return "Tick all four acknowledgements to proceed.";
    }
    if (step.id === "twofa") {
      if (form.twoFAMethod === "sms" && !/^[+\d\s()-]{7,}$/.test(form.twoFAPhone || fullPhone(form.phoneCountry, form.phoneNumber))) {
        return "Enter the mobile number to receive SMS codes.";
      }
      if (!/^\d{6}$/.test(form.twoFACode)) {
        return "Enter six digits to continue the preview. The code is not verified.";
      }
    }
    return "";
  };

  const next = (e) => {
    e && e.preventDefault();
    const v = validateStep();
    if (v) { setErr(v); return; }
    setErr("");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStepIdx(i => Math.min(SIGNUP_STEPS.length - 1, i + 1));
    }, step.id === "twofa" ? 700 : 300);
  };

  const back = () => { setErr(""); setStepIdx(i => Math.max(0, i - 1)); };

  return (
    <>
      {/* Step progress */}
      <SignupProgress current={stepIdx} steps={SIGNUP_STEPS} />

      <h2 className="h-sect" style={{ marginBottom: 6 }}>{step.title}</h2>
      <p style={{ color: "var(--ink-3)", fontSize: 13.5, lineHeight: 1.55, margin: "0 0 22px" }}>
        {step.sub}
      </p>

      <form onSubmit={next} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {step.id === "details"   && <StepDetails   form={form} set={set} />}
        {step.id === "profile"   && <StepProfile   form={form} set={set} />}
        {step.id === "kyc"       && <StepKyc       form={form} set={set} />}
        {step.id === "risk"      && <AppropriatenessTest form={form} set={set} />}
        {step.id === "twofa"     && <StepTwoFA     form={form} set={set} />}
        {step.id === "submitted" && <StepSubmitted switchToSignin={switchToSignin} />}

        {err && <ErrorBanner message={err} />}

        {step.id !== "submitted" && (
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {stepIdx > 0
              ? <button type="button" className="btn" onClick={back}>Back</button>
              : <button type="button" className="btn" onClick={switchToSignin}>Sign in instead</button>
            }
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}
                    style={{ flex: 1, justifyContent: "center", opacity: busy ? 0.6 : 1 }}>
              {busy ? "Working…" : step.id === "twofa"
                ? <>Submit application <I.arrowRight /></>
                : step.id === "risk"
                ? <>Continue to 2FA setup <I.arrowRight /></>
                : <>Continue <I.arrowRight /></>}
            </button>
          </div>
        )}
      </form>
    </>
  );
}

function SignupProgress({ current, steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 22 }}>
      {steps.slice(0, 5).map((s, i) => (
        <React.Fragment key={s.id}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <div style={{
              height: 3,
              background: i < current ? "var(--accent)"
                       : i === current ? "var(--accent)"
                       : "var(--border)",
            }} />
            <span className="mono" style={{
              fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em",
              color: i <= current ? "var(--ink-2)" : "var(--ink-3)",
              textTransform: "uppercase",
            }}>
              0{i + 1} · {s.short}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Password strength checker ───────────────────────────────────
// Returns the per-rule pass/fail state, the count met, and overall valid.
function checkPassword(pw, { name = "", email = "" } = {}) {
  pw = pw || "";
  const lc = pw.toLowerCase();
  const localPart = (email || "").split("@")[0].toLowerCase();
  const nameTokens = (name || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length >= 3); // ignore initials and short particles

  const containsForbidden =
    (lc.includes("credx")) ||
    (localPart.length >= 3 && lc.includes(localPart)) ||
    nameTokens.some(t => lc.includes(t));

  const rules = [
    { key: "len",    label: "At least 12 characters",         met: pw.length >= 12 },
    { key: "upper",  label: "One uppercase letter (A-Z)",     met: /[A-Z]/.test(pw) },
    { key: "lower",  label: "One lowercase letter (a-z)",     met: /[a-z]/.test(pw) },
    { key: "num",    label: "One number (0-9)",               met: /\d/.test(pw) },
    { key: "sym",    label: "One special character (! @ # …)", met: /[^A-Za-z0-9]/.test(pw) },
    { key: "noid",   label: "No name, email or \"credx\"",     met: pw.length > 0 && !containsForbidden },
  ];
  const metCount = rules.filter(r => r.met).length;
  const allMet = rules.every(r => r.met);
  return { rules, metCount, allMet };
}

// ── STEP 1 · YOUR DETAILS ───────────────────────────────────────
function StepDetails({ form, set }) {
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const fullName = (form.firstName + " " + form.lastName).trim();
  const check = checkPassword(form.password, { name: fullName, email: form.email });

  // Strength tier: 0-3 → fill segments 1..4 progressively
  const tier =
    !form.password ? 0 :
    check.metCount <= 2 ? 1 :
    check.metCount <= 4 ? 2 :
    check.metCount === 5 ? 3 : 4;
  const tierLabel = ["", "Weak", "Fair", "Good", "Strong"][tier] || "";

  const confirmMatches = form.confirm.length > 0 && form.confirm === form.password;
  const confirmMismatch = form.confirm.length > 0 && form.confirm !== form.password;

  const eyeStyle = {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    background: "none", border: 0, padding: 4,
    color: "var(--ink-3)", cursor: "pointer",
    display: "inline-flex", alignItems: "center",
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>Legal first name</label>
          <input value={form.firstName} onChange={e => set({ firstName: e.target.value })} autoFocus />
        </div>
        <div className="field">
          <label>Legal last name</label>
          <input value={form.lastName} onChange={e => set({ lastName: e.target.value })} />
        </div>
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => set({ email: e.target.value })}
               placeholder="you@example.co.uk" />
        <div className="help">This preview does not send email or identity-verification invitations.</div>
      </div>
      <div className="field">
        <label>Phone</label>
        <PhoneInput
          countryIso={form.phoneCountry}
          nationalNumber={form.phoneNumber}
          onCountryChange={(c) => set({ phoneCountry: c })}
          onNumberChange={(n) => set({ phoneNumber: n })}
        />
      </div>

      {/* ── Password section ──────────────────────────────────── */}
      <div style={{
        marginTop: 4,
        padding: "16px 16px 14px",
        background: "var(--bg-sunk)",
        border: "1px solid var(--border)",
      }}>
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 12 }}>
          Choose a strong password. Your CredX account gives you access to confidential deal information.
        </div>

        <div className="field" style={{ marginBottom: 10 }}>
          <label htmlFor="su-pw">Create a password</label>
          <div style={{ position: "relative" }}>
            <input id="su-pw" type={showPw ? "text" : "password"}
                   value={form.password}
                   onChange={e => set({ password: e.target.value })}
                   autoComplete="new-password"
                   style={{ width: "100%", paddingRight: 38 }} />
            <button type="button" onClick={() => setShowPw(s => !s)} style={eyeStyle}
                    aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? <I.eyeOff /> : <I.eye />}
            </button>
          </div>
        </div>

        {/* Strength meter */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 12px" }}>
          <div style={{ display: "flex", gap: 4, flex: 1 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                flex: 1, height: 4,
                background: i <= tier
                  ? "linear-gradient(90deg, #1f3a8a 0%, #2d4fb8 100%)"
                  : "var(--border)",
                transition: "background .15s ease",
              }} />
            ))}
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
            color: tier === 4 ? "#1f3a8a" : "var(--ink-3)",
            minWidth: 44, textAlign: "right",
            fontFamily: "var(--ff-mono)",
          }}>{tierLabel || "-"}</span>
        </div>

        {/* Checklist */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Your password must include:</div>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
            {check.rules.map(r => (
              <li key={r.key} style={{
                display: "grid", gridTemplateColumns: "16px 1fr", gap: 8,
                alignItems: "center",
                fontSize: 12,
                color: r.met ? "#1f3a8a" : "var(--ink-3)",
              }}>
                {r.met ? (
                  <I.check style={{ color: "#1f3a8a", width: 14, height: 14 }} />
                ) : (
                  <span style={{
                    display: "inline-block", width: 6, height: 6,
                    background: "var(--ink-4)", borderRadius: "50%",
                    margin: "0 4px",
                  }} />
                )}
                <span style={{ lineHeight: 1.35 }}>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confirm password */}
        <div className="field" style={{ marginTop: 14, marginBottom: 0 }}>
          <label htmlFor="su-confirm">Confirm password</label>
          <div style={{ position: "relative" }}>
            <input id="su-confirm" type={showConfirm ? "text" : "password"}
                   value={form.confirm}
                   onChange={e => set({ confirm: e.target.value })}
                   autoComplete="new-password"
                   style={{
                     width: "100%", paddingRight: 64,
                     borderColor: confirmMismatch ? "var(--neg)" : confirmMatches ? "#1f3a8a" : undefined,
                   }} />
            {confirmMatches && (
              <I.check style={{
                position: "absolute", right: 38, top: "50%", transform: "translateY(-50%)",
                color: "#1f3a8a", width: 16, height: 16,
              }} />
            )}
            <button type="button" onClick={() => setShowConfirm(s => !s)} style={eyeStyle}
                    aria-label={showConfirm ? "Hide password" : "Show password"}>
              {showConfirm ? <I.eyeOff /> : <I.eye />}
            </button>
          </div>
          {confirmMismatch && (
            <div style={{
              fontSize: 11.5, color: "var(--neg)", marginTop: 4,
              opacity: 0.85,
            }}>Passwords don't match</div>
          )}
        </div>
      </div>

      {/* 2FA toggle */}
      <label style={{
        display: "grid", gridTemplateColumns: "20px 1fr", gap: 10,
        padding: 12,
        background: form.enable2FA ? "var(--accent-tint)" : "var(--bg)",
        border: "1px solid " + (form.enable2FA ? "var(--accent)" : "var(--border-2)"),
        cursor: "pointer",
        alignItems: "flex-start",
      }}>
        <input type="checkbox" checked={form.enable2FA}
               onChange={e => set({ enable2FA: e.target.checked })}
               style={{ width: 16, height: 16, marginTop: 1 }} />
        <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-2)" }}>
          <strong style={{ color: "var(--ink)" }}>Enable two-factor authentication</strong>
          <span style={{ color: "var(--accent-ink)", marginLeft: 6, fontWeight: 500 }}>· recommended</span>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>
            You'll set this up after the application is submitted. Authenticator app (TOTP) or SMS - both supported.
          </div>
        </span>
      </label>
    </>
  );
}

// ── STEP 2 · INVESTOR PROFILE ───────────────────────────────────

// Retail self-certification classes (for individuals / family offices /
// most companies). FCA COBS-style statements; CredX accepts both.
const RETAIL_CLASSES = {
  sophisticated: {
    label: "Self-Certified Sophisticated Investor",
    hint: "You meet at least one of: a director of a £1m+ turnover company; involved in 2+ unlisted-securities investments in the last two years; member of a network/syndicate of business angels for 6+ months; worked in a professional capacity in private equity/SME finance for at least two years.",
    statement: "I declare I am a self-certified sophisticated investor and accept I won't have the protections of the FCA's regulated regime."
  },
  hnw: {
    label: "High Net Worth Individual",
    hint: "Annual income £100,000+ or net assets of £250,000+ (excluding primary residence, pension, life cover).",
    statement: "I declare I am a certified high net worth individual and accept I won't have the protections of the FCA's regulated regime."
  },
};

// Professional / institutional tiers per FCA COBS 3. No self-certification -
// CredX confirms categorisation during onboarding using firm-level evidence
// (audited accounts, AUM, regulatory status, board minutes etc.).
const PROFESSIONAL_CLASSES = {
  professional_per_se: {
    label: "Professional Client (per se)",
    hint: "Entities required to be authorised or regulated to operate in financial markets - credit institutions, MiFID firms, insurers, UCITS, pension funds, large undertakings meeting two of: balance sheet €20m, turnover €40m, own funds €2m.",
  },
  elective_professional: {
    label: "Elective Professional Client",
    hint: "An entity that has opted up after meeting the qualitative test (sufficient experience, knowledge and expertise) and at least two of: 10+ relevant transactions per quarter in the last year; portfolio > €500,000; one year's professional financial-sector experience.",
  },
  eligible_counterparty: {
    label: "Eligible Counterparty",
    hint: "Per-se ECPs include investment firms, credit institutions, insurance undertakings, UCITS and their management companies, pension funds, governments, central banks and supranational organisations.",
  },
};

function StepProfile({ form, set }) {
  const radio = (current, target, label, hint, onClick) => (
    <button type="button" onClick={onClick}
      style={{
        display: "block", textAlign: "left",
        padding: "12px 14px",
        border: "1px solid " + (current === target ? "var(--accent)" : "var(--border-2)"),
        background: current === target ? "var(--accent-tint)" : "var(--bg)",
        color: current === target ? "var(--accent-ink)" : "var(--ink-2)",
        cursor: "pointer", width: "100%",
      }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4 }}>{hint}</div>}
    </button>
  );

  // Investor-type → which classifications to surface
  // Individual & Family Office → retail only
  // Limited Company           → retail + elective_professional
  // Institutional             → professional tiers, no self-cert
  let classOptions, isProfessionalSection;
  if (form.investorType === "institutional") {
    classOptions = Object.entries(PROFESSIONAL_CLASSES);
    isProfessionalSection = true;
  } else if (form.investorType === "company") {
    classOptions = [
      ...Object.entries(RETAIL_CLASSES),
      ["elective_professional", PROFESSIONAL_CLASSES.elective_professional],
    ];
    isProfessionalSection = false;
  } else {
    classOptions = Object.entries(RETAIL_CLASSES);
    isProfessionalSection = false;
  }

  const cls = form.classification && (RETAIL_CLASSES[form.classification] || PROFESSIONAL_CLASSES[form.classification]);
  const isProfessionalChoice = form.classification && PROFESSIONAL_CLASSES[form.classification];

  return (
    <>
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8, display: "block" }}>
          Investor type
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["individual",   "Individual",       "Personal capital"],
            ["company",      "Limited company",  "UK-registered"],
            ["family-office","Family office",    "Discretionary mandate"],
            ["institutional","Institutional",    "Fund or pension"],
          ].map(([k, l, h]) => radio(form.investorType, k, l, h, () => set({ investorType: k })))}
        </div>
      </div>

      <div style={{ marginTop: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8, display: "block" }}>
          {isProfessionalSection
            ? <>Client categorisation <span style={{ color: "var(--ink-3)", fontWeight: 500, letterSpacing: 0, textTransform: "none" }}>· FCA COBS 3</span></>
            : <>Investor classification <span style={{ color: "var(--neg)" }}>· required for unregulated lending</span></>
          }
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {classOptions.map(([k, c]) =>
            radio(form.classification, k, c.label, c.hint, () => set({ classification: k, selfCertConfirmed: false }))
          )}
        </div>
        {!isProfessionalSection && form.investorType !== "company" && (
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.5 }}>
            CredX only opens accounts for Sophisticated or High Net Worth investors. We do not accept Restricted Investors.
          </div>
        )}
      </div>

      {/* Conditional self-cert OR institutional note */}
      {cls && !isProfessionalChoice && (
        <label style={{
          display: "grid", gridTemplateColumns: "20px 1fr", gap: 10,
          padding: 12,
          background: form.selfCertConfirmed ? "var(--accent-tint)" : "var(--bg-sunk)",
          border: "1px solid " + (form.selfCertConfirmed ? "var(--accent)" : "var(--border)"),
          cursor: "pointer",
          alignItems: "flex-start",
        }}>
          <input type="checkbox" checked={form.selfCertConfirmed}
                 onChange={e => set({ selfCertConfirmed: e.target.checked })}
                 style={{ width: 16, height: 16, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-2)" }}>
            <strong style={{ color: "var(--ink)" }}>Self-certification.</strong> {cls.statement}
          </span>
        </label>
      )}
      {isProfessionalChoice && (
        <div style={{
          padding: 12,
          background: "var(--bg-sunk)",
          borderLeft: "3px solid var(--accent)",
          fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-2)",
        }}>
          Client categorisation will be confirmed by CredX during onboarding in line with FCA COBS 3. We'll request supporting evidence (regulatory status, audited accounts, AUM or board minutes) once your account is opened.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>Initial capital range</label>
          <select value={form.capitalRange} onChange={e => set({ capitalRange: e.target.value })}>
            <option value="30k-100k">£30,000 - £100,000</option>
            <option value="50k-250k">£50,000 - £250,000</option>
            <option value="250k-500k">£250,000 - £500,000</option>
            <option value="500k-750k">£500,000 - £750,000</option>
            <option value="750k+">£750,000+</option>
          </select>
        </div>
        <div className="field">
          <label>Target net return (p.a.)</label>
          <select value={form.targetReturn} onChange={e => set({ targetReturn: e.target.value })}>
            <option value="6-8">6 - 8%</option>
            <option value="8-12">8 - 12%</option>
            <option value="12+">12%+</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>Preferred loan duration</label>
        <select value={form.loanDuration} onChange={e => set({ loanDuration: e.target.value })}>
          <option value="3-6">3 - 6 months</option>
          <option value="6-12">6 - 12 months</option>
          <option value="12-24">12 - 24 months</option>
          <option value="any">No preference</option>
        </select>
      </div>
    </>
  );
}

// ── Searchable country select ───────────────────────────────────
function CountrySelect({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const id = setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", onDoc); };
  }, [open]);

  const filtered = query
    ? COUNTRIES.filter(([code, name]) => name.toLowerCase().includes(query.toLowerCase()) || code.toLowerCase() === query.toLowerCase())
    : COUNTRIES;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => { setOpen(o => !o); setQuery(""); }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          width: "100%",
          background: "var(--bg)",
          border: "1px solid var(--border-2)",
          padding: "10px 12px",
          fontSize: 14, color: "var(--ink)",
          cursor: "pointer",
        }}>
        <span>
          <span className="mono" style={{ color: "var(--ink-3)", marginRight: 8, fontSize: 11 }}>{value}</span>
          {countryName(value)}
        </span>
        <I.chevron style={{ transform: open ? "rotate(-90deg)" : "rotate(90deg)", color: "var(--ink-3)" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute",
          top: "100%", left: 0, right: 0,
          marginTop: 4,
          background: "var(--bg-elev)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 28px rgba(14,20,24,.12)",
          zIndex: 50,
        }}>
          <div style={{ padding: 8, borderBottom: "1px solid var(--border)" }}>
            <input
              autoFocus
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search countries…"
              style={{
                width: "100%",
                border: "1px solid var(--border-2)",
                background: "var(--bg)",
                padding: "6px 10px",
                fontSize: 13,
                outline: 0,
              }}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filtered.map(([code, name]) => {
              const blocked = isHardBlocked(code);
              const highRisk = isHighRisk(code);
              return (
                <button key={code} type="button"
                  onClick={() => { onChange(code); setOpen(false); }}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    width: "100%", textAlign: "left",
                    padding: "8px 12px",
                    background: value === code ? "var(--accent-tint)" : "transparent",
                    color: "var(--ink-2)",
                    fontSize: 13,
                    cursor: "pointer",
                    borderTop: "1px solid var(--border)",
                  }}
                  onMouseEnter={e => { if (value !== code) e.currentTarget.style.background = "var(--bg-sunk)"; }}
                  onMouseLeave={e => { if (value !== code) e.currentTarget.style.background = "transparent"; }}>
                  <span>
                    <span className="mono" style={{ color: "var(--ink-3)", marginRight: 8, fontSize: 11 }}>{code}</span>
                    {name}
                  </span>
                  {blocked && <span className="tag" style={{ background: "var(--neg-tint)", color: "var(--neg)", borderColor: "transparent", fontSize: 10 }}>Restricted</span>}
                  {highRisk && !blocked && <span className="tag" style={{ background: "var(--warn-tint)", color: "var(--warn)", borderColor: "transparent", fontSize: 10 }}>EDD</span>}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", color: "var(--ink-3)", fontSize: 12 }}>
                No countries match "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── STEP 3 · KYC ────────────────────────────────────────────────
function StepKyc({ form, set }) {
  const [pcLookup, setPcLookup] = React.useState("");
  const [pcResults, setPcResults] = React.useState(null);
  const [pcLoading, setPcLoading] = React.useState(false);
  const [pcError, setPcError] = React.useState("");

  const isUK    = form.country === "GB";
  const blocked = isHardBlocked(form.country);
  const eddFlag = isHighRisk(form.country);

  // Mock postcode finder - production hits Loqate / getAddress.io.
  const lookupPostcode = (raw) => {
    const pc = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z]{1,2}\d/.test(pc)) {
      setPcError("Enter a UK postcode (e.g. TN13 1QQ)."); setPcResults(null); return;
    }
    setPcError(""); setPcLoading(true); setPcResults(null);
    setTimeout(() => {
      const dataset = {
        "TN13": [
          { hn: "17", street: "Westfield Court",       town: "Sevenoaks",       postcode: "TN13 1QQ" },
          { hn: "42", street: "High Street",           town: "Sevenoaks",       postcode: "TN13 1JF" },
          { hn: "8",  street: "Mount Pleasant",        town: "Sevenoaks",       postcode: "TN13 1NU" },
          { hn: "63", street: "London Road",           town: "Sevenoaks",       postcode: "TN13 1AS" },
        ],
        "TN1":  [
          { hn: "12", street: "Mount Ephraim",         town: "Tunbridge Wells", postcode: "TN1 1ED" },
          { hn: "5a", street: "Calverley Road",        town: "Tunbridge Wells", postcode: "TN1 2UE" },
        ],
        "ME10": [
          { hn: "Suite F16", street: "St George's Business Park, Castle Road", town: "Sittingbourne", postcode: "ME10 3TB" },
          { hn: "22", street: "East Street",           town: "Sittingbourne",   postcode: "ME10 4RT" },
        ],
        "ME7":  [
          { hn: "17", street: "Nelson Road",           town: "Gillingham",      postcode: "ME7 4LH" },
          { hn: "84", street: "Canterbury Street",     town: "Gillingham",      postcode: "ME7 5TX" },
        ],
        "CT1":  [
          { hn: "5",  street: "Castle Street",         town: "Canterbury",      postcode: "CT1 2QH" },
          { hn: "31", street: "Watling Street",        town: "Canterbury",      postcode: "CT1 2UD" },
        ],
        "CT5":  [
          { hn: "12", street: "Harbour Street",        town: "Whitstable",      postcode: "CT5 1AG" },
          { hn: "44", street: "Beach Walk",            town: "Whitstable",      postcode: "CT5 2BP" },
        ],
      };
      const outward = pc.match(/^[A-Z]{1,2}\d{1,2}/)?.[0];
      const list = dataset[outward];
      setPcLoading(false);
      if (list && list.length) {
        setPcResults(list);
      } else {
        const display = pc.length > 3 ? pc.slice(0, -3) + " " + pc.slice(-3) : pc;
        setPcResults([
          { hn: "1",  street: "High Street",  town: "Town",  postcode: display, _synthetic: true },
          { hn: "2",  street: "High Street",  town: "Town",  postcode: display, _synthetic: true },
          { hn: "12", street: "Market Road",  town: "Town",  postcode: display, _synthetic: true },
        ]);
      }
    }, 280);
  };

  const pickAddress = (a) => {
    set({ houseNumber: a.hn, street: a.street, town: a.town, postcode: a.postcode });
    setPcResults(null);
  };

  // ID type options - UK driving licence only offered when UK is selected
  const idOptions = isUK
    ? [
        ["passport", "UK or international passport"],
        ["dvla",     "UK driving licence (photocard)"],
      ]
    : [
        ["passport", "International passport"],
      ];

  return (
    <>
      <div style={{
        padding: "12px 14px",
        background: "var(--accent-tint)",
        borderLeft: "3px solid var(--accent)",
        fontSize: 12.5, color: "var(--accent-ink)", lineHeight: 1.55,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, marginBottom: 4 }}>
          <I.lock /> Identity verification preview
        </div>
        GoIdentity is not connected. This preview does not transmit identity documents, send SMS messages or request a compliance review.
      </div>

      {/* Country first - drives everything else on this step */}
      <div className="field">
        <label>Country of residence</label>
        <CountrySelect value={form.country} onChange={(code) => set({ country: code })} />
        <div className="help">
          Country-specific due diligence is not evaluated by this preview.
        </div>
      </div>

      {blocked && (
        <div style={{
          padding: "14px 16px",
          background: "var(--neg-tint)",
          borderLeft: "3px solid var(--neg)",
          color: "var(--neg)",
          fontSize: 13, lineHeight: 1.55,
        }}>
          <strong style={{ display: "block", marginBottom: 4 }}>We can't accept applications from {countryName(form.country)}</strong>
          This jurisdiction is on the UK sanctions list. Please contact CredX directly at{" "}
          <a href={"mailto:" + (window.COMPANY ? COMPANY.email : "info@credx.co.uk")}
             style={{ color: "var(--neg)", fontWeight: 600, textDecoration: "underline" }}>
            {window.COMPANY ? COMPANY.email : "info@credx.co.uk"}
          </a>{" "}to discuss options.
        </div>
      )}

      {eddFlag && !blocked && (
        <div style={{
          padding: "12px 14px",
          background: "var(--warn-tint)",
          borderLeft: "3px solid var(--warn)",
          color: "var(--ink-2)",
          fontSize: 12.5, lineHeight: 1.55,
        }}>
          <strong style={{ color: "var(--warn)", display: "block", marginBottom: 2 }}>Manual review required</strong>
          This preview does not submit applications or route cases for compliance review.
        </div>
      )}

      <div className="field">
        <label>ID document you'll scan on your phone</label>
        <select value={form.idType} onChange={e => set({ idType: e.target.value })}>
          {idOptions.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>

      {/* Address ────────────────────────────────────────────────────── */}
      <div>
        <label style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--ink-3)",
          marginBottom: 8, display: "block",
        }}>Residential address</label>

        {isUK ? (
          <>
            {/* UK postcode finder */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto", gap: 8,
              padding: 12,
              background: "var(--bg-sunk)",
              border: "1px solid var(--border)",
              marginBottom: 12,
            }}>
              <input
                type="text"
                value={pcLookup}
                onChange={e => { setPcLookup(e.target.value); setPcError(""); }}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); lookupPostcode(pcLookup); } }}
                placeholder="Find by postcode (e.g. TN13 1QQ)"
                style={{
                  border: "1px solid var(--border-2)",
                  background: "var(--bg)",
                  padding: "8px 12px",
                  fontSize: 13,
                  outline: 0,
                }}
              />
              <button type="button" className="btn btn-sm"
                      onClick={() => lookupPostcode(pcLookup)}
                      disabled={pcLoading}>
                {pcLoading ? "Looking…" : <><I.search /> Find</>}
              </button>

              {pcError && (
                <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "var(--neg)" }}>{pcError}</div>
              )}

              {pcResults && (
                <div style={{
                  gridColumn: "1 / -1",
                  border: "1px solid var(--border)",
                  background: "var(--bg-elev)",
                  maxHeight: 180,
                  overflowY: "auto",
                }}>
                  {pcResults.map((a, i) => (
                    <button key={i} type="button"
                      onClick={() => pickAddress(a)}
                      style={{
                        display: "block", textAlign: "left", width: "100%",
                        padding: "8px 12px",
                        borderTop: i > 0 ? "1px solid var(--border)" : "0",
                        background: "transparent",
                        fontSize: 13, color: "var(--ink-2)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-sunk)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ color: "var(--ink)" }}>{a.hn} {a.street}</span>
                      <span style={{ color: "var(--ink-3)" }}> · {a.town}, {a.postcode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <div className="field">
                <label>House number / name</label>
                <input value={form.houseNumber} onChange={e => set({ houseNumber: e.target.value })} placeholder="e.g. 17" />
              </div>
              <div className="field">
                <label>Street</label>
                <input value={form.street} onChange={e => set({ street: e.target.value })} placeholder="e.g. Westfield Court" />
              </div>
              <div className="field">
                <label>Town</label>
                <input value={form.town} onChange={e => set({ town: e.target.value })} placeholder="e.g. Sevenoaks" />
              </div>
              <div className="field">
                <label>Postcode</label>
                <input value={form.postcode} onChange={e => set({ postcode: e.target.value.toUpperCase() })} placeholder="e.g. TN13 1QQ" />
              </div>
            </div>
          </>
        ) : (
          // Generic international address fields
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Address line 1</label>
              <input value={form.addressLine1} onChange={e => set({ addressLine1: e.target.value })}
                     placeholder="Street address, building number" />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Address line 2 <span style={{ color: "var(--ink-3)", letterSpacing: 0, fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
              <input value={form.addressLine2} onChange={e => set({ addressLine2: e.target.value })}
                     placeholder="Apartment, suite, unit, etc." />
            </div>
            <div className="field">
              <label>City / town</label>
              <input value={form.city} onChange={e => set({ city: e.target.value })} />
            </div>
            <div className="field">
              <label>State / region / province <span style={{ color: "var(--ink-3)", letterSpacing: 0, fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
              <input value={form.region} onChange={e => set({ region: e.target.value })} />
            </div>
            <div className="field">
              <label>Postal / ZIP code</label>
              <input value={form.postalCode} onChange={e => set({ postalCode: e.target.value.toUpperCase() })} />
            </div>
          </div>
        )}
      </div>

      <div className="field">
        <label>Primary source of funds</label>
        <select value={form.sourceOfFunds} onChange={e => set({ sourceOfFunds: e.target.value })}>
          <option value="savings">Personal savings</option>
          <option value="employment">Employment / professional income</option>
          <option value="business">Business sale or trading profits</option>
          <option value="overseas-business">Overseas business interests</option>
          <option value="property">Sale of property</option>
          <option value="inheritance">Inheritance / gift</option>
          <option value="pension">Pension / retirement provision</option>
          <option value="other">Other (we'll ask for detail)</option>
        </select>
        <div className="help">
          This preview does not request, upload or store supporting documents.
        </div>
      </div>
    </>
  );
}

// Step 4 (appropriateness test + acknowledgements) lives in src/apt.jsx.

// ── STEP 5 · 2FA SETUP ──────────────────────────────────────────
function StepTwoFA({ form, set }) {
  // A demo TOTP secret + QR placeholder. In production this is generated
  // server-side and presented as a real authenticator-compatible secret.
  const secret = React.useMemo(
    () => Array.from({ length: 16 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join(""),
    []
  );
  const phoneForCode = form.twoFAPhone || fullPhone(form.phoneCountry, form.phoneNumber);

  // Build a stylised QR placeholder (we don't render a real QR - that would
  // require a library or backend round-trip). It's enough to communicate the
  // step visually; the real implementation slots in a server-generated QR.
  const QrPlaceholder = () => (
    <div style={{
      width: 156, height: 156,
      background: "var(--bg-elev)",
      border: "1px solid var(--border-2)",
      padding: 8,
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gridTemplateRows: "repeat(12, 1fr)",
      gap: 1,
    }}>
      {Array.from({ length: 144 }).map((_, i) => {
        const on = (i * 7919 + 3) % 100 > 38;
        // corner markers
        const row = Math.floor(i / 12), col = i % 12;
        const isCorner = (row < 3 && col < 3) || (row < 3 && col > 8) || (row > 8 && col < 3);
        return <div key={i} style={{ background: on || isCorner ? "var(--ink)" : "transparent" }} />;
      })}
    </div>
  );

  return (
    <>
      <div style={{
        padding: "12px 14px",
        background: "var(--accent-tint)",
        borderLeft: "3px solid var(--accent)",
        fontSize: 12.5, color: "var(--accent-ink)", lineHeight: 1.55,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, marginBottom: 4 }}>
          <I.lock /> Two-factor authentication
        </div>
        MFA enrollment is not connected. The authenticator and SMS options below are visual examples only.
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8, display: "block" }}>
          Method
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["authenticator", "Authenticator app", "1Password, Google Authenticator, Authy etc."],
            ["sms",           "SMS",                "6-digit code by text message"],
          ].map(([k, l, h]) => (
            <button key={k} type="button"
              onClick={() => set({ twoFAMethod: k, twoFACode: "" })}
              style={{
                display: "block", textAlign: "left",
                padding: "12px 14px",
                border: "1px solid " + (form.twoFAMethod === k ? "var(--accent)" : "var(--border-2)"),
                background: form.twoFAMethod === k ? "var(--accent-tint)" : "var(--bg)",
                color: form.twoFAMethod === k ? "var(--accent-ink)" : "var(--ink-2)",
                cursor: "pointer",
              }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{l}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4 }}>{h}</div>
            </button>
          ))}
        </div>
      </div>

      {form.twoFAMethod === "authenticator" && (
        <div style={{
          display: "grid", gridTemplateColumns: "auto 1fr", gap: 20,
          padding: 16,
          border: "1px solid var(--border)",
          background: "var(--bg-elev)",
          alignItems: "center",
        }}>
          <QrPlaceholder />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Scan with your authenticator app</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, marginBottom: 10 }}>
              Or enter this key manually:
            </div>
            <div className="mono" style={{
              padding: "8px 12px",
              border: "1px dashed var(--border-2)",
              background: "var(--bg)",
              fontSize: 13,
              letterSpacing: "0.06em",
              wordBreak: "break-all",
            }}>{secret.match(/.{1,4}/g).join(" ")}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8 }}>
              Issuer: CredX · Account: {form.email || "your-email@example.com"}
            </div>
          </div>
        </div>
      )}

      {form.twoFAMethod === "sms" && (
        <>
          <div className="field">
            <label>Mobile number for SMS codes</label>
            <input type="tel"
                   value={form.twoFAPhone || fullPhone(form.phoneCountry, form.phoneNumber)}
                   onChange={e => set({ twoFAPhone: e.target.value })}
                   placeholder="+44 7700 900000" />
            <div className="help">No SMS message will be sent in this preview.</div>
          </div>
          <div style={{
            padding: "10px 14px",
            background: "var(--bg-sunk)",
            border: "1px dashed var(--border-2)",
            fontSize: 12, color: "var(--ink-3)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>No verification code was sent.</span>
          </div>
        </>
      )}

      <div className="field">
        <label>Enter the 6-digit verification code</label>
        <input type="text" inputMode="numeric" maxLength={6}
               value={form.twoFACode}
               onChange={e => set({ twoFACode: e.target.value.replace(/\D/g, "") })}
               placeholder="000000"
               className="mono"
               style={{ fontSize: 22, letterSpacing: "0.4em", textAlign: "center" }} />
        <div className="help">
          The six-digit value is only a form check; the API does not verify it or enable MFA.
        </div>
      </div>
    </>
  );
}

// ── STEP 6 · SUBMITTED ──────────────────────────────────────────
function StepSubmitted({ switchToSignin }) {
  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{
        width: 56, height: 56,
        background: "var(--accent-tint)", color: "var(--accent-ink)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        <I.check style={{ width: 24, height: 24 }} />
      </div>
      <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 18px", maxWidth: "44ch" }}>
        This is the end of the onboarding preview. No application was submitted and no investor account was created.
      </p>
      <div style={{
        padding: "12px 14px",
        background: "var(--bg-sunk)",
        border: "1px solid var(--border)",
        fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55,
        marginBottom: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
          <I.lock style={{ width: 14, height: 14 }} /> No data was sent
        </div>
        Your entries were held only in this page's memory and were not sent to an API or stored in browser storage.
      </div>
      <button type="button" className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={switchToSignin}>
        Return to sign in <I.arrowRight />
      </button>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
        Your entries were only held temporarily in this page and were not submitted.
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div style={{
      padding: "10px 12px",
      background: "var(--neg-tint)",
      borderLeft: "3px solid var(--neg)",
      color: "var(--neg)",
      fontSize: 12.5,
      lineHeight: 1.45,
    }}>{message}</div>
  );
}

Object.assign(window, { useAuth, AuthScreen });
