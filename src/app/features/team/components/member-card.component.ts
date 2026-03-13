import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMember } from '@features/team/models/team-member.model';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="member-card"
      [class.selected]="isSelected()"
      (click)="onSelect.emit(member())"
    >
      <div class="avatar">
        @if (member().avatar) {
          <img [src]="member().avatar" [alt]="member().name" />
        } @else {
          <span class="avatar-placeholder">{{ initials() }}</span>
        }
      </div>

      <div class="member-info">
        <h3>{{ member().name }}</h3>
        <span class="role-badge" [class]="member().role">
          {{ member().role }}
        </span>
        <p class="email">{{ member().email }}</p>
      </div>

      <div class="member-stats">
        <div class="stat">
          <span class="stat-value">{{ member().projectIds.length }}</span>
          <span class="stat-label">Projects</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ assignedTasks() }}</span>
          <span class="stat-label">Tasks</span>
        </div>
      </div>

      <footer class="card-actions">
        <button class="btn-icon" (click.stop)="onEdit.emit(member())">✏️</button>
        <button class="btn-icon" (click.stop)="onDelete.emit(member().id)">🗑️</button>
      </footer>
    </article>
  `,
  styles: [`
    .member-card {
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

    .avatar {
      width: 64px;
      height: 64px;
      margin: 0 auto 0.75rem;
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
        font-size: 1.5rem;
        font-weight: 600;
        color: #64748b;
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      }
    }

    .member-info {
      text-align: center;
      margin-bottom: 0.75rem;

      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .email {
        margin: 0.25rem 0 0 0;
        font-size: 0.75rem;
        color: #64748b;
      }
    }

    .role-badge {
      display: inline-block;
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

    .member-stats {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      padding: 0.75rem 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 0.75rem;

      .stat {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
        }
      }
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
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
export class MemberCardComponent {
  // Inputs
  readonly member = input.required<TeamMember>();
  readonly selected = input<boolean>(false);
  readonly taskCount = input<number>(0);

  // Outputs
  readonly onSelect = output<TeamMember>();
  readonly onEdit = output<TeamMember>();
  readonly onDelete = output<string>();

  // Computed
  readonly isSelected = computed(() => this.selected());

  readonly initials = computed(() =>
    this.member()
      .name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  );

  readonly assignedTasks = computed(() => this.taskCount());
}
