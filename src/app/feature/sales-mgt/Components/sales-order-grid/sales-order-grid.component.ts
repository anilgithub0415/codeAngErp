import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Component Modules
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-sales-order-grid',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    DataViewModule, 
    SelectButtonModule, 
    ButtonModule, 
    RippleModule
  ],
  templateUrl: './sales-order-grid.component.html'
})
export class SalesOrderGridComponent {
  @Input() visibleDataArray: any[] = [];
  @Input() expandedRows: { [id: number]: boolean } = {};
  @Output() edit = new EventEmitter<any>();

  @Output() onDeleteClick = new EventEmitter<any>();

  layoutMode: 'list' | 'grid' = 'list';
  
  layoutOptions = [
    { label: 'List View', value: 'list', icon: 'pi pi-list' },
    { label: 'Card Grid', value: 'grid', icon: 'pi pi-th-large' }
  ];

  onEdit(so: any): void {
    this.edit.emit(so);
  }


  triggerDelete(so: any) {
    this.onDeleteClick.emit(so);
  }

  toggleRowExpansion(id: number): void {
    this.expandedRows[id] = !this.expandedRows[id];
  }

  setCardHover(event: MouseEvent, isHovered: boolean): void {
    const card = event.currentTarget as HTMLElement;
    if (isHovered) {
      card.classList.remove('shadow-1');
      card.classList.add('shadow-4');
    } else {
      card.classList.remove('shadow-4');
      card.classList.add('shadow-1');
    }
  }
}
