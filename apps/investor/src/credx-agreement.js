// credx-agreement.js — generates a populated CredX / Funder Facility Agreement
// from the JMW template. Returns a complete, print-ready HTML document string.
// Merge fields are filled from the investor + allocation + loan; genuine
// unknowns (funder address, security property) render as highlighted,
// editable placeholders the user completes before printing.
(function () {
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // An editable, highlighted field for values not held on file.
  const fill = (val, placeholder) => val
    ? '<span class="fa-fill">' + esc(val) + "</span>"
    : '<span class="fa-fill fa-empty" contenteditable="true" data-ph="' + esc(placeholder) + '">' + esc(placeholder) + "</span>";

  const money = (n) => "£" + Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (n) => (Number(n) % 1 === 0 ? Number(n).toFixed(0) : Number(n).toFixed(2)) + "%";

  function buildFacilityAgreementHTML(d) {
    const funder = fill(d.funderName, "[FUNDER NAME]");
    const funderAddr = fill(d.funderAddress, "[Funder address]");
    const funderEmail = fill(d.funderEmail, "[Funder email]");
    const customer = fill(d.customerName, "[Customer name]");
    const portion = fill(d.funderPortionPct != null ? pct(d.funderPortionPct) : "", "[Funder's portion %]");
    const rate = fill(d.interestRate != null ? pct(d.interestRate) : "", "[Interest rate]");
    const amount = fill(d.loanAmount != null ? money(d.loanAmount) : "", "[Loan amount]");
    const security = fill(d.securityProperty, "[Security Property address]");
    const dateStr = d.date || "_______________ 2026";
    const ref = d.facilityRef || d.loanRef || "";

    const head = (n, t) => '<h2 class="fa-h"><span class="fa-num">' + n + "</span>" + t + "</h2>";

    return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Facility Agreement — ${esc(d.funderName || "Funder")}${ref ? " (" + esc(ref) + ")" : ""}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Source Serif 4', Georgia, serif; color: #1a2024; line-height: 1.55;
         font-size: 11pt; margin: 0; background: #f3f1ec; }
  .fa-toolbar { position: sticky; top: 0; z-index: 10; background: #0e1418; color: #f4f1ea;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 12px 24px; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 13px; }
  .fa-toolbar .muted { color: rgba(244,241,234,.6); }
  .fa-toolbar button { font: inherit; font-weight: 600; cursor: pointer; border: 0; border-radius: 8px;
    padding: 9px 16px; background: #117a82; color: #fff; }
  .fa-toolbar button.ghost { background: transparent; color: #f4f1ea; border: 1px solid rgba(244,241,234,.3); }
  .fa-page { max-width: 820px; margin: 24px auto 80px; background: #fff; padding: 64px 72px;
    box-shadow: 0 10px 40px rgba(0,0,0,.12); }
  .fa-letterhead { text-align: center; border-bottom: 2px solid #0e1418; padding-bottom: 18px; margin-bottom: 8px; }
  .fa-mark { font-weight: 600; font-size: 26px; letter-spacing: -0.5px; }
  .fa-mark span { color: #117a82; }
  .fa-office { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 10px; color: #5a6470;
    letter-spacing: 0.04em; margin-top: 6px; }
  .fa-dated { display: flex; justify-content: space-between; font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 11px; color: #5a6470; margin: 22px 0; text-transform: uppercase; letter-spacing: 0.08em; }
  .fa-parties { text-align: center; margin: 30px 0; }
  .fa-parties .who { font-size: 15px; font-weight: 600; }
  .fa-parties .role { font-size: 11px; color: #5a6470; font-style: italic; margin-bottom: 14px; }
  .fa-rule { text-align: center; letter-spacing: 4px; color: #b8b2a6; margin: 6px 0; }
  .fa-title { text-align: center; font-size: 20px; font-weight: 600; letter-spacing: 1px; margin: 8px 0; }
  .fa-h { font-size: 12.5pt; font-weight: 600; margin: 26px 0 8px; display: flex; gap: 12px; }
  .fa-num { color: #117a82; min-width: 28px; }
  p { margin: 0 0 11px; }
  ol.fa-list { margin: 0 0 11px; padding-left: 26px; }
  ol.fa-list > li { margin-bottom: 8px; }
  .fa-def { padding-left: 4px; }
  .fa-def b { font-weight: 600; }
  .fa-fill { background: #fff3d6; padding: 0 3px; border-radius: 2px; font-weight: 600; white-space: pre-wrap; }
  .fa-empty { background: #ffe2e2; color: #9a2a2a; font-style: italic; font-weight: 400; outline: none; }
  .fa-empty:focus { box-shadow: 0 0 0 2px #117a82; background: #fff; color: #1a2024; }
  .fa-exec { margin-top: 40px; page-break-inside: avoid; }
  .fa-sigblock { border: 1px solid #cfd5da; padding: 18px 20px; margin: 14px 0; border-radius: 6px; }
  .fa-sigrow { display: flex; gap: 40px; margin-top: 22px; }
  .fa-sigrow .line { flex: 1; border-top: 1px solid #1a2024; padding-top: 5px; font-size: 10px; color: #5a6470;
    font-family: ui-sans-serif, system-ui, sans-serif; }
  .fa-note { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11px; color: #8a6d1a;
    background: #fff8e6; border: 1px solid #f0e0a8; border-radius: 8px; padding: 10px 14px; margin: 18px 0; }
  @media print {
    .fa-toolbar, .fa-note { display: none !important; }
    body { background: #fff; }
    .fa-page { box-shadow: none; margin: 0; max-width: none; padding: 0; }
    .fa-empty { background: transparent; color: #1a2024; font-style: normal; }
    .fa-fill { background: transparent; }
  }
</style></head>
<body>
  <div class="fa-toolbar">
    <div><strong>Facility Agreement</strong> <span class="muted">— ${esc(d.funderName || "Funder")}${ref ? " · " + esc(ref) : ""}</span></div>
    <div style="display:flex;gap:8px">
      <button class="ghost" onclick="window.close()">Close</button>
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>
  <div class="fa-page">
    <div class="fa-letterhead">
      <div class="fa-mark">CRE<span>D</span>X</div>
      <div class="fa-office">King's House ● 36-37 King Street ● London ● EC2V 8BB &nbsp;·&nbsp; Tel: 0203 675 7575 ● DX: 42624 Cheapside &nbsp;·&nbsp; Ref: 890231C.1</div>
    </div>

    <div class="fa-note">Highlighted values are merged from the loan record. Pink fields aren't held on file — click to type them in before printing.</div>

    <div class="fa-dated"><span>Dated</span><span>${esc(dateStr)}</span></div>

    <div class="fa-parties">
      <div class="who">${funder}</div>
      <div class="role">(as Funder)</div>
      <div style="font-size:11px;color:#5a6470">- and -</div>
      <div class="who">CREDX LTD</div>
      <div class="role">(as Lender)</div>
    </div>

    <div class="fa-rule">_____________________________</div>
    <div class="fa-title">FACILITY AGREEMENT</div>
    <div class="fa-rule">_____________________________</div>

    <p style="text-align:center;font-size:10pt;color:#5a6470">This Agreement is executed as a deed and dated ${esc(dateStr)}</p>

    ${head("1", "Parties")}
    <ol class="fa-list">
      <li>${funder} of ${funderAddr} (the <b>"Funder"</b>, which expression includes its successors and permitted assigns); and</li>
      <li><b>CREDX LTD</b>, incorporated and registered in England and Wales with company number 16640225 whose registered office is at Suite F16 St George's Business Park, Castle Road, Sittingbourne, Kent ME10 3TB (the <b>"Lender"</b>, which expression includes its successors and permitted assigns).</li>
    </ol>

    ${head("2", "Agreed terms")}
    <p>The Funder has agreed to make the Funder Loan (as defined below) to the Lender, on the terms set out in this Agreement.</p>
    <p>The Lender has agreed to use the Funder Loan to finance the Customer Loan (as defined below).</p>

    ${head("3", "Interpretation")}
    <p>In this Agreement:</p>
    <p class="fa-def"><b>"Business Day"</b> means a day (other than a Saturday or Sunday) on which banks are open for general business in London;</p>
    <p class="fa-def"><b>"Customer"</b> means ${customer};</p>
    <p class="fa-def"><b>"Customer Loan"</b> means the loan made or to be made on or around the date of this Agreement by the Lender to the Borrower, such loan to be secured by the Property;</p>
    <p class="fa-def"><b>"Customer Loan Agreement"</b> means, in respect of a Customer Loan, the loan or facility agreement entered into between the Lender and the applicable Customer, in accordance with the Lender's standard form documentation;</p>
    <p class="fa-def"><b>"Customer Loan Repayment Date"</b> means the date on which (i) the Customer Loan has been repaid or prepaid or otherwise recovered from the Customer in full, or (ii) the Lender determines, in its reasonable discretion and in accordance with its policies and procedures, that no further recoveries will be made in respect of the Customer Loan;</p>
    <p class="fa-def"><b>"Event of Default"</b> means any event or circumstance specified as such in Clause 14;</p>
    <p class="fa-def"><b>"Funder's Portion"</b> means ${portion} of the applicable amount;</p>
    <p class="fa-def"><b>"Gross Loan Amount"</b> means, in respect of a Customer Loan, the principal balance of the applicable Customer Loan together with any fees, charges, commissions, expenses, retained interest and any other amounts funded or to be funded by the Lender to the applicable Customer in respect of such Customer Loan;</p>
    <p class="fa-def"><b>"Interest Rate"</b> means ${rate} per annum;</p>
    <p class="fa-def"><b>"Loan"</b> means a sterling loan of ${amount}, or the principal amount outstanding for the time being of that loan;</p>
    <p class="fa-def"><b>"Repayment Date"</b> means the Customer Loan Repayment Date for the Customer Loan which was financed by that Loan;</p>
    <p class="fa-def"><b>"Security Property"</b> means ${security}; and</p>
    <p class="fa-def"><b>"Trust Property"</b> means the Funder's Portion of the monies received in cleared funds by the Lender in respect of the Customer Loan, whether collected directly from the Customer or otherwise, including any repayments or prepayments made by or on behalf of the Customer, and any net proceeds of enforcement or realisation in respect of the Security Property (in each case, after payment of any amount owing to any Receiver or any properly incurred third party fees, costs and expenses incurred by the Lender).</p>

    ${head("4", "The Funder Loan")}
    <p>The Funder shall make available to the Lender a loan of ${amount} (the <b>"Funder Loan"</b>), to be applied by the Lender solely towards financing the Funder's Portion of the Customer Loan to ${customer}, secured against the Security Property at ${security}.</p>
    <p>Interest shall accrue on the Loan at the Interest Rate of ${rate} per annum and shall be payable in accordance with the Lender's policies and procedures, with recourse limited to the Trust Property as set out in Clause 13.</p>

    ${head("5", "Interest")}
    <p>The Funder Loan shall bear interest at the Interest Rate. Interest is calculated on the outstanding principal of the Loan and is payable from recoveries received by the Lender in respect of the Customer Loan, subject always to the limited-recourse provisions of this Agreement.</p>

    ${head("6", "Repayment")}
    <p>The Lender shall repay the Loan, together with any accrued but unpaid interest, on the Repayment Date, in accordance with and subject to the order of application and limited-recourse provisions set out in this Agreement.</p>

    ${head("7", "Representations")}
    <p>Each party represents that it has the power to enter into and perform, and has taken all necessary action to authorise its entry into and performance of, this Agreement; that its obligations are legal, valid, binding and enforceable (subject to the Legal Reservations); and that all authorisations required to enable it lawfully to enter into this Agreement have been obtained and are in full force and effect.</p>

    ${head("8", "Information undertakings")}
    <p>Subject to applicable laws and Data Protection Law, the Lender shall promptly notify the Funder of any default, event of default or termination event under the Customer Loan; any steps to accelerate or enforce it; any waiver, amendment or extension deferring the Customer Loan Repayment Date or reducing the principal balance; any consent to a tenancy (other than an AST not exceeding 12 months); any release of, or notice in relation to, security; and any write-off or write-down applied.</p>

    ${head("9", "Trust Property")}
    <p>The Lender agrees and declares that it will hold the Trust Property on trust for the Funder until such time as the applicable amount has been distributed in accordance with this Agreement. Following the Customer Loan Repayment Date, any payment received shall be applied: first, in payment of any Receiver's or third-party enforcement costs; secondly, in repayment of the Loan and accrued interest; and thirdly, any remaining amount to the Lender for its own account.</p>

    ${head("10", "Events of Default")}
    <p>It is an Event of Default if the Lender fails to pay within 15 Business Days of the due date (subject to a 3-Business-Day technical-failure cure); any representation proves materially incorrect and is not remedied within 15 Business Days; the Lender fails to comply with any material undertaking and does not remedy within 15 Business Days; or insolvency proceedings or analogous steps are taken in relation to the Lender. When an Event of Default is continuing, the Funder may declare the Loan immediately due and payable and exercise its rights in relation to the Trust Property.</p>

    ${head("11", "Limited Recourse")}
    <p>Notwithstanding any other term, all obligations of the Lender to the Funder are limited in recourse to the Trust Property. If recoveries from the Trust Property are insufficient, the Lender shall not be liable for any shortfall, the Funder shall have no further recourse against the Lender, and any such unpaid amounts shall be deemed discharged and extinguished in full.</p>

    ${head("12", "Notices")}
    <p>Notices must be in writing and delivered by hand, pre-paid first-class post or next-working-day service, or sent by email, to:</p>
    <p class="fa-def"><b>the Funder at:</b> ${funderAddr}<br>Email: ${funderEmail}<br>Attention: ${funder}</p>
    <p class="fa-def"><b>the Lender at:</b> Suite F16 St George's Business Park, Castle Road, Sittingbourne, Kent ME10 3TB<br>Email: info@credx.co.uk<br>Attention: The Directors, CredX Ltd</p>

    ${head("13", "Governing law and jurisdiction")}
    <p>This Agreement and any dispute or claim (including non-contractual disputes or claims) arising out of or in connection with it shall be governed by and construed in accordance with the law of England and Wales, and the parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales.</p>
    <p>This Agreement has been entered into as a deed on the date stated at the beginning of this Agreement and is delivered by the parties as a deed on that date.</p>

    <div class="fa-exec">
      <div class="fa-title" style="font-size:15px;margin-top:30px">EXECUTION PAGE</div>
      <div class="fa-sigblock">
        <p style="margin:0">Executed as a deed by ${funder} acting by a director in the presence of:</p>
        <div class="fa-sigrow"><div class="line">Director</div><div class="line">Print name</div></div>
        <div class="fa-sigrow"><div class="line">Signature of witness</div><div class="line">Name (in BLOCK CAPITALS)</div></div>
        <div class="fa-sigrow"><div class="line">Address of witness</div><div class="line"></div></div>
      </div>
      <div class="fa-sigblock">
        <p style="margin:0">Executed as a deed by CredX Ltd acting by a director in the presence of:</p>
        <div class="fa-sigrow"><div class="line">Director</div><div class="line">Print name</div></div>
        <div class="fa-sigrow"><div class="line">Signature of witness</div><div class="line">Name (in BLOCK CAPITALS)</div></div>
        <div class="fa-sigrow"><div class="line">Address of witness</div><div class="line"></div></div>
      </div>
    </div>
  </div>
</body></html>`;
  }

  window.buildFacilityAgreementHTML = buildFacilityAgreementHTML;
})();
