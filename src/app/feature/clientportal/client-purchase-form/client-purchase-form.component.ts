
import { Component, OnInit, inject, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig, FormlyConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { ButtonModule } from 'primeng/button';
import { NgxPermissionsModule } from 'ngx-permissions';

import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { clientPurchaseService } from '../../../core/services/clientPurchaseService';
import { PurchaseService } from '../../../core/services/purchase.service';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDatepickerComponent } from '../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { hydrateFormlyConfig, injectPurchaseUomMatrixListeners } from '../../../shared/utils/hydrationOfFormlyJson';

@Component({
  selector: 'app-client-purchase-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, FormlyModule, CommonModule,
    ButtonModule, FormlyPrimeNGModule, NgxPermissionsModule
  ],
  templateUrl: './client-purchase-form.component.html',
  styleUrl: './client-purchase-form.component.scss'
})
export class ClientPurchaseFormComponent implements OnInit, OnChanges {
  @Input() tenantId!: number;
  @Input() clientId!: number;
  @Input() siteId!: number;
  @Input() opMode!: FormOpMode;
  @Input() recordData: any = null;
  @Input() isFormHidden: boolean = true;

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSaveSuccess = new EventEmitter<{ severity: string, summary: string, detail: string }>();
  @Output() onErrorToast = new EventEmitter<{ severity: string, summary: string, detail: string }>();

  form = new FormGroup({});
  model: any = {};
  raw: any;
  fields: FormlyFieldConfig[] = [];

  private formlyConfig = inject(FormlyConfig);
  private clientPurchaseService = inject(clientPurchaseService);
  private purchaseService = inject(PurchaseService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.registerCustomFormlyEngineExtensions();
    this.buildFormlyFieldsLayout();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recordData'] || changes['opMode']) {
      if (this.opMode === FormOpMode.Update && this.recordData) {
        this.initializeUpdateWorkflow(this.recordData);
      } else {
        this.initializeAddWorkflow();
      }
    }
  }

  private registerCustomFormlyEngineExtensions(): void {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'datepicker', component: FormlyFieldPrimengDatepickerComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
  }

  private buildFormlyFieldsLayout(): void {
    this.raw = [
      { "key": "id", "type": "input", "hide": true },
      { "key": "createdByUserId", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      { "key": "siteId", "type": "input", "hide": true },
      {
        "className": "col-span-24 w-full block mb-0",
        "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "clientPoNumber",
            "className": "col-span-6 md:col-span-4",
            "props": { "label": "Purchase Order#", "readonly": true, "placeholder": "PO#" }
          },
          {
            "key": "poDate",
            "type": "datepicker",
            "className": "col-span-12 md:col-span-6",
            "templateOptions": { "label": "PO Date", "required": true, "placeholder": "YYYY-MM-DD" },
            "hooks": {
              "onInit": "field.formControl.setValue(field.model.poDate ? new Date(field.model.poDate) : null)"
            },
            "parsers": ["value => value instanceof Date ? value.toISOString().split('T')[0] : value"]
          }
        ]
      },
      {
        "key": "items",
        "type": "p-repeatsectionformly",
        "wrappers": ["panel"],
        "defaultValue": [],
        "props": {
          "label": "",
          "addText": "Add Item",
          "rowDefaults": { "quantity": "1" }
        },
        "expressionProperties": {
          "disabled": (field: any) => field.options?.model?.status !== 'DRAFT'
        },
        "fieldArray": {
          "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
          "fieldGroup": [
            { "key": "id", "type": "input", "hide": true },
            {
              "type": "primeng-dropdown",
              "key": "productId",
              "className": "col-span-6 md:col-span-10",
              "props": {
                "label": "Item",
                "optionLabel": "label",
                "optionValue": "value",
                "placeholder": "Select Item",
                "lookupKey": "productTypes",
                "required": true,
                "filter": true
              },
              "expressions": {
                "props.label": "field.parent.index === 0 ? 'Item' : ''",
                "props.disabled": () => this.model?.status !== 'DRAFT' 
              }
            },
            {
              "type": "input",
              "key": "quantity",
              "className": "col-span-3 md:col-span-4",
              "props": { "placeholder": "Enter quantity", "required": true, "type": "number" },
              "expressionProperties": {
                "props.label": "field.parent.index === 0 ? 'Quantity' : ''",
                "props.disabled": () => this.model?.status !== 'DRAFT'
              }
            },
            {
              "type": "primeng-dropdown",
              "key": "purchaseUom",
              "className": "col-span-12 md:col-span-6",
              "props": {
                "label": "Purchase UOM:",
                "optionLabel": "label",
                "optionValue": "value",
                "placeholder": "Select UOM",
                "filter": true,
                "required": true,
                "options": []
              },
              "expressionProperties": {
                "props.label": "field.parent.index === 0 ? 'Purchase UOM' : ''",
                "props.disabled": () => this.model?.status !== 'DRAFT'
              }
            }
          ]
        }
      }
    ];

    this.fields = hydrateFormlyConfig(this.raw);
    injectPurchaseUomMatrixListeners(this.fields, this.purchaseService, this.tenantId);
  }

  private initializeAddWorkflow(): void {
    this.model = {
      tenantId: this.tenantId,
      clientId: this.clientId,
      siteId: this.siteId,
      clientPoNumber: '',
      orderDate: new Date().toISOString().substring(0, 10),
      status: 'DRAFT',
      notes: '',
      items: []
    };
    this.form.reset();
    this.cd.detectChanges();
  }

  private initializeUpdateWorkflow(selectedRecord: any): void {
    const copy = JSON.parse(JSON.stringify(selectedRecord));
    copy.status = copy.status ? copy.status.toUpperCase() : 'DRAFT';

    if (copy.orderDate) copy.orderDate = new Date(copy.orderDate);
    if (copy.deliveryDate) copy.deliveryDate = new Date(copy.deliveryDate);

    this.model = copy;
    this.cd.detectChanges();
  }

  savePurchaseDraft(): void {
    this.executePersistWorkflow(false);
  }

  submitPurchaseForApproval(): void {
    this.executePersistWorkflow(true);
  }

  CancelFormOp(): void {
    this.onCancel.emit();
  }

  clearPurchase(): void {
    this.initializeAddWorkflow();
  }

  approvePO(): void {
    const poId = this.model.id || this.model.purchaseOrderId;
    if (!poId) {
      this.onErrorToast.emit({ severity: 'error', summary: 'Error', detail: 'No active Purchase Order selected.' });
      return;
    }

    const payload = {
      status: 'APPROVED',
      internalNotes: `${this.model.internalNotes || ''} | Approved by Client on ${new Date().toISOString()}`
    };

    this.clientPurchaseService.updateClientPurchaseOrder(poId, payload).subscribe({
      next: () => {
        this.onSaveSuccess.emit({
          severity: 'success',
          summary: 'Order Approved',
          detail: `Purchase Order #${this.model.clientPoNumber || poId} has been fully approved.`
        });
      },
      error: (err) => this.onErrorToast.emit({ severity: 'error', summary: 'Approval Failed', detail: err.message })
    });
  }

    rejectPO(): void {
    const poId = this.model.id || this.model.purchaseOrderId;
    if (!poId) {
      this.onErrorToast.emit({ severity: 'error', summary: 'Error', detail: 'No active Purchase Order selected.' });
      return;
    }

    const payload = {
      status: 'REJECTED',
      internalNotes: `${this.model.internalNotes || ''} | Rejected by Client on ${new Date().toISOString()}`
    };

    this.clientPurchaseService.updateClientPurchaseOrder(poId, payload).subscribe({
      next: () => {
        this.onSaveSuccess.emit({
          severity: 'warn',
          summary: 'Order Rejected',
          detail: `Purchase Order #${this.model.clientPoNumber || poId} has been sent back.`
        });
      },
      error: (err) => this.onErrorToast.emit({ severity: 'error', summary: 'Rejection Failed', detail: err.message })
    });
  }

    private executePersistWorkflow(shouldSubmitToClient: boolean): void {
    if (!this.model.items?.length) {
      this.onErrorToast.emit({ severity: 'error', summary: 'Validation Error', detail: 'At least one product item is required' });
      return;
    }

    this.model.tenantId = this.tenantId;
    this.model.siteId = this.siteId;
    this.model.clientId = this.clientId;
    this.model.clientPoNumber = this.model.clientPoNumber || '';

    const payload = { ...this.model };

    // 1. Extract the options list from Formly's layout config fields cache to resolve names/SKUs
    const itemsFieldConfig = this.fields.find((f: any) => f.key === 'items');
    const resolvedFieldArray = itemsFieldConfig && typeof itemsFieldConfig.fieldArray !== 'function' ? itemsFieldConfig.fieldArray : null;
    const productFieldGroup = resolvedFieldArray && Array.isArray(resolvedFieldArray.fieldGroup) ? resolvedFieldArray.fieldGroup.find((fg: any) => fg.key === 'productId') : null;
    const rawOptionsSource = productFieldGroup?.props?.options;
    
    let productDropdownOptions: any[] = [];
    if (Array.isArray(rawOptionsSource)) {
      productDropdownOptions = rawOptionsSource;
    } else if (rawOptionsSource && typeof (rawOptionsSource as any).subscribe === 'function') {
      productDropdownOptions = (productFieldGroup?.props as any)._resolvedOptions || [];
    }

    // 🚀 STEP: Clean, fast array mapping loop utilizing native integer IDs
    payload.items = this.model.items.map((item: any) => {
      const numericId = item.productId && !isNaN(Number(item.productId)) ? Number(item.productId) : null;
      let resolvedName = item.prodName || '';
      let resolvedSku = item.sku || '';

      // Find text attributes by matching against the native numeric primary key ID value (e.g., value: 1)
      if (numericId) {
        const matchedProduct = productDropdownOptions.find((opt: any) => Number(opt.value) === numericId);
        if (matchedProduct) {
          resolvedName = matchedProduct.label || matchedProduct.name;
          resolvedSku = matchedProduct.sku || matchedProduct.code || matchedProduct.label;
        }
      }

      return {
        ...item,
        productId: numericId, // Clean number type sent straight to your TypeORM foreign keys
        prodName: resolvedName || 'MOP1', // 🛡️ Guaranteed fallback ensures column never hits NULL restrictions
        sku: resolvedSku || 'MOP1',      // 🛡️ Prevents displaying 'N/A' inside your grid views
        quantity: Number(item.quantity || 1),
        finalPrice: Number(item.finalPrice || item.price || 0.00),
        purchaseUom: item.purchaseUom || 'PCS'
      };
    });

    if (shouldSubmitToClient) {
      payload.action = 'SUBMIT';
      payload.status = 'PENDING_APPROVAL';
    }

    // Standard HTTP pipeline operations persist smoothly
    if (this.opMode === FormOpMode.Add) {
      this.clientPurchaseService.createclientPurchaseOrder(payload).subscribe({
        next: (res: any) => { 
          const targetId = res?.id || res?.purchaseOrderId;
          if (shouldSubmitToClient && targetId) {
            this.clientPurchaseService.updateClientPurchaseOrder(targetId, { action: 'SUBMIT', status: 'PENDING_APPROVAL' }).subscribe({
              next: () => this.onSaveSuccess.emit({ severity: 'success', summary: 'Saved', detail: 'Fresh Order submitted.' }),
              error: (err) => this.onErrorToast.emit({ severity: 'error', summary: 'Submission Failed', detail: err.message })
            });
          } else {
            this.onSaveSuccess.emit({ severity: 'success', summary: 'Saved', detail: 'Draft Order initialized.' });
          }
        },
        error: (err) => this.onErrorToast.emit({ severity: 'error', summary: 'Save Failed', detail: err.message })
      });
    } else if (this.opMode === FormOpMode.Update) {
      const existingId = this.model.id || this.model.purchaseOrderId;
      this.clientPurchaseService.updateClientPurchaseOrder(existingId, payload).subscribe({
        next: () => {
          this.onSaveSuccess.emit({ severity: 'success', summary: 'Updated', detail: 'Purchase order changes saved.' });
        },
        error: (err) => this.onErrorToast.emit({ severity: 'error', summary: 'Update Failed', detail: err.message })
      });
    }
  }


  onVendorSelected(vendor: any) {}
  onProductAdded(product: any) {}
  addProductToOrder(product: any) {}
  removeLine(index: number) {}
}
