# Resumen del Codebase

**Proyecto**: Luxora Ops Dashboard  
**Framework**: Angular 20  
**Lenguaje**: TypeScript  
**Ultima actualizacion**: 2026-03-13

## Vision general

El proyecto es una SPA en Angular organizada por modulos funcionales. Usa componentes standalone, señales de Angular y un archivo JSON local como fuente inicial de datos.

## Estructura principal

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

## Zonas importantes

### `src/app/core`

Servicios globales y estado central.

- `database.service.ts`
  - Carga el seed desde `db.json`
  - Guarda cambios en `localStorage`
  - Mantiene integridad entre relaciones

- `project-ops.service.ts`
  - Expone colecciones y metricas
  - Centraliza el acceso CRUD para la UI

### `src/app/features`

Vistas por funcionalidad.

- `metrics/`
  - Dashboard principal
  - KPIs, actividad y editor global

- `projects/`
  - Tablero de proyectos
  - Modal de proyecto
  - Panel de detalle

- `tasks/`
  - Tabla de tareas
  - Modal de tarea
  - Panel de detalle

- `team/`
  - Vista del equipo
  - Panel de detalle
  - Modal de miembro integrado en la pagina

### `src/app/shared`

Elementos compartidos.

- Shell principal
- Header y sidebar
- Modelos compartidos
- Componentes reutilizables

## Rutas

- `/metrics`
- `/projects`
- `/tasks`
- `/team`

La ruta por defecto redirige a `/metrics`.

## Flujo de datos

```text
db.json
  ↓
DatabaseService
  ↓
ProjectOpsService
  ↓
Paginas y formularios
  ↓
localStorage
```

## Persistencia

- Primera carga desde `db.json`
- Edicion y borrado en `localStorage`
- Reset desde el JSON base
- Exportacion del estado actual

## Puntos fuertes

- Arquitectura facil de seguir
- Sin dependencia de backend
- Buen punto de partida para demos y aprendizaje
- Lógica de datos centralizada
- UI principal moderna y clara

## Riesgos tecnicos actuales

- Algunas paginas tienen templates grandes
- Faltan tests de integracion para CRUD
- La persistencia solo en navegador puede confundir si no se documenta

## Siguientes pasos recomendados

- Añadir tests de flujos CRUD
- Extraer templates y estilos grandes
- Añadir sistema de notificaciones
- Preparar adaptador para futura API
