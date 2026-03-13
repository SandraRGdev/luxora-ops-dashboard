import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPI } from '@features/metrics/models/metrics.model';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="kpi-card" [class.highlight]="highlight()" [class.positive]="isPositive()" [class.negative]="isNegative()">
      <header class="kpi-header">
        <span class="kpi-label">{{ kpi().label }}</span>
        @if (kpi().trend) {
          <span class="kpi-trend" [class]="kpi().trend">
            @switch (kpi().trend) {
              @case ('up') {
                <span class="trend-icon">↑</span>
              }
              @case ('down') {
                <span class="trend-icon">↓</span>
              }
              @default {
                <span class="trend-icon">→</span>
              }
            }
            <span class="trend-value">{{ kpi().trendPercentage }}%</span>
          </span>
        }
      </header>

      <div class="kpi-body">
        <span class="kpi-value">{{ formattedValue() }}</span>
        @if (kpi().unit) {
          <span class="kpi-unit">{{ kpi().unit }}</span>
        }
      </div>

      @if (kpi().previousValue !== undefined) {
        <footer class="kpi-footer">
          <span class="comparison">
            vs <strong>{{ kpi().previousValue }}{{ kpi().unit || '' }}</strong> previous period
          </span>
        </footer>
      }

      @if (showSparkline()) {
        <div class="sparkline">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline
              [attr.points]="sparklinePoints()"
              fill="none"
              [class]="kpi().trend || 'stable'"
              stroke-width="2"
            />
          </svg>
        </div>
      }
    </article>
  `,
  styles: [`
    .kpi-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
      position: relative;
      overflow: hidden;

      &.highlight {
        border-left: 3px solid #3b82f6;
      }

      &.positive {
        border-left-color: #22c55e;
      }

      &.negative {
        border-left-color: #dc2626;
      }
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .kpi-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;

      &.up {
        background: #dcfce7;
        color: #16a34a;
      }

      &.down {
        background: #fee2e2;
        color: #dc2626;
      }

      &.stable {
        background: #f1f5f9;
        color: #64748b;
      }
    }

    .trend-icon {
      font-size: 0.625rem;
    }

    .kpi-body {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .kpi-unit {
      font-size: 1rem;
      font-weight: 500;
      color: #64748b;
    }

    .kpi-footer {
      margin-top: 0.5rem;

      .comparison {
        font-size: 0.75rem;
        color: #94a3b8;

        strong {
          color: #64748b;
        }
      }
    }

    .sparkline {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      opacity: 0.3;

      svg {
        width: 100%;
        height: 100%;
      }

      polyline {
        &.up {
          stroke: #22c55e;
        }

        &.down {
          stroke: #dc2626;
        }

        &.stable {
          stroke: #64748b;
        }
      }
    }
  `]
})
export class KpiCardComponent {
  // Inputs
  readonly kpi = input.required<KPI>();
  readonly highlight = input<boolean>(false);
  readonly showSparkline = input<boolean>(false);

  // Computed
  readonly formattedValue = computed(() => {
    const value = this.kpi().value;
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
  });

  readonly isPositive = computed(() => {
    const kpi = this.kpi();
    return kpi.trend === 'up' && kpi.value > (kpi.previousValue || 0);
  });

  readonly isNegative = computed(() => {
    const kpi = this.kpi();
    return kpi.trend === 'down' && kpi.value < (kpi.previousValue || 0);
  });

  readonly sparklinePoints = computed(() => {
    // Generate mock sparkline data based on trend
    const kpi = this.kpi();
    const points: number[] = [];
    const current = kpi.value;
    const previous = kpi.previousValue || current;

    for (let i = 0; i < 10; i++) {
      const progress = i / 9;
      const value = previous + (current - previous) * progress + (Math.random() - 0.5) * 2;
      points.push(value);
    }

    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;

    return points.map((val, i) => {
      const x = (i / 9) * 100;
      const y = 30 - ((val - min) / range) * 25;
      return `${x},${y}`;
    }).join(' ');
  });
}
