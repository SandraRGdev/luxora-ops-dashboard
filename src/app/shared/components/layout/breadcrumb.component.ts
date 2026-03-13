import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        @for (item of items(); track $index) {
          <li class="breadcrumb-item" [class.active]="!item.path">
            @if (item.path) {
              <a [routerLink]="item.path" class="breadcrumb-link">
                {{ item.label }}
              </a>
            } @else {
              <span class="breadcrumb-text">{{ item.label }}</span>
            }
            @if (!$last) {
              <span class="separator">{{ separator() }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.25rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
    }

    .breadcrumb-link {
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #3b82f6;
      }
    }

    .breadcrumb-text {
      color: #1e293b;
      font-weight: 500;
    }

    .separator {
      color: #cbd5e1;
      margin: 0 0.5rem;
    }

    .active .breadcrumb-text {
      color: #1e293b;
    }
  `]
})
export class BreadcrumbComponent {
  // Inputs
  readonly items = input<BreadcrumbItem[]>([]);
  readonly separator = input<string>('/');
}
