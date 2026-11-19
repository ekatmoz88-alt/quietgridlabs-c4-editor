# QuietGridLabs C4 Editor

A browser-based C4 architecture modeling and documentation editor built with React and Vite. The application is local-first and is under active development.

## Overview

QuietGridLabs C4 Editor provides a visual workspace for creating and maintaining software architecture models using the C4 model. It combines interactive diagrams, an element inspector, and Markdown documentation.

## Features

- Four C4 levels: System Context, Container, Component, and Code
- Visual architecture modeling and diagram editing
- Element descriptions and Markdown documentation
- Markdown editing and preview
- Automatic project-state persistence in browser LocalStorage
- Save the current Markdown file to a selected local directory
- Save all Markdown documentation files to disk
- Export project data and documentation as a ZIP archive

## Technology

- React
- Vite
- JavaScript
- @xyflow/react
- react-markdown and remark-gfm
- JSZip
- Browser File System Access API

## Requirements

- Node.js and npm
- A Chromium-based browser for direct local-directory saving

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor.git
cd quietgridlabs-c4-editor
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173/`).

## Production Build

```bash
npm run build
```

The production build is generated in `dist/`.

## Documentation Layout

Markdown documentation for C4 elements is stored in `docs/`:

```text
docs/
+- README.md
/+01-context/
+/02-container/
/+03-component/
+/04-code/
```

Each element has its own Markdown file, for example `docs/04-code/service.md`.

## Saving Documentation

The documentation editor provides three disk actions:

1. **Choose docs folder** — select the local directory where documentation will be written.
2. **Save current file** — save the selected element's Markdown file.
3. **Save all** — save all generated Markdown documentation files.

The browser asks for permission to access the selected directory. Browser LocalStorage and files on disk are separate storage locations.

## Project Data and Export

Project state is stored in browser LocalStorage. ZIP export creates a portable archive containing project data and Markdown documentation.

## Project documentation

- [Portfolio case study](docs/portfolio/case-study.md) — implemented capabilities, technology, engineering decisions and a demonstration walkthrough.
- [Product specification and roadmap](docs/roadmap/product-specification.md) — proposed capabilities and phased implementation plan.
- [Open feature requests](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor/issues) — implementation backlog.

## Repository and demo

- [Live application](https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/)
- [GitHub repository](https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor)
