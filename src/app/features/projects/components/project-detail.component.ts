import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '@features/projects/models/project.model';
import { ProjectOpsService } from '@core/services/project-ops.service';
import { PROJECT_STATUSES } from '@shared/models/status.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="project-detail-panel">
      <header class="panel-header">
        <h2>{{ project().name }}</h2>
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
        </div>

        <section class="description-section">
          <h4>Description</h4>
          <p>{{ project().description }}</p>
        </section>

        <section class="stats-section">
          <h4>Statistics</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ project().teamMemberIds.length }}</span>
              <span class="stat-label">Team Members</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ project().taskIds.length }}</span>
              <span class="stat-label">Total Tasks</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ completedTasksCount() }}</span>
              <span class="stat-label">Completed</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ progressPercentage() }}%</span>
              <span class="stat-label">Progress</span>
            </div>
          </div>
        </section>

        <section class="dates-section">
          <h4>Timeline</h4>
          <div class="date-row">
            <span class="date-label">Start Date:</span>
            <span class="date-value">{{ formatDate(project().startDate) }}</span>
          </div>
          <div class="date-row">
            <span class="date-label">End Date:</span>
            <span class="date-value">
              @if (project().endDate) {
                {{ formatDate(project().endDate!) }}
              } @else {
                <em>Not defined</em>
              }
            </span>
          </div>
        </section>

        <section class="progress-section">
          <h4>Task Progress</h4>
          <div class="progress-bar">
            <div
              class="progress-fill"
              [style.width.%]="progressPercentage()"
            ></div>
          </div>
          <div class="progress-labels">
            @for (status of taskStatuses; track status.id) {
              <span class="progress-label">
                <span
                  class="color-dot"
                  [style.background-color]="status.color"
                ></span>
                {{ status.label }}: {{ tasksByStatus()[status.id] || 0 }}
              </span>
            }
          </div>
        </section>
      </div>

      <footer class="panel-actions">
        <button class="btn-secondary" (click)="onEdit.emit(project())">Edit Project</button>
        <button class="btn-danger" (click)="onDelete.emit(project().id)">Delete</button>
      </footer>
    </aside>
  `,
  styles: [`
    .project-detail-panel {
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
        font-size: 1.25rem;
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
      margin-bottom: 1.5rem;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      color: #fff;
    }

    .description-section,
    .stats-section,
    .dates-section,
    .progress-section {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat-item {
      background: #f8fafc;
      padding: 0.75rem;
      border-radius: 0.375rem;
      text-align: center;

      .stat-value {
        display: block;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #64748b;
      }
    }

    .date-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.875rem;

      .date-label {
        color: #64748b;
      }

      .date-value {
        color: #1e293b;
        font-weight: 500;

        em {
          color: #94a3b8;
          font-style: italic;
        }
      }
    }

    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #22c55e, #10b981);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .progress-labels {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .progress-label {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: #64748b;
    }

    .color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
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
export class ProjectDetailComponent {
  private readonly projectOps = inject(ProjectOpsService);

  readonly taskStatuses = [
    { id: 'todo', label: 'To Do', color: '#94a3b8' },
    { id: 'in-progress', label: 'In Progress', color: '#3b82f6' },
    { id: 'review', label: 'Review', color: '#f59e0b' },
    { id: 'done', label: 'Done', color: '#22c55e' },
  ];

  // Inputs
  readonly project = input.required<Project>();

  // Outputs
  readonly onClose = output<void>();
  readonly onEdit = output<Project>();
  readonly onDelete = output<string>();

  // Computed
  readonly statusColor = computed(() =>
    PROJECT_STATUSES.find(s => s.id === this.project().status)?.color ?? '#64748b'
  );

  readonly statusLabel = computed(() =>
    PROJECT_STATUSES.find(s => s.id === this.project().status)?.label ?? this.project().status
  );

  readonly projectTasks = computed(() =>
    this.projectOps.getTasksByProject(this.project().id)
  );

  readonly completedTasksCount = computed(() =>
    this.projectTasks().filter(t => t.status === 'done').length
  );

  readonly progressPercentage = computed(() => {
    const total = this.project().taskIds.length;
    if (total === 0) return 0;
    return Math.round((this.completedTasksCount() / total) * 100);
  });

  readonly tasksByStatus = computed(() => {
    const tasks = this.projectTasks();
    return {
      'todo': tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      'review': tasks.filter(t => t.status === 'review').length,
      'done': tasks.filter(t => t.status === 'done').length,
    };
  });

  // Utility
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
