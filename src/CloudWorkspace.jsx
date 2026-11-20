import { useEffect, useState } from 'react';
import {
  cloudConfigured, getCloudSession, signIn, signUp, signOut,
  listCloudProjects, createCloudProject, updateCloudProject, loadCloudProject,
} from './cloudClient.js';

export default function CloudWorkspace({ project, onLoad }) {
  const [session, setSession] = useState(() => getCloudSession());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [revision, setRevision] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session?.access_token && cloudConfigured) {
      listCloudProjects().then(setProjects).catch((error) => setStatus(error.message));
    }
  }, [session?.access_token]);

  const run = async (action) => {
    setBusy(true); setStatus('');
    try { await action(); } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  };
  const authenticate = (mode) => run(async () => {
    const next = mode === 'signup' ? await signUp(email, password) : await signIn(email, password);
    setSession(next);
    setPassword('');
    setShowPassword(false);
    setStatus(next.access_token ? 'Signed in.' : 'Check your email to confirm your account, then sign in.');
    if (next.access_token) setProjects(await listCloudProjects());
  });
  const save = () => run(async () => {
    const result = selectedId && revision !== null
      ? await updateCloudProject(selectedId, project, revision)
      : await createCloudProject(project);
    setSelectedId(result.id); setRevision(result.revision); setProjects(await listCloudProjects());
    setStatus('Cloud project saved.');
  });
  const load = () => run(async () => {
    if (!selectedId) throw new Error('Choose a cloud project first.');
    const result = await loadCloudProject(selectedId);
    setRevision(result.revision); onLoad(result.project_data); setStatus('Cloud project loaded.');
  });
  const select = (id) => {
    setSelectedId(id);
    const item = projects.find((entry) => entry.id === id);
    setRevision(item?.revision ?? null);
  };

  return (
    <section className="cloud-workspace">
      <div className="diagram-studio-header">
        <div><div className="field-label">OPTIONAL REMOTE STORAGE</div><h2>Cloud workspace</h2><p>Local projects stay in this browser until you explicitly save them to your account.</p></div>
        <span className={cloudConfigured ? 'cloud-status ready' : 'cloud-status'}>{cloudConfigured ? 'Backend configured' : 'Not configured'}</span>
      </div>
      {!cloudConfigured ? (
        <div className="cloud-notice">Configure a Supabase project and add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to the deployment environment. Apply the SQL migration in <code>supabase/migrations</code> first.</div>
      ) : !session?.access_token ? (
        <div className="cloud-auth">
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input style={{ flex: 1, minWidth: 0 }} type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button
                type="button"
                className="secondary-button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >{showPassword ? 'Скрыть' : 'Показать'}</button>
            </div>
          </label>
          <div className="diagram-actions"><button className="primary-button" disabled={busy || !email || !password} onClick={() => authenticate('signin')}>Sign in</button><button className="secondary-button" disabled={busy || !email || password.length < 8} onClick={() => authenticate('signup')}>Create account</button></div>
        </div>
      ) : (
        <div className="cloud-controls">
          <p>Signed in as <strong>{session.user?.email || 'account'}</strong></p>
          <label>Cloud project<select value={selectedId} onChange={(event) => select(event.target.value)}><option value="">Create a new cloud copy</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.name} · revision {item.revision}</option>)}</select></label>
          <div className="diagram-actions"><button className="primary-button" disabled={busy} onClick={save}>{selectedId ? 'Save new revision' : 'Upload project'}</button><button className="secondary-button" disabled={busy || !selectedId} onClick={load}>Load selected</button><button className="secondary-button" onClick={() => { const currentSession = getCloudSession(); if (!currentSession?.access_token) { setStatus('Cloud session expired. Sign in again.'); return; } navigator.clipboard.writeText(currentSession.access_token).then(() => setStatus('Current MCP access token copied. Store it as SUPABASE_ACCESS_TOKEN in your MCP host.')).catch(() => setStatus('Clipboard access is unavailable in this browser.')); }}>Copy MCP token</button><button className="secondary-button" disabled={busy} onClick={() => run(async () => { await signOut(); setSession(null); setPassword(''); setShowPassword(false); setProjects([]); setSelectedId(''); setRevision(null); })}>Sign out</button></div>
        </div>
      )}
      {status && <p className="cloud-status-message" role="status">{status}</p>}
    </section>
  );
}
