import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, CreateProjectDto, UpdateProjectDto } from '@features/projects/models/project.model';
import { PROJECT_STATUSES } from '@shared/models/status.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2>{{ isEditMode() ? 'Editar proyecto' : 'Nuevo proyecto' }}</h2>
          <button class="btn-close" (click)="onCancel.emit()">✕</button>
        </header>

        <form class="modal-body" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nombre del proyecto *</label>
            <input
              type="text"
              id="name"
              [(ngModel)]="formData.name"
              name="name"
              placeholder="Escribe el nombre"
              required
            />
            @if (errors()['name']) {
              <span class="error">{{ errors()['name'] }}</span>
            }
          </div>

          <div class="form-group">
            <label for="description">Descripcion</label>
            <textarea
              id="description"
              [(ngModel)]="formData.description"
              name="description"
              placeholder="Escribe la descripcion"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="status">Estado</label>
              <select
                id="status"
                [(ngModel)]="formData.status"
                name="status"
              >
                @for (status of projectStatuses; track status.id) {
                  <option [value]="status.id">{{ status.label }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Fecha de inicio *</label>
              <input
                type="date"
                id="startDate"
                [(ngModel)]="formData.startDate"
                name="startDate"
                required
              />
              @if (errors()['startDate']) {
                <span class="error">{{ errors()['startDate'] }}</span>
              }
            </div>

            <div class="form-group">
              <label for="endDate">Fecha de fin</label>
              <input
                type="date"
                id="endDate"
                [(ngModel)]="formData.endDate"
                name="endDate"
              />
            </div>
          </div>
        </form>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" (click)="onCancel.emit()">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" (click)="onSubmit()">
            {{ isEditMode() ? 'Guardar' : 'Crear' }}
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
    }

    .modal-content {
      background: rgba(255, 255, 255, 0.96);
      border-radius: 24px;
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
      border: 1px solid rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(16px);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;

      h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
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

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }

      textarea {
        resize: vertical;
        min-height: 80px;
      }

      .error {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.75rem;
        color: #dc2626;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #f9fafb;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      color: var(--accent-dark);
      border: none;
      padding: 0.7rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;

      &:hover {
        filter: brightness(0.98);
      }
    }

    .btn-secondary {
      background: rgba(93, 84, 133, 0.08);
      color: var(--text-main);
      border: 1px solid rgba(93, 84, 133, 0.14);
      padding: 0.7rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;

      &:hover {
        background: #e5e7eb;
      }
    }
  `]
})
export class ProjectFormComponent {
  readonly projectStatuses = PROJECT_STATUSES;

  // Inputs
  readonly project = input<Project | null>(null);

  // Outputs
  readonly onSubmitForm = output<CreateProjectDto | UpdateProjectDto>();
  readonly onCancel = output<void>();

  // Form state
  formData: CreateProjectDto = {
    name: '',
    description: '',
    status: 'planning',
    startDate: new Date(),
    endDate: null,
  };

  readonly errors = signal<Record<string, string>>({});

  // Computed
  readonly isEditMode = computed(() => !!this.project());

  // Initialize form when project input changes
  ngOnInit(): void {
    const project = this.project();
    if (project) {
      this.formData = {
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : null,
      };
    }
  }

  validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.formData.name.trim()) {
      newErrors['name'] = 'El nombre es obligatorio';
    }

    if (!this.formData.startDate) {
      newErrors['startDate'] = 'La fecha de inicio es obligatoria';
    }

    if (this.formData.endDate && this.formData.startDate &&
        new Date(this.formData.endDate) < new Date(this.formData.startDate)) {
      newErrors['endDate'] = 'La fecha de fin debe ser posterior al inicio';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    if (this.isEditMode()) {
      const updateDto: UpdateProjectDto = {
        name: this.formData.name,
        description: this.formData.description,
        status: this.formData.status,
        startDate: this.formData.startDate,
        endDate: this.formData.endDate,
      };
      this.onSubmitForm.emit(updateDto);
    } else {
      this.onSubmitForm.emit(this.formData);
    }
  }
}
