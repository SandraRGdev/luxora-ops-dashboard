import { Component, input, output, contentChild, TemplateRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="table" [class.striped]="striped()" [class.hoverable]="hoverable()" [class.bordered]="bordered()">
        <thead>
          <tr>
            @if (selectable()) {
              <th class="checkbox-col">
                <input
                  type="checkbox"
                  [checked]="allSelected()"
                  [indeterminate]="someSelected()"
                  (change)="toggleAllSelection()"
                />
              </th>
            }
            @for (column of columns(); track column.key) {
              <th
                [style.width]="column.width"
                [class.sortable]="column.sortable"
                [class.sorted]="sort()?.key === column.key"
                (click)="onColumnClick(column)"
              >
                <div class="th-content" [class]="column.align || 'left'">
                  <span>{{ column.label }}</span>
                  @if (column.sortable) {
                    <span class="sort-icon">
                      @if (sort()?.key === column.key) {
                        @if (sort()?.direction === 'asc') {
                          ↑
                        } @else {
                          ↓
                        }
                      } @else {
                        ↕
                      }
                    </span>
                  }
                </div>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data(); track trackBy ? trackBy(row) : $index) {
            <tr
              [class.selected]="isRowSelected(row)"
              (click)="onRowClick(row, $event)"
            >
              @if (selectable()) {
                <td class="checkbox-col">
                  <input
                    type="checkbox"
                    [checked]="isRowSelected(row)"
                    (change)="toggleRowSelection(row); $event.stopPropagation()"
                    (click)="$event.stopPropagation()"
                  />
                </td>
              }
              @for (column of columns(); track column.key) {
                <td [class]="column.align || 'left'">
                  @if (cellTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="cellTemplate()!"
                      [ngTemplateOutletContext]="{ row: row, column: column, value: row[column.key] }"
                    ></ng-container>
                  } @else {
                    {{ row[column.key] }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length + (selectable() ? 1 : 0)" class="empty-cell">
                <div class="empty-content">
                  @if (emptyMessage()) {
                    {{ emptyMessage() }}
                  } @else {
                    No data available
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th, td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }

      th {
        background: #f8fafc;
        font-weight: 600;
        color: #475569;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &.striped tbody tr:nth-child(even) {
        background: #f8fafc;
      }

      &.hoverable tbody tr:hover {
        background: #f1f5f9;
      }

      &.bordered th,
      &.bordered td {
        border: 1px solid #e2e8f0;
      }
    }

    .checkbox-col {
      width: 40px;
      text-align: center;

      input[type="checkbox"] {
        cursor: pointer;
      }
    }

    .sortable {
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #e2e8f0;
      }
    }

    .sorted {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .th-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &.center {
        justify-content: center;
      }

      &.right {
        justify-content: flex-end;
      }
    }

    .sort-icon {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .selected {
      background: #eff6ff !important;
    }

    .empty-cell {
      padding: 3rem 1rem;
    }

    .empty-content {
      text-align: center;
      color: #64748b;
    }

    td.left {
      text-align: left;
    }

    td.center {
      text-align: center;
    }

    td.right {
      text-align: right;
    }
  `]
})
export class TableComponent<T = any> {
  // Inputs
  readonly columns = input.required<TableColumn[]>();
  readonly data = input<T[]>([]);
  readonly sortable = input<boolean>(true);
  readonly sort = input<TableSort | null>(null);
  readonly selectable = input<boolean>(false);
  readonly striped = input<boolean>(false);
  readonly hoverable = input<boolean>(true);
  readonly bordered = input<boolean>(false);
  readonly emptyMessage = input<string>('');
  readonly trackBy = input<(item: T) => any>((item: T) => item);

  // Outputs
  readonly onSortChange = output<TableSort>();
  readonly onRowSelect = output<T>();
  readonly onRowClick = output<{ row: T; event: MouseEvent }>();

  // Content child for custom cell template
  readonly cellTemplate = contentChild<TemplateRef<any>>('cell');

  // Selection state
  readonly selectedRows = signal<Set<T>>(new Set());

  // Computed
  allSelected = () => {
    const data = this.data();
    const selected = this.selectedRows();
    return data.length > 0 && selected.size === data.length;
  };

  someSelected = () => {
    const data = this.data();
    const selected = this.selectedRows();
    return selected.size > 0 && selected.size < data.length;
  };

  isRowSelected = (row: T): boolean => this.selectedRows().has(row);

  // Methods
  onColumnClick(column: TableColumn): void {
    if (!column.sortable || !this.sortable()) return;

    const currentSort = this.sort();
    const direction = currentSort?.key === column.key && currentSort.direction === 'asc'
      ? 'desc'
      : 'asc';

    this.onSortChange.emit({ key: column.key, direction });
  }

  toggleAllSelection(): void {
    const data = this.data();
    const allSelected = this.allSelected();

    if (allSelected) {
      this.selectedRows.set(new Set());
    } else {
      this.selectedRows.set(new Set(data));
    }
  }

  toggleRowSelection(row: T): void {
    const selected = new Set(this.selectedRows());
    if (selected.has(row)) {
      selected.delete(row);
    } else {
      selected.add(row);
    }
    this.selectedRows.set(selected);
    this.onRowSelect.emit(row);
  }
}
