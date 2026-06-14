import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { FormService } from '../../../core/services/form.service';
import {CustomerService} from '../../../core/services/customer.service'
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';


import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { FormlyConfig, FormlyField, FormlyFieldConfig, FormlyModule, provideFormlyCore,  } from '@ngx-formly/core';
import { ToastModule } from 'primeng/toast';
import { Observable } from 'rxjs';

import { SelectModule } from 'primeng/select';

//import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldDropdownComponent} from '../../../shared/components/formlyfields/formly-field-dropdown/formly-field-dropdown.component';

import { PanelModule } from 'primeng/panel';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';




 import { FORMLY_ROW_REGISTRY } from '../formly-registry';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';



@Component({
  selector: 'app-test',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  //standalone:false,
  
  imports: [CommonModule,ReactiveFormsModule, FormlyModule, FormsModule,SelectModule
    
    ,FormlyInputModule,PanelModule, TableModule,ButtonModule,RippleModule
  ],
 
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent implements OnInit{
expandedRows: { [key: string]: boolean } = {};
 //[ { "key": "id",     "type": "input",     "hide": false  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "p-grid p-fluid flex flex-wrap",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-6 md-5",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-6 md-3",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-6 md-2",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         },                         {                           "type": "input",                           "key": "mobileNumber",                           "className": "col-4 md-2",                           "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567" }                         },                         {                           "type": "input",                           "key": "EmailId",                           "className": "col-4 md-2",                           "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" }                         },                         {                           "type": "input",                           "key": "city",                           "className": "col-4 md-2",                           "props": { "label": "City", "placeholder": "Enter city" }                         },                         {                           "type": "input",                           "key": "Remarks",                           "className": "col-6 md-12",                           "props": { "label": "Remarks", "placeholder": "Additional notes" }                         },                                {       "key": "creditDays",        "type": "input",        "className": "col-4 md-2",        "props": { "label": "Credit Days", "placeholder": "Enter credit days" }        },               {       "key": "creditLimit",        "type": "input",        "className": "col-4 md-2",        "props": { "label": "Credit Limit", "placeholder": "Enter credit limit" }        },                         {                           "type": "button",                           "className": "col-12 md-2 p-mt-4",                           "props": {                             "label": "Remove",                             "icon": "pi pi-trash",                             "styleClass": "p-button-danger",                             "onClick": "REMOVE_ROW"                              }                         }                       ]                     }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]
    fields: FormlyFieldConfig[] = 
    [ { "key": "id",     "type": "input",     "hide": true  }, 
      { "key": "tenantId",     "type": "input",     "hide": true  },   
      {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   
      {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "p-grid p-fluid flex flex-wrap",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-6 md-5",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-6 md-3",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-6 md-2",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         },                         {                           "type": "input",                           "key": "mobileNumber",                           "className": "col-4 md-2",                           "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567" }                         },                         {                           "type": "input",                           "key": "EmailId",                           "className": "col-4 md-2",                           "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" }                         },                         {                           "type": "input",                           "key": "city",                           "className": "col-4 md-2",                           "props": { "label": "City", "placeholder": "Enter city" }                         },                         {                           "type": "input",                           "key": "Remarks",                           "className": "col-6 md-12",                           "props": { "label": "Remarks", "placeholder": "Additional notes" }                         },                                {       "key": "creditDays",        "type": "input",        "className": "col-4 md-2",        "props": { "label": "Credit Days", "placeholder": "Enter credit days" }        },               {       "key": "creditLimit",        "type": "input",        "className": "col-4 md-2",        "props": { "label": "Credit Limit", "placeholder": "Enter credit limit" }        },                         {                           "type": "button",                           "className": "col-12 md-2 p-mt-4",                           "props": {                             "label": "Remove",                             "icon": "pi pi-trash",                             "styleClass": "p-button-danger",                             "onClick": "REMOVE_ROW"                              }                         }                       ]                     }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]
//     [
//   {                      
//     fieldGroupClassName: 'p-fluid p-grid flex flex-wrap', // Legacy grid parent
//     fieldGroup: [
//       {
//         key: 'firstName',
//         type: 'input',
//         className: 'col-12 md-col-4', // Legacy column layout prefix
//         templateOptions: { label: 'First Name' },
//       },
//       {
//         key: 'lastName',
//         type: 'input',
//         className: 'col-4',
//         templateOptions: { label: 'Last Name' },
//       },{
//         key: 'topenname',
//         type: 'input',
//         className: 'col-4',
//         templateOptions: { label: 'Topen Name' },
//       },
//     ],
//   },
// ];

private formlyConfig = inject(FormlyConfig);

 tenantId!: number;    
 form = new FormGroup({});
 model={}
     constructor( private messageService: MessageService
       ,private authServ:AuthService
     ){
   
     }
  
    ngOnInit(): void {
     
     this.tenantId = this.authServ.getTenantId()!;   // <-- store once
 
      this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),
               
            this.formlyConfig.setType({
                  name: 'primeng-dropdown',
                  component: FormlyFieldPrimengDropdownComponent,
                });
               this.formlyConfig.setType({ 
                  name: 'p-repeatsectionformly',
                  component: RepeatsectionformlyComponent,
                });
                this.formlyConfig.setType({
                  name:'custom',component:FormlyCustomRowBridgeComponent
                })
              //// ← add this line
                  this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent })



 var raw:any;
       //[ { "key": "id","type": "input","hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",        "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "formgrid grid",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-6 md-5 p-fluid",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-6 md-3 p-fluid",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-12 md-2 p-fluid",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         },                         {                           "type": "input",                           "key": "mobileNumber",                           "className": "col-4 md-2 p-fluid",                           "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567" }                         },                         {                           "type": "input",                           "key": "EmailId",                           "className": "col-4 md-2 p-fluid",                           "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" }                         },                         {                           "type": "input",                           "key": "city",                           "className": "col-4 md-2 p-fluid",                           "props": { "label": "City", "placeholder": "Enter city" }                         },                         {                           "type": "input",                           "key": "Remarks",                           "className": "col-6 md-12 p-fluid",                           "props": { "label": "Remarks", "placeholder": "Additional notes" }                         },                                {       "key": "creditDays",        "type": "input",        "className": "col-4 md-2 p-fluid",        "props": { "label": "Credit Days", "placeholder": "Enter credit days" }        },               {       "key": "creditLimit",        "type": "input",        "className": "col-4 md-2 p-fluid",        "props": { "label": "Credit Limit", "placeholder": "Enter credit limit" }        },                         {                           "type": "button",                           "className": "col-12 md-2 p-mt-4",                           "props": {                             "label": "Remove",                             "icon": "pi pi-trash",                             "styleClass": "p-button-danger",                             "onClick": "REMOVE_ROW"                              }                         }                       ]                     }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]
        raw=JSON.parse('[ { "key": "id","type": "input","hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",        "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "formgrid grid",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-6 md-5 p-fluid",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-6 md-3 p-fluid",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-12 md-2 p-fluid",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         },                                                  {                           "type": "button",                           "className": "col-12 md-2 p-mt-4",                           "props": {                             "label": "Remove",                             "icon": "pi pi-trash",                             "styleClass": "p-button-danger",                             "onClick": "REMOVE_ROW"                              }                         }                       ]                     }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]') ;
       
         console.log('calling............hydration');
         
        const hydrated = this.hydrateFormlyConfig(raw);
        
 
       // 3️⃣ Assign to the Formly component
       this.fields = hydrated;
  console.log('i got hydrated:',this.fields);
  }





 private hydrateFormlyConfig(rawConfig: any[]): FormlyFieldConfig[] {
   
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

onSubmit(){

}
    
}
