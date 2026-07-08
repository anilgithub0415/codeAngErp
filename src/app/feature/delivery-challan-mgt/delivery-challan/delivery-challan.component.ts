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

import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';

import { DelieveryChallanService } from '../../../core/services/deliveryChallan.service';
import { DeliveryChallan } from '../../../core/models/deliverychallan.model';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyFieldPrimengDatepickerComponent } from '../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';


@Component({
  selector: 'app-delivery-challan',
  imports: [ReactiveFormsModule, FormsModule, FormlyModule,CommonModule, 
    TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ,DatePickerModule,   FormlyPrimeNGModule
  ],
  templateUrl: './delivery-challan.component.html',
  styleUrl: './delivery-challan.component.scss',
  providers: [MessageService]
})
export class DeliveryChallanComponent {

tenantId!:number; DCs: DeliveryChallan[] |undefined = [] ; 
   expandedRows: { [id: number]: boolean } = {};
  currOpMode: FormOpMode = FormOpMode.View; isFormHidden:boolean=true;
   form = new FormGroup({});
  model: any = { 
    tenantId:0,
    dcNumber: '', 
    customerId: null,
    customer: null,
    salesOrderId:null,
    status: 'DRAFT',
    vehicleNumber:'',
    transporterName:'',
    dispatchDate:'',

    items: [{deliveryChallanId:0,salesOrderItemId:'',product:null,quantityShipped:0}] 
  };

  
  private formlyConfig = inject(FormlyConfig);
aForm!:any;
  raw:any;

   private formService=inject(FormService);
    private productService=inject(ProductService); 
  private authServ=inject(AuthService);
    private dcService=inject(DelieveryChallanService);
    
    private messageService=inject(MessageService);

 fields: FormlyFieldConfig[] = [];

  constructor(
   
  ) {}

  ngOnInit(): void {
       this.tenantId = this.authServ.getTenantId()!;   // <-- store once

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
  this.gerForm_DC(); this.gerDCList();
  
              }
  gerForm_DC(){
 //formkey:customer_form
  
 //var raw:any;
     this.formService.getForm(this.tenantId!,'customer_form').subscribe(aform=>{
       
       
       this.aForm=aform; 
      
      //console.log('this.aForm.FormlyConfig:',this.aForm.FormlyConfig);
      
       
        this.raw=JSON.parse(this.aForm.FormlyConfig) ;
        
     //without $index and rowtemplate //"rowDefaults":{"productId":3,"quantity":"99"}   "valueProp":"(option) => option.productId",
     this.raw=[
  { "key": "id", "type": "input", "hide": true },
  { "key": "createdByUserId", "type": "input", "hide": true },
  { "key": "tenantId", "type": "input", "hide": true },
  
  {
    "wrappers": ["panel"],
    "className": "col-span-24 w-full block mb-0",
    "props": {
     // "label": "Lead Information"
        },
    "fieldGroupClassName": "grid grid-cols-24 gap-2 w-full p-fluid items-end mb-4",
   
    "fieldGroup": [{
    "type": "input",
    "hide": false,
    "key": "dcNumber",
        "className": "col-span-6 md:col-span-4",
    "props": {
      "label": "Challan#",
      "placeholder": "Enter dcNumber",
      "required": true
    }
  },

{
  "type": "input",
        "key": "salesOrderId",
        "className": "col-span-6 md:col-span-4",
        "props": {
          "label": "Sales Order#:",
          "placeholder": "Enter salesOrderId",
                "required": true
        },
},
// {
//           "type": "primeng-dropdown",
//           "key": "customerCategoryId",
//           "className": "col-span-6 md:col-span-4",
//           "props": {
//             "label": "Lead Category",
//             "valueProp": "value",
//             "labelProp": "label",
//             "optionLabel": "label",
//             "optionValue": "value",
//             "placeholder": "Select Category",
//             "lookupKey": "customerCategoryTypes",
//             "required": true,
//             "filter": true
//           }
//         },
      {
        "type": "input",
        "key": "status",
        "className": "col-span-6 md:col-span-4",
        "props": {
          "label": "Status:",
          "placeholder": "Enter status",
                "required": true
        }
      },
      {
        "type": "input",
        "key": "vehiclenumber",
        "className": "col-span-6 md:col-span-3",
        "props": {
          "label": "Vehicle#",
          "placeholder": "Enter vehiclenumber",
                "required": true
        }
      },{
        "type": "input",
        "key": "trnasportername",
        "className": "col-span-6 md:col-span-4",
        "props": {
          "label": "Transporter Name",
          "placeholder": "Enter Transporter Name",
                "required": true
        }
      },{
        "type": "datepicker",
        "key": "dispatchDate",
        "className": "col-span-6 md:col-span-3",
        "props": {
          "label": "DispatchDate:",
          "placeholder": "Enter dispatchdate",
           "dateFormat": "dd-mm-yy",
          "numberOfMonths": 1,
          "selectionMode": "single",
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
      "addText": "Add Organisation",
      
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-24 gap-1 w-full p-fluid items-end",
      "fieldGroup": [
        { "key": "id", "type": "input", "hide": true },
        {
          "type": "input",
          "key": "salesOrderItemId",
          "className": "col-span-3 md:col-span-4",
          "props": {
            "label": "salesOrderItemId",
            "placeholder": "Enter salesOrderItemId",
           
          }
     },
           {
                    "type": "primeng-dropdown",
                    "key": "productId",
                    "className": "col-span-6 md:col-span-11",
                    "props": {
                        "label": "Item", 
                      
                        "optionLabel": "label",
                        "optionValue": "value",
                        "placeholder": "Select Item",
                        "lookupKey": "productTypesWithVariants", // New lookup key
                        "required": true,
                        "filter": true,
                        // Add variant display in dropdown
                        "optionDisabled": "(option: any) => !option.variants?.length",
                        
                    }
                },
        {
          "type": "input",
          "key": "quantityShipped",
          "className": "col-span-3 md:col-span-4",
          "props": {
            "label": "quantityShipped",
            "placeholder": "Enter quantityShipped",
            "required": true
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


        const hydrated = this.hydrateFormlyConfig1(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
        
        this.applyLocalSearchExtension(this.fields);

  
     })
   
   }

  gerDCList(){
    this.dcService.getDCs(this.tenantId).subscribe(dcs=>{
      this.DCs=dcs; 
        console.log('Delivery challans:',this.DCs);
        
      
    })
  }

  Add(){
     this.isFormHidden=false;
     this.currOpMode=FormOpMode.Add; localStorage.setItem('currOpMode',this.currOpMode);
  
    
  }
CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}
  async onEditClick(selectedRecord: any) {
    this.isFormHidden=false;this.currOpMode=FormOpMode.Update;
    console.log('selectedRecord:',selectedRecord);
    
    this.model=selectedRecord
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

    
    this.model.items.push({
      productId,
      productName: product?.prodName ?? product?.name ?? product?.label ?? String(product),
      sku: product?.sku ?? product?.code ?? '',
    
      qty: 1,
    });

    this.form.patchValue({ items: this.model.items });
   
    this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Product added to order' });
  }

  removeLine(index: number) {
    this.model.items.splice(index, 1);
    this.form.patchValue({ items: this.model.items });
  }

  updateLineTotal(line: any) {
    line.lineTotal = +(line.qty * line.basePrice).toFixed(2);
  }

  saveDeliveryChallan() {
    console.log('model of sales:',this.model);
    
    if (  !this.model.items?.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'DeliveryChallan  number, vendor, and at least one product are required' });
      return;
    }

this.model.tenantId=this.tenantId;
   this.dcService.createDeliveryChallan(this.model).subscribe(res=>console.log('DC saved successfully!',res)   )

    // TODO: Implement API call to save order
    console.log('Saving purchase order:', this.model);
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Delivery Challan saved successfully' }); 
  }

  clearDeliveryChallan() {
    this.model = { 
      poNumber: '', 
      vendorId: null,
      vendor: null,
      orderDate: new Date().toISOString().substring(0,10),
      deliveryDate: null,
      status: 'DRAFT',
      totalAmount: 0,
      notes: '',
      items: [] 
    };
    
    this.form.reset();
  }
  

  


   private hydrateFormlyConfig1(rawConfig: any[]): FormlyFieldConfig[] {
     
     
     // Walk the tree and replace every placeholder with the real function
     const walk = (fields: any[]) => {
       fields.forEach(f => {
  
     
  
         // 1️⃣ repeat‑section rows
         if (f.fieldArray?.fieldGroup) {
           walk(f.fieldArray.fieldGroup);
         }
   
         //this rowbuilder part was used when detail part JSON was not there like Organisations
         //for detail part is also specified in json requires rowTemplate which is in else part of this
         // 2️⃣ custom placeholder that needs a row builder
         if (f.type === 'custom' && f.props?.rowBuilder) {
           const builderName = f.props.rowBuilder as string;
           const builderFn = FORMLY_ROW_REGISTRY[builderName];
           if (!builderFn) {
             console.warn(`No row builder registered for "${builderName}"`);
             return;
           }
           f.props.getRowConfig = builderFn;   // <-- inject the real function
           delete f.props.rowBuilder;          // optional: clean up the placeholder
         }
         else 
           // -----------------------------------------------------------------
         // 2️⃣ Handle a custom placeholder that carries a full rowTemplate JSON
         // -----------------------------------------------------------------
         if (f.type === 'custom' && f.props?.rowTemplate) { 
         
           const template = f.props.rowTemplate as any; // raw JSON object
   
           /**
            * Factory that Formly will call for each row index.
            * It clones the stored template, injects the concrete index,
            * and wires the remove‑button handler.
            */
           const rowFactory = (rowIdx: number): FormlyFieldConfig => {
             // Deep‑clone so each row gets its own object (avoid shared refs)
             const clone = JSON.parse(JSON.stringify(template));
   
             // ---- replace the ${index} placeholder in the key -----------------
             if (typeof clone.key === 'string') {
   clone.key = clone.key.replace('${index}', `${rowIdx}`);
             } 
   
    // ---- copy model from the parent (so the boolean flag is available) ----
   // const parentModel = (clone as any).model ?? {};
   // clone.model = { ...parentModel };   // shallow copy is enough for a boolean flag
  //console.log('clone.model:',clone.model);
  
             // ---- replace the sentinel "REMOVE_ROW" with a real function -------
             const replaceSentinel = (field: any) => {
   if (field.props?.onClick === 'REMOVE_ROW') {
     field.props.onClick = (_event: any, fld: any) => {
       // `fld.parent` points to the repeat container (organisations)
       const arr = fld.parent.model.organisations as any[];
       arr.splice(rowIdx, 1);
     };
   }
   // recurse into possible nested groups
   if (field.fieldGroup) {
     field.fieldGroup.forEach(replaceSentinel);
   }
             };
             
   console.log('m here..............in hydrateFormly');
             replaceSentinel(clone);
   
             // The clone now conforms to FormlyFieldConfig
             return clone as FormlyFieldConfig;
           };
   
           // Attach the factory to the custom bridge component
           f.props.getRowConfig = rowFactory;
   
           // Clean up the raw template – it is no longer needed at runtime
           delete f.props.rowTemplate;
         }
   
       });
     };
  
     walk(rawConfig);
     return rawConfig as FormlyFieldConfig[];
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

