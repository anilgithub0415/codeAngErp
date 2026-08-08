import { ChangeDetectorRef, Component, inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { ButtonModule } from 'primeng/button';
import { combineLatest, distinctUntilChanged, firstValueFrom, of, startWith } from 'rxjs';

import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { QuotationService } from '../../../core/services/quotation.service';
import { ProductService } from '../../../core/services/product.service'; 
import { LineDiscountService } from '../../../core/services/line-discount.service'; 
import { LineDiscount } from '../../../core/models/line-discount.model';
import { IQuotationItem, IQuotationWorkflow } from '../../../core/models/quotation.model';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDatepickerComponent } from '../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { hydrateFormlyConfig, chainOnInitHook, bindDatabaseHooks } from '../../../shared/utils/hydrationOfFormlyJson';
import { NgxPermissionsModule } from 'ngx-permissions';
import { FormService } from '../../../core/services/form.service';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    FormsModule, 
    FormlyModule, 
    CommonModule, 
    ButtonModule, 
    FormlyPrimeNGModule,
    NgxPermissionsModule
  ],
  templateUrl: './quotation-form.component.html',
  styleUrl: './quotation-form.component.scss'
})export class QuotationFormComponent implements OnInit {
  readonly FormOpMode = FormOpMode;
  @Input() tenantId!: number;
  @Input() opMode!: FormOpMode;

  
    //Convert to Quotation new approach:tag:convertToQuoteNewIdea
  workflow!:IQuotationWorkflow;

  // 🚀 1. REPLACE the plain input with an explicit Property Setter
  private _quotationData: any = null;

  @Input() 
  set quotationData(value: any) {
    this._quotationData = value;
    
    // If the component is already initialized and a conversion payload arrives, trigger processing instantly
    if (value && this.fields && this.fields.length > 0) {
      this.processIncomingDataState();
    }
  }

  get quotationData(): any {
    return this._quotationData;
  }

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSaveSuccess = new EventEmitter<string>();
  @Output() onFinalize = new EventEmitter<any>();
  @Output() onApprove = new EventEmitter<number>();
  @Output() onErrorToast = new EventEmitter<{ severity: string, summary: string, detail: string }>();

  raw!: any;
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  rawBlueprint: any[] = [];
  
  activeDiscounts: LineDiscount[] = [];

  private formService = inject(FormService);
  private formlyConfig = inject(FormlyConfig);
  private quotationService = inject(QuotationService);
  private productService = inject(ProductService); 
  private lineDiscountService = inject(LineDiscountService); 
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.generateFormlyJSONBlueprint(); // Generates your quotation_form layout
    this.registerFormlyExtensions();
    
    // 🚀 2. PROCESS STATE LOCALLY AFTER BLUEPRINT IS GENERATED
    this.processIncomingDataState();
  }

  // 🚀 3. NEW WORKFLOW ROUTER METHOD: Handles Update vs Create vs RFQ Conversion states safely
  private async processIncomingDataState(): Promise<void> {
console.log('m in processIncomingDataState');
console.log('qdata:',this.quotationData);


    if (!this.quotationData) {

        this.executeFreshCreationSetup();

        return;
    }

    console.log(
        'Formly Form: Intercepted data entry object processing strategy. Mode:',
        this.opMode
    );

    if (
        this.opMode === FormOpMode.Update ||
        this.opMode === FormOpMode.PortalNegotiation
    ) {

        await this.initiateUpdateWorkflow(this.quotationData);

        await this.loadWorkflow();

        return;
    }

    if (this.opMode === FormOpMode.Add) {

        console.log(
            'Formly Form: Executing RFQ to Quotation Model Mapping Procedure.'
        );

        this.form.reset();

        this.model = {
            ...this.quotationData
        };

        this.cd.detectChanges();

        return;
    }

    return;
}

  //
  async loadWorkflow(){

    if(!this.model?.id){

        return;

    }

    this.workflow=
        await firstValueFrom(
            this.quotationService.getWorkflow(
                this.model.id
            )
        );

  }
  
  private executeFreshCreationSetup(): void {
    this.form.reset();
    this.resetModelToDefault();
    this.cd.detectChanges();
  }

  private registerFormlyExtensions(): void {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent});
  }

  private preloadTenantPromotions(): void {
    this.lineDiscountService.getDiscounts(this.tenantId).subscribe({
      next: (res: LineDiscount[]) => {
        this.activeDiscounts = res || [];
        if (this.model && this.model.items) {
          this.recalculateAllQuotationLines();
        }
      },
      error: (err) => console.error('Failed loading discount matrices context:', err)
    });
  }
    

  private generateFormlyJSONBlueprint(): void { console.log('calling form...........');
  
    this.formService.getForm(this.tenantId!, 'quotation_form').subscribe(aform => {
      this.aForm = aform;
      this.raw = JSON.parse(this.aForm.FormlyConfig); console.log('.................raw:',this.raw);
      
    // 🔥 This must happen INSIDE the subscribe block
    console.log('hydrating now................................');
  
    const hydrated = hydrateFormlyConfig(this.raw); this.compileAndHydrateFields();
    this.fields = hydrated;
     
    //bindDatabasePricingHook(this.fields);
    bindDatabaseHooks(this.productService,this.tenantId,this.fields)
    });
    
                //       this.raw = [
                //   {
                //     "key": "id",
                //     "type": "input",
                //     "hide": true
                //   },
                //   {
                //     "key": "tenantId",
                //     "type": "input",
                //     "hide": true
                //   },
                //   {
                //     "key": "createdByUserId",
                //     "type": "input",
                //     "hide": true
                //   },
                //   {
                //     "key": "quoteNumber",
                //     "type": "input",
                //     "hide": true
                //   },
                //   {
                //     "key": "version",
                //     "type": "input",
                //     "hide": true
                //   },
                //   {
                //     "wrappers": [
                //       "panel"
                //     ],
                //     "className": "col-span-24 w-full block mb-2",
                //     "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
                //     "fieldGroup": [
                //       {
                //         "type": "primeng-dropdown",
                //         "key": "clientId",
                //         "className": "col-span-24 md:col-span-6",
                //         "props": {
                //           "label": "Wholesale Client / Customer from static json",
                //           "valueProp": "value",
                //           "styleClass": "w-full",
                //           "labelProp": "label",
                //           "optionLabel": "label",
                //           "optionValue": "value",
                //           "placeholder": "Select Customer",
                //           "lookupKey": "customerTypes",
                //           "required": true,
                //           "filter": true
                //         }
                //       },
                //       {
                //         "type": "input",
                //         "key": "clientName",
                //         "className": "col-span-24 md:col-span-6",
                //         "props": {
                //           "label": "Client / Trade Name",
                //           "placeholder": "e.g., Ceramic Enterprises",
                //           "required": true
                //         }
                //       },
                //       {
                //         "type": "input",
                //         "key": "clientCategory",
                //         "className": "col-span-12 md:col-span-6",
                //         "props": {
                //           "label": "Client Category",
                //           "placeholder": "e.g., Distributor, Retailer"
                //         }
                //       },
                //       {
                //         "type": "input",
                //         "key": "status",
                //         "className": "col-span-12 md:col-span-6",
                //         "props": {
                //           "label": "Quotation Status",
                //           "disabled": true
                //         }
                //       },
                //       {
                //         "type": "input",
                //         "key": "contactPerson",
                //         "className": "col-span-12 md:col-span-6",
                //         "props": {
                //           "label": "Contact Person Name",
                //           "placeholder": "e.g., John Doe"
                //         }
                //       },
                //       {
                //         "type": "input",
                //         "key": "deliveryLocation",
                //         "className": "col-span-24 md:col-span-12",
                //         "props": {
                //           "label": "Site Delivery / Logistics Location",
                //           "placeholder": "Enter complete logistics delivery path destination..."
                //         }
                //       },
                //       {
                //         "type": "input",
                //         "key": "remarksNotes",
                //         "className": "col-span-24 md:col-span-12",
                //         "props": {
                //           "label": "Internal Notes",
                //           "placeholder": "Add quote structural tracking notes..."
                //         }
                //       }
                //     ]
                //   },
                //   {
                //     "key": "items",
                //     "type": "p-repeatsectionformly",
                //     "wrappers": [
                //       "panel"
                //     ],
                //     "defaultValue": [],
                //     "props": {
                //       "label": "Itemized Material Estimate Lines",
                //       "addText": "Add Material Estimate Line",
                //       "rowDefaults": {
                //         "quantity": 1,
                //         "unit": "PCS",
                //         "price": 0,
                //         "targetPrice": 0,
                //         "discount": 0,
                //         "gstPercentage": 18,
                //         "totalItemAmount": 0
                //       }
                //     },
                //     "fieldArray": {
                //       "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
                //       "fieldGroup": [
                //         {
                //           "key": "id",
                //           "type": "input",
                //           "hide": true
                //         },
                //         {
                //           "key": "productVariantId",
                //           "type": "input",
                //           "hide": true
                //         },
                //         {
                //           "key": "prodName",
                //           "type": "input",
                //           "hide": true
                //         },
                //         {
                //           "key": "sku",
                //           "type": "input",
                //           "hide": true
                //         },
                //         {
                //           "key": "appliedLineDiscountId",
                //           "type": "input",
                //           "hide": true
                //         },
                //         {
                //           "type": "primeng-dropdown",
                //           "key": "productId",
                //           "className": "col-span-24 md:col-span-5",
                //           "props": {
                //             "optionLabel": "label",
                //             "optionValue": "value",
                //             "placeholder": "Select Product Item",
                //             "lookupKey": "productTypes",
                //             "required": true,
                //             "filter": true
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'Product Detail Spec / SKU' : ''"
                //           },
                //           "hooks": {
                //             "onInit": "onProductDropdownChange"
                //           }
                //         },
                //         {
                //           "type": "input",
                //           "key": "description",
                //           "className": "col-span-24 md:col-span-4",
                //           "props": {
                //             "placeholder": "Item Description / Notes"
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'Description' : ''"
                //           }
                //         },
                //         {
                //           "type": "input",
                //           "key": "unit",
                //           "className": "col-span-12 md:col-span-2",
                //           "props": {
                //             "placeholder": "UOM",
                //             "required": true
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'UOM' : ''"
                //           }
                //         },
                //         {
                //           "type": "input",
                //           "key": "quantity",
                //           "className": "col-span-12 md:col-span-2",
                //           "props": {
                //             "type": "number",
                //             "placeholder": "Qty",
                //             "required": true,
                //             "min": 0
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'Quantity' : ''"
                //           }
                //         },
                //         {
                //           "type": "input",
                //           "key": "finalPrice",
                //           "className": "col-span-12 md:col-span-2",
                //           "props": {
                //             "type": "number",
                //             "placeholder": "Rate",
                //             "required": true,
                //             "min": 0
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'Base Price' : ''"
                //           }
                //         },
                //         {
                //           "type": "input",
                //           "key": "targetPrice",
                //           "className": "col-span-12 md:col-span-2",
                //           "props": {
                //             "type": "number",
                //             "placeholder": "Target",
                //             "min": 0
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'Target Price (₹)' : ''"
                //           }
                //         },
                //         {
                //           "type": "input",
                //           "key": "discount",
                //           "className": "col-span-12 md:col-span-2",
                //           "props": {
                //             "type": "number",
                //             "placeholder": "Dsc",
                //             "required": true,
                //             "min": 0,
                //             "readonly": true
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'Discount (₹)' : ''"
                //           }
                //         },
                //         {
                //           "type": "input",
                //           "key": "gstPercentage",
                //           "className": "col-span-12 md:col-span-2",
                //           "props": {
                //             "type": "number",
                //             "placeholder": "GST",
                //             "required": true,
                //             "min": 0
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'GST %' : ''"
                //           }
                //         },
                //         {
                //           "type": "input",
                //           "key": "totalItemAmount",
                //           "className": "col-span-12 md:col-span-3",
                //           "props": {
                //             "type": "number",
                //             "placeholder": "Total",
                //             "readonly": true
                //           },
                //           "expressions": {
                //             "props.label": "field.parent.index === 0 ? 'Line Net' : ''"
                //           }
                //         }
                //       ]
                //     }
                //   }
                // ];

    
  } //end of generateFormlyJSONBlueprint


  private compileAndHydrateFields(): void {
    this.fields = hydrateFormlyConfig(this.rawBlueprint);
  //  bindDatabasePricingHook(this.fields);
  bindDatabaseHooks(this.productService,this.tenantId,this.fields)
  }

  private resetModelToDefault(): void {
    this.model = {
      id: 0,
      tenantId: this.tenantId,
      clientId: null,
      clientName: '',
      clientCategory: '',
      status: 'DRAFT',
      quoteNumber: '',
      version: 1,
      isActive: true,
      contactPerson: '',
      deliveryLocation: '',
      remarksNotes: '',
      totalAmount: 0,
      items: []
    };
  }

  private initiateUpdateWorkflow(selectedRecord: any): void {
    this.form = new FormGroup({});
    const clonedRecord = JSON.parse(JSON.stringify(selectedRecord));
    
    this.model = {
      ...clonedRecord,
      items: clonedRecord.items || []
    };

    setTimeout(() => {
      try {
        this.form.patchValue(this.model);
        this.recalculateAllQuotationLines(); 
      } catch (error) {
        console.error('Form patches allocation failure context:', error);
      }
      this.cd.detectChanges();
    }, 100);
  }

  CancelFormOp(): void {
    this.resetModelToDefault();
    this.onCancel.emit();
  }

  clearForm(): void {
    this.resetModelToDefault();
    this.form.reset();
    this.cd.detectChanges();
  }

  // async getProductFinalPrice(prodId: number, clientId: number): Promise<any> {
  //   const p = await firstValueFrom(this.productService.getProduct(this.tenantId, prodId));
  //   return new Promise((resolve) => {
  //     this.productService.getProductFinalPrice(prodId, this.tenantId, p, clientId).subscribe(afinalPrice => {
  //       console.log('got price for resolve:', afinalPrice);
  //       resolve(afinalPrice);
  //     });
  //   });
  // }

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

  public recalculateAllQuotationLines(): void {
    if (this.model && this.model.items) {
      this.model.items.forEach((line: any) => this.calculateSingleLineAmount(line));
    }
  }

  private updateGrandTotalSummary(): void {
    let grandSum = 0;
    if (this.model && this.model.items) {
      grandSum = this.model.items.reduce((acc: number, cur: any) => acc + (Number(cur.totalItemAmount) || 0), 0);
    }
    this.model.totalAmount = Number(grandSum.toFixed(2));
    this.cd.detectChanges();
  }

  async saveQuotation(): Promise<void> {
    if (!this.form.valid) {
      this.onErrorToast.emit({ severity: 'error', summary: 'Execution Truncated', detail: 'Validation checks failed.' });
      return;
    }

    const processedFormValue = { ...this.form.value };
    const cleanPayload = {
      ...this.model,
      ...processedFormValue,
      tenantId: this.tenantId
    };

    if (!Array.isArray(cleanPayload.items) || cleanPayload.items.length === 0) {
      this.onErrorToast.emit({ severity: 'error', summary: 'Schema Violation', detail: 'Must include at least one item line.' });
      return;
    }
    
    cleanPayload.items = cleanPayload.items.map((item: any) => ({
      ...item,
      productId: item.productId ? Number(item.productId) : null,
      productVariantId: item.productVariantId ? Number(item.productVariantId) : null,
      appliedLineDiscountId: item.appliedLineDiscountId ? Number(item.appliedLineDiscountId) : null,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      targetPrice: item.targetPrice ? Number(item.targetPrice) : null,
      discount: Number(item.discount || 0),
      gstPercentage: Number(item.gstPercentage || 0),
      totalItemAmount: Number(item.totalItemAmount || 0)
    }));

    try {
      if (this.opMode === FormOpMode.Add) {
        await firstValueFrom(this.quotationService.createQuotationClean(cleanPayload));
        this.onSaveSuccess.emit('Fresh Quotation committed successfully.');
      } else if (this.opMode === FormOpMode.Update) {
        await firstValueFrom(this.quotationService.updateQuotation(cleanPayload.id, cleanPayload));
        this.onSaveSuccess.emit('Quotation modified successfully.');
      }
    } catch (err: any) {
      this.onErrorToast.emit({ 
        severity: 'error', 
        summary: 'Persistence Failure', 
        detail: err.error?.message || err.message || 'Error occurred.' 
      });
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
submitQuotationForApproval(): void {
  // Prevent execution if form is invalid or already finalized
  if (this.form.invalid || this.isFinalized) {
    return;
  }

  const consolidatedPayload = {
    ...this.model,
    ...this.form.value,
    //totalAmount: this.t.grandTotal
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

  async submitPortalCounterOffer(): Promise<void> {
    if (!this.form.valid) {
      this.onErrorToast.emit({ severity: 'error', summary: 'Execution Truncated', detail: 'Please fill out all required fields before countering.' });
      return;
    }

    const processedFormValue = { ...this.form.value };
    const cleanPayload = {
      ...this.model,
      ...processedFormValue,
      tenantId: this.tenantId,
      status: 'COUNTER_OFFERED' 
    };

    if (!Array.isArray(cleanPayload.items) || cleanPayload.items.length === 0) {
      this.onErrorToast.emit({ severity: 'error', summary: 'Schema Violation', detail: 'Must include at least one item line to negotiate.' });
      return;
    }

    cleanPayload.items = cleanPayload.items.map((item: any) => ({
      ...item,
      productId: item.productId ? Number(item.productId) : null,
      productVariantId: item.productVariantId ? Number(item.productVariantId) : null,
      appliedLineDiscountId: item.appliedLineDiscountId ? Number(item.appliedLineDiscountId) : null,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      targetPrice: item.targetPrice ? Number(item.targetPrice) : null,
      discount: Number(item.discount || 0),
      gstPercentage: Number(item.gstPercentage || 0),
      totalItemAmount: Number(item.totalItemAmount || 0)
    }));

    try {
      await firstValueFrom(this.quotationService.submitClientCounterOffer(cleanPayload.id, cleanPayload));
      this.onSaveSuccess.emit('Your counter-offer has been submitted to the wholesaler successfully.');
    } catch (err: any) {
      this.onErrorToast.emit({ 
        severity: 'error', 
        summary: 'Negotiation Dispatch Failure', 
        detail: err.error?.message || err.message || 'Error executing price counter.' 
      });
    }
  }
}

//preservations


  //   private bindDatabasePricingHooks(fields: FormlyFieldConfig[]) {
  //   if (!fields) return;
  //   fields.forEach((field) => {
  //     if (field.fieldGroup && Array.isArray(field.fieldGroup)) {
  //       this.bindDatabasePricingHooks(field.fieldGroup);
  //     }
  //     if (field.key === 'items' && field.fieldArray) {
  //       const arrayConfig = field.fieldArray as FormlyFieldConfig;
  //       if (arrayConfig && arrayConfig.fieldGroup && Array.isArray(arrayConfig.fieldGroup)) {
  //         const productDropdown = arrayConfig.fieldGroup.find(f => f.key === 'productId');
  //         if (productDropdown && productDropdown.hooks && typeof productDropdown.hooks.onInit === 'string') {
  //           if (productDropdown.hooks.onInit === 'onProductDropdownChange') {
  //             chainOnInitHook(productDropdown, (targetField: FormlyFieldConfig) => {
  //               if (!targetField || !targetField.formControl) return;

  //               const clientControl = this.form.get('clientId');
  //               if (!clientControl) return;

  //               // 🌟 FIX: Combine both value change streams so changing EITHER the client OR the product updates the price
  //               combineLatest([
  //                 targetField.formControl.valueChanges.pipe(
  //                   startWith(targetField.formControl.value),
  //                   distinctUntilChanged()
  //                 ),
  //                 clientControl.valueChanges.pipe(
  //                   startWith(clientControl.value),
  //                   distinctUntilChanged()
  //                 )
  //               ]).subscribe(async ([prodId, activeClientId]) => {
  //                 console.log('Pricing hook triggered! -> prodId:', prodId, ' and activeClientId:', activeClientId);
                  
  //                 if (!prodId || !activeClientId) return;
                  
  //                 const parentField = targetField.parent; 
  //                 const rowGroup = parentField?.formControl as FormGroup;

  //                 // Skip lookup only if we are initializing a completely untouched loaded record
  //                 if (this.opMode === FormOpMode.Update && rowGroup && rowGroup.get('price')?.value > 0 && parentField!.model && parentField!.model.prodName && !targetField.formControl?.dirty && !clientControl.dirty) {
  //                   this.calculateSingleLineAmount(parentField!.model);
  //                   return;
  //                 }
                  
  //                 try {
  //                   const productMaster = await firstValueFrom(this.productService.getProduct(this.tenantId, prodId));
  //                   const finalPriceData = await this.getProductFinalPrice(prodId, Number(activeClientId));
  //                   console.log('finalPriceData matched from selection:', finalPriceData);
                    
  //                   const extractedName = productMaster?.prodName || 'Product #' + prodId;
  //                   const extractedSku = productMaster?.sku || '';
  //                   const resolvedRate = finalPriceData?.calculatedPrice !== undefined ? finalPriceData.calculatedPrice : finalPriceData;

  //                   if (parentField && parentField.model && rowGroup) {
  //                     parentField.model.productId = prodId;
  //                     parentField.model.prodName = extractedName;
  //                     parentField.model.sku = extractedSku;
  //                     parentField.model.price = Number(resolvedRate);

  //                     rowGroup.patchValue({
  //                       productId: prodId,
  //                       prodName: extractedName,
  //                       sku: extractedSku,
  //                       price: Number(resolvedRate)
  //                     }, { emitEvent: false });

  //                     this.calculateSingleLineAmount(parentField.model);
                      
  //                     if (targetField.options && targetField.options.detectChanges) {
  //                       targetField.options.detectChanges(targetField);
  //                     }
  //                   }
  //                 } catch (error) {
  //                   console.error('Pricing lookup pipeline error:', error);
  //                 }
  //               });
  //             });
  //           }
  //         }
  //       }
  //     }
  //   });
  // }






  // bindDatabaseHooks(fields: FormlyFieldConfig[]) {
  //   if (!fields) return;
  //   fields.forEach((field) => {
  //     if (field.fieldGroup && Array.isArray(field.fieldGroup)) {
  //       this.bindDatabaseHooks(field.fieldGroup);
  //     }
  //     if (field.key === 'items' && field.fieldArray) {
  //       const arrayConfig = field.fieldArray as FormlyFieldConfig;
  //       if (arrayConfig && arrayConfig.fieldGroup && Array.isArray(arrayConfig.fieldGroup)) {
  //         const productDropdown = arrayConfig.fieldGroup.find(f => f.key === 'productId');
  //         if (productDropdown && productDropdown.hooks && typeof productDropdown.hooks.onInit === 'string') {
  //           if (productDropdown.hooks.onInit === 'onProductDropdownChange') {
  //             chainOnInitHook(productDropdown, (targetField: FormlyFieldConfig) => {
  //               if (!targetField || !targetField.formControl) return;
  //               const rootForm = targetField.form?.root;
  //               const clientIdControl = rootForm?.get('clientId');
  //               if (!clientIdControl) return;

  //               combineLatest([
  //                 targetField.formControl.valueChanges.pipe(startWith(targetField.formControl.value)),
  //                 clientIdControl.valueChanges.pipe(startWith(clientIdControl.value))
  //               ]).pipe(
  //                 distinctUntilChanged((prev, curr) => prev[0] === curr[0] && prev[1] === curr[1])
  //               ).subscribe(async ([prodId, clientId]) => {
  //                 if (!prodId || !clientId) return;
  //                 try {
  //                   const finalPriceData = await this.getProductFinalPrice(prodId, clientId);
  //                   const finalPriceControl = targetField.parent?.formControl?.get('finalPrice');
  //                   if (finalPriceControl) {
  //                     finalPriceControl.setValue(
  //                       finalPriceData?.calculatedPrice !== undefined ? finalPriceData.calculatedPrice : finalPriceData, 
  //                       { emitEvent: true, onlySelf: true }
  //                     );
  //                   }
  //                 } catch (error) {
  //                   console.error(error);
  //                 }
  //               });
  //             });
  //           }
  //         }
  //       }
  //     }
  //   });
  // }