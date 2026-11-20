# Product specification: architecture diagrams, navigation, portability, cloud and AI integrations

**Status:** Partially implemented (schema v2, sequence/ER editor, optional cloud storage and MCP tools delivered on feature branch)  
**Repository:** quietgridlabs-c4-editor  
**Branch:** docs/product-roadmap-and-spec  
**Scope:** Product roadmap for capabilities beyond the current local-first C4 editor.

## 1. Current baseline

The application currently provides:
- C4 levels: System Context, Container, Component and Code.
- Interactive diagram editing with React Flow.
- Markdown documentation associated with individual C4 elements.
- Markdown editing toolbar with shortcuts for headings, bold text, lists, tables, code blocks and links.
- Markdown preview with GitHub Flavored Markdown support (including tables and lists).
- Diagram insertion helpers for PlantUML/Mermaid source blocks and relative SVG/PNG image references; diagram rendering remains a separate planned capability.
- Browser LocalStorage persistence.
- JSON export and ZIP export with project data and Markdown files.
- Local-directory Markdown saving through the File System Access API.

Implemented on the current feature branch: validated JSON/ZIP import and restore; schema-v2 diagram artifacts; PlantUML sequence source editing and Kroki preview; ER tables/columns/keys/cardinality editor; optional Supabase account and owner-scoped cloud storage with optimistic revision checks; and a stdio MCP server with read/search/confirmed-update tools. Still pending: typed cross-level relationship explorer, team roles/invitations, realtime collaboration, MCP OAuth/token refresh and browser-to-MCP OAuth hand-off.

## 2. Product principles

1. **Local-first:** existing projects must remain usable without an account or network connection.
2. **Portable source of truth:** project model, documentation and diagram sources must be exportable in documented, versioned formats.
3. **Explicit relationships:** links between C4 elements, APIs, services, interfaces, data stores and diagrams must be represented as model data, not inferred only from labels.
4. **Progressive delivery:** diagram authoring and portable import/export precede cloud collaboration; AI integrations consume stable model APIs.
5. **Safe migration:** imported projects are validated and migrated before replacing the current working project.

## 3. Documentation per element

### Requirements
- Each C4 element has its own Markdown document, keyed by stable element ID.
- Support headings, paragraphs, tables, ordered/unordered lists, fenced code blocks, links and images.
- Support embedding or linking diagrams from documentation.
- Provide authoring shortcuts for common Markdown structures and diagram source/image references.
- Documentation preview must render supported Markdown consistently.
- Export must preserve the documentation tree and referenced assets.

### Acceptance criteria
- Editing one element's document does not overwrite another element's document.
- Markdown tables, lists and code fences render correctly in preview and remain intact in exports.
- A documentation page can reference a diagram by stable diagram ID or relative asset path.
- The editor provides insertion controls for common Markdown syntax and diagram references without requiring users to type the full syntax manually.
- Missing assets produce a visible warning rather than a broken silent reference.

## 4. Architecture diagrams

### 4.1 UML Sequence Diagrams
- Store PlantUML source as a first-class diagram artifact.
- Associate a sequence diagram with one or more C4 elements.
- Provide source editing and rendered preview.
- Keep source available when rendering is unavailable; do not make the application depend on an external renderer for data integrity.
- Validate source and report syntax/rendering errors without discarding edits.

### 4.2 ER diagrams
- Model entities/tables, columns, data types, primary keys, foreign keys, nullability and constraints.
- Model relationships and cardinality.
- Provide a visual ER diagram and a structured table/relationship reference.
- Associate tables and ER diagrams with relevant C4 components, services or data stores.

### Acceptance criteria
- A user can create, edit, preview and save a PlantUML sequence diagram.
- A user can create an ER model with tables, columns, PK/FK and cardinalities.
- Table and relationship documentation is generated or browsable from the structured model.
- Diagrams can link to C4 elements and element details can list associated diagrams.
- Project JSON and ZIP exports preserve diagram source and metadata.

## 5. Relationships and navigation

### Requirements
- Add explicit typed relationships across model levels and element categories.
- Relationship types should include at least: contains, calls, reads, writes, exposes API, consumes API, authenticates with and depends on.
- Selecting an element highlights its direct neighbors and incident relationships.
- Provide a related-elements view with navigation to the relevant C4 level and parent context.
- Support navigation between UI/interface, API, service, component and database elements.
- Validate references when an element is renamed or deleted; prevent dangling links or show a resolution workflow.

### Acceptance criteria
- Selecting an element highlights its direct inbound and outbound neighbors.
- Related elements are listed with relationship type and direction.
- Clicking a related element opens its level and selects it.
- Cross-level links remain visible in an element's details even when their targets are not on the current canvas.
- Deleting an element cannot silently leave invalid references.

## 6. Export, import and backup recovery

### Requirements
- Define a versioned project JSON schema containing project metadata, C4 model, relationships, documentation, diagrams and assets.
- Implement full JSON import with schema validation and migration support.
- Import must offer safe replacement of the current project; do not silently overwrite unsaved work.
- ZIP archive must include project JSON, Markdown docs, diagram sources, assets and a manifest.
- Provide backup restoration from a previously exported JSON or ZIP.
- Report invalid files and unsupported schema versions with actionable errors.

### Acceptance criteria
- A project exported as JSON can be imported with equivalent model, documentation and relationships.
- A ZIP round trip preserves all project data and relative asset references.
- Import validation completes before the current project is replaced.
- Unsupported or malformed archives are rejected without changing the active project.
- The manifest records schema version, export timestamp and included file paths.

## 7. Cloud version and collaboration

### Requirements
- Add optional registration, authentication and account lifecycle.
- Store projects in a server-side database with per-user ownership.
- Support project roles: owner, editor and viewer.
- Allow project invitations and revocation; invitations must be scoped to a project.
- Add multi-user collaboration with conflict handling and clear presence/last-saved state.
- Keep local-only mode available and provide explicit cloud sync controls.
- Enforce authorization on the server for every project read/write operation.

### Suggested architecture
- Separate frontend from a versioned backend API.
- Use a relational database for users, projects, memberships, revisions and invitations.
- Store larger diagram assets in object storage; keep metadata and references in the database.
- Use optimistic concurrency with project revision/version checks for the initial sync model.
- Consider realtime presence and collaborative editing only after access control and revision semantics are stable.

### Acceptance criteria
- Users can register, sign in and sign out securely.
- A user can create, open, rename and delete their own cloud projects.
- An invited user receives only the permissions granted by their project role.
- Viewers cannot mutate project data; editors cannot change ownership or project membership.
- Concurrent edits are detected and do not silently overwrite newer server revisions.
- A local project remains usable when offline or when cloud sync is disabled.

## 8. Integrations and AI tools

### Requirements
- Provide a documented, versioned API for reading and updating architecture projects.
- Implement an MCP server exposing scoped tools/resources for:
  - listing projects available to the authenticated principal;
  - reading project metadata and C4 elements;
  - reading relationships and diagrams;
  - searching elements and documentation;
  - proposing or applying model/documentation changes with explicit confirmation and validation.
- Support integration workflows for Cursor and Claude Code through the MCP protocol and documented configuration.
- AI tools must use the same validation and authorization rules as the application.
- Mutating tools must be explicit, auditable and scoped to a selected project; read-only access should be available separately.
- Do not expose credentials or unrestricted database access to model tools.

### Acceptance criteria
- MCP clients can discover available tools and resources.
- Read-only tools return structured project, element, relationship and documentation data.
- Mutating tools validate payloads and return clear validation errors.
- Project access is limited to the authenticated user's permissions.
- Cursor and Claude Code setup instructions are documented and tested against supported client versions.
- Tool calls do not bypass application-level validation or access control.

## 9. Proposed delivery sequence

| Phase | Scope | Dependency |
|---|---|---|
| 1 | Versioned project schema, JSON import, robust ZIP backup/restore | Implemented |
| 2 | Diagram artifact model, PlantUML sequence diagrams, ER model | Implemented on feature branch |
| 3 | Typed cross-level relationships and relationship explorer | Stable element IDs and schema |
| 4 | Optional cloud identity and owner-scoped project storage | Implemented; team roles/invitations remain pending |
| 5 | Collaboration and conflict handling | Cloud authorization and revision model |
| 6 | Read/search MCP server and validated confirmed update tool | Implemented on feature branch |
| 7 | Controlled AI write operations and client guides | MCP read tools, validation and audit trail |

## 10. Non-functional requirements

- **Data integrity:** malformed imports and failed syncs must never silently corrupt the active project.
- **Security:** enforce authorization server-side; protect sessions and invitation tokens; validate all imported content.
- **Privacy:** cloud storage is opt-in; explain what is synchronized.
- **Performance:** large models and documentation trees should remain navigable; avoid full rerenders for unrelated element changes.
- **Accessibility:** keyboard-operable navigation and clear focus states for editor controls.
- **Testability:** unit tests for schema validation/migrations, relationship integrity, import/export round trips, permissions and MCP tool contracts.
- **Observability:** log server-side sync failures and authorization denials without logging secrets or sensitive document contents.

## 11. Out of scope for the first delivery

- Real-time multiplayer editing before revision/conflict semantics are defined.
- Automatic AI changes without user review.
- Vendor-specific proprietary diagram formats as the only source of truth.
- Mandatory cloud accounts for local projects.
