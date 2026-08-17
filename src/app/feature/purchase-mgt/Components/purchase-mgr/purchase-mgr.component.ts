
import { Component, OnInit, inject, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';

import { PurchaseService } from '../../../../core/services/purchase.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { PurchaseGridComponent } from '../purchase-grid/purchase-grid.component';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NgxPermissionsService } from 'ngx-permissions';
import { ChipsModule } from 'primeng/chips'; // Import the module
import { FormsModule } from '@angular/forms'; // Needed for ngModel
import { ListboxModule } from 'primeng/listbox'; // Import ListboxModule
import { IPurchaseOrderWorkflow } from '../../../../core/models/purchase.model';

@Component({
  selector: 'app-purchase-mgr',
  standalone: true,
  imports: [CommonModule, ToastModule, PurchaseGridComponent, PurchaseFormComponent,ConfirmDialogModule,
    ChipsModule, FormsModule,ListboxModule
  ],
    templateUrl: './purchase-mgr.component.html',
    styleUrl: './purchase-mgr.component.scss',
      providers: [MessageService, ConfirmationService],
})
export class PurchaseMgrComponent implements OnInit {
  tenantId!: number;
  POs: any[] = [];
  expandedRows: { [id: number]: boolean } = {};
 
  activeModel: any = null;

  // Make enum accessible in the template
  FormOpMode = FormOpMode;

  currOpMode: FormOpMode = FormOpMode.View;
  workflow?: IPurchaseOrderWorkflow;
  private purchaseService = inject(PurchaseService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cd = inject(ChangeDetectorRef);
 
  //penind remove permision related code as it is added here for only check current permissions
  private permissionsService=inject(NgxPermissionsService)
currentUserPermissions: string[] = [];

xyz!:any;

  ngOnInit(): void { this.xyz=this.authServ.getUserRole();
    this.tenantId = this.authServ.getTenantId()!;
    this.getPOList();

    //pending: Remove permision related code as it is added here for only check current permissions
    const permissionsObj = this.permissionsService.getPermissions();
    // Extract the permission names into an array
    this.currentUserPermissions = Object.keys(permissionsObj);

  }

  getPOList(): void {
    this.purchaseService.getPOs(this.tenantId).subscribe({
      next: (pos) => {
        this.POs = pos || [];
        this.cd.detectChanges();
      },
      error: (err) => this.showToast('error', 'Error', err.message || 'Failed to load PO lines.')
    });
  }

  handleAdd(): void {
    this.currOpMode = FormOpMode.Add;
   // localStorage.setItem('currOpMode', this.currOpMode);
localStorage.setItem('currOpMode', String(FormOpMode.Add));

    this.activeModel = {
      id: 0,
      tenantId: this.tenantId,
      poNumber: '',
      vendorId: null,
      vendor: null,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: null,
      status: 'DRAFT',
      totalAmount: 0,
      notes: '',
      items: []
    };
    this.cd.detectChanges();
  }

  async handleEdit(selectedRecord: any): Promise<void> {

  this.currOpMode =
    FormOpMode.Update;

  localStorage.setItem(
    'currOpMode',
    this.currOpMode
  );

  const clonedRecord =
    JSON.parse(
      JSON.stringify(selectedRecord)
    );

  this.activeModel = {
    ...clonedRecord,
    items: clonedRecord.items || []
  };

  await this.loadWorkflow();

  this.cd.detectChanges();
}
  
  async loadWorkflow(): Promise<void> {

  console.log(
    '....load Purchase Order workflow.........................'
  );

  console.log(
    'this.activeModel?.id:',
    this.activeModel?.id
  );

  if (!this.activeModel?.id) {

    this.workflow =
      undefined;

    return;
  }

  this.workflow =
    await firstValueFrom(
      this.purchaseService.getWorkflow(
        this.activeModel.id
      )
    );

  console.log(
    'Loaded Purchase Order workflow:',
    this.workflow
  );
}

  async handleSave(submissionPayload: any): Promise<void> {
    try {
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        await firstValueFrom(
          this.purchaseService.updatePurchaseOrder(submissionPayload.id, submissionPayload)
        );
        this.showToast('success', 'Updated', 'Purchase order updated successfully');
      } else {
        await firstValueFrom(
          this.purchaseService.createPurchaseOrder(submissionPayload)
        );
        this.showToast('success', 'Saved', 'New purchase order generated successfully.');
      }

      this.currOpMode = FormOpMode.View;
      this.getPOList();
    } catch (error: any) {
      this.showToast('error', 'Error', error.message || 'Failed to preserve procurement records.');
    }
  }

  
  async handleFinalize(submissionPayload: any): Promise<void> {
  try {
    let targetId = submissionPayload.id;

    // 1. Save outstanding draft modifications first
    if (this.currOpMode === FormOpMode.Update && targetId) {
      await firstValueFrom(
        this.purchaseService.updatePurchaseOrder(targetId, submissionPayload)
      );
    } else if (!targetId) {
      const freshPo = await firstValueFrom(
        this.purchaseService.createPurchaseOrder(submissionPayload)
      );
      targetId = freshPo.id; 
    }

    // 2. Change status from DRAFT to the approval state
    await firstValueFrom(
      this.purchaseService.submitToApprovalWorkflow(targetId)
    );

    this.showToast('success', 'Submitted', 'Purchase order has been submitted for approval.');
    this.currOpMode = FormOpMode.View;
    this.getPOList();
  } catch (error: any) {
    this.showToast('error', 'Submission Failed', error.message || 'Could not process approval request.');
  }
}

async handleApprove(poId: number): Promise<void> {
  try {
    await firstValueFrom(
      this.purchaseService.approvePurchaseOrder(poId)
    );

    this.showToast('success', 'Approved', 'Purchase order verified and inventory stock balances updated.');
    this.currOpMode = FormOpMode.View;
    this.getPOList(); // Refresh data list
  } catch (error: any) {
    this.showToast('error', 'Approval Failed', error.message || 'Could not complete the approval pipeline.');
  }
}


async handleSend(poId: number): Promise<void> {
  try {
    await firstValueFrom(
      this.purchaseService.sendPurchaseOrder(poId)
    );

    this.showToast('success', 'Sent', 'Purchase order sent to Supplier');
    this.currOpMode = FormOpMode.View;
    this.getPOList(); // Refresh data list
  } catch (error: any) {
    this.showToast('error', 'Sending Failed', error.message || 'Could not complete the send pipeline.');
  }
}



  handleCancel(): void {
    this.currOpMode = FormOpMode.View;
    this.activeModel = null;
    this.cd.detectChanges();
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }



  onDeleteRequested(po: any) { console.log('trying to deelete SO.........',po.id);
  
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${po.id}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.purchaseService.deletePurchaseOrder(po.id).subscribe({
          next: () => {
            this.POs = this.POs!.filter(s => s.id !== po.id);
           // this.visibleDataArray = this.visibleDataArray.filter(p => p.id !== so.id);
            
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Sales Order successfully removed.' });
            this.cd.detectChanges();
          },
          error: (err:any) => {
            if (err.status === 409 || err.message?.includes('DB_DEPENDENCY_RESTRICTION_ERROR')) {
              const warningMessage = err.error?.message || 'Cannot delete. Related records exist.';
              this.messageService.add({ severity: 'warn', summary: 'Deletion Blocked', detail: warningMessage, life: 6000 });
            } else {
              this.messageService.add({ severity: 'error', summary: 'System Error', detail: 'Database engine transmission error.' });
            }
          }
        });
      }
    });
  }
}
