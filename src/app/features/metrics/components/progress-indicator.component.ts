import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-indicator" [class]="size()">
      @if (showLabel() && labelPosition() === 'top') {
        <div class="progress-label">
          <span class="label-text">{{ label() }}</span>
          <span class="label-value">{{ progress() }}%</span>
        </div>
      }

      <div class="progress-bar" [class.rounded]="rounded()" [class.animated]="animated()">
        <div
          class="progress-fill"
          [style.width.%]="progress()"
          [class]="colorClass()"
        ></div>

        @if (striped()) {
          <div class="progress-stripes"></div>
        }
      </div>

      @if (showLabel() && labelPosition() === 'bottom') {
        <div class="progress-label">
          <span class="label-text">{{ label() }}</span>
          <span class="label-value">{{ progress() }}%</span>
        </div>
      }

      @if (showValue() && labelPosition() === 'inside') {
        <div class="progress-value-inside">
          {{ progress() }}%
        </div>
      }
    </div>
  `,
  styles: [`
    .progress-indicator {
      width: 100%;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.375rem;

      .label-text {
        font-size: 0.875rem;
        color: #64748b;
      }

      .label-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1e293b;
      }
    }

    .progress-bar {
      position: relative;
      height: var(--progress-height, 8px);
      background: #e2e8f0;
      overflow: hidden;

      &.rounded {
        border-radius: 9999px;
      }

      &.animated .progress-fill {
        animation: progress-shimmer 2s ease-in-out infinite;
      }
    }

    .progress-fill {
      height: 100%;
      background: var(--progress-color, #3b82f6);
      transition: width 0.3s ease;

      &.primary {
        --progress-color: #3b82f6;
      }

      &.success {
        --progress-color: #22c55e;
      }

      &.warning {
        --progress-color: #f59e0b;
      }

      &.danger {
        --progress-color: #dc2626;
      }

      &.info {
        --progress-color: #06b6d4;
      }
    }

    .progress-stripes {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.1) 10px,
        rgba(255, 255, 255, 0.1) 20px
      );
    }

    .progress-value-inside {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: #fff;
    }

    /* Sizes */
    .small {
      .progress-bar {
        --progress-height: 4px;
      }

      .progress-label {
        font-size: 0.75rem;
      }
    }

    .medium {
      .progress-bar {
        --progress-height: 8px;
      }
    }

    .large {
      .progress-bar {
        --progress-height: 16px;
      }

      .progress-value-inside {
        font-size: 0.875rem;
      }
    }

    @keyframes progress-shimmer {
      0% {
        opacity: 0.8;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.8;
      }
    }
  `]
})
export class ProgressIndicatorComponent {
  // Inputs
  readonly progress = input<number>(0);
  readonly label = input<string>('');
  readonly color = input<'primary' | 'success' | 'warning' | 'danger' | 'info'>('primary');
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly showLabel = input<boolean>(true);
  readonly showValue = input<boolean>(true);
  readonly labelPosition = input<'top' | 'bottom' | 'inside'>('top');
  readonly rounded = input<boolean>(true);
  readonly striped = input<boolean>(false);
  readonly animated = input<boolean>(false);

  // Computed
  readonly colorClass = computed(() => this.color());
}
