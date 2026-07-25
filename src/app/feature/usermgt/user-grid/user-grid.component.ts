import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-grid',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, FilterControlComponent],
  templateUrl: './user-grid.component.html',
  styleUrl: './user-grid.component.scss'
})
export class UserGridComponent implements OnChanges {
  @Input() usersList: User[] = [];
  @Input() visibleDataArray: any[] = [];

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<{ id: number; rowIndex: number }>();

  localVisibleData: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visibleDataArray']) {
      this.localVisibleData = this.visibleDataArray ? [...this.visibleDataArray] : [];
    }
  }

  onDataFiltered(filteredResults: any[]) {
    this.localVisibleData = filteredResults;
  }

  onEditClick(record: any) {
    this.edit.emit(record);
  }

  deleteUser(id: number, rowIndex: number) {
    this.delete.emit({ id, rowIndex });
  }
}
