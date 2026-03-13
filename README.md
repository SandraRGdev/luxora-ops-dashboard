# Luxora Ops Dashboard

Dashboard moderno en Angular con datos JSON editables para gestionar proyectos, tareas y miembros del equipo.

## Descripcion

Luxora Ops Dashboard es una aplicacion frontend pensada para demos, clases y portfolios. El proyecto muestra una interfaz administrativa moderna con estetica suave, panel lateral, cabecera fija, metricas y flujos CRUD completos.

No necesita backend para funcionar. La aplicacion toma datos base desde `src/assets/data/db.json`, los carga en el navegador y guarda los cambios en `localStorage`.

## Caracteristicas

- Dashboard principal con metricas y panel de trabajo
- CRUD de proyectos
- CRUD de tareas
- CRUD de miembros del equipo
- Datos semilla en JSON
- Persistencia local en navegador
- Reinicio al estado original
- Exportacion del estado actual a JSON
- Diseño responsive para escritorio y tablet

## Tecnologias

- Angular 20
- TypeScript 5
- Angular Signals
- SCSS
- `localStorage`
- JSON local como fuente inicial

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalacion

```bash
npm install
```

## Ejecucion local

```bash
npm start
```

La app estara disponible en:

```text
http://localhost:4200/
```

## Build de produccion

```bash
npm run build
```

## Verificacion de tipos

```bash
npx tsc -p tsconfig.app.json --noEmit
```

## Como funciona la data

El proyecto incluye un archivo de datos base en:

```text
src/assets/data/db.json
```

Contiene:

- `projects`
- `tasks`
- `teamMembers`
- `metadata`

Flujo de datos:

1. La app carga `db.json` la primera vez.
2. Copia ese contenido a `localStorage`.
3. Las operaciones de crear, editar y eliminar actualizan `localStorage`.
4. El boton de reinicio recupera el contenido original del JSON.
5. El boton de exportar descarga el estado actual del navegador.

Importante:

- Editar desde la interfaz no modifica fisicamente `db.json`.
- Si necesitas persistencia real multiusuario, el siguiente paso es agregar API o `json-server`.

## Estructura principal

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

## Rutas principales

- `/metrics` - dashboard principal y editor global
- `/projects` - tablero de proyectos
- `/tasks` - gestion de tareas
- `/team` - vista de equipo

## Documentacion

Documentacion tecnica incluida:

- `docs/project-overview-pdr.md`
- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/code-standards.md`

## Scripts

- `npm start` - servidor de desarrollo
- `npm run build` - build de produccion
- `npm run watch` - build en modo observacion
- `npm test` - test runner de Angular

## Descripcion sugerida para GitHub

```text
Dashboard moderno en Angular con datos JSON editables, persistencia local y CRUD de proyectos, tareas y equipo.
```

## Topics sugeridos

```text
angular dashboard typescript crud localstorage json admin-panel ui ux
```

## Limitaciones actuales

- No hay backend real
- No hay autenticacion
- Los datos viven en el navegador actual
- No existe sincronizacion multiusuario

## Siguientes mejoras

- Integrar `json-server` o Express
- Sustituir `confirm` por dialogs o toasts
- Añadir tests de flujos CRUD
- Incorporar selector de tema
- Mejorar las visualizaciones de metricas

## Licencia

MIT
