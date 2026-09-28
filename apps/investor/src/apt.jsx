// ────────────────────────────────────────────────────────────────
// APPROPRIATENESS TEST (APT)
// Sign-up step 4. Two sections:
//   Section 1 · Knowledge check      8 marked questions, 3 attempts
//   Section 2 · Your circumstances   7 yes/no questions
// Plus the prescribed risk warning and the Investor Knowledge Guide
// it links to (src/apt-guide.jsx).
// ────────────────────────────────────────────────────────────────

const APT_KNOWLEDGE = [
  { id: "q1", multi: false,
    prompt: "When you invest through CredX, what are you actually doing?",
    hint: "Consider the relationship your capital creates.",
    options: [
      { t: "Buying shares in CredX and sharing in its profits.", ok: false },
      { t: "Making a deposit that CredX safeguards like a bank account.", ok: false },
      { t: "Lending capital towards a property loan in return for fixed interest over a set term.", ok: true },
      { t: "Buying the property itself as a part-owner.", ok: false },
    ],
    whyOk: "You lend towards a specific loan and earn fixed interest. You are a lender, not a shareholder or depositor.",
    whyNo: "You are lending towards a property loan for fixed interest, not buying shares, making a deposit, or owning the property." },

  { id: "q2", multi: false,
    prompt: "Which statement about protection is true for CredX lending?",
    hint: "CredX lending is unregulated.",
    options: [
      { t: "My capital is protected by the FSCS up to the standard limit.", ok: false },
      { t: "My capital is not covered by the FSCS, and I cannot claim compensation if a loan is not repaid.", ok: true },
      { t: "CredX guarantees my capital and interest in all circumstances.", ok: false },
      { t: "The Government backs my investment up to a fixed sum each year.", ok: false },
    ],
    whyOk: "There is no FSCS cover and no compensation scheme. Recovery depends on the borrower and the security.",
    whyNo: "CredX lending is unregulated. There is no FSCS cover, no Government backing, and no guarantee of your capital." },

  { id: "q3", multi: false,
    prompt: "How is a typical CredX loan secured?",
    hint: "It is the same mechanism a mortgage uses.",
    options: [
      { t: "By a legal charge registered against the borrower's property.", ok: true },
      { t: "By an insurance policy that repays investors automatically on default.", ok: false },
      { t: "By CredX holding the funds in a protected client account.", ok: false },
      { t: "It is unsecured; repayment relies only on the borrower's promise.", ok: false },
    ],
    whyOk: "A legal charge over the property gives the lender an enforceable right to recover from a sale.",
    whyNo: "CredX loans are secured by a legal charge over the property, not by insurance, a client account, or nothing at all." },

  { id: "q4", multi: false,
    prompt: "A loan is secured by a first legal charge. What does that guarantee?",
    hint: "First describes position, not certainty.",
    options: [
      { t: "That I am guaranteed to receive all of my capital back.", ok: false },
      { t: "Nothing at all; a first charge is no better than a second.", ok: false },
      { t: "That I rank first on a sale, though I may still fall short if the property sells for less than the debt.", ok: true },
      { t: "That the Government will cover any shortfall.", ok: false },
    ],
    whyOk: "A first charge ranks ahead of others, but recovery still depends on the sale value. It is not a guarantee.",
    whyNo: "A first charge puts you first in line on a sale but does not guarantee full repayment. If the property sells for less than the debt, even a first charge can fall short." },

  { id: "q5", multi: false,
    prompt: "You want to reduce the impact of any single loan performing poorly. Who is responsible for spreading your capital across loans?",
    hint: "CredX does not do this for you.",
    options: [
      { t: "CredX automatically diversifies every investor's capital across many loans.", ok: false },
      { t: "I am. I choose how much to place and how to spread it across opportunities.", ok: true },
      { t: "The borrower decides how my capital is split.", ok: false },
      { t: "Diversification is not possible with CredX.", ok: false },
    ],
    whyOk: "There is no automatic diversification. How you spread your exposure is your decision.",
    whyNo: "CredX does not diversify your capital. To reduce single-loan impact, you decide how to spread it." },

  { id: "q6", multi: false,
    prompt: "How readily can you access your capital before a loan reaches its exit?",
    hint: "Consider liquidity and the loan term.",
    options: [
      { t: "Instantly, I can withdraw at any time like a savings account.", ok: false },
      { t: "There is a recognised market where I can always sell quickly.", ok: false },
      { t: "My capital is committed for the term; there is no active market and early exit is not guaranteed.", ok: true },
      { t: "CredX must buy my investment back on request.", ok: false },
    ],
    whyOk: "The investment is illiquid, committed for the term, with no guaranteed early exit.",
    whyNo: "Your capital is committed for the loan term. There is no recognised market to sell it, and exiting early is not guaranteed." },

  { id: "q7", multi: false,
    prompt: "Bridging loans carry a higher interest rate than a mainstream mortgage. Why?",
    hint: "The rate reflects something about the loan.",
    options: [
      { t: "Because a higher rate makes the loan safer for investors.", ok: false },
      { t: "Because the higher rate reflects higher risk and the short-term, flexible nature of the loan.", ok: true },
      { t: "Because CredX is required by regulation to charge more.", ok: false },
      { t: "Because the rate is guaranteed by the property's future value.", ok: false },
    ],
    whyOk: "The higher rate is compensation for higher risk and short duration, not a sign of extra safety.",
    whyNo: "A higher rate reflects higher risk and the speed and flexibility of short-term lending. It does not make a loan safer." },

  { id: "q8", multi: true,
    prompt: "Select the TWO statements that are true about the risks of lending through CredX.",
    hint: "Choose two.",
    options: [
      { t: "During a loan, a property's value can fall so that the loan exceeds the value of the property securing it.", ok: true },
      { t: "My capital is always earning a return, even between investments.", ok: false },
      { t: "If CredX became insolvent, an insolvency practitioner would ordinarily seek to recover outstanding loans for investors, but this is a process, not a guaranteed backstop.", ok: true },
      { t: "CredX gives me personal investment advice tailored to my circumstances.", ok: false },
    ],
    whyOk: "Values can fall below the loan, and on insolvency recovery is a process rather than a guarantee.",
    whyNo: "The two true statements: values can fall below the loan, and on CredX insolvency a practitioner would aim to recover loans (a process, not a guarantee). Your capital is not always earning, and CredX does not give personal advice." },
];

const APT_SUITABILITY = [
  { id: "s1", q: "Do you consider yourself experienced in lending against property or investing in unlisted securities? For example, have you committed a meaningful sum on at least two occasions and seen how those investments performed over six months or more?", want: "yes" },
  { id: "s2", q: "If you lost your capital on a small number of investments, could you still afford your current standard of living?", want: "yes" },
  { id: "s3", q: "Are you prepared to commit capital to facilities with an estimated term of 6 to 24 months, knowing that an early exit is not guaranteed?", want: "yes" },
  { id: "s4", q: "CredX facilities are categorised as high risk. Are you willing to take that level of risk in order to seek the returns on offer?", want: "yes" },
  { id: "s5", q: "Have you experienced, or do you expect, an event that could make your financial position unstable (for example divorce, redundancy or the loss of an asset)?", want: "no" },
  { id: "s6", q: "Do you feel under any pressure to invest at this time?", want: "no" },
  { id: "s7", q: "Is there anything else we ought to know that might affect whether this investment is appropriate for you?", want: "no" },
];

const APT_ACKS = [
  ["ack1", "Capital is at risk",
    "I understand that the value of my investment can fall as well as rise, that returns are not guaranteed, and that I could lose some or all of my capital."],
  ["ack2", "Loans are unregulated",
    "I understand CredX Ltd is not authorised or regulated by the Financial Conduct Authority. The loans I fund are unregulated short-term bridging loans for business purposes."],
  ["ack3", "Independent advice",
    "I confirm I have either taken independent legal and financial advice or made a conscious decision not to. CredX does not provide investment advice."],
  ["ack4", "Funds via solicitor only",
    "I understand my capital is transferred directly to the appointed solicitor's client account on the day of completion and that CredX never holds Funder capital."],
];

// ── Prescribed risk warning + link to the guide ──────────────────
function RiskWarningBanner({ onLearnMore }) {
  return (
    <div style={{
      border: "1px solid var(--ink)", padding: "14px 18px", textAlign: "center",
      fontSize: 12.5, lineHeight: 1.55, color: "var(--ink)", background: "var(--bg)",
    }}>
      Don't invest unless you're prepared to lose all the money you invest. This is a high-risk
      investment and you are unlikely to be protected if something goes wrong.{" "}
      <button type="button" onClick={onLearnMore} style={{
        display: "inline", background: "none", border: 0, padding: 0, margin: 0,
        font: "inherit", lineHeight: "inherit",
        color: "var(--ink)", textDecoration: "underline", cursor: "pointer",
      }}>Take 2 mins to learn more.</button>
    </div>
  );
}

// ── Shared bits ─────────────────────────────────────────────────
function AptSectionRule({ label }) {
  return (
    <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
      <div className="mono" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>{label}</div>
      <div style={{ width: 44, height: 2, background: "var(--accent)", margin: "8px auto 0" }} />
    </div>
  );
}

function AptBanner({ tone, title, body }) {
  const c = tone === "pass" ? { bg: "var(--pos-tint)", bd: "var(--pos)" }
          : tone === "fail" ? { bg: "var(--neg-tint)", bd: "var(--neg)" }
          : { bg: "var(--warn-tint)", bd: "var(--warn)" };
  return (
    <div style={{ background: c.bg, borderLeft: "3px solid " + c.bd, padding: "13px 16px", color: "var(--ink)" }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: body ? 5 : 0 }}>{title}</div>
      {body && <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-2)" }}>{body}</div>}
    </div>
  );
}

// ── Section 1 · knowledge check ─────────────────────────────────
function KnowledgeSection({ form, set, onPassed }) {
  const answers = form.aptAnswers || {};
  const marked = !!form.aptMarked;
  const attempts = form.aptAttempts || 0;
  const locked = !!form.aptLocked;
  const [nudge, setNudge] = React.useState(null);

  const wanted = (q) => q.options.map((o, i) => o.ok ? i : -1).filter(i => i >= 0);
  const isCorrect = (q) => {
    const picked = [...(answers[q.id] || [])].sort();
    const want = wanted(q).sort();
    return picked.length === want.length && want.every((v, i) => v === picked[i]);
  };
  const isAnswered = (q) => {
    const picked = answers[q.id] || [];
    return q.multi ? picked.length === wanted(q).length : picked.length === 1;
  };
  const answeredCount = APT_KNOWLEDGE.filter(isAnswered).length;
  const allCorrect = APT_KNOWLEDGE.every(isCorrect);
  const passed = marked && allCorrect;
  const score = APT_KNOWLEDGE.filter(isCorrect).length;

  const pick = (q, idx) => {
    if (passed) return;
    const picked = answers[q.id] || [];
    let nextPicked;
    if (!q.multi) nextPicked = [idx];
    else if (picked.includes(idx)) nextPicked = picked.filter(i => i !== idx);
    else nextPicked = [...picked, idx].slice(-wanted(q).length);
    setNudge(null);
    set({ aptAnswers: { ...answers, [q.id]: nextPicked }, aptMarked: false });
  };

  const check = () => {
    const missing = APT_KNOWLEDGE.findIndex(q => !isAnswered(q));
    if (missing >= 0) { setNudge(missing + 1); return; }  // no attempt burned
    setNudge(null);
    const n = attempts + 1;
    const pass = allCorrect;
    set({ aptMarked: true, aptAttempts: n, aptPassed: pass, aptLocked: !pass && n >= 3 });
    if (pass) onPassed();
  };

  const retry = () => set({ aptMarked: false, aptAnswers: {} });

  return (
    <>
      <AptSectionRule label="Section 1 of 2 · Check your understanding" />
      <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-2)", textAlign: "center", margin: "4px 0 6px" }}>
        A short assessment of how lending through CredX works and the risks involved. Every question must
        be answered correctly to proceed. If you do not pass, review the Investor Knowledge Guide linked in
        the risk warning above and try again. You have three attempts.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
          {marked ? score : answeredCount} / {APT_KNOWLEDGE.length}
        </span>
        <div style={{ flex: 1, height: 2, background: "var(--border)" }}>
          <div style={{ height: "100%", width: ((marked ? score : answeredCount) / APT_KNOWLEDGE.length * 100) + "%", background: "var(--accent)", transition: "width .3s ease" }} />
        </div>
      </div>

      {passed && (
        <AptBanner tone="pass" title={"Assessment passed - " + score + " of " + APT_KNOWLEDGE.length + " correct."}
          body="You have demonstrated an understanding of the principal risks of lending through CredX. Understanding the assessment does not remove the risk: only invest capital you are prepared to lose." />
      )}
      {marked && !allCorrect && !locked && (
        <AptBanner tone="fail" title={"You scored " + score + " of " + APT_KNOWLEDGE.length + ". Attempt " + attempts + " of 3 used."}
          body="To proceed, every answer must be correct. The questions to revisit are marked below, with the reason. Spend a few minutes with the Investor Knowledge Guide, then try again." />
      )}
      {locked && (
        <AptBanner tone="warn" title="You've used all three attempts."
          body="We can't complete your assessment today. You can retake it after 24 hours - we'll email you a link. Your details up to this point have been saved." />
      )}
      {nudge && !marked && (
        <AptBanner tone="warn" title={"Question " + String(nudge).padStart(2, "0") + " still needs an answer."}
          body="Please answer every question before submitting. Single-answer questions need one statement; question 08 needs exactly two." />
      )}

      <div>
        {APT_KNOWLEDGE.map((q, qi) => {
          const picked = answers[q.id] || [];
          const ok = isCorrect(q);
          return (
            <div key={q.id} style={{ padding: "20px 0", borderTop: qi ? "1px solid var(--border)" : 0 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                  color: marked ? (ok ? "var(--pos)" : "var(--neg)") : "var(--accent)",
                }}>{String(qi + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "var(--ff-serif)", fontSize: 17, lineHeight: 1.35, color: "var(--ink)" }}>{q.prompt}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", margin: "6px 0 12px 25px" }}>{q.hint}</div>
              <div style={{ marginLeft: 25 }}>
                {q.options.map((o, i) => {
                  const on = picked.includes(i);
                  return (
                    <label key={i} style={{
                      display: "grid", gridTemplateColumns: "18px 1fr", gap: 12, alignItems: "flex-start",
                      padding: "11px 10px", borderTop: i ? "1px solid var(--border)" : 0,
                      cursor: passed || locked ? "default" : "pointer",
                      background: on ? "var(--accent-tint)" : "transparent",
                    }}>
                      <input type={q.multi ? "checkbox" : "radio"} name={"apt-" + q.id}
                        checked={on} disabled={passed || locked} onChange={() => pick(q, i)}
                        style={{ width: 15, height: 15, marginTop: 1 }} />
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: on ? "var(--accent-ink)" : "var(--ink-2)" }}>{o.t}</span>
                    </label>
                  );
                })}
              </div>
              {marked && (
                <div style={{
                  margin: "14px 0 0 25px", paddingLeft: 14,
                  borderLeft: "2px solid " + (ok ? "var(--pos)" : "var(--neg)"),
                }}>
                  <div className="mono" style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
                    color: ok ? "var(--pos)" : "var(--neg)", marginBottom: 4,
                  }}>{ok ? "Correct" : "Review"}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-2)" }}>{ok ? q.whyOk : q.whyNo}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!passed && !locked && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {Math.min(attempts + 1, 3)} of 3 attempts
          </span>
          {marked
            ? <button type="button" className="btn btn-primary" onClick={retry}>Try again</button>
            : <button type="button" className="btn btn-primary" onClick={check}>Submit answers</button>}
        </div>
      )}
    </>
  );
}

// ── Section 2 · personal circumstances ──────────────────────────
function SuitabilitySection({ form, set }) {
  const suit = form.aptSuit || {};
  const submitted = !!form.aptSuitSubmitted;
  const [nudge, setNudge] = React.useState(false);
  const complete = APT_SUITABILITY.every(q => suit[q.id]);
  const flags = APT_SUITABILITY.filter(q => suit[q.id] && suit[q.id] !== q.want);

  return (
    <>
      <AptSectionRule label="Section 2 of 2 · Your circumstances" />
      <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-2)", textAlign: "center", margin: "4px 0 6px" }}>
        These answers tell us whether this type of investment suits your experience and financial
        position. Answer them as they are today, not as you hope they will be.
      </p>

      <div style={{ border: "1px solid var(--border-2)", background: "var(--bg)" }}>
        {APT_SUITABILITY.map((q, i) => {
          const flagged = submitted && suit[q.id] && suit[q.id] !== q.want;
          return (
            <div key={q.id} style={{
              display: "grid", gridTemplateColumns: "1fr 132px", gap: 16, alignItems: "center",
              padding: "14px 16px",
              borderTop: i ? "1px solid var(--border)" : 0,
              background: flagged ? "var(--warn-tint)" : "transparent",
            }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-2)" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginRight: 8 }}>{i + 1}.</span>
                {q.q}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["yes", "no"].map(v => {
                  const on = suit[q.id] === v;
                  return (
                    <button key={v} type="button"
                      onClick={() => { setNudge(false); set({ aptSuit: { ...suit, [q.id]: v }, aptSuitSubmitted: false }); }}
                      style={{
                        flex: 1, height: 34, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                        textTransform: "capitalize",
                        border: "1px solid " + (on ? "var(--accent)" : "var(--border-2)"),
                        background: on ? "var(--accent)" : "var(--bg)",
                        color: on ? "var(--on-accent)" : "var(--ink-2)",
                      }}>{v}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <>
          {nudge && !complete && (
            <AptBanner tone="warn" title="All seven questions need an answer."
              body="Pick Yes or No on each row, then submit." />
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-primary"
              onClick={() => { if (!complete) { setNudge(true); return; } setNudge(false); set({ aptSuitSubmitted: true }); }}>
              Submit answers
            </button>
          </div>
        </>
      )}

      {submitted && flags.length === 0 && (
        <AptBanner tone="pass" title="Assessment complete."
          body="Nothing in your answers suggests this type of investment is unsuitable for you. Confirm the acknowledgements below to finish." />
      )}
      {submitted && flags.length > 0 && (
        <AptBanner tone="warn"
          title={flags.length === 1 ? "One answer needs a conversation first." : flags.length + " answers need a conversation first."}
          body="The highlighted answers suggest this investment may not be appropriate for you right now. You can still continue, but a member of the CredX team will review your assessment and speak to you before any allocation is offered. If anything above was a mistake, change it and submit again." />
      )}
    </>
  );
}

// ── The step ────────────────────────────────────────────────────
function AppropriatenessTest({ form, set }) {
  const [guide, setGuide] = React.useState(false);
  const passed = !!form.aptPassed;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <RiskWarningBanner onLearnMore={() => setGuide(true)} />
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: -6 }}>
        <button type="button" onClick={() => setGuide(true)} style={{ background: "none", border: 0, padding: 0, fontSize: 12, color: "var(--accent)", fontWeight: 500, cursor: "pointer" }}>
          Read the Investor Knowledge Guide
        </button>
        <button type="button" onClick={() => window.downloadGuideDoc && window.downloadGuideDoc()}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: 0, padding: 0, fontSize: 12, color: "var(--accent)", fontWeight: 500, cursor: "pointer" }}>
          <I.download /> Download a copy
        </button>
      </div>
      <HighRiskGuide open={guide} onClose={() => setGuide(false)} />

      <KnowledgeSection form={form} set={set} onPassed={() => {}} />

      {passed && (
        <>
          <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
          <SuitabilitySection form={form} set={set} />
        </>
      )}

      {form.aptSuitSubmitted && (
        <>
          <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            Acknowledgements
          </div>
          {APT_ACKS.map(([k, t, d]) => (
            <label key={k} style={{
              display: "grid", gridTemplateColumns: "20px 1fr", gap: 12, padding: 14,
              background: form[k] ? "var(--accent-tint)" : "var(--bg)",
              border: "1px solid " + (form[k] ? "var(--accent)" : "var(--border-2)"),
              alignItems: "flex-start", cursor: "pointer",
            }}>
              <input type="checkbox" checked={!!form[k]} onChange={e => set({ [k]: e.target.checked })}
                style={{ width: 16, height: 16, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: form[k] ? "var(--accent-ink)" : "var(--ink)" }}>{t}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 4 }}>{d}</div>
              </div>
            </label>
          ))}
        </>
      )}

      <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.55 }}>
        This assessment is provided for your protection. It is not investment advice or a personal
        recommendation. CredX lending is unregulated; opportunities are made available only to investors
        who qualify under an applicable financial promotion exemption. Your capital is at risk and is not
        covered by the FSCS. There is no recognised market on which to sell this investment, and tax rules
        depend on your circumstances and may change.
      </div>
    </div>
  );
}

Object.assign(window, {
  AppropriatenessTest, RiskWarningBanner,
  APT_KNOWLEDGE, APT_SUITABILITY,
});
