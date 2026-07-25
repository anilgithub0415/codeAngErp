import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig, FormlyConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';

import { clientPurchase } from '../../../../core/models/clientPurchase.model';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../../core/services/auth.service';
import { clientPurchaseService } from '../../../../core/services/clientPurchaseService';
import { PurchaseService } from '../../../../core/services/purchase.service';
import { FormlyCardWrapperComponent } from '../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';

import { FormlyFieldPrimengDatepickerComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { hydrateFormlyConfig, injectPurchaseUomMatrixListeners } from '../../../../shared/utils/hydrationOfFormlyJson';
import { NgxPermissionsModule } from 'ngx-permissions';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
@Component({
  selector: 'app-internal-pos',
  imports: [
    ReactiveFormsModule, FormsModule, FormlyModule, CommonModule,
    TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule,
    DatePickerModule, FormlyPrimeNGModule, NgxPermissionsModule
  ],
  providers: [MessageService],
  templateUrl: './internal-pos.component.html',
  styleUrl: './internal-pos.component.scss'
})
export class InternalPOsComponent implements OnInit {
  siteId!: number;
  clientId!: number;
  tenantId!: number;
  clientPOs: clientPurchase[] | undefined = [];
  expandedRows: { [id: number]: boolean } = {};
  currOpMode: FormOpMode = FormOpMode.View;
  isFormHidden: boolean = true;
  form = new FormGroup({});
  
 model: any = {
  tenantId: 0, 
  clientId: 0, 
  siteId: 0,
  clientPoNumber: '', 
  vendorId: null, 
  vendor: null,
  orderDate: new Date(), // FIX: Keep it as a real Date object, not a string
  deliveryDate: null, 
  status: 'DRAFT', 
  notes: '',
  items: [{ productId: 0,prodName:"", quantity: 0, purchaseUom: '' }]
};


  raw: any;
  fields: FormlyFieldConfig[] = [];

  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private clientPurchaseService = inject(clientPurchaseService);
  private purchaseService = inject(PurchaseService);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.siteId = this.authServ.getSiteId()!;
    this.clientId = this.authServ.getClientId()!;
    this.tenantId = this.authServ.getTenantId()!;

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'datepicker', component: FormlyFieldPrimengDatepickerComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });

    this.buildFormlyFieldsLayout();
    this.getPOList();
  }

  buildFormlyFieldsLayout() {
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
            "props": {
              "label": "Purchase Order#",
              "readonly": true,
              "placeholder": "PO#"
            }
          },
//           { 
//             "type": "datepicker",
//             "key": "orderDate",
//             "className": "col-span-12 md:col-span-6",
//             "props": {
//               "label": "Order Date",
//               "dateFormat": "dd-mm-yy",
//               "numberOfMonths": 1,
//               "selectionMode": "single",
//               "required": true,
//             }
            
//             ,"expressionProperties": {
//   // Use field.options.model to ensure it targets the global parent document state
//   "disabled": (field: any) => field.options?.model?.status !== 'DRAFT'
// }

//           }

{
    "key": "poDate",
    "type": "datepicker",
     "className": "col-span-12 md:col-span-6",
    "templateOptions": {
      "label": "PO Date",
      "required": true,
      "placeholder": "YYYY-MM-DD"
    },
    "hooks": {
      "onInit": "field.formControl.setValue(field.model.poDate ? new Date(field.model.poDate) : null)"
    },
    "parsers": [
      "value => value instanceof Date ? value.toISOString().split('T')[0] : value"
    ]
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
  // Prevents adding/removing rows if the order is locked
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
                      },
    
            },
            {
              "type": "input",
              "key": "quantity",
              "className": "col-span-3 md:col-span-4",
              "props": {
                "placeholder": "Enter quantity",
                "required": true,
                "type": "number"
              },
               "expressionProperties": {
  "props.label": "field.parent.index === 0 ? 'Quantity' : ''",
  "props.disabled": () => this.model?.status !== 'DRAFT' // 🛡️ Directly binds to the component's state tracking parameter
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
  "props.disabled": () => this.model?.status !== 'DRAFT' // 🛡️ Directly binds to the component's state tracking parameter
}
            }
          ]
        }
      }
    ];

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated;
    injectPurchaseUomMatrixListeners(this.fields, this.purchaseService, this.tenantId);
  }

  getPOList() {
    this.clientPurchaseService.getClientPOs(this.tenantId, this.siteId).subscribe(clientpos => {
      this.clientPOs = clientpos;
    });
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add;
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
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
  }

    async onEditClick(selectedRecord: any) {
  this.isFormHidden = false;
  this.currOpMode = FormOpMode.Update;
  
  // 🛡️ Create deep copy safely
  const copy = JSON.parse(JSON.stringify(selectedRecord));
  
  // Force formatting to Uppercase to satisfy your HTML expressions string matching rules
  if (copy.status) {
    copy.status = copy.status.toUpperCase();
  } else {
    copy.status = 'DRAFT'; // Default fallback if field is missing from network row
  }

  // FIX: Explicitly convert the serialized string dates back into live Date objects
  if (copy.orderDate) {
    copy.orderDate = new Date(copy.orderDate);
  }
  if (copy.deliveryDate) {
    copy.deliveryDate = new Date(copy.deliveryDate);
  }

  this.model = copy;
  console.log('Normalized edit record target:', this.model);
}


  // 💾 Action 1: Save as Draft (keeps form editable)
  savePurchaseDraft() {
    this.executePersistWorkflow(false);
  }

  // 🚀 Action 2: Submit to Head Office (locks document)
  submitPurchaseForApproval() {
    this.executePersistWorkflow(true);
  }

  //Client Approving sitePurchase
  approvePO() {
    const poId = this.model.id || this.model.purchaseOrderId;
    if (!poId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No active Purchase Order selected.' });
      return;
    }

    // Build payload to send workflow state alteration to backend
    const payload = {
      status: 'APPROVED',
      internalNotes: `${this.model.internalNotes || ''} | Approved by Client on ${new Date().toISOString()}`
    };

    this.clientPurchaseService.updateClientPurchaseOrder(poId, payload).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Order Approved', 
          detail: `Purchase Order #${this.model.clientPoNumber || poId} has been fully approved.` 
        });
        this.finalizeSaveSuccess(); // Refresh table listing and hide form panels
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Approval Failed', detail: err.message });
      }
    });
  }

  // ❌ Client Rejecting sitePurchase
  rejectPO() {
    const poId = this.model.id || this.model.purchaseOrderId;
    if (!poId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No active Purchase Order selected.' });
      return;
    }

    // Build payload to send workflow state alteration to backend
    const payload = {
      status: 'REJECTED',
      internalNotes: `${this.model.internalNotes || ''} | Rejected by Client on ${new Date().toISOString()}`
    };

    this.clientPurchaseService.updateClientPurchaseOrder(poId, payload).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Order Rejected', 
          detail: `Purchase Order #${this.model.clientPoNumber || poId} has been sent back.` 
        });
        this.finalizeSaveSuccess(); // Refresh table listing and hide form panels
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Rejection Failed', detail: err.message });
      }
    });
  }
  
  private executePersistWorkflow(shouldSubmitToClient: boolean) {
    
    
    if (!this.model.items?.length) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'At least one product item is required' });
      return;
    }

    // Bind parameters securely
    this.model.tenantId = this.tenantId;
    this.model.siteId = this.siteId;
    this.model.clientId = this.clientId;
    
    // 💡 Workaround placeholder mapping for backend DTO structural validations
    this.model.clientPoNumber = this.model.clientPoNumber || '';

    // Handle structural state mutations before routing payload down
    const payload = { ...this.model };
    if (shouldSubmitToClient) {
      payload.action = 'SUBMIT';
      payload.status = 'PENDING_APPROVAL';
    }
    if (this.currOpMode === FormOpMode.Add) {
      this.clientPurchaseService.createclientPurchaseOrder(payload).subscribe({
        next: (res: any) => { 
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Draft Order initialized.' });
          const targetId = res?.id || res?.purchaseOrderId || (res as any).id;

          if (shouldSubmitToClient) {
            if (!targetId) {
              console.error('[CPO Sync Error] Backend response payload does not contain an ID tracker:', res);
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
      // 🚀 FIX: Direct update pipeline for existing records
      const existingId = this.model.id || this.model.purchaseOrderId;
      
      this.clientPurchaseService.updateClientPurchaseOrder(existingId, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Purchase order changes saved and submitted.' });
          this.finalizeSaveSuccess();
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err.message })
      });
    }



}

  private finalizeSaveSuccess() {
    this.getPOList();
    this.CancelFormOp();
  }

  // Stubs left intact to prevent template layout breakages
  onVendorSelected(vendor: any) {}
  onProductAdded(product: any) {}
  addProductToOrder(product: any) {}
  removeLine(index: number) {}
  
  clearPurchase() { 
    this.model = {
      tenantId: this.tenantId,
      siteId: this.siteId,
      clientPoNumber: '',
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

