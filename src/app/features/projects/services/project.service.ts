import { Injectable, inject } from '@angular/core';
import { Project, CreateProjectDto, UpdateProjectDto } from '@features/projects/models/project.model';
import { ProjectOpsService } from '@core/services/project-ops.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly projectOps = inject(ProjectOpsService);

  // Expose signals from ProjectOpsService
  readonly projects = this.projectOps.projects;
  readonly selectedProject = this.projectOps.selectedProject;
  readonly loading = this.projectOps.loading;
  readonly error = this.projectOps.error;

  // CRUD Operations
  create(dto: CreateProjectDto): Project {
    const project: Project = {
      id: this.generateId(),
      name: dto.name,
      description: dto.description || '',
      status: dto.status || 'planning',
      startDate: dto.startDate,
      endDate: dto.endDate || null,
      teamMemberIds: dto.teamMemberIds || [],
      taskIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projectOps.addProject(project);
    return project;
  }

  update(id: string, dto: UpdateProjectDto): void {
    this.projectOps.updateProject(id, dto);
  }

  delete(id: string): void {
    this.projectOps.removeProject(id);
  }

  select(id: string | null): void {
    this.projectOps.selectProject(id);
  }

  // Query helpers
  getById(id: string): Project | undefined {
    return this.projectOps.getProjectById(id);
  }

  getByStatus(status: string): Project[] {
    return this.projects().filter(p => p.status === status);
  }

  // Mock data loader
  loadMockData(): void {
    const mockProjects: Project[] = [
      {
        id: 'proj-1',
        name: 'E-commerce Platform',
        description: 'Building a modern e-commerce platform with Angular and Node.js',
        status: 'active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        teamMemberIds: ['member-1', 'member-2', 'member-3'],
        taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'proj-2',
        name: 'Mobile App Redesign',
        description: 'Complete UI/UX redesign of the mobile application',
        status: 'planning',
        startDate: new Date('2024-02-01'),
        endDate: null,
        teamMemberIds: ['member-2', 'member-4'],
        taskIds: ['task-5', 'task-6'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'proj-3',
        name: 'API Integration',
        description: 'Third-party API integrations for payment and analytics',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-15'),
        teamMemberIds: ['member-1', 'member-5'],
        taskIds: ['task-7', 'task-8', 'task-9'],
        createdAt: new Date('2023-12-15'),
        updatedAt: new Date('2024-01-05')
      },
    ];

    this.projectOps.setProjects(mockProjects);
  }

  private generateId(): string {
    return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
