# QuietGridLabs C4 Editor

A local-first browser workspace for C4 architecture modeling, technical documentation and architecture diagrams.

**Project type:** independently designed and developed product project.

[![CI](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor/actions/workflows/deploy.yml)

## Try the application

**[Open the public application](https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/)** — core modeling and documentation scenarios are available without registration.

On a fresh browser profile, the editor opens with a populated sample C4 model for an Internet Banking System. It includes all four C4 levels and example Markdown documentation. The sample is stored in browser LocalStorage as you work; use a separate browser profile or clear this site's LocalStorage to return to the initial sample.

See [Demo scenarios](docs/demo-scenarios.md) for guided, no-registration walkthroughs.

## Features

Project data uses the versioned schema v2. Older v1 projects are migrated on import.

- Four C4 levels: System Context, Container, Component and Code.
- Interactive model editing with React Flow.
- Markdown documentation attached to C4 elements.
- UML Sequence diagrams stored as PlantUML source, with on-demand rendered preview.
- Structured ER models: tables, columns, data types, primary/foreign keys, nullability and relationship cardinality.
- Associations between diagram artifacts and C4 elements.
- LocalStorage persistence without an account.
- JSON import/export and validated ZIP backup/restore, including diagram artifacts.
- Optional Supabase authentication and private cloud project storage with optimistic revision checks.
- Standalone MCP server for AI-client project discovery, reading, search and confirmed project updates.

## Architecture

The editor is a static React application hosted on GitHub Pages. The browser owns the local project state and persists it in LocalStorage. Optional integrations are isolated:

- **Kroki** renders PlantUML and Mermaid previews only after the user requests rendering.
- **Supabase** provides optional authentication and owner-scoped cloud storage when a backend is configured.
- **MCP server** runs separately in an AI client environment and accesses projects using a user-scoped Supabase token.

See [Editor architecture](docs/architecture/overview.md) for component and data-flow diagrams.

## Technology

React, Vite, JavaScript, React Flow, React Markdown, JSZip, Supabase REST/Auth, PlantUML, Mermaid/Kroki and Model Context Protocol.

## Getting started

```bash
git clone https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor.git
cd quietgridlabs-c4-editor
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run build
```

## Diagrams

Open **Sequence / ER** in the workspace toolbar. Sequence source is stored as PlantUML; ER models are stored as structured entities, columns and relationships. Rendering uses the public Kroki service, so diagram source is sent to that service only when the user explicitly selects **Render preview**. Project data remains available locally if the renderer is unavailable.

## Optional cloud storage and MCP

See [Cloud storage and MCP setup](docs/cloud-and-mcp-setup.md) for Supabase setup, the owner-only RLS migration and Cursor/Claude Code configuration.

Cloud storage is opt-in. The application code supports private per-user projects and revision conflict detection when a Supabase backend is configured. Team invitations, shared roles and realtime collaboration are not implemented. The MCP server uses a user-scoped Supabase access token and the same RLS boundary. Never configure a service-role key in the browser or MCP host.

## Project documentation

- [Demo scenarios](docs/demo-scenarios.md)
- [Editor architecture](docs/architecture/overview.md)
- [Portfolio case study](docs/portfolio/case-study.md)
- [Product specification and roadmap](docs/roadmap/product-specification.md)
- [Cloud and MCP setup](docs/cloud-and-mcp-setup.md)
- [GitHub issues](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor/issues)

## Links

- [Live application](https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/)
- [GitHub repository](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor)
