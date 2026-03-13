# Arquitectura del Sistema

**Proyecto**: Luxora Ops Dashboard  
**Estilo**: SPA frontend con persistencia local  
**Ultima actualizacion**: 2026-03-13

## Vista general

La aplicacion esta construida como una SPA en Angular. No depende de backend para funcionar. Usa un archivo JSON como seed y `localStorage` como almacenamiento mutable durante el uso.

## Diagrama general

```text
Rutas Angular
  ↓
Shell de layout
  ↓
Paginas por feature
  ↓
ProjectOpsService
  ↓
DatabaseService
  ↓
db.json + localStorage
```

## Capas

### 1. Capa de presentacion

Responsable de renderizar la UI y capturar interacciones.

Elementos principales:

- `ShellComponent`
- `HeaderComponent`
- `SidebarComponent`
- Paginas en `metrics`, `projects`, `tasks` y `team`

Responsabilidades:

- Mostrar vistas y layout general
- Abrir y cerrar modales
- Disparar acciones CRUD
- Renderizar paneles de detalle y metricas

### 2. Capa de aplicacion

Responsable de coordinar estado derivado y operaciones de UI.

Servicio principal:

- `ProjectOpsService`

Responsabilidades:

- Exponer señales para colecciones
- Calcular metricas y resúmenes
- Encapsular CRUD consumido por las paginas
- Resolver consultas auxiliares

### 3. Capa de datos

Responsable de persistencia e integridad relacional.

Servicio principal:

- `DatabaseService`

Responsabilidades:

- Leer `assets/data/db.json`
- Guardar el estado en `localStorage`
- Mantener relaciones entre proyectos, tareas y miembros
- Reiniciar y exportar datos

## Modelo de persistencia

### Estado inicial

Se carga desde:

```text
src/assets/data/db.json
```

### Estado de trabajo

Se guarda en:

```text
localStorage
```

### Comportamiento del reset

El reset elimina el almacenamiento local y vuelve a cargar el seed original.

## Reglas de integridad

### Al borrar un proyecto

- Se elimina el proyecto
- Se eliminan las tareas asociadas
- Se quita la referencia del proyecto en los miembros

### Al mover una tarea de proyecto

- Se actualizan los `taskIds` del proyecto anterior y del nuevo

### Al cambiar proyectos de un miembro

- Se actualizan los `teamMemberIds` de los proyectos relacionados

## Modelo de UI

- Las tablas y tarjetas permiten seleccionar registros
- Los botones ejecutan acciones CRUD explicitas
- Los formularios usan modales, no prompts del navegador
- Los paneles de detalle permiten revisar y actuar sobre un registro

## Camino de evolucion

La forma mas limpia de evolucionar el sistema es:

1. Mantener `ProjectOpsService` como fachada
2. Sustituir `DatabaseService` por llamadas HTTP
3. Reutilizar la mayor parte de las vistas actuales

Eso permite pasar de demo local a aplicacion conectada a backend sin rehacer toda la UI.
