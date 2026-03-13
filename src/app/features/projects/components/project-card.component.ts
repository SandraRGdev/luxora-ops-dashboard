import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '@features/projects/models/project.model';
import { PROJECT_STATUSES } from '@shared/models/status.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="project-card"
      [class.selected]="isSelected()"
      (click)="onSelect.emit(project())"
    >
      <header class="card-header">
        <h3>{{ project().name }}</h3>
        <span
          class="status-badge"
          [style.background-color]="statusColor()"
        >
          {{ statusLabel() }}
        </span>
      </header>

      <p class="card-description">{{ project().description }}</p>

      <div class="card-meta">
        <div class="meta-item">
          <span class="meta-icon">👥</span>
          <span>{{ project().teamMemberIds.length }} members</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">📋</span>
          <span>{{ project().taskIds.length }} tasks</span>
        </div>
      </div>

      <div class="card-dates">
        <small>Start: {{ formatDate(project().startDate) }}</small>
        @if (project().endDate) {
          <small>End: {{ formatDate(project().endDate!) }}</small>
        }
      </div>

      <footer class="card-actions">
        <button class="btn-icon" (click.stop)="onEdit.emit(project())">✏️</button>
        <button class="btn-icon" (click.stop)="onDelete.emit(project().id)">🗑️</button>
      </footer>
    </article>
  `,
  styles: [`
    .project-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        transform: translateY(-2px);
      }

      &.selected {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      color: #fff;
    }

    .card-description {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0 0 0.75rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }

    .card-dates {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.75rem;
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
  `]
})
export class ProjectCardComponent {
  // Inputs
  readonly project = input.required<Project>();
  readonly selected = input<boolean>(false);

  // Outputs
  readonly onSelect = output<Project>();
  readonly onEdit = output<Project>();
  readonly onDelete = output<string>();

  // Computed
  readonly isSelected = computed(() => this.selected());

  readonly statusColor = computed(() =>
    PROJECT_STATUSES.find(s => s.id === this.project().status)?.color ?? '#64748b'
  );

  readonly statusLabel = computed(() =>
    PROJECT_STATUSES.find(s => s.id === this.project().status)?.label ?? this.project().status
  );

  // Utility
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
