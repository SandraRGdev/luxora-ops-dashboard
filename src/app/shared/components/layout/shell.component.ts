import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-shell" [class.sidebar-collapsed]="sidebarCollapsed()">
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggle)="toggleSidebar()"
      />

      <div class="main-area">
        <app-header
          [sidebarCollapsed]="sidebarCollapsed()"
          (toggleSidebar)="toggleSidebar()"
        />

        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
      background:
        radial-gradient(circle at 10% 0%, rgba(255, 255, 255, 0.85), transparent 24%),
        radial-gradient(circle at 100% 20%, rgba(183, 239, 95, 0.22), transparent 18%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 280px;
      transition: margin-left 0.3s ease;
    }

    .sidebar-collapsed .main-area {
      margin-left: 96px;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 1.25rem 1.25rem;
    }

    @media (max-width: 768px) {
      .main-area {
        margin-left: 0;
      }

      .sidebar-collapsed .main-area {
        margin-left: 0;
      }
    }
  `]
})
export class ShellComponent {
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
