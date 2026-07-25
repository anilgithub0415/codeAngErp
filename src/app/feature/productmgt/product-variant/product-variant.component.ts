import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormService } from '../../../core/services/form.service';

import { CommonModule } from '@angular/common';
import { DefaultValueAccessor, FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { FormlyConfig, FormlyField, FormlyFieldConfig, FormlyModule, provideFormlyCore,  } from '@ngx-formly/core';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom, Observable, take, tap } from 'rxjs';

import { SelectModule } from 'primeng/select';

import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { RepeatFormlySectionComponent } from '../../../shared/components/formlyfields/repeat-formly-section/repeat-formly-section.component';

import { InputTextModule } from 'primeng/inputtext';
import { FormlyPrimeNGModule, withFormlyPrimeNG } from '@ngx-formly/primeng';
import { PanelModule } from 'primeng/panel';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';




import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { RepeatsectionformlyNewComponent } from '../../../shared/components/formlyfields/repeatsectionformly-new/repeatsectionformly-new.component';
//import { FormlyCustomRowBridgeNewComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge-new/formly-custom-row-bridge-new.component';



import { FormlyCustomRowBridgeNewComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge-new/formly-custom-row-bridge-new.component';
import { organisationRowTemplate } from '../../../shared/components/formlyfields/organisation-row/organisation-row.template';
import { ClientStatus } from '../../../shared/enums/ClientStatus.enum';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { typeaheadSearchExtension } from '../../../shared/components/formlyfields/typeaheadSearchExtension';
import { FORMLY_ROW_REGISTRY, PlainFormlyFieldConfig, RegistryFieldConfig } from '../../customer-mgt/formly-registry';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';


@Component({
  selector: 'app-product-variant',
   schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule,ToastModule ,ReactiveFormsModule, FormsModule,
     FormlyModule, FormsModule,SelectModule ,InputTextModule,FormlyInputModule,
     PanelModule,  TableModule,RippleModule,ButtonModule,
     FilterControlComponent
      
    ],
  providers:[MessageService],
  templateUrl: './product-variant.component.html',
  styleUrl: './product-variant.component.scss'
})
export class ProductVariantComponent {


  searchInput:any;searchString:any;visibleDataArray!: any[] ;
  
 tenantId!: number;          // <-- new property
 isFormHidden:boolean=true;
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 
  
raw:any;

leftCol = '30%'; rowHeight="50"
  form = new FormGroup({});
    model= {tenantId:0,prodName:'',variants:[{sku:'',size:'',finish:''
      ,basePrice:0,isVariablePrice:false
      ,currentstock:0,reorderLevel:0}] };
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;
 options$!:any[]
    
   products: Product[] |undefined = [] ; 
   expandedRows: { [id: number]: boolean } = {};
//expandedRows: { [key: string]: boolean } = {};

    private formService=inject(FormService);
    private prodVariantService=inject(ProductService)
    private formlyConfig = inject(FormlyConfig);
    private authServ=inject(AuthService)
    private lookupService=inject(LookupService)
 private messageService=inject(MessageService)
    constructor( private cd: ChangeDetectorRef
      
    ){
  
    }
 
   ngOnInit() {
    this.model={tenantId:0,prodName:'',
      variants:[{sku:'',size:'',finish:'',
        basePrice:0,isVariablePrice:false
      ,currentstock:0,reorderLevel:0}] };
    this.tenantId = this.authServ.getTenantId()!;   // <-- store once

     this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),
  
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
     name: 'p-repeatsectionformly',
     component: RepeatsectionformlyComponent
   });
   this.formlyConfig.setType({
     name:'custom',component:FormlyCustomRowBridgeComponent
   })
 //// ← add this line
     this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent })
 
 this.getForm_Product(); 
  this.getProductList().then(prods=>{
    this.products=prods;   this.visibleDataArray= [...this.products!];
  }).catch(err=>{    console.error('Error:',err)  })
           
 }
 
 //For Filter data
 onDataFiltered(filteredResults: any[]) { 
 
    this.visibleDataArray = filteredResults;
    console.log('onDataFilter..............visibleDataArray:',this.visibleDataArray.length);
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
  
   getForm_Product(){
 //formkey:customer_form
  
 //var raw:any;
     this.formService.getForm(this.tenantId!,'customer_form').subscribe(aform=>{//productvariant
       
       
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
    "className": "col-span-12 w-full block mb-0",
    "props": {
     // "label": "Lead Information"
        },
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
        
        "className": "col-span-12 md:col-span-3",
        "props": {
          "label": "Product Name",
          "placeholder": "Enter product name",
          "required": true,
    
          }
      },
      {
          "type": "input",
          "key": "description",
          "className": "col-span-12 md:col-span-2",
          "props": {
            "label": "Description",
            "placeholder": "Enter description"
          }
        },{
          "type": "input",
          "key": "sku",
          "className": "col-span-12 md:col-span-2",
          "props": {
            "label": "sku/base",
            "placeholder": "Enter sku/base",
             "pattern": "^(.{6,}|.*-base)$"
          }
        },  {
          "type": "checkbox",
          "key": "isOEMProduct",
          "defaultValue": true,
          "className": "col-span-4 md:col-span-1",
          "props": {
            "label": "Is OEM"
          }
        }, {
          "type": "checkbox",
          "key": "isBulkPacking",
          "defaultValue": true,
          "className": "col-span-5 md:col-span-2",
          "props": {
            "label": "Is BulkPack"
          }
        },{
          "type": "checkbox",
          "key": "isActive",
          "defaultValue": true,
          "className": "col-span-3 md:col-span-1",
          "props": {
            "label": "isActive"
          }
        },
      
    ]
  },

  {
    "key": "variants",
    "type": "p-repeatsectionformly",
    "wrappers": ["panel"],
    "defaultValue": [],
    "props": {
      "label": "",
      "addText": "Add Variants"
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end",
      "fieldGroup": [
        { "key": "id", "type": "input", "hide": true },
        {
          "type": "input",
          "key": "sku",
          "className": "col-span-6 md:col-span-3",
          "props": {
            //"label": "sku",
            "placeholder": "Enter sku",
            "required": true
          },
                    "expressions": {
                      "props.label": "field.parent.index === 0 ? 'sku' : ''"
                      }
        },
        {
          "type": "input",
          "key": "size",
          "className": "col-span-6 md:col-span-3",
          "props": {
            //"label": "size",
            "placeholder": "1/2 inch"
          },
             "expressions": {
                 "props.label": "field.parent.index === 0 ? 'Size' : ''"
              }
        },
        
        
        {
          "type": "input",
          "key": "finish",
          "resetOnHide": true,
          "className": "col-span-6 md:col-span-3",
          "props": {
            //"label": "finish",
            "placeholder": "Chrome"
          },
             "expressions": {
                 "props.label": "field.parent.index === 0 ? 'Finish' : ''"
              }
          
        },
        
        {
          "type": "input",
          "key": "basePrice",
          "className": "col-span-6 md:col-span-3",
          "props": {
            //"label": "Bbase Price",
            "placeholder": "Enter baseprice",
           },
             "expressions": {
                 "props.label": "field.parent.index === 0 ? 'Base Price' : ''"
              }
          
        },         
        {
          "type": "input",
          "key": "currentstock",
          "className": "col-span-6 md:col-span-3",
          "props": {
            //"label": "Stock",
            "placeholder": "Enter currentstock",
           },
             "expressions": {
                 "props.label": "field.parent.index === 0 ? 'Stock' : ''"
              }
          
        },{
          "type": "input",
          "key": "reorderLevel",
          "className": "col-span-6 md:col-span-3",
          "props": {
           // "label": "reorderLevel",
            "placeholder": "Enter reorderLevel",
            
          },
             "expressions": {
                 "props.label": "field.parent.index === 0 ? 'Reorder Level' : ''"
              }
          
        },
        {
          "type": "checkbox",
          "key": "isVariablePrice",
          "defaultValue": true,
          "className": "col-span-6 md:col-span-3",
          "props": {
            "label": "Variable Price"
          }
        },
        
      ]
    }
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


        const hydrated = this.hydrateFormlyConfig1(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
        
        this.applyLocalSearchExtension(this.fields);

  
     })
   
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
     // `fld.parent` points to the repeat container (variants)
     const arr = fld.parent.model.variants as any[];
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
 
private hydrateFormlyConfig2(rawConfig: PlainFormlyFieldConfig[]): FormlyFieldConfig[] {
 
  
  /** Helper – tells TypeScript “only plain objects are processed” */
  const isObject = (v: any): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && !Array.isArray(v);

  interface FieldArrayHolder {
  fieldArray?: {
    fieldGroup?: RegistryFieldConfig[];
    // you can add other nested properties you may need later
  };
}

// 2️⃣ Combine the two interfaces – this is the shape we will use inside walk()
type WalkableField = RegistryFieldConfig & FieldArrayHolder;

// 3️⃣ Type‑guard that narrows to WalkableField
function hasFieldArray(
  f: RegistryFieldConfig
): f is WalkableField {
  return (
    typeof f === 'object' &&
    f !== null &&
    'fieldArray' in f &&
    (f as any).fieldArray !== undefined
  );
}
  /** Recursive walk – only objects (never functions) are processed */
  const walk = (fields: WalkableField[]) => { 
  fields.forEach(f => {
    // ---- descend into nested repeat sections ----
    if (hasFieldArray(f) && Array.isArray(f.fieldArray!.fieldGroup)) {
      // fieldArray!.fieldGroup is now known to be an array
      walk(f.fieldArray!.fieldGroup as WalkableField[]);
    }
console.log(' m here.....................................check custom....');
if(f.type === 'custom'){
}
      /* -----------------------------------------------------------
       * 2️⃣  Custom placeholder that only carries a *rowBuilder* name
       * ----------------------------------------------------------- */
      if (f.type === 'custom' && f.props?.rowBuilder) {
        const builderName = f.props.rowBuilder as string;
        const builderFn = FORMLY_ROW_REGISTRY[builderName];

        if (!builderFn) {
          console.warn(`No row builder registered for "${builderName}"`);
          return;
        }

        // Attach the real function and drop the placeholder flag.
        // We cast to RegistryFieldConfig so TypeScript allows the property.
        (f as RegistryFieldConfig).getRowConfig = builderFn;
        delete f.props.rowBuilder;
        return;
      }

      /* -----------------------------------------------------------
       * 3️⃣  Custom placeholder that carries a full *rowTemplate* JSON
       * ----------------------------------------------------------- */
      if (f.type === 'custom' && f.props?.rowTemplate) { 
console.log('yes f.props.rowTemplate....................');
        const template = f.props.rowTemplate as any; // raw JSON object


        /**
         * Factory that Formly will call for each row index.
         * It clones the stored template, injects the concrete index,
         * and wires the remove‑button handler.
         */
        const rowFactory = (rowIdx: number): RegistryFieldConfig => {
          console.log('parsing template"',template);
          
          // Deep‑clone so each row gets its own object (avoid shared refs)
          const clone = JSON.parse(JSON.stringify(template));

          // ---- replace the `${index}` placeholder in the key -------------
          if (typeof clone.key === 'string') {
clone.key = clone.key.replace('${index}', `${rowIdx}`);
          }

        
    // ---- **Inject the flag into the row model** --------------------
    // Choose the default you want for a *new* row.
    const defaultFlag = true;   // <-- true = hide dependent fields initially
    // If you prefer them visible by default, set `false` here.
    clone.model = {
      ...(clone.model ?? {}),          // preserve any existing model data
      
    };


          // ---- replace the sentinel "REMOVE_ROW" with a real function -------
          const replaceSentinel = (field: any) => {
if (field.props?.onClick === 'REMOVE_ROW') {
  field.props.onClick = (_event: any, fld: any) => {
    // `fld.parent` points to the repeat container (e.g. variants)
    const arr = fld.parent.model.variants as any[];
    arr.splice(rowIdx, 1);
  };
}

// Recursively walk nested groups (e.g. fieldGroup inside a row)
if (field['fieldGroup']) {
  // **SAFE ACCESS** – fieldGroup may be undefined on leaf nodes
  field['fieldGroup'].forEach(replaceSentinel);
}
          };

          replaceSentinel(clone);
          return clone as RegistryFieldConfig;
        };
console.log('caling rowFactory');

        // Attach the factory to the custom bridge component
        (f as RegistryFieldConfig).getRowConfig = rowFactory

        // Clean up the raw template – it is no longer needed at runtime
        delete f.props.rowTemplate;
      }

      /* -----------------------------------------------------------
       * 4️⃣  Visibility / expression handling for checkbox‑dependent fields
       * ----------------------------------------------------------- */
     
      //*/
    });
  };

  // Kick‑off the recursion.
  // The raw JSON is typed as `FormlyFieldConfig[]` from the service,
  // but we need to treat it as `RegistryFieldConfig[]` for the walk.
  walk(rawConfig as RegistryFieldConfig[]);

  // Return the same shape the rest of the component expects.
  return rawConfig as FormlyFieldConfig[];
}

//  async getProductList():Promise<any[]>{
//     return firstValueFrom(this.prodVariantService.getProductsWithVariant(this.tenantId).subscribe(prods=>{
//       this.products=prods;  
      
//     })
//   )


async getProductList(): Promise<any[]> {
  const observable$ = this.prodVariantService.getProductsWithVariant(this.tenantId).pipe(
    tap((prods:any) => {
      this.products = prods; // Handles the side-effect safely
    })
  );

  return firstValueFrom(observable$);
}

    
Add(){
  this.isFormHidden=false;
  this.currOpMode=FormOpMode.Add; localStorage.setItem('currOpMode',this.currOpMode);
  
  //
  //this.fields=[];
   this.model={tenantId:0,prodName:'',
    variants:[{sku:'',size:'',finish:''
      ,basePrice:0,isVariablePrice:false
      ,currentstock:0,reorderLevel:0}] };
  // const hydrated = this.hydrateFormlyConfig(this.raw);
  // this.fields=hydrated; setTimeout(() => this.form.updateValueAndValidity(), 0);
  
}
CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;    this.form.reset();}

// customer.component.ts – edit handler
async onEditClick(selectedRecord: any) {
  
  console.log('selectedRecord for edit:',selectedRecord);
await setTimeout(() => {
          this.isFormHidden=false;

          this.currOpMode=FormOpMode.Update; localStorage.setItem('currOpMode',this.currOpMode)
          console.log('currOpMode is:',this.currOpMode);
          
          // 1️⃣  Load the lookup data first (only in ADD mode)
          if (this.currOpMode !== "UPDATE") { console.log('not UPDATE mode..................');
          
            this.lookupService
              .getLookupDataByKey('customerCategoryTypes', 1)
              .pipe(take(1))
              .subscribe(() => { console.log('subscribing getLookup.. patchvalue with selectedRecord:',selectedRecord);
              
                  const cleaned = {
            ...selectedRecord,
            variants: selectedRecord.variants?.map((org: any) => ({
              ...org,
              customerCategory: org.customerCategory?.value ?? org.customerCategory
            })) ?? []
          };
          this.model=cleaned;

                this.patchForm(cleaned);//selectedRecord

                this.cd.detectChanges();
              });
          } else { // in Update

          
            
            // UPDATE – no lookup needed
            const cleaned = {
            ...selectedRecord,
            variants: selectedRecord.variants?.map((org: any) => ({
              ...org,
              
              customerCategory: org.customerCategory?.value ?? org.customerCategory
            })) ?? []
          };
          this.model=cleaned;

            console.log('only patchvalue:',cleaned);
            console.log('in update, model is:',this.model);
        try{
            this.form.patchValue(cleaned);//selectedRecord
            console.log('successfully patchform executed...');
            
        } catch (error) {
          console.log('An error occurred during patchform:', error);
        }
            //this.form.get('customerCategory')?.updateValueAndValidity();
        // Access the native Angular FormControl instance


        // You can now force value updates, check errors, or mark it as touched
        //dropdownControl?.setValue('Dealer');

      //  console.log('-------------------->:updateCategoryInRow(0,B2BC))');        this.updateCategoryInRow(0,'B2BC');


            this.cd.detectChanges();
          }


}, 2000);
}
updateCategoryInRow(rowIndex: number,newValue: string = 'Dealer') {
  // 1. Get the parent FormArray
  const variantsArray  = <any>(this.form.get('variants')) as FormArray;


  if (variantsArray && variantsArray.length > rowIndex) {
    // 2. Get the specific row's FormGroup
    const rowGroup = variantsArray.at(rowIndex) as FormGroup;
    
    // 3. Get the customerCategory control inside that row
    const categoryControl = rowGroup.get('customerCategory');

    if (categoryControl) {
      // 4. Force the value update and mark it dirty/touched
      categoryControl.setValue(newValue);
      categoryControl.markAsDirty();
      categoryControl.updateValueAndValidity();
    }
  }
}

private patchForm(record: any) {
  // 2️⃣  Keep the value that matches the option’s value
  const cleaned = {
    ...record,
    variants: record.variants?.map((org: any) => ({
      ...org,
      customerCategory: org.customerCategory?.value ?? org.customerCategory
    })) ?? []
  };

  // 3️⃣  Patch the form **after** the options are ready
  this.model = cleaned;
  this.form.setValue(this.model);
  
}
/** optional – toggle a row programmatically */
  toggleRow(rowData: Product) { console.log('its toggleRow...............',!this.expandedRows[rowData.id!]);
  
    this.expandedRows[rowData.id!] = !this.expandedRows[rowData.id!];
  }
    
    onSubmit() {
    if (!this.form.valid) {console.log('invalid form..');
      console.log('InvalidForm data :', this.model);
    }else
    if (this.form.valid) {
      console.log('Form data submitted:', this.model);
    
      this.saveProduct();
       
      
    }
  }

  
    async  saveProduct() {
      this.currOpMode=FormOpMode.View; this.isFormHidden=true;
        if ( !this.form.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product Name and Category is required' });
          return;
        }

        
        // TODO: Implement API call to save order
    this.model.tenantId=this.tenantId; console.log('Creating customer with model:',this.model);
         try{
           const res = await firstValueFrom(this.prodVariantService.createProductWithVariant(this.model))
           //.subscribe(res=>console.log('Product saved successfully!',res)   )
     
     //refresh grid
         this.getProductList();
        console.log('Saving Product:', this.model);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Product saved successfully' });
          this.currOpMode=FormOpMode.View; 
      } catch (error) {
    console.error('Save failed', error);
    this.form.reset();
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save customer' });
  }
    }

    removeProduct(index: number) {
    this.products?.splice(index, 1);
      }

      clearProduct() {
        //this.model = { tenantId:0,prodName: '' ,variants:[]};
        this.form.reset();
      }

}
