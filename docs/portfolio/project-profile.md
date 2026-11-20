# QuietGridLabs C4 Editor — Project Profile

> **Project type:** independent product project  
> **Author and developer:** Kate Motsar — individual work  
> **Status:** active development  
> **Live demo:** https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/  
> **Source code:** https://github.com/ekatmoz88-alt/quietgridlabs-c4-editor  
> **Technical case study:** [Case study](case-study.md)  
> **Architecture diagrams:** [Editor architecture](../architecture/overview.md)  
> **Demo walkthroughs:** [No-registration scenarios](../demo-scenarios.md)

---

# Русская версия

## О проекте

QuietGridLabs C4 Editor — браузерный редактор для моделирования программной архитектуры по C4 и ведения технической документации в рамках одного проекта. Основной сценарий работы построен по принципу local-first: создавать и редактировать архитектурную модель можно без регистрации и подключения облачного хранилища.

## Проблема

Архитектурные модели, описания компонентов, UML Sequence и ER-диаграммы часто ведутся в разных инструментах и файлах. Из-за этого архитектурный контекст и сопровождающая документация оказываются разрозненными, а перенос проекта между средами требует дополнительных действий.

## Решение

Разработан единый браузерный редактор, в котором C4-модель, документация элементов и диаграммные артефакты объединены в переносимый проект.

Редактор поддерживает:
- четыре уровня C4: System Context, Container, Component и Code;
- визуальное редактирование элементов и связей на React Flow;
- Markdown-документацию для элементов модели;
- UML Sequence с редактируемым исходным кодом PlantUML и рендерингом по запросу;
- структурированные ER-модели с таблицами, колонками, типами данных, PK/FK, nullable и кардинальностью связей;
- ассоциации диаграммных артефактов с элементами C4;
- сохранение проекта в браузере;
- импорт и экспорт JSON, ZIP backup/restore с проверкой структуры и содержимого;
- опциональное облачное хранение в Supabase;
- MCP-сервер для контролируемого доступа AI-клиентов к проектам.

## Архитектура

Приложение представляет собой клиентское React-приложение, публикуемое как статические файлы через GitHub Pages.

- **UI и модель:** React, Vite и React Flow.
- **Локальное состояние:** состояние проекта сохраняется в LocalStorage браузера.
- **Документация:** Markdown хранится в составе проектной модели.
- **Диаграммы:** PlantUML и структурированные ER-данные хранятся как исходные артефакты; визуализация запрашивается отдельно через Kroki.
- **Облачный контур:** Supabase Auth и PostgreSQL с Row Level Security для приватного хранения проектов владельца.
- **AI-интеграция:** отдельный MCP-сервер использует пользовательский токен Supabase и ограничения доступа на уровне RLS.

Подробные диаграммы контекста, контейнеров и потоков данных приведены в [описании архитектуры редактора](../architecture/overview.md).

## Технологии

React 19, Vite 8, JavaScript, React Flow, React Markdown, remark-gfm, JSZip, PlantUML, Mermaid, Kroki, Supabase Auth, PostgREST, PostgreSQL RLS, Model Context Protocol SDK, ESLint, Node.js test runner, GitHub Actions.

## Ключевые инженерные решения

### Local-first как основной сценарий
Базовые функции моделирования и документации доступны без учётной записи. Облачное сохранение вынесено в отдельный опциональный сценарий и не является условием работы редактора.

### Переносимая модель проекта
C4-модель, Markdown-документы и диаграммные артефакты хранятся в версионируемом формате. JSON и ZIP позволяют переносить проект; импорт проходит проверку до замены текущего проекта. Предусмотрена миграция проектов schema v1 к schema v2.

### Исходный код диаграмм важнее изображения
PlantUML и структурированные ER-данные сохраняются как редактируемые источники. Рендеринг выполняется по явному запросу пользователя, поэтому доступность сервиса визуализации не определяет доступность редактирования и хранения проекта.

### Изоляция облачного доступа
Облачные проекты доступны владельцу через PostgreSQL RLS. Для обновления используются проверки ревизии, чтобы обнаруживать конфликт устаревшей версии. MCP-сервер работает с пользовательским токеном; service-role key не используется в браузере или MCP-клиенте.

## Результаты

- Реализован браузерный редактор с четырьмя уровнями C4.
- Объединены архитектурная модель, Markdown-документация и диаграммные артефакты.
- Реализованы JSON import/export и ZIP backup/restore с валидацией.
- Добавлены опциональный облачный контур Supabase и MCP-интерфейс для AI-клиентов.
- Настроены автоматические проверки: ESLint, тесты, проверка синтаксиса MCP-сервера и production build в GitHub Actions.
- Опубликована работающая демонстрация с примером C4-модели, доступная без регистрации для локальных сценариев.

**Границы реализации:** командная совместная работа, приглашения, роли участников и realtime-синхронизация не реализованы. Облачный сценарий требует отдельной конфигурации Supabase; полная проверка hosted sign-in/save/load и сквозной работы MCP с Cursor/Claude Code остаётся отдельной задачей.

## Краткое описание для резюме

**QuietGridLabs C4 Editor — самостоятельный продуктовый проект**

Самостоятельно спроектировала и разработала браузерный редактор архитектуры на основе C4 с четырьмя уровнями модели, визуальным редактированием, Markdown-документацией, UML Sequence и структурированными ER-моделями. Реализовала перенос проектов через JSON и ZIP с валидацией, опциональное облачное хранение Supabase и MCP-сервер для контролируемого доступа AI-клиентов.

**Стек:** React, Vite, JavaScript, React Flow, Markdown, PlantUML, Mermaid/Kroki, JSZip, Supabase, PostgreSQL RLS, MCP, GitHub Actions.

---

# English version

## Overview

QuietGridLabs C4 Editor is a browser-based workspace for C4 software architecture modeling and technical documentation. Its primary workflow is local-first: users can create and edit architecture projects without signing in or configuring cloud storage.

## Problem

Architecture models, component documentation, UML Sequence diagrams and ER models are often maintained in separate tools and files. This fragments architectural context and makes project portability and documentation maintenance harder.

## Solution

Designed and independently implemented a browser-based editor that brings C4 models, element documentation and diagram artifacts together in a portable project.

Implemented capabilities include:
- four C4 levels: System Context, Container, Component and Code;
- visual model editing with React Flow;
- Markdown documentation attached to C4 elements;
- editable PlantUML sequence diagrams with on-demand rendering;
- structured ER models with tables, columns, data types, primary/foreign keys, nullability and relationship cardinality;
- associations between diagram artifacts and C4 elements;
- browser LocalStorage persistence;
- validated JSON import/export and ZIP backup/restore;
- optional Supabase cloud storage;
- an MCP server for controlled AI-client access to architecture projects.

## Architecture

The application is a client-side React application deployed as static assets on GitHub Pages.

- **UI and model editing:** React, Vite and React Flow.
- **Local state:** project data is persisted in browser LocalStorage.
- **Documentation:** Markdown content is stored with the project model.
- **Diagrams:** PlantUML source and structured ER data remain editable project artifacts; rendering is requested separately through Kroki.
- **Cloud boundary:** Supabase Auth and PostgreSQL Row Level Security provide private owner-scoped project storage.
- **AI integration:** a separate MCP server uses a user-scoped Supabase token and the same RLS access boundary.

See the [editor architecture document](../architecture/overview.md) for system context, container and data-flow diagrams.

## Technology

React 19, Vite 8, JavaScript, React Flow, React Markdown, remark-gfm, JSZip, PlantUML, Mermaid, Kroki, Supabase Auth, PostgREST, PostgreSQL RLS, Model Context Protocol SDK, ESLint, Node.js test runner and GitHub Actions.

## Key engineering decisions

### Local-first workflow
Core modeling and documentation work without an account. Cloud storage is an optional workflow rather than a prerequisite for using the editor.

### Portable project model
C4 data, Markdown documents and diagram artifacts are stored in a versioned project format. JSON and ZIP support project portability; imports are validated before the active project is replaced. Schema v1 projects are migrated to schema v2.

### Diagram source as the source of truth
PlantUML and structured ER data remain editable source artifacts. Rendering is an explicit user action, so editing and project persistence do not depend on the rendering service being available.

### Isolated cloud access
Cloud projects are owner-scoped through PostgreSQL RLS. Revision checks detect stale updates. The MCP server uses a user-scoped token; no service-role key is used in the browser or MCP client environment.

## Results

- Implemented a browser-based editor covering all four C4 levels.
- Brought architecture models, Markdown documentation and diagram artifacts into one project workspace.
- Implemented validated JSON import/export and ZIP backup/restore.
- Added optional Supabase cloud storage and an MCP interface for AI clients.
- Set up automated ESLint, test, MCP syntax and production build checks in GitHub Actions.
- Published a working public demo with a populated C4 sample model and no-registration local workflows.

**Implementation boundaries:** team invitations, shared roles and realtime collaboration are not implemented. Cloud workflows require separate Supabase configuration; full hosted sign-in/save/load and end-to-end MCP client flows with Cursor/Claude Code remain to be verified.

## Resume-ready description

**QuietGridLabs C4 Editor — Independent Product Project**

Independently designed and developed a browser-based C4 architecture editor with four model levels, visual editing, Markdown documentation, UML Sequence and structured ER modeling. Implemented validated JSON and ZIP project portability, optional Supabase cloud storage, and an MCP server for controlled AI-client access.

**Stack:** React, Vite, JavaScript, React Flow, Markdown, PlantUML, Mermaid/Kroki, JSZip, Supabase, PostgreSQL RLS, MCP and GitHub Actions.
