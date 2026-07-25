import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { clientPurchase } from '../../../core/models/clientPurchase.model';

@Component({
  selector: 'app-client-purchase-grid',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './client-purchase-grid.component.html',
  styleUrl: './client-purchase-grid.component.scss'
})
export class ClientPurchaseGridComponent {
  @Input() clientPOs: clientPurchase[] | undefined = [];
  @Output() onEditClick = new EventEmitter<any>();

  expandedRows: { [id: number]: boolean } = {};

  triggerEditWorkflow(record: any): void {
    this.onEditClick.emit(record);
  }
}
