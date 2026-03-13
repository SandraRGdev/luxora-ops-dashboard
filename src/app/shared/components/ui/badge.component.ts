import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="badgeClass()" [class.pill]="pill()">
      @if (icon()) {
        <span class="badge-icon">{{ icon() }}</span>
      }
      <span class="badge-content">
        <ng-content></ng-content>
      </span>
      @if (dismissible()) {
        <button class="badge-dismiss" (click)="onDismiss.emit()">×</button>
      }
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.125rem 0.5rem;
      border-radius: 0.25rem;
      white-space: nowrap;
    }

    .pill {
      border-radius: 9999px;
      padding: 0.125rem 0.625rem;
    }

    /* Variants */
    .badge-primary {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .badge-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .badge-success {
      background: #dcfce7;
      color: #16a34a;
    }

    .badge-danger {
      background: #fee2e2;
      color: #dc2626;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-info {
      background: #e0f2fe;
      color: #0369a1;
    }

    .badge-gray {
      background: #f3f4f6;
      color: #4b5563;
    }

    /* Outline variants */
    .badge-outline-primary {
      background: transparent;
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }

    .badge-outline-secondary {
      background: transparent;
      color: #64748b;
      border: 1px solid #cbd5e1;
    }

    .badge-outline-success {
      background: transparent;
      color: #22c55e;
      border: 1px solid #22c55e;
    }

    .badge-outline-danger {
      background: transparent;
      color: #dc2626;
      border: 1px solid #dc2626;
    }

    /* Sizes */
    .badge-small {
      font-size: 0.625rem;
      padding: 0.0625rem 0.375rem;
    }

    .badge-medium {
      font-size: 0.75rem;
    }

    .badge-large {
      font-size: 0.875rem;
      padding: 0.25rem 0.75rem;
    }

    .badge-icon {
      font-size: 1em;
    }

    .badge-content {
      display: contents;
    }

    .badge-dismiss {
      background: none;
      border: none;
      font-size: 1.25em;
      line-height: 1;
      cursor: pointer;
      opacity: 0.6;
      padding: 0;
      margin-left: 0.25rem;

      &:hover {
        opacity: 1;
      }
    }
  `]
})
export class BadgeComponent {
  // Inputs
  readonly variant = input<'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray'>('primary');
  readonly outline = input<boolean>(false);
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly pill = input<boolean>(false);
  readonly icon = input<string>('');
  readonly dismissible = input<boolean>(false);

  // Outputs
  readonly onDismiss = output<void>();

  // Computed
  readonly badgeClass = computed(() => {
    const classes: string[] = [];

    if (this.outline()) {
      classes.push(`badge-outline-${this.variant()}`);
    } else {
      classes.push(`badge-${this.variant()}`);
    }

    if (this.size() !== 'medium') {
      classes.push(`badge-${this.size()}`);
    }

    return classes.join(' ');
  });
}
