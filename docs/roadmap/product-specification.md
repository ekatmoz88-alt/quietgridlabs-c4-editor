# Product specification and roadmap

**Status:** active development  
**Project type:** independently designed and developed product project  
**Repository:** [quietgridlabs-c4-editor](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor)  
**Baseline:** `main` branch  
**Scope:** C4 architecture modeling, technical documentation, diagram artifacts, project portability, optional cloud storage and AI-client integration.

This document distinguishes implemented functionality from incomplete capabilities and future work. Status refers to the application code; deployment-specific services may still require configuration and live verification.

## 1. Current implementation

### C4 modeling
- Four C4 levels: System Context, Container, Component and Code.
- Interactive editing with React Flow.
- Elements and relationships within the C4 model.
- Element details and Markdown documentation.
- LocalStorage persistence; the editor can be used without an account.

### Documentation
- Markdown documents associated with C4 elements by stable IDs.
- Editing shortcuts for common Markdown structures.
- Markdown preview with GitHub Flavored Markdown support.
- Documentation export as part of project portability workflows.
- Diagram artifacts can be associated with C4 elements.

### Architecture diagrams
- PlantUML sequence diagrams are stored as source artifacts and can be previewed on demand.
- ER models use structured data for tables, columns, data types, primary and foreign keys, nullability and relationship cardinality.
- Sequence and ER artifacts can be associated with C4 elements.
- Rendering uses the external Kroki service only after the user explicitly requests a preview; source data remains stored in the project.

### Import, export and backup
- Versioned project schema v2, with migration support for v1 projects.
- JSON import/export.
- ZIP backup and restore with a manifest, project data and Markdown documentation.
- ZIP import validates archive paths, manifest entries, project schema and documentation consistency before replacing the active project.
- Automated tests cover round trips, legacy migration and several malformed or unsafe archive cases.

### Optional cloud storage
- Supabase authentication and owner-scoped project storage are implemented in the application.
- Cloud updates use revision checks to detect stale writes.
- Cloud use is optional; local projects remain available without an account.
- A configured Supabase project, database migration, policies and deployment environment variables are required to use cloud functionality in a hosted deployment.

### MCP integration
- A standalone MCP server provides project discovery, reading and search.
- Validated project updates require explicit confirmation.
- MCP access uses a user-scoped Supabase token and remains subject to the same row-level security boundary.
- Cursor and Claude Code configuration guidance is provided; successful operation with each supported client and its authentication lifecycle still requires end-to-end verification.

## 2. Product principles

1. **Local-first:** the editor must remain useful without an account or network connection.
2. **Portable source of truth:** project model, documentation and diagram sources must be stored in versioned, exportable formats.
3. **Explicit relationships:** relationships between C4 elements and diagram artifacts must be represented as project data.
4. **Safe replacement:** imported data must be validated before it replaces the active project.
5. **User-controlled integrations:** external rendering, cloud synchronization and AI-client updates must be explicit actions.
6. **Least privilege:** cloud and MCP operations must respect the authenticated user's access boundary.

## 3. Remaining product work

### 3.1 Relationships and navigation

**Not implemented yet**
- Typed cross-level relationships such as calls, reads, writes, exposes API, consumes API, authenticates with and depends on.
- Neighbor highlighting and an inbound/outbound related-elements view.
- Navigation from a related element to its level and parent context.
- Reference validation and dangling-link resolution when elements are renamed or deleted.

**Acceptance criteria**
- Selecting an element highlights its direct neighbors and incident relationships.
- Related elements show relationship type and direction.
- Selecting a related element opens the correct level and selects the target.
- Deleting or renaming an element cannot silently leave invalid references.

### 3.2 Documentation and assets

**Further work**
- Validate relative links and referenced assets.
- Provide clearer asset management and missing-resource warnings.
- Preserve and validate binary assets if/when the project format supports them.

**Acceptance criteria**
- Broken relative references are reported clearly.
- Export and restore preserve supported assets and their references.

### 3.3 Import safety and recovery

**Further work**
- Add an explicit unsaved-changes warning before import/restore.
- Expand negative tests for corrupt archives, missing required files, invalid metadata and cancellation paths.
- Validate export timestamp metadata and additional archive edge cases.

**Acceptance criteria**
- Canceling import leaves the current project unchanged.
- Importing a project cannot silently discard unsaved work.
- Invalid archives are rejected without modifying the active project.

### 3.4 Cloud readiness and collaboration

**Implemented foundation:** optional authentication, private owner-scoped storage and optimistic revision checks.

**Not implemented**
- Project invitations and membership management.
- Owner, editor and viewer roles.
- Shared project access and revocation.
- Realtime multi-user editing, presence and collaboration conflict resolution.

**Further verification**
- Test registration, sign-in, sign-out, cloud save/load and revision conflicts against a configured hosted Supabase project.
- Verify production environment configuration and RLS behavior.

### 3.5 MCP and AI-client workflows

**Implemented foundation:** standalone MCP project listing, reading, search and confirmed validated updates.

**Further work**
- End-to-end verification in Cursor and Claude Code.
- Document supported client versions and tested setup paths.
- Improve authentication hand-off and token refresh for longer-lived client sessions.
- Add integration scenarios covering read-only discovery and user-confirmed updates.

## 4. Public release and deployment checklist

The application has a public GitHub Pages entry point, but a public URL alone does not establish that every hosted workflow has been verified.

- [ ] Run browser smoke tests against the deployed application.
- [ ] Verify a complete C4 modeling and documentation workflow without registration.
- [ ] Verify JSON export/import and ZIP backup/restore in the browser.
- [ ] Publish a small, non-confidential demo project.
- [ ] Verify sequence and ER preview behavior, including renderer failure handling.
- [ ] Verify Supabase flows only after production backend configuration is complete.
- [ ] Verify MCP setup with the documented clients.
- [ ] Add current screenshots and a short usage walkthrough.
- [ ] Keep README, case study and this roadmap aligned with the shipped code.

## 5. Delivery priorities

| Priority | Work | Status |
|---|---|---|
| P0 | C4 editor, element documentation and local persistence | Implemented |
| P0 | PlantUML sequence and structured ER artifacts | Implemented |
| P0 | Versioned JSON and validated ZIP backup/restore | Implemented; expand edge-case coverage |
| P1 | Typed cross-level relationships and navigation | Planned |
| P1 | Unsaved-change protection and stronger import validation | Planned |
| P1 | Browser smoke tests and public demo walkthrough | Verification pending |
| P2 | Hosted Supabase production verification | Configuration and verification pending |
| P2 | MCP client end-to-end and token lifecycle verification | Verification pending |
| P3 | Invitations, project roles and realtime collaboration | Not implemented |

## 6. Non-functional requirements

- **Data integrity:** malformed imports and failed syncs must not silently corrupt the active project.
- **Security:** enforce authorization server-side; never expose service-role credentials in browser code or MCP client configuration.
- **Privacy:** cloud storage is opt-in and synchronized data must be clearly identified.
- **Performance:** large models and documentation trees should remain navigable.
- **Accessibility:** provide keyboard-operable navigation and visible focus states.
- **Testability:** cover schema validation, migrations, import/export, authorization and MCP tool contracts.
- **Observability:** report sync and authorization failures without logging secrets or sensitive document contents.

## 7. Out of scope for the current release

- Realtime multiplayer editing before membership, authorization and conflict semantics are complete.
- Automatic AI modifications without explicit user review.
- Mandatory cloud accounts for local projects.
- Vendor-specific proprietary diagram formats as the only source of truth.
