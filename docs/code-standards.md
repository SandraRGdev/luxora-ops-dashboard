# Estándares de Código

**Proyecto**: Luxora Ops Dashboard  
**Aplicacion**: Todo el codigo fuente  
**Ultima actualizacion**: 2026-03-13

## Principios base

- Mantener soluciones simples
- Priorizar claridad sobre ingenio
- Reutilizar servicios compartidos
- No dejar botones o flujos a medias

## Convenciones Angular

### Componentes

- Usar componentes standalone
- Mantener features dentro de `src/app/features`
- Mantener layout y elementos compartidos dentro de `src/app/shared`
- Preferir handlers explicitos para botones

### Estado

- Usar Angular Signals para estado local y derivado
- Centralizar datos en `ProjectOpsService`
- No saltarse la capa de servicios desde la UI

### Servicios

- `DatabaseService` para persistencia y relaciones
- `ProjectOpsService` para CRUD y metricas consumidas por la interfaz
- Mantener consistencia entre proyectos, tareas y miembros

## Nombres

- Archivos: kebab-case
- Clases: PascalCase
- Variables y metodos: camelCase
- Constantes: UPPER_SNAKE_CASE cuando aplique

## Estándares de UI

- Las acciones principales deben compartir la misma linea visual
- Usar formularios y modales reales en lugar de `prompt`
- Limitar `confirm` a acciones destructivas mientras no exista un dialog system
- Los botones dentro de tarjetas o filas clicables deben usar `type="button"` y cortar propagacion si hace falta

## Documentacion

Cada cambio relevante debe mantener actualizados:

- `README.md`
- `docs/project-overview-pdr.md`
- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/code-standards.md`

## Calidad minima

Antes de publicar cambios:

- Debe pasar TypeScript
- Debe pasar compilacion de templates Angular
- La app debe seguir arrancando con `npm install` y `npm start`

## Guias de mantenimiento

- Si un archivo se vuelve dificil de leer, dividir template, estilos o helpers
- No duplicar logica CRUD en varias paginas
- No subir archivos de herramientas internas que no formen parte del producto
