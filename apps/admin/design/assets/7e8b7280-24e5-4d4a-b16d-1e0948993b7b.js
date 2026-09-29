// CredX — Loan servicing store.
// Tracks post-completion servicing events for LIVE loans: capital drawdowns
// (and the figures derived from them — interest accrual, current balance,
// redemption figure). localStorage-backed with a subscribe() pattern that
// mirrors the underwriting case store and the investor bridge, so any view
// holding a loan re-renders the moment a drawdown is recorded.
//
// Exposes:
//   window.CredXServicing  — get / addDrawdown / removeDrawdown / applyPeriod / unapplyPeriod / subscribe
//   window.computeLoanAccrual(loan, asOfISO)    — derived interest & balance figures
//   window.computeInterestSchedule(loan, asOfISO) — monthly interest periods + apply status
(function () {
  const KEY = 'credx-servicing-v1';
  let store = load();
  const subs = new Set();

  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && typeof j === 'object') return j; } catch (e) {}
    return {};
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function emit() { subs.forEach(fn => { try { fn(); } catch (e) {} }); }

  function rec(loanId) {
    const r = store[loanId] || {};
    return {
      drawdowns: r.drawdowns || [],
      appliedPeriods: r.appliedPeriods || [],
      extensions: r.extensions || [],
      receipts: r.receipts || [],
    };
  }
  function put(loanId, patch) {
    store = Object.assign({}, store, { [loanId]: Object.assign({}, rec(loanId), patch) });
    persist(); emit();
  }
  const uid = (p) => p + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const today = () => new Date().toISOString().slice(0, 10);
  const addMonths = (iso, n) => {
    const d = new Date(iso);
    const day = d.getUTCDate();
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
    const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
    t.setUTCDate(Math.min(day, last));
    return t.toISOString().slice(0, 10);
  };

  window.CredXServicing = {
    get(loanId) { return rec(loanId); },
    getDrawdowns(loanId) { return (rec(loanId).drawdowns || []).slice(); },
    getApplied(loanId) { return (rec(loanId).appliedPeriods || []).slice(); },
    applyPeriod(loanId, period) {
      const cur = rec(loanId);
      if ((cur.appliedPeriods || []).some(p => p.key === period.key)) return;
      const appliedPeriods = (cur.appliedPeriods || []).concat({
        key: period.key,           // period start ISO — stable identity
        start: period.start,
        end: period.end,
        amount: Number(period.amount) || 0,
        appliedDate: new Date().toISOString().slice(0, 10),
        by: period.by || 'CredX',
        recordedAt: new Date().toISOString(),
      });
      store = Object.assign({}, store, { [loanId]: Object.assign({}, cur, { appliedPeriods }) });
      persist(); emit();
    },
    unapplyPeriod(loanId, key) {
      const cur = rec(loanId);
      const appliedPeriods = (cur.appliedPeriods || []).filter(p => p.key !== key);
      store = Object.assign({}, store, { [loanId]: Object.assign({}, cur, { appliedPeriods }) });
      persist(); emit();
    },
    addDrawdown(loanId, dd) {
      const cur = rec(loanId);
      const drawdowns = (cur.drawdowns || []).concat({
        id: 'dd-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        amount: Number(dd.amount) || 0,
        date: dd.date,
        note: (dd.note || '').trim(),
        by: dd.by || 'CredX',
        recordedAt: new Date().toISOString(),
      });
      store = Object.assign({}, store, { [loanId]: Object.assign({}, cur, { drawdowns }) });
      persist(); emit();
    },
    removeDrawdown(loanId, id) {
      const cur = rec(loanId);
      const drawdowns = (cur.drawdowns || []).filter(d => d.id !== id);
      store = Object.assign({}, store, { [loanId]: Object.assign({}, cur, { drawdowns }) });
      persist(); emit();
    },

    // ── Term extensions ──────────────────────────────────────────────────
    // The borrower buys additional time by prepaying the interest that would
    // accrue over the requested months, plus an arrangement fee (% of
    // principal) and a non-refundable application fee. The debt itself is
    // unchanged. An extension is 'approved' until payment is recorded, at
    // which point it becomes 'active' and moves the redemption date.
    getExtensions(loanId) { return rec(loanId).extensions.slice(); },
    addExtension(loanId, ext) {
      const id = uid('ext');
      const extensions = rec(loanId).extensions.concat({
        id,
        months: Number(ext.months) || 0,
        requestedDate: ext.requestedDate || today(),
        rate: Number(ext.rate) || 0,
        principal: Number(ext.principal) || 0,
        interest: Number(ext.interest) || 0,
        feePct: Number(ext.feePct) || 0,
        fee: Number(ext.fee) || 0,
        appFee: Number(ext.appFee) || 0,
        total: Number(ext.total) || 0,
        fromDate: ext.fromDate,
        newRedemption: ext.newRedemption,
        note: (ext.note || '').trim(),
        status: 'approved',
        approvedBy: ext.approvedBy || 'CredX',
        paidDate: null,
        receiptId: null,
        recordedAt: new Date().toISOString(),
      });
      put(loanId, { extensions });
      return id;
    },
    removeExtension(loanId, id) {
      const cur = rec(loanId);
      const ext = cur.extensions.find(e => e.id === id);
      put(loanId, {
        extensions: cur.extensions.filter(e => e.id !== id),
        receipts: ext && ext.receiptId ? cur.receipts.filter(r => r.id !== ext.receiptId) : cur.receipts,
      });
    },
    // Records the extension payment: activates the extension and books a
    // receipt for the interest element (fees are CredX income, not distributed).
    payExtension(loanId, id, pay) {
      const cur = rec(loanId);
      const ext = cur.extensions.find(e => e.id === id);
      if (!ext || ext.status === 'active') return null;
      const rid = uid('rcp');
      const receipts = cur.receipts.concat({
        id: rid,
        date: (pay && pay.date) || today(),
        amount: Number((pay && pay.amount) != null ? pay.amount : ext.interest) || 0,
        feesReceived: (ext.fee || 0) + (ext.appFee || 0),
        method: (pay && pay.method) || 'Bank transfer',
        reference: ((pay && pay.reference) || '').trim(),
        coverType: 'extension',
        coverKeys: [id],
        coverMonths: ext.months,
        note: (pay && pay.note) || (ext.months + '-month extension'),
        reconciled: false,
        distributions: [],
        recordedAt: new Date().toISOString(),
      });
      const extensions = cur.extensions.map(e => e.id === id
        ? Object.assign({}, e, { status: 'active', paidDate: (pay && pay.date) || today(), receiptId: rid })
        : e);
      put(loanId, { extensions, receipts });
      return rid;
    },

    // ── Interest receipts ────────────────────────────────────────────────
    getReceipts(loanId) { return rec(loanId).receipts.slice(); },
    addReceipt(loanId, r) {
      const id = uid('rcp');
      const receipts = rec(loanId).receipts.concat({
        id,
        date: r.date || today(),
        amount: Number(r.amount) || 0,
        feesReceived: Number(r.feesReceived) || 0,
        method: r.method || 'Bank transfer',
        reference: (r.reference || '').trim(),
        coverType: r.coverType || 'general',
        coverKeys: r.coverKeys || [],
        coverMonths: Number(r.coverMonths) || 0,
        note: (r.note || '').trim(),
        reconciled: false,
        distributions: [],
        recordedAt: new Date().toISOString(),
      });
      put(loanId, { receipts });
      return id;
    },
    removeReceipt(loanId, id) {
      const cur = rec(loanId);
      put(loanId, {
        receipts: cur.receipts.filter(r => r.id !== id),
        extensions: cur.extensions.map(e => e.receiptId === id
          ? Object.assign({}, e, { status: 'approved', paidDate: null, receiptId: null }) : e),
      });
    },
    setReceiptReconciled(loanId, id, on) {
      const receipts = rec(loanId).receipts.map(r => r.id === id
        ? Object.assign({}, r, { reconciled: !!on }) : r);
      put(loanId, { receipts });
    },
    // Writes the computed split onto the receipt (unpaid until released).
    setDistributions(loanId, id, rows) {
      const receipts = rec(loanId).receipts.map(r => r.id === id
        ? Object.assign({}, r, {
            distributions: rows.map(d => ({
              investorRef: d.investorRef,
              entitlement: Number(d.entitlement) || 0,
              amount: Number(d.amount) || 0,
              paidDate: d.paidDate || null,
            })),
          })
        : r);
      put(loanId, { receipts });
    },
    markDistributionPaid(loanId, id, investorRef, date) {
      const receipts = rec(loanId).receipts.map(r => r.id === id
        ? Object.assign({}, r, {
            distributions: r.distributions.map(d => d.investorRef === investorRef
              ? Object.assign({}, d, { paidDate: date || today() }) : d),
          })
        : r);
      put(loanId, { receipts });
    },
    releaseAll(loanId, id, date) {
      const receipts = rec(loanId).receipts.map(r => r.id === id
        ? Object.assign({}, r, {
            distributions: r.distributions.map(d => d.paidDate ? d
              : Object.assign({}, d, { paidDate: date || today() })),
          })
        : r);
      put(loanId, { receipts });
    },

    DEFAULT_UPLIFT: 0.03,   // p.a. added to the borrower rate past redemption
    addMonthsISO: addMonths,

    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    reset() { store = {}; persist(); emit(); },
  };

  // Redemption date after any ACTIVE extensions (approved-but-unpaid ones do
  // not move the date — payment is what activates them).
  window.effectiveRedemption = function (loan) {
    const base = loan.expectedRedemption;
    if (!base) return base;
    const months = window.CredXServicing.getExtensions(loan.id)
      .filter(e => e.status === 'active')
      .reduce((s, e) => s + (e.months || 0), 0);
    return months ? addMonths(base, months) : base;
  };

  // ── Accrual engine ──────────────────────────────────────────────────────────
  // Daily simple interest on the outstanding principal, accrued per tranche from
  // its drawdown date. The original net advance is the first tranche (dated at
  // completion, sized at gross so interest is charged on the gross facility, the
  // bridging convention); each capital drawdown is an extra tranche from its date.
  const DAY = 86400000;
  const dayDiff = (a, b) => {
    if (!a || !b) return 0;
    return Math.max(0, Math.round((new Date(b) - new Date(a)) / DAY));
  };

  window.computeLoanAccrual = function (loan, asOfISO) {
    const asOf = asOfISO || new Date().toISOString().slice(0, 10);
    const rate = loan.borrowerRate || 0;          // annual, decimal
    const retained = loan.interestType === 'Retained';
    const drawdowns = window.CredXServicing.getDrawdowns(loan.id)
      .slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    // Tranches: original gross facility at completion + each capital drawdown.
    const tranches = [{ amount: loan.grossLoan || 0, date: loan.completion, kind: 'facility' }]
      .concat(drawdowns.map(d => ({ amount: d.amount, date: d.date, kind: 'drawdown', id: d.id, note: d.note })));

    const drawdownTotal = drawdowns.reduce((s, d) => s + (d.amount || 0), 0);
    const principal = (loan.grossLoan || 0) + drawdownTotal;

    // Interest accrued to date (gross, per tranche, simple daily).
    let accruedInterest = 0;
    tranches.forEach(t => {
      const days = dayDiff(t.date, asOf);
      accruedInterest += (t.amount * rate * days) / 365;
    });

    const dailyInterest = (principal * rate) / 365;
    const daysElapsed = dayDiff(loan.completion, asOf);
    const redemption = window.effectiveRedemption(loan);
    const daysToRedemption = redemption
      ? Math.round((new Date(redemption) - new Date(asOf)) / DAY) : null;

    // Past the (extended) redemption date the facility runs at the borrower
    // rate plus a default uplift. The uplift element is tracked separately so
    // it can be shown, waived or invoiced on its own.
    const daysOverdue = redemption ? dayDiff(redemption, asOf) : 0;
    const defaultUplift = window.CredXServicing.DEFAULT_UPLIFT;
    const defaultInterest = (principal * defaultUplift * daysOverdue) / 365;

    // Interest already prepaid up front (retained loans) offsets what is owed.
    // Capital drawdowns are NOT covered by the original retained interest, so any
    // accrual beyond the prepaid amount is genuinely outstanding.
    const prepaid = retained ? (loan.retainedInterest || 0) : 0;
    // Interest prepaid to buy extension time is also credited against accrual.
    const extPrepaid = window.CredXServicing.getExtensions(loan.id)
      .filter(e => e.status === 'active')
      .reduce((s, e) => s + (e.interest || 0), 0);
    const interestOutstanding = Math.max(0, accruedInterest - prepaid - extPrepaid);

    // Interest formally posted via monthly periods is genuinely owed even if a
    // current period was applied ahead of full accrual — so the redemption figure
    // is principal + the GREATER of (accrued-but-outstanding) and (charged to date).
    const applied = window.CredXServicing.getApplied(loan.id);
    const totalApplied = applied.reduce((s, p) => s + (p.amount || 0), 0);
    const interestOwed = Math.max(interestOutstanding, totalApplied);
    const redemptionFigure = principal + interestOwed + defaultInterest;

    return {
      asOf, rate, retained, tranches, drawdowns, drawdownTotal,
      principal, accruedInterest, dailyInterest, daysElapsed, daysToRedemption,
      prepaid, extPrepaid, interestOutstanding, totalApplied, interestOwed, redemptionFigure,
      redemption, daysOverdue, defaultUplift, defaultInterest,
      baseGross: loan.grossLoan || 0,
    };
  };

  // ── Monthly interest periods ────────────────────────────────────────────────
  // Bridging interest is charged in monthly periods that align to CALENDAR
  // month-ends (the 30th / 31st / 28th). The first period runs from completion to
  // the end of that calendar month; each subsequent period is a whole calendar
  // month (1st → last day); the final period is capped at expected redemption.
  // Within each period interest ACCRUES DAILY: we sum daily interest across the
  // tranches outstanding during the period (so a mid-period capital drawdown is
  // charged pro-rata from its date). Periods can be "applied" (posted) one at a
  // time; applied periods are recorded in the servicing store.
  const firstOfNextMonth = (iso) => {
    const d = new Date(iso);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
  };
  const isoLess1 = (iso) => { const d = new Date(iso); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };

  window.computeInterestSchedule = function (loan, asOfISO) {
    const asOf = asOfISO || new Date().toISOString().slice(0, 10);
    const rate = loan.borrowerRate || 0;
    const retained = loan.interestType === 'Retained';
    const acc = window.computeLoanAccrual(loan, asOf);
    const tranches = acc.tranches;
    const applied = window.CredXServicing.getApplied(loan.id);
    const appliedByKey = {}; applied.forEach(p => { appliedByKey[p.key] = p; });

    // Period boundaries land on calendar month-ends, capped at expected redemption.
    const term = loan.termMonths || 12;
    const finalEnd = window.effectiveRedemption(loan) || (function () {
      const d = new Date(loan.completion); d.setUTCMonth(d.getUTCMonth() + term);
      return d.toISOString().slice(0, 10);
    })();
    const periods = [];
    let start = loan.completion;
    let i = 0;
    let guard = 0;
    while (guard++ < 600) {
      let end = firstOfNextMonth(start);   // exclusive end = 1st of next calendar month
      let capped = false;
      if (new Date(end) >= new Date(finalEnd)) { end = finalEnd; capped = true; }
      // Daily interest for [start, end): sum tranche.amount * rate * overlapDays / 365.
      let interest = 0;
      tranches.forEach(t => {
        const oStart = new Date(t.date) > new Date(start) ? t.date : start;
        if (new Date(oStart) >= new Date(end)) return;
        const days = Math.max(0, Math.round((new Date(end) - new Date(oStart)) / DAY));
        interest += (t.amount * rate * days) / 365;
      });
      const days = Math.max(0, Math.round((new Date(end) - new Date(start)) / DAY));
      const key = start;
      const displayEnd = capped ? finalEnd : isoLess1(end);   // last day actually in the period (month-end)
      const isApplied = !!appliedByKey[key];
      let status;
      if (isApplied) status = 'applied';
      else if (new Date(end) <= new Date(asOf)) status = 'due';
      else if (new Date(start) <= new Date(asOf)) status = 'current';
      else status = 'upcoming';
      periods.push({
        index: i + 1, key, start, end: displayEnd, rawEnd: end, days, amount: interest,
        status, applied: appliedByKey[key] || null,
      });
      start = end;
      i += 1;
      if (capped) break;
    }

    const totalApplied = applied.reduce((s, p) => s + (p.amount || 0), 0);
    const totalDue = periods.filter(p => p.status === 'due').reduce((s, p) => s + p.amount, 0);
    const nextDue = periods.find(p => p.status === 'due' || p.status === 'current') || null;
    return { asOf, rate, retained, periods, applied, totalApplied, totalDue, nextDue };
  };

  // ── Extension quote ─────────────────────────────────────────────────────────
  // The borrower pays the interest that WOULD accrue over the requested months
  // on the current principal at the existing borrower rate. The debt is not
  // increased. Alongside it we charge an arrangement fee (% of principal) and a
  // non-refundable application fee, both payable up front.
  window.computeExtensionQuote = function (loan, months, opts) {
    const o = opts || {};
    const acc = window.computeLoanAccrual(loan, o.asOf);
    const m = Number(months) || 0;
    const rate = o.rate != null ? Number(o.rate) : (loan.borrowerRate || 0);
    const principal = o.principal != null ? Number(o.principal) : acc.principal;
    const monthlyInterest = (principal * rate) / 12;
    const interest = monthlyInterest * m;
    const feePct = o.feePct != null ? Number(o.feePct) : 0.01;
    const fee = principal * feePct;
    const appFee = o.appFee != null ? Number(o.appFee) : 495;
    const fromDate = window.effectiveRedemption(loan);
    return {
      months: m, rate, principal, monthlyInterest, interest,
      feePct, fee, appFee, total: interest + fee + appFee,
      fromDate,
      newRedemption: fromDate ? window.CredXServicing.addMonthsISO(fromDate, m) : null,
    };
  };

  // ── Investor distribution ───────────────────────────────────────────────────
  // Each investor is entitled to interest on their own allocation at their own
  // rate for the months covered. If the receipt does not cover the full
  // entitlement, everyone is scaled down pro-rata by capital share of the
  // entitlement. Anything above the total entitlement is CredX margin.
  window.computeInterestDistribution = function (loan, allocations, amount, months) {
    const m = Number(months) || 0;
    const amt = Number(amount) || 0;
    const rows = (allocations || []).map(a => {
      const monthly = a.monthlyInterest != null
        ? a.monthlyInterest
        : ((a.amount || 0) * (a.rate || 0)) / 12;
      return {
        investorRef: a.investorRef,
        capital: a.amount || 0,
        rate: a.rate || 0,
        monthly,
        entitlement: monthly * m,
      };
    });
    const totalEntitlement = rows.reduce((s, r) => s + r.entitlement, 0);
    const short = amt < totalEntitlement - 0.005;
    const scale = totalEntitlement > 0 ? Math.min(1, amt / totalEntitlement) : 0;
    const out = rows.map(r => Object.assign({}, r, {
      amount: Math.round(r.entitlement * scale * 100) / 100,
      shortfall: short ? Math.round((r.entitlement - r.entitlement * scale) * 100) / 100 : 0,
    }));
    const distributed = out.reduce((s, r) => s + r.amount, 0);
    return {
      months: m, amount: amt, rows: out, totalEntitlement,
      distributed, margin: Math.max(0, amt - distributed),
      short, scale,
    };
  };

  // ── Loan interest account ───────────────────────────────────────────────────
  // The running account for a loan: what has been charged to the borrower, what
  // has actually been received, what has gone out to investors, and what CredX
  // has retained.
  window.computeInterestAccount = function (loan, allocations, asOfISO) {
    const asOf = asOfISO || new Date().toISOString().slice(0, 10);
    const acc = window.computeLoanAccrual(loan, asOf);
    const exts = window.CredXServicing.getExtensions(loan.id);
    const receipts = window.CredXServicing.getReceipts(loan.id);
    const applied = window.CredXServicing.getApplied(loan.id);

    const chargedPeriods = applied.reduce((s, p) => s + (p.amount || 0), 0);
    const activeExts = exts.filter(e => e.status === 'active');
    const chargedExtensions = activeExts.reduce((s, e) => s + (e.interest || 0), 0);
    const feesCharged = activeExts.reduce((s, e) => s + (e.fee || 0) + (e.appFee || 0), 0);
    const charged = chargedPeriods + chargedExtensions;

    const received = receipts.reduce((s, r) => s + (r.amount || 0), 0);
    const feesReceived = receipts.reduce((s, r) => s + (r.feesReceived || 0), 0);
    const allocated = receipts.reduce((s, r) =>
      s + r.distributions.reduce((t, d) => t + (d.amount || 0), 0), 0);
    const paidOut = receipts.reduce((s, r) =>
      s + r.distributions.filter(d => d.paidDate).reduce((t, d) => t + (d.amount || 0), 0), 0);
    const pendingRelease = allocated - paidOut;
    const undistributed = receipts
      .filter(r => r.distributions.length === 0)
      .reduce((s, r) => s + (r.amount || 0), 0);
    const unreconciled = receipts.filter(r => !r.reconciled).length;

    return {
      asOf, accrual: acc, extensions: exts, receipts,
      chargedPeriods, chargedExtensions, charged, feesCharged,
      received, feesReceived, allocated, paidOut, pendingRelease, undistributed,
      unreconciled,
      arrears: Math.max(0, charged - received),
      marginRetained: Math.max(0, received - allocated) + feesReceived,
      defaultInterest: acc.defaultInterest,
      daysOverdue: acc.daysOverdue,
    };
  };
})();
