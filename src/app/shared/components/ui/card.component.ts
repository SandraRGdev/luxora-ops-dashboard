import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="card" [class]="cardClass()" (click)="onClick.emit($event)">
      @if (title() || actions()) {
        <header class="card-header">
          @if (title()) {
            <h3 class="card-title">{{ title() }}</h3>
          }
          @if (actions()) {
            <div class="card-actions">
              <ng-content select="[card-actions]"></ng-content>
            </div>
          }
        </header>
      }

      <div class="card-body">
        <ng-content></ng-content>
      </div>

      @if (footer()) {
        <footer class="card-footer">
          <ng-content select="[card-footer]"></ng-content>
        </footer>
      }
    </article>
  `,
  styles: [`
    .card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      overflow: hidden;
      transition: all 0.2s;

      &.clickable {
        cursor: pointer;

        &:hover {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      }

      &.elevated {
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      }

      &.bordered {
        border-width: 2px;
      }

      &.highlight {
        border-left: 3px solid #3b82f6;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .card-body {
      padding: 1rem;
    }

    .card-footer {
      padding: 1rem;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
    }

    /* Padding variants */
    .padding-none .card-body {
      padding: 0;
    }

    .padding-small .card-body,
    .padding-small .card-header,
    .padding-small .card-footer {
      padding: 0.5rem;
    }

    .padding-large .card-body,
    .padding-large .card-header,
    .padding-large .card-footer {
      padding: 1.5rem;
    }
  `]
})
export class CardComponent {
  // Inputs
  readonly title = input<string>('');
  readonly actions = input<boolean>(false);
  readonly footer = input<boolean>(false);
  readonly clickable = input<boolean>(false);
  readonly elevated = input<boolean>(false);
  readonly bordered = input<boolean>(false);
  readonly highlight = input<boolean>(false);
  readonly padding = input<'none' | 'small' | 'medium' | 'large'>('medium');

  // Outputs
  readonly onClick = output<Event>();

  // Computed
  readonly cardClass = computed(() => {
    const classes: string[] = [];
    if (this.clickable()) classes.push('clickable');
    if (this.elevated()) classes.push('elevated');
    if (this.bordered()) classes.push('bordered');
    if (this.highlight()) classes.push('highlight');
    if (this.padding() !== 'medium') classes.push(`padding-${this.padding()}`);
    return classes.join(' ');
  });
}
