import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Component Dependencies
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';

import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';

@Component({
  selector: 'app-customer-grid',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TableModule, 
    ButtonModule, 
    RippleModule,
    DataViewModule,
    SelectButtonModule,
      DataViewModule, 
     
    
  ],
  templateUrl: './customer-grid.component.html',
  styleUrl: './customer-grid.component.scss'
})
export class CustomerGridComponent {
  // Input parameters mirrored from parent manager components
  @Input() customers: any[] = [];
  @Input() visibleDataArray: any[] = [];
  @Input() currOpMode!: FormOpMode;
  @Input() expandedRows: { [id: number]: boolean } = {};

  // Communication output lanes
  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<number>();
  @Output() rowToggle = new EventEmitter<any>();

  // State configurations for layout transformations
  layoutMode: 'list' | 'grid' = 'grid';
  
  layoutOptions = [
    { label: 'List Layout', value: 'list', icon: 'pi pi-list' },
    { label: 'Decorative Cards', value: 'grid', icon: 'pi pi-th-large' }
  ];

  /**
   * Applies card elevation transforms dynamically when a user hovers over grid records.
   */
  setCardHover(event: MouseEvent, isHovering: boolean): void {
    const cardElement = event.currentTarget as HTMLElement;
    if (cardElement && cardElement.style) {
      if (isHovering) {
        cardElement.style.transform = 'translateY(-3px)';
      } else {
        cardElement.style.transform = 'translateY(0px)';
      }
    }
  }
}
