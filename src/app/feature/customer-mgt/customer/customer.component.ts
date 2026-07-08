import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormService } from '../../../core/services/form.service';
import {CustomerService} from '../../../core/services/customer.service'
import { CommonModule } from '@angular/common';
import { DefaultValueAccessor, FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Customer} from '../../../core/models/customer.model'

import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { FormlyConfig, FormlyField, FormlyFieldConfig, FormlyModule, provideFormlyCore,  } from '@ngx-formly/core';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom, Observable, take, tap } from 'rxjs';

import { SelectModule } from 'primeng/select';

import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { RepeatFormlySectionComponent } from '../../../shared/components/formlyfields/repeat-formly-section/repeat-formly-section.component';
import { CUSTOMER_FORMLY_CONFIG } from '../formlyConfig';
import { InputTextModule } from 'primeng/inputtext';
import { FormlyPrimeNGModule, withFormlyPrimeNG } from '@ngx-formly/primeng';
import { PanelModule } from 'primeng/panel';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';



 import { FORMLY_ROW_REGISTRY, PlainFormlyFieldConfig } from '../formly-registry';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { RepeatsectionformlyNewComponent } from '../../../shared/components/formlyfields/repeatsectionformly-new/repeatsectionformly-new.component';
//import { FormlyCustomRowBridgeNewComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge-new/formly-custom-row-bridge-new.component';

import { RegistryFieldConfig } from '../formly-registry';   // <-- adjust the path if you put it elsewhere
import { isObject } from './utils/object-guards';
import { FormlyCustomRowBridgeNewComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge-new/formly-custom-row-bridge-new.component';
import { organisationRowTemplate } from '../../../shared/components/formlyfields/organisation-row/organisation-row.template';
import { ClientStatus } from '../../../shared/enums/ClientStatus.enum';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { typeaheadSearchExtension } from '../../../shared/components/formlyfields/typeaheadSearchExtension';
import { checkMobileExists } from './utils/check-mobile,validator';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { applyLocalSearchExtension } from '../../../shared/utils/hydrationOfFormlyJson';

@Component({
  selector: 'app-customer',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule,ToastModule ,ReactiveFormsModule, FormsModule,
     FormlyModule, FormsModule,SelectModule ,InputTextModule,FormlyInputModule,
     PanelModule,  TableModule,RippleModule,ButtonModule,
     FilterControlComponent
      
    ],
  providers:[MessageService

         
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {
  searchInput:any;searchString:any;visibleDataArray!: any[] ;
 tenantId!: number;          // <-- new property
 isFormHidden:boolean=true;
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; customerDetailsRequired:boolean=true;
  clientstatus:ClientStatus=ClientStatus.NewLead;
raw:any;

leftCol = '30%'; rowHeight="50"
  form = new FormGroup({});
    model= {tenantId:0,customerName:'',customerCategory:'',customer_autocode:''
      ,clientStatus:ClientStatus.NewLead,leadSource:'',mobileNumber:'',EmailId:''
      ,city:'',creditDays:0,creditLimit:0,
       };//Partial<createCustomer> 
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;
 options$!:any[]
    
   customers: Customer[] |undefined = [] ; 
   //customers: PersonMaster[] = [] ; 
   expandedRows: { [id: number]: boolean } = {};
//expandedRows: { [key: string]: boolean } = {};

    private formService=inject(FormService);
    private customerService=inject(CustomerService)
    private formlyConfig = inject(FormlyConfig);
    private authServ=inject(AuthService)
    private lookupService=inject(LookupService)
 private messageService=inject(MessageService)
    constructor( private cd: ChangeDetectorRef
      
    ){
  
    }
 
   ngOnInit(): void {
    this.model= {tenantId:0,customerName:'',customerCategory:'',customer_autocode:''
      ,clientStatus:ClientStatus.NewLead,leadSource:'',mobileNumber:'',EmailId:''
      ,city:'',creditDays:0,creditLimit:0,
     };

    this.tenantId = this.authServ.getTenantId()!;   // <-- store once

     this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),
  
           this.formlyConfig.setType({
              name: 'primeng-dropdown',
              component: FormlyFieldPrimengDropdownComponent,
            });
  this.formlyConfig.validators['mobileExistsCheck'] = {
  name: 'mobileExistsCheck',
  validation: (control:any) => {
    // `checkMobileExists` must return an Observable<boolean> | Promise<boolean>
    return checkMobileExists(this.tenantId, this.customerService)(control);
  }
} //as ValidatorOption; 

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
 
 this.getForm_Customer();
 this.getCustomerList().then(custs=>{
    this.customers=custs;   this.visibleDataArray= [...this.customers!];
  }).catch(err=>{    console.error('Error:',err)  });
           
 }
  

 //For Filter data
 onDataFiltered(filteredResults: any[]) { 
 
    this.visibleDataArray = filteredResults;
    console.log('onDataFilter..............visibleDataArray:',this.visibleDataArray.length);
  }
   getForm_Customer(){
 //formkey:customer_form
  
 //var raw:any;
     this.formService.getForm(this.tenantId!,'customer_form').subscribe(aform=>{
       
       
       this.aForm=aform; 
      
      //console.log('this.aForm.FormlyConfig:',this.aForm.FormlyConfig);
      
       
        this.raw=JSON.parse(this.aForm.FormlyConfig) ;
        
  
     });





     //without $index and rowtemplate
     this.raw=[
  { "key": "id", "type": "input", "hide": true },
  { "key": "createdByUserId", "type": "input", "hide": true },
  { "key": "tenantId", "type": "input", "hide": true },
  {
    "type": "input",
    "hide": true,
    "key": "clientStatus",
    "props": {
      "label": "clientStatus",
      "placeholder": "Enter clientStatus",
      "required": true
    }
  },

  {
    "wrappers": ["panel"],
    "className": "col-span-24 w-full block mb-0",
    "props": {
     // "label": "Lead Information"
        },
    "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
   
    "fieldGroup": [
      {
  "key": "customerName",
  "type": "input",
  //"searchable": true,                     // ← tells the extension to treat this as a type‑ahead field
  //"dataSource": "customers",               // ← identifier your on‑input code will use to fetch suggestions
  //"wrappers": ["typeahead-wrapper"],       // optional – the extension adds this automatically
  "className": "col-span-7 md:col-span-6",
  "props": {
    "label": "Client Name",
    "placeholder": "Enter client name",
    "required": true,
    //"searchable": true,                    // same flag can be placed inside props; the guard checks both places
    //"dataSource": "customers"
  }
},  {
          "type": "primeng-dropdown",
          "key": "customerCategoryId",
          "className": "col-span-6 md:col-span-4",
          "props": {
            "label": "Client Type",
            "valueProp": "value",
            "labelProp": "label",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select Category",
            "lookupKey": "customerCategoryTypes",
            "required": true,
            "filter": true
          }
        },
        
        {
          "type": "input",
          "key": "mobileNumber",
          "resetOnHide": true,
          "className": "col-span-6 md:col-span-4",
          "props": {
           "label": "Mobile Number",
            "placeholder": "e.g. +1-555-123-4567",
            //"searchable":true
          }
          
        },
      {
        "type": "primeng-dropdown",
        "key": "leadSource",
        "className": "col-span-5 md:col-span-6",
        "props": {
          "label": "Source",
          "optionLabel": "label",
          "optionValue": "value",
          "placeholder": "Select LeadSource",
          "lookupKey": "leadSourceTypes",
          "filter": true
        }
      },
      {
          "type": "input",
          "key": "EmailId",
          "className": "col-span-6 md:col-span-4",
          "props": {
            "label": "Email",
            "placeholder": "example@domain.com",
            "type": "email","pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
          }
        },
        {
          "type": "primeng-dropdown",
          "key": "city",
          "className": "col-span-6 md:col-span-4",
          "props": {
            "label": "City", 
            "valueProp": "value",
            "labelProp": "label",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select City",
            "lookupKey": "cityTypes",
            "filter": true
          }
        },
        
        {
          "key": "creditDays",
          "type": "input",
          "className": "col-span-6 md:col-span-2",
          "props": {
            "label": "CreditDays",
            "placeholder": ""
          }
        },
        {
          "key": "creditLimit",
          "type": "input",
          "className": "col-span-6 md:col-span-2",
          "props": {
            "label": "CreditLimit",
            "placeholder": ""
          }
        },
    ]
  },

  {
    "key": "sites",
    "type": "p-repeatsectionformly",
    "wrappers": ["panel"],
    "defaultValue": [],
    "props": {
      "label": "",
      "addText": "Add site"
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
      "fieldGroup": [
        { "key": "id", "type": "input", "hide": true },
        {
          "type": "input",
          "key": "siteName",
          "className": "col-span-12 md:col-span-10",
          "props": {
            //"label": "Site Name",
            "placeholder": "Enter name",
            
          },
            "expressions": {
                 "props.label": "field.parent.index === 0 ? 'Site name' : ''"
             }
        },
        {
          "type": "input",
          "key": "contactPersonName",
          "className": "col-span-12 md:col-span-10",
          "props": {
            //"label": "Contact Person",
            "placeholder": "Enter Contact Person"
          },
            "expressions": {
                 "props.label": "field.parent.index === 0 ? 'Contact Person' : ''"
             }
        },
        
       
      ]
    }
  },
  {
    "type": "button",
    "className": "col-span-12 md:col-span-3 mt-4",
    "props": {
      "text": "Save Customer",
      "type": "submit",
      "styleClass": "p-button-success"
    }
  }
]


        const hydrated = this.hydrateFormlyConfig1(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
        
        applyLocalSearchExtension(this.fields);







   
   } 
 
 
 
  
 
 private hydrateFormlyConfig1(rawConfig: any[]): FormlyFieldConfig[] {
   
   
   // Walk the tree and replace every placeholder with the real function
   const walk = (fields: any[]) => {
     fields.forEach(f => {

   

       // 1️⃣ repeat‑section rows
       if (f.fieldArray?.fieldGroup) {
         walk(f.fieldArray.fieldGroup);
       }
 
       //this rowbuilder part was used when detail part JSON was not there like sites
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
     // `fld.parent` points to the repeat container (sites)
     const arr = fld.parent.model.sites as any[];
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

        
    

          // ---- replace the sentinel "REMOVE_ROW" with a real function -------
          const replaceSentinel = (field: any) => {
if (field.props?.onClick === 'REMOVE_ROW') {
  field.props.onClick = (_event: any, fld: any) => {
    // `fld.parent` points to the repeat container (e.g. sites)
    const arr = fld.parent.model.sites as any[];
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
      // No extra work needed – the expressions are already stored on the
      // individual field objects.  We only ensured that the `model` object
      // (and therefore the `customerDetailsRequired` flag) exists on each
      // row during step 3.
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

//  private getCustomerDetailsFlag(): boolean {
//   const orgArray = this.form.value?.sites! ?? [];
//   // Assuming a single site row (or adapt the index as needed)
//   return (orgArray[0] as any)?.customerDetailsRequired ?? false;
// }
  getCustomerList(): Promise<any[]> {
  const observable$ = this.customerService.getCustomers(this.tenantId).pipe(
    tap((custs: any) => {
      console.log('customers:',custs);
      this.visibleDataArray=[...custs];
      // 🌟 FIXED: Force completely new reference pointer allocation
      this.customers = JSON.parse(JSON.stringify(custs)); 
      this.cd.markForCheck(); // Ensures UI updates even if using ChangeDetectionStrategy.OnPush
      this.cd.detectChanges();
    })
  );
  return firstValueFrom(observable$);
}

      Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    this.clientstatus = ClientStatus.NewLead;
    this.customerDetailsRequired = false;
    
    // Explicitly reset layout validation schemas to handle isolated model creation fields safely
    this.form.reset();

    this.model = {
      id: 0, // Zero states signal brand new model instantiations
      tenantId: this.tenantId,
      customerName: '',
      customerCategory: '',
      customer_autocode: '',
      clientStatus: ClientStatus.NewLead,
      leadSource: '',
      mobileNumber: '',
      EmailId: '',
      city: '',
      creditDays: 0,
      creditLimit: 0,
      sites: [] // Clean empty row arrays instantiation
    } as any;
  }

  async onEditClick(selectedRecord: any) {
    console.log('Selected record for edit:', selectedRecord);
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update; 
    localStorage.setItem('currOpMode', this.currOpMode);
    
    // Unify sub-collection objects cleanly across row templates prior to formly model evaluation
    const cleaned = {
      ...selectedRecord,
      sites: selectedRecord.sites?.map((org: any) => ({
        ...org,
        customerDetailsRequired: true,
        customerCategory: org.customerCategory?.value ?? org.customerCategory
      })) ?? []
    };

    this.model = cleaned; // Model holds this record's primary ID key tracking target safely now

    setTimeout(() => {
      try {
        this.form.patchValue(cleaned);
        console.log('Successfully patched form fields structure inside Update context window.');
      } catch (error) {
        console.error('An error occurred during formly layout synchronization:', error);
      }
      this.cd.markForCheck();
      this.cd.detectChanges();
    }, 50);
  }

  async saveCustomer() {
    if (!this.form.valid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Leak Detected', 
        detail: 'Please configure mandatory fields correctly before syncing details.' 
      });
      return;
    }

    // Merge layout context metrics securely onto submission parameters snapshots
    const submissionPayload = {
      ...this.model,
      ...this.form.value,
      tenantId: this.tenantId
    } as any;

    try {
      let response: any;

      // Smart tracking switch routing state transactions securely
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        console.log('Routing PUT modification layout context metrics for ID:', submissionPayload.id);
        response = await firstValueFrom(
          this.customerService.updateCustomer(submissionPayload.id, submissionPayload)
        );
        this.messageService.add({ severity: 'success', summary: 'Updated Successfully', detail: 'Customer and attached sub-sites updated.' });
      } else {
        console.log('Routing fresh POST customer record creation across isolated multi-tenant workspaces...');
        response = await firstValueFrom(
          this.customerService.createCustomer(submissionPayload) // Standard creation call wrapper
        );
        this.messageService.add({ severity: 'success', summary: 'Creation Success', detail: 'Customer profile registration generated successfully.' });
      }

      // Shared cleanup routine logic tracking variables
      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();
      
      // Force instant data reload view refresh sync pointer allocation loops
      await this.getCustomerList();
      this.cd.detectChanges();

    } catch (error: any) {
      console.error('Customer save transaction matrix thread crash error:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Database Write Core Rejected', 
        detail: error.message || 'An error occurred while saving the ledger context metrics dataset.' 
      });
    }
  }


CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}

updateCategoryInRow(rowIndex: number,newValue: string = 'Dealer') {
  // 1. Get the parent FormArray
  const sitesArray  = <any>(this.form.get('sites')) as FormArray;


  if (sitesArray && sitesArray.length > rowIndex) {
    // 2. Get the specific row's FormGroup
    const rowGroup = sitesArray.at(rowIndex) as FormGroup;
    
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
    sites: record.sites?.map((org: any) => ({
      ...org,
      customerCategory: org.customerCategory?.value ?? org.customerCategory
    })) ?? []
  };

  // 3️⃣  Patch the form **after** the options are ready
  this.model = cleaned;
  this.form.setValue(this.model);
  
}
/** optional – toggle a row programmatically */
  toggleRow(rowData: Customer) { console.log('its toggleRow...............',!this.expandedRows[rowData.id]);
  
    this.expandedRows[rowData.id] = !this.expandedRows[rowData.id];
  }

  
    
    removeCustomer(index: number) {
    this.customers?.splice(index, 1);
      }

      clearCustomer() {
        //this.model = { tenantId:0,customerName: '' ,sites:[]};
        this.form.reset();
      }

}
