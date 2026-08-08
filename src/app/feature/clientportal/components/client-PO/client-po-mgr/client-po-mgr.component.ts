
import { Component, OnInit, inject, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormOpMode } from '../../../../../shared/enums/FormOpMode.enum';
import { clientPurchase } from '../../../../../core/models/clientPurchase.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { clientPurchaseService } from '../../../../../core/services/clientPurchaseService';
import { ClientPOGridComponent } from '../client-po-grid/client-po-grid.component';
import { ClientPOFormComponent } from '../client-po-form/client-po-form.component';

@Component({
  selector: 'app-client-po-mgr',
  standalone: true,
  imports: [CommonModule, ToastModule, ConfirmDialogModule, ClientPOGridComponent, ClientPOFormComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './client-po-mgr.component.html',
  styleUrl: './client-po-mgr.component.scss'
})
export class ClientPOMgrComponent implements OnInit {
   @Input() isWholesalerView: boolean = false;
   @Input() includeConverted = false; //for hiding already converted clientPOs
  @Input() allowedStatuses: string[] = []; 
  @Output() convertRequested = new EventEmitter<clientPurchase>();
  
  siteId!: number;
  clientId!: number;
  tenantId!: number;
  
  clientPOs: clientPurchase[] | undefined = [];
  currOpMode: FormOpMode = FormOpMode.View;
  isFormHidden: boolean = true;
  
  selectedModel: any = null;

  private authServ = inject(AuthService);
  private clientPurchaseService = inject(clientPurchaseService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.siteId = this.authServ.getSiteId()!;
    this.clientId = this.authServ.getClientId()!;
    this.tenantId = this.authServ.getTenantId()!;
    this.getPOList();
  }


  getPOList() {

    const statusFilter = this.isWholesalerView ? this.allowedStatuses : [];
    this.clientPurchaseService.getClientPOs(this.tenantId, this.siteId,0,statusFilter,this.includeConverted).subscribe(clientpos => {
      this.clientPOs = clientpos;
      this.cd.detectChanges();
    });
  }

  onAddRequested() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add;
    this.selectedModel = {
      tenantId: this.tenantId,
      clientId: this.clientId,
      siteId: this.siteId,
      clientPoNumber: '',
      orderDate: new Date(),
      status: 'DRAFT',
      notes: '',
      items: []
    };
  }

  onEditRequested(selectedRecord: any) {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update;
    
    const copy = JSON.parse(JSON.stringify(selectedRecord));
    copy.status = copy.status ? copy.status.toUpperCase() : 'DRAFT';

    if (copy.orderDate) copy.orderDate = new Date(copy.orderDate);
    if (copy.deliveryDate) copy.deliveryDate = new Date(copy.deliveryDate);

    this.selectedModel = copy;
  }

  onDeleteRequested(clpo: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${clpo.clientPoNumber || clpo.id}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clientPurchaseService.deletePurchaseOrder(clpo.id).subscribe({
          next: () => {
            this.clientPOs = this.clientPOs!.filter(s => s.id !== clpo.id);
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Client Purchase Order successfully removed.' });
            this.cd.detectChanges();
          },
          error: (err: any) => {
            if (err.status === 409 || err.message?.includes('DB_DEPENDENCY_RESTRICTION_ERROR')) {
              this.messageService.add({ severity: 'warn', summary: 'Deletion Blocked', detail: err.error?.message || 'Cannot delete. Related records exist.', life: 6000 });
            } else {
              this.messageService.add({ severity: 'error', summary: 'System Error', detail: 'Database engine transmission error.' });
            }
          }
        });
      }
    });
  }

  onSaveWorkflowRequested(event: { model: any, shouldSubmit: boolean }) {
    if (!event.model.items?.length) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'At least one product item is required' });
      return;
    }

    event.model.tenantId = this.tenantId;
    event.model.siteId = this.siteId;
    event.model.clientId = this.clientId;
    event.model.clientPoNumber = event.model.clientPoNumber || '';

    const payload = { ...event.model };
    if (event.shouldSubmit) {
      payload.action = 'SUBMIT';
      payload.status = 'PENDING_APPROVAL';
    }

    if (this.currOpMode === FormOpMode.Add) {
      this.clientPurchaseService.createclientPurchaseOrder(payload).subscribe({
        next: (res: any) => {
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Draft Order initialized.' });
          const targetId = res?.id || res?.purchaseOrderId;

          if (event.shouldSubmit) {
            if (!targetId) {
              this.messageService.add({ severity: 'error', summary: 'Submission Interrupted', detail: 'Could not resolve internal reference ID.' });
              this.finalizeSaveSuccess();
              return;
            }
            this.clientPurchaseService.updateClientPurchaseOrder(targetId, { action: 'SUBMIT', status: 'PENDING_APPROVAL' }).subscribe({
              next: () => this.finalizeSaveSuccess(),
              error: (err) => this.messageService.add({ severity: 'error', summary: 'Submission Failed', detail: err.message })
            });
          } else {
            this.finalizeSaveSuccess();
          }
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: err.message })
      });
    } else if (this.currOpMode === FormOpMode.Update) {
      const existingId = event.model.id || event.model.purchaseOrderId;
      this.clientPurchaseService.updateClientPurchaseOrder(existingId, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Purchase order changes saved.' });
          this.finalizeSaveSuccess();
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err.message })
      });
    }
  }

  onApproveWorkflowRequested(poId: number) {
    const itemsPayload = this.selectedModel.items ? this.selectedModel.items.map((item: any) => ({
      productId: item.productId || null,
      productVariantId: item.productVariantId || null,
      quantity: Number(item.quantity || 1),
      purchaseUom: item.purchaseUom || null
    })) : [];

    this.clientPurchaseService.approveClientPurchaseOrder(poId, { action: 'APPROVE', items: itemsPayload }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Order Approved', detail: 'Purchase Order successfully approved.' });
        this.finalizeSaveSuccess();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Approval Blocked', detail: err.error?.message || 'An error occurred during approval.' });
      }
    });
  }

  onSendWorkflowRequested(poId: number) {
const itemsPayload = this.selectedModel.items ? this.selectedModel.items.map((item: any) => ({
productId: item.productId || null,
productVariantId: item.productVariantId || null,
quantity: Number(item.quantity || 1),
purchaseUom: item.purchaseUom || null
})) : []; 

this.clientPurchaseService.sendClientPurchaseOrder(poId, { action: 'SENT', items: itemsPayload }).subscribe({
next: () => {
this.messageService.add({ severity: 'success', summary: 'Order Sent', detail: 'Purchase Order successfully dispatched.' });
this.finalizeSaveSuccess();
},
error: (err:any) => {
this.messageService.add({ severity: 'error', summary: 'Dispatch Blocked', detail: err.error?.message || 'An error occurred while sending the PO.' });
}
});
}

onConvertToSalesRequested(poId: number) {

    this.clientPurchaseService
        .convertClientPOToSalesOrder(poId)
        .subscribe({

            next: (result: any) => {

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Sales Order created successfully.'
                });

                this.finalizeSaveSuccess();

            },

            error: (err: any) => {
console.log( err);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Conversion Failed',
                    detail: err.error?.message || err.message
                });

            }

        });

}


  onRejectWorkflowRequested(poId: number) {
    const payload = {
      status: 'REJECTED',
      internalNotes: `${this.selectedModel.internalNotes || ''} | Rejected by Client on ${new Date().toISOString()}`
    };

    this.clientPurchaseService.updateClientPurchaseOrder(poId, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'warn', summary: 'Order Rejected', detail: 'Purchase Order has been sent back.' });
        this.finalizeSaveSuccess();
      },
      error: (err:any) => this.messageService.add({ severity: 'error', summary: 'Rejection Failed', detail: err.message })
    });
  }

  onCancelOperation() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
    this.selectedModel = null;
  }

  private finalizeSaveSuccess() {
    this.getPOList();
    this.onCancelOperation();
  }
}
