import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="onOverlayClick($event)" [@fadeInOut]>
        <div
          class="modal-container"
          [class]="sizeClass()"
          (click)="$event.stopPropagation()"
        >
          <header class="modal-header">
            <h2 class="modal-title">{{ title() }}</h2>
            @if (closable()) {
              <button class="modal-close" (click)="close()" aria-label="Close">
                ✕
              </button>
            }
          </header>

          <div class="modal-body">
            <ng-content></ng-content>
          </div>

          @if (showFooter()) {
            <footer class="modal-footer">
              <ng-content select="[modal-footer]"></ng-content>
              @if (!hasCustomFooter()) {
                <div class="modal-actions">
                  <app-button
                    variant="secondary"
                    (onClick)="onCancel.emit(); close()"
                  >
                    {{ cancelText() }}
                  </app-button>
                  <app-button
                    variant="primary"
                    (onClick)="onConfirm.emit(); close()"
                  >
                    {{ confirmText() }}
                  </app-button>
                </div>
              }
            </footer>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
      max-height: 90vh;
      overflow: auto;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.2s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-small {
      width: 100%;
      max-width: 360px;
    }

    .modal-medium {
      width: 100%;
      max-width: 520px;
    }

    .modal-large {
      width: 100%;
      max-width: 720px;
    }

    .modal-full {
      width: 100%;
      max-width: 95vw;
      height: 95vh;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;
      padding: 0.25rem;
      line-height: 1;

      &:hover {
        color: #1e293b;
      }
    }

    .modal-body {
      padding: 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #f9fafb;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
    }
  `]
})
export class ModalComponent {
  // Inputs
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Modal');
  readonly size = input<'small' | 'medium' | 'large' | 'full'>('medium');
  readonly closable = input<boolean>(true);
  readonly closeOnOverlay = input<boolean>(true);
  readonly showFooter = input<boolean>(true);
  readonly confirmText = input<string>('Confirm');
  readonly cancelText = input<string>('Cancel');
  readonly hasCustomFooter = input<boolean>(false);

  // Outputs
  readonly onOpen = output<void>();
  readonly onClose = output<void>();
  readonly onConfirm = output<void>();
  readonly onCancel = output<void>();

  readonly sizeClass = computed(() => `modal-${this.size()}`);

  // Effects
  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.onOpen.emit();
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  close(): void {
    this.onClose.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay()) {
      this.close();
    }
  }
}
