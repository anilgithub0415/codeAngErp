import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';

import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';

import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { Sales } from '../../../core/models/sales.model';
import { SalesService } from '../../../core/services/sales.service';
import { combineLatest, distinctUntilChanged, firstValueFrom, startWith, tap } from 'rxjs';
import { chainOnInitHook, hydrateFormlyConfig, injectSalesUomMatrixListeners } from '../../../shared/utils/hydrationOfFormlyJson';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { typeaheadSearchExtension } from '../../../shared/components/formlyfields/typeaheadSearchExtension';

@Component({
  selector: 'app-salesorder',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, FormlyModule, CommonModule, 
    TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule,
    DatePickerModule, FilterControlComponent
  ],
  templateUrl: './salesorder.component.html',
  styleUrl: './salesorder.component.scss',
  providers: [MessageService]
})
export class SalesorderComponent implements OnInit {
  tenantId!: number; 
  SOs: Sales[] | undefined = []; 
  visibleDataArray!: any[];
  expandedRows: { [id: number]: boolean } = {};
  currOpMode: FormOpMode = FormOpMode.View; 
  isFormHidden: boolean = true;
  form = new FormGroup({});
  
  // Enforces perfect structural compatibility with the SalesOrder entity definition
  model: any = { 
    id: null,
    tenantId: 0,
    soNumber: '', 
    clientId: null, 
    siteId: null,
    status: 'DRAFT',
    subTotal: 0,
    taxAmount: 0,
    shippingAmount: 0,
    totalAmount: 0,
    items: [{ 
      productId: null, 
      productVariantId: null, 
      quantity: 1, 
      finalPrice: 0, 
      salesUom: '', 
      sku: '', 
      prodName: '',
      customAttributes: null 
    }] 
  };

  totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
  private formlyConfig = inject(FormlyConfig);
  aForm!: any;
  raw: any;

  private formService = inject(FormService);
  private productService = inject(ProductService); 
  private authServ = inject(AuthService);
  private salesService = inject(SalesService);
  private messageService = inject(MessageService);

  fields: FormlyFieldConfig[] = [];

  constructor() {}

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;

    this.form.valueChanges?.subscribe(() => this.computeTotals());
    
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });

    this.formlyConfig.setType({
      name: 'primeng-dropdown',
      component: FormlyFieldPrimengDropdownComponent,
    });

    this.formlyConfig.setType({
      name: 'p-repeatsectionformly',
      component: RepeatsectionformlyComponent
    });

    this.formlyConfig.setType({
      name: 'custom', 
      component: FormlyCustomRowBridgeComponent
    });

    this.gerForm_SO();
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  gerForm_SO() {
    this.raw = [
      { "key": "id", "type": "input", "hide": true },
      { "key": "createdByUserId", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "soNumber",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Sales Order#", 
              "readonly": true,
              "placeholder": "SO#"
            }
          },
          {
            "type": "primeng-dropdown",
            "key": "clientId", 
            "className": "col-span-12 md:col-span-10",
            "props": {
              "label": "Lead / Customer",
              "valueProp": "value", 
              "styleClass": "w-full", 
              "labelProp": "label",
              "optionLabel": "label",
              "optionValue": "value",
              "placeholder": "Select Customer",
              "lookupKey": "customerTypes", 
              "required": true,
              "filter": true
            }
          },
          {
            "type": "input",
            "key": "status",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Status",
              "placeholder": "Status",
              "required": true
            }
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
          "addText": "Add Line Item",
          "rowDefaults": { "quantity": "1" }
        },
        "fieldArray": {
          "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
          "fieldGroup": [
            { "key": "id", "type": "input", "hide": true },
            {
              "type": "primeng-dropdown",
              "key": "productId",
              "className": "col-span-24 md:col-span-6",
              "props": {
                "optionLabel": "label",
                "optionValue": "value",
                "placeholder": "Select Item",
                "lookupKey": "productTypes",
                "required": true,
                "filter": true
              },
              "expressions": {
                "props.label": "field.parent.index === 0 ? 'Item' : ''"
              },
              "hooks": {
                "onInit": "onProductDropdownChange"
              }
            },
            {
              "type": "input",
              "key": "quantity",
              "className": "col-span-24 md:col-span-3",
              "props": {
                "type": "number",
                "placeholder": "Qty",
                "required": true
              },
              "expressions": {
                "props.label": "field.parent.index === 0 ? 'Quantity' : ''"
              }
            },
            {
              "type": "primeng-dropdown", 
              "key": "salesUom",
              "className": "col-span-24 md:col-span-4",
              "props": {
                "optionLabel": "label",
                "optionValue": "value",
                "placeholder": "Select UOM",
                "filter": true,
                "required": true,
                "options": []
              },
              "expressions": {
                "props.label": "field.parent.index === 0 ? 'Sales Unit' : ''"
              }
            },
            {
              "type": "input",
              "key": "finalPrice",
              "className": "col-span-24 md:col-span-3",
              "props": {
                "type": "number",
                "placeholder": "Price",
                "required": true
              },
              "expressions": {
                "props.label": "field.parent.index === 0 ? 'Final Price' : ''"
              }
            }
          ]
        }
      },
      {
        "type": "button",
        "className": "col-span-24 md:col-span-4 mt-4",
        "props": {
          "text": "Save Sales Order",
          "type": "submit",
          "styleClass": "p-button-success"
        }
      }
    ];

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 

    this.bindDatabaseHooks(this.fields);
    injectSalesUomMatrixListeners(this.fields, this.salesService, this.tenantId);
    this.applyLocalSearchExtension(this.fields);

    this.formService.getForm(this.tenantId!, 'customer_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });

    this.gerSOList().then(sos => {
      this.SOs = sos;   
      this.visibleDataArray = [...this.SOs!];
    }).catch(err => console.error('Error:', err));
  }
  gerSOList(): Promise<any[]> {
    const observable$ = this.salesService.getSOs(this.tenantId).pipe(
      tap((sos: any) => {
        this.SOs = sos;
      })
    );
    return firstValueFrom(observable$);
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
  
    this.model = { 
      tenantId: this.tenantId,
      soNumber: '', 
      clientId: null, 
      siteId: null,   
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: null,
      status: 'DRAFT',
      subTotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: 0,
      notes: '',
      items: [{ productId: null, productVariantId: null, quantity: 1, finalPrice: 0, salesUom: '', sku: '', prodName: '', customAttributes: null }] 
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
    console.log('Selected record context targeted for update:', selectedRecord);
    this.model = JSON.parse(JSON.stringify(selectedRecord));
  }

  onProductAdded(product: any) {
    this.addProductToOrder(product);
  }

  async addProductToOrder(product: any) {
    if (!product) return;

    const productId = product?.id ?? product?.value ?? product?.sku ?? product?.code ?? product?.prodName ?? product?.name ?? String(product);
    if (this.model.items?.find((l: any) => l.productId === productId)) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'Product already added to order' });
      return;
    }

    if (!this.model.items) this.model.items = [];

    const basePrice = product?.basePrice ?? product?.price ?? 0;
    const finalPrice = await this.getProductFinalPrice(productId, this.model.clientId || 0);

    this.model.items.push({
      productId,
      productVariantId: null,
      prodName: product?.prodName ?? product?.name ?? product?.label ?? String(product),
      sku: product?.sku ?? product?.code ?? '',
      finalPrice,
      quantity: 1,
      salesUom: product?.defaultSalesUom || product?.baseUom || 'PCS',
      lineTotal: basePrice
    });

    this.form.patchValue({ items: this.model.items });
    this.computeTotals();
    this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Product added to order' });
  }

  removeLine(index: number) {
    this.model.items.splice(index, 1);
    this.form.patchValue({ items: this.model.items });
    this.computeTotals();
  }

  updateLineTotal(line: any) {
    line.lineTotal = +(line.quantity * line.finalPrice).toFixed(2);
    this.computeTotals();
  }

  async saveSales() {
    console.log('Current sales saving context:', this.model);
    
    if (!this.model.clientId || !this.model.items?.length) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Customer selection and at least one line item row are required.' 
      });
      return;
    }

    this.model.tenantId = this.tenantId;

    this.computeTotals();
    this.model.subTotal = this.totals.subTotal;
    this.model.taxAmount = this.totals.taxTotal;
    this.model.totalAmount = this.totals.grandTotal;

    try {
      if (this.currOpMode === FormOpMode.Update) {
        console.log(`Executing PUT call on Sales Order ID: ${this.model.id}`);
        await firstValueFrom(this.salesService.updateSalesOrder(this.model.id, this.model));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Sales Order updated successfully' });
      } else {
        console.log('Executing POST call on a clean Sales Order');
        await firstValueFrom(this.salesService.createSalesOrder(this.model));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Sales Order generated successfully' });
      }

      this.gerSOList().then(sos => {
        this.SOs = sos;   
        this.visibleDataArray = [...this.SOs!];
      });

      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
    } catch (error: any) {
      console.error('Transactional save failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Save Failed', 
        detail: error.message || 'Failed to persist sales order context' 
      });
    } 
  }

  clearSales() {
    this.model = { 
      soNumber: '', 
      clientId: null,
      siteId: null,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: null,
      status: 'DRAFT',
      subTotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: 0,
      notes: '',
      items: [] 
    };
    this.totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
    this.form.reset();
  }

  async getProductFinalPrice(prodId: number, clientId: number): Promise<any> {
    const p = await firstValueFrom(this.productService.getProduct(this.tenantId, prodId));
    return new Promise((resolve) => {
      this.productService.getProductFinalPrice(prodId, this.tenantId, p, clientId).subscribe(afinalPrice => {
        console.log('Resolved tier pricing lookup value:', afinalPrice);
        resolve(afinalPrice);
      });
    });
  }

  computeTotals() {
    const items = this.model.items || [];
    let sub = 0;
    for (const l of items) {
      const qty = Number(l.quantity || 0);
      const base = Number(l.finalPrice || 0);
      l.lineTotal = +(qty * base).toFixed(2);
      sub += l.lineTotal;
    }
    this.totals.subTotal = +(sub).toFixed(2);
    this.totals.taxTotal = +(this.totals.subTotal * 0).toFixed(2);
    this.totals.grandTotal = +(this.totals.subTotal + this.totals.taxTotal + Number(this.model.shippingAmount || 0)).toFixed(2);
  }

  private applyLocalSearchExtension(fields: FormlyFieldConfig[]) {
    fields.forEach(field => {
      if (field.props && field.props['searchable']) {
        field.wrappers = [...(field.wrappers || []), 'typeahead-wrapper'];
        typeaheadSearchExtension(field);
      }
      if (field.fieldGroup) {
        this.applyLocalSearchExtension(field.fieldGroup);
      }
    });
  } 
    
  bindDatabaseHooks(fields: FormlyFieldConfig[]) {
    if (!fields) return;

    fields.forEach((field) => {
      if (field.fieldGroup && Array.isArray(field.fieldGroup)) {
        this.bindDatabaseHooks(field.fieldGroup);
      }

      if (field.key === 'items' && field.fieldArray) {
        const arrayConfig = field.fieldArray as FormlyFieldConfig;

        if (arrayConfig && arrayConfig.fieldGroup && Array.isArray(arrayConfig.fieldGroup)) {
          const productDropdown = arrayConfig.fieldGroup.find(f => f.key === 'productId');

          if (productDropdown && productDropdown.hooks && typeof productDropdown.hooks.onInit === 'string') {
            const originalToken = productDropdown.hooks.onInit;

            if (originalToken === 'onProductDropdownChange') {
              chainOnInitHook(productDropdown, (targetField: FormlyFieldConfig) => {
                if (!targetField || !targetField.formControl) return;

                const rootForm = targetField.form?.root;
                const clientIdControl = rootForm?.get('clientId');

                if (!clientIdControl) {
                  console.warn('clientId control not found at form root level');
                  return;
                }

                combineLatest([
                  targetField.formControl.valueChanges.pipe(startWith(targetField.formControl.value)),
                  clientIdControl.valueChanges.pipe(startWith(clientIdControl.value))
                ]).pipe(
                  distinctUntilChanged((prev, curr) => prev[0] === curr[0] && prev[1] === curr[1])
                ).subscribe(async ([prodId, clientId]) => {
                  if (!prodId || !clientId) return;

                  try {
                    console.log(`Fetching price pipeline data for Product: ${prodId} and Customer: ${clientId}`);
                    const finalPriceData = await this.getProductFinalPrice(prodId, clientId);
                    const finalPriceControl = targetField.parent?.formControl?.get('finalPrice');
                    
                    if (finalPriceControl) {
                      finalPriceControl.setValue(
                        finalPriceData?.calculatedPrice !== undefined ? finalPriceData.calculatedPrice : finalPriceData, 
                        { emitEvent: true, onlySelf: true }
                      );
                    }
                  } catch (error) {
                    console.error('Database configuration pipeline failure:', error);
                  }
                });
              });
            }
          }
        }
      }
    });
  }
}
