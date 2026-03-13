import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '@features/projects/models/project.model';
import { Task } from '@features/tasks/models/task.model';
import { TeamMember } from '@features/team/models/team-member.model';

const DB_KEY = 'projectops_db';

export interface Database {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  metadata: {
    version: string;
    lastUpdated: string;
    seeded: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private readonly _db = signal<Database | null>(null);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string | null>(null);

  // Read-only signals
  readonly db = this._db.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly ready = computed(() => !!this._db());

  // Computed signals for direct access
  readonly projects = computed(() => this._db()?.projects ?? []);
  readonly tasks = computed(() => this._db()?.tasks ?? []);
  readonly teamMembers = computed(() => this._db()?.teamMembers ?? []);

  constructor(private http: HttpClient) {
    this.initialize();
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  private async initialize(): Promise<void> {
    try {
      // Try to load from localStorage first
      const storedData = localStorage.getItem(DB_KEY);

      if (storedData) {
        const parsed = JSON.parse(storedData);
        parsed.projects = this.parseDates(parsed.projects, ['startDate', 'endDate', 'createdAt', 'updatedAt']);
        parsed.tasks = this.parseDates(parsed.tasks, ['dueDate', 'createdAt', 'updatedAt']);
        parsed.teamMembers = this.parseDates(parsed.teamMembers, ['createdAt', 'updatedAt']);
        this._db.set(parsed);
        this._loading.set(false);
      } else {
        // Load from JSON file as seed data
        await this.loadFromJson();
      }
    } catch (err) {
      console.error('Database initialization error:', err);
      this._error.set('Failed to initialize database');
      this._loading.set(false);
    }
  }

  private loadFromJson(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<Database>('assets/data/db.json').subscribe({
        next: (data) => {
          data.projects = this.parseDates(data.projects, ['startDate', 'endDate', 'createdAt', 'updatedAt']);
          data.tasks = this.parseDates(data.tasks, ['dueDate', 'createdAt', 'updatedAt']);
          data.teamMembers = this.parseDates(data.teamMembers, ['createdAt', 'updatedAt']);
          this._db.set(data);
          this.save();
          this._loading.set(false);
          resolve();
        },
        error: (err) => {
          console.error('Failed to load db.json:', err);
          this._db.set({
            projects: [],
            tasks: [],
            teamMembers: [],
            metadata: { version: '1.0.0', lastUpdated: new Date().toISOString(), seeded: false }
          });
          this.save();
          this._loading.set(false);
          resolve();
        }
      });
    });
  }

  private parseDates<T extends Record<string, any>>(items: T[], dateFields: string[]): T[] {
    return items.map(item => {
      const parsed = { ...item } as any;
      for (const field of dateFields) {
        if (parsed[field]) {
          parsed[field] = new Date(parsed[field]);
        }
      }
      return parsed as T;
    });
  }

  private save(): void {
    const db = this._db();
    if (db) {
      db.metadata.lastUpdated = new Date().toISOString();
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
  }

  // Refresh from JSON file
  async resetToSeed(): Promise<void> {
    localStorage.removeItem(DB_KEY);
    this._loading.set(true);
    await this.loadFromJson();
  }

  // Export current data
  exportData(): string {
    return JSON.stringify(this._db(), null, 2);
  }

  // ============================================
  // PROJECTS CRUD
  // ============================================
  getAllProjects(): Project[] {
    return this._db()?.projects ?? [];
  }

  getProjectById(id: string): Project | undefined {
    return this._db()?.projects.find(p => p.id === id);
  }

  createProject(project: Project): void {
    const db = this._db();
    if (db) {
      db.projects.push(project);
      this.save();
      this._db.set({ ...db });
    }
  }

  updateProject(id: string, updates: Partial<Project>): void {
    const db = this._db();
    if (db) {
      const index = db.projects.findIndex(p => p.id === id);
      if (index !== -1) {
        db.projects[index] = { ...db.projects[index], ...updates, updatedAt: new Date() };
        this.save();
        this._db.set({ ...db });
      }
    }
  }

  deleteProject(id: string): void {
    const db = this._db();
    if (db) {
      db.projects = db.projects.filter(p => p.id !== id);
      db.tasks = db.tasks.filter(t => t.projectId !== id);
      db.teamMembers = db.teamMembers.map(m => ({
        ...m,
        projectIds: m.projectIds.filter(pid => pid !== id)
      }));
      this.save();
      this._db.set({ ...db });
    }
  }

  // ============================================
  // TASKS CRUD
  // ============================================
  getAllTasks(): Task[] {
    return this._db()?.tasks ?? [];
  }

  getTaskById(id: string): Task | undefined {
    return this._db()?.tasks.find(t => t.id === id);
  }

  getTasksByProject(projectId: string): Task[] {
    return this._db()?.tasks.filter(t => t.projectId === projectId) ?? [];
  }

  getTasksByAssignee(assigneeId: string): Task[] {
    return this._db()?.tasks.filter(t => t.assigneeId === assigneeId) ?? [];
  }

  createTask(task: Task): void {
    const db = this._db();
    if (db) {
      db.tasks.push(task);
      const projectIndex = db.projects.findIndex(p => p.id === task.projectId);
      if (projectIndex !== -1 && !db.projects[projectIndex].taskIds.includes(task.id)) {
        db.projects[projectIndex].taskIds.push(task.id);
      }
      this.save();
      this._db.set({ ...db });
    }
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const db = this._db();
    if (db) {
      const index = db.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        const currentTask = db.tasks[index];
        const previousProjectId = currentTask.projectId;
        const nextProjectId = updates.projectId ?? previousProjectId;

        db.tasks[index] = { ...currentTask, ...updates, updatedAt: new Date() };

        if (previousProjectId !== nextProjectId) {
          const previousProject = db.projects.find(project => project.id === previousProjectId);
          if (previousProject) {
            previousProject.taskIds = previousProject.taskIds.filter(taskId => taskId !== id);
          }

          const nextProject = db.projects.find(project => project.id === nextProjectId);
          if (nextProject && !nextProject.taskIds.includes(id)) {
            nextProject.taskIds.push(id);
          }
        }

        this.save();
        this._db.set({ ...db });
      }
    }
  }

  deleteTask(id: string): void {
    const db = this._db();
    if (db) {
      const task = db.tasks.find(t => t.id === id);
      db.tasks = db.tasks.filter(t => t.id !== id);
      if (task?.projectId) {
        const projectIndex = db.projects.findIndex(p => p.id === task.projectId);
        if (projectIndex !== -1) {
          db.projects[projectIndex].taskIds = db.projects[projectIndex].taskIds.filter(tid => tid !== id);
        }
      }
      this.save();
      this._db.set({ ...db });
    }
  }

  // ============================================
  // TEAM MEMBERS CRUD
  // ============================================
  getAllTeamMembers(): TeamMember[] {
    return this._db()?.teamMembers ?? [];
  }

  getTeamMemberById(id: string): TeamMember | undefined {
    return this._db()?.teamMembers.find(m => m.id === id);
  }

  getTeamMembersByProject(projectId: string): TeamMember[] {
    return this._db()?.teamMembers.filter(m => m.projectIds.includes(projectId)) ?? [];
  }

  createTeamMember(member: TeamMember): void {
    const db = this._db();
    if (db) {
      db.teamMembers.push(member);
      member.projectIds.forEach(projectId => {
        const projectIndex = db.projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1 && !db.projects[projectIndex].teamMemberIds.includes(member.id)) {
          db.projects[projectIndex].teamMemberIds.push(member.id);
        }
      });
      this.save();
      this._db.set({ ...db });
    }
  }

  updateTeamMember(id: string, updates: Partial<TeamMember>): void {
    const db = this._db();
    if (db) {
      const index = db.teamMembers.findIndex(m => m.id === id);
      if (index !== -1) {
        const currentMember = db.teamMembers[index];
        const previousProjectIds = currentMember.projectIds;
        const nextProjectIds = updates.projectIds ?? previousProjectIds;

        db.teamMembers[index] = { ...currentMember, ...updates, updatedAt: new Date() };

        db.projects = db.projects.map(project => {
          const hadMember = previousProjectIds.includes(project.id);
          const shouldHaveMember = nextProjectIds.includes(project.id);

          if (hadMember && !shouldHaveMember) {
            return {
              ...project,
              teamMemberIds: project.teamMemberIds.filter(memberId => memberId !== id)
            };
          }

          if (!hadMember && shouldHaveMember && !project.teamMemberIds.includes(id)) {
            return {
              ...project,
              teamMemberIds: [...project.teamMemberIds, id]
            };
          }

          return project;
        });

        this.save();
        this._db.set({ ...db });
      }
    }
  }

  deleteTeamMember(id: string): void {
    const db = this._db();
    if (db) {
      const member = db.teamMembers.find(m => m.id === id);
      db.teamMembers = db.teamMembers.filter(m => m.id !== id);
      if (member) {
        member.projectIds.forEach(projectId => {
          const projectIndex = db.projects.findIndex(p => p.id === projectId);
          if (projectIndex !== -1) {
            db.projects[projectIndex].teamMemberIds =
              db.projects[projectIndex].teamMemberIds.filter(mid => mid !== id);
          }
        });
      }
      db.tasks = db.tasks.map(t =>
        t.assigneeId === id ? { ...t, assigneeId: null, updatedAt: new Date() } : t
      );
      this.save();
      this._db.set({ ...db });
    }
  }

  // ============================================
  // ID GENERATION
  // ============================================
  generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
