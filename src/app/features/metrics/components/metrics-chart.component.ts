import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData } from '@features/metrics/models/metrics.model';

@Component({
  selector: 'app-metrics-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="chart-container">
      <header class="chart-header">
        <h3>{{ title() }}</h3>
        @if (subtitle()) {
          <span class="chart-subtitle">{{ subtitle() }}</span>
        }
      </header>

      <div class="chart-body" [class]="type()">
        @if (type() === 'donut') {
          <div class="donut-wrapper">
            <div class="donut-chart">
              <svg viewBox="0 0 100 100" class="donut-svg">
                @for (segment of segments(); track segment.label) {
                  <circle
                    class="donut-segment"
                    [style.stroke]="segment.color"
                    [style.stroke-dasharray]="segment.dashArray"
                    [style.stroke-dashoffset]="segment.dashOffset"
                  />
                }
              </svg>
              <div class="donut-center">
                <span class="center-value">{{ total() }}</span>
                <span class="center-label">{{ centerLabel() }}</span>
              </div>
            </div>
          </div>
        }

        @if (type() === 'bar') {
          <div class="bar-wrapper">
            @for (item, i = $index of chartData().datasets[0].data; track i) {
              <div class="bar-item">
                <div class="bar-label">{{ chartData().labels[i] }}</div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [style.width.%]="getPercentage(item)"
                    [style.background-color]="getColor(i)"
                  ></div>
                </div>
                <div class="bar-value">{{ item }}</div>
              </div>
            }
          </div>
        }

        @if (type() === 'line') {
          <div class="line-wrapper">
            <svg class="line-svg" [attr.viewBox]="'0 0 ' + viewBoxWidth() + ' 100'" preserveAspectRatio="none">
              <polyline
                class="line-path"
                [attr.points]="linePoints()"
                fill="none"
                stroke="#3b82f6"
                stroke-width="2"
              />
              <polyline
                class="area-path"
                [attr.points]="areaPoints()"
                fill="url(#gradient)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        }
      </div>

      @if (showLegend()) {
        <footer class="chart-legend">
          @for (item, i = $index of chartData().labels; track i) {
            <div class="legend-item">
              <span class="legend-color" [style.background-color]="getColor(i)"></span>
              <span class="legend-label">{{ item }}</span>
              <span class="legend-value">{{ chartData().datasets[0].data[i] }}</span>
            </div>
          }
        </footer>
      }
    </article>
  `,
  styles: [`
    .chart-container {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .chart-subtitle {
        font-size: 0.75rem;
        color: #64748b;
      }
    }

    .chart-body {
      min-height: 150px;
    }

    .donut-wrapper {
      display: flex;
      justify-content: center;
      padding: 1rem;
    }

    .donut-chart {
      position: relative;
      width: 150px;
      height: 150px;
    }

    .donut-svg {
      transform: rotate(-90deg);
    }

    .donut-segment {
      fill: none;
      stroke-width: 25;
      r: 35;
      cx: 50;
      cy: 50;
    }

    .donut-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .center-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1e293b;
      }

      .center-label {
        font-size: 0.75rem;
        color: #64748b;
      }
    }

    .bar-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }

    .bar-item {
      display: grid;
      grid-template-columns: 80px 1fr 40px;
      align-items: center;
      gap: 0.75rem;
    }

    .bar-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .bar-track {
      height: 24px;
      background: #f1f5f9;
      border-radius: 0.25rem;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 0.25rem;
      transition: width 0.3s ease;
    }

    .bar-value {
      font-size: 0.875rem;
      font-weight: 600;
      text-align: right;
    }

    .line-wrapper {
      height: 150px;
    }

    .line-svg {
      width: 100%;
      height: 100%;
    }

    .line-path {
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
      margin-top: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .legend-color {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .legend-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    .legend-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1e293b;
    }
  `]
})
export class MetricsChartComponent {
  // Inputs
  readonly title = input<string>('Chart');
  readonly subtitle = input<string>('');
  readonly type = input<'donut' | 'bar' | 'line'>('bar');
  readonly chartData = input.required<ChartData>();
  readonly showLegend = input<boolean>(true);
  readonly centerLabel = input<string>('Total');

  // Computed
  readonly total = computed(() =>
    this.chartData().datasets[0].data.reduce((sum, val) => sum + val, 0)
  );

  readonly max = computed(() =>
    Math.max(...this.chartData().datasets[0].data, 1)
  );

  readonly viewBoxWidth = computed(() =>
    Math.max(this.chartData().labels.length * 30, 100)
  );

  readonly segments = computed(() => {
    const data = this.chartData().datasets[0].data;
    const colors = this.chartData().datasets[0].backgroundColor as string[];
    const total = this.total();
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return data.map((value, i) => {
      const percentage = total > 0 ? value / total : 0;
      const dashArray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
      const dashOffset = -offset;
      offset += circumference * percentage;

      return {
        label: this.chartData().labels[i],
        value,
        color: colors?.[i] || '#64748b',
        dashArray,
        dashOffset
      };
    });
  });

  readonly linePoints = computed(() => {
    const data = this.chartData().datasets[0].data;
    const max = this.max();
    const width = this.viewBoxWidth();
    const step = width / (data.length - 1 || 1);

    return data.map((val, i) => {
      const x = i * step;
      const y = 100 - (val / max) * 80;
      return `${x},${y}`;
    }).join(' ');
  });

  readonly areaPoints = computed(() => {
    const points = this.linePoints();
    const data = this.chartData().datasets[0].data;
    const width = this.viewBoxWidth();
    const step = width / (data.length - 1 || 1);

    return `0,100 ${points} ${(data.length - 1) * step},100`;
  });

  // Utility
  getPercentage(value: number): number {
    return (value / this.max()) * 100;
  }

  getColor(index: number): string {
    const colors = this.chartData().datasets[0].backgroundColor as string[];
    return colors?.[index] || '#64748b';
  }
}
