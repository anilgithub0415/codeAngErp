/*
 Recommended Strategy, Fetch formlyjson Once at Application or Module Initialization: Load the tenant's Formly
  layouts inside your ngOnInit of the parent component or via an Angular RouteResolver.Cache 
  in Frontend State: Hold the JSON configuration in an Angular state management store or a 
  simple behavioral service (TenantConfigService).Instantiate Only Data Models on 
  Edit: When a user clicks edit on individual product items, simply load the specific 
  product model row and bind it directly to the already compiled layout.
  */
import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnInit, inject } from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms'
import {FormlyConfig, FormlyFieldConfig, FormlyModule} from '@ngx-formly/core'
import { ProductService } from '../../../core/services/product.service';
import { ConfigService } from '../../../config.service';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { AuthService } from '../../../core/services/auth.service';
import { CreateProductDto } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { applyLocalSearchExtension, hydrateFormlyConfig } from '../../../shared/utils/hydrationOfFormlyJson';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { firstValueFrom, tap } from 'rxjs';
import { SalesService } from '../../../core/services/sales.service';
import { PurchaseService } from '../../../core/services/purchase.service';
@Component({
  selector: 'app-product-master', 
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ReactiveFormsModule, FormsModule,FormlyModule,DataViewModule,TagModule,
    CommonModule, TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule,
    FilterControlComponent
  ],
   providers: [MessageService],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.scss'

})
export class ProductMasterComponent {
   tenantId!:number;
leftCol = '30%'; rowHeight="50"
  form = new FormGroup({});
  model:Partial<CreateProductDto> = {};
  fields: FormlyFieldConfig[]=[];

  isFormHidden:boolean=true;
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  products!:any[];searchString!:string;searchInput!:string;
  visibleDataArray!:any[];modifiedDataArray!:any[];
   expandedRows: { [id: number]: boolean } = {};
rawJSON!:any;
  private productService=inject(ProductService);
      private salesService=inject(SalesService);
  
  private configService=inject(ConfigService);
  private authServ=inject(AuthService);
      private purchaseService=inject(PurchaseService);
  private messageService=inject(MessageService)
private formlyConfig = inject(FormlyConfig);
flatORwithvariantProduct:string='variantproduct'
  constructor(){

  }

  
  ngOnInit(): void {
this.tenantId=this.authServ.getTenantId()!;
    
    //pending: remove this method as we are adopting formly JSON approach 
    // // this.getProductFormFields();

    this.getFormlyJSON_processed();
    this.getProductList().then(prods=>{
    this.products=prods;   this.visibleDataArray= [...this.products!]; console.log('products:',this.products);
    this.modifiedDataArray = this.visibleDataArray.map(item => ({
  ...item,
  hsnCode: item.hsnTaxRule?.hsnCode // Pulls the nested value to the top level
}));
  
  }).catch(err=>{    console.error('Error:',err)  });;

     this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent})
  
       
    
             this.formlyConfig.setType({
                name: 'primeng-dropdown',
                component: FormlyFieldPrimengDropdownComponent,
              });
    
  
       this.formlyConfig.addValidatorMessage(
        'mobileExists',
        'This mobile number is already registered.'
      );
     this.formlyConfig.setWrapper({
       name:'typeahead-wrapper',component:FormlyWrapperTypeaheadComponent
     }); 
  
   
     this.formlyConfig.setType({
       name:'custom',component:FormlyCustomRowBridgeComponent
     })
  }//ngOnInit
  onDataFiltered(filteredResults: any[]) { 
 
    this.visibleDataArray = filteredResults;
    console.log('onDataFilter..............visibleDataArray:',this.visibleDataArray.length);
  }
  getFormlyJSON_processed(){
    this.rawJSON=[
  { "key": "id", "type": "input", "hide": true },
  { "key": "createdByUserId", "type": "input", "hide": true },
  { "key": "tenantId", "type": "input", "hide": true },
  {
    "wrappers": ["panel"],
    "className": "col-span-12 w-full block mb-0",
    "props": {},
    "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
    "fieldGroup": [
      {
        "type": "primeng-dropdown",
        "key": "hsnId",
        "className": "col-span-6 md:col-span-4",
        "props": {
          "label": "HSN Code",
          "valueProp": "value",
          "labelProp": "label",
          "optionLabel": "label",
          "optionValue": "value",
          "placeholder": "Select HSN",
          "lookupKey": "hsnTypes",
          "required": true,
          "filter": true
        }
      },
      {
        "key": "prodName",
        "type": "input",
        "className": "col-span-12 md:col-span-4",
        "props": {
          "label": "Product Name",
          "placeholder": "Enter product name",
          "required": true
        }
      },
      {
        "type": "input",
        "key": "description",
        "className": "col-span-12 md:col-span-4",
        "props": {
          "label": "Description",
          "placeholder": "Enter description"
        }
      },
      {
        "type": "input",
        "key": "sku",
        "className": "col-span-12 md:col-span-2",
        "props": {
          "label": "SKU",
          "placeholder": "Enter sku",
          "pattern": "^(.{6,}|.*-base)$"
        }
      },
      {
        "type": "input",
        "key": "basePrice",
        "className": "col-span-6 md:col-span-2",
        "props": {
          "label": "Base Price",
          "placeholder": "Enter baseprice",
          "type": "number"
        }
      },
      
      {
        "type": "input",
        "key": "customAttributes.tier_prices.B2C_price",
        "className": "col-span-6 md:col-span-2",
        "props": {
          "label": "B2C Price",
          "placeholder": "0.00",
          "type": "number"
        }
      },
      {
        "type": "input",
        "key": "customAttributes.tier_prices.B2B_price",
        "className": "col-span-6 md:col-span-2",
        "props": {
          "label": "B2B Price",
          "placeholder": "0.00",
          "type": "number"
        }
      },
      {
        "type": "input",
        "key": "customAttributes.tier_prices.B2BC_price",
        "className": "col-span-6 md:col-span-2",
        "props": {
          "label": "B2BC Price",
          "placeholder": "0.00",
          "type": "number"
        }
      },
      {
        "type": "input",
        "key": "customAttributes.tier_prices.Dealer_price",
        "className": "col-span-6 md:col-span-2",
        "props": {
          "label": "Dealer Price",
          "placeholder": "0.00",
          "type": "number"
        }
      },
      {
        "type": "input",
        "key": "customAttributes.tier_prices.Wholesaler_price",
        "className": "col-span-6 md:col-span-2",
        "props": {
          "label": "Wholesaler Price",
          "placeholder": "0.00",
          "type": "number"
        }
      },
      {
        "type": "input",
        "key": "currentstock",
        "className": "col-span-6 md:col-span-2",
        "props": {
          "label": "Stock",
          "placeholder": "Enter currentstock",
          "type": "number"
        }
      },
      {
        "type": "input",
        "key": "reorderLevel",
        "className": "col-span-6 md:col-span-2",
        "props": {
          "label": "Reorder Level",
          "placeholder": "Enter reorderLevel",
          "type": "number"
        }
      },
      {
        "type": "checkbox",
        "key": "isOEMProduct",
        "defaultValue": false,
        "className": "col-span-3 md:col-span-1",
        "props": {
          "label": "Is OEM"
        }
      },
      {
        "type": "checkbox",
        "key": "isVariablePrice",
        "defaultValue": false,
        "className": "col-span-3 md:col-span-2",
        "props": {
          "label": "Variable Price"
        }
      },
      {
        "type": "checkbox",
        "key": "isBulkPacking",
        "defaultValue": false,
        "className": "col-span-3 md:col-span-2",
        "props": {
          "label": "Is BulkPack"
        }
      },
      {
        "type": "checkbox",
        "key": "isActive",
        "defaultValue": true,
        "className": "col-span-3 md:col-span-1",
        "props": {
          "label": "isActive"
        }
      },
      
      {
  "type": "primeng-dropdown",
  "key": "defaultPurchaseUom",
  "className": "col-span-12 md:col-span-4",
  "props": {
    "label": "Purchase Unit:",
    "optionLabel": "label",
    "optionValue": "value",
    "placeholder": "Select UOM",
    "filter": true,
   
    "options": [] // 🌟 Starts empty, populated dynamically at runtime
  },"expressions": {     "hide": "!field.parent.parent.model.id"      } //hide for new product
},
{
          "type": "primeng-dropdown",
          "key": "defaultSalesUom",
          "className": "col-span-24 md:col-span-4",
          "props": {
            "label": "Sales Unit:",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select UOM",
            "filter": true,
            
            "options": []
          },"expressions": {     "hide": "!field.parent.parent.model.id"      }//hide for new product
        },
        //baseUom
        
{
          "type": "primeng-dropdown",
          "key": "baseUom",
          "className": "col-span-24 md:col-span-4",
          "props": {
            "label": "Base Unit:",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select UOM",
            "filter": true,
            
            "options": []
          },"expressions": {     "hide": "!field.parent.parent.model.id"      }//hide for new product
        }
      //for test
      //Logic to hide and show in edit mode
      // "expressions": {     "hide": "field.parent.parent.model.id"      }
      
    ]
  },
  {
    "type": "button",
    "className": "col-span-12 md:col-span-3 mt-4",
    "props": {
      "text": "Save Product",
      "type": "submit",
      "styleClass": "p-button-success"
    }
  }
]
const hydrated = hydrateFormlyConfig(this.rawJSON);
       
 this.fields=hydrated; console.log('fields loaded now...............................');
  
        applyLocalSearchExtension(this.fields);
  }



  getProductList(): Promise<any[]> {
      const observable$ = this.productService.getProducts(this.tenantId).pipe(
        tap((prods:any) => {
          this.products = prods; // Handles the side-effect safely
        })
      );
    return firstValueFrom(observable$);
    
  }
  
  Add(){
    this.isFormHidden=false;
    this.currOpMode=FormOpMode.Add; localStorage.setItem('currOpMode',this.currOpMode);
  
 this.model = { 
      hsnId: undefined,
      prodName:'',
      sku:'',
      vendor: null,
      orderDate: new Date().toISOString().substring(0,10),
      deliveryDate: null,
      status: 'DRAFT',
      totalAmount: 0,
      notes: '',
     
    };
    
  }
CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;    this.form.reset();}

onEditClick(selectedRecord: any) { 
  this.isFormHidden = false;
  this.currOpMode = FormOpMode.Update;
  
  this.pullAllPurchaseUnits(selectedRecord.id, null);
  this.pullAllSalesUnits(selectedRecord.id, null);
  
  console.log('editing record:', selectedRecord);
  
  // Set the core model data first
  this.model = { ...selectedRecord };

  // Dynamically extract and assign tier prices using a loop
  const tierPrices = selectedRecord.customAttributes?.tier_prices;
  if (tierPrices) {
    Object.keys(tierPrices).forEach(key => {
      
        this.model[key] = tierPrices[key];
      
    });
  }
  
  // Patch form with the fully prepared model
  this.form.patchValue(this.model);
}

async pullAllPurchaseUnits(forProductId: number | null, forvariantId: number | null) {
  try {
    const resultMatrix = await firstValueFrom(
      this.purchaseService.fetchTenantRulesMatrix(this.tenantId, forProductId!, forvariantId!)
    );
    console.log('resultMatrix:', resultMatrix);

    if (resultMatrix && resultMatrix.availablePurchaseUnits) {
      // 1. Locate the purchaseUom field inside your Formly fields configuration
      const uomField = this.findFieldByKey(this.fields, 'defaultPurchaseUom');

      if (uomField) {
        // 2. Assign the fetched array to props.options (use 'templateOptions' if using older Formly versions)
        uomField.props = {
          ...uomField.props,
          options: resultMatrix.availablePurchaseUnits
        };

        // 3. Optional: Trigger a Formly model/field refresh if detection doesn't catch it
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
    console.log('resultMatrix:', resultMatrix);

    if (resultMatrix && resultMatrix.availableSalesUnits) {
      // 1. Locate the purchaseUom field inside your Formly fields configuration
      const Sales_uomField = this.findFieldByKey(this.fields, 'defaultSalesUom');

      if (Sales_uomField) {
        // 2. Assign the fetched array to props.options (use 'templateOptions' if using older Formly versions)
        Sales_uomField.props = {
          ...Sales_uomField.props,
          options: resultMatrix.availableSalesUnits
        };

        // 3. Optional: Trigger a Formly model/field refresh if detection doesn't catch it
        this.fields = [...this.fields]; 
      }
      //2.Locate the purchaseUom field inside your Formly fields configuration
      const Base_uomField = this.findFieldByKey(this.fields, 'baseUom');

      if (Base_uomField) {
        // 2. Assign the fetched array to props.options (use 'templateOptions' if using older Formly versions)
        Base_uomField.props = {
          ...Base_uomField.props,
          options: resultMatrix.availableSalesUnits
        };

        // 3. Optional: Trigger a Formly model/field refresh if detection doesn't catch it
        this.fields = [...this.fields]; 
      }
    }
  } catch (error) {
    console.error('Error fetching purchase units:', error);
  }
}
// Helper method to recursively find a field by key (handles nested field groups/field arrays)
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






  removeProduct(index: number) {
    this.products.splice(index, 1);
      }

      saveProduct() {
  if (!this.model.prodName || !this.model.basePrice || !this.form.valid) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product Name and Price is required' });
    return;
  }

  console.log('model before manual:', this.model);
//-------------------------------------------------------------------------
// //Note: If you will add any field at any level with 
// name ending with _price ned to take care in below logic as basePrice is ignored here

  // 1. Dynamically extract and build the tier_prices object
 const tierPrices: Record<string, any> = {};

if (this.model.customAttributes?.tier_prices) {
  Object.keys(this.model.customAttributes.tier_prices).forEach(key => {
    console.log('key:', key); // This will now log 'B2C_price'
    
    if (key.endsWith('_price')) {
      tierPrices[key] = this.model.customAttributes!.tier_prices[key];
    }
  });
}

console.log('tierPrices:', tierPrices);

  
//-------------------------------------------------------------------------
  // 2. Build the payload
  const createDto: CreateProductDto = {
    id: this.model.id!,
    tenantId: this.tenantId,
    hsnId: this.model.hsnId!,
    prodName: this.model.prodName!,
    description: this.model.description,
    sku: this.model.sku!,
    basePrice: this.model.basePrice,
    isVariablePrice: this.model.isVariablePrice,
    isActive: this.model.isActive,
    isOEMProduct: this.model.isOEMProduct,
    isBulkPacking: this.model.isBulkPacking,
    reorderLevel: this.model.reorderLevel, 
    defaultPurchaseUom: this.model.defaultPurchaseUom,
    defaultSalesUom: this.model.defaultSalesUom,                   
    baseUom: this.model.baseUom,
    customAttributes: {
      tier_prices: tierPrices // Assigns all dynamically extracted prices
    }    
  };
  
  // 3. Send payload to API
  this.productService.createProduct(createDto).subscribe({
    next: (res) => {
      console.log('Product saved successfully!', res);
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Product saved successfully' });
      this.getProductList();
    },
    error: (err) => {
      console.error('Error saving product:', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save product' });
    }
  });
}


  clearProduct() {
    this.model = { prodName: '', description: '', sku:'', basePrice:0 };
    this.form.reset();
  }

}
