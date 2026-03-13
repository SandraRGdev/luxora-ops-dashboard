import { Injectable, inject, computed, signal } from '@angular/core';
import { Project, CreateProjectDto, UpdateProjectDto } from '@features/projects/models/project.model';
import { Task, CreateTaskDto, UpdateTaskDto, TaskPriority } from '@features/tasks/models/task.model';
import { TeamMember, CreateTeamMemberDto, UpdateTeamMemberDto, MemberRole } from '@features/team/models/team-member.model';
import { PROJECT_STATUSES, TASK_STATUSES } from '@shared/models/status.model';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class ProjectOpsService {
  private readonly db = inject(DatabaseService);

  // ============================================
  // SELECTED STATE SIGNALS
  // ============================================
  private readonly _selectedProjectId = signal<string | null>(null);
  private readonly _selectedTaskId = signal<string | null>(null);
  private readonly _selectedMemberId = signal<string | null>(null);

  // ============================================
  // DATA SIGNALS (from Database)
  // ============================================
  readonly projects = this.db.projects;
  readonly tasks = this.db.tasks;
  readonly teamMembers = this.db.teamMembers;

  // ============================================
  // UI STATE SIGNALS
  // ============================================
  readonly loading = this.db.loading;
  readonly error = this.db.error;
  readonly ready = this.db.ready;

  // ============================================
  // READ-ONLY SIGNALS
  // ============================================
  readonly selectedProjectId = this._selectedProjectId.asReadonly();
  readonly selectedTaskId = this._selectedTaskId.asReadonly();
  readonly selectedMemberId = this._selectedMemberId.asReadonly();

  // ============================================
  // COMPUTED: Selected Entities
  // ============================================
  readonly selectedProject = computed(() =>
    this.projects().find(p => p.id === this._selectedProjectId()) ?? null
  );

  readonly selectedTask = computed(() =>
    this.tasks().find(t => t.id === this._selectedTaskId()) ?? null
  );

  readonly selectedMember = computed(() =>
    this.teamMembers().find(m => m.id === this._selectedMemberId()) ?? null
  );

  // ============================================
  // COMPUTED: Project Metrics
  // ============================================
  readonly totalProjects = computed(() => this.projects().length);

  readonly activeProjects = computed(() =>
    this.projects().filter(p => p.status === 'active').length
  );

  readonly completedProjects = computed(() =>
    this.projects().filter(p => p.status === 'completed').length
  );

  readonly projectsByStatus = computed(() => {
    const projects = this.projects();
    return PROJECT_STATUSES.reduce((acc, status) => {
      acc[status.id] = projects.filter(p => p.status === status.id).length;
      return acc;
    }, {} as Record<string, number>);
  });

  // ============================================
  // COMPUTED: Task Metrics
  // ============================================
  readonly totalTasks = computed(() => this.tasks().length);

  readonly completedTasks = computed(() =>
    this.tasks().filter(t => t.status === 'done').length
  );

  readonly pendingTasks = computed(() =>
    this.tasks().filter(t => t.status === 'todo').length
  );

  readonly inProgressTasks = computed(() =>
    this.tasks().filter(t => t.status === 'in-progress').length
  );

  readonly tasksByStatus = computed(() => {
    const tasks = this.tasks();
    return TASK_STATUSES.reduce((acc, status) => {
      acc[status.id] = tasks.filter(t => t.status === status.id).length;
      return acc;
    }, {} as Record<string, number>);
  });

  readonly tasksByPriority = computed(() => {
    const tasks = this.tasks();
    const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
    return priorities.reduce((acc, priority) => {
      acc[priority] = tasks.filter(t => t.priority === priority).length;
      return acc;
    }, {} as Record<TaskPriority, number>);
  });

  readonly overdueTasks = computed(() => {
    const now = new Date();
    return this.tasks().filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );
  });

  // ============================================
  // COMPUTED: Team Metrics
  // ============================================
  readonly totalTeamMembers = computed(() => this.teamMembers().length);

  readonly teamMembersByRole = computed(() => {
    const members = this.teamMembers();
    const roles: MemberRole[] = ['admin', 'manager', 'developer', 'designer', 'qa'];
    return roles.reduce((acc, role) => {
      acc[role] = members.filter(m => m.role === role).length;
      return acc;
    }, {} as Record<MemberRole, number>);
  });

  // ============================================
  // COMPUTED: Combined Metrics
  // ============================================
  readonly taskCompletionRate = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasks() / total) * 100);
  });

  readonly projectCompletionRate = computed(() => {
    const total = this.totalProjects();
    if (total === 0) return 0;
    return Math.round((this.completedProjects() / total) * 100);
  });

  readonly teamVelocity = computed(() => {
    const completed = this.completedTasks();
    return Math.round(completed / 4);
  });

  readonly workloadPerMember = computed(() => {
    const members = this.teamMembers();
    const tasks = this.tasks();
    return members.map(member => ({
      memberId: member.id,
      memberName: member.name,
      assignedTasks: tasks.filter(t => t.assigneeId === member.id).length,
      completedTasks: tasks.filter(t => t.assigneeId === member.id && t.status === 'done').length,
    }));
  });

  // ============================================
  // PROJECT CRUD
  // ============================================
  createProject(dto: CreateProjectDto): Project {
    const project: Project = {
      id: this.db.generateId('proj'),
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
    this.db.createProject(project);
    return project;
  }

  updateProject(id: string, updates: UpdateProjectDto): void {
    this.db.updateProject(id, updates);
  }

  deleteProject(id: string): void {
    this.db.deleteProject(id);
    if (this._selectedProjectId() === id) {
      this._selectedProjectId.set(null);
    }
  }

  selectProject(id: string | null): void {
    this._selectedProjectId.set(id);
  }

  // ============================================
  // TASK CRUD
  // ============================================
  createTask(dto: CreateTaskDto): Task {
    const task: Task = {
      id: this.db.generateId('task'),
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
    this.db.createTask(task);
    return task;
  }

  updateTask(id: string, updates: UpdateTaskDto): void {
    this.db.updateTask(id, updates);
  }

  deleteTask(id: string): void {
    this.db.deleteTask(id);
    if (this._selectedTaskId() === id) {
      this._selectedTaskId.set(null);
    }
  }

  selectTask(id: string | null): void {
    this._selectedTaskId.set(id);
  }

  // ============================================
  // TEAM MEMBER CRUD
  // ============================================
  createTeamMember(dto: CreateTeamMemberDto): TeamMember {
    const member: TeamMember = {
      id: this.db.generateId('member'),
      name: dto.name,
      email: dto.email,
      role: dto.role || 'developer',
      avatar: dto.avatar || null,
      projectIds: dto.projectIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.db.createTeamMember(member);
    return member;
  }

  updateTeamMember(id: string, updates: UpdateTeamMemberDto): void {
    this.db.updateTeamMember(id, updates);
  }

  deleteTeamMember(id: string): void {
    this.db.deleteTeamMember(id);
    if (this._selectedMemberId() === id) {
      this._selectedMemberId.set(null);
    }
  }

  selectTeamMember(id: string | null): void {
    this._selectedMemberId.set(id);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  getProjectById(id: string): Project | undefined {
    return this.db.getProjectById(id);
  }

  getTaskById(id: string): Task | undefined {
    return this.db.getTaskById(id);
  }

  getTeamMemberById(id: string): TeamMember | undefined {
    return this.db.getTeamMemberById(id);
  }

  getTasksByProject(projectId: string): Task[] {
    return this.db.getTasksByProject(projectId);
  }

  getTasksByAssignee(memberId: string): Task[] {
    return this.db.getTasksByAssignee(memberId);
  }

  getMembersByProject(projectId: string): TeamMember[] {
    return this.db.getTeamMembersByProject(projectId);
  }

  // ============================================
  // DATABASE OPERATIONS
  // ============================================
  async resetDatabase(): Promise<void> {
    await this.db.resetToSeed();
  }

  exportData(): string {
    return this.db.exportData();
  }
}
