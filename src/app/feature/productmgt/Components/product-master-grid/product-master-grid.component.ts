import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Component Dependencies
import { DataViewModule } from 'primeng/dataview';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-product-master-grid',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    DataViewModule, 
    TableModule, 
    ButtonModule, 
    SelectButtonModule
  ], 
  templateUrl: './product-master-grid.component.html',
  styleUrl: './product-master-grid.component.scss'
})
export class ProductMasterGridComponent {
  // Input parameters mirrored from parent manager components
  @Input() products: any[] = [];
  @Input() visibleDataArray: any[] = [];

  // Communication output lanes
  @Output() onEditClick = new EventEmitter<any>();
  @Output() onDeleteClick = new EventEmitter<any>();

  // State configurations for layout transformations
  layoutMode: 'list' | 'grid' = 'grid';
  
  layoutOptions = [
    { label: 'List Layout', value: 'list', icon: 'pi pi-list' },
    { label: 'Decorative Cards', value: 'grid', icon: 'pi pi-th-large' }
  ];

  triggerEdit(product: any) {
    this.onEditClick.emit(product);
  }

  triggerDelete(product: any) {
    this.onDeleteClick.emit(product);
  }

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
