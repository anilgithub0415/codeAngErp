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
import { clientPurchaseService } from '../../../core/services/clientPurchaseService';
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
import { clientPurchase } from '../../../core/models/clientPurchase.model';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyFieldPrimengDatepickerComponent } from '../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { hydrateFormlyConfig, injectPurchaseUomMatrixListeners } from '../../../shared/utils/hydrationOfFormlyJson';
import { PurchaseService } from '../../../core/services/purchase.service';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-client-purchase',
  imports: [ReactiveFormsModule, FormsModule, FormlyModule,CommonModule, 
    TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ,DatePickerModule, FormlyPrimeNGModule,FormlyModule
  ],
  templateUrl: './client-purchase.component.html',
  styleUrl: './client-purchase.component.scss',
   providers: [MessageService]
})
export class ClientPurchaseComponent {


  tenantId!:number; ClientPOs: clientPurchase[] |undefined = [] ; 
   expandedRows: { [id: number]: boolean } = {};
  currOpMode: FormOpMode = FormOpMode.View; isFormHidden:boolean=true;
   form = new FormGroup({});
  model: any = { 
    tenantId:0,
    clientPoNumber: '', 
    clientId: null,
    client: null,
    poDate: new Date().toISOString().substring(0,10),
    requestedDeliveryDate: null,
    status: 'DRAFT',
    totalAmount: 0,
    clientNotes: '',internalNotes:'',
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
    private clientPurchaseService=inject(clientPurchaseService);
    private vendorService=inject(VendorService);
    private messageService=inject(MessageService);

 fields: FormlyFieldConfig[] = [];

  constructor(
   
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
  this.getForm_ClientPO(); this.getClientPOs();
  
              }
  getForm_ClientPO(){
 //formkey:customer_form
  
 //var raw:any;
     this.formService.getForm(this.tenantId!,'customer_form').subscribe(aform=>{
       
       
       this.aForm=aform; 
      
      //console.log('this.aForm.FormlyConfig:',this.aForm.FormlyConfig);
      
       
        this.raw=JSON.parse(this.aForm.FormlyConfig) ;
        
     //without $index and rowtemplate
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
    
    "key": "clientPoNumber",
        "className": "col-span-6 md:col-span-4",
    "props": {
      "label": "Client Purchase Order#", "readonly": true,
      "placeholder": "Client PO#",
     
    }
  },
    {
        "type": "primeng-dropdown",
        "key": "clientId",
        "className": "col-span-12 md:col-span-6",
        "props": {
          "label": "Client:",
          "optionLabel": "label",
          "optionValue": "value",
          "placeholder": "Select Vendor",
          "lookupKey": "customerTypes",
          "filter": true,
      "required": true
        }
      },
      
      {
  "type": "datepicker",
  "key": "poDate",
        "className": "col-span-12 md:col-span-6",
  "props": {
    "label": "Order Date",
     "dateFormat": "dd-mm-yy",
    "numberOfMonths": 1,
    "selectionMode": "single"
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
      "rowDefaults":{"quantity":"1"} 
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
      "fieldGroup": [
        { "key": "id", "type": "input", "hide": true },
        
           {
                    "type": "primeng-dropdown",
                    "key": "productId",
                    "className": "col-span-6 md:col-span-11",
                    "props": {
                        //"label": "Item",
                        "optionLabel": "label",
                        "optionValue": "value",
                        "placeholder": "Select Item",
                        "lookupKey": "productTypes", // we need conditional:productTypesWithVariants
                        "required": true,
                        "filter": true,
                        // Add variant display in dropdown
                        "optionDisabled": (option: any) => !option.variants?.length
                    },
                    "expressions": {
                      "props.label": "field.parent.index === 0 ? 'Item' : ''"
                      }
                },
        
        {
          "type": "input",
          "key": "quantity",
          "className": "col-span-3 md:col-span-3",
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
  "className": "col-span-12 md:col-span-3",
  "props": {
    "label": "Purchase Unit:",
    "optionLabel": "label",
    "optionValue": "value",
    "placeholder": "Select UOM",
    "filter": true,
    "required": true,
    "options": [] // 🌟 Starts empty, populated dynamically at runtime
  }
},
        
        {
          "type": "input",
          "key": "finalPrice",
          "className": "col-span-3 md:col-span-4",
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


        const hydrated = hydrateFormlyConfig(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
          injectPurchaseUomMatrixListeners(this.fields,this.purchaseService,this.tenantId)
        this.applyLocalSearchExtension(this.fields);

  
     })
   
   }

  getClientPOs(){
    this.clientPurchaseService.getClientPOs(this.tenantId).subscribe(clientpos=>{
      this.ClientPOs=clientpos; 
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:',this.ClientPOs);
        
      
    })
  }

  Add(){
    this.isFormHidden=false;
    this.currOpMode=FormOpMode.Add; localStorage.setItem('currOpMode',this.currOpMode);
  
    //
    //this.fields=[];
     this.model={tenantId:0,
    clientPoNumber: '', 
    clientId: null,
    client: null,
    poDate: new Date().toISOString().substring(0,10),
    requestedDeliveryDate: null,
    status: 'DRAFT',
    totalAmount: 0,
    clientNotes: '',internalNotes:'',
    items: [{productId:0,quantity:0,finalPrice:0}] };
    // const hydrated = this.hydrateFormlyConfig(this.raw);
    // this.fields=hydrated; setTimeout(() => this.form.updateValueAndValidity(), 0);
    
  }
CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}
  
  async onEditClick(selectedRecord: any) {
    this.isFormHidden=false;this.currOpMode=FormOpMode.Update;
    this.model=selectedRecord
  }

  onVendorSelected(vendor: any) {
    if (vendor) {
      this.model.vendorId = vendor.id;
      this.model.vendor = vendor;
      this.form.patchValue({ vendorId: vendor.id });
      this.messageService.add({ severity: 'success', summary: 'Vendor Selected', detail: `Vendor ${vendor.vendorName} selected` });
    }
  }

onProductAdded(product: any) {
    this.addProductToOrder(product);
  }

  async addProductToOrder(product: any) {
    if (!product) return;

    const productId = product?.id ?? product?.value ?? product?.sku ?? product?.code ?? product?.prodName ?? product?.name ?? String(product);
    if (this.model.lines?.find((l: any) => l.productId === productId)) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'Product already added to order' });
      return;
    }

    if (!this.model.lines) this.model.lines = [];

    const basePrice = product?.basePrice ?? product?.price ?? 0;
    const finalPrice = await this.getProductFinalPrice(productId, product);

    this.model.lines.push({
      productId,
      productName: product?.prodName ?? product?.name ?? product?.label ?? String(product),
      sku: product?.sku ?? product?.code ?? '',
      basePrice,
      finalPrice,
      qty: 1,
      lineTotal: basePrice
    });

    this.form.patchValue({ lines: this.model.lines });
    this.computeTotals();
    this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Product added to order' });
  }

  removeLine(index: number) {
    this.model.lines.splice(index, 1);
    this.form.patchValue({ lines: this.model.lines });
    this.computeTotals();
  }

  updateLineTotal(line: any) {
    line.lineTotal = +(line.qty * line.basePrice).toFixed(2);
    this.computeTotals();
  }

  saveClientPurchase() {
    console.log('model of purchase:',this.model);
    
    if ( !this.model.clientId || !this.model.items?.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Purchase order number, vendor, and at least one product are required' });
      return;
    }


console.log('going ahead for save PO:',this.model);
this.model.tenantId=this.tenantId;
   this.clientPurchaseService.createclientPurchaseOrder(this.model).subscribe(res=>console.log('PO saved successfully!',res)   )

    // TODO: Implement API call to save order
    console.log('Saving clientPurchase order:', this.model);
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Client Purchase order saved successfully' }); 
  }

  clearClientPurchase() {
    this.model = { 
      tenantId:0,
    clientPoNumber: '', 
    clientId: null,
    client: null,
    poDate: new Date().toISOString().substring(0,10),
    requestedDeliveryDate: null,
    status: 'DRAFT',
    totalAmount: 0,
    clientNotes: '',internalNotes:'',
    lines: [] 
      
    };
    this.totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
    this.form.reset();
  }
  async getProductFinalPrice(prodId: number, p: Product): Promise<any> {
    return new Promise((resolve) => {
      this.productService.getProductFinalPrice(prodId, 1, p).subscribe(afinalPrice => {
        resolve(afinalPrice);
      });
    });
  }

  computeTotals() {
    const lines = this.model.items || [];
    let sub = 0;
    for (const l of lines) {
      const qty = Number(l.quantity || 0);
      const base = Number(l.price || 0);
      l.lineTotal = +(qty * base).toFixed(2);
      sub += l.lineTotal;
    }
    this.totals.subTotal = +(sub).toFixed(2);
    this.totals.taxTotal = +(this.totals.subTotal * 0).toFixed(2);
    this.totals.grandTotal = +(this.totals.subTotal + this.totals.taxTotal).toFixed(2);
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


