# Cloud storage and MCP setup

## 1. Configure Supabase

1. Create or open the Supabase project.
2. Apply the migrations in `supabase/migrations/` in version order:
   - `20261120125403_create_cloud_projects.sql`
   - `20261120125410_create_private_c4_backup_bucket.sql`
   - `20261120164952_restrict_rls_auto_enable_execute.sql`
3. Confirm that `public.cloud_projects` has Row Level Security enabled and the four owner-only policies are present.
4. Copy the project URL and its publishable key (or legacy anon key). Never use the service-role key in browser code.

### Configure email authentication

In **Authentication → URL Configuration** set:

- **Site URL:** `https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/`
- **Redirect URLs:** allow the same exact URL. Add `http://localhost:5173/**` only if local development needs email confirmation redirects.

The current REST-based signup request does not pass a custom `redirect_to`; Supabase therefore uses the configured Site URL. With email confirmations enabled, a user confirms the link and then returns to the app to sign in manually.

In **Authentication → Providers → Email**, check whether email confirmations are enabled. Signup requires working email delivery. Supabase's default email service is for limited testing; configure custom SMTP before relying on production signups. Do not disable email confirmation just to make the UI appear to work.

### Configure GitHub Pages

Add these repository-level **Actions variables** (not secrets) under **Settings → Secrets and variables → Actions → Variables**:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://wbmtkiyxcupcusmkfjqc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable key (or legacy anon key) |

The publishable/anon key is designed to be exposed in a browser bundle; database access must remain protected by RLS. Never store a service-role key in a Vite variable, GitHub Actions variable, or browser bundle.

The CI and Pages workflows read these exact variable names. After adding them, rerun **Deploy C4 Editor to GitHub Pages** and confirm the Cloud panel says **Backend configured**. If it says **Not configured**, one or both variables were not injected into the build.

For local development, copy `.env.example` to `.env.local` and set the same two values.

The current cloud implementation provides private per-user project storage with optimistic revision checks. Team invitations, shared roles, realtime collaboration and ZIP backup upload/download to Supabase Storage are not implemented yet. JSON/ZIP backup and restore remain local browser features.

## 2. Use cloud storage

Open the **Cloud** view in the editor, create an account or sign in, then choose **Upload project**. Select an existing cloud project to save a new revision or load it into the local editor. Updates use an expected revision; a concurrent update produces a conflict instead of silently overwriting newer data.

LocalStorage remains the default. Cloud upload and restore are explicit user actions.

## 3. Configure the MCP server

The standalone server is in `mcp-server/`:

```bash
cd mcp-server
npm install
cp .env.example .env
# Fill in the Supabase URL, publishable key and a user access token
npm start
```

Configure Cursor or Claude Code as an stdio server:

```json
{
  "mcpServers": {
    "quietgridlabs-c4": {
      "command": "node",
      "args": ["/absolute/path/to/quietgridlabs-c4-editor/mcp-server/index.js"],
      "env": {
        "SUPABASE_URL": "https://YOUR_PROJECT_REF.supabase.co",
        "SUPABASE_ANON_KEY": "YOUR_PUBLISHABLE_OR_ANON_KEY",
        "SUPABASE_ACCESS_TOKEN": "USER_SCOPED_ACCESS_TOKEN"
      }
    }
  }
}
```

Use a user-scoped access token. The server deliberately rejects missing credentials and must never be configured with a Supabase service-role key. Database row-level security remains the authorization boundary.

Available tools:

- `list_projects`
- `read_project`
- `search_project`
- `apply_project_update` (requires `confirmed: true`, validates the project schema and checks the expected revision)

The MCP server currently uses a static user access token supplied by the MCP host. Token refresh/OAuth hand-off and team-level permissions are not implemented yet.