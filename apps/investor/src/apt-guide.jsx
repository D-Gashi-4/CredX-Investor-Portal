// ────────────────────────────────────────────────────────────────
// INVESTOR KNOWLEDGE GUIDE - the document behind "Take 2 mins to
// learn more". Content mirrors the CredX Investor Knowledge Guide.
// ────────────────────────────────────────────────────────────────

const GUIDE_SECTIONS = [
  {
    n: "01", eyebrow: "The model", h: "The CredX lending model",
    blocks: [
      ["lead", "CredX is a specialist short-term bridging lender. We originate loans to property borrowers, typically between £30,000 and £750,000, and fund them in part using capital advanced by private investors."],
      ["p", "When you invest, you are not buying shares and you are not making a deposit. You are lending. Your capital is advanced towards a specific property loan and, in return, you receive a fixed rate of interest over a defined term. Each opportunity is presented on its own terms, with its own borrower, property, rate and duration."],
      ["p", "Your return is the interest the borrower pays. Your capital is repaid when the borrower repays or refinances the loan, known as the exit. If the borrower does not repay, recovery depends on enforcing the security held over the property, which takes time and may not return the full amount."],
      ["note", "In brief", "You lend to a property borrower for a fixed period, earn fixed interest, and rely on the property as security if matters do not proceed as planned."],
    ],
  },
  {
    n: "02", eyebrow: "Regulatory status", h: "Unregulated lending, and what it means for you",
    blocks: [
      ["p", "CredX carries out unregulated lending. The loans we arrange fall outside the Financial Conduct Authority's regulatory perimeter, and CredX is not authorised or regulated by the FCA for this activity. This is material, so it is worth being precise about what it changes."],
      ["pts", [
        "There is no Financial Services Compensation Scheme (FSCS) cover. If a loan is not repaid, or CredX ceases trading, you cannot claim compensation as you could on a failed bank deposit.",
        "You do not have recourse to the Financial Ombudsman Service in respect of these loans.",
        "There is no statutory appropriateness regime behind the product. The Appropriateness Test we ask you to complete is our own standard, applied because we consider it good practice, not because it is mandated here.",
        "Because the activity is unregulated, opportunities can only lawfully be presented to investors who qualify under a recognised financial promotion exemption, most commonly self-certified sophisticated, certified high-net-worth, or certified sophisticated investors.",
      ]],
      ["note", "Worth reading twice", "Unregulated does not mean unlawful or unusual. Bridging is a long-established part of UK property finance. It does mean the safety nets associated with mainstream savings and investments are absent. The property security is your protection, not a compensation scheme."],
    ],
  },
  {
    n: "03", eyebrow: "The instrument", h: "How bridging finance works",
    blocks: [
      ["lead", "A bridge is a short-term loan that spans a gap in a borrower's plans, usually between needing funds now and a longer-term outcome that will repay them later."],
      ["p", "Typical uses include buying a property quickly, for instance at auction where completion deadlines are tight, funding light refurbishment ahead of a sale or refinance, raising capital against an existing property, or covering a chain break. Terms are short, usually a few months up to around 18 months, and the borrower pays a higher rate than a mainstream mortgage in exchange for speed and flexibility."],
      ["h3", "The exit is everything"],
      ["p", "Every bridge is written against a planned exit, meaning how the borrower intends to repay. The two most common exits are a sale of the property or a refinance onto a longer-term facility, for example a buy-to-let mortgage. The credibility of that exit is central to whether a loan is repaid on time, and therefore to whether your capital returns on schedule."],
      ["note", "On pricing", "A higher rate reflects higher risk and shorter duration, not a better deal. Speed, flexibility and short terms are priced in. A strong rate does not make a weak loan safe."],
    ],
  },
  {
    n: "04", eyebrow: "Security", h: "Security and the order of charges",
    blocks: [
      ["p", "CredX loans are secured by a legal charge registered against the borrower's property, the same mechanism a bank uses for a mortgage. On default, the charge gives the lender the right to enforce against the property and recover from the sale proceeds."],
      ["p", "Charges rank in order. That ranking decides who is paid first if a property is sold, and it directly affects the risk of your investment."],
      ["ladder", [
        ["First charge", "Paid first", "The senior position. On a sale, a first charge is repaid ahead of all others, up to the value recovered. This is the strongest security, but first means first in the queue, not paid in full: if the property sells for less than the debt, even a first charge can fall short."],
        ["Second charge", "Paid after the first", "Ranks behind the first charge and is repaid only once the first-charge lender is settled in full. It carries more risk, which is why second-charge loans usually pay a higher rate. If a sale barely covers the first charge, a second-charge lender may recover only part of its capital, or none."],
        ["Borrower equity", "Paid last", "Whatever remains once all charges are cleared belongs to the borrower. This is the cushion that absorbs the first losses if values fall, until it is exhausted."],
      ]],
      ["note", "A common misconception", "A first charge does not guarantee repayment in full, and a second charge does not guarantee a fixed proportion. Both depend entirely on what the property actually sells for. Security improves your position in the queue; it does not remove the risk."],
      ["h3", "Loan-to-value, and why it matters"],
      ["p", "Loan-to-value (LTV) is the loan amount as a percentage of the property's value. A lower LTV means a larger equity cushion beneath the debt and more room for values to fall before a lender is exposed. Property values can move during a term, through refurbishment overrunning, market shifts, or a slow sale, so there is always a risk the outstanding loan ends up worth more than the property securing it."],
    ],
  },
  {
    n: "05", eyebrow: "Risk", h: "The principal risks, plainly stated",
    blocks: [
      ["table", [
        ["Capital loss", "You could lose some or all of the capital you lend if a borrower defaults and the security does not cover the debt."],
        ["Illiquidity", "Your capital is committed for the loan term. There is no active market in which to sell your investment, and early exit is not guaranteed."],
        ["Late repayment", "Borrowers can repay late or seek an extension. Bridging exits slip more often than they run to the day, delaying the return of your capital."],
        ["Falling values", "If a property's value declines, the loan can exceed what the security is worth, reducing what is recoverable on a sale."],
        ["Concentration", "Each loan is a single borrower and a single property. Unless you spread capital across several loans yourself, you are exposed to one outcome. CredX does not diversify your investment for you."],
        ["No FSCS", "No compensation scheme stands behind these loans. Recovery depends solely on the borrower and the security."],
        ["Platform risk", "Were CredX to fail, an insolvency practitioner would ordinarily seek to recover outstanding loans on behalf of investors, but that is a process carrying cost and delay, not a guaranteed backstop."],
      ]],
      ["note", "The honest summary", "Fixed, attractive interest is the reward for taking real, uninsured risk on a short-term property loan. If the return is what draws you in, the risk is the first thing to understand."],
    ],
  },
  {
    n: "06", eyebrow: "Protection", h: "What actually protects you",
    blocks: [
      ["p", "Since no compensation scheme applies, it is worth being clear about where genuine protection comes from, and what it can and cannot do."],
      ["pts", [
        "The legal charge over the property. The core protection: a registered, enforceable right to recover from the property's value. Its strength depends on the charge's rank and the LTV.",
        "Underwriting. Before any loan is written, CredX assesses the borrower, the property, the valuation and the exit. Careful underwriting reduces the chance of default; it does not remove it.",
        "Independent valuation. Values used in lending decisions are assessed by a qualified valuer, not taken from the borrower.",
        "Legal documentation. Your loan is governed by an Investor Loan Agreement, and the charge is handled by panel solicitors. The documentation defines your rights and how recovery works.",
      ]],
      ["note", "What none of this is", "A guarantee. Each protection improves the odds and the recovery position. None promises the return of your capital or your interest. Treat any investment as capital you are prepared to lose."],
    ],
  },
  {
    n: "07", eyebrow: "Responsibility", h: "Your role as a lender",
    blocks: [
      ["p", "CredX presents opportunities and manages the lending process. The decision to invest in any particular loan is yours, and several things follow from that."],
      ["pts", [
        "CredX does not provide investment advice. We provide information so you can make your own decision. If you are unsure whether an investment suits your circumstances, seek independent professional advice.",
        "You choose your own exposure. To reduce the impact of any single loan performing poorly, you decide how much to place and how to spread it. There is no automatic diversification.",
        "Your capital is not always working. Between investments, or while awaiting a suitable opportunity, uncommitted funds earn no return.",
        "Tax is your responsibility. How interest is taxed depends on your circumstances and can change. CredX does not provide tax advice.",
      ]],
    ],
  },
  {
    n: "08", eyebrow: "Readiness", h: "Before you invest",
    blocks: [
      ["p", "If you can honestly agree with each of the following, you are ready to complete the Appropriateness Test."],
      ["attest", [
        "I could lose some or all of my capital, and returns are not guaranteed.",
        "My capital is not covered by the FSCS, and I cannot use the Financial Ombudsman Service for these loans.",
        "My investment is illiquid, committed for the term, with no guaranteed early exit.",
        "Security is a legal charge over property; a first charge ranks ahead of a second, but neither guarantees full repayment.",
        "Property values can fall below the loan amount during the term.",
        "CredX does not advise me or diversify my capital; those choices are mine.",
        "Bridging is short-term, higher-rate lending, and the higher rate reflects higher risk.",
        "I should only invest capital I am prepared to lose, and consider seeking independent advice.",
      ]],
    ],
  },
];

function GuideBlock({ block }) {
  const [kind, a, b] = block;
  if (kind === "lead") return <p style={{ fontFamily: "var(--ff-serif)", fontSize: 16, lineHeight: 1.6, color: "var(--ink)", margin: "0 0 14px" }}>{a}</p>;
  if (kind === "p") return <p style={{ fontSize: 13.5, lineHeight: 1.68, color: "var(--ink-2)", margin: "0 0 14px" }}>{a}</p>;
  if (kind === "h3") return <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", color: "var(--ink)", margin: "20px 0 7px" }}>{a}</div>;
  if (kind === "note") return (
    <div style={{ borderLeft: "2px solid var(--accent)", padding: "3px 0 3px 16px", margin: "18px 0" }}>
      <div className="mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent-ink)", marginBottom: 5 }}>{a}</div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>{b}</div>
    </div>
  );
  if (kind === "pts") return (
    <ul style={{ listStyle: "none", margin: "14px 0", padding: 0 }}>
      {a.map((t, i) => (
        <li key={i} style={{ position: "relative", padding: "9px 0 9px 18px", borderTop: i ? "1px solid var(--border)" : 0, fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>
          <span style={{ position: "absolute", left: 0, top: 17, width: 5, height: 5, background: "var(--accent)", borderRadius: "50%" }} />
          {t}
        </li>
      ))}
    </ul>
  );
  if (kind === "ladder") return (
    <div style={{ borderTop: "1px solid var(--ink)", margin: "18px 0" }}>
      {a.map(([who, when, desc]) => (
        <div key={who} style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: 18, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{who}</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", marginTop: 4 }}>{when}</div>
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-2)" }}>{desc}</div>
        </div>
      ))}
    </div>
  );
  if (kind === "table") return (
    <table style={{ width: "100%", borderCollapse: "collapse", margin: "16px 0" }}>
      <thead>
        <tr>
          {["Risk", "What it means"].map(h => (
            <th key={h} style={{ textAlign: "left", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 600, padding: "0 14px 9px 0", borderBottom: "1px solid var(--ink)" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {a.map(([r, d]) => (
          <tr key={r}>
            <td style={{ padding: "12px 14px 12px 0", borderBottom: "1px solid var(--border)", verticalAlign: "top", width: "32%", fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{r}</td>
            <td style={{ padding: "12px 14px 12px 0", borderBottom: "1px solid var(--border)", verticalAlign: "top", fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-2)" }}>{d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  if (kind === "attest") return (
    <div style={{ border: "1px solid var(--border-2)", marginTop: 12 }}>
      <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border-2)", fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>I understand that</div>
      {a.map((t, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 12, padding: "12px 18px", borderBottom: i === a.length - 1 ? 0 : "1px solid var(--border)", fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-2)" }}>
          <span style={{ width: 6, height: 6, border: "1.5px solid var(--accent)", marginTop: 6 }} />
          {t}
        </div>
      ))}
    </div>
  );
  return null;
}

function downloadGuideDoc() {
  const html = window.CREDX_GUIDE_DOC_HTML;
  if (!html) return;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "CredX Investor Knowledge Guide.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function openGuideDoc() {
  const html = window.CREDX_GUIDE_DOC_HTML;
  if (!html) return;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

function HighRiskGuide({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} width={720} title="Investor Knowledge Guide"
      footer={
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>Back to the assessment</button>
          <button type="button" className="btn" onClick={downloadGuideDoc}><I.download /> Download the guide</button>
          <button type="button" className="btn" onClick={openGuideDoc}>Open in a new tab <I.external /></button>
        </div>
      }>
      <div style={{ borderLeft: "2px solid var(--ink)", padding: "4px 0 4px 14px", marginBottom: 22, fontSize: 12, lineHeight: 1.55, color: "var(--ink-2)" }}>
        <strong style={{ color: "var(--ink)" }}>Don't invest unless you're prepared to lose all the money you invest.</strong>{" "}
        This is a high-risk investment. Your capital is at risk, returns are not guaranteed, and you are
        unlikely to be protected if something goes wrong.
      </div>
      <div className="mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>
        Lending secured against UK property
      </div>
      <h3 style={{ fontFamily: "var(--ff-serif)", fontWeight: 400, fontSize: 26, lineHeight: 1.12, color: "var(--ink)", margin: "0 0 12px" }}>
        What you need to know before you lend
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)", margin: "0 0 26px" }}>
        CredX arranges short-term loans secured against UK property. This guide sets out how that works,
        where the risks sit, and which protections do and do not apply. Please read it in full before
        completing the Appropriateness Test.
      </p>

      {GUIDE_SECTIONS.map(s => (
        <section key={s.n} style={{ marginBottom: 38 }}>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{s.n}</span>
            {s.eyebrow}
            <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <h4 style={{ fontFamily: "var(--ff-serif)", fontWeight: 400, fontSize: 20, lineHeight: 1.18, color: "var(--ink)", margin: "0 0 14px" }}>{s.h}</h4>
          {s.blocks.map((b, i) => <GuideBlock key={i} block={b} />)}
        </section>
      ))}

      <div style={{ fontSize: 11, lineHeight: 1.65, color: "var(--ink-3)", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        This guide is provided for information only. It is not investment, legal or tax advice, and does
        not constitute a personal recommendation. Investment opportunities are made available only to
        investors who qualify under an applicable financial promotion exemption. CredX Ltd · Registered in
        England &amp; Wales No. 16640225 · Suite F16 St George's Business Park, Castle Road, Sittingbourne,
        Kent ME10 3TB · www.credx.co.uk
      </div>
    </Modal>
  );
}

Object.assign(window, { HighRiskGuide, GUIDE_SECTIONS, downloadGuideDoc, openGuideDoc });
