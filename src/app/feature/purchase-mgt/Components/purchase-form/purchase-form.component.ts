
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
import { bindDatabaseHooks, hydrateFormlyConfig , chainOnInitHook} from '../../../../shared/utils/hydrationOfFormlyJson';
import { NgxPermissionsModule } from 'ngx-permissions';
import { BadgeModule } from 'primeng/badge';
import { FormlyWrapperTypeaheadComponent } from '../../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { FormlyFieldButtonComponent } from '../../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { FormService } from '../../../../core/services/form.service';
import { ProductService } from '../../../../core/services/product.service';
import { combineLatest, distinctUntilChanged, firstValueFrom, startWith } from 'rxjs';
import { LineDiscount } from '../../../../core/models/line-discount.model';
import { LineDiscountService } from '../../../../core/services/line-discount.service';
import { IPurchaseOrderWorkflow } from '../../../../core/models/purchase.model';


@Component({
  selector: 'app-purchase-form',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, FormlyModule, FormlyPrimeNGModule,BadgeModule,
    ButtonModule, DropdownModule, NgxPermissionsModule,FormlyPrimeNGModule
  ],
  templateUrl: './purchase-form.component.html'
})
export class PurchaseFormComponent implements OnInit {
  @Input() model: any = {};
  @Input() currOpMode!: FormOpMode;
  @Input() tenantId!: number;


    @Input() workflow?: IPurchaseOrderWorkflow;
  @Output() onSave = new EventEmitter<any>();
  @Output() onFinalize = new EventEmitter<any>();
  @Output() onApprove = new EventEmitter<number>();
  @Output() onSend = new EventEmitter<number>();
  @Output() onCancel = new EventEmitter<void>();

  raw!:any;
  form = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };


    activeDiscounts: LineDiscount[] = [];

    private formService = inject(FormService);
  private formlyConfig = inject(FormlyConfig);
  private purchaseService = inject(PurchaseService);
    private productService = inject(ProductService); 
      private lineDiscountService = inject(LineDiscountService); 
  private cd = inject(ChangeDetectorRef);

  // private rawFormConfigBlueprint = [
  //   { "key": "id", "type": "input", "hide": true },
  //   { "key": "createdByUserId", "type": "input", "hide": true },
  //   { "key": "tenantId", "type": "input", "hide": true },
  //   {
  //     "wrappers": ["panel"],
  //     "className": "col-span-24 w-full block mb-0",
  //     "props": {},
  //     "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
  //     "fieldGroup": [
  //       {
  //         "type": "input",
  //         "key": "poNumber",
  //         "className": "col-span-6 md:col-span-4",
  //         "props": { "label": "Purchase Order#", "readonly": true, "placeholder": "PO#" }
  //       },
  //       {
  //         "type": "primeng-dropdown",
  //         "key": "vendorId",
  //         "className": "col-span-12 md:col-span-9",
  //         "props": {
  //           "label": "Vendor:", "optionLabel": "label", "optionValue": "value",
  //           "placeholder": "Select Vendor", "lookupKey": "vendorTypes", "filter": true, "required": true
  //         }
  //       },
  //       {
  //         "type": "datepicker",
  //         "key": "orderDate",
  //         "className": "col-span-12 md:col-span-6",
  //         "props": { "label": "Order Date", "dateFormat": "dd-mm-yy", "numberOfMonths": 1, "selectionMode": "single" }
  //       }
  //     ]
  //   },
  //   {
  //     "key": "items",
  //     "type": "p-repeatsectionformly",
  //     "wrappers": ["panel"],
  //     "defaultValue": [],
  //     "props": { "label": "", "addText": "Add Item Line", "rowDefaults": { "quantity": "1" } },
  //     "fieldArray": {
  //       "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
  //       "fieldGroup": [
  //         { "key": "id", "type": "input", "hide": true },
  //         {
  //           "type": "primeng-dropdown",
  //           "key": "productId",
  //           "className": "col-span-6 md:col-span-7",
  //           "props": {
  //             "label": "Item", "optionLabel": "label", "optionValue": "value",
  //             "placeholder": "Select Item", "lookupKey": "productTypes", "required": true, "filter": true
  //           },
  //           "expressions": { "props.label": "field.parent.index === 0 ? 'Item' : ''" }
  //         },
  //         {
  //           "type": "input",
  //           "key": "quantity",
  //           "className": "col-span-3 md:col-span-2",
  //           "props": { "placeholder": "Qty", "required": true },
  //           "expressions": { "props.label": "field.parent.index === 0 ? 'Quantity' : ''" }
  //         },
  //         {
  //           "type": "primeng-dropdown",
  //           "key": "purchaseUom",
  //           "className": "col-span-12 md:col-span-6",
  //           "props": { "optionLabel": "label", "optionValue": "value", "placeholder": "Select UOM", "filter": true, "required": true, "options": [] },
  //           "expressions": { "props.label": "field.parent.index === 0 ? 'Purchase UOM:' : ''" }
  //         },
  //         {
  //           "type": "input",
  //           "key": "finalPrice",
  //           "className": "col-span-3 md:col-span-3",
  //           "props": { "placeholder": "Price", "required": true },
  //           "expressions": { "props.label": "field.parent.index === 0 ? 'Price' : ''" }
  //         }
  //       ]
  //     }
  //   }
  // ];

  ngOnInit(): void {
    console.log('ngOnInit of p form............');
    
    this.generateFormlyJSONBlueprint();
    this.configureFormlyTypes();
  //  this.initializeFormBlueprint();

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
 private registerFormlyExtensions(): void {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent});
  }
    private generateFormlyJSONBlueprint(): void { console.log('calling form...........');
    
      this.formService.getForm(this.tenantId!, 'purchase_form').subscribe(aform => {
        this.aForm = aform;
        this.raw = JSON.parse(this.aForm.FormlyConfig); console.log('.................raw:',this.raw);
        
      // 🔥 This must happen INSIDE the subscribe block
      console.log('hydrating now................................');
    
      const hydrated = hydrateFormlyConfig(this.raw); this.compileAndHydrateFields();
      this.fields = hydrated;
       
     this.bindDatabasePricingHooks(this.fields);
      bindDatabaseHooks(this.productService,this.tenantId,this.fields);
        this.initializeFormBlueprint();
      });
    }



    private bindDatabasePricingHooks(fields: FormlyFieldConfig[]) {
    if (!fields) return;
    fields.forEach((field) => {
      if (field.fieldGroup && Array.isArray(field.fieldGroup)) {
        this.bindDatabasePricingHooks(field.fieldGroup);
      }
      if (field.key === 'items' && field.fieldArray) {
        const arrayConfig = field.fieldArray as FormlyFieldConfig;
        if (arrayConfig && arrayConfig.fieldGroup && Array.isArray(arrayConfig.fieldGroup)) {
          const productDropdown = arrayConfig.fieldGroup.find(f => f.key === 'productId');
          if (productDropdown && productDropdown.hooks && typeof productDropdown.hooks.onInit === 'string') {
            if (productDropdown.hooks.onInit === 'onProductDropdownChange') {
              chainOnInitHook(productDropdown, (targetField: FormlyFieldConfig) => {
                if (!targetField || !targetField.formControl) return;

                const clientControl = this.form.get('clientId');
                if (!clientControl) return;

                // 🌟 FIX: Combine both value change streams so changing EITHER the client OR the product updates the price
                combineLatest([
                  targetField.formControl.valueChanges.pipe(
                    startWith(targetField.formControl.value),
                    distinctUntilChanged()
                  ),
                  clientControl.valueChanges.pipe(
                    startWith(clientControl.value),
                    distinctUntilChanged()
                  )
                ]).subscribe(async ([prodId, activeClientId]) => {
                  console.log('Pricing hook triggered! -> prodId:', prodId, ' and activeClientId:', activeClientId);
                  
                  if (!prodId || !activeClientId) return;
                  
                  const parentField = targetField.parent; 
                  const rowGroup = parentField?.formControl as FormGroup;

                  // Skip lookup only if we are initializing a completely untouched loaded record
                  if (this.currOpMode === FormOpMode.Update && rowGroup && rowGroup.get('price')?.value > 0 && parentField!.model && parentField!.model.prodName && !targetField.formControl?.dirty && !clientControl.dirty) {
                    this.calculateSingleLineAmount(parentField!.model);
                    return;
                  }
                  
                  try {
                    const productMaster = await firstValueFrom(this.productService.getProduct(this.tenantId, prodId));
                    const finalPriceData = await this.getProductFinalPrice(prodId, Number(activeClientId));
                    console.log('finalPriceData matched from selection:', finalPriceData);
                    
                    const extractedName = productMaster?.prodName || 'Product #' + prodId;
                    const extractedSku = productMaster?.sku || '';
                    const resolvedRate = finalPriceData?.calculatedPrice !== undefined ? finalPriceData.calculatedPrice : finalPriceData;

                    if (parentField && parentField.model && rowGroup) {
                      parentField.model.productId = prodId;
                      parentField.model.prodName = extractedName;
                      parentField.model.sku = extractedSku;
                      parentField.model.price = Number(resolvedRate);

                      rowGroup.patchValue({
                        productId: prodId,
                        prodName: extractedName,
                        sku: extractedSku,
                        price: Number(resolvedRate)
                      }, { emitEvent: false });

                      this.calculateSingleLineAmount(parentField.model);
                      
                      if (targetField.options && targetField.options.detectChanges) {
                        targetField.options.detectChanges(targetField);
                      }
                    }
                  } catch (error) {
                    console.error('Pricing lookup pipeline error:', error);
                  }
                });
              });
            }
          }
        }
      }
    });
  }

   private preloadTenantPromotions(): void {
    this.lineDiscountService.getDiscounts(this.tenantId).subscribe({
      next: (res: LineDiscount[]) => {
        this.activeDiscounts = res || [];
        // if (this.model && this.model.items) {
        //   this.recalculateAllQuotationLines();
        // }
      },
      error: (err) => console.error('Failed loading discount matrices context:', err)
    });
  }

 async getProductFinalPrice(prodId: number, clientId: number): Promise<any> {
    const p = await firstValueFrom(this.productService.getProduct(this.tenantId, prodId));
    return new Promise((resolve) => {
      this.productService.getProductFinalPrice(prodId, this.tenantId, p, clientId).subscribe(afinalPrice => {
        console.log('got price for resolve:', afinalPrice);
        resolve(afinalPrice);
      });
    });
  }
  public calculateSingleLineAmount(rowModel: any): void {
    if (!rowModel) return;

    const quantity = Number(rowModel.quantity) || 0;
    const price = Number(rowModel.price) || 0;
    const gstPercent = Number(rowModel.gstPercentage) || 0;
    const baseSubtotal = price * quantity;

    rowModel.discount = 0.00;
    rowModel.appliedLineDiscountId = null;

    if (rowModel.productId) {
      const matchRule = this.activeDiscounts.find(d => Number(d.productId) === Number(rowModel.productId) && d.isActive);
      
      if (matchRule) { 
        console.log('matchrule:', matchRule);
        rowModel.appliedLineDiscountId = matchRule.id;
        
        const strategyLabel = matchRule.discountType && typeof matchRule.discountType === 'object' 
          ? (matchRule.discountType as any).typeName 
          : String(matchRule.discountType);

        if (strategyLabel === 'Percentage' || strategyLabel === '1') { 
          rowModel.discount = Number((baseSubtotal * (Number(matchRule.discountValue) / 100)).toFixed(2));
        } else if (strategyLabel === 'Fixed_Amount' || strategyLabel === '2') {
          rowModel.discount = Number((Number(matchRule.discountValue) * quantity).toFixed(2));
        }
      }
    }

    const netGrossTotal = baseSubtotal - rowModel.discount;
    const postPromotionTotal = netGrossTotal >= 0 ? netGrossTotal : 0;
    const taxMultiplier = 1 + (gstPercent / 100);
    
    rowModel.totalItemAmount = Number((postPromotionTotal * taxMultiplier).toFixed(2));

    this.form.patchValue(this.model, { emitEvent: false });
    this.updateGrandTotalSummary();
  }

  private updateGrandTotalSummary(): void {
    let grandSum = 0;
    if (this.model && this.model.items) {
      grandSum = this.model.items.reduce((acc: number, cur: any) => acc + (Number(cur.totalItemAmount) || 0), 0);
    }
    this.model.totalAmount = Number(grandSum.toFixed(2));
    this.cd.detectChanges();
  }


  private compileAndHydrateFields(): void {
    this.fields = hydrateFormlyConfig(this.raw);
  //  bindDatabasePricingHook(this.fields);
  bindDatabaseHooks(this.productService,this.tenantId,this.fields)
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


onSendClicked(): void {
  if (this.model && this.model.id) {
    this.onSend.emit(this.model.id);
  } else {
   // this.showToast('error', 'Error', 'Cannot send an unsaved or missing record identifier.');
  }
}

}


