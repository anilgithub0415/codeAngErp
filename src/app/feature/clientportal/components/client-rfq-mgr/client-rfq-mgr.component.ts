import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig, FormlyConfig } from '@ngx-formly/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { clientPurchase } from '../../../../core/models/clientPurchase.model';
import { clientRFQ } from '../../../../core/models/clientRFQ.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PurchaseService, TenantRulesMatrixResponse } from '../../../../core/services/purchase.service';
import { ClientRFQService } from '../../../../core/services/client-rfq.service';
import { FormService } from '../../../../core/services/form.service';
import { ProductService } from '../../../../core/services/product.service';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';

import { FormlyCardWrapperComponent } from '../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDatepickerComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { bindDatabaseHooks, hydrateFormlyConfig } from '../../../../shared/utils/hydrationOfFormlyJson';

import { ClientRFQGridComponent } from '../client-rfq-grid/client-rfq-grid.component';
import { ClientRFQFormComponent } from '../client-rfq-form/client-rfq-form.component';
import { RfqConversionService } from '../../../../core/services/rfq-conversion.service';

@Component({
  selector: 'app-client-rfq-mgr',
  standalone: true,
  imports: [
    CommonModule, ToastModule, ConfirmDialogModule, 
    ClientRFQGridComponent, ClientRFQFormComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './client-rfq-mgr.component.html',
  styleUrl: './client-rfq-mgr.component.scss'
})
export class ClientRFQMgrComponent implements OnInit {
  @Input() isWholesalerView: boolean = false;
  @Input() allowedStatuses: string[] = []; 

  siteId!: number;
  clientId!: number;
  tenantId!: number;
  clientPOs: clientPurchase[] | undefined = [];
  clientRFQs: clientRFQ[] | undefined = [];
  currOpMode: FormOpMode = FormOpMode.View;
  form = new FormGroup({});
  
  model: any = {
    tenantId: 0, 
    clientId: 0, 
    siteId: 0,
    clientRFQNumber: '', 
    vendorId: null, 
    vendor: null,
    orderDate: new Date(), 
    deliveryDate: null, 
    status: 'DRAFT', 
    notes: '',
    items: [{ productId: 0, prodName: "", quantity: 0, purchaseUom: '' }]
  };

  raw: any;
  fields: FormlyFieldConfig[] = [];
  aForm!: any;

  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private clientRFQService = inject(ClientRFQService);
 private conversionService=inject(RfqConversionService);
  private purchaseService = inject(PurchaseService);
  private messageService = inject(MessageService);
  private formService = inject(FormService);
  private productService = inject(ProductService);
  private confirmationService = inject(ConfirmationService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.siteId = this.authServ.getSiteId()!;
    this.clientId = this.authServ.getClientId()!;
    this.tenantId = this.authServ.getTenantId()!;

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'datepicker', component: FormlyFieldPrimengDatepickerComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });

    this.getForm_ClientRFQ();
    this.getRFQList();
  }

   onConvertToQuotationClick(rfq: clientRFQ): void {
    console.log('m in clientrfqmgr for conversion triggering');
    
  // Broadcaster patterns emit the data payload up to the app environment
  this.conversionService.triggerConversion(rfq);
  }

  getForm_ClientRFQ() {
    this.formService.getForm(this.tenantId!, 'clientrfq_form').subscribe(aform => {
      this.aForm = aform;
      this.raw = JSON.parse(this.aForm.FormlyConfig);
      this.compileAndHydrateFields();
    });
  }

  private compileAndHydrateFields(): void {
    this.fields = hydrateFormlyConfig(this.raw);
    bindDatabaseHooks(this.productService, this.tenantId, this.fields);
    this.initializeFormBlueprint();
  }

  private initializeFormBlueprint(): void {
    this.fields = hydrateFormlyConfig(this.raw);
    const itemsSection = this.fields.find(f => f.key === 'items');

    if (itemsSection && itemsSection.fieldArray && typeof itemsSection.fieldArray === 'object') {
      const groupFields = itemsSection.fieldArray.fieldGroup || [];
      const uomField = groupFields.find(f => f.key === 'purchaseUom');

      if (uomField) {
        uomField.hooks = {
          onInit: (field: FormlyFieldConfig) => {
            const parentGroup = field.parent;
            if (!parentGroup) return;

            const rowProductField = parentGroup.fieldGroup?.find(f => f.key === 'productId');
            const currentProductId = parentGroup.model?.productId;
            const currentVariantId = parentGroup.model?.productVariantId || 0;

            if (currentProductId) {
              this.purchaseService.fetchTenantRulesMatrix(this.tenantId, currentProductId, currentVariantId)
                .subscribe({
                  next: (matrix: TenantRulesMatrixResponse) => {
                    if (field.props && matrix?.availablePurchaseUnits) {
                      field.props.options = matrix.availablePurchaseUnits;
                      this.cd.detectChanges();
                    }
                  }
                });
            }

            if (rowProductField && rowProductField.formControl) {
              const sub = rowProductField.formControl.valueChanges.subscribe((productId) => {
                if (!productId) {
                  if (field.props) field.props.options = [];
                  field.formControl?.setValue(null);
                  return;
                }

                const activeVariantId = parentGroup.model?.productVariantId || 0;
                this.purchaseService.fetchTenantRulesMatrix(this.tenantId, productId, activeVariantId)
                  .subscribe({
                    next: (matrix: TenantRulesMatrixResponse) => {
                      if (field.props && matrix?.availablePurchaseUnits) {
                        field.props.options = matrix.availablePurchaseUnits;
                        const currentUomValue = field.formControl?.value;
                        if (!matrix.availablePurchaseUnits.some(u => u.value === currentUomValue)) {
                          field.formControl?.setValue(null);
                        }
                        this.cd.detectChanges();
                      }
                    }
                  });
              });
              field.hooks!.onDestroy = () => sub.unsubscribe();
            }
          }
        };
      }
    }
  }

  getRFQList() {
    const statusFilter = this.isWholesalerView ? this.allowedStatuses : [];
    this.clientRFQService
      .getClientRFQs(this.tenantId, this.siteId, this.clientId, statusFilter)
      .subscribe(clientRfqs => {
        this.clientRFQs = clientRfqs; 
      });
  }


  // 2. Catch the bubbled output event from the inner grid and pipe it out to the app level
  onConvertRequested(rfq: clientRFQ): void { console.log('m in clientrfqmgr checking object rfq:',rfq);
  
    if (!rfq) return;
    
    // Broadcasts the payload. 
    // This moves the dashboard tab, maps data, and launches QuotationMgr's CREATE flow!
    this.conversionService.triggerConversion(rfq);
  }

  Add() {
    this.currOpMode = FormOpMode.Add;
    this.model = {
      tenantId: this.tenantId,
      clientId: this.clientId,
      siteId: this.siteId,
      clientRFQNumber: '',
      orderDate: new Date().toISOString().substring(0, 10),
      status: 'DRAFT',
      notes: '',
      items: []
    };
    this.form.reset();
  }

  onDeleteRequested(clpo: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${clpo.clientRFQNumber || clpo.prodName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clientRFQService.deleteRFQOrder(clpo.id).subscribe({
          next: () => {
            this.clientRFQs = this.clientRFQs!.filter(s => s.id !== clpo.id);
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Client RFQ successfully removed.' });
            this.cd.detectChanges();
          },
          error: (err: any) => {
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

  CancelFormOp() {
    this.currOpMode = FormOpMode.View;
  }

  async onEditClick(selectedRecord: any) {
    this.currOpMode = FormOpMode.Update;
    const copy = JSON.parse(JSON.stringify(selectedRecord));
    
    if (copy.status) {
      copy.status = copy.status.toUpperCase();
    } else {
      copy.status = 'DRAFT';
    }

    if (copy.orderDate) {
      copy.orderDate = new Date(copy.orderDate);
    }
    if (copy.deliveryDate) {
      copy.deliveryDate = new Date(copy.deliveryDate);
    }

    this.model = copy;
  }
  saveRFQDraft() {
    this.executePersistWorkflow(false);
  }

  submitRFQForApproval() {
    this.executePersistWorkflow(true);
  }

  approveRFQ() {
    const poId = this.model.id || this.model.purchaseOrderId;
    if (!poId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No active Purchase Order selected.' });
      return;
    }

    const itemsPayload = this.model.items ? this.model.items.map((item: any) => ({
      productId: item.productId || null,
      productVariantId: item.productVariantId || null,
      quantity: Number(item.quantity || 1),
      purchaseUom: item.purchaseUom || null
    })) : [];

    const payload = {
      action: 'APPROVE' as const,
      items: itemsPayload
    };

    this.clientRFQService.approveClientRFQOrder(poId, payload).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Order Approved', 
          detail: `Purchase Order #${this.model.clientRFQNumber || poId} has been successfully approved.` 
        });
        this.finalizeSaveSuccess();
      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Approval Blocked', 
          detail: err.error?.message || err.message || 'An error occurred during approval.' 
        });
      }
    });
  }

  sendRFQ() {
const poId = this.model.id || this.model.purchaseOrderId;
if (!poId) {
this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No active Purchase Order selected.' });
return;
} 

const itemsPayload = this.model.items ? this.model.items.map((item: any) => ({
productId: item.productId || null,
productVariantId: item.productVariantId || null,
quantity: Number(item.quantity || 1),
purchaseUom: item.purchaseUom || null
})) : []; 

const payload = {
action: 'SENT' as const,
items: itemsPayload
}; 

this.clientRFQService.sendClientRFQOrder(poId, payload).subscribe({
next: () => {
this.messageService.add({
severity: 'success',
summary: 'Order Sent',
detail: 'Purchase Order #${this.model.clientRFQNumber || poId} has been successfully dispatched to vendors.'
});
this.finalizeSaveSuccess();
},
error: (err:any) => {
this.messageService.add({
severity: 'error',
summary: 'Dispatch Blocked',
detail: err.error?.message || err.message || 'An error occurred while sending the RFQ.'
});
}
});
}

  rejectPO() {
    const poId = this.model.id || this.model.purchaseOrderId;
    if (!poId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No active Purchase Order selected.' });
      return;
    }

    const payload = {
      status: 'REJECTED',
      internalNotes: `${this.model.internalNotes || ''} | Rejected by Client on ${new Date().toISOString()}`
    };

    this.clientRFQService.updateClientRFQOrder(poId, payload).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Order Rejected', 
          detail: `Purchase Order #${this.model.clientRFQNumber || poId} has been sent back.` 
        });
        this.finalizeSaveSuccess();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Rejection Failed', detail: err.message });
      }
    });
  }
  
  private executePersistWorkflow(shouldSubmitToClient: boolean) {
    if (!this.model.items?.length) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'At least one product item is required' });
      return;
    }

    this.model.tenantId = this.tenantId;
    this.model.siteId = this.siteId;
    this.model.clientId = this.clientId;
    this.model.clientRFQNumber = this.model.clientRFQNumber || '';

    const payload = { ...this.model };
    if (shouldSubmitToClient) {
      payload.action = 'SUBMIT';
      payload.status = 'PENDING_APPROVAL';
    }

    if (this.currOpMode === FormOpMode.Add) {
      this.clientRFQService.createclientRFQOrder(payload).subscribe({
        next: (res: any) => { 
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Draft Order initialized.' });
          const targetId = res?.id || res?.purchaseOrderId;

          if (shouldSubmitToClient) {
            if (!targetId) {
              this.messageService.add({ severity: 'error', summary: 'Submission Interrupted', detail: 'Could not resolve internal reference ID.' });
              this.finalizeSaveSuccess();
              return;
            }

            this.clientRFQService.updateClientRFQOrder(targetId, { action: 'SUBMIT', status: 'PENDING_APPROVAL' }).subscribe({
              next: () => this.finalizeSaveSuccess(),
              error: (err) => this.messageService.add({ severity: 'error', summary: 'Submission Failed', detail: err.message })
            });
          } else {
            this.finalizeSaveSuccess();
          }
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: err.message })
      });

    } else if (this.currOpMode === FormOpMode.Update) {
      const existingId = this.model.id || this.model.purchaseOrderId;
      
      this.clientRFQService.updateClientRFQOrder(existingId, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Purchase order changes saved and submitted.' });
          this.finalizeSaveSuccess();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err.message });
        }
      });
    }
  }

  private finalizeSaveSuccess() {
    this.getRFQList();
    this.CancelFormOp();
  }

  clearRFQ() { 
    this.model = {
      tenantId: this.tenantId,
      siteId: this.siteId,
      clientRFQNumber: '',
      vendorId: null,
      vendor: null,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: null,
      status: 'DRAFT',
      notes: '',
      items: []
    };
    this.form.reset(); 
  }
}

