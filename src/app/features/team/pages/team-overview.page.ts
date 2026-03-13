import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamMember, MemberRole, CreateTeamMemberDto, UpdateTeamMemberDto } from '@features/team/models/team-member.model';
import { ProjectOpsService } from '@core/services/project-ops.service';

@Component({
  selector: 'app-team-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="team-overview">
      <!-- Header -->
      <header class="overview-header">
        <h1>Vista del equipo</h1>
        <button class="btn-primary" type="button" (click)="openNewMemberModal()">
          + Agregar miembro
        </button>
      </header>

      <!-- Metrics Summary -->
      <section class="metrics-summary">
        <div class="metric-card">
          <span class="metric-value">{{ totalMembers() }}</span>
          <span class="metric-label">Total de miembros</span>
        </div>
        @for (role of roleKeys; track role) {
          <div class="metric-card">
            <span class="metric-value">{{ membersByRole()[role] || 0 }}</span>
            <span class="metric-label">{{ role | titlecase }}</span>
          </div>
        }
      </section>

      <!-- Filters -->
      <section class="filters">
        <input
          type="text"
          placeholder="Buscar miembros..."
          [value]="searchQuery()"
          (input)="onSearch($event)"
          class="search-input"
        />
        <select
          [value]="selectedRole()"
          (change)="onRoleFilter($event)"
          class="role-filter"
        >
          <option value="">Todos los roles</option>
          @for (role of memberRoles; track role) {
            <option [value]="role">{{ role | titlecase }}</option>
          }
        </select>
      </section>

      <!-- Team Grid -->
      <section class="team-grid">
        @for (member of filteredMembers(); track member.id) {
          <article
            class="member-card"
            [class.selected]="selectedMemberId() === member.id"
            (click)="selectMember(member.id)"
          >
            <div class="avatar">
              @if (member.avatar) {
                <img [src]="member.avatar" [alt]="member.name" />
              } @else {
                <span class="avatar-placeholder">{{ getInitials(member.name) }}</span>
              }
            </div>

            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <span class="role-badge" [class]="member.role">
                {{ member.role }}
              </span>
              <p class="email">{{ member.email }}</p>
            </div>

            <div class="member-stats">
              <div class="stat">
                <span class="stat-value">{{ member.projectIds.length }}</span>
                <span class="stat-label">Proyectos</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ getMemberTasks(member.id).length }}</span>
                <span class="stat-label">Tareas</span>
              </div>
            </div>

            <footer class="card-actions">
              <button class="btn-icon" type="button" (click)="handleEditMemberClick($event, member)">✏️</button>
              <button class="btn-icon" type="button" (click)="handleDeleteMemberClick($event, member.id)">🗑️</button>
            </footer>
          </article>
        } @empty {
          <div class="empty-state">
            <p>No se encontraron miembros</p>
            <button class="btn-secondary" type="button" (click)="openNewMemberModal()">
              Agregar el primer miembro
            </button>
          </div>
        }
      </section>

      <!-- Selected Member Detail -->
      @if (selectedMember()) {
        <aside class="member-detail-panel">
          <header>
            <h2>{{ selectedMember()!.name }}</h2>
            <button class="btn-close" (click)="closeDetail()">✕</button>
          </header>
          <div class="detail-content">
            <div class="avatar-large">
              @if (selectedMember()!.avatar) {
                <img [src]="selectedMember()!.avatar" [alt]="selectedMember()!.name" />
              } @else {
                <span class="avatar-placeholder">{{ getInitials(selectedMember()!.name) }}</span>
              }
            </div>
            <div class="detail-meta">
              <div class="meta-row">
                <label>Email</label>
                <span>{{ selectedMember()!.email }}</span>
              </div>
              <div class="meta-row">
                <label>Rol</label>
                <span class="role-badge" [class]="selectedMember()!.role">
                  {{ selectedMember()!.role }}
                </span>
              </div>
              <div class="meta-row">
                <label>Proyectos</label>
                <span>{{ selectedMember()!.projectIds.length }}</span>
              </div>
              <div class="meta-row">
                <label>Tareas asignadas</label>
                <span>{{ getMemberTasks(selectedMember()!.id).length }}</span>
              </div>
            </div>
          </div>
          <footer class="detail-actions">
            <button class="btn-secondary" type="button" (click)="editMember(selectedMember()!)">
              Editar
            </button>
            <button class="btn-danger" type="button" (click)="deleteMember(selectedMember()!.id)">
              Eliminar
            </button>
          </footer>
        </aside>
      }

      @if (showMemberModal()) {
        <div class="modal-overlay" (click)="closeMemberModal()">
          <div class="modal-content member-modal" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h2>{{ editingMember() ? 'Editar miembro' : 'Nuevo miembro' }}</h2>
              <button class="btn-close" (click)="closeMemberModal()">✕</button>
            </header>

            <form class="modal-body member-form" (ngSubmit)="saveMember()">
              <div class="form-group">
                <label for="member-name">Nombre *</label>
                <input id="member-name" name="memberName" [(ngModel)]="memberForm.name" required />
              </div>

              <div class="form-group">
                <label for="member-email">Correo *</label>
                <input id="member-email" name="memberEmail" type="email" [(ngModel)]="memberForm.email" required />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="member-role">Rol</label>
                  <select id="member-role" name="memberRole" [(ngModel)]="memberForm.role">
                    @for (role of memberRoles; track role) {
                      <option [value]="role">{{ role }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="member-avatar">Avatar</label>
                  <input id="member-avatar" name="memberAvatar" [(ngModel)]="memberForm.avatar" placeholder="URL opcional" />
                </div>
              </div>

              <div class="form-group">
                <label for="member-projects">Proyectos</label>
                <select id="member-projects" multiple name="memberProjects" (change)="onMemberProjectsChange($event)">
                  @for (project of projectOps.projects(); track project.id) {
                    <option [value]="project.id" [selected]="memberForm.projectIds.includes(project.id)">
                      {{ project.name }}
                    </option>
                  }
                </select>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeMemberModal()">Cancelar</button>
                <button type="submit" class="btn-primary">{{ editingMember() ? 'Guardar' : 'Crear' }}</button>
              </footer>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .team-overview {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
      }
    }

    .metrics-summary {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      background: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      text-align: center;

      .metric-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
      }

      .metric-label {
        font-size: 0.875rem;
        color: #64748b;
        text-transform: capitalize;
      }
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;

      .search-input,
      .role-filter {
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

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .member-card {
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

    .avatar {
      width: 64px;
      height: 64px;
      margin: 0 auto 0.75rem;
      border-radius: 50%;
      overflow: hidden;
      background: #f1f5f9;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 1.5rem;
        font-weight: 600;
        color: #64748b;
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      }
    }

    .member-info {
      text-align: center;
      margin-bottom: 0.75rem;

      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .email {
        margin: 0.25rem 0 0 0;
        font-size: 0.75rem;
        color: #64748b;
      }
    }

    .role-badge {
      display: inline-block;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      text-transform: capitalize;

      &.admin {
        background: #fef3c7;
        color: #92400e;
      }

      &.manager {
        background: #e0f2fe;
        color: #0369a1;
      }

      &.developer {
        background: #dbeafe;
        color: #1d4ed8;
      }

      &.designer {
        background: #fce7f3;
        color: #9d174d;
      }

      &.qa {
        background: #d1fae5;
        color: #065f46;
      }
    }

    .member-stats {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      padding: 0.75rem 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 0.75rem;

      .stat {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
        }
      }
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
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

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    .member-detail-panel {
      position: fixed;
      right: 0;
      top: 0;
      width: 350px;
      height: 100vh;
      background: #fff;
      border-left: 1px solid #e2e8f0;
      padding: 1.5rem;
      box-shadow: -4px 0 6px -1px rgb(0 0 0 / 0.1);

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

      .avatar-large {
        width: 100px;
        height: 100px;
        margin: 0 auto 1rem;
        border-radius: 50%;
        overflow: hidden;
        background: #f1f5f9;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 2rem;
          font-weight: 600;
          color: #64748b;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
        }
      }

      .detail-meta {
        .meta-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;

          label {
            color: #64748b;
            font-size: 0.875rem;
          }

          span {
            font-weight: 500;
          }
        }
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

    .detail-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(22, 18, 40, 0.38);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1rem;
    }

    .modal-content.member-modal {
      width: 100%;
      max-width: 520px;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.45);
      border-radius: 24px;
      backdrop-filter: blur(16px);
      box-shadow: var(--shadow-soft);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(93, 84, 133, 0.12);
    }

    .member-form {
      display: grid;
      gap: 1rem;
    }

    .modal-body {
      padding: 1.25rem;
    }

    .form-group {
      display: grid;
      gap: 0.4rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1px solid rgba(93, 84, 133, 0.14);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.9);
    }

    .form-group select[multiple] {
      min-height: 8rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.25rem;
      padding-top: 0.5rem;
    }

    .btn-danger {
      background: #f04438;
      color: #fff;
      border: none;
      padding: 0.75rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;
    }
  `]
})
export class TeamOverviewPage {
  readonly projectOps = inject(ProjectOpsService);

  readonly memberRoles: MemberRole[] = ['admin', 'manager', 'developer', 'designer', 'qa'];
  readonly roleKeys = this.memberRoles;

  // Local UI state signals
  readonly searchQuery = signal<string>('');
  readonly selectedRole = signal<string>('');
  readonly selectedMemberId = signal<string | null>(null);
  readonly showMemberModal = signal<boolean>(false);
  readonly editingMember = signal<TeamMember | null>(null);
  memberForm: {
    name: string;
    email: string;
    role: MemberRole;
    avatar: string;
    projectIds: string[];
  } = this.createEmptyMemberForm();

  // Computed from service
  readonly totalMembers = this.projectOps.totalTeamMembers;
  readonly membersByRole = this.projectOps.teamMembersByRole;

  // Computed: Selected member
  readonly selectedMember = computed(() =>
    this.projectOps.getTeamMemberById(this.selectedMemberId() ?? '')
  );

  // Computed: Filtered members
  readonly filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const role = this.selectedRole();
    const members = this.projectOps.teamMembers();

    return members.filter(member => {
      const matchesQuery = member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);
      const matchesRole = !role || member.role === role;
      return matchesQuery && matchesRole;
    });
  });

  // Event handlers
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onRoleFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedRole.set(target.value);
  }

  selectMember(id: string): void {
    this.selectedMemberId.set(id);
  }

  closeDetail(): void {
    this.selectedMemberId.set(null);
  }

  openNewMemberModal(): void {
    this.editingMember.set(null);
    this.memberForm = this.createEmptyMemberForm();
    this.showMemberModal.set(true);
  }

  editMember(member: TeamMember): void {
    this.selectedMemberId.set(member.id);
    this.editingMember.set(member);
    this.memberForm = {
      name: member.name,
      email: member.email,
      role: member.role,
      avatar: member.avatar ?? '',
      projectIds: [...member.projectIds]
    };
    this.showMemberModal.set(true);
  }

  deleteMember(id: string): void {
    if (!confirm('¿Seguro que quieres eliminar este miembro?')) {
      return;
    }

    this.projectOps.deleteTeamMember(id);
    if (this.selectedMemberId() === id) {
      this.selectedMemberId.set(null);
    }
  }

  // Utility methods
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getMemberTasks(memberId: string) {
    return this.projectOps.getTasksByAssignee(memberId);
  }

  onMemberProjectsChange(event: Event): void {
    this.memberForm = {
      ...this.memberForm,
      projectIds: Array.from((event.target as HTMLSelectElement).selectedOptions).map(option => option.value)
    };
  }

  saveMember(): void {
    if (!this.memberForm.name.trim() || !this.memberForm.email.trim()) {
      return;
    }

    const editing = this.editingMember();
    if (editing) {
      const payload: UpdateTeamMemberDto = {
        name: this.memberForm.name.trim(),
        email: this.memberForm.email.trim(),
        role: this.memberForm.role,
        avatar: this.memberForm.avatar.trim() || null,
        projectIds: [...this.memberForm.projectIds]
      };
      this.projectOps.updateTeamMember(editing.id, payload);
    } else {
      const payload: CreateTeamMemberDto = {
        name: this.memberForm.name.trim(),
        email: this.memberForm.email.trim(),
        role: this.memberForm.role,
        avatar: this.memberForm.avatar.trim() || null,
        projectIds: [...this.memberForm.projectIds]
      };
      this.projectOps.createTeamMember(payload);
    }

    this.closeMemberModal();
  }

  closeMemberModal(): void {
    this.showMemberModal.set(false);
    this.editingMember.set(null);
    this.memberForm = this.createEmptyMemberForm();
  }

  handleEditMemberClick(event: Event, member: TeamMember): void {
    event.preventDefault();
    event.stopPropagation();
    this.editMember(member);
  }

  handleDeleteMemberClick(event: Event, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteMember(id);
  }

  private createEmptyMemberForm() {
    return {
      name: '',
      email: '',
      role: 'developer' as MemberRole,
      avatar: '',
      projectIds: [] as string[]
    };
  }
}
