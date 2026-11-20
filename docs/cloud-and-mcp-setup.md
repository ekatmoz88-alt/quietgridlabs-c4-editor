# Cloud storage and MCP setup

## 1. Configure Supabase

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/migrations/202611200001_cloud_projects.sql`.
3. Confirm that the `cloud_projects` table has Row Level Security enabled and the four owner policies are present.
4. Copy the project URL and publishable (or legacy anon) key.
5. Add the values from `.env.example` to the Vite build environment. For GitHub Pages, configure repository Actions variables/secrets and pass them to the Pages build workflow. The publishable key is intended for browser use; never add a service-role key to Vite variables.

The current cloud implementation provides private per-user project storage. It does not yet implement team invitations, editor/viewer roles or live multi-user collaboration.

## 2. Use cloud storage

Open the **Cloud** view in the editor, create an account or sign in, then choose **Upload project**. Select an existing cloud project to save a new revision or load it into the local editor. Updates use an expected revision; a concurrent update produces a conflict instead of silently overwriting newer data.

LocalStorage remains the default. Upload and restore are explicit user actions.

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

The MCP server currently uses a static user access token supplied by the MCP host environment. Token refresh/OAuth hand-off and team-level permissions are not implemented yet.
