// CredX — Custom deal alerts store.
// User-defined reminders attached to a deal (or general). The intended source
// is "set on a deal at completion" (a follow-up the originator wants flagging
// later — chase a guarantee, instruct a re-valuation, confirm a standing order)
// but alerts can be added at any time from the dashboard Alerts section.
// localStorage-backed with the same subscribe() pattern as CredXServicing so
// the dashboard re-renders the moment an alert is added or dismissed.
//
// Exposes window.CredXAlerts — all / add / update / dismiss / restore / remove / subscribe / reset
(function () {
  const KEY = 'credx-alerts-v1';
  const subs = new Set();

  // Seed examples represent alerts captured against live deals at completion.
  // Dates are computed relative to "today" so they always read as current.
  function seed() {
    const d = (offsetDays) => {
      const t = new Date();
      t.setDate(t.getDate() + offsetDays);
      return t.toISOString().slice(0, 10);
    };
    return [
      {
        id: 'ca-seed-1', loanId: 'CXP-522', title: 'Collect signed personal guarantee',
        note: 'Guarantor PG outstanding at completion — chase executed copy for the file.',
        dueDate: d(-3), createdAt: d(-40), setAt: 'completion', dismissed: false,
      },
      {
        id: 'ca-seed-2', loanId: 'CXP-517', title: 'Confirm weekly C+I standing order',
        note: 'Borrower to confirm the weekly capital + interest standing order is live with their bank.',
        dueDate: d(4), createdAt: d(-30), setAt: 'completion', dismissed: false,
      },
      {
        id: 'ca-seed-3', loanId: 'VHL-18', title: 'Instruct drive-by re-valuation',
        note: 'Order a drive-by re-inspection ahead of the maturity / exit conversation.',
        dueDate: d(11), createdAt: d(-20), setAt: 'completion', dismissed: false,
      },
    ];
  }

  function load() {
    try {
      const j = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(j)) return j;
    } catch (e) {}
    const s = seed();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  let store = load();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function emit() { subs.forEach(fn => { try { fn(); } catch (e) {} }); }

  window.CredXAlerts = {
    all() { return store.slice(); },
    active() { return store.filter(a => !a.dismissed); },
    add(a) {
      const rec = {
        id: 'ca-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        loanId: a.loanId || '',
        title: (a.title || '').trim() || 'Untitled alert',
        note: (a.note || '').trim(),
        dueDate: a.dueDate || null,
        createdAt: new Date().toISOString().slice(0, 10),
        setAt: a.setAt || 'manual',
        dismissed: false,
      };
      store = store.concat(rec);
      persist(); emit();
      return rec;
    },
    update(id, patch) {
      store = store.map(a => a.id === id ? Object.assign({}, a, patch) : a);
      persist(); emit();
    },
    dismiss(id) {
      store = store.map(a => a.id === id ? Object.assign({}, a, { dismissed: true }) : a);
      persist(); emit();
    },
    restore(id) {
      store = store.map(a => a.id === id ? Object.assign({}, a, { dismissed: false }) : a);
      persist(); emit();
    },
    remove(id) {
      store = store.filter(a => a.id !== id);
      persist(); emit();
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    reset() { store = seed(); persist(); emit(); },
  };
})();
