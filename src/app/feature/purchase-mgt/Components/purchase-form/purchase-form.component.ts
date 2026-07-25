
// purchase-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter, inject, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

import { PurchaseService, TenantRulesMatrixResponse } from '../../../../core/services/purchase.service';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { FormlyCardWrapperComponent } from '../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDatepickerComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { hydrateFormlyConfig } from '../../../../shared/utils/hydrationOfFormlyJson';
import { NgxPermissionsModule } from 'ngx-permissions';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, FormlyModule, FormlyPrimeNGModule,
    ButtonModule, DropdownModule, NgxPermissionsModule
  ],
  templateUrl: './purchase-form.component.html'
})
export class PurchaseFormComponent implements OnInit {
  @Input() model: any = {};
  @Input() currOpMode!: FormOpMode;
  @Input() tenantId!: number;

  @Output() onSave = new EventEmitter<any>();
  @Output() onFinalize = new EventEmitter<any>();
  @Output() onApprove = new EventEmitter<number>();
  @Output() onCancel = new EventEmitter<void>();

  form = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };

  private formlyConfig = inject(FormlyConfig);
  private purchaseService = inject(PurchaseService);
  private cd = inject(ChangeDetectorRef);

  private rawFormConfigBlueprint = [
    { "key": "id", "type": "input", "hide": true },
    { "key": "createdByUserId", "type": "input", "hide": true },
    { "key": "tenantId", "type": "input", "hide": true },
    {
      "wrappers": ["panel"],
      "className": "col-span-24 w-full block mb-0",
      "props": {},
      "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
      "fieldGroup": [
        {
          "type": "input",
          "key": "poNumber",
          "className": "col-span-6 md:col-span-4",
          "props": { "label": "Purchase Order#", "readonly": true, "placeholder": "PO#" }
        },
        {
          "type": "primeng-dropdown",
          "key": "vendorId",
          "className": "col-span-12 md:col-span-9",
          "props": {
            "label": "Vendor:", "optionLabel": "label", "optionValue": "value",
            "placeholder": "Select Vendor", "lookupKey": "vendorTypes", "filter": true, "required": true
          }
        },
        {
          "type": "datepicker",
          "key": "orderDate",
          "className": "col-span-12 md:col-span-6",
          "props": { "label": "Order Date", "dateFormat": "dd-mm-yy", "numberOfMonths": 1, "selectionMode": "single" }
        }
      ]
    },
    {
      "key": "items",
      "type": "p-repeatsectionformly",
      "wrappers": ["panel"],
      "defaultValue": [],
      "props": { "label": "", "addText": "Add Item Line", "rowDefaults": { "quantity": "1" } },
      "fieldArray": {
        "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
        "fieldGroup": [
          { "key": "id", "type": "input", "hide": true },
          {
            "type": "primeng-dropdown",
            "key": "productId",
            "className": "col-span-6 md:col-span-7",
            "props": {
              "label": "Item", "optionLabel": "label", "optionValue": "value",
              "placeholder": "Select Item", "lookupKey": "productTypes", "required": true, "filter": true
            },
            "expressions": { "props.label": "field.parent.index === 0 ? 'Item' : ''" }
          },
          {
            "type": "input",
            "key": "quantity",
            "className": "col-span-3 md:col-span-2",
            "props": { "placeholder": "Qty", "required": true },
            "expressions": { "props.label": "field.parent.index === 0 ? 'Quantity' : ''" }
          },
          {
            "type": "primeng-dropdown",
            "key": "purchaseUom",
            "className": "col-span-12 md:col-span-6",
            "props": { "optionLabel": "label", "optionValue": "value", "placeholder": "Select UOM", "filter": true, "required": true, "options": [] },
            "expressions": { "props.label": "field.parent.index === 0 ? 'Purchase UOM:' : ''" }
          },
          {
            "type": "input",
            "key": "finalPrice",
            "className": "col-span-3 md:col-span-3",
            "props": { "placeholder": "Price", "required": true },
            "expressions": { "props.label": "field.parent.index === 0 ? 'Price' : ''" }
          }
        ]
      }
    }
  ];

  ngOnInit(): void {
    this.configureFormlyTypes();
    this.initializeFormBlueprint();

    // Listen to changes and compute financial matrices
    this.form.valueChanges.subscribe(() => this.computeTotals());

    // Auto-patch if mapping an operational edit scenario
    if (this.currOpMode === FormOpMode.Update && this.model) {
      setTimeout(() => {
        this.form.patchValue(this.model);
        this.computeTotals();
        this.cd.detectChanges();
      }, 100);
    }
  }

  private configureFormlyTypes(): void {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'datepicker', component: FormlyFieldPrimengDatepickerComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
  }

  private initializeFormBlueprint(): void {
    this.fields = hydrateFormlyConfig(this.rawFormConfigBlueprint);
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

  clearActiveVendor(): void {
    this.model.vendor = null;
    this.model.vendorId = null;
    this.form.patchValue({ vendorId: null });
  }

    /**
   * Evaluates dynamic row items arrays to calculate accumulative aggregate pricing metrics.
   */
  computeTotals(): void {
    const formValue = this.form.value as any;
    const lines = formValue?.items || this.model?.items || [];
    
    let sub = 0;
    for (const l of lines) {
      const qty = Number(l.quantity || 0);
      const base = Number(l.finalPrice || l.price || 0);
      l.lineTotal = +(qty * base).toFixed(2);
      sub += l.lineTotal;
    }
    
    this.totals.subTotal = +(sub).toFixed(2);
    this.totals.taxTotal = +(this.totals.subTotal * 0).toFixed(2); // Adjust multiplier if tax rule is used
    this.totals.grandTotal = +(this.totals.subTotal + this.totals.taxTotal).toFixed(2);
    
    // Keep parent metadata total attribute in absolute synchronization
    this.model.totalAmount = this.totals.grandTotal;
  }

  /**
   * Resets internal dynamic structures and clears active validation tree state.
   */
  clearPurchaseForm(): void {
    this.model.items = [];
    this.totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
    this.form.reset();
  }

  /**
   * Validates form controls and bubbles the integrated dataset payload back upstream to the orchestrator.
   */
  submitPurchase(): void {
    if (this.form.valid) {
      const consolidatedPayload = {
        ...this.model,
        ...this.form.value,
        totalAmount: this.totals.grandTotal
      };
      this.onSave.emit(consolidatedPayload);
    }
  }
// Add this getter inside your PurchaseFormComponent class
get isFinalized(): boolean {
  // If there's no model data yet, or if it is explicitly a fresh creation, it's not finalized
  if (!this.model || !this.model.status) {
    return false;
  }
  
  // The backend defaults new items to "DRAFT". 
  // If the status is anything else (e.g., "APPROVED", "FINALIZED"), it should be disabled.
  return this.model.status !== 'DRAFT';
}


  

// 2. Implement the requested method
submitPurchaseForApproval(): void {
  // Prevent execution if form is invalid or already finalized
  if (this.form.invalid || this.isFinalized) {
    return;
  }

  const consolidatedPayload = {
    ...this.model,
    ...this.form.value,
    totalAmount: this.totals.grandTotal
  };
  
  this.onFinalize.emit(consolidatedPayload);
}


// 2. Execute the trigger function
onApproveClicked(): void {
  if (this.model && this.model.id) {
    this.onApprove.emit(this.model.id);
  } else {
   // this.showToast('error', 'Error', 'Cannot approve an unsaved or missing record identifier.');
  }
}


}


