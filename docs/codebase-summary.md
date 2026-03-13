# Codebase Summary

**Project**: Luxora Ops Dashboard  
**Framework**: Angular 20  
**Language**: TypeScript  
**Last Updated**: 2026-03-13

## Overview

This codebase is a single-page Angular dashboard application organized by feature areas. It uses standalone components, Angular signals, and a local JSON seed file to simulate database-backed records.

## High-Level Structure

```text
src/
├── app/
│   ├── core/
│   ├── features/
│   ├── shared/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/
│   └── data/
│       └── db.json
└── styles.scss
```

## Important Areas

### `src/app/core`

Cross-feature services and application state.

- `database.service.ts`
  - Loads seed data from `assets/data/db.json`
  - Stores runtime data in `localStorage`
  - Handles low-level CRUD and relationship updates

- `project-ops.service.ts`
  - Exposes computed metrics
  - Wraps CRUD operations for UI consumption
  - Acts as the central façade for the app

### `src/app/features`

Feature-based pages and UI logic.

- `metrics/`
  - Main dashboard
  - KPI cards, summaries, and unified CRUD workspace

- `projects/`
  - Projects board
  - Project form modal
  - Project detail panel

- `tasks/`
  - Tasks table
  - Task form modal
  - Task detail panel

- `team/`
  - Team grid
  - Team detail panel
  - Member creation/edit modal inside page

### `src/app/shared`

Reusable UI, layout, and shared models.

- Layout shell
- Header and sidebar
- Shared status definitions

## Routing

Defined in `src/app/app.routes.ts`.

- `/metrics`
- `/projects`
- `/tasks`
- `/team`

Default route redirects to `/metrics`.

## Data Flow

```text
db.json
  ↓
DatabaseService
  ↓
ProjectOpsService
  ↓
Feature pages and forms
  ↓
localStorage persistence
```

## Current Persistence Model

- First load reads from `db.json`
- Subsequent edits live in `localStorage`
- Reset reloads the original seed
- Export returns the current runtime snapshot

## Strengths

- Easy to understand architecture
- No backend dependency
- Good for demos and education
- Centralized data logic
- Clean separation between feature pages

## Main Technical Risks

- Large inline templates in some pages
- No automated tests for CRUD flows yet
- Browser-only persistence may confuse new contributors
- Some route pages still use simpler layouts than the main dashboard

## Recommended Next Steps

- Add route-level integration tests
- Extract large inline templates/styles into separate files
- Add toast notifications
- Add backend-ready data adapter abstraction
