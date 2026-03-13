# System Architecture

**Project**: Luxora Ops Dashboard  
**Architecture Style**: Frontend-only SPA with local persistence  
**Last Updated**: 2026-03-13

## Overview

The application is built as an Angular single-page application with a feature-oriented structure. It does not require a backend. Instead, it uses a local JSON file as seed data and `localStorage` as the mutable runtime store.

## Architecture Diagram

```text
Angular Routes
  ↓
Shell Layout
  ↓
Feature Pages
  ↓
ProjectOpsService
  ↓
DatabaseService
  ↓
db.json seed + localStorage
```

## Main Layers

### 1. Presentation Layer

Responsible for rendering pages and handling user interactions.

Key parts:

- `ShellComponent`
- `HeaderComponent`
- `SidebarComponent`
- Feature pages in `projects`, `tasks`, `team`, and `metrics`

Responsibilities:

- Render the dashboard and route views
- Open and close modals
- Trigger CRUD actions
- Show metrics and detail panels

### 2. Application Layer

Responsible for orchestration and derived state.

Key part:

- `ProjectOpsService`

Responsibilities:

- Expose collections as signals
- Compute KPI values
- Coordinate CRUD calls
- Provide helper queries such as tasks by project or assignee

### 3. Data Layer

Responsible for persistence and data integrity.

Key part:

- `DatabaseService`

Responsibilities:

- Load seed data from `assets/data/db.json`
- Save changes to `localStorage`
- Maintain project-task-member relationships
- Reset and export data

## Routing Model

### `/metrics`

Primary landing page and global editing workspace.

### `/projects`

Project-focused management page with detail panel and modal form.

### `/tasks`

Task-focused management page with table, detail panel, and modal form.

### `/team`

Team-focused page with member detail panel and modal form.

## State Management

The app uses Angular signals instead of a dedicated external state library.

Benefits:

- Minimal dependencies
- Clear computed values
- Good fit for dashboard interactions

## Persistence Strategy

### Initial State

Seeded from:

```text
src/assets/data/db.json
```

### Runtime State

Stored in browser:

```text
localStorage
```

### Reset Behavior

The reset action clears the browser store and reloads from the JSON seed.

## Relationship Rules

### Project deletion

- Removes the project
- Removes linked tasks
- Removes project references from members

### Task updates

- Keeps `taskIds` in sync when a task changes project

### Team member updates

- Keeps `teamMemberIds` in sync when linked projects change

## UI Interaction Model

- Tables and cards select records
- Buttons trigger explicit CRUD actions
- Forms use modals instead of browser prompts
- Detail panels support quick context and secondary actions

## Extension Path

The cleanest future extension path is:

1. Keep `ProjectOpsService` as the façade
2. Replace `DatabaseService` internals with HTTP calls
3. Keep most feature pages unchanged

This means the app is already positioned for migration from local demo mode to real backend mode.
