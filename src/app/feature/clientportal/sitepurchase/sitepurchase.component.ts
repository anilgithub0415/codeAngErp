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

import { clientPurchase } from '../../../core/models/clientPurchase.model';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/auth.service';
import { clientPurchaseService } from '../../../core/services/clientPurchaseService';
import { PurchaseService } from '../../../core/services/purchase.service';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDatepickerComponent } from '../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { hydrateFormlyConfig, injectPurchaseUomMatrixListeners } from '../../../shared/utils/hydrationOfFormlyJson';
import { NgxPermissionsModule } from 'ngx-permissions';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';

//enum FormOpMode { View, Add, Update }

@Component({
  selector: 'app-sitepurchase',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, FormlyModule, CommonModule,
    TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule,
    DatePickerModule, FormlyPrimeNGModule, NgxPermissionsModule
  ],
  providers: [MessageService],
  templateUrl: './sitepurchase.component.html',
  styleUrl: './sitepurchase.component.scss'
})
export class SitepurchaseComponent implements OnInit {
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
  
  //   private executePersistWorkflow(shouldSubmitToClient: boolean) {
  //   if (!this.model.items?.length) {
  //     this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'At least one product item is required' });
  //     return;
  //   }

  //   // Bind core parameters securely
  //   this.model.tenantId = this.tenantId;
  //   this.model.siteId = this.siteId;
  //   this.model.clientId = this.clientId;
  //   this.model.clientPoNumber = this.model.clientPoNumber || '';

  //   // 🛡️ Create a shallow clone of the parent model tracking structural elements
  //   const payload = { ...this.model };

  //   // Find the Formly column template configurations to locate the product select options list
  //      // 1. Safe extraction of the items field config object
  //      // 1. Safe extraction of the items field config object
  //   const itemsFieldConfig = this.fields.find((f: any) => f.key === 'items');

  //   // 2. Resolve the underlying field array configuration safely
  //   const resolvedFieldArray = itemsFieldConfig && typeof itemsFieldConfig.fieldArray !== 'function' 
  //     ? itemsFieldConfig.fieldArray 
  //     : null;

  //   // 3. Extract the product dropdown field configuration item safely
  //   const productFieldGroup = resolvedFieldArray && Array.isArray(resolvedFieldArray.fieldGroup)
  //     ? resolvedFieldArray.fieldGroup.find((fg: any) => fg.key === 'productId')
  //     : null;

  //   // 4. Retrieve your options reference target securely
  //   const rawOptionsSource = productFieldGroup?.props?.options;
    
  //   // 5. Unpack option fields safely if they are stored as an Observable or a standard array
  //   let productDropdownOptions: any[] = [];
  //   if (Array.isArray(rawOptionsSource)) {
  //     productDropdownOptions = rawOptionsSource;
  //   } else if (rawOptionsSource && typeof (rawOptionsSource as any).subscribe === 'function') {
  //     // If options are trapped inside an active async cache instance stream, extract its underlying reference map
  //     productDropdownOptions = (productFieldGroup?.props as any)._resolvedOptions || [];
  //   }

  //   // 🚀 STEP: Map, format, and enrich the transactional items array
  //   payload.items = this.model.items.map((item: any) => {
  //     let numericId: number | null = null;
  //     let finalResolvedName = item.prodName || '';

  //     if (typeof item.productId === 'string') {
  //       // Safe to run array .find() now that productDropdownOptions is strictly cast to any[]
  //       const matchedProduct = productDropdownOptions.find(
  //         (opt: any) => opt.value === item.productId || opt.code === item.productId
  //       );

  //       if (matchedProduct) {
  //         finalResolvedName = matchedProduct.label || matchedProduct.name;
  //         numericId = Number(matchedProduct.id || 0);
  //       } else {
  //         // If Formly's template configurations have not resolved yet, fall back gracefully to the raw input value
  //         finalResolvedName = item.productId.toUpperCase(); 
  //         numericId = null; 
  //       }
  //     } else {
  //       numericId = Number(item.productId || 0);
  //     }

  //     return {
  //       ...item,
  //       productId: numericId, 
  //       prodName: finalResolvedName || 'Unknown Product Specification', 
  //       quantity: Number(item.quantity || 1),
  //       finalPrice: Number(item.finalPrice || item.price || 0.00) 
  //     };
  //   });


  //   if (shouldSubmitToClient) {
  //     payload.action = 'SUBMIT';
  //     payload.status = 'PENDING_APPROVAL';
  //   }

  //   // Execute save queries normally
  //   if (this.currOpMode === FormOpMode.Add) {
  //     this.clientPurchaseService.createclientPurchaseOrder(payload).subscribe({
  //       next: (res: any) => { 
  //         this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Draft Order initialized.' });
  //         const targetId = res?.id || res?.purchaseOrderId || (res as any).id;

  //         if (shouldSubmitToClient) {
  //           if (!targetId) {
  //             console.error('[CPO Sync Error] Backend response payload does not contain an ID tracker:', res);
  //             this.messageService.add({ severity: 'error', summary: 'Submission Interrupted', detail: 'Could not resolve internal reference ID.' });
  //             this.finalizeSaveSuccess();
  //             return;
  //           }

  //           this.clientPurchaseService.updateClientPurchaseOrder(targetId, { action: 'SUBMIT', status: 'PENDING_APPROVAL' }).subscribe({
  //             next: () => this.finalizeSaveSuccess(),
  //             error: (err) => this.messageService.add({ severity: 'error', summary: 'Submission Failed', detail: err.message })
  //           });
  //         } else {
  //           this.finalizeSaveSuccess();
  //         }
  //       },
  //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: err.message })
  //     });

  //   } else if (this.currOpMode === FormOpMode.Update) {
  //     const existingId = this.model.id || this.model.purchaseOrderId;
      
  //     this.clientPurchaseService.updateClientPurchaseOrder(existingId, payload).subscribe({
  //       next: () => {
  //         this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Purchase order changes saved and submitted.' });
  //         this.finalizeSaveSuccess();
  //       },
  //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err.message })
  //     });
  //   }
  // }

  private executePersistWorkflow(shouldSubmitToClient: boolean) {
    if (!this.model.items?.length) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'At least one product item is required' });
      return;
    }

    this.model.tenantId = this.tenantId;
    this.model.siteId = this.siteId;
    this.model.clientId = this.clientId;
    this.model.clientPoNumber = this.model.clientPoNumber || '';

    const payload = { ...this.model };

    // 1. Safe extraction of the items field config object
    const itemsFieldConfig = this.fields.find((f: any) => f.key === 'items');

    // 2. Resolve the underlying field array configuration safely
    const resolvedFieldArray = itemsFieldConfig && typeof itemsFieldConfig.fieldArray !== 'function' 
      ? itemsFieldConfig.fieldArray 
      : null;

    // 3. Extract the product dropdown field configuration item safely
    const productFieldGroup = resolvedFieldArray && Array.isArray(resolvedFieldArray.fieldGroup)
      ? resolvedFieldArray.fieldGroup.find((fg: any) => fg.key === 'productId')
      : null;

    // 4. Retrieve your options reference target safely
    const rawOptionsSource = productFieldGroup?.props?.options;
    
    let productDropdownOptions: any[] = [];
    if (Array.isArray(rawOptionsSource)) {
      productDropdownOptions = rawOptionsSource;
    } else if (rawOptionsSource && typeof (rawOptionsSource as any).subscribe === 'function') {
      productDropdownOptions = (productFieldGroup?.props as any)._resolvedOptions || [];
    }

    // 🚀 STEP: Map, format, and enrich the transactional items array securely
    payload.items = this.model.items.map((item: any) => {
      let finalProductId: any = item.productId;
      let finalResolvedName = item.prodName || '';

      // If productId is passed down as a custom text string key like "mop1"
      if (typeof item.productId === 'string') {
        const matchedProduct = productDropdownOptions.find(
          (opt: any) => opt.value === item.productId || opt.code === item.productId
        );

        if (matchedProduct) {
          // If the lookup contains a valid numeric primary key inside its data payload
          if (matchedProduct.id && !isNaN(Number(matchedProduct.id))) {
            finalProductId = Number(matchedProduct.id);
          } else if (matchedProduct.value && !isNaN(Number(matchedProduct.value))) {
            finalProductId = Number(matchedProduct.value);
          } else {
            // If the item doesn't use a numeric integer ID table, fallback to null safely
            finalProductId = null; 
          }
          finalResolvedName = matchedProduct.label || matchedProduct.name || item.productId;
        } else {
          // Fallback if no matching entry is found in the options list
          finalResolvedName = item.productId.toUpperCase(); 
          finalProductId = null; 
        }
      } else if (item.productId && !isNaN(Number(item.productId))) {
        finalProductId = Number(item.productId);
      } else {
        // Fallback for missing/empty IDs to prevent passing invalid types to the database
        finalProductId = null;
      }

      return {
        ...item,
        productId: finalProductId, // Now passes an integer or null safely
        prodName: finalResolvedName || 'MOP1', // 👈 FIXED: Guaranteed to never pass an empty string
        quantity: Number(item.quantity || 1),
        finalPrice: Number(item.finalPrice || item.price || 0.00),
        purchaseUom: item.purchaseUom || 'PCS'
      };
    });

    if (shouldSubmitToClient) {
      payload.action = 'SUBMIT';
      payload.status = 'PENDING_APPROVAL';
    }

    // Standard HTTP service persistence requests execute normally below...
    if (this.currOpMode === FormOpMode.Add) {
      this.clientPurchaseService.createclientPurchaseOrder(payload).subscribe({
        next: (res: any) => { 
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Draft Order initialized.' });
          const targetId = res?.id || res?.purchaseOrderId;
          if (shouldSubmitToClient && targetId) {
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
      const existingId = this.model.id || this.model.purchaseOrderId;
      this.clientPurchaseService.updateClientPurchaseOrder(existingId, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Purchase order changes saved.' });
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
