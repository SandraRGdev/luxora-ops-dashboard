import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority, CreateTaskDto, UpdateTaskDto } from '@features/tasks/models/task.model';
import { ProjectOpsService } from '@core/services/project-ops.service';
import { TASK_STATUSES } from '@shared/models/status.model';
import { TaskFormComponent } from '@features/tasks/components/task-form.component';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent],
  template: `
    <div class="tasks-list">
      <!-- Header -->
      <header class="list-header">
        <h1>Tareas</h1>
        <button class="btn-primary" type="button" (click)="openNewTaskModal()">
          + Nueva tarea
        </button>
      </header>

      <!-- Metrics Summary -->
      <section class="metrics-summary">
        <div class="metric-card">
          <span class="metric-value">{{ totalTasks() }}</span>
          <span class="metric-label">Total de tareas</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ pendingTasks() }}</span>
          <span class="metric-label">Pendientes</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ inProgressTasks() }}</span>
          <span class="metric-label">En progreso</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ completedTasks() }}</span>
          <span class="metric-label">Completadas</span>
        </div>
        <div class="metric-card highlight">
          <span class="metric-value">{{ completionRate() }}%</span>
          <span class="metric-label">Tasa de cierre</span>
        </div>
      </section>

      <!-- Filters -->
      <section class="filters">
        <input
          type="text"
          placeholder="Buscar tareas..."
          [value]="searchQuery()"
          (input)="onSearch($event)"
          class="search-input"
        />
        <select
          [value]="selectedStatus()"
          (change)="onStatusFilter($event)"
          class="status-filter"
        >
          <option value="">Todos los estados</option>
          @for (status of taskStatuses; track status.id) {
            <option [value]="status.id">{{ status.label }}</option>
          }
        </select>
        <select
          [value]="selectedPriority()"
          (change)="onPriorityFilter($event)"
          class="priority-filter"
        >
          <option value="">Todas las prioridades</option>
          @for (priority of priorities; track priority) {
            <option [value]="priority">{{ priority | titlecase }}</option>
          }
        </select>
      </section>

      <!-- Tasks Table -->
      <section class="tasks-table-container">
        <table class="tasks-table">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Proyecto</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha limite</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (task of filteredTasks(); track task.id) {
              <tr
                class="task-row"
                [class.overdue]="isOverdue(task)"
                (click)="selectTask(task.id)"
              >
                <td class="task-title">
                  <span class="title">{{ task.title }}</span>
                  <small class="description">{{ task.description }}</small>
                </td>
                <td>{{ getProjectName(task.projectId) }}</td>
                <td>{{ getAssigneeName(task.assigneeId) }}</td>
                <td>
                  <span
                    class="status-badge"
                    [style.background-color]="getStatusColor(task.status)"
                  >
                    {{ getStatusLabel(task.status) }}
                  </span>
                </td>
                <td>
                  <span
                    class="priority-badge"
                    [class]="task.priority"
                  >
                    {{ task.priority }}
                  </span>
                </td>
                <td>
                  @if (task.dueDate) {
                    <span [class.overdue-text]="isOverdue(task)">
                      {{ formatDate(task.dueDate) }}
                    </span>
                  } @else {
                    <span class="no-date">—</span>
                  }
                </td>
                <td>
                  <div class="actions">
                    <button class="btn-icon" type="button" (click)="handleEditTaskClick($event, task)">✏️</button>
                    <button class="btn-icon" type="button" (click)="handleDeleteTaskClick($event, task.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">
                  <p>No se encontraron tareas</p>
                  <button class="btn-secondary" type="button" (click)="openNewTaskModal()">
                    Crear la primera tarea
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      <!-- Selected Task Detail -->
      @if (selectedTask()) {
        <aside class="task-detail-panel">
          <header>
            <h2>{{ selectedTask()!.title }}</h2>
            <button class="btn-close" (click)="closeDetail()">✕</button>
          </header>
          <div class="detail-content">
            <p>{{ selectedTask()!.description }}</p>
            <div class="detail-meta">
              <div class="meta-row">
                <label>Estado</label>
                <span>{{ getStatusLabel(selectedTask()!.status) }}</span>
              </div>
              <div class="meta-row">
                <label>Prioridad</label>
                <span>{{ selectedTask()!.priority }}</span>
              </div>
              <div class="meta-row">
                <label>Proyecto</label>
                <span>{{ getProjectName(selectedTask()!.projectId) }}</span>
              </div>
              <div class="meta-row">
                <label>Responsable</label>
                <span>{{ getAssigneeName(selectedTask()!.assigneeId) }}</span>
              </div>
            </div>
          </div>
          <footer class="detail-actions">
            <button class="btn-secondary" type="button" (click)="editTask(selectedTask()!)">
              Editar
            </button>
            <button class="btn-danger" type="button" (click)="deleteTask(selectedTask()!.id)">
              Eliminar
            </button>
          </footer>
        </aside>
      }

      @if (showTaskModal()) {
        <app-task-form
          [task]="editingTask()"
          (onSubmitForm)="handleTaskSubmit($event)"
          (onCancel)="closeTaskModal()"
        />
      }
    </div>
  `,
  styles: [`
    .tasks-list {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
      }
    }

    .metrics-summary {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      background: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      text-align: center;

      &.highlight {
        background: #e0f2fe;
      }

      .metric-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
      }

      .metric-label {
        font-size: 0.875rem;
        color: #64748b;
      }
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;

      .search-input,
      .status-filter,
      .priority-filter {
        padding: 0.5rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }

      .search-input {
        flex: 1;
        max-width: 300px;
      }
    }

    .tasks-table-container {
      background: #fff;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .tasks-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: #f8fafc;
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e2e8f0;
      }

      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.875rem;
      }

      .task-row {
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f8fafc;
        }

        &.overdue {
          background: #fef2f2;
        }
      }

      .task-title {
        .title {
          display: block;
          font-weight: 500;
          color: #1e293b;
        }

        .description {
          display: block;
          color: #64748b;
          font-size: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
      }
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      color: #fff;
    }

    .priority-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      text-transform: capitalize;

      &.low {
        background: #e0f2fe;
        color: #0369a1;
      }

      &.medium {
        background: #fef3c7;
        color: #92400e;
      }

      &.high {
        background: #fee2e2;
        color: #b91c1c;
      }

      &.urgent {
        background: #dc2626;
        color: #fff;
      }
    }

    .overdue-text {
      color: #dc2626;
      font-weight: 500;
    }

    .no-date {
      color: #94a3b8;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;

      &:hover {
        transform: scale(1.1);
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      color: var(--accent-dark);
      border: none;
      padding: 0.75rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;

      &:hover {
        filter: brightness(0.98);
      }
    }

    .btn-secondary {
      background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      color: var(--accent-dark);
      border: none;
      padding: 0.75rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;

      &:hover {
        filter: brightness(0.98);
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    .task-detail-panel {
      position: fixed;
      right: 1.25rem;
      top: 6.35rem;
      width: 350px;
      height: calc(100vh - 7.6rem);
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid var(--stroke);
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
      backdrop-filter: blur(16px);
      overflow: auto;
      z-index: 30;

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        h2 {
          margin: 0;
          font-size: 1.25rem;
        }
      }

      .detail-meta {
        margin-top: 1rem;

        .meta-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;

          label {
            color: #64748b;
            font-size: 0.875rem;
          }

          span {
            font-weight: 500;
          }
        }
      }
    }

    .detail-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    @media (max-width: 1024px) {
      .task-detail-panel {
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
        top: 6rem;
        height: calc(100vh - 7rem);
      }
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;

      &:hover {
        color: #1e293b;
      }
    }

    .btn-danger {
      background: #f04438;
      color: #fff;
      border: none;
      padding: 0.75rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;
    }
  `]
})
export class TasksListPage {
  private readonly projectOps = inject(ProjectOpsService);

  readonly taskStatuses = TASK_STATUSES;
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  // Local UI state signals
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedPriority = signal<string>('');
  readonly selectedTaskId = signal<string | null>(null);
  readonly showTaskModal = signal<boolean>(false);
  readonly editingTask = signal<Task | null>(null);

  // Computed from service
  readonly totalTasks = this.projectOps.totalTasks;
  readonly pendingTasks = this.projectOps.pendingTasks;
  readonly inProgressTasks = this.projectOps.inProgressTasks;
  readonly completedTasks = this.projectOps.completedTasks;
  readonly completionRate = this.projectOps.taskCompletionRate;

  // Computed: Selected task
  readonly selectedTask = computed(() =>
    this.projectOps.getTaskById(this.selectedTaskId() ?? '')
  );

  // Computed: Filtered tasks
  readonly filteredTasks = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    const priority = this.selectedPriority();
    const tasks = this.projectOps.tasks();

    return tasks.filter(task => {
      const matchesQuery = task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);
      const matchesStatus = !status || task.status === status;
      const matchesPriority = !priority || task.priority === priority;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  });

  // Event handlers
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onStatusFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value);
  }

  onPriorityFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedPriority.set(target.value);
  }

  selectTask(id: string): void {
    this.selectedTaskId.set(id);
  }

  closeDetail(): void {
    this.selectedTaskId.set(null);
  }

  openNewTaskModal(): void {
    this.editingTask.set(null);
    this.showTaskModal.set(true);
  }

  editTask(task: Task): void {
    this.selectedTaskId.set(task.id);
    this.editingTask.set(task);
    this.showTaskModal.set(true);
  }

  deleteTask(id: string): void {
    if (!confirm('¿Seguro que quieres eliminar esta tarea?')) {
      return;
    }

    this.projectOps.deleteTask(id);
    if (this.selectedTaskId() === id) {
      this.selectedTaskId.set(null);
    }
  }

  handleTaskSubmit(payload: CreateTaskDto | UpdateTaskDto): void {
    const editing = this.editingTask();

    if (editing) {
      this.projectOps.updateTask(editing.id, payload as UpdateTaskDto);
    } else {
      this.projectOps.createTask(payload as CreateTaskDto);
    }

    this.closeTaskModal();
  }

  closeTaskModal(): void {
    this.showTaskModal.set(false);
    this.editingTask.set(null);
  }

  handleEditTaskClick(event: Event, task: Task): void {
    event.preventDefault();
    event.stopPropagation();
    this.editTask(task);
  }

  handleDeleteTaskClick(event: Event, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteTask(id);
  }

  // Utility methods
  getStatusColor(status: string): string {
    return TASK_STATUSES.find(s => s.id === status)?.color ?? '#64748b';
  }

  getStatusLabel(status: string): string {
    return TASK_STATUSES.find(s => s.id === status)?.label ?? status;
  }

  getProjectName(projectId: string): string {
    return this.projectOps.getProjectById(projectId)?.name ?? 'Desconocido';
  }

  getAssigneeName(assigneeId: string | null): string {
    if (!assigneeId) return 'Sin asignar';
    return this.projectOps.getTeamMemberById(assigneeId)?.name ?? 'Desconocido';
  }

  isOverdue(task: Task): boolean {
    return task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'done' : false;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  }
}
