import { Status } from '@shared/models/status.model';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status['id'];
  priority: TaskPriority;
  assigneeId: string | null;
  projectId: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: Status['id'];
  priority?: TaskPriority;
  assigneeId?: string | null;
  projectId: string;
  dueDate?: Date | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: Status['id'];
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
}
