# QuietGridLabs C4 Editor — Portfolio Case Study

> **Project status:** active development  
> **Type:** independent product / portfolio project  
> **Live application:** https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/  
> **Source code:** https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor

## Overview

QuietGridLabs C4 Editor is a browser-based workspace for creating and documenting software architecture with the C4 model. It combines a visual model editor, element-level inspection and Markdown documentation in one local-first application.

The project explores how architecture diagrams and technical documentation can be maintained together rather than as disconnected deliverables.

## Implemented capabilities

The current repository documents and implements the following baseline:

- Four C4 views: System Context, Container, Component and Code.
- Interactive diagram editing using React Flow.
- Element descriptions and Markdown documentation associated with C4 elements.
- Markdown authoring toolbar for headings, emphasis, lists, tables, code blocks and links.
- Markdown preview with GitHub Flavored Markdown support, including tables and lists.
- Insertion helpers for PlantUML/Mermaid source snippets and relative SVG/PNG diagram references (rendering is not yet built in).
- Browser LocalStorage persistence.
- Saving an individual Markdown document or the documentation set to a user-selected local directory (Chromium-based browsers).
- ZIP export of project data and Markdown documentation.

## Technology

| Area | Technology |
|---|---|
| UI | React 19 |
| Build tooling | Vite 8 |
| Architecture canvas | `@xyflow/react` |
| Markdown rendering | `react-markdown`, `remark-gfm` |
| ZIP generation | `JSZip` |
| Local file access | File System Access API |
| Quality checks | ESLint, production build |
| Hosting | GitHub Pages |

## Engineering decisions

### Local-first workflow

The current application stores its working project in browser LocalStorage. This keeps the basic editing workflow independent of an account or backend service. Saving Markdown to a selected directory is a separate operation; browser storage and files on disk are not the same persistence layer.

### Documentation as a project artifact

Documentation is maintained per C4 element in Markdown. The editor includes formatting shortcuts and a GitHub Flavored Markdown preview, so tables, lists and fenced code examples can be authored and reviewed in technical descriptions. Diagram source snippets and relative image references can be inserted; automatic diagram rendering remains planned. The repository also contains a documentation directory intended to keep generated element documents organized by C4 level.

### Portable export

The application provides ZIP export for project data and Markdown documentation. A complete, validated import/restore round trip is a planned enhancement and is not claimed as implemented.

## Current limitations and roadmap

The following capabilities are planned and tracked separately; they must not be presented as completed features yet:

1. JSON import and validated backup restoration.
2. PlantUML sequence diagrams and ER modeling, including links to C4 elements.
3. Typed cross-level relationships and navigation between related elements.
4. Optional cloud accounts, project storage, invitations, roles and collaboration.
5. A versioned project API and MCP integration for Cursor and Claude Code.

The product specification and implementation roadmap are maintained in [product-specification.md](../roadmap/product-specification.md). The work is tracked in [GitHub Issues](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor/issues).

## Quality and delivery

The repository includes ESLint and a Vite production build as CI quality gates. The `main` branch is protected by a GitHub Ruleset requiring the `build` status check and blocking deletion and force pushes.

Before using a new release as a portfolio demonstration, verify the deployed Pages build and run the core editing, persistence and export flows in a browser.

## Suggested demonstration flow

1. Open the live application.
2. Switch through System Context, Container, Component and Code.
3. Select an element and show its description and Markdown documentation.
4. Edit a document using a table, list and fenced code block; verify the preview.
5. Reload the page and verify the current project state is retained.
6. Save the documentation to a local directory and export the project ZIP.

## Resume-ready project description

**QuietGridLabs C4 Editor — Independent Product Project**

Designed and developed a browser-based C4 architecture modeling and documentation editor using React, Vite and React Flow. Implemented interactive architecture views across four C4 levels, element-level Markdown documentation with GitHub Flavored Markdown preview, browser-based project persistence and ZIP export. Configured ESLint and production-build checks in GitHub Actions and protected the main branch with required status checks.

*Only use this description after personally verifying the listed workflows in the deployed application. Keep planned features in a separate “Roadmap” statement until they are implemented and tested.*
