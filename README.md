# QuietGridLabs C4 Editor

A local-first browser editor for C4 architecture models and their technical documentation.

**Project type:** independently designed and developed product project.

## Features

Project data uses the versioned schema v2. Older v1 projects are migrated on import.

- Four C4 levels: System Context, Container, Component and Code.
- Interactive model editing with React Flow.
- Markdown documentation attached to C4 elements.
- First-class UML Sequence diagrams stored as PlantUML source, with rendered preview.
- Structured ER models: tables, columns, data types, primary/foreign keys, nullability and relationship cardinality.
- Diagram-to-C4 element associations.
- LocalStorage persistence without an account.
- JSON import/export and validated ZIP backup/restore, including diagram artifacts.
- Optional Supabase authentication and private cloud project storage with optimistic revision checks.
- Standalone MCP server for AI-client project discovery, reading, search and confirmed project updates.

## Technology

React, Vite, JavaScript, React Flow, React Markdown, JSZip, Supabase REST/Auth, PlantUML, Mermaid/Kroki and Model Context Protocol.

## Getting started

```bash
git clone https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor.git
cd quietgridlabs-c4-editor
npm install
npm run dev
```

Production build: `npm run build`. Tests: `npm test`. Lint: `npm run lint`.

## Diagrams

Open **Sequence / ER** in the workspace toolbar. Sequence source is stored as PlantUML; ER models are stored as structured entities, columns and relationships. Rendering uses the public Kroki service, so source is sent to that service only when the user explicitly selects **Render preview**. Project data remains available locally if the renderer is unavailable.

## Optional cloud storage and MCP

See [Cloud storage and MCP setup](docs/cloud-and-mcp-setup.md) for Supabase setup, the owner-only RLS migration and Cursor/Claude Code configuration.

Cloud storage is opt-in. The application code supports private per-user projects and revision conflict detection when a Supabase backend is configured. Team invitations, shared roles and realtime collaboration are not implemented. The MCP server uses a user-scoped Supabase access token and the same RLS boundary. Never configure a service-role key in the browser or MCP host.

## Project documentation

- [Portfolio case study](docs/portfolio/case-study.md)
- [Product specification and roadmap](docs/roadmap/product-specification.md)
- [Cloud and MCP setup](docs/cloud-and-mcp-setup.md)
- [GitHub issues](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor/issues)

## Links

- [Live application](https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/)
- [GitHub repository](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor)
