import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { clientPurchase } from '../../../../core/models/clientPurchase.model';
import { AuthService } from '../../../../core/services/auth.service';
import { clientPurchaseService } from '../../../../core/services/clientPurchaseService';

import { ClientPurchaseFormComponent } from '../client-purchase-form/client-purchase-form.component';
import { ClientPurchaseGridComponent } from '../client-purchase-grid/client-purchase-grid.component';

@Component({
  selector: 'app-client-purchase-mgr',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    ClientPurchaseFormComponent,
    ClientPurchaseGridComponent
  ],
  providers: [MessageService],
  templateUrl: './client-purchase-mgr.component.html',
  styleUrl: './client-purchase-mgr.component.scss'
})
export class ClientPurchaseMgrComponent implements OnInit {
  siteId!: number;
  clientId!: number;
  tenantId!: number;
  clientPOs: clientPurchase[] | undefined = [];
  currOpMode: FormOpMode = FormOpMode.View;
  isFormHidden: boolean = true;
  selectedRecord: any = null;

  private authServ = inject(AuthService);
  private clientPurchaseService = inject(clientPurchaseService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.siteId = this.authServ.getSiteId()!;
    this.clientId = this.authServ.getClientId()!;
    this.tenantId = this.authServ.getTenantId()!;
    this.getPOList();
  }

   getPOList(): void {
    // Pass tenantId, siteId, and the optional clientId parameter 
    // Secure logic: If a Client logs in, this.clientId holds their reference. If a Site Supervisor logs in, it defaults to null/undefined or 0.
    const searchClientId = this.clientId ? this.clientId : undefined;

    console.log('tid:', this.tenantId,' clid:',searchClientId,' siteid:',this.siteId);
    

    this.clientPurchaseService.getClientPOs(this.tenantId, this.siteId, searchClientId).subscribe({
      next: (clientpos) => {
        this.clientPOs = clientpos;
        this.cd.detectChanges();
      },
      error: (err) => this.showToast('error', 'Fetch Failure', err.message)
    });
  }


  onAddTriggered(): void {
    this.isFormHidden = false;
    this.selectedRecord = null;
    this.currOpMode = FormOpMode.Add;
    this.cd.detectChanges();
  }

  onEditTriggered(selectedRecord: any): void {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update;
    this.selectedRecord = selectedRecord;
    this.cd.detectChanges();
  }

  onOperationCancelled(): void {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
    this.selectedRecord = null;
    this.cd.detectChanges();
  }

  onOperationSaved(msg: { severity: string, summary: string, detail: string }): void {
    this.showToast(msg.severity, msg.summary, msg.detail);
    this.getPOList();
    this.onOperationCancelled();
  }

  showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
