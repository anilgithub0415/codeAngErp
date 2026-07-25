import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { clientPurchaseService } from '../../../core/services/clientPurchaseService';
import { clientPurchase } from '../../../core/models/clientPurchase.model';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-clientpurchaselist',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,TableModule,ButtonModule],
  templateUrl: './clientpurchaselist.component.html',
  styleUrl: './clientpurchaselist.component.scss'
})
export class ClientpurchaselistComponent implements OnInit {
  siteId!: number;
  clientId!: number;
  tenantId!: number;
clientPOs: clientPurchase[] | undefined = [];
expandedRows: { [id: number]: boolean } = {};
  currOpMode: FormOpMode = FormOpMode.View;
  private clientPurchaseService = inject(clientPurchaseService);


  ngOnInit(): void {
    this.currOpMode=FormOpMode.None;
     this.getPOList();
  }

  getPOList() {
    this.clientPurchaseService.getClientPOs(this.tenantId, this.siteId).subscribe(clientpos => {
      this.clientPOs = clientpos;
    });
  }
  onEditClick(selectedRecord:any){

  }
}
