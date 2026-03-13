# Luxora Ops Dashboard

Modern Angular dashboard with editable JSON-backed data for projects, tasks, and team management.

## Overview

Luxora Ops Dashboard is a frontend-first operations dashboard inspired by soft glassmorphism layouts, lavender surfaces, and lime accent actions. It is designed as a portfolio-ready admin experience that works without a backend.

The application reads seed data from `src/assets/data/db.json`, loads it into the browser, and persists user changes in `localStorage`. This makes the project ideal for demos, classes, UI prototyping, and CRUD practice.

## Features

- Modern dashboard UI with sidebar, sticky header, KPI cards, activity panels, and editable records
- CRUD for projects, tasks, and team members
- Seeded JSON dataset that simulates a database
- Local persistence through `localStorage`
- Reset to original seed data
- Export current in-browser data as JSON
- Responsive layout for desktop and tablet
- Standalone Angular components with signals-based state

## Tech Stack

- Angular 20
- TypeScript 5
- Angular signals
- SCSS
- JSON seed data in `src/assets/data/db.json`

## Getting Started

### Requirements

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run locally

```bash
npm start
```

The app will be available at `http://localhost:4200/`.

### Build

```bash
npm run build
```

### Type check

```bash
npx tsc -p tsconfig.app.json --noEmit
```

## Data Model

The project ships with a local dataset in:

```text
src/assets/data/db.json
```

This file contains:

- `projects`
- `tasks`
- `teamMembers`
- `metadata`

Runtime behavior:

1. The app loads `db.json` on first run.
2. The content is copied to browser `localStorage`.
3. All create, edit, and delete operations update `localStorage`.
4. "Reset" restores the original seed from `db.json`.
5. "Export JSON" downloads the current in-browser state.

Important:

- Editing records in the UI does not overwrite the physical `db.json` file.
- If you need real file writes or multi-user persistence, add an API or `json-server`.

## Project Structure

```text
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── database.service.ts
│   │       └── project-ops.service.ts
│   ├── features/
│   │   ├── metrics/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── team/
│   ├── shared/
│   │   ├── components/
│   │   └── models/
│   ├── app.component.ts
│   └── app.routes.ts
├── assets/
│   └── data/
│       └── db.json
└── styles.scss
```

## Main Routes

- `/metrics` - Main dashboard and global CRUD workspace
- `/projects` - Projects board
- `/tasks` - Tasks management view
- `/team` - Team overview

## Documentation

More project documentation is available in:

- `docs/project-overview-pdr.md`
- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/code-standards.md`

## Scripts

- `npm start` - Start development server
- `npm run build` - Production build
- `npm run watch` - Development build watcher
- `npm test` - Angular test runner

## Suggested GitHub Description

```text
Modern Angular dashboard with editable JSON data, local persistence, and CRUD for projects, tasks, and team members.
```

## Suggested Topics

```text
angular dashboard typescript admin-panel crud localstorage json ui ux
```

## Known Limitations

- No real backend yet
- No authentication layer
- Data is local to the current browser
- Multi-user sync is not supported

## Next Improvements

- Add `json-server` or Express API
- Add notifications/toasts instead of `confirm`
- Add tests for CRUD flows
- Add dark/light theme switch
- Add charts with real visualization library

## License

MIT
