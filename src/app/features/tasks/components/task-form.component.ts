import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, CreateTaskDto, UpdateTaskDto, TaskPriority } from '@features/tasks/models/task.model';
import { ProjectOpsService } from '@core/services/project-ops.service';
import { TASK_STATUSES } from '@shared/models/status.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2>{{ isEditMode() ? 'Editar tarea' : 'Nueva tarea' }}</h2>
          <button class="btn-close" (click)="onCancel.emit()">✕</button>
        </header>

        <form class="modal-body" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Titulo de la tarea *</label>
            <input
              type="text"
              id="title"
              [(ngModel)]="formData.title"
              name="title"
              placeholder="Escribe el titulo"
              required
            />
            @if (errors()['title']) {
              <span class="error">{{ errors()['title'] }}</span>
            }
          </div>

          <div class="form-group">
            <label for="description">Descripcion</label>
            <textarea
              id="description"
              [(ngModel)]="formData.description"
              name="description"
              placeholder="Escribe la descripcion"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="projectId">Proyecto *</label>
              <select
                id="projectId"
                [(ngModel)]="formData.projectId"
                name="projectId"
                required
              >
                <option value="">Selecciona un proyecto</option>
                @for (project of projects(); track project.id) {
                  <option [value]="project.id">{{ project.name }}</option>
                }
              </select>
              @if (errors()['projectId']) {
                <span class="error">{{ errors()['projectId'] }}</span>
              }
            </div>

            <div class="form-group">
              <label for="assigneeId">Responsable</label>
              <select
                id="assigneeId"
                [(ngModel)]="formData.assigneeId"
                name="assigneeId"
              >
                <option value="">Sin asignar</option>
                @for (member of teamMembers(); track member.id) {
                  <option [value]="member.id">{{ member.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="status">Estado</label>
              <select
                id="status"
                [(ngModel)]="formData.status"
                name="status"
              >
                @for (status of taskStatuses; track status.id) {
                  <option [value]="status.id">{{ status.label }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="priority">Prioridad</label>
              <select
                id="priority"
                [(ngModel)]="formData.priority"
                name="priority"
              >
                @for (priority of priorities; track priority) {
                  <option [value]="priority">{{ priority | titlecase }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="dueDate">Fecha limite</label>
            <input
              type="date"
              id="dueDate"
              [(ngModel)]="formData.dueDate"
              name="dueDate"
            />
          </div>
        </form>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" (click)="onCancel.emit()">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" (click)="onSubmit()">
            {{ isEditMode() ? 'Guardar' : 'Crear' }}
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
    }

    .modal-content {
      background: rgba(255, 255, 255, 0.96);
      border-radius: 24px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
      border: 1px solid rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(16px);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;

      h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
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

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }

      textarea {
        resize: vertical;
        min-height: 80px;
      }

      .error {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.75rem;
        color: #dc2626;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #f9fafb;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      color: var(--accent-dark);
      border: none;
      padding: 0.7rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;

      &:hover {
        filter: brightness(0.98);
      }
    }

    .btn-secondary {
      background: rgba(93, 84, 133, 0.08);
      color: var(--text-main);
      border: 1px solid rgba(93, 84, 133, 0.14);
      padding: 0.7rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;

      &:hover {
        background: #e5e7eb;
      }
    }
  `]
})
export class TaskFormComponent {
  private readonly projectOps = inject(ProjectOpsService);

  readonly taskStatuses = TASK_STATUSES;
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  // Inputs
  readonly task = input<Task | null>(null);
  readonly projectId = input<string>('');

  // Outputs
  readonly onSubmitForm = output<CreateTaskDto | UpdateTaskDto>();
  readonly onCancel = output<void>();

  // Form state
  formData: CreateTaskDto = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: null,
    projectId: '',
    dueDate: null,
  };

  readonly errors = signal<Record<string, string>>({});

  // Computed
  readonly isEditMode = computed(() => !!this.task());

  readonly projects = this.projectOps.projects;
  readonly teamMembers = this.projectOps.teamMembers;

  // Initialize form when inputs change
  ngOnInit(): void {
    const task = this.task();
    const projectId = this.projectId();

    if (task) {
      this.formData = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        projectId: task.projectId,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      };
    } else if (projectId) {
      this.formData.projectId = projectId;
    }
  }

  validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.formData.title.trim()) {
      newErrors['title'] = 'El titulo es obligatorio';
    }

    if (!this.formData.projectId) {
      newErrors['projectId'] = 'El proyecto es obligatorio';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    if (this.isEditMode()) {
      const updateDto: UpdateTaskDto = {
        title: this.formData.title,
        description: this.formData.description,
        status: this.formData.status,
        priority: this.formData.priority,
        assigneeId: this.formData.assigneeId || null,
        dueDate: this.formData.dueDate,
      };
      this.onSubmitForm.emit(updateDto);
    } else {
      this.onSubmitForm.emit({
        ...this.formData,
        assigneeId: this.formData.assigneeId || null
      });
    }
  }
}
