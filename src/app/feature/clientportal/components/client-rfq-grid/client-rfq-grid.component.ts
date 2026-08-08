import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
export class ClientRFQGridComponent implements OnInit{
  @Input() clientRFQs: clientRFQ[] | undefined = [];
  @Input() isWholesalerView!:boolean; 

  @Output() addRequested = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<any>();
  @Output() deleteRequested = new EventEmitter<any>();
 @Output() convertRequested = new EventEmitter<clientRFQ>();

  expandedRows: { [id: number]: boolean } = {};

  ngOnInit() {
    console.log("Grid Loaded");
}
testClick(rfq:clientRFQ) {
    alert("Clicked");

    this.convertRequested.emit(rfq);
}

   onConvertClick(rfq: clientRFQ): void {
      alert("onconvert Clicked");
    console.log('m in grid emiting convertRequested.........................rfq:',rfq);
    
    this.convertRequested.emit(rfq);
  }

}
