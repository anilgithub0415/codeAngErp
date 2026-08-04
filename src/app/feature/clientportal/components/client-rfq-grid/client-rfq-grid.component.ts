import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { NgxPermissionsModule } from 'ngx-permissions';
import { clientRFQ } from '../../../../core/models/clientRFQ.model';

@Component({
  selector: 'app-client-rfq-grid',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, OverlayPanelModule, NgxPermissionsModule],
  templateUrl: './client-rfq-grid.component.html',
  styleUrl: './client-rfq-grid.component.scss'
})
export class ClientRFQGridComponent {
  @Input() clientRFQs: clientRFQ[] | undefined = [];
  
  @Output() addRequested = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<any>();
  @Output() deleteRequested = new EventEmitter<any>();
 @Output() convertRequested = new EventEmitter<clientRFQ>();

  expandedRows: { [id: number]: boolean } = {};

   onConvertClick(rfq: clientRFQ): void {
    console.log('m in grid emiting convertRequested.........................');
    
    this.convertRequested.emit(rfq);
  }

}
