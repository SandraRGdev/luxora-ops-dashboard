import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-left">
        <button class="menu-toggle" type="button" (click)="onToggleSidebar.emit()">
          Menu
        </button>
        <div class="breadcrumb">
          <span class="breadcrumb-pill active">Panel operativo</span>
          <span class="breadcrumb-item">Datos JSON en vivo</span>
        </div>
      </div>

      <div class="header-center">
        <div class="search-box">
          <span class="search-icon">/</span>
          <input
            type="text"
            placeholder="Buscar proyectos, tareas y equipo"
            [value]="searchQuery()"
            (input)="onSearch($event)"
            class="search-input"
          />
        </div>
      </div>

      <div class="header-right">
        <button class="header-btn" type="button" (click)="toggleNotifications()">
          <span class="btn-icon">Estado</span>
          <span class="notification-badge">3</span>
        </button>

        <button class="header-btn" type="button" (click)="toggleQuickActions()">
          <span class="btn-icon">Acciones</span>
        </button>

        @if (showQuickActions()) {
          <div class="floating-menu quick-menu">
            <button type="button" class="dropdown-item action-item" (click)="goTo('/metrics')">
              Ir al dashboard
            </button>
            <button type="button" class="dropdown-item action-item" (click)="goTo('/tasks')">
              Ir a tareas
            </button>
            <button type="button" class="dropdown-item action-item" (click)="goTo('/team')">
              Ir al equipo
            </button>
          </div>
        }

        <div class="user-menu" (click)="toggleUserMenu()">
          <div class="user-avatar">SA</div>
          <span class="user-name">Sandra</span>
          <span class="dropdown-icon">v</span>

          @if (showUserMenu()) {
            <div class="dropdown-menu">
              <button type="button" class="dropdown-item action-item" (click)="openProfile($event)">
                Perfil
              </button>
              <button type="button" class="dropdown-item action-item" (click)="openSettings($event)">
                Ajustes
              </button>
              <hr class="dropdown-divider" />
              <button type="button" class="dropdown-item action-item" (click)="logout($event)">
                Cerrar sesión
              </button>
            </div>
          }
        </div>
      </div>
    </header>

    @if (bannerMessage()) {
      <div class="status-banner">
        <span>{{ bannerMessage() }}</span>
        <button type="button" class="close-banner" (click)="bannerMessage.set('')">Cerrar</button>
      </div>
    }
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 1rem 0 1.1rem;
      padding: 0.9rem 1.1rem;
      background: rgba(255, 255, 255, 0.64);
      border: 1px solid var(--stroke);
      border-radius: 24px;
      min-height: 72px;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(16px);
      box-shadow: var(--shadow-card);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      display: none;
      background: rgba(93, 84, 133, 0.08);
      border: 1px solid rgba(93, 84, 133, 0.12);
      color: var(--text-main);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0.55rem 0.8rem;
      border-radius: 999px;

      @media (max-width: 768px) {
        display: block;
      }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      font-size: 0.875rem;
    }

    .breadcrumb-item {
      color: var(--text-soft);
      font-weight: 600;
    }

    .breadcrumb-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.45rem 0.8rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      background: rgba(49, 45, 75, 0.9);
      color: #fff;
    }

    .header-center {
      flex: 1;
      max-width: 420px;
      margin: 0 2rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(93, 84, 133, 0.12);
      border-radius: 999px;
      padding: 0.5rem 0.75rem;
      gap: 0.5rem;
    }

    .search-icon {
      width: 1.8rem;
      height: 1.8rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: rgba(93, 84, 133, 0.08);
      color: var(--text-soft);
      font-size: 0.85rem;
      font-weight: 700;
    }

    .search-input {
      flex: 1;
      background: none;
      border: none;
      font-size: 0.875rem;
      outline: none;
      color: var(--text-main);

      &::placeholder {
        color: #968fb7;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-btn {
      position: relative;
      background: rgba(255, 255, 255, 0.68);
      border: 1px solid rgba(93, 84, 133, 0.12);
      padding: 0.6rem 0.85rem;
      cursor: pointer;
      border-radius: 999px;
      color: var(--text-main);

      &:hover {
        background: rgba(255, 255, 255, 0.92);
      }

      .btn-icon {
        font-size: 0.8rem;
        font-weight: 700;
      }

      .notification-badge {
        position: absolute;
        top: -0.15rem;
        right: -0.15rem;
        background: var(--accent);
        color: var(--accent-dark);
        font-size: 0.625rem;
        padding: 0.125rem 0.375rem;
        border-radius: 9999px;
        font-weight: 600;
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      border-radius: 999px;
      position: relative;
      border: 1px solid rgba(93, 84, 133, 0.12);
      background: rgba(255, 255, 255, 0.68);

      &:hover {
        background: rgba(255, 255, 255, 0.92);
      }
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #d9f8a6, #b7ef5f);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-dark);
      font-weight: 600;
      font-size: 0.75rem;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-main);
    }

    .dropdown-icon {
      font-size: 0.625rem;
      color: var(--text-soft);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid var(--stroke);
      border-radius: 18px;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      min-width: 160px;
      z-index: 100;
      backdrop-filter: blur(12px);
    }

    .floating-menu {
      position: absolute;
      top: calc(100% + 0.65rem);
      right: 10rem;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid var(--stroke);
      border-radius: 18px;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      min-width: 180px;
      z-index: 100;
      backdrop-filter: blur(12px);
      overflow: hidden;
    }

    .action-item {
      width: 100%;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }

    .dropdown-item {
      display: block;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      color: var(--text-main);
      text-decoration: none;

      &:hover {
        background: rgba(93, 84, 133, 0.06);
      }
    }

    .status-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 0.75rem;
      padding: 0.8rem 1rem;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid var(--stroke);
      color: var(--text-main);
    }

    .close-banner {
      border: none;
      background: transparent;
      color: var(--text-soft);
      cursor: pointer;
      font-weight: 700;
    }

    .dropdown-divider {
      border: none;
      border-top: 1px solid rgba(93, 84, 133, 0.12);
      margin: 0.25rem 0;
    }

    @media (max-width: 768px) {
      .app-header {
        margin-top: 0.75rem;
      }

      .header-center {
        display: none;
      }

      .user-name {
        display: none;
      }

      .breadcrumb-item {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  private readonly router = inject(Router);
  // Inputs
  readonly sidebarCollapsed = input<boolean>(false);

  // Outputs
  readonly onToggleSidebar = output<void>({ alias: 'toggleSidebar' });

  // Local state
  readonly searchQuery = signal<string>('');
  readonly showUserMenu = signal<boolean>(false);
  readonly showQuickActions = signal<boolean>(false);
  readonly bannerMessage = signal<string>('');

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  toggleNotifications(): void {
    this.bannerMessage.set('Datos listos. Los cambios se guardan en almacenamiento local del navegador.');
  }

  toggleQuickActions(): void {
    this.showQuickActions.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showQuickActions.set(false);
  }

  goTo(path: string): void {
    this.showQuickActions.set(false);
    void this.router.navigateByUrl(path);
  }

  openProfile(event: Event): void {
    event.stopPropagation();
    this.showUserMenu.set(false);
    this.bannerMessage.set('Perfil activo: Sandra Admin. Rol: Centro de control.');
  }

  openSettings(event: Event): void {
    event.stopPropagation();
    this.showUserMenu.set(false);
    this.bannerMessage.set('Ajustes disponibles: modo claro y panel conectado a db.json.');
  }

  logout(event: Event): void {
    event.stopPropagation();
    this.showUserMenu.set(false);
    this.bannerMessage.set('No hay autenticación real configurada. La sesión local sigue activa.');
  }
}
