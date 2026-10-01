const form = document.querySelector('#admin-login-form');
const status = document.querySelector('#login-status');
const submit = form.querySelector('button[type="submit"]');
const query = new URLSearchParams(window.location.search);
const apiUrl = window.CredXAdminAuth.apiBase();

if (query.get('reason') === 'session') {
  status.textContent = 'Your admin session ended. Sign in to continue.';
  status.hidden = false;
}

if (!apiUrl) {
  const contact = document.createElement('a');
  contact.href = 'mailto:info@credx.co.uk?subject=Admin%20portal%20access';
  contact.textContent = 'request access from CredX Operations';
  status.replaceChildren(
    document.createTextNode('Admin sign-in is not configured for this deployment. '),
    contact,
    document.createTextNode('. Admin accounts are provisioned individually; no shared deployment credentials are available.')
  );
  status.hidden = false;
  form.querySelectorAll('input, button[type="submit"]').forEach(control => { control.disabled = true; });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!apiUrl) return;
  status.hidden = true;
  submit.disabled = true;
  submit.textContent = 'Signing in…';
  const fields = new FormData(form);
  try {
    await window.CredXAdminAuth.signIn(String(fields.get('email') || '').trim(), String(fields.get('password') || ''));
    window.location.assign('/design/standalone.html');
  } catch (error) {
    if (error?.name === 'AbortError') {
      status.textContent = 'The admin API did not respond within 7 seconds. Check that the API is running and retry.';
    } else if (error instanceof TypeError && /fetch/i.test(error.message)) {
      status.textContent = `Cannot reach the admin API at ${window.CredXAdminAuth.apiBase()}. Check the API URL and CORS settings.`;
    } else {
      status.textContent = error.message || 'Unable to sign in.';
    }
    status.hidden = false;
    submit.disabled = false;
    submit.textContent = 'Sign in';
  }
});
