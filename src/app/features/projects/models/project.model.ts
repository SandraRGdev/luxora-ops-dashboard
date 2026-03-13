import { Status } from '@shared/models/status.model';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: Status['id'];
  startDate: Date;
  endDate: Date | null;
  teamMemberIds: string[];
  taskIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  status?: Status['id'];
  startDate: Date;
  endDate?: Date | null;
  teamMemberIds?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: Status['id'];
  startDate?: Date;
  endDate?: Date | null;
  teamMemberIds?: string[];
}
