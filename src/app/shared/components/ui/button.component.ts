import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClass()"
      (click)="onClick.emit($event)"
    >
      @if (loading()) {
        <span class="spinner"></span>
      } @else {
        @if (icon() && iconPosition() === 'left') {
          <span class="btn-icon">{{ icon() }}</span>
        }
        <span class="btn-content">
          <ng-content></ng-content>
        </span>
        @if (icon() && iconPosition() === 'right') {
          <span class="btn-icon">{{ icon() }}</span>
        }
      }
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 500;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    /* Variants */
    .btn-primary {
      background: #3b82f6;
      color: #fff;

      &:hover:not(:disabled) {
        background: #2563eb;
      }
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;

      &:hover:not(:disabled) {
        background: #e2e8f0;
      }
    }

    .btn-success {
      background: #22c55e;
      color: #fff;

      &:hover:not(:disabled) {
        background: #16a34a;
      }
    }

    .btn-danger {
      background: #dc2626;
      color: #fff;

      &:hover:not(:disabled) {
        background: #b91c1c;
      }
    }

    .btn-warning {
      background: #f59e0b;
      color: #fff;

      &:hover:not(:disabled) {
        background: #d97706;
      }
    }

    .btn-ghost {
      background: transparent;
      color: #64748b;

      &:hover:not(:disabled) {
        background: #f1f5f9;
        color: #1e293b;
      }
    }

    .btn-outline {
      background: transparent;
      color: #3b82f6;
      border: 1px solid #3b82f6;

      &:hover:not(:disabled) {
        background: #eff6ff;
      }
    }

    /* Sizes */
    .btn-small {
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
    }

    .btn-medium {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-large {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }

    /* Full width */
    .btn-full {
      width: 100%;
    }

    .btn-icon {
      font-size: 1em;
    }

    .btn-content {
      display: contents;
    }

    .spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class ButtonComponent {
  // Inputs
  readonly variant = input<'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline'>('primary');
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly icon = input<string>('');
  readonly iconPosition = input<'left' | 'right'>('left');
  readonly fullWidth = input<boolean>(false);

  // Outputs
  readonly onClick = output<Event>();

  // Computed
  readonly buttonClass = computed(() => {
    const classes = [
      `btn-${this.variant()}`,
      `btn-${this.size()}`
    ];
    if (this.fullWidth()) {
      classes.push('btn-full');
    }
    return classes.join(' ');
  });
}
