export type StatusType = 'project' | 'task';

export interface Status {
  id: string;
  label: string;
  color: string;
  type: StatusType;
}

export const PROJECT_STATUSES: Status[] = [
  { id: 'planning', label: 'Planificacion', color: '#6366f1', type: 'project' },
  { id: 'active', label: 'Activo', color: '#22c55e', type: 'project' },
  { id: 'on-hold', label: 'En pausa', color: '#f59e0b', type: 'project' },
  { id: 'completed', label: 'Completado', color: '#10b981', type: 'project' },
];

export const TASK_STATUSES: Status[] = [
  { id: 'todo', label: 'Por hacer', color: '#94a3b8', type: 'task' },
  { id: 'in-progress', label: 'En progreso', color: '#3b82f6', type: 'task' },
  { id: 'review', label: 'En revision', color: '#f59e0b', type: 'task' },
  { id: 'done', label: 'Hecha', color: '#22c55e', type: 'task' },
];
