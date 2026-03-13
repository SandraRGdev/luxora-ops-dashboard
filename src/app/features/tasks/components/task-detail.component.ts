import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '@features/tasks/models/task.model';
import { ProjectOpsService } from '@core/services/project-ops.service';
import { TASK_STATUSES } from '@shared/models/status.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="task-detail-panel">
      <header class="panel-header">
        <h2>{{ task().title }}</h2>
        <button class="btn-close" (click)="onClose.emit()">✕</button>
      </header>

      <div class="panel-content">
        <div class="status-section">
          <span
            class="status-badge"
            [style.background-color]="statusColor()"
          >
            {{ statusLabel() }}
          </span>
          <span
            class="priority-badge"
            [class]="task().priority"
          >
            prioridad {{ task().priority }}
          </span>
        </div>

        <section class="description-section">
          <h4>Descripcion</h4>
          <p>{{ task().description || 'Sin descripcion' }}</p>
        </section>

        <section class="meta-section">
          <h4>Detalles</h4>
          <div class="meta-grid">
            <div class="meta-item">
              <label>Proyecto</label>
              <span>{{ projectName() }}</span>
            </div>
            <div class="meta-item">
              <label>Responsable</label>
              <span>{{ assigneeName() }}</span>
            </div>
            <div class="meta-item">
              <label>Creada</label>
              <span>{{ formatDate(task().createdAt) }}</span>
            </div>
            <div class="meta-item">
              <label>Fecha limite</label>
              <span [class.overdue]="isOverdue()">
                @if (task().dueDate) {
                  {{ formatDate(task().dueDate!) }}
                } @else {
                  <em>No definida</em>
                }
              </span>
            </div>
          </div>
        </section>

        <section class="timeline-section">
          <h4>Linea de estado</h4>
          <div class="status-timeline">
            @for (status of taskStatuses; track status.id) {
              <div
                class="timeline-step"
                [class.active]="task().status === status.id"
                [class.completed]="isStatusCompleted(status.id)"
              >
                <div
                  class="step-dot"
                  [style.background-color]="status.color"
                ></div>
                <span class="step-label">{{ status.label }}</span>
              </div>
            }
          </div>
        </section>
      </div>

      <footer class="panel-actions">
        <button class="btn-secondary" (click)="onEdit.emit(task())">Editar tarea</button>
        <button class="btn-danger" (click)="onDelete.emit(task().id)">Eliminar</button>
      </footer>
    </aside>
  `,
  styles: [`
    .task-detail-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #fff;
      border-left: 1px solid #e2e8f0;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
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

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .status-section {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      color: #fff;
    }

    .priority-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
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

    .description-section,
    .meta-section,
    .timeline-section {
      margin-bottom: 1.5rem;

      h4 {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      p {
        margin: 0;
        color: #64748b;
        line-height: 1.6;
      }
    }

    .meta-grid {
      display: grid;
      gap: 0.75rem;
    }

    .meta-item {
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
        font-size: 0.875rem;

        em {
          color: #94a3b8;
          font-style: italic;
        }

        &.overdue {
          color: #dc2626;
        }
      }
    }

    .status-timeline {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .timeline-step {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: all 0.2s;

      &.active {
        background: #f0f9ff;
      }

      &.completed {
        opacity: 0.6;
      }
    }

    .step-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .step-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .panel-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-secondary {
      flex: 1;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;

      &:hover {
        background: #e2e8f0;
      }
    }

    .btn-danger {
      flex: 1;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;

      &:hover {
        background: #fee2e2;
      }
    }
  `]
})
export class TaskDetailComponent {
  private readonly projectOps = inject(ProjectOpsService);

  readonly taskStatuses = TASK_STATUSES;

  // Inputs
  readonly task = input.required<Task>();

  // Outputs
  readonly onClose = output<void>();
  readonly onEdit = output<Task>();
  readonly onDelete = output<string>();

  // Computed
  readonly statusColor = computed(() =>
    TASK_STATUSES.find(s => s.id === this.task().status)?.color ?? '#64748b'
  );

  readonly statusLabel = computed(() =>
    TASK_STATUSES.find(s => s.id === this.task().status)?.label ?? this.task().status
  );

  readonly projectName = computed(() =>
    this.projectOps.getProjectById(this.task().projectId)?.name ?? 'Unknown Project'
  );

  readonly assigneeName = computed(() => {
    const assigneeId = this.task().assigneeId;
    if (!assigneeId) return 'Unassigned';
    return this.projectOps.getTeamMemberById(assigneeId)?.name ?? 'Unknown';
  });

  readonly isOverdue = computed(() => {
    const task = this.task();
    return task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'done' : false;
  });

  // Utility
  isStatusCompleted(statusId: string): boolean {
    const statusOrder = ['todo', 'in-progress', 'review', 'done'];
    const currentIndex = statusOrder.indexOf(this.task().status);
    const checkIndex = statusOrder.indexOf(statusId);
    return checkIndex < currentIndex;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
