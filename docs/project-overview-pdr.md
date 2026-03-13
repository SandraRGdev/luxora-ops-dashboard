# Vision General y Requisitos del Producto

**Proyecto**: Luxora Ops Dashboard  
**Tipo**: Dashboard frontend  
**Estado**: MVP funcional  
**Ultima actualizacion**: 2026-03-13

## Resumen

Luxora Ops Dashboard es un panel de operaciones construido con Angular para gestionar proyectos, tareas y miembros del equipo desde una interfaz moderna. El proyecto esta pensado como base reutilizable para demos, portfolio, aprendizaje y futuras integraciones con backend.

## Objetivos

- Ofrecer una experiencia visual moderna y clara
- Simular una base de datos usando un archivo JSON editable
- Permitir crear, leer, editar y eliminar registros
- Facilitar el uso y la instalacion por parte de otras personas
- Servir como base lista para conectar una API real mas adelante

## Usuarios objetivo

- Estudiantes aprendiendo Angular
- Desarrolladores que quieren una base de dashboard
- Personas que revisan el proyecto en GitHub
- Equipos que necesitan una demo local sin backend

## Historias de usuario principales

### Dashboard

- Como usuario, quiero ver un resumen visual del estado del sistema
- Como usuario, quiero entender rapidamente la carga del equipo y el avance de tareas

### Proyectos

- Como usuario, quiero crear proyectos
- Como usuario, quiero editar proyectos
- Como usuario, quiero eliminar proyectos y su informacion relacionada

### Tareas

- Como usuario, quiero crear tareas vinculadas a un proyecto
- Como usuario, quiero asignar tareas a un miembro del equipo
- Como usuario, quiero cambiar estado y prioridad
- Como usuario, quiero eliminar tareas

### Equipo

- Como usuario, quiero crear miembros del equipo
- Como usuario, quiero editar sus datos
- Como usuario, quiero asociarlos a proyectos
- Como usuario, quiero eliminarlos

### Datos

- Como usuario, quiero partir de una base inicial
- Como usuario, quiero reiniciar el estado al JSON original
- Como usuario, quiero exportar el estado actual

## Alcance actual

### Incluido

- Angular con componentes standalone
- Seed de datos desde `src/assets/data/db.json`
- Persistencia en `localStorage`
- CRUD funcional de proyectos, tareas y equipo
- Dashboard principal con metricas
- Rutas secundarias para vistas especificas

### No incluido todavia

- Backend
- Escritura real sobre archivos del sistema
- Autenticacion
- Permisos por roles
- Sincronizacion en tiempo real

## Requisitos no funcionales

- Instalacion simple
- Arquitectura entendible
- Codigo legible para otras personas
- Consistencia visual entre vistas
- Seguridad razonable para una demo local

## Criterios de exito

- Otra persona puede clonar, instalar y ejecutar sin ayuda
- Los botones principales no quedan muertos
- La documentacion explica setup, arquitectura y persistencia
- El proyecto puede presentarse publicamente en GitHub

## Preguntas abiertas

- ¿La siguiente version debe usar `json-server` o una API propia?
- ¿Quieres persistencia real fuera del navegador?
- ¿Quieres convertir las vistas secundarias al mismo nivel visual del dashboard principal?
