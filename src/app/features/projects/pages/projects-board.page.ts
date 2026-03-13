import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, CreateProjectDto, UpdateProjectDto } from '@features/projects/models/project.model';
import { ProjectOpsService } from '@core/services/project-ops.service';
import { PROJECT_STATUSES } from '@shared/models/status.model';
import { ProjectFormComponent } from '@features/projects/components/project-form.component';

@Component({
  selector: 'app-projects-board',
  standalone: true,
  imports: [CommonModule, ProjectFormComponent],
  template: `
    <div class="projects-board">
      <!-- Header -->
      <header class="board-header">
        <h1>Tablero de proyectos</h1>
        <div class="header-actions">
          <button class="btn-secondary" type="button" (click)="resetData()" title="Restablecer datos base">
            🔄 Reiniciar
          </button>
          <button class="btn-primary" type="button" (click)="openNewProjectModal()">
            + Nuevo proyecto
          </button>
        </div>
      </header>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <p>Cargando proyectos...</p>
        </div>
      } @else {
        <!-- Metrics Summary -->
        <section class="metrics-summary">
          <div class="metric-card">
            <span class="metric-value">{{ totalProjects() }}</span>
            <span class="metric-label">Total de proyectos</span>
          </div>
          <div class="metric-card">
            <span class="metric-value">{{ activeProjects() }}</span>
            <span class="metric-label">Activos</span>
          </div>
          <div class="metric-card">
            <span class="metric-value">{{ completedProjects() }}</span>
            <span class="metric-label">Completados</span>
          </div>
          <div class="metric-card highlight">
            <span class="metric-value">{{ completionRate() }}%</span>
            <span class="metric-label">Tasa de cierre</span>
          </div>
        </section>

      <!-- Filters -->
      <section class="filters">
        <input
          type="text"
          placeholder="Buscar proyectos..."
          [value]="searchQuery()"
          (input)="onSearch($event)"
          class="search-input"
        />
        <select
          [value]="selectedStatus()"
          (change)="onStatusFilter($event)"
          class="status-filter"
        >
          <option value="">Todos los estados</option>
          @for (status of projectStatuses; track status.id) {
            <option [value]="status.id">{{ status.label }}</option>
          }
        </select>
      </section>

      <!-- Projects Grid -->
      <section class="projects-grid">
        @for (project of filteredProjects(); track project.id) {
          <article
            class="project-card"
            [class.selected]="selectedProjectId() === project.id"
            (click)="selectProject(project.id)"
          >
            <header class="card-header">
              <h3>{{ project.name }}</h3>
              <span
                class="status-badge"
                [style.background-color]="getStatusColor(project.status)"
              >
                {{ getStatusLabel(project.status) }}
              </span>
            </header>

            <p class="card-description">{{ project.description }}</p>

            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-icon">👥</span>
                <span>{{ project.teamMemberIds.length }} miembros</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📋</span>
                <span>{{ project.taskIds.length }} tareas</span>
              </div>
            </div>

            <div class="card-dates">
              <small>Inicio: {{ formatDate(project.startDate) }}</small>
              @if (project.endDate) {
                <small>Fin: {{ formatDate(project.endDate) }}</small>
              }
            </div>

            <footer class="card-actions">
              <button class="btn-icon" type="button" (click)="handleEditProjectClick($event, project)" title="Editar">✏️</button>
              <button class="btn-icon danger" type="button" (click)="handleDeleteProjectClick($event, project)" title="Eliminar">🗑️</button>
            </footer>
          </article>
        } @empty {
          <div class="empty-state">
            <p>No se encontraron proyectos</p>
            <button class="btn-secondary" type="button" (click)="openNewProjectModal()">
              Crear el primer proyecto
            </button>
          </div>
        }
      </section>

      <!-- Selected Project Detail -->
      @if (selectedProject()) {
        <aside class="project-detail-panel">
          <header>
            <h2>{{ selectedProject()!.name }}</h2>
            <button class="btn-close" (click)="closeDetail()">✕</button>
          </header>
          <div class="detail-content">
            <p>{{ selectedProject()!.description }}</p>
            <div class="detail-stats">
              <div class="stat">
                <label>Estado</label>
                <span>{{ getStatusLabel(selectedProject()!.status) }}</span>
              </div>
              <div class="stat">
                <label>Tamano del equipo</label>
                <span>{{ selectedProject()!.teamMemberIds.length }}</span>
              </div>
              <div class="stat">
                <label>Tareas</label>
                <span>{{ selectedProject()!.taskIds.length }}</span>
              </div>
            </div>
          </div>
          <footer class="panel-actions">
            <button class="btn-secondary" (click)="editProject(selectedProject()!)">Editar</button>
            <button class="btn-danger" (click)="confirmDelete(selectedProject()!)">Eliminar</button>
          </footer>
        </aside>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h2>Confirmar eliminacion</h2>
            </header>
            <div class="modal-body">
              <p>¿Seguro que quieres eliminar <strong>{{ projectToDelete()?.name }}</strong>?</p>
              <p class="warning">Esto tambien eliminara las tareas asociadas y no se puede deshacer.</p>
            </div>
            <footer class="modal-footer">
              <button class="btn-secondary" (click)="cancelDelete()">Cancelar</button>
              <button class="btn-danger" (click)="confirmDeleteProject()">Eliminar</button>
            </footer>
          </div>
        </div>
      }

      @if (showProjectModal()) {
        <app-project-form
          [project]="editingProject()"
          (onSubmitForm)="handleProjectSubmit($event)"
          (onCancel)="closeProjectModal()"
        />
      }
      }
    </div>
  `,
  styles: [`
    .projects-board {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    .metrics-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      background: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      text-align: center;

      &.highlight {
        background: #e0f2fe;
      }

      .metric-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
      }

      .metric-label {
        font-size: 0.875rem;
        color: #64748b;
      }
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;

      .search-input,
      .status-filter {
        padding: 0.5rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }

      .search-input {
        flex: 1;
        max-width: 300px;
      }
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .project-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        transform: translateY(-2px);
      }

      &.selected {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      color: #fff;
    }

    .card-description {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0 0 0.75rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }

    .card-dates {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.75rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      color: var(--accent-dark);
      border: none;
      padding: 0.75rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;

      &:hover {
        filter: brightness(0.98);
      }
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.82);
      color: var(--text-main);
      border: 1px solid rgba(93, 84, 133, 0.14);
      padding: 0.75rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;

      &:hover {
        background: rgba(255, 255, 255, 0.98);
      }
    }

    .btn-danger {
      background: #dc2626;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;

      &:hover {
        background: #b91c1c;
      }
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;

      &:hover {
        transform: scale(1.1);
      }

      &.danger:hover {
        filter: hue-rotate(330deg);
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    .project-detail-panel {
      position: fixed;
      right: 1.25rem;
      top: 6.35rem;
      width: 350px;
      height: calc(100vh - 7.6rem);
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid var(--stroke);
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      overflow: auto;
      z-index: 30;

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        h2 {
          margin: 0;
          font-size: 1.25rem;
        }
      }

      .detail-content {
        flex: 1;
      }

      .detail-stats {
        display: grid;
        gap: 0.75rem;
        margin-top: 1rem;

        .stat {
          label {
            display: block;
            font-size: 0.75rem;
            color: #64748b;
            margin-bottom: 0.25rem;
          }

          span {
            font-weight: 600;
          }
        }
      }

      .panel-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }
    }

    @media (max-width: 1024px) {
      .project-detail-panel {
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
        top: 6rem;
        height: calc(100vh - 7rem);
      }
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;

      &:hover {
        color: #1e293b;
      }
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .modal-content {
      background: #fff;
      border-radius: 0.5rem;
      width: 400px;
      max-width: 90vw;
    }

    .modal-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;

      h2 {
        margin: 0;
        font-size: 1.125rem;
      }
    }

    .modal-body {
      padding: 1.5rem;

      .warning {
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #f9fafb;
    }
  `]
})
export class ProjectsBoardPage {
  private readonly projectOps = inject(ProjectOpsService);

  // Reference to constants
  readonly projectStatuses = PROJECT_STATUSES;

  // Loading state
  readonly loading = this.projectOps.loading;

  // Local UI state signals
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedProjectId = signal<string | null>(null);
  readonly showDeleteModal = signal<boolean>(false);
  readonly projectToDelete = signal<Project | null>(null);
  readonly showProjectModal = signal<boolean>(false);
  readonly editingProject = signal<Project | null>(null);

  // Computed from service
  readonly totalProjects = this.projectOps.totalProjects;
  readonly activeProjects = this.projectOps.activeProjects;
  readonly completedProjects = this.projectOps.completedProjects;
  readonly completionRate = this.projectOps.projectCompletionRate;

  // Computed: Selected project
  readonly selectedProject = computed(() =>
    this.projectOps.getProjectById(this.selectedProjectId() ?? '')
  );

  // Computed: Filtered projects
  readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    const projects = this.projectOps.projects();

    return projects.filter(project => {
      const matchesQuery = project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);
      const matchesStatus = !status || project.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  // Event handlers
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onStatusFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value);
  }

  selectProject(id: string): void {
    this.selectedProjectId.set(id);
  }

  closeDetail(): void {
    this.selectedProjectId.set(null);
  }

  openNewProjectModal(): void {
    this.editingProject.set(null);
    this.showProjectModal.set(true);
  }

  editProject(project: Project): void {
    this.selectedProjectId.set(project.id);
    this.editingProject.set(project);
    this.showProjectModal.set(true);
  }

  confirmDelete(project: Project): void {
    this.projectToDelete.set(project);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.projectToDelete.set(null);
  }

  confirmDeleteProject(): void {
    const project = this.projectToDelete();
    if (project) {
      this.projectOps.deleteProject(project.id);
      if (this.selectedProjectId() === project.id) {
        this.selectedProjectId.set(null);
      }
    }
    this.cancelDelete();
  }

  async resetData(): Promise<void> {
    if (confirm('Esto restablecera todos los datos al archivo base. ¿Continuar?')) {
      await this.projectOps.resetDatabase();
    }
  }

  handleProjectSubmit(payload: CreateProjectDto | UpdateProjectDto): void {
    const project = this.editingProject();

    if (project) {
      this.projectOps.updateProject(project.id, payload as UpdateProjectDto);
    } else {
      this.projectOps.createProject(payload as CreateProjectDto);
    }

    this.closeProjectModal();
  }

  closeProjectModal(): void {
    this.showProjectModal.set(false);
    this.editingProject.set(null);
  }

  handleEditProjectClick(event: Event, project: Project): void {
    event.preventDefault();
    event.stopPropagation();
    this.editProject(project);
  }

  handleDeleteProjectClick(event: Event, project: Project): void {
    event.preventDefault();
    event.stopPropagation();
    this.confirmDelete(project);
  }

  // Utility methods
  getStatusColor(status: string): string {
    return PROJECT_STATUSES.find(s => s.id === status)?.color ?? '#64748b';
  }

  getStatusLabel(status: string): string {
    return PROJECT_STATUSES.find(s => s.id === status)?.label ?? status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
