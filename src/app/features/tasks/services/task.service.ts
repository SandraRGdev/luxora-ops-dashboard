import { Injectable, inject } from '@angular/core';
import { Task, CreateTaskDto, UpdateTaskDto } from '@features/tasks/models/task.model';
import { ProjectOpsService } from '@core/services/project-ops.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly projectOps = inject(ProjectOpsService);

  // Expose signals from ProjectOpsService
  readonly tasks = this.projectOps.tasks;
  readonly selectedTask = this.projectOps.selectedTask;
  readonly loading = this.projectOps.loading;
  readonly error = this.projectOps.error;

  // CRUD Operations
  create(dto: CreateTaskDto): Task {
    const task: Task = {
      id: this.generateId(),
      title: dto.title,
      description: dto.description || '',
      status: dto.status || 'todo',
      priority: dto.priority || 'medium',
      assigneeId: dto.assigneeId || null,
      projectId: dto.projectId,
      dueDate: dto.dueDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projectOps.addTask(task);
    return task;
  }

  update(id: string, dto: UpdateTaskDto): void {
    this.projectOps.updateTask(id, dto);
  }

  delete(id: string): void {
    this.projectOps.removeTask(id);
  }

  select(id: string | null): void {
    this.projectOps.selectTask(id);
  }

  // Query helpers
  getById(id: string): Task | undefined {
    return this.projectOps.getTaskById(id);
  }

  getByProject(projectId: string): Task[] {
    return this.projectOps.getTasksByProject(projectId);
  }

  getByAssignee(memberId: string): Task[] {
    return this.projectOps.getTasksByAssignee(memberId);
  }

  getByStatus(status: string): Task[] {
    return this.tasks().filter(t => t.status === status);
  }

  getOverdue(): Task[] {
    const now = new Date();
    return this.tasks().filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );
  }

  // Mock data loader
  loadMockData(): void {
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Setup project structure',
        description: 'Initialize Angular project with all dependencies',
        status: 'done',
        priority: 'high',
        assigneeId: 'member-1',
        projectId: 'proj-1',
        dueDate: new Date('2024-01-20'),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'task-2',
        title: 'Implement authentication',
        description: 'Add login/logout functionality with JWT',
        status: 'in-progress',
        priority: 'high',
        assigneeId: 'member-2',
        projectId: 'proj-1',
        dueDate: new Date('2024-02-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-25')
      },
      {
        id: 'task-3',
        title: 'Design homepage mockups',
        description: 'Create Figma designs for the main landing page',
        status: 'review',
        priority: 'medium',
        assigneeId: 'member-3',
        projectId: 'proj-2',
        dueDate: new Date('2024-02-10'),
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-05')
      },
    ];

    this.projectOps.setTasks(mockTasks);
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
