
// purchase-grid.component.ts

import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Component Modules
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-purchase-grid',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, 
    FormsModule,
    DataViewModule, 
    SelectButtonModule, 
    ButtonModule, 
    RippleModule,
    NgxPermissionsModule,TableModule
    
  ],
  templateUrl: './purchase-grid.component.html'
})
export class PurchaseGridComponent {
  @Input() POs: any[] = [];
  @Input() expandedRows: { [id: number]: boolean } = {};
  @Output() onDeleteClick = new EventEmitter<any>();
  
  @Output() onAdd = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();

  layoutMode: 'list' | 'grid' = 'list';
  
  layoutOptions = [
    { label: 'List View', value: 'list', icon: 'pi pi-list' },
    { label: 'Card Grid', value: 'grid', icon: 'pi pi-th-large' }
  ];

  toggleRowExpansion(id: number): void {
    this.expandedRows[id] = !this.expandedRows[id];
  }

  triggerDelete(po: any) {
    this.onDeleteClick.emit(po);
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
