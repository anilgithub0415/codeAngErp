import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
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
import { PurchaseService, TenantRulesMatrixResponse } from '../../../core/services/purchase.service';
import { VendorService } from '../../../core/services/vendor.service';
import { FormlyFieldProductsearch } from '../../../shared/components/formlyfields/productsearch/productsearch.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { typeaheadSearchExtension } from '../../../shared/components/formlyfields/typeaheadSearchExtension';
import { FORMLY_ROW_REGISTRY } from '../../customer-mgt/formly-registry';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { Purchase } from '../../../core/models/purchase.model';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyFieldPrimengDatepickerComponent } from '../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { hydrateFormlyConfig, injectPurchaseUomMatrixListeners } from '../../../shared/utils/hydrationOfFormlyJson';
import { firstValueFrom } from 'rxjs';
import { SplitterModule } from 'primeng/splitter';

import { SidebarModule } from 'primeng/sidebar';
import { TabsModule } from 'primeng/tabs';
import { SelectButtonModule } from 'primeng/selectbutton';
import { NgxPermissionsModule } from 'ngx-permissions';


@Component({
  selector: 'app-purchase-order'
  ,schemas:[CUSTOM_ELEMENTS_SCHEMA] ,standalone:true,
  imports: [ReactiveFormsModule, FormsModule, FormlyModule,CommonModule, 
    TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ,DatePickerModule, FormlyPrimeNGModule,FormlyModule,SplitterModule, SelectButtonModule, NgxPermissionsModule
  ],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.scss',
   providers: [MessageService]
})
export class PurchaseOrderComponent implements OnInit {
  tenantId!:number; POs: Purchase[] |undefined = [] ; 
   expandedRows: { [id: number]: boolean } = {};
  currOpMode: FormOpMode = FormOpMode.View; isFormHidden:boolean=true;
   form = new FormGroup({});
  model: any = { 
    tenantId:0,
    poNumber: '', 
    vendorId: null,
    vendor: null,
    orderDate: new Date().toISOString().substring(0,10),
    deliveryDate: null,
    status: 'DRAFT',
    totalAmount: 0,
    notes: '',
    items: [{productId:0,quantity:0,finalPrice:0}] 
  };

  totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
  private formlyConfig = inject(FormlyConfig);
aForm!:any;
  raw:any;

   private formService=inject(FormService);
    private productService=inject(ProductService); 
  private authServ=inject(AuthService);
    private purchaseService=inject(PurchaseService);
    private vendorService=inject(VendorService);
    private messageService=inject(MessageService);

 fields: FormlyFieldConfig[] = [];
  constructor(private cd:ChangeDetectorRef
   
  ) {}

  ngOnInit(): void {
       this.tenantId = this.authServ.getTenantId()!;   // <-- store once

       // Recompute totals when form value changes
    this.form.valueChanges?.subscribe(() => this.computeTotals());
       this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),

       this.formlyConfig.setType({
              name: 'primeng-dropdown',
              component: FormlyFieldPrimengDropdownComponent,
            });
         this.formlyConfig.setType({
              name: 'datepicker',
              component: FormlyFieldPrimengDatepickerComponent,
            });
    
              this.formlyConfig.setType({
                 name: 'p-repeatsectionformly',
                 component: RepeatsectionformlyComponent
               });

              this.formlyConfig.setType({
                name:'custom',component:FormlyCustomRowBridgeComponent
              })
  this.getForm_PO(); 
    this.getPOList();
  

  

              }
  getForm_PO(){
 //formkey:customer_form
  
 //var raw:any;
    //  this.formService.getForm(this.tenantId!,'customer_form').subscribe(aform=>{
       
       
    //    this.aForm=aform; 
      
     
      
       
    //     this.raw=JSON.parse(this.aForm.FormlyConfig) ;
        
    //  })
   
     //without $index and rowtemplate
//      this.raw=[
//   { "key": "id", "type": "input", "hide": true },
//   { "key": "createdByUserId", "type": "input", "hide": true },
//   { "key": "tenantId", "type": "input", "hide": true },
 

//   {
//     "wrappers": ["panel"],
//     "className": "col-span-24 w-full block mb-0",
//     "props": {
//      // "label": "PO Information"
//         },
//     "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
   
//     "fieldGroup": [
//        {
//     "type": "input",
    
//     "key": "poNumber",
//         "className": "col-span-6 md:col-span-4",
//     "props": {
//       "label": "Purchase Order#", "readonly": true,
//       "placeholder": "PO#",
//      // "required": true
//     }
//   },
//     {
//         "type": "primeng-dropdown",
//         "key": "vendorId",
//         "className": "col-span-12 md:col-span-6",
//         "props": {
//           "label": "Vendor:",
//           "optionLabel": "label",
//           "optionValue": "value",
//           "placeholder": "Select Vendor",
//           "lookupKey": "vendorTypes",
//           "filter": true,
//       "required": true
//         }
//       },
      
//       {
//   "type": "datepicker",
//   "key": "orderDate",
//         "className": "col-span-12 md:col-span-6",
//   "props": {
//     "label": "Order Date",
//      "dateFormat": "dd-mm-yy",
//     "numberOfMonths": 1,
//     "selectionMode": "single"
//   }
// }


//     ]
//   },

//   {
//     "key": "items",
//     "type": "p-repeatsectionformly",
//     "wrappers": ["panel"],
//     "defaultValue": [],
//     "props": {
//       "label": "",
//       "addText": "Add Organisation",
//       "rowDefaults":{"quantity":"1"} 
//         },
//     "fieldArray": {
//       "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
//       "fieldGroup": [
//         { "key": "id", "type": "input", "hide": true },
        
//            {
//                     "type": "primeng-dropdown",
//                     "key": "productId",
//                     "className": "col-span-6 md:col-span-11",
//                     "props": {
//                         //"label": "Item",
//                         "optionLabel": "label",
//                         "optionValue": "value",
//                         "placeholder": "Select Item",
//                         "lookupKey": "productTypes", // conditional:productTypesWithVariants
//                         "required": true,
//                         "filter": true,
//                         // Add variant display in dropdown
//                         "optionDisabled": (option: any) => !option.variants?.length
//                     },
//                     "expressions": {
//                       "props.label": "field.parent.index === 0 ? 'Item' : ''"
//                       }
//                 },
        
//         {
//           "type": "input",
//           "key": "quantity",
//           "className": "col-span-3 md:col-span-3",
//           "props": {
//            // "label": "Quantity",
//             "placeholder": "Enter name",
//             "required": true
//           },
//                     "expressions": {
//                       "props.label": "field.parent.index === 0 ? 'Quantity' : ''"
//                       }
//         },
        
// //         {
// //   "type": "primeng-dropdown",
// //   "key": "purchaseUom",
// //   "className": "col-span-12 md:col-span-6",
// //   "props": {
// //     "label": "Purchase UOM:",
// //     "optionLabel": "label",
// //     "optionValue": "value",
// //     "placeholder": "Select UOM",
// //     "filter": true,
// //     "required": true,
// //     "options": [] // 🌟 Starts empty, populated dynamically at runtime
// //   }
// // }
// ,
//         {
//         "type": "primeng-dropdown",
//         "key": "vendorId",
//         "className": "col-span-12 md:col-span-6",
//         "props": {
//           "label": "Vendor:",
//           "optionLabel": "label",
//           "optionValue": "value",
//           "placeholder": "Select Vendor",
//           "lookupKey": "vendorTypes",
//           "filter": true,
//       "required": true
//         }
//       },
//         {
//           "type": "input",
//           "key": "finalPrice",
//           "className": "col-span-3 md:col-span-4",
//           "props": {
//            // "label": "Price",
//             "placeholder": "Enter finalPrice",
//             "required": true
//           },
//             "expressions": {
//                  "props.label": "field.parent.index === 0 ? 'Price' : ''"
//              }
//         },
        
//       ]
//     }
//   },
//   {
//     "type": "button",
//     "className": "col-span-3 md:col-span-3 mt-4",
//     "props": {
//       "text": "Save PO",
//       "type": "submit",
//       "styleClass": "p-button-success"
//     }
//   }
// ]
this.raw=[
  { "key": "id", "type": "input", "hide": true },
  { "key": "createdByUserId", "type": "input", "hide": true },
  { "key": "tenantId", "type": "input", "hide": true },
  {
    "wrappers": ["panel"],
    "className": "col-span-24 w-full block mb-0",
    "props": {
     // "label": "PO Information"
        },
    "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
   
    "fieldGroup": [
       {
    "type": "input",
    
    "key": "poNumber",
        "className": "col-span-6 md:col-span-4",
    "props": {
      "label": "Purchase Order#", "readonly": true,
      "placeholder": "PO#",
     // "required": true
    }
  },
    {
        "type": "primeng-dropdown",
        "key": "vendorId",
        "className": "col-span-12 md:col-span-9",
        "props": {
          "label": "Vendor:",
          "optionLabel": "label",
          "optionValue": "value",
          "placeholder": "Select Vendor",
          "lookupKey": "vendorTypes",
          "filter": true,
      "required": true
        }
      },
      
      {
  "type": "datepicker",
  "key": "orderDate",
        "className": "col-span-12 md:col-span-6",
  "props": {
    "label": "Order Date",
     "dateFormat": "dd-mm-yy",
    "numberOfMonths": 1,
    "selectionMode": "single"
  }
}


    ]
  },{
    "key": "items",
    "type": "p-repeatsectionformly",
    "wrappers": ["panel"],
    "defaultValue": [],
    "props": {
      "label": "",
      "addText": "Add Organisation",
      "rowDefaults":{"quantity":"1"} 
        },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
      "fieldGroup": [
        { "key": "id", "type": "input", "hide": true },
        
           {
                    "type": "primeng-dropdown",
                    "key": "productId",
                    "className": "col-span-6 md:col-span-7",
                    "props": {
                        "label": "Item",
                        "optionLabel": "label",
                        "optionValue": "value",
                        "placeholder": "Select Item",
                        "lookupKey": "productTypes", // conditional:productTypesWithVariants
                        "required": true,
                        "filter": true,
                        // Add variant display in dropdown
                        "optionDisabled": (option: any) => !option.variants?.length
                    },
                    "expressions": {
                      "props.label": "field.parent.index === 0 ? 'Item' : ''"
                      }
                },
          // {
          //   key: 'productVariantId',
          //   type: 'primeng-dropdown',
          //   className: 'col-span-12 md:col-span-6',
          //   templateOptions: {
          //     label: 'Select Target Product',
          //     placeholder: '-- Search Product --',
          //     required: true,
          //     lookupKey: 'productTypesWithVariants' // or productTypesWithVariants
          //   }
          // },
        
        {
          "type": "input",
          "key": "quantity",
          "className": "col-span-3 md:col-span-2",
          "props": {
           // "label": "Quantity",
            "placeholder": "Enter name",
            "required": true
          },
                    "expressions": {
                      "props.label": "field.parent.index === 0 ? 'Quantity' : ''"
                      }
        },
  
  
        {
  "type": "primeng-dropdown",
  "key": "purchaseUom",
  "className": "col-span-12 md:col-span-6",
  "props": {
    //"label": "Purchase UOM:",
    "optionLabel": "label",
    "optionValue": "value",
    "placeholder": "Select UOM",
    "filter": true,
    "required": true,
    "options": [] // 🌟 Starts empty, populated dynamically at runtime
  },
                    "expressions": {
                      "props.label": "field.parent.index === 0 ? 'Purchase UOM:' : ''"
                      }
},
        {
          "type": "input",
          "key": "finalPrice",
          "className": "col-span-3 md:col-span-3",
          "props": {
           // "label": "Price",
            "placeholder": "Enter finalPrice",
            "required": true
          },
            "expressions": {
                 "props.label": "field.parent.index === 0 ? 'Price' : ''"
             }
        },
        
      ]
    }
  },
  {
    "type": "button",
    "className": "col-span-3 md:col-span-3 mt-4",
    "props": {
      "text": "Save PO",
      "type": "submit",
      "styleClass": "p-button-success"
    }
  }
]

      /*  const hydrated = hydrateFormlyConfig(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
        injectPurchaseUomMatrixListeners(this.fields,this.purchaseService,this.tenantId)
        //this.applyLocalSearchExtension(this.fields);
    */
   const hydrated = hydrateFormlyConfig(this.raw);
this.fields = hydrated; 
console.log('Form configuration blueprint parsed safely.');

// 1. Locate the dynamic repeating array section configuration
const itemsSection = this.fields.find(f => f.key === 'items');

// 2. Apply a strict type-guard check ensuring fieldArray is a valid object and not a function
if (itemsSection && itemsSection.fieldArray && typeof itemsSection.fieldArray === 'object') {
  
  // TypeScript now safely knows 'fieldArray' is an object and contains 'fieldGroup'
  const groupFields = itemsSection.fieldArray.fieldGroup || [];
  const uomField = groupFields.find(f => f.key === 'purchaseUom');

  if (uomField) {
    uomField.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        const parentGroup = field.parent;
        if (!parentGroup) return;

        const rowProductField = parentGroup.fieldGroup?.find(f => f.key === 'productId');
        
        // Context A: AUTOMATED EDIT MODE INITIAL HYDRATION
        const currentProductId = parentGroup.model?.productId;
        const currentVariantId = parentGroup.model?.productVariantId || 0;

        if (currentProductId) {
          this.purchaseService.fetchTenantRulesMatrix(this.tenantId, currentProductId, currentVariantId)
            .subscribe({
              next: (matrixResponse: TenantRulesMatrixResponse) => {
                if (field.props && matrixResponse?.availablePurchaseUnits) {
                  field.props.options = matrixResponse.availablePurchaseUnits;
                  this.cd.detectChanges();
                }
              },
              error: (err) => console.error('Failed matrix load on edit initial initialization:', err)
            });
        }

        // Context B: RUNTIME INTERACTIVE VALUE SELECTION CHANGED
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
                next: (matrixResponse: TenantRulesMatrixResponse) => {
                  if (field.props && matrixResponse?.availablePurchaseUnits) {
                    field.props.options = matrixResponse.availablePurchaseUnits;
                    
                    const currentUomValue = field.formControl?.value;
                    const choiceExists = matrixResponse.availablePurchaseUnits.some(u => u.value === currentUomValue);
                    if (!choiceExists) {
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


   //=========================================================================================
   /**
 * Safe processing engine traversing the hydrated formly fields 
 * to inject lifecycle runtime hooks into your repeated fields grid.
 * Put this method directly inside your PurchaseOrderComponent class.
 */
/**
 * Safe processing engine traversing the hydrated formly fields 
 * to inject lifecycle runtime hooks into your repeated fields grid.
 * const uomField = groupFields.find(f => f.key === 'purchaseUom');
 */

   //=========================================================================================


  getPOList(){
    this.purchaseService.getPOs(this.tenantId).subscribe(pos=>{
      this.POs=pos; 
        console.log(pos);
        
      
    })
  }
  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    
    // Explicitly reset form array trees to ensure clean data isolation
    this.form.reset();

    this.model = { 
      id: 0, // Identifies a completely fresh transaction instance
      tenantId: this.tenantId,
      poNumber: '', 
      vendorId: null,
      vendor: null,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: null,
      status: 'DRAFT',
      totalAmount: 0,
      notes: '',
      items: [] // Initialize as clean array ready for dynamic Formly rows
    };
    
    this.totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
    this.cd.detectChanges();
  }async onEditClick(selectedRecord: any) {
  this.isFormHidden = false;
  this.currOpMode = FormOpMode.Update;
  localStorage.setItem('currOpMode', this.currOpMode);

  // 1. Fully rebuild the core layout tree container to shed memory remnants
  this.form = new FormGroup({}); 

  // 2. Clone database payload securely 
  const clonedRecord = JSON.parse(JSON.stringify(selectedRecord));
  this.model = {
    ...clonedRecord,
    items: clonedRecord.items || []
  };

  console.log('Model snapshot assigned cleanly:', this.model);

  // 3. Extend interval window to 100ms so Angular finishes rendering repeat nodes
  setTimeout(() => {
    try {
      this.form.patchValue(this.model);
      this.computeTotals();
      console.log('Form values synchronized across dynamic array matrices.');
    } catch (error) {
      console.error('Patch application tracking error:', error);
    }
    this.cd.detectChanges();
  }, 100);
}

  async addProductToOrder(product: any) {
    if (!product) return;

    const productId = product?.id ?? product?.value ?? product?.sku ?? product?.code ?? product?.prodName ?? product?.name ?? String(product);
    
    // Unified array structure: changed from '.lines' to strict '.items' validation checks
    if (this.model.items?.find((l: any) => l.productId === productId)) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'Product already added to order lines.' });
      return;
    }

    if (!this.model.items) this.model.items = [];

    const basePrice = product?.basePrice ?? product?.price ?? 0;
    const finalPrice = await this.getProductFinalPrice(productId, product);

    this.model.items.push({
      productId,
      productName: product?.prodName ?? product?.name ?? product?.label ?? String(product),
      sku: product?.sku ?? product?.code ?? '',
      quantity: 1, // Matches DTO input tracking property
      price: basePrice,
      finalPrice: finalPrice,
      lineTotal: basePrice
    });

    this.form.patchValue({ items: this.model.items });
    this.computeTotals();
    this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Product added to purchase sequence.' });
  }

  removeLine(index: number) {
    this.model.items.splice(index, 1);
    this.form.patchValue({ items: this.model.items });
    this.computeTotals();
  }

  updateLineTotal(line: any) {
    const qty = Number(line.quantity || 0);
    const cost = Number(line.finalPrice || line.price || 0);
    line.lineTotal = +(qty * cost).toFixed(2);
    this.computeTotals();
  }

  computeTotals() {
  // Cast form value and model as any to bypass strict type checking during deep trace extraction
  const formValue = (this.form?.value as any);
  const lines = formValue?.items || (this.model as any).items || [];
  
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


  async savePurchase() {
    if (!this.model.vendorId || !this.form.valid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Vendor ID and valid line item definitions are required parameters.' 
      });
      return;
    }

    // Capture precise parameters context directly out of live component UI structures
    const submissionPayload = {
      ...this.model,
      ...this.form.value,
      tenantId: this.tenantId,
      totalAmount: this.totals.grandTotal
    };

    console.log('Forwarding procurement payload layout data structure:', submissionPayload);

    try {
      let response: any;

      // Conditional switch routing execution contexts via explicit REST actions
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        console.log('Routing PUT modification layout context for transaction ID:', submissionPayload.id);
        response = await firstValueFrom(
          this.purchaseService.updatePurchaseOrder(submissionPayload.id, submissionPayload)
        );
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Purchase order updated successfully' });
      } else {
        console.log('Routing fresh POST registration sequence across multi-tenant arrays...');
        response = await firstValueFrom(
          this.purchaseService.createPurchaseOrder(submissionPayload)
        );
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'New purchase order generated successfully.' });
      }

      // Shared cleanup routine parameters execution paths
      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();

      // Force instant display reload refresh data sets context sync
      this.getPOList();
      this.cd.detectChanges();

    } catch (error: any) {
      console.error('Procurement persistence operation failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.message || 'Failed to successfully sync purchase order records.' 
      });
    }
  }

  clearPurchase() {
    this.model = { 
      poNumber: '', 
      vendorId: null,
      vendor: null,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: null,
      status: 'DRAFT',
      totalAmount: 0,
      notes: '',
      items: [] 
    };
    this.totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
    this.form.reset();
  }

  async getProductFinalPrice(prodId: number, p: Product): Promise<any> {
    return firstValueFrom(this.productService.getProductFinalPrice(prodId, this.tenantId, p));
  }


 



   
onProductAdded(product: any) {
    this.addProductToOrder(product);
  }


CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}
  onVendorSelected(vendor: any) {
    if (vendor) {
      this.model.vendorId = vendor.id;
      this.model.vendor = vendor;
      this.form.patchValue({ vendorId: vendor.id });
      this.messageService.add({ severity: 'success', summary: 'Vendor Selected', detail: `Vendor ${vendor.vendorName} selected` });
    }
  }
  private applyLocalSearchExtension(fields: FormlyFieldConfig[]) {
      fields.forEach(field => {
        // If the field is flagged searchable in your JSON
        if (field.props && field.props['searchable']) {
          
          // Dynamically inject the wrapper name into the field's array stack
          field.wrappers = [...(field.wrappers || []), 'typeahead-wrapper'];
          typeaheadSearchExtension(field);
        }
         if (field.fieldGroup) {
          this.applyLocalSearchExtension(field.fieldGroup);
        }
      });
    } 
    
}

