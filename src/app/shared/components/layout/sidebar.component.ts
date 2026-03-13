import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">O</span>
          @if (!collapsed()) {
            <span class="logo-text">Luxora Ops</span>
          }
        </div>
        <button class="toggle-btn" type="button" (click)="onToggle.emit()">
          {{ collapsed() ? '+' : '-' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          @for (item of navItems; track item.path) {
            <li class="nav-item">
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                class="nav-link"
                [attr.title]="collapsed() ? item.label : null"
              >
                <span class="nav-icon">{{ item.icon }}</span>
                @if (!collapsed()) {
                  <span class="nav-label">{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <footer class="sidebar-footer">
        @if (!collapsed()) {
          <div class="user-info">
            <div class="user-avatar">SA</div>
            <div class="user-details">
              <span class="user-name">Sandra Admin</span>
              <span class="user-role">Centro de control</span>
            </div>
          </div>
        } @else {
          <div class="user-avatar">SA</div>
        }
      </footer>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 1rem;
      top: 1rem;
      bottom: 1rem;
      width: 264px;
      background: linear-gradient(180deg, rgba(98, 89, 147, 0.92), rgba(116, 105, 168, 0.9));
      color: #fff;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 100;
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: var(--shadow-soft);
      backdrop-filter: blur(20px);

      &.collapsed {
        width: 80px;
      }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.14);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 2.2rem;
      height: 2.2rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.45);
      display: grid;
      place-items: center;
      font-size: 0.95rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.08);
    }

    .logo-text {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .toggle-btn {
      width: 2rem;
      height: 2rem;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #fff;
      padding: 0;
      border-radius: 999px;
      cursor: pointer;
      font-size: 1rem;

      &:hover {
        background: rgba(255, 255, 255, 0.22);
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.75rem;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin: 0.3rem 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      color: rgba(255, 255, 255, 0.72);
      text-decoration: none;
      border-radius: 16px;
      transition: all 0.25s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }

      &.active {
        background: rgba(255, 255, 255, 0.96);
        color: var(--panel-dark);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
      }
    }

    .nav-icon {
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
      font-size: 0.88rem;
      font-weight: 700;
    }

    .nav-label {
      font-size: 0.875rem;
      white-space: nowrap;
      font-weight: 600;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.14);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.1);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #d9f8a6, #b7ef5f);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
      color: var(--accent-dark);
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .user-role {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.68);
    }

    @media (max-width: 768px) {
      .sidebar {
        left: 0.75rem;
        top: 0.75rem;
        bottom: 0.75rem;
        transform: translateX(0);
      }

      .sidebar.collapsed {
        transform: translateX(-120%);
        width: 264px;
      }
    }
  `]
})
export class SidebarComponent {
  // Inputs
  readonly collapsed = input<boolean>(false);

  // Outputs
  readonly onToggle = output<void>({ alias: 'toggle' });

  // Navigation items
  readonly navItems: NavItem[] = [
    { path: '/metrics', label: 'Resumen', icon: 'RS' },
    { path: '/projects', label: 'Proyectos', icon: 'PR' },
    { path: '/tasks', label: 'Tareas', icon: 'TS' },
    { path: '/team', label: 'Equipo', icon: 'EQ' },
  ];
}
