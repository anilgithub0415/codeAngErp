import { Component, OnInit, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig, FormlyConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { catchError, debounceTime, distinctUntilChanged, firstValueFrom, of, switchMap } from 'rxjs';

import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { ProductService } from '../../../../core/services/product.service';
import { PurchaseService } from '../../../../core/services/purchase.service';
import { SalesService } from '../../../../core/services/sales.service';
import { CreateProductDto } from '../../../../core/models/product.model';

import { FormlyCardWrapperComponent } from '../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { FormlyCustomRowBridgeComponent } from '../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { bindDatabaseHooks, hydrateFormlyConfig } from '../../../../shared/utils/hydrationOfFormlyJson';
import { FormService } from '../../../../core/services/form.service';

@Component({
  selector: 'app-product-master-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormlyModule, FormlyPrimeNGModule, ButtonModule],
  templateUrl: './product-master-form.component.html',
  styleUrl: './product-master-form.component.scss'
})
export class ProductMasterFormComponent implements OnInit, OnChanges {
  @Input() tenantId!: number;
  
  @Input() opMode!: FormOpMode;
  @Input() isFormHidden: boolean = true;
  @Input() productData: any = null;
  
  @Input() hsnOptions: any[] = [];

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSaveSuccess = new EventEmitter<void>();
  @Output() onSaveFailure = new EventEmitter<FormOpMode>();
  @Output() onPromptReactivation = new EventEmitter<{ productId: number, productName: string }>();

  raw!:any;
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  rawJSON!: any;

    private formService = inject(FormService);
  private productService = inject(ProductService);
  private purchaseService = inject(PurchaseService);
  private salesService = inject(SalesService);
  private messageService = inject(MessageService);
  private formlyConfig = inject(FormlyConfig);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.registerCustomFormlyEngineExtensions();
    this.getFormlyJSON_processed();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productData'] || changes['opMode']) {
      if (this.opMode === FormOpMode.Update && this.productData) {
        this.loadFormForUpdate(this.productData);
      } else {
        this.resetFormForAdd();
      }
    }
  }

  private registerCustomFormlyEngineExtensions() {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent }); 
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
  }

  private resetFormForAdd() {
    this.model = { 
      id: 0, tenantId: this.tenantId, categoryId: null, hsnId: null, prodName: '', sku: '',
      basePrice: 0, currentstock: 0, reorderLevel: 0, isVariablePrice: false, isOEMProduct: false,
      isBulkPacking: false, isActive: true, status: 'DRAFT', totalAmount: 0, notes: '',
      customAttributes: { tier_prices: { B2C_price: 0, B2B_price: 0, B2BC_price: 0, Dealer_price: 0, Wholesaler_price: 0 } }
    };
    
    if (this.form) {
      this.form.reset();
    }
    
    this.cd.detectChanges();
  }

    private loadFormForUpdate(selectedRecord: any) { console.log('m here.................................................');
    
    if (!selectedRecord || !selectedRecord.id) return;
    
    // Resolve tenant context authority dynamically from the target record to prevent cross-tenant lookup crashes
    const activeRecordTenantId = selectedRecord.tenantId ? Number(selectedRecord.tenantId) : this.tenantId;
    console.log('.....................activeRecordTenantId:');
    
    this.productService.getProduct(activeRecordTenantId, selectedRecord.id).subscribe({
      next: async (freshRecord) => {
        if (!freshRecord) {
          throw new Error('Null record context body returned');
        }

        let parsedAttributes: any = freshRecord.customAttributes;
        if (typeof parsedAttributes === 'string' && parsedAttributes.trim() !== '') {
          try {
            parsedAttributes = JSON.parse(parsedAttributes);
          } catch (e) {
            parsedAttributes = null;
          }
        }
        
        if (!parsedAttributes || typeof parsedAttributes !== 'object') {
          parsedAttributes = {};
        }
        if (!parsedAttributes.tier_prices || typeof parsedAttributes.tier_prices !== 'object') {
          parsedAttributes.tier_prices = {};
        }

        const baselineTiers = { B2C_price: 0, B2B_price: 0, B2BC_price: 0, Dealer_price: 0, Wholesaler_price: 0 };
        parsedAttributes.tier_prices = { ...baselineTiers, ...parsedAttributes.tier_prices };

        this.model = { 
          ...(freshRecord as any),
          customAttributes: parsedAttributes
        };
        
        // Ensure options list exists in fields structure config array before execution
        await this.pullAllPurchaseUnits(freshRecord.id!, null);
        await this.pullAllSalesUnits(freshRecord.id!, null);

        if (this.form) {
          this.form.reset();
          this.form.patchValue(this.model);
        }
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Critical loading mutation fault context summary:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: err?.error?.message || 'The requested product data could not be retrieved from the server.' 
        });
      }
    });
  }


  getFormlyJSON_processed() {
    // this.rawJSON = [
    //   { "key": "id", "type": "input", "hide": true },
    //   { "key": "createdByUserId", "type": "input", "hide": true },
    //   { "key": "tenantId", "type": "input", "hide": true },
    //   {
    //     "wrappers": ["panel"],
    //     "className": "col-span-12 w-full block mb-0",
    //     "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
    //     "fieldGroup": [
    //       {
    //         "type": "primeng-dropdown",
    //         "key": "categoryId",
    //         "className": "col-span-6 md:col-span-4",
    //         "props": { 
    //           "label": "Product Category", 
    //           "placeholder": "Select Category", 
    //           "options": this.categoryOptions, 
    //           "required": true, 
    //           "filter": true 
    //         },
    //         "expressions": {
    //           "model.hsnId": (field: FormlyFieldConfig) => {
    //             const activeCatId = field.model?.categoryId;
    //             if (activeCatId && field.formControl?.dirty) {
    //               const match = this.categoryOptions.find(o => o.value === activeCatId);
    //               if (match && match.defaultHsnId) return match.defaultHsnId;
    //             }
    //             return field.model?.hsnId;
    //           }
    //         }
    //       },
    //       {
    //         "type": "primeng-dropdown",
    //         "key": "hsnId",
    //         "className": "col-span-6 md:col-span-4",
    //         "props": { 
    //           "label": "HSN Code", 
    //           "valueProp": "value", 
    //           "labelProp": "label", 
    //           "optionLabel": "label", 
    //           "optionValue": "value", 
    //           "placeholder": "Select HSN", 
    //           "lookupKey": "hsnTypes", 
    //           "required": true, 
    //           "filter": true, 
    //           "options": this.hsnOptions 
    //         }
    //       },
    //       { 
    //         "key": "prodName", 
    //         "type": "input", 
    //         "className": "col-span-12 md:col-span-4", 
    //         "wrappers": ["typeahead-wrapper"], 
    //         "props": { 
    //           "label": "Product Name", 
    //           "placeholder": "Enter product name", 
    //           "required": true 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "description", 
    //         "className": "col-span-12 md:col-span-4", 
    //         "props": { 
    //           "label": "Description", 
    //           "placeholder": "Enter description" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "sku", 
    //         "className": "col-span-12 md:col-span-2", 
    //         "props": { 
    //           "label": "SKU", 
    //           "placeholder": "Enter sku", 
    //           "pattern": "^(.{6,}|.*-base)$" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "basePrice", 
    //         "className": "col-span-6 md:col-span-2", 
    //         "props": { 
    //           "label": "Base Price", 
    //           "placeholder": "Enter baseprice", 
    //           "type": "number" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "customAttributes.tier_prices.B2C_price", 
    //         "className": "col-span-6 md:col-span-2", 
    //         "props": { 
    //           "label": "B2C Price", 
    //           "placeholder": "0.00", 
    //           "type": "number" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "customAttributes.tier_prices.B2B_price", 
    //         "className": "col-span-6 md:col-span-2", 
    //         "props": { 
    //           "label": "B2B Price", 
    //           "placeholder": "0.00", 
    //           "type": "number" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "customAttributes.tier_prices.B2BC_price", 
    //         "className": "col-span-6 md:col-span-2", 
    //         "props": { 
    //           "label": "B2BC Price", 
    //           "placeholder": "0.00", 
    //           "type": "number" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "customAttributes.tier_prices.Dealer_price", 
    //         "className": "col-span-6 md:col-span-2", 
    //         "props": { 
    //           "label": "Dealer Price", 
    //           "placeholder": "0.00", 
    //           "type": "number" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "customAttributes.tier_prices.Wholesaler_price", 
    //         "className": "col-span-6 md:col-span-2", 
    //         "props": { 
    //           "label": "Wholesaler Price", 
    //           "placeholder": "0.00", 
    //           "type": "number" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "currentstock", 
    //         "className": "col-span-6 md:col-span-2", 
    //         "props": { 
    //           "label": "Stock", 
    //           "placeholder": "Enter currentstock", 
    //           "type": "number" 
    //         } 
    //       },
    //       { 
    //         "type": "input", 
    //         "key": "reorderLevel", 
    //         "className": "col-span-6 md:col-span-2", 
    //         "props": { 
    //           "label": "Reorder Level", 
    //           "placeholder": "Enter reorderLevel", 
    //           "type": "number" 
    //         } 
    //       },
    //       { 
    //         "type": "checkbox", 
    //         "key": "isOEMProduct", 
    //         "defaultValue": false, 
    //         "className": "col-span-3 md:col-span-1", 
    //         "props": { "label": "Is OEM" } 
    //       },
    //       { 
    //         "type": "checkbox", 
    //         "key": "isVariablePrice", 
    //         "defaultValue": false, 
    //         "className": "col-span-3 md:col-span-2", 
    //         "props": { "label": "Variable Price" } 
    //       },
    //       { 
    //         "type": "checkbox", 
    //         "key": "isBulkPacking", 
    //         "defaultValue": false, 
    //         "className": "col-span-3 md:col-span-2", 
    //         "props": { "label": "Is BulkPack" } 
    //       },
    //       { 
    //         "type": "checkbox", 
    //         "key": "isActive", 
    //         "defaultValue": true, 
    //         "className": "col-span-3 md:col-span-1", 
    //         "props": { "label": "isActive" } 
    //       },
    //       { 
    //         "type": "primeng-dropdown", 
    //         "key": "defaultPurchaseUom", 
    //         "className": "col-span-12 md:col-span-4", 
    //         "props": { 
    //           "label": "Purchase Unit:", 
    //           "optionLabel": "label", 
    //           "optionValue": "value", 
    //           "placeholder": "Select UOM", 
    //           "filter": true, 
    //           "options": [] 
    //         }, 
    //         "expressions": { "hide": () => this.opMode !== FormOpMode.Update } 
    //       },
    //       { 
    //         "type": "primeng-dropdown", 
    //         "key": "defaultSalesUom", 
    //         "className": "col-span-12 md:col-span-4", 
    //         "props": { 
    //           "label": "Sales Unit:", 
    //           "optionLabel": "label", 
    //           "optionValue": "value", 
    //           "placeholder": "Select UOM", 
    //           "filter": true, 
    //           "options": [] 
    //         }, 
    //         "expressions": { "hide": () => this.opMode !== FormOpMode.Update } 
    //       },
    //       { 
    //         "type": "primeng-dropdown", 
    //         "key": "baseUom", 
    //         "className": "col-span-12 md:col-span-4", 
    //         "props": { 
    //           "label": "Base Unit:", 
    //           "optionLabel": "label", 
    //           "optionValue": "value", 
    //           "placeholder": "Select UOM", 
    //           "filter": true, 
    //           "options": [] 
    //         }, 
    //         "expressions": { "hide": () => this.opMode !== FormOpMode.Update } 
    //       }
    //     ]
    //   }
    // ];


    console.log('.........processing form.........');
    
     this.formService.getForm(this.tenantId!, 'product_form').subscribe(aform => {
        this.aForm = aform;
        this.raw = JSON.parse(this.aForm.FormlyConfig); console.log('.................raw:',this.raw);
        
      // 🔥 This must happen INSIDE the subscribe block
      console.log('hydrating now................................');
    
      const hydrated = hydrateFormlyConfig(this.raw); this.compileAndHydrateFields();
      this.fields = hydrated;
     })

    const prodNameField = this.findFieldByKey(this.fields, 'prodName');

    if (prodNameField) {
      prodNameField.hooks = prodNameField.hooks || {};
      prodNameField.props = {
        ...prodNameField.props,
        onSuggestionSelected: (selectedItem: any) => {
          if (this.opMode === FormOpMode.Update && selectedItem.id === this.model?.id) {
            return;
          }
          if (!selectedItem.isActive) {
            this.onPromptReactivation.emit({ productId: selectedItem.id, productName: selectedItem.prodName });
          } else {
            this.messageService.add({ 
              severity: 'warn', 
              summary: 'Duplicate Item', 
              detail: `Product '${selectedItem.prodName}' is already active.` 
            });
            this.loadFormForUpdate(selectedItem);
          }
        }
      };

      prodNameField.hooks.onInit = (field: FormlyFieldConfig) => {
        if (!field.formControl) return;
        field.formControl.valueChanges.pipe(
          debounceTime(300), 
          distinctUntilChanged(),
          switchMap(value => {
            // Guard clause to skip search calculations when patchValue event triggers update lines
            if (!value || typeof value !== 'string' || value.trim().length < 1 || (this.opMode === FormOpMode.Update && value === this.model?.prodName)) {
              return of([]);
            }
            return this.productService.getProductSuggestions(this.tenantId, value.trim()).pipe(
              catchError(err => { 
                console.error('Suggestion stream fault:', err); 
                return of([]); 
              })
            );
          })
        ).subscribe({
          next: (suggestions: any) => {
            let filtered = Array.isArray(suggestions) ? suggestions : [suggestions];
            if (this.opMode === FormOpMode.Update && this.model?.id) {
              filtered = filtered.filter(s => s.id !== this.model.id);
            }
            if (field.props) field.props['suggestions'] = filtered;
          }
        });
      };
    }
  }


    private compileAndHydrateFields(): void {
      this.fields = hydrateFormlyConfig(this.raw);
    //  bindDatabasePricingHook(this.fields);
    bindDatabaseHooks(this.productService,this.tenantId,this.fields)
    }
  
  async pullAllPurchaseUnits(forProductId: number | null, forvariantId: number | null) {
    try {
      const resultMatrix = await firstValueFrom(
        this.purchaseService.fetchTenantRulesMatrix(this.tenantId, forProductId!, forvariantId!)
      );
      if (resultMatrix && resultMatrix.availablePurchaseUnits) {
        const uomField = this.findFieldByKey(this.fields, 'defaultPurchaseUom');
        if (uomField) {
          uomField.props = { ...uomField.props, options: resultMatrix.availablePurchaseUnits };
          this.fields = [...this.fields]; 
        }
      }
    } catch (error) {
      console.error('Error fetching purchase units:', error);
    }
  }

  async pullAllSalesUnits(forProductId: number | null, forvariantId: number | null) {
    try {
      const resultMatrix = await firstValueFrom(
        this.salesService.fetchTenantRulesMatrix(this.tenantId, forProductId!, forvariantId!)
      );
      if (resultMatrix && resultMatrix.availableSalesUnits) {
        const Sales_uomField = this.findFieldByKey(this.fields, 'defaultSalesUom');
        if (Sales_uomField) {
          Sales_uomField.props = { ...Sales_uomField.props, options: resultMatrix.availableSalesUnits };
        }
        const Base_uomField = this.findFieldByKey(this.fields, 'baseUom');
        if (Base_uomField) {
          Base_uomField.props = { ...Base_uomField.props, options: resultMatrix.availableSalesUnits };
        }
        this.fields = [...this.fields];
      }
    } catch (error) {
      console.error('Error fetching sales unit arrays matrix:', error);
    }
  }

  private findFieldByKey(fields: any[], key: string): any {
    for (const field of fields) {
      if (field.key === key) return field;
      if (field.fieldGroup) {
        const found = this.findFieldByKey(field.fieldGroup, key);
        if (found) return found;
      }
    }
    return null;
  }

  saveProduct() {
    const formValues = this.form.value as any;

    if (!formValues.prodName || formValues.basePrice === undefined || !this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product Name and Price is required' });
      return;
    }

    const sourceTierPrices = formValues.customAttributes?.tier_prices || {};
    const tierPrices: Record<string, any> = {};
    
    Object.keys(sourceTierPrices).forEach(key => {
      if (key.endsWith('_price')) {
        tierPrices[key] = sourceTierPrices[key];
      }
    });

    const createDto: CreateProductDto = {
      id: this.model?.id || 0,
      tenantId: this.tenantId,
      categoryId: formValues.categoryId, 
      hsnId: formValues.hsnId,
      prodName: formValues.prodName,
      description: formValues.description || null,
      sku: formValues.sku,
      basePrice: Number(formValues.basePrice),
      isVariablePrice: formValues.isVariablePrice || false,
      isActive: formValues.isActive !== undefined ? formValues.isActive : true,
      isOEMProduct: formValues.isOEMProduct || false,
      isBulkPacking: formValues.isBulkPacking || false,
      reorderLevel: formValues.reorderLevel ? Number(formValues.reorderLevel) : 0, 
      defaultPurchaseUom: formValues.defaultPurchaseUom,
      defaultSalesUom: formValues.defaultSalesUom,      currentstock:formValues.currentstock,             
      baseUom: formValues.baseUom,
      customAttributes: {
        tier_prices: tierPrices 
      }    
    };

    const saveObservable = this.opMode === FormOpMode.Update 
      ? this.productService.updateProduct(createDto)
      : this.productService.createProduct(createDto);

    saveObservable.subscribe({
      next: (res) => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Saved', 
          detail: this.opMode === FormOpMode.Update ? 'Product updated successfully' : 'Product saved successfully' 
        });
        this.onSaveSuccess.emit();
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save product' });
        this.onSaveFailure.emit(this.opMode);
      }
    });
  }

  clearProduct() {
    this.model = { prodName: '', description: '', sku: '', basePrice: 0, categoryId: null, hsnId: null };
    if (this.form) {
      this.form.reset();
    }
  }

  CancelFormOp() {
    this.onCancel.emit();
  }
}
