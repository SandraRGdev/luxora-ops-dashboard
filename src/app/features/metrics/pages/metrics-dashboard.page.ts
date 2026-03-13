import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectOpsService } from '@core/services/project-ops.service';
import { Project } from '@features/projects/models/project.model';
import { Task, TaskPriority } from '@features/tasks/models/task.model';
import { MemberRole, TeamMember } from '@features/team/models/team-member.model';
import { Status } from '@shared/models/status.model';

type DataView = 'projects' | 'tasks' | 'team';

interface ProjectFormState {
  name: string;
  description: string;
  status: Status['id'];
  startDate: string;
  endDate: string;
}

interface TaskFormState {
  title: string;
  description: string;
  status: Status['id'];
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  dueDate: string;
}

interface TeamFormState {
  name: string;
  email: string;
  role: MemberRole;
  projectIds: string[];
}

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-shell">
      @if (!projectOps.ready()) {
        <section class="loading-state panel">
          <p>Cargando datos del dashboard...</p>
        </section>
      } @else {
        <section class="hero panel">
          <div class="hero-copy">
            <span class="eyebrow">Centro de control moderno</span>
            <h1>Dashboard conectado a datos JSON editables</h1>
            <p>
              Las metricas, registros y actividad leen del archivo base
              <strong><code>db.json</code></strong> y guardan tus cambios localmente.
            </p>

            <div class="hero-actions">
              <button class="action primary" type="button" (click)="setView('projects')">
                Abrir registros
              </button>
              <button class="action" type="button" (click)="downloadExport()">
                Exportar JSON
              </button>
              <button class="action" type="button" (click)="resetData()">
                Restaurar base
              </button>
            </div>
          </div>

          <div class="hero-stats">
            <div class="mini-stat">
              <span class="label">Registros totales</span>
              <strong>{{ totalRecords() }}</strong>
            </div>
            <div class="mini-stat">
              <span class="label">Avance</span>
              <strong>{{ projectOps.taskCompletionRate() }}%</strong>
            </div>
            <div class="mini-stat highlight">
              <span class="label">Proyectos activos</span>
              <strong>{{ projectOps.activeProjects() }}</strong>
            </div>
          </div>
        </section>

        <section class="stats-grid">
          @for (card of statCards(); track card.label) {
            <article class="stat-card panel">
              <span class="label">{{ card.label }}</span>
              <strong>{{ card.value }}</strong>
              <span class="meta">{{ card.meta }}</span>
            </article>
          }
        </section>

        <section class="insights-grid">
          <article class="wide-card panel">
            <div class="section-head">
              <div>
                <span class="eyebrow">Pulso del progreso</span>
                <h2>Flujo de tareas actual</h2>
              </div>
              <span class="chip">{{ projectOps.totalTasks() }} tareas</span>
            </div>

            <div class="chart-stack">
              @for (item of taskStatusCards(); track item.label) {
                <div class="chart-row">
                  <div class="chart-labels">
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                  <div class="chart-track">
                    <div
                      class="chart-fill"
                      [style.width.%]="item.percent"
                      [style.background]="item.color"
                    ></div>
                  </div>
                </div>
              }
            </div>

            <div class="priority-grid">
              @for (item of priorityCards(); track item.label) {
                <div class="priority-pill">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              }
            </div>
          </article>

          <article class="panel compact-card">
            <div class="section-head">
              <div>
                <span class="eyebrow">Radar de salud</span>
                <h2>Estado de proyectos</h2>
              </div>
            </div>

            <div class="health-list">
              @for (project of projectHealth(); track project.id) {
                <div class="health-item">
                  <div>
                    <strong>{{ project.name }}</strong>
                    <span>{{ project.done }}/{{ project.total }} tareas hechas</span>
                  </div>
                  <div class="health-side">
                    <span class="badge" [class]="project.tone">{{ project.label }}</span>
                    <small>{{ project.progress }}%</small>
                  </div>
                </div>
              }
            </div>
          </article>
        </section>

        <section class="workspace-grid">
          <article class="panel activity-card">
            <div class="section-head">
              <div>
                <span class="eyebrow">Carga del equipo</span>
                <h2>Asignaciones por miembro</h2>
              </div>
            </div>

            <div class="workload-list">
              @for (member of workload(); track member.memberId) {
                <div class="workload-item">
                  <div class="member-tag">
                    <span class="avatar">{{ initials(member.memberName) }}</span>
                    <div>
                      <strong>{{ member.memberName }}</strong>
                      <span>{{ member.completedTasks }} completadas</span>
                    </div>
                  </div>

                  <div class="workload-track">
                    <div
                      class="workload-fill"
                      [style.width.%]="workloadPercent(member.assignedTasks)"
                    ></div>
                  </div>

                  <span class="count">{{ member.assignedTasks }}</span>
                </div>
              }
            </div>
          </article>

          <article class="panel activity-card">
            <div class="section-head">
              <div>
                <span class="eyebrow">Proximos hitos</span>
                <h2>Siguientes vencimientos</h2>
              </div>
            </div>

            <div class="deadline-list">
              @for (task of upcomingTasks(); track task.id) {
                <div class="deadline-item">
                  <div>
                    <strong>{{ task.title }}</strong>
                    <span>{{ projectName(task.projectId) }}</span>
                  </div>
                  <div class="deadline-side">
                    <span class="badge neutral">{{ task.priority }}</span>
                    <small>{{ formatDate(task.dueDate) }}</small>
                  </div>
                </div>
              } @empty {
                <p class="empty-copy">No hay tareas con fecha.</p>
              }
            </div>
          </article>
        </section>

        <section class="records panel">
          <div class="records-head">
            <div>
              <span class="eyebrow">Datos editables</span>
              <h2>Lee, edita y elimina registros conectados al JSON</h2>
            </div>

            <div class="record-tabs">
              @for (tab of tabs; track tab.id) {
                <button
                  class="tab-btn"
                  type="button"
                  [class.active]="view() === tab.id"
                  (click)="changeView(tab.id)"
                >
                  {{ tab.label }}
                </button>
              }
            </div>
          </div>

          <div class="records-layout">
            <div class="record-list">
              <div class="record-toolbar">
                <input
                  type="text"
                  class="filter-input"
                  placeholder="Filtrar el conjunto actual"
                  [value]="filterText()"
                  (input)="updateFilter($event)"
                />
                <button class="action primary small" type="button" (click)="startCreate()">
                  Nuevo {{ activeLabel() }}
                </button>
              </div>

              @if (view() === 'projects') {
                @for (project of filteredProjects(); track project.id) {
                  <button class="row-card" type="button" (click)="editProject(project)">
                    <div>
                      <strong>{{ project.name }}</strong>
                      <span>{{ project.description || 'Sin descripcion' }}</span>
                    </div>
                    <div class="row-side">
                      <span class="badge" [class]="toneFromStatus(project.status)">
                        {{ project.status }}
                      </span>
                      <small>{{ project.teamMemberIds.length }} miembros</small>
                    </div>
                  </button>
                } @empty {
                  <p class="empty-copy">No hay proyectos con ese filtro.</p>
                }
              }

              @if (view() === 'tasks') {
                @for (task of filteredTasks(); track task.id) {
                  <button class="row-card" type="button" (click)="editTask(task)">
                    <div>
                      <strong>{{ task.title }}</strong>
                      <span>{{ projectName(task.projectId) }} · {{ assigneeName(task.assigneeId) }}</span>
                    </div>
                    <div class="row-side">
                      <span class="badge" [class]="toneFromStatus(task.status)">
                        {{ task.status }}
                      </span>
                      <small>{{ task.priority }}</small>
                    </div>
                  </button>
                } @empty {
                  <p class="empty-copy">No hay tareas con ese filtro.</p>
                }
              }

              @if (view() === 'team') {
                @for (member of filteredMembers(); track member.id) {
                  <button class="row-card" type="button" (click)="editMember(member)">
                    <div>
                      <strong>{{ member.name }}</strong>
                      <span>{{ member.email }}</span>
                    </div>
                    <div class="row-side">
                      <span class="badge neutral">{{ member.role }}</span>
                      <small>{{ member.projectIds.length }} proyectos</small>
                    </div>
                  </button>
                } @empty {
                  <p class="empty-copy">No hay miembros con ese filtro.</p>
                }
              }
            </div>

            <div class="form-card">
              <div class="form-head">
                <div>
                  <span class="eyebrow">{{ editingId() ? 'Editar registro' : 'Crear registro' }}</span>
                  <h3>{{ formTitle() }}</h3>
                </div>
                @if (editingId()) {
                  <button class="action small" type="button" (click)="clearForm()">
                    Cancelar
                  </button>
                }
              </div>

              @if (view() === 'projects') {
                <form class="editor-form" (ngSubmit)="submitProject()">
                  <label>
                    <span>Nombre</span>
                    <input [(ngModel)]="projectForm.name" name="projectName" required />
                  </label>
                  <label>
                    <span>Descripcion</span>
                    <textarea [(ngModel)]="projectForm.description" name="projectDescription" rows="4"></textarea>
                  </label>
                  <div class="form-split">
                    <label>
                      <span>Estado</span>
                      <select [(ngModel)]="projectForm.status" name="projectStatus">
                        @for (status of projectStatuses; track status) {
                          <option [value]="status">{{ status }}</option>
                        }
                      </select>
                    </label>
                    <label>
                      <span>Fecha de inicio</span>
                      <input [(ngModel)]="projectForm.startDate" name="projectStartDate" type="date" required />
                    </label>
                  </div>
                  <label>
                    <span>Fecha de fin</span>
                    <input [(ngModel)]="projectForm.endDate" name="projectEndDate" type="date" />
                  </label>
                  <div class="form-actions">
                    <button class="action primary" type="submit">
                      {{ editingId() ? 'Guardar proyecto' : 'Crear proyecto' }}
                    </button>
                    @if (editingId()) {
                      <button class="action danger" type="button" (click)="deleteCurrent()">
                        Eliminar
                      </button>
                    }
                  </div>
                </form>
              }

              @if (view() === 'tasks') {
                <form class="editor-form" (ngSubmit)="submitTask()">
                  <label>
                    <span>Titulo</span>
                    <input [(ngModel)]="taskForm.title" name="taskTitle" required />
                  </label>
                  <label>
                    <span>Descripcion</span>
                    <textarea [(ngModel)]="taskForm.description" name="taskDescription" rows="4"></textarea>
                  </label>
                  <div class="form-split triple">
                    <label>
                      <span>Estado</span>
                      <select [(ngModel)]="taskForm.status" name="taskStatus">
                        @for (status of taskStatuses; track status) {
                          <option [value]="status">{{ status }}</option>
                        }
                      </select>
                    </label>
                    <label>
                      <span>Prioridad</span>
                      <select [(ngModel)]="taskForm.priority" name="taskPriority">
                        @for (priority of priorities; track priority) {
                          <option [value]="priority">{{ priority }}</option>
                        }
                      </select>
                    </label>
                    <label>
                      <span>Fecha limite</span>
                      <input [(ngModel)]="taskForm.dueDate" name="taskDueDate" type="date" />
                    </label>
                  </div>
                  <div class="form-split">
                    <label>
                      <span>Proyecto</span>
                      <select [(ngModel)]="taskForm.projectId" name="taskProjectId" required>
                        @for (project of projectOps.projects(); track project.id) {
                          <option [value]="project.id">{{ project.name }}</option>
                        }
                      </select>
                    </label>
                    <label>
                      <span>Responsable</span>
                      <select [(ngModel)]="taskForm.assigneeId" name="taskAssigneeId">
                        <option value="">Sin asignar</option>
                        @for (member of projectOps.teamMembers(); track member.id) {
                          <option [value]="member.id">{{ member.name }}</option>
                        }
                      </select>
                    </label>
                  </div>
                  <div class="form-actions">
                    <button class="action primary" type="submit">
                      {{ editingId() ? 'Guardar tarea' : 'Crear tarea' }}
                    </button>
                    @if (editingId()) {
                      <button class="action danger" type="button" (click)="deleteCurrent()">
                        Eliminar
                      </button>
                    }
                  </div>
                </form>
              }

              @if (view() === 'team') {
                <form class="editor-form" (ngSubmit)="submitMember()">
                  <label>
                    <span>Nombre</span>
                    <input [(ngModel)]="teamForm.name" name="memberName" required />
                  </label>
                  <label>
                    <span>Correo</span>
                    <input [(ngModel)]="teamForm.email" name="memberEmail" type="email" required />
                  </label>
                  <div class="form-split">
                    <label>
                      <span>Rol</span>
                      <select [(ngModel)]="teamForm.role" name="memberRole">
                        @for (role of roles; track role) {
                          <option [value]="role">{{ role }}</option>
                        }
                      </select>
                    </label>
                    <label>
                      <span>Proyectos</span>
                      <select multiple name="memberProjects" (change)="onProjectsSelection($event)">
                        @for (project of projectOps.projects(); track project.id) {
                          <option
                            [value]="project.id"
                            [selected]="teamForm.projectIds.includes(project.id)"
                          >
                            {{ project.name }}
                          </option>
                        }
                      </select>
                    </label>
                  </div>
                  <div class="selection-preview">
                    @for (projectId of teamForm.projectIds; track projectId) {
                      <span class="badge neutral">{{ projectName(projectId) }}</span>
                    } @empty {
                      <span class="empty-copy">No hay proyectos vinculados.</span>
                    }
                  </div>
                  <div class="form-actions">
                    <button class="action primary" type="submit">
                      {{ editingId() ? 'Guardar miembro' : 'Crear miembro' }}
                    </button>
                    @if (editingId()) {
                      <button class="action danger" type="button" (click)="deleteCurrent()">
                        Eliminar
                      </button>
                    }
                  </div>
                </form>
              }
            </div>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard-shell {
      display: grid;
      gap: 1.1rem;
      padding-bottom: 1rem;
    }

    .panel {
      background: var(--panel);
      border: 1px solid var(--stroke);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-card);
      backdrop-filter: blur(18px);
    }

    .hero {
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      gap: 1rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(141, 130, 196, 0.92), rgba(174, 166, 223, 0.88));
      color: white;
    }

    .hero-copy h1,
    .records h2,
    .section-head h2,
    .form-head h3 {
      margin: 0;
      font-size: clamp(1.2rem, 2vw, 2rem);
      line-height: 1.1;
    }

    .hero-copy p {
      max-width: 44rem;
      color: rgba(255, 255, 255, 0.82);
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 0.5rem;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.85;
    }

    .hero-actions,
    .form-actions,
    .record-tabs {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .action,
    .tab-btn {
      border: 1px solid rgba(93, 84, 133, 0.12);
      background: rgba(255, 255, 255, 0.78);
      color: var(--text-main);
      border-radius: 999px;
      padding: 0.78rem 1rem;
      cursor: pointer;
      transition: 0.2s ease;
      font-weight: 700;
    }

    .hero .action {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.18);
      color: white;
    }

    .action:hover,
    .tab-btn:hover {
      transform: translateY(-1px);
    }

    .primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      color: var(--accent-dark);
      border-color: transparent;
    }

    .danger {
      background: #fff1f2;
      color: #b42318;
    }

    .small {
      padding: 0.6rem 0.9rem;
      font-size: 0.85rem;
    }

    .hero-stats {
      display: grid;
      gap: 0.8rem;
      align-content: center;
    }

    .mini-stat,
    .stat-card,
    .priority-pill,
    .compact-card,
    .activity-card,
    .form-card {
      background: rgba(255, 255, 255, 0.82);
      color: var(--text-main);
    }

    .mini-stat {
      padding: 1rem 1.15rem;
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255, 255, 255, 0.22);
    }

    .mini-stat strong {
      display: block;
      margin-top: 0.25rem;
      font-size: 2rem;
    }

    .mini-stat.highlight {
      background: linear-gradient(135deg, rgba(183, 239, 95, 0.95), rgba(226, 251, 178, 0.92));
      color: var(--accent-dark);
    }

    .label,
    .meta,
    .chart-labels span,
    .health-item span,
    .member-tag span,
    .deadline-item span,
    .row-card span,
    label span,
    .empty-copy {
      color: var(--text-soft);
    }

    .stats-grid,
    .workspace-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .stat-card {
      padding: 1.15rem 1.2rem;
      border-radius: var(--radius-lg);
    }

    .stat-card strong {
      display: block;
      margin: 0.35rem 0 0.15rem;
      font-size: 2rem;
    }

    .insights-grid,
    .records-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.95fr);
      gap: 1rem;
    }

    .wide-card,
    .compact-card,
    .activity-card,
    .records {
      padding: 1.3rem;
    }

    .section-head,
    .records-head,
    .form-head,
    .record-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .chip,
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.4rem 0.7rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: capitalize;
    }

    .chip,
    .neutral {
      background: rgba(93, 84, 133, 0.08);
      color: var(--text-main);
    }

    .chart-stack,
    .health-list,
    .workload-list,
    .deadline-list,
    .record-list,
    .editor-form {
      display: grid;
      gap: 0.9rem;
    }

    .chart-row,
    .health-item,
    .workload-item,
    .deadline-item {
      display: grid;
      gap: 0.7rem;
      align-items: center;
    }

    .chart-row {
      grid-template-columns: 140px 1fr;
    }

    .chart-labels,
    .row-side,
    .health-side,
    .deadline-side {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
    }

    .chart-track,
    .workload-track {
      height: 12px;
      border-radius: 999px;
      background: rgba(93, 84, 133, 0.08);
      overflow: hidden;
    }

    .chart-fill,
    .workload-fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #8d82c4, #b7ef5f);
    }

    .priority-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .priority-pill {
      padding: 0.9rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid rgba(93, 84, 133, 0.08);
    }

    .priority-pill strong {
      display: block;
      margin-top: 0.3rem;
      font-size: 1.45rem;
    }

    .health-item,
    .deadline-item {
      grid-template-columns: 1fr auto;
      padding: 0.95rem 1rem;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(93, 84, 133, 0.08);
    }

    .workload-item {
      grid-template-columns: minmax(0, 220px) 1fr auto;
    }

    .member-tag {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 2.6rem;
      height: 2.6rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #d9f8a6, #b7ef5f);
      color: var(--accent-dark);
      font-weight: 800;
    }

    .count {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .records {
      padding-bottom: 1.4rem;
    }

    .record-list,
    .form-card {
      min-height: 22rem;
    }

    .filter-input,
    input,
    select,
    textarea {
      width: 100%;
      border: 1px solid rgba(93, 84, 133, 0.12);
      background: rgba(255, 255, 255, 0.84);
      color: var(--text-main);
      border-radius: 16px;
      padding: 0.82rem 0.9rem;
      outline: none;
    }

    select[multiple] {
      min-height: 8.5rem;
    }

    textarea {
      resize: vertical;
    }

    .row-card {
      width: 100%;
      border: 1px solid rgba(93, 84, 133, 0.08);
      background: rgba(255, 255, 255, 0.72);
      border-radius: 18px;
      padding: 1rem;
      text-align: left;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
      cursor: pointer;
    }

    .row-card strong,
    .health-item strong,
    .deadline-item strong,
    .member-tag strong {
      display: block;
      margin-bottom: 0.2rem;
    }

    .form-card {
      padding: 1.2rem;
      border-radius: var(--radius-lg);
      border: 1px solid rgba(93, 84, 133, 0.08);
    }

    .editor-form label {
      display: grid;
      gap: 0.45rem;
    }

    .form-split {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.9rem;
    }

    .form-split.triple {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .selection-preview {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      min-height: 2rem;
    }

    .tab-btn.active,
    .healthy {
      background: linear-gradient(135deg, var(--accent), #dbf6a6);
      color: var(--accent-dark);
      border-color: transparent;
    }

    .critical,
    .on-hold {
      background: #fff1f3;
      color: #b42318;
    }

    .at-risk,
    .review {
      background: #fff6e7;
      color: #b54708;
    }

    .active,
    .done {
      background: #e8fff1;
      color: #067647;
    }

    .planning,
    .todo {
      background: #f2f4f7;
      color: #344054;
    }

    .in-progress {
      background: #eef4ff;
      color: #175cd3;
    }

    .completed {
      background: #ebfdf3;
      color: #067647;
    }

    .loading-state {
      padding: 2rem;
      text-align: center;
    }

    @media (max-width: 1200px) {
      .stats-grid,
      .workspace-grid,
      .priority-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .insights-grid,
      .records-layout,
      .hero {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      .stats-grid,
      .workspace-grid,
      .priority-grid,
      .form-split,
      .form-split.triple,
      .chart-row,
      .workload-item,
      .row-card,
      .health-item,
      .deadline-item {
        grid-template-columns: 1fr;
      }

      .dashboard-shell {
        gap: 0.9rem;
      }

      .hero,
      .wide-card,
      .compact-card,
      .activity-card,
      .records,
      .form-card {
        padding: 1rem;
      }
    }
  `]
})
export class MetricsDashboardPage {
  readonly projectOps = inject(ProjectOpsService);

  readonly tabs: Array<{ id: DataView; label: string }> = [
    { id: 'projects', label: 'Proyectos' },
    { id: 'tasks', label: 'Tareas' },
    { id: 'team', label: 'Equipo' }
  ];

  readonly projectStatuses: Array<Status['id']> = ['planning', 'active', 'on-hold', 'completed'];
  readonly taskStatuses: Array<Status['id']> = ['todo', 'in-progress', 'review', 'done'];
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  readonly roles: MemberRole[] = ['admin', 'manager', 'developer', 'designer', 'qa'];

  readonly view = signal<DataView>('projects');
  readonly editingId = signal<string | null>(null);
  readonly filterText = signal('');

  projectForm = this.emptyProjectFormState();
  taskForm = this.emptyTaskFormState();
  teamForm = this.emptyTeamFormState();

  readonly statCards = computed(() => [
    {
      label: 'Proyectos en base',
      value: this.projectOps.totalProjects(),
      meta: `${this.projectOps.completedProjects()} completados`
    },
    {
      label: 'Trabajo activo',
      value: this.projectOps.inProgressTasks(),
      meta: `${this.projectOps.pendingTasks()} pendientes`
    },
    {
      label: 'Equipo conectado',
      value: this.projectOps.totalTeamMembers(),
      meta: `${this.projectOps.teamVelocity()} tareas/semana`
    },
    {
      label: 'Alertas vencidas',
      value: this.projectOps.overdueTasks().length,
      meta: 'Requiere seguimiento'
    }
  ]);

  readonly totalRecords = computed(() =>
    this.projectOps.projects().length + this.projectOps.tasks().length + this.projectOps.teamMembers().length
  );

  readonly taskStatusCards = computed(() => {
    const total = Math.max(this.projectOps.totalTasks(), 1);
    const items = [
      { label: 'Por hacer', value: this.projectOps.pendingTasks(), color: 'linear-gradient(90deg, #b7b6c9, #8f8da9)' },
      { label: 'En progreso', value: this.projectOps.inProgressTasks(), color: 'linear-gradient(90deg, #7b92ff, #4d6cf7)' },
      {
        label: 'Revision',
        value: this.projectOps.tasksByStatus()['review'] ?? 0,
        color: 'linear-gradient(90deg, #ffdb8f, #f5a524)'
      },
      { label: 'Hechas', value: this.projectOps.completedTasks(), color: 'linear-gradient(90deg, #ccf68a, #93d840)' }
    ];

    return items.map(item => ({ ...item, percent: Math.round((item.value / total) * 100) }));
  });

  readonly priorityCards = computed(() => [
    { label: 'Baja', value: this.projectOps.tasksByPriority().low },
    { label: 'Media', value: this.projectOps.tasksByPriority().medium },
    { label: 'Alta', value: this.projectOps.tasksByPriority().high },
    { label: 'Urgente', value: this.projectOps.tasksByPriority().urgent }
  ]);

  readonly projectHealth = computed(() =>
    this.projectOps.projects().map(project => {
      const tasks = this.projectOps.getTasksByProject(project.id);
      const done = tasks.filter(task => task.status === 'done').length;
      const total = tasks.length;
      const progress = total ? Math.round((done / total) * 100) : 0;
      const tone = progress >= 70 ? 'healthy' : progress >= 35 ? 'at-risk' : 'critical';
      const label = tone === 'healthy' ? 'Saludable' : tone === 'at-risk' ? 'Atencion' : 'Critico';
      return { id: project.id, name: project.name, done, total, progress, tone, label };
    })
  );

  readonly workload = computed(() => this.projectOps.workloadPerMember());

  readonly upcomingTasks = computed(() =>
    [...this.projectOps.tasks()]
      .filter(task => !!task.dueDate)
      .sort((left, right) => (left.dueDate?.getTime() ?? 0) - (right.dueDate?.getTime() ?? 0))
      .slice(0, 5)
  );

  readonly filteredProjects = computed(() => {
    const term = this.filterText().trim().toLowerCase();
    if (!term) {
      return this.projectOps.projects();
    }

    return this.projectOps.projects().filter(project =>
      `${project.name} ${project.description} ${project.status}`.toLowerCase().includes(term)
    );
  });

  readonly filteredTasks = computed(() => {
    const term = this.filterText().trim().toLowerCase();
    if (!term) {
      return this.projectOps.tasks();
    }

    return this.projectOps.tasks().filter(task =>
      `${task.title} ${task.description} ${task.status} ${task.priority}`.toLowerCase().includes(term)
    );
  });

  readonly filteredMembers = computed(() => {
    const term = this.filterText().trim().toLowerCase();
    if (!term) {
      return this.projectOps.teamMembers();
    }

    return this.projectOps.teamMembers().filter(member =>
      `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(term)
    );
  });

  readonly activeLabel = computed(() => {
    const labels: Record<DataView, string> = {
      projects: 'proyecto',
      tasks: 'tarea',
      team: 'miembro'
    };

    return labels[this.view()];
  });
  readonly formTitle = computed(() => {
    const action = this.editingId() ? 'Update' : 'Create';
    return `${action === 'Update' ? 'Editar' : 'Crear'} ${this.activeLabel()}`;
  });

  setView(view: DataView): void {
    this.changeView(view);
  }

  changeView(view: DataView): void {
    this.view.set(view);
    this.clearForm();
  }

  updateFilter(event: Event): void {
    this.filterText.set((event.target as HTMLInputElement).value);
  }

  startCreate(): void {
    this.clearForm();
  }

  clearForm(): void {
    this.editingId.set(null);
    this.projectForm = this.emptyProjectFormState();
    this.taskForm = this.emptyTaskFormState();
    this.teamForm = this.emptyTeamFormState();
  }

  editProject(project: Project): void {
    this.view.set('projects');
    this.editingId.set(project.id);
    this.projectForm = {
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: this.toDateInput(project.startDate),
      endDate: this.toDateInput(project.endDate)
    };
  }

  editTask(task: Task): void {
    this.view.set('tasks');
    this.editingId.set(task.id);
    this.taskForm = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assigneeId: task.assigneeId ?? '',
      dueDate: this.toDateInput(task.dueDate)
    };
  }

  editMember(member: TeamMember): void {
    this.view.set('team');
    this.editingId.set(member.id);
    this.teamForm = {
      name: member.name,
      email: member.email,
      role: member.role,
      projectIds: [...member.projectIds]
    };
  }

  submitProject(): void {
    const form = this.projectForm;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      startDate: new Date(form.startDate),
      endDate: form.endDate ? new Date(form.endDate) : null
    };

    if (!payload.name || !form.startDate) {
      return;
    }

    if (this.editingId()) {
      this.projectOps.updateProject(this.editingId()!, payload);
    } else {
      this.projectOps.createProject(payload);
    }

    this.clearForm();
  }

  submitTask(): void {
    const form = this.taskForm;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      projectId: form.projectId,
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate ? new Date(form.dueDate) : null
    };

    if (!payload.title || !payload.projectId) {
      return;
    }

    if (this.editingId()) {
      this.projectOps.updateTask(this.editingId()!, payload);
    } else {
      this.projectOps.createTask(payload);
    }

    this.clearForm();
  }

  submitMember(): void {
    const form = this.teamForm;
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      projectIds: form.projectIds
    };

    if (!payload.name || !payload.email) {
      return;
    }

    if (this.editingId()) {
      this.projectOps.updateTeamMember(this.editingId()!, payload);
    } else {
      this.projectOps.createTeamMember(payload);
    }

    this.clearForm();
  }

  deleteCurrent(): void {
    const id = this.editingId();
    if (!id) {
      return;
    }

    const confirmed = window.confirm('¿Eliminar este registro?');
    if (!confirmed) {
      return;
    }

    if (this.view() === 'projects') {
      this.projectOps.deleteProject(id);
    } else if (this.view() === 'tasks') {
      this.projectOps.deleteTask(id);
    } else {
      this.projectOps.deleteTeamMember(id);
    }

    this.clearForm();
  }

  async resetData(): Promise<void> {
    const confirmed = window.confirm('¿Restaurar todos los datos al archivo base db.json?');
    if (!confirmed) {
      return;
    }

    await this.projectOps.resetDatabase();
    this.clearForm();
  }

  downloadExport(): void {
    const blob = new Blob([this.projectOps.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-data-export.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  onProjectsSelection(event: Event): void {
    const selected = Array.from((event.target as HTMLSelectElement).selectedOptions).map(option => option.value);
    this.teamForm = { ...this.teamForm, projectIds: selected };
  }

  projectName(projectId: string): string {
    return this.projectOps.getProjectById(projectId)?.name ?? 'Proyecto desconocido';
  }

  assigneeName(assigneeId: string | null): string {
    if (!assigneeId) {
      return 'Sin asignar';
    }

    return this.projectOps.getTeamMemberById(assigneeId)?.name ?? 'Sin asignar';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  workloadPercent(tasks: number): number {
    const max = Math.max(...this.workload().map(member => member.assignedTasks), 1);
    return Math.round((tasks / max) * 100);
  }

  formatDate(value: Date | null): string {
    if (!value) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(value);
  }

  toneFromStatus(status: Status['id']): string {
    return status;
  }

  private emptyProjectFormState(): ProjectFormState {
    return {
      name: '',
      description: '',
      status: 'planning',
      startDate: this.toDateInput(new Date()),
      endDate: ''
    };
  }

  private emptyTaskFormState(): TaskFormState {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: this.projectOps.projects()[0]?.id ?? '',
      assigneeId: '',
      dueDate: ''
    };
  }

  private emptyTeamFormState(): TeamFormState {
    return {
      name: '',
      email: '',
      role: 'developer',
      projectIds: []
    };
  }

  private toDateInput(value: Date | null): string {
    if (!value) {
      return '';
    }

    return new Date(value).toISOString().slice(0, 10);
  }
}
