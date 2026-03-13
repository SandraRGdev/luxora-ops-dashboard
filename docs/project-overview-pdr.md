# Project Overview & Product Requirements

**Project Name**: Luxora Ops Dashboard  
**Type**: Frontend dashboard application  
**Status**: MVP complete  
**Last Updated**: 2026-03-13

## Summary

Luxora Ops Dashboard is a modern operations dashboard built with Angular. It provides a polished interface for managing projects, tasks, and team members without depending on a backend service.

The current product goal is to deliver a clean, editable, public-ready dashboard that can be shared as a GitHub project, used in class, or extended by other developers.

## Product Goals

- Provide a visually modern dashboard experience
- Simulate a database using an editable JSON file
- Support create, read, update, and delete flows
- Keep the project easy to run for other developers
- Offer a strong base for future backend integration

## Target Users

- Students learning Angular and CRUD patterns
- Developers building admin dashboards
- Recruiters or clients reviewing frontend skills
- Teams needing a local demo without backend setup

## Core User Stories

### Dashboard

- As a user, I can see a modern overview of project activity
- As a user, I can view KPIs and quick summaries of tasks and team workload

### Projects

- As a user, I can create a project
- As a user, I can edit project details
- As a user, I can delete a project and its linked tasks

### Tasks

- As a user, I can create tasks linked to projects
- As a user, I can assign tasks to team members
- As a user, I can edit task status and priority
- As a user, I can delete tasks

### Team

- As a user, I can create team members
- As a user, I can link team members to projects
- As a user, I can edit member details
- As a user, I can delete team members

### Data

- As a user, I can start from a seeded dataset
- As a user, I can reset the app to its original state
- As a user, I can export the current data as JSON

## Functional Scope

### Included

- Angular standalone component architecture
- Seed data from `src/assets/data/db.json`
- Browser persistence with `localStorage`
- CRUD flows for projects, tasks, and team members
- Dashboard overview page
- Secondary route pages for projects, tasks, and team

### Not Included Yet

- User authentication
- Backend API
- Database writes to real files
- Role permissions
- Realtime sync
- Audit log

## Non-Functional Requirements

- Easy local setup
- Clear folder structure
- Readable code for learners
- Visual consistency across routes
- Type-safe data handling

## UX Requirements

- Modern and soft visual language
- Strong CTA buttons with consistent accent color
- Sticky header and dashboard shell
- Responsive behavior for common laptop and tablet widths
- Forms must be usable without browser prompts

## Data Requirements

The application uses:

- `db.json` as the initial source of truth
- `localStorage` as the mutable runtime store

Relationships:

- A project has many tasks
- A project has many team members
- A task belongs to one project
- A task may belong to one team member
- A team member may belong to many projects

## Success Criteria

- Another developer can clone, install, and run in minutes
- CRUD works without hidden dead buttons
- Documentation explains setup, architecture, and data behavior
- GitHub visitors understand the project at a glance

## Open Questions

- Should the next version use `json-server` or a custom backend?
- Should the app support file writes to the seed JSON outside the browser?
- Should route pages match the visual sophistication of the main dashboard even more closely?
