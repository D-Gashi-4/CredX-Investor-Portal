(() => {
  const SESSION_KEY = 'credx-admin-session-v1';
  const TIMEOUT_MS = 7000;
  const roles = ['ADMIN', 'STAFF'];

  function isLocalDemo() {
    const hostname = window.location.hostname;
    return ['localhost', '127.0.0.1'].includes(hostname) || hostname.endsWith('.localhost');
  }

  function apiBase() {
    const configured = window.CREDX_API_URL?.trim();
    if (configured) return configured.replace(/\/+$/, '');
    if (isLocalDemo()) {
      const apiHost = window.location.hostname.endsWith('.localhost') ? 'localhost' : window.location.hostname;
      return `${window.location.protocol}//${apiHost}:4000`;
    }
    return null;
  }

  async function request(path, { token, ...options } = {}) {
    const base = apiBase();
    if (!base) throw new Error('Admin sign-in is not configured for this deployment. Set CREDX_API_URL to the HTTPS API URL.');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      return await fetch(`${base}${path}`, { ...options, headers, signal: controller.signal });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function signIn(email, password) {
    const response = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Sign-in failed (${response.status}).`);
    if (!roles.includes(result.user?.role)) {
      if (result.token) {
        await request('/api/auth/logout', { method: 'POST', token: result.token }).catch(() => {});
      }
      throw new Error('This account does not have admin access.');
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
    return result.user;
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  async function verifySession() {
    let session;
    try { session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { session = null; }
    if (!session?.token || !roles.includes(session.user?.role)) return false;
    if (session.expiresAt && Date.parse(session.expiresAt) <= Date.now()) {
      clearSession();
      return false;
    }
    try {
      const response = await request('/api/me', { token: session.token });
      if (!response.ok) {
        clearSession();
        return false;
      }
      const user = await response.json();
      if (!roles.includes(user.role)) {
        clearSession();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async function signOut() {
    let session;
    try { session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { session = null; }
    try {
      if (session?.token && apiBase()) await request('/api/auth/logout', { method: 'POST', token: session.token, keepalive: true });
    } catch {}
    clearSession();
    window.location.assign('/login.html');
  }

  window.CredXAdminAuth = { apiBase, isLocalDemo, signIn, verifySession, signOut };
})();
