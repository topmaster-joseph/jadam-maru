(async () => {
  const SUPABASE_URL = 'https://renzehysxirjilvdxacv.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
  const ACCESS = SUPABASE_URL + '/functions/v1/access-api';
  const MARKETING_API = 'https://marketing-api.ekodi.kr';
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  window.EKODI_MARKETING_AUTH_PENDING = true;

  const notify = authenticated => {
    window.EKODI_MARKETING_AUTH_PENDING = false;
    window.dispatchEvent(new CustomEvent('ekodi:auth-ready', { detail: { authenticated: Boolean(authenticated) } }));
  };
  const churchish = item => /church|교회/.test([
    item?.workspace_name, item?.workspace_key, item?.workspace_kind,
    item?.tenant_id, item?.tenant, item?.store_name
  ].map(value => String(value || '').toLowerCase()).join(' '));
  const active = item => ['active', 'pre_registered'].includes(String(item?.status || ''));

  let secure = null;
  try {
    const response = await fetch(MARKETING_API + '/api/marketing/handoff/consume', {
      method: 'POST', credentials: 'include', cache: 'no-store'
    });
    if (response.ok && response.status !== 204) secure = await response.json();
  } catch (error) {
    console.warn('Church Marketing AI secure handoff unavailable', error);
  }

  const tokenHash = secure?.tokenHash || hash.get('ekodi_token');
  const tokenType = secure?.type || hash.get('ekodi_type') || 'email';
  const requestedWorkspace = secure?.workspace?.workspace_key || hash.get('ekodi_workspace') || '';

  let createClient = null;
  try {
    ({ createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'));
  } catch (primary) {
    try { ({ createClient } = await import('https://esm.sh/@supabase/supabase-js@2?bundle')); }
    catch (fallback) {
      console.error('Church Marketing AI auth client unavailable', primary, fallback);
      notify(false);
      return;
    }
  }

  const sb = createClient(SUPABASE_URL, PUBLISHABLE_KEY, { auth: { detectSessionInUrl: true, persistSession: true } });
  if (tokenHash) {
    const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: tokenType });
    if (error) console.warn('Church Marketing AI central handoff failed', error);
  }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    notify(false);
    return;
  }

  if (tokenHash) history.replaceState({}, document.title, location.pathname + location.search);
  let list = [];
  try {
    const response = await fetch(ACCESS + '/workspaces?site=marketing', {
      headers: { apikey: PUBLISHABLE_KEY, Authorization: 'Bearer ' + session.access_token },
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      list = Array.isArray(data.workspaces) ? data.workspaces : [];
    }
  } catch (error) {
    console.warn('Church Marketing AI workspace lookup failed', error);
  }

  let selected = requestedWorkspace ? list.find(item => item?.workspace_key === requestedWorkspace && active(item)) : null;
  if (selected && !churchish(selected)) selected = null;
  if (!selected) selected = list.find(item => active(item) && churchish(item)) || null;
  if (!selected) {
    window.dispatchEvent(new CustomEvent('ekodi:workspace-ready', { detail: {} }));
    notify(true);
    return;
  }

  const context = Object.freeze({
    workspaceKey: selected.workspace_key || null,
    workspaceKind: selected.workspace_kind || null,
    workspaceName: selected.workspace_name || null,
    tenantId: selected.tenant_id || null,
    tenant: selected.tenant || null,
    storeId: selected.store_id || null,
    storeName: selected.store_name || null,
    role: selected.role || null,
    plan: selected.plan || 'free',
    status: selected.status || null,
    source: selected.source || null
  });
  window.EKODI_MARKETING_CONTEXT = context;
  window.EKODI_MARKETING_AUTH_TOKEN = session.access_token;
  document.body.dataset.ekodiWorkspace = context.workspaceKey || '';
  window.dispatchEvent(new CustomEvent('ekodi:workspace-ready', { detail: context }));
  notify(true);
})();
