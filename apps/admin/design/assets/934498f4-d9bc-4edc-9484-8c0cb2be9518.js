// ─────────────────────────────────────────────────────────────────
// CredX Bridge — shared data layer between the employee backend
// (CredX Platform.html) and the investor portal (index.html).
//
// Both apps are separate self-contained files served from the same
// origin, so they share one localStorage key. The backend is the
// master: it WRITES posted deals, deal updates and investor documents;
// the portal READS them. The portal WRITES investor account-change
// submissions; the backend reads + approves them.
//
// Flow recap (set by product):
//   • A loan is posted to the investor Opportunities page only once
//     Investment thesis + Documents + Property/valuation + DIP are
//     complete in the backend.
//   • Marking the loan "live" in the backend flips the opportunity to
//     a "Now live / funding closed" state (it stays on Opportunities).
//   • Investors uploading docs / editing details creates a submission
//     that requires backend approval.
//
// This file is loaded as a plain <script> (NOT babel) BEFORE the app
// scripts in both files, so window.CredXBridge exists at first paint.
// ─────────────────────────────────────────────────────────────────
(function () {
  const KEY = "credx_bridge_v1";
  const CHANGE_EVT = "credx-bridge-change";

  const DEFAULT = {
    postedDeals: [],     // opportunity-shaped objects (+ lifecycle, loanId, postedAt)
    updates: [],         // investor-facing updates feed entries
    investorDocs: {},    // { [investorRef]: [ {id,name,category,by,date,status} ] }
    nda: {},             // { [investorRef]: { signed, signedAt, fileName, by } }
    submissions: [],     // investor → backend change requests pending approval
    notifPrefs: null,    // investor notification preferences (mirrored)
    allocations: [],     // backend-created investor↔loan allocations
    removedAllocs: [],   // seed allocations pulled off a pre-completion deal (stable keys)
    fundingByLoan: {},   // { [loanId]: totalCommitted } published by the backend (seed+live−removed) for the portal's % funded
    agreements: [],      // generated facility agreements (metadata)
    seq: 1,
  };

  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      return Object.assign({}, DEFAULT, raw);
    } catch (e) {
      return Object.assign({}, DEFAULT);
    }
  }

  function write(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* quota / private mode - ignore */ }
    // notify same-document listeners (storage event only fires cross-document)
    try { window.dispatchEvent(new CustomEvent(CHANGE_EVT)); } catch (e) {}
    return state;
  }

  function mutate(fn) {
    const s = read();
    fn(s);
    return write(s);
  }

  function nextId(prefix) {
    let id;
    mutate(s => { id = (prefix || "id") + "-" + s.seq; s.seq += 1; });
    return id;
  }

  // ---- Posted deals ------------------------------------------------
  function getPostedDeals() { return read().postedDeals; }

  function upsertPostedDeal(deal) {
    mutate(s => {
      const i = s.postedDeals.findIndex(d => d.id === deal.id);
      if (i >= 0) s.postedDeals[i] = Object.assign({}, s.postedDeals[i], deal);
      else s.postedDeals.unshift(deal);
    });
  }

  function removePostedDeal(id) {
    mutate(s => { s.postedDeals = s.postedDeals.filter(d => d.id !== id); });
  }

  function setDealLifecycle(id, lifecycle) {
    mutate(s => {
      const d = s.postedDeals.find(x => x.id === id);
      if (d) d.lifecycle = lifecycle;
    });
  }

  function isPosted(loanId) {
    return read().postedDeals.some(d => d.loanId === loanId);
  }

  // ---- Updates feed ------------------------------------------------
  function getUpdates() { return read().updates; }

  function pushUpdate(update) {
    mutate(s => {
      if (!s.updates.some(u => u.id === update.id)) s.updates.unshift(update);
    });
  }

  // ---- Investor documents -----------------------------------------
  function getInvestorDocs(ref) { return read().investorDocs[ref] || []; }

  function addInvestorDoc(ref, doc) {
    mutate(s => {
      if (!s.investorDocs[ref]) s.investorDocs[ref] = [];
      s.investorDocs[ref].unshift(doc);
    });
  }

  function removeInvestorDoc(ref, docId) {
    mutate(s => {
      if (s.investorDocs[ref]) s.investorDocs[ref] = s.investorDocs[ref].filter(d => d.id !== docId);
    });
  }

  // ---- NDA ---------------------------------------------------------
  function getNda(ref) { return read().nda[ref] || null; }

  function setNda(ref, payload) {
    mutate(s => { s.nda[ref] = Object.assign({}, s.nda[ref], payload); });
  }

  // ---- Submissions (investor → backend, needs approval) -----------
  function getSubmissions(ref) {
    const all = read().submissions;
    return ref ? all.filter(x => x.ref === ref) : all;
  }

  function addSubmission(sub) {
    const id = nextId("sub");
    mutate(s => {
      s.submissions.unshift(Object.assign({
        id, status: "pending", submittedAt: new Date().toISOString(),
      }, sub));
    });
    return id;
  }

  function setSubmissionStatus(id, status, note) {
    mutate(s => {
      const x = s.submissions.find(y => y.id === id);
      if (x) { x.status = status; x.resolvedAt = new Date().toISOString(); if (note != null) x.note = note; }
    });
  }

  function pendingCount() {
    return read().submissions.filter(x => x.status === "pending").length;
  }

  // ---- Notification prefs (mirror) --------------------------------
  function getNotifPrefs() { return read().notifPrefs; }
  function setNotifPrefs(prefs) { mutate(s => { s.notifPrefs = prefs; }); }

  // ---- Allocations (backend-created, live) ------------------------
  // Investor↔loan allocations added via the "New allocation" flow.
  // Stored here so they persist and show across tabs (the investor
  // page opens in its own tab and must see allocations created in it).
  function getAllocations() { return read().allocations || []; }
  function addAllocation(a) {
    const id = a.id || nextId("alloc");
    mutate(s => {
      if (!s.allocations) s.allocations = [];
      s.allocations.unshift(Object.assign({ id, createdAt: new Date().toISOString() }, a));
    });
    return id;
  }
  function removeAllocation(id) {
    mutate(s => { s.allocations = (s.allocations || []).filter(a => a.id !== id); });
  }

  // ---- Removed seed allocations -----------------------------------
  // Seed allocations live in CREDX_DATA (read-only), so pulling one off a
  // pre-completion deal can't mutate it. Instead we record a stable key here
  // and EVERY consumer (backend views, investor page, funding calc) filters
  // these out — so the removal persists across reloads and across tabs.
  function seedAllocKey(a) {
    if (!a) return "";
    return [a.investorRef, a.loanId, a.amount != null ? a.amount : ""].join("::");
  }
  function getRemovedAllocs() { return read().removedAllocs || []; }
  function isAllocRemoved(a) { return (read().removedAllocs || []).includes(seedAllocKey(a)); }
  function removeSeedAllocation(a) {
    const key = seedAllocKey(a);
    mutate(s => {
      if (!s.removedAllocs) s.removedAllocs = [];
      if (!s.removedAllocs.includes(key)) s.removedAllocs.push(key);
    });
  }
  function restoreSeedAllocation(a) {
    const key = seedAllocKey(a);
    mutate(s => { s.removedAllocs = (s.removedAllocs || []).filter(k => k !== key); });
  }

  // ---- Funding by loan (published by the backend) -----------------
  // The backend is the source of truth for who is allocated to each loan
  // (seed book + live allocations − removed). It sums committed capital per
  // loanId and publishes the map here so the investor portal can render an
  // accurate "% funded" without access to the backend's seed data. Written
  // only when the totals actually change, to avoid subscribe → write loops.
  function getFundingByLoan() { return read().fundingByLoan || {}; }
  function setFundingByLoan(map) {
    const next = map || {};
    const cur = read().fundingByLoan || {};
    const same = JSON.stringify(cur) === JSON.stringify(next);
    if (same) return;
    mutate(s => { s.fundingByLoan = next; });
  }

  // ---- Generated facility agreements ------------------------------
  function getAgreements(ref) {
    const all = read().agreements || [];
    return ref ? all.filter(a => a.investorRef === ref) : all;
  }
  function addAgreement(doc) {
    const id = doc.id || nextId("fa");
    mutate(s => {
      if (!s.agreements) s.agreements = [];
      s.agreements.unshift(Object.assign({ id, createdAt: new Date().toISOString() }, doc));
    });
    return id;
  }

  // ---- Subscribe to changes (same-doc custom event + cross-doc storage)
  function subscribe(cb) {
    const onCustom = () => cb();
    const onStorage = (e) => { if (e.key === KEY) cb(); };
    window.addEventListener(CHANGE_EVT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }

  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} write(Object.assign({}, DEFAULT)); }

  window.CredXBridge = {
    KEY, read, write,
    getPostedDeals, upsertPostedDeal, removePostedDeal, setDealLifecycle, isPosted,
    getUpdates, pushUpdate,
    getInvestorDocs, addInvestorDoc, removeInvestorDoc,
    getNda, setNda,
    getSubmissions, addSubmission, setSubmissionStatus, pendingCount,
    getNotifPrefs, setNotifPrefs,
    getAllocations, addAllocation, removeAllocation,
    seedAllocKey, getRemovedAllocs, isAllocRemoved, removeSeedAllocation, restoreSeedAllocation,
    getFundingByLoan, setFundingByLoan,
    getAgreements, addAgreement,
    subscribe, nextId, reset,
  };
})();
