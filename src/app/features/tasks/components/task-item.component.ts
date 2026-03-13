import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '@features/tasks/models/task.model';
import { TASK_STATUSES } from '@shared/models/status.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="task-item"
      [class.overdue]="isOverdue()"
      [class.completed]="isCompleted()"
      (click)="onSelect.emit(task())"
    >
      <div class="task-checkbox">
        <input
          type="checkbox"
          [checked]="isCompleted()"
          (change)="onToggleStatus.emit(task())"
          (click)="$event.stopPropagation()"
        />
      </div>

      <div class="task-content">
        <header class="task-header">
          <h4 class="task-title">{{ task().title }}</h4>
          <span
            class="priority-badge"
            [class]="task().priority"
          >
            {{ task().priority }}
          </span>
        </header>

        <p class="task-description">{{ task().description }}</p>

        <footer class="task-meta">
          <span
            class="status-badge"
            [style.background-color]="statusColor()"
          >
            {{ statusLabel() }}
          </span>

          @if (task().dueDate) {
            <span class="due-date" [class.overdue]="isOverdue()">
              📅 {{ formatDate(task().dueDate!) }}
            </span>
          }

          @if (assigneeName()) {
            <span class="assignee">👤 {{ assigneeName() }}</span>
          }
        </footer>
      </div>

      <div class="task-actions">
        <button class="btn-icon" (click.stop)="onEdit.emit(task())">✏️</button>
        <button class="btn-icon" (click.stop)="onDelete.emit(task().id)">🗑️</button>
      </div>
    </article>
  `,
  styles: [`
    .task-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.06);
      }

      &.overdue {
        border-color: #fecaca;
        background: #fef2f2;
      }

      &.completed {
        opacity: 0.7;

        .task-title {
          text-decoration: line-through;
          color: #94a3b8;
        }
      }
    }

    .task-checkbox {
      padding-top: 0.25rem;

      input[type="checkbox"] {
        width: 1.125rem;
        height: 1.125rem;
        cursor: pointer;
      }
    }

    .task-content {
      flex: 1;
      min-width: 0;
    }

    .task-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .task-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .priority-badge {
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      text-transform: uppercase;
      font-weight: 600;

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

    .task-description {
      margin: 0 0 0.5rem 0;
      font-size: 0.75rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .status-badge {
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      color: #fff;
    }

    .due-date {
      font-size: 0.75rem;
      color: #64748b;

      &.overdue {
        color: #dc2626;
        font-weight: 500;
      }
    }

    .assignee {
      font-size: 0.75rem;
      color: #64748b;
    }

    .task-actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s;

      .task-item:hover & {
        opacity: 1;
      }
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.25rem;

      &:hover {
        transform: scale(1.1);
      }
    }
  `]
})
export class TaskItemComponent {
  // Inputs
  readonly task = input.required<Task>();
  readonly assigneeName = input<string>('');

  // Outputs
  readonly onSelect = output<Task>();
  readonly onEdit = output<Task>();
  readonly onDelete = output<string>();
  readonly onToggleStatus = output<Task>();

  // Computed
  readonly statusColor = computed(() =>
    TASK_STATUSES.find(s => s.id === this.task().status)?.color ?? '#64748b'
  );

  readonly statusLabel = computed(() =>
    TASK_STATUSES.find(s => s.id === this.task().status)?.label ?? this.task().status
  );

  readonly isCompleted = computed(() => this.task().status === 'done');

  readonly isOverdue = computed(() => {
    const task = this.task();
    return task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'done' : false;
  });

  // Utility
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
