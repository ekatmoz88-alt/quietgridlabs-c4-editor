# QuietGridLabs C4 Editor — Portfolio Case Study

> **Project status:** active development  
> **Project type:** independent product / portfolio project  
> **Role:** sole author and developer; independently responsible for product design, architecture, implementation, documentation and testing  
> **Live application:** https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/  
> **Source code:** https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor

## Overview

QuietGridLabs C4 Editor is a browser-based workspace for modeling software architecture with C4 and maintaining its supporting documentation and diagrams in one project. It is designed as a local-first application: core modeling and documentation workflows do not require an account.

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
- Optimistic revision checks to detect stale cloud updates.
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

## Individual project work

The product was designed and implemented independently. The work includes defining the product scope and project data model, implementing the C4 editing workflows, building the documentation and diagram features, adding import/export and backup validation, integrating optional cloud storage and the MCP server, and maintaining automated checks and project documentation.

## Engineering decisions

### Local-first data ownership

The editor continues to work without a cloud account. Cloud upload and restore are explicit actions. Cloud projects are private to their owner through PostgreSQL Row Level Security, and updates include an expected revision so a stale client cannot silently overwrite a newer project.

### Portable architecture artifacts

C4 data, Markdown documents, PlantUML sources and structured ER models are stored in a versioned project snapshot. JSON and ZIP import paths validate the snapshot before replacing the active local project. Schema v1 projects are normalized to schema v2 with empty diagram collections.

### Diagram source and rendering

PlantUML and ER source data remain the portable source of truth. Preview rendering is an explicit action that sends diagram source to the public Kroki renderer; editing and persistence do not depend on the renderer being available.

### AI integration boundary

The MCP server exposes scoped project tools and uses a user-scoped Supabase access token. Database RLS is the authorization boundary. Mutating tools require explicit confirmation, validate the project schema and compare the expected revision. Service-role credentials are not used.

## Current limitations and verification

The following capabilities are not yet implemented:

- Team invitations, owner/editor/viewer sharing roles and project membership management.
- Realtime multi-user collaboration and presence.
- Typed cross-level relationship explorer and navigation.
- Full MCP OAuth hand-off and automatic token refresh.

Cloud functionality requires a configured Supabase project, database migration, RLS policies and production environment variables. Its complete hosted sign-in and save/load flows must be verified in that configured environment. Cursor and Claude Code setup guidance is available, but end-to-end client compatibility and authentication lifecycle still require verification.

The public GitHub Pages application is available, but deployment alone does not prove every browser workflow. Browser-level smoke testing, a non-confidential demo project and a short public usage walkthrough remain release tasks.

## Quality and delivery

The repository includes automated tests for project schema and backup behavior, ESLint checks, a production build and MCP server syntax validation in GitHub Actions. The ZIP backup tests cover round trips, legacy migration, unsafe paths, file-list mismatches and documentation consistency. CI checks do not replace browser-level verification of the deployed application, configured Supabase flows or a live MCP client connection.

## Resume-ready project description

**QuietGridLabs C4 Editor — Independent Product Project**

Independently designed and developed a local-first browser editor for C4 architecture models and technical documentation using React, Vite and React Flow. Implemented versioned JSON/ZIP backup and restore, PlantUML sequence and structured ER modeling, optional Supabase cloud storage with owner-scoped RLS and revision conflict detection, and an MCP server for controlled AI-client access to architecture projects.
