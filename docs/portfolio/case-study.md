# QuietGridLabs C4 Editor — Portfolio Case Study

> **Project status:** active development  
> **Type:** independent product / portfolio project  
> **Live application:** https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/  
> **Source code:** https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor

## Overview

QuietGridLabs C4 Editor is a browser-based workspace for modeling software architecture with C4 and maintaining its supporting documentation and diagrams in one project.

## Implemented capabilities

- Four C4 views: System Context, Container, Component and Code.
- Interactive diagram editing using React Flow.
- Markdown documentation associated with C4 elements.
- PlantUML sequence artifacts with source editing and on-demand rendered preview.
- Structured ER models with entities, typed columns, PK/FK flags, nullability and cardinality relationships.
- Links from sequence and ER artifacts to C4 elements.
- LocalStorage persistence and local Markdown export.
- Versioned JSON import/export and validated ZIP backup/restore.
- Optional Supabase authentication and owner-scoped cloud project storage.
- Optimistic revision checks to detect concurrent cloud updates.
- MCP server tools for project listing, reading, searching and explicitly confirmed validated updates.

## Technology

| Area | Technology |
|---|---|
| UI | React 19, Vite 8 |
| Architecture canvas | `@xyflow/react` |
| Documentation | `react-markdown`, `remark-gfm` |
| Backup | `JSZip`, versioned project schema |
| Sequence rendering | PlantUML via Kroki |
| ER rendering | Mermaid via Kroki |
| Cloud | Supabase Auth, PostgREST and PostgreSQL RLS |
| AI integration | Model Context Protocol SDK |
| Quality | ESLint, Node test runner, GitHub Actions |

## Engineering decisions

### Local-first data ownership

The editor continues to work without a cloud account. Cloud upload and restore are explicit actions. Cloud projects are private to their owner through PostgreSQL Row Level Security, and updates include an expected revision so a stale client cannot silently overwrite a newer project.

### Portable architecture artifacts

C4 data, Markdown documents, PlantUML sources and structured ER models are stored in a versioned project snapshot. JSON and ZIP import paths validate the complete snapshot before replacing the active local project. Schema v1 projects are normalized to schema v2 with empty diagram collections.

### Diagram source and rendering

PlantUML and ER source data remain the portable source of truth. Preview rendering is an explicit action that sends diagram source to the public Kroki renderer; editing and persistence do not depend on the renderer being available.

### AI integration boundary

The MCP server exposes scoped project tools and uses a user-scoped Supabase access token. Database RLS is the authorization boundary. Mutating tools require explicit confirmation, validate the project schema and compare the expected revision. Service-role credentials are not used.

## Current limitations

The following are not yet implemented:

- Team invitations, owner/editor/viewer sharing roles and project membership management.
- Realtime multi-user collaboration and presence.
- OAuth hand-off and automatic token refresh for MCP clients.
- Typed cross-level relationship explorer and navigation.
- A deployed Supabase backend and configured production secrets are required before cloud features can be used in the hosted demo.

## Quality and delivery

The feature branch adds automated schema and backup regression tests, ESLint checks, a production build and MCP server syntax validation in GitHub Actions. A successful CI run does not replace browser-level verification of the rendered application, Supabase account flows or a live MCP client connection.

## Resume-ready project description

**QuietGridLabs C4 Editor — Independent Product Project**

Developed a local-first browser editor for C4 architecture models and technical documentation using React, Vite and React Flow. Added versioned JSON/ZIP backup and restore, PlantUML sequence and structured ER modeling, optional Supabase cloud storage with owner-scoped RLS and revision conflict detection, and an MCP server for controlled AI-client access to architecture projects.
