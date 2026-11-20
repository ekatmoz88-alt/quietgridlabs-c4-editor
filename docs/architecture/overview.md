# Editor architecture

This document describes the architecture of QuietGridLabs C4 Editor itself.

## System context

```mermaid
flowchart LR
    person["Architecture author"]
    editor["QuietGridLabs C4 Editor<br/>Browser application"]
    kroki["Kroki renderer<br/>PlantUML / Mermaid"]
    supabase["Supabase<br/>Auth + Postgres + RLS"]
    mcp["MCP server<br/>stdio process"]
    client["AI client<br/>Cursor / Claude Code"]

    person -->|"models, documents, diagrams"| editor
    editor -->|"explicit preview request"| kroki
    editor <-->|"optional sign-in, save and load"| supabase
    client <-->|"MCP tools"| mcp
    mcp <-->|"user-scoped token / RLS"| supabase
```

## Container and runtime view

```mermaid
flowchart TB
    subgraph browser["Browser — GitHub Pages"]
        app["React application"]
        canvas["C4 canvas<br/>React Flow"]
        docs["Element documentation<br/>Markdown editor / preview"]
        studio["Diagram Studio<br/>PlantUML + structured ER"]
        storage[("LocalStorage<br/>project snapshot")]
        app --> canvas
        app --> docs
        app --> studio
        app <--> storage
    end

    subgraph external["Optional external services"]
        renderer["Kroki HTTP API"]
        auth["Supabase Auth"]
        db[("PostgreSQL<br/>RLS-protected cloud_projects")]
    end

    studio -->|"render on demand"| renderer
    app <-->|"REST/Auth when configured"| auth
    app <-->|"owner-scoped REST"| db

    subgraph ai["AI client environment"]
        mcp["Node.js MCP server"]
        client["Cursor / Claude Code"]
        client <-->|"stdio"| mcp
    end
    mcp <-->|"Supabase REST + user token"| auth
    mcp <-->|"RLS-protected project data"| db
```

## Project data flow

```mermaid
flowchart TD
    input["User edits C4 model, Markdown or diagram"]
    state["React application state"]
    local[("Browser LocalStorage")]
    export["JSON / ZIP export"]
    validate["Schema and archive validation"]
    restore["Restore project state"]
    cloud["Optional Supabase save/load"]

    input --> state
    state -->|"persist"| local
    state -->|"export"| export
    export -->|"import"| validate
    validate -->|"valid project"| restore
    restore --> state
    state <-->|"explicit cloud action"| cloud
```

## Trust and data boundaries

- The browser's LocalStorage is the default persistence layer; a cloud account is not required for local modeling and documentation.
- Diagram source is sent to Kroki only when the user explicitly requests a preview.
- Supabase is optional. Database Row Level Security enforces owner-scoped project access.
- The MCP server is a separate process. It uses a user-scoped access token and must not use a Supabase service-role key.
- JSON and ZIP imports are validated before the current project is replaced.

## Main implementation areas

| Area | Implementation |
|---|---|
| Browser application | React + Vite |
| C4 editing canvas | React Flow (@xyflow/react) |
| Element documentation | React Markdown + remark-gfm |
| Sequence and ER editor | src/DiagramStudio.jsx |
| Project schema and validation | src/projectSchema.js |
| ZIP backup and restore | src/projectBackup.js |
| Optional cloud workspace | src/CloudWorkspace.jsx, src/cloudClient.js |
| AI-client integration | mcp-server/ |
| Automated checks | tests/, GitHub Actions |

## Deployment model

The public browser application is built as static assets and deployed to GitHub Pages. The optional Supabase backend is a separate service and must be configured independently. GitHub Pages deployment does not provision Supabase or enable MCP connectivity by itself.
