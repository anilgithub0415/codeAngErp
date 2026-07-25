import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Component Dependencies
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';

import { IQuotation } from '../../../core/models/quotation.model';

@Component({
  selector: 'app-quotation-grid',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TableModule, 
    ButtonModule,
    RippleModule,
    DataViewModule,
    SelectButtonModule
  ],
  templateUrl: './quotation-grid.component.html',
  styleUrl: './quotation-grid.component.scss'
})
export class QuotationGridComponent {
  @Input() quotations: IQuotation[] = [];
  @Output() onEditClick = new EventEmitter<any>();

  expandedRows: { [id: number]: boolean } = {};

  // State configurations for layout transformations
  layoutMode: 'list' | 'grid' = 'grid';
  
  layoutOptions = [
    { label: 'List Layout', value: 'list', icon: 'pi pi-list' },
    { label: 'Decorative Cards', value: 'grid', icon: 'pi pi-th-large' }
  ];

  triggerEditWorkflow(quote: any): void {
    this.onEditClick.emit(quote);
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

