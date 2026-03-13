import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMember } from '@features/team/models/team-member.model';
import { ProjectOpsService } from '@core/services/project-ops.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="member-detail-panel">
      <header class="panel-header">
        <h2>{{ member().name }}</h2>
        <button class="btn-close" (click)="onClose.emit()">✕</button>
      </header>

      <div class="panel-content">
        <div class="avatar-large">
          @if (member().avatar) {
            <img [src]="member().avatar" [alt]="member().name" />
          } @else {
            <span class="avatar-placeholder">{{ initials() }}</span>
          }
        </div>

        <section class="info-section">
          <h4>Contact Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Email</label>
              <span>{{ member().email }}</span>
            </div>
            <div class="info-item">
              <label>Role</label>
              <span class="role-badge" [class]="member().role">
                {{ member().role }}
              </span>
            </div>
          </div>
        </section>

        <section class="stats-section">
          <h4>Workload</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ member().projectIds.length }}</span>
              <span class="stat-label">Projects</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ assignedTasks().length }}</span>
              <span class="stat-label">Assigned Tasks</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ completedTasks() }}</span>
              <span class="stat-label">Completed</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ inProgressTasks() }}</span>
              <span class="stat-label">In Progress</span>
            </div>
          </div>
        </section>

        <section class="projects-section">
          <h4>Projects</h4>
          <div class="projects-list">
            @for (projectId of member().projectIds; track projectId) {
              <div class="project-item">
                <span class="project-name">{{ getProjectName(projectId) }}</span>
                <span class="project-tasks">
                  {{ getProjectTasksCount(projectId) }} tasks
                </span>
              </div>
            } @empty {
              <p class="empty-text">No projects assigned</p>
            }
          </div>
        </section>

        <section class="tasks-section">
          <h4>Recent Tasks</h4>
          <div class="tasks-list">
            @for (task of assignedTasks().slice(0, 5); track task.id) {
              <div class="task-item">
                <span class="task-title">{{ task.title }}</span>
                <span
                  class="status-dot"
                  [style.background-color]="getStatusColor(task.status)"
                ></span>
              </div>
            } @empty {
              <p class="empty-text">No tasks assigned</p>
            }
          </div>
        </section>
      </div>

      <footer class="panel-actions">
        <button class="btn-secondary" (click)="onEdit.emit(member())">Edit Member</button>
        <button class="btn-danger" (click)="onDelete.emit(member().id)">Remove</button>
      </footer>
    </aside>
  `,
  styles: [`
    .member-detail-panel {
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

    .avatar-large {
      width: 100px;
      height: 100px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      overflow: hidden;
      background: #f1f5f9;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 2rem;
        font-weight: 600;
        color: #64748b;
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      }
    }

    .info-section,
    .stats-section,
    .projects-section,
    .tasks-section {
      margin-bottom: 1.5rem;

      h4 {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .info-grid {
      display: grid;
      gap: 0.75rem;
    }

    .info-item {
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
      }
    }

    .role-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      text-transform: capitalize;

      &.admin {
        background: #fef3c7;
        color: #92400e;
      }

      &.manager {
        background: #e0f2fe;
        color: #0369a1;
      }

      &.developer {
        background: #dbeafe;
        color: #1d4ed8;
      }

      &.designer {
        background: #fce7f3;
        color: #9d174d;
      }

      &.qa {
        background: #d1fae5;
        color: #065f46;
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

    .projects-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .project-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      background: #f8fafc;
      border-radius: 0.375rem;
      font-size: 0.875rem;

      .project-name {
        font-weight: 500;
      }

      .project-tasks {
        color: #64748b;
      }
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8fafc;
      border-radius: 0.375rem;
      font-size: 0.875rem;

      .task-title {
        color: #1e293b;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }

    .empty-text {
      color: #94a3b8;
      font-size: 0.875rem;
      font-style: italic;
      margin: 0;
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
export class MemberDetailComponent {
  private readonly projectOps = inject(ProjectOpsService);

  // Inputs
  readonly member = input.required<TeamMember>();

  // Outputs
  readonly onClose = output<void>();
  readonly onEdit = output<TeamMember>();
  readonly onDelete = output<string>();

  // Computed
  readonly initials = computed(() =>
    this.member()
      .name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  );

  readonly assignedTasks = computed(() =>
    this.projectOps.getTasksByAssignee(this.member().id)
  );

  readonly completedTasks = computed(() =>
    this.assignedTasks().filter(t => t.status === 'done').length
  );

  readonly inProgressTasks = computed(() =>
    this.assignedTasks().filter(t => t.status === 'in-progress').length
  );

  // Utility methods
  getProjectName(projectId: string): string {
    return this.projectOps.getProjectById(projectId)?.name ?? 'Unknown';
  }

  getProjectTasksCount(projectId: string): number {
    return this.projectOps.getTasksByProject(projectId)
      .filter(t => t.assigneeId === this.member().id).length;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'todo': '#94a3b8',
      'in-progress': '#3b82f6',
      'review': '#f59e0b',
      'done': '#22c55e'
    };
    return colors[status] ?? '#64748b';
  }
}
