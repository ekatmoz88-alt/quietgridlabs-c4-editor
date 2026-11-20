# QuietGridLabs C4 MCP server

The server exposes the signed-in user's cloud architecture projects to MCP clients over stdio.

## Requirements

- Node.js 20+
- A Supabase project with the migration in `../supabase/migrations` applied
- A user-scoped Supabase access token (never a service-role key)

## Run

```bash
cd mcp-server
npm install
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY \
SUPABASE_ACCESS_TOKEN=USER_ACCESS_TOKEN \
npm start
```

## Cursor / Claude Code

Configure an stdio MCP server with command `node`, args `["/absolute/path/to/quietgridlabs-c4-editor/mcp-server/index.js"]`, and the three environment variables above. Keep the access token in the MCP client's secret/environment manager; do not commit it.

## Tools

- `list_projects` — list projects visible to the authenticated user.
- `read_project` — read one complete project snapshot.
- `search_project` — search C4 elements, docs, PlantUML and ER models.
- `apply_project_update` — validate and replace a project snapshot with explicit confirmation and optimistic revision checking.

All database access uses the caller's user token. Row Level Security is the authorization boundary; no service-role credential is used. Write operations require `confirmed: true` and the expected revision.
