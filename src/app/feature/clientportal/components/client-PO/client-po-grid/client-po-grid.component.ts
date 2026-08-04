import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RippleModule } from 'primeng/ripple';
import { NgxPermissionsModule } from 'ngx-permissions';
import { clientPurchase } from '../../../../../core/models/clientPurchase.model';

@Component({
  selector: 'app-client-po-grid',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    OverlayPanelModule, 
    RippleModule, 
    NgxPermissionsModule
  ],
  templateUrl: './client-po-grid.component.html',
  styleUrl: './client-po-grid.component.scss'
})
export class ClientPOGridComponent {
  @Input() clientPOs: clientPurchase[] | undefined = [];
  
  @Output() onAdd = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  expandedRows: { [id: number]: boolean } = {};

  onEditClick(po: any) {
    this.onEdit.emit(po);
  }

  onDeleteRequested(po: any) {
    this.onDelete.emit(po);
  }

  emitAddRequest() {
    this.onAdd.emit();
  }
}
