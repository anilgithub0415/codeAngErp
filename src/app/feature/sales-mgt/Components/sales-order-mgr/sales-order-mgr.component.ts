
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { combineLatest, distinctUntilChanged, firstValueFrom, startWith, tap } from 'rxjs';

import { Sales } from '../../../../core/models/sales.model';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { SalesService } from '../../../../core/services/sales.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormService } from '../../../../core/services/form.service';
import { ProductService } from '../../../../core/services/product.service';

import { FormlyFieldPrimengDropdownComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { RepeatsectionformlyComponent } from '../../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCardWrapperComponent } from '../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyCustomRowBridgeComponent } from '../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';

import { bindDatabaseHooks, chainOnInitHook, hydrateFormlyConfig, injectSalesUomMatrixListeners } from '../../../../shared/utils/hydrationOfFormlyJson';
import { typeaheadSearchExtension } from '../../../../shared/components/formlyfields/typeaheadSearchExtension';
import { FilterControlComponent } from '../../../../shared/components/filter-control/filter-control.component';
import { ButtonTabsComponent, TabDirective } from '../../../../shared/components/button-tabs/button-tabs.component';
import { ClientpurchaselistComponent } from '../../../clientportal/clientpurchaselist/clientpurchaselist.component';
import { NgxPermissionsModule } from 'ngx-permissions';

import { SalesOrderGridComponent } from '../sales-order-grid/sales-order-grid.component';
import { SalesOrderFormComponent } from '../sales-order-form/sales-order-form.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-salesorder-mgr',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, ToastModule, ConfirmDialogModule,ButtonModule,
    FilterControlComponent, ButtonTabsComponent, TabDirective, NgxPermissionsModule,
    ClientpurchaselistComponent, SalesOrderGridComponent, SalesOrderFormComponent
  ],
  templateUrl: './sales-order-mgr.component.html',
  styleUrl: './sales-order-mgr.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class SalesOrderMgrComponent implements OnInit {
  tenantId!: number; 
  SOs: Sales[] | undefined = []; 
  visibleDataArray!: any[];
  expandedRows: { [id: number]: boolean } = {};
  currOpMode: FormOpMode = FormOpMode.View; 
  isFormHidden: boolean = true;
  form = new FormGroup({});
  
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
    items: [{ productId: null, productVariantId: null, quantity: 1, finalPrice: 0, salesUom: '', sku: '', prodName: '', customAttributes: null }] 
  };

  totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
  fields: FormlyFieldConfig[] = [];
  myTabConfig: any;
  raw: any;
  aForm!: any;

  private formlyConfig = inject(FormlyConfig);
  private formService = inject(FormService);
  private productService = inject(ProductService); 
  private authServ = inject(AuthService);
  private salesService = inject(SalesService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.form.valueChanges?.subscribe(() => this.computeTotals());
    
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });

    this.myTabConfig = [
      { label: 'Sales Orders', id: 'salesorders' },
      { label: 'Approval Pending Client Purchase Orders', id: 'clientpos'}
    ];

    this.gerForm_SO();
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  gerForm_SO() {
    // this.raw = [
    //   { "key": "id", "type": "input", "hide": true },
    //   { "key": "createdByUserId", "type": "input", "hide": true },
    //   { "key": "tenantId", "type": "input", "hide": true },
    //   {
    //     "wrappers": ["panel"],
    //     "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
    //     "fieldGroup": [
    //       { "type": "input", "key": "soNumber", "className": "col-span-12 md:col-span-4", "props": { "label": "Sales Order#", "readonly": true, "placeholder": "SO#" } },
    //       { "type": "primeng-dropdown", "key": "clientId", "className": "col-span-12 md:col-span-10", "props": { "label": "Lead / Customer", "valueProp": "value", "styleClass": "w-full", "labelProp": "label", "optionLabel": "label", "optionValue": "value", "placeholder": "Select Customer", "lookupKey": "customerTypes", "required": true, "filter": true } },
    //       { "type": "input", "key": "status", "className": "col-span-12 md:col-span-4", "props": { "label": "Status", "placeholder": "Status", "required": true } }
    //     ]
    //   },
    //   {
    //     "key": "items",
    //     "type": "p-repeatsectionformly",
    //     "wrappers": ["panel"],
    //     "defaultValue": [],
    //     "props": { "label": "", "addText": "Add Line Item", "rowDefaults": { "quantity": "1" } },
    //     "fieldArray": {
    //       "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
    //       "fieldGroup": [
    //         { "key": "id", "type": "input", "hide": true },
    //         { "type": "primeng-dropdown", "key": "productId", "className": "col-span-24 md:col-span-6", "props": { "optionLabel": "label", "optionValue": "value", "placeholder": "Select Item", "lookupKey": "productTypes", "required": true, "filter": true }, "expressions": { "props.label": "field.parent.index === 0 ? 'Item' : ''" }, "hooks": { "onInit": "onProductDropdownChange" } },
    //         { "type": "input", "key": "quantity", "className": "col-span-24 md:col-span-3", "props": { "type": "number", "placeholder": "Qty", "required": true }, "expressions": { "props.label": "field.parent.index === 0 ? 'Quantity' : ''" } },
    //         { "type": "primeng-dropdown", "key": "salesUom", "className": "col-span-24 md:col-span-6", "props": { "optionLabel": "label", "optionValue": "value", "placeholder": "Select UOM", "filter": true, "required": true, "options": [] }, "expressions": { "props.label": "field.parent.index === 0 ? 'Sales Unit' : ''" } },
    //         { "type": "input", "key": "finalPrice", "className": "col-span-24 md:col-span-3", "props": { "type": "number", "placeholder": "Price", "required": true }, "expressions": { "props.label": "field.parent.index === 0 ? 'Final Price' : ''" } }
    //       ]
    //     }
    //   },
    //   { "type": "button", "className": "col-span-24 md:col-span-4 mt-4", "props": { "text": "Save Sales Order", "type": "submit", "styleClass": "p-button-success" } }
    // ];


    this.formService.getForm(this.tenantId!, 'sales_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 

    bindDatabaseHooks(this.productService,this.tenantId,this.fields);
    injectSalesUomMatrixListeners(this.fields, this.salesService, this.tenantId);
    this.applyLocalSearchExtension(this.fields);
    });

    this.refreshSOList();
  }

  refreshSOList() {
    this.salesService.getSOs(this.tenantId).pipe(
      tap((sos: any) => {
        this.SOs = sos;
        this.visibleDataArray = [...this.SOs!];
      })
    ).subscribe({ error: (err) => console.error('Error:', err) });
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
  
    this.model = { 
      tenantId: this.tenantId, soNumber: '', clientId: null, siteId: null,   
      orderDate: new Date().toISOString().substring(0, 10), deliveryDate: null, status: 'DRAFT',
      subTotal: 0, taxAmount: 0, shippingAmount: 0, totalAmount: 0, notes: '',
      items: [{ productId: null, productVariantId: null, quantity: 1, finalPrice: 0, salesUom: '', sku: '', prodName: '', customAttributes: null }] 
    };
    this.form.reset();
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }

  onEditClick(selectedRecord: any) {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update;
    this.model = JSON.parse(JSON.stringify(selectedRecord));
  }
  async saveSales() {
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
        await firstValueFrom(this.salesService.updateSalesOrder(this.model.id, this.model));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Sales Order updated successfully' });
      } else {
        await firstValueFrom(this.salesService.createSalesOrder(this.model));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Sales Order generated successfully' });
      }

      this.refreshSOList();
      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
    } catch (error: any) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Save Failed', 
        detail: error.message || 'Failed to persist sales order context' 
      });
    } 
  }

  async handleFinalize(payload: any): Promise<void> {
  try {
    let targetId = payload.id;
    
    // Save draft edits first if editing
    if (this.currOpMode === FormOpMode.Update && targetId) {
      await firstValueFrom(this.salesService.updateSalesOrder(targetId, payload));
    } else if (!targetId) {
      const freshSo = await firstValueFrom(this.salesService.createSalesOrder(payload));
      targetId = freshSo.id;
    }

    await firstValueFrom(this.salesService.submitSalesForApproval(targetId));
   // this.showToast('success', 'Submitted', 'Sales order sent to approval loop.');
    this.currOpMode = FormOpMode.View;
    this.refreshSOList();
  } catch (error: any) {
    //this.showToast('error', 'Error', error.message || 'Submission failed.');
  }
}

async handleApprove(soId: number): Promise<void> {
  try {
    await firstValueFrom(this.salesService.approveSalesOrder(soId));
   // this.showToast('success', 'Approved', 'Sales order approved and product inventory balances deducted.');
    this.currOpMode = FormOpMode.View;
    this.refreshSOList();
  } catch (error: any) {
  //  this.showToast('error', 'Stock Allocation Failed', error.message || 'Could not approve order.');
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



  
  onDeleteRequested(so: any) { console.log('trying to deelete SO.........',so.id);
  
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${so.id}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.salesService.deleteSalesOrder(so.id).subscribe({
          next: () => {
            this.SOs = this.SOs!.filter(s => s.id !== so.id);
            this.visibleDataArray = this.visibleDataArray.filter(p => p.id !== so.id);
            
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

