# Code Standards

**Project**: Luxora Ops Dashboard  
**Applies To**: All source files  
**Last Updated**: 2026-03-13

## Core Principles

- Keep solutions simple
- Prefer clarity over cleverness
- Reuse shared services instead of duplicating data logic
- Avoid dead buttons and incomplete interactions

## Angular Conventions

### Components

- Use standalone components
- Keep feature pages under `src/app/features`
- Keep shared layout and reusable UI under `src/app/shared`
- Prefer explicit handler methods for button actions

### State

- Use Angular signals for local and derived state
- Centralize app data through `ProjectOpsService`
- Avoid bypassing the data layer from feature pages

### Services

- Use `DatabaseService` for low-level persistence
- Use `ProjectOpsService` for UI-facing CRUD and metrics
- Preserve relationship integrity between projects, tasks, and members

## Naming

- Files: kebab-case
- Classes: PascalCase
- Variables and methods: camelCase
- Constants: UPPER_SNAKE_CASE when appropriate

## UI Standards

- Primary actions should use the shared accent styling
- Use real forms and modals instead of `prompt`
- Reserve `confirm` only for destructive actions until toast/dialog system exists
- Buttons in clickable cards or rows must use `type="button"` and stop propagation when needed

## Documentation Standards

When updating the project:

- Keep `README.md` aligned with the real product
- Update docs in `docs/` when architecture or setup changes
- Document any persistence behavior that may confuse contributors

## Testing Standards

Minimum expectation for future contributions:

- TypeScript compile must pass
- Angular template compilation must pass
- New CRUD behavior should include tests when test infrastructure is expanded

## File Size Guidance

- Prefer small focused components
- If a file becomes hard to scan, extract template, styles, or helpers
- Prioritize maintainability over strict file size purity

## Contribution Rules

- Do not introduce breaking UI behavior without updating docs
- Do not add placeholder buttons that do nothing
- Do not bypass relationship updates when editing linked entities
- Keep the app runnable with `npm install` and `npm start`
