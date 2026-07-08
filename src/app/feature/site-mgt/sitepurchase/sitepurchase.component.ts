import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { DatePickerModule } from 'primeng/datepicker';
import { typeaheadSearchExtension } from '../../../shared/components/formlyfields/typeaheadSearchExtension';
import { Product } from '../../../core/models/product.model';
import { Purchase } from '../../../core/models/purchase.model';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../core/services/form.service';

import { clientPurchaseService } from '../../../core/services/clientPurchaseService';
import { VendorService } from '../../../core/services/vendor.service';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDatepickerComponent } from '../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { hydrateFormlyConfig, injectPurchaseUomMatrixListeners } from '../../../shared/utils/hydrationOfFormlyJson';
import { ProductService } from '../../../core/services/product.service';
import { clientPurchase } from '../../../core/models/clientPurchase.model';
import { PurchaseService } from '../../../core/services/purchase.service';

@Component({
  selector: 'app-sitepurchase',
      imports: [ ReactiveFormsModule, FormsModule, FormlyModule,CommonModule, 
          TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
        ,DatePickerModule, FormlyPrimeNGModule,FormlyModule
         
          
        ],
        providers:[MessageService],
  templateUrl: './sitepurchase.component.html',
  styleUrl: './sitepurchase.component.scss'
})
export class SitepurchaseComponent {
siteId!:number
  

  tenantId!:number; clientPOs: clientPurchase[] |undefined = [] ; 
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
    private clientPurchaseService=inject(clientPurchaseService);
    private purchaseService=inject(PurchaseService)
    private vendorService=inject(VendorService);
    private messageService=inject(MessageService);

 fields: FormlyFieldConfig[] = [];

  constructor(
   
  ) {}

  ngOnInit(): void {
     this.siteId= this.authServ.getSiteId()!;
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
  "className": "col-span-12 md:col-span-4",
  "props": {
    "label": "Purchase UOM:",
    "optionLabel": "label",
    "optionValue": "value",
    "placeholder": "Select UOM",
    "filter": true,
    "required": true,
    "options": [] // 🌟 Starts empty, populated dynamically at runtime
  }
}
,
        
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

        const hydrated = hydrateFormlyConfig(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
        injectPurchaseUomMatrixListeners(this.fields,this.purchaseService,this.tenantId)
        //this.applyLocalSearchExtension(this.fields);

  



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
    this.clientPurchaseService.getClientPOs(this.tenantId).subscribe(clientpos=>{
      this.clientPOs=clientpos; 
        console.log(clientpos);
        
      
    })
  }

  Add(){
    this.isFormHidden=false;
    this.currOpMode=FormOpMode.Add; localStorage.setItem('currOpMode',this.currOpMode);
  
    //
    //this.fields=[];
     this.model={tenantId:0,
    poNumber: '', 
    vendorId: null,
    vendor: null,
    orderDate: new Date().toISOString().substring(0,10),
    deliveryDate: null,
    status: 'DRAFT',
    totalAmount: 0,
    notes: '',
    items: [{productId:0,quantity:0,finalPrice:0}] };
    // const hydrated = this.hydrateFormlyConfig(this.raw);
    // this.fields=hydrated; setTimeout(() => this.form.updateValueAndValidity(), 0);
    
  }
CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}
  
  async onEditClick(selectedRecord: any) {

    this.isFormHidden=false;this.currOpMode=FormOpMode.Update;
   this.model = JSON.parse(JSON.stringify(selectedRecord));


    console.log('edit record:',selectedRecord);
    
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

  savePurchase() {
    console.log('model of purchase:',this.model);
    
    if ( !this.model.vendorId || !this.model.items?.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Purchase order number, vendor, and at least one product are required' });
      return;
    }

    // Format the data to match the backend entity structure
    // const purchaseOrderData = {
    //   poNumber: this.model.poNumber,
    //   tenantId: 1, // You might want to get this from a service or config
    //   vendorId: this.model.vendorId,
    //   orderDate: this.model.orderDate,
    //   deliveryDate: this.model.deliveryDate,
    //   status: this.model.status || 'DRAFT',
    //   totalAmount: this.totals.grandTotal,
    //   notes: this.model.notes || '',
    //   items: this.model.lines.map((line:any) => ({
    //     productId: line.productId,
    //     quantity: line.qty,
    //     finalPrice: line.finalPrice
    //   }))
    // };

console.log('going ahead for save PO:',this.model);
this.model.tenantId=this.tenantId;
   this.clientPurchaseService.createclientPurchaseOrder(this.model).subscribe(res=>console.log('PO saved successfully!',res)   )

    // TODO: Implement API call to save order
    console.log('Saving purchase order:', this.model);
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Purchase order saved successfully' }); 
  }

  clearPurchase() {
    this.model = { 
      poNumber: '', 
      vendorId: null,
      vendor: null,
      orderDate: new Date().toISOString().substring(0,10),
      deliveryDate: null,
      status: 'DRAFT',
      totalAmount: 0,
      notes: '',
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


