const config = {
  url: import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, ''),
  key: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const cloudConfigured = Boolean(config.url && config.key);
const authKey = 'quietgridlabs-cloud-session';

function headers(token) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${token || config.key}`,
    'Content-Type': 'application/json',
  };
}
async function request(path, options = {}, token, retried = false) {
  if (!cloudConfigured) throw new Error('Cloud storage is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  const response = await fetch(`${config.url}${path}`, { ...options, headers: { ...headers(token), ...options.headers } });
  if (response.status === 401 && !retried && !path.startsWith('/auth/v1/token')) {
    const session = getCloudSession();
    if (session?.refresh_token) {
      const refreshed = await fetch(config.url + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: headers(), body: JSON.stringify({ refresh_token: session.refresh_token }) });
      const nextSession = await refreshed.json().catch(() => null);
      if (refreshed.ok && nextSession?.access_token) { saveSession(nextSession); return request(path, options, nextSession.access_token, true); }
      saveSession(null);
    }
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.msg || payload?.message || payload?.error_description || `Cloud request failed (HTTP ${response.status}).`);
  return payload;
}
export function getCloudSession() {
  try { return JSON.parse(localStorage.getItem(authKey) || 'null'); } catch { return null; }
}
function saveSession(session) {
  if (session) localStorage.setItem(authKey, JSON.stringify(session));
  else localStorage.removeItem(authKey);
}
export async function signIn(email, password) {
  const session = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
  saveSession(session);
  return session;
}
export async function signUp(email, password) {
  const result = await request('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (result.access_token) saveSession(result);
  return result;
}
export async function signOut() {
  const session = getCloudSession();
  try {
    if (session?.access_token) await request('/auth/v1/logout', { method: 'POST' }, session.access_token);
  } finally {
    // Always clear local credentials, even when the network or Supabase logout endpoint fails.
    saveSession(null);
  }
}
export async function listCloudProjects() {
  const session = getCloudSession();
  if (!session?.access_token) throw new Error('Sign in to view cloud projects.');
  return request('/rest/v1/cloud_projects?select=id,name,revision,updated_at&order=updated_at.desc', {}, session.access_token);
}
export async function createCloudProject(project) {
  const session = getCloudSession();
  if (!session?.access_token) throw new Error('Sign in to save to cloud.');
  const rows = await request('/rest/v1/cloud_projects?select=id,name,revision,updated_at', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ name: project.name, project_data: project }),
  }, session.access_token);
  return rows[0];
}
export async function updateCloudProject(id, project, revision) {
  const session = getCloudSession();
  if (!session?.access_token) throw new Error('Sign in to save to cloud.');
  const rows = await request(`/rest/v1/cloud_projects?id=eq.${encodeURIComponent(id)}&revision=eq.${revision}&select=id,name,revision,updated_at`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ name: project.name, project_data: project, revision: revision + 1, updated_at: new Date().toISOString() }),
  }, session.access_token);
  if (!rows.length) throw new Error('Cloud revision conflict: the project changed on the server. Reload it before saving.');
  return rows[0];
}
export async function loadCloudProject(id) {
  const session = getCloudSession();
  if (!session?.access_token) throw new Error('Sign in to load cloud projects.');
  const rows = await request(`/rest/v1/cloud_projects?id=eq.${encodeURIComponent(id)}&select=id,name,project_data,revision,updated_at`, {}, session.access_token);
  if (!rows.length) throw new Error('Cloud project not found or access denied.');
  return rows[0];
}
