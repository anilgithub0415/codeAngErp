import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ClientOrderDashboardService } from '../../../../core/services/client-order-dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-client-order-management',
  imports: [CardModule], providers:[MessageService],
  templateUrl: './client-order-management.component.html',
  styleUrl: './client-order-management.component.scss'
})
export class ClientOrderManagementComponent implements OnInit{
summarydata!:any;

tenantId!:number;
purchaseCount = 4; // Backordered replenishment batches
    activeSalesOrders = 12; // Picking/Packing queue count
  private clientDashboardService=inject(ClientOrderDashboardService);

      private messageService = inject(MessageService);
  private cd=inject(ChangeDetectorRef)

    private authService=inject(AuthService);

  ngOnInit(){
         this.tenantId=this.authService.getTenantId()!;
         console.log('ngOnInit of clientorder');
         
    this.clientDashboardService.getClientSummaryCountOfOrders(this.tenantId).subscribe({
      next: (data:any) => {
        this.summarydata = data || []; console.log('.........................summary...........:',this.summarydata);
        console.log('POs Approved:',this.summarydata.clientPurchaseOrders.APPROVED);
         console.log('RFQs Approved:',this.summarydata.clientRFQs.APPROVED);
        
        this.cd.detectChanges();
      },
      error: (err:any) => this.showToast('error', 'Error', err.message || 'Failed to load PO lines.')
    }); 
}

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

}
