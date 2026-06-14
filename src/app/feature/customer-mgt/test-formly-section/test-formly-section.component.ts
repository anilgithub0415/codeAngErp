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

import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';

import { PanelModule } from 'primeng/panel';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';




 import { FORMLY_ROW_REGISTRY } from '../formly-registry';
import { RepeatsectionComponent } from '../../../shared/components/formlyfields/repeatsection/repeatsection.component';



@Component({
  selector: 'app-test-formly-section',
  imports: [CommonModule,ReactiveFormsModule, FormlyModule, FormsModule,SelectModule
      
      ,FormlyInputModule,PanelModule],
  templateUrl: './test-formly-section.component.html',
  styleUrl: './test-formly-section.component.scss'
})
export class TestFormlySectionComponent {
  private formService=inject(FormService)
  private lookupService=inject(LookupService);
 form = new FormGroup({});
  fields: FormlyFieldConfig[]=[];
  model = {  };
   aForm!:any;
//to:any;
to?: Record<string, any>;
 private authServ = inject(AuthService);


   private formlyConfig = inject(FormlyConfig);
  ngOnInit(): void {
    this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),
             
          this.formlyConfig.setType({
                name: 'primeng-dropdown',
                component: FormlyFieldPrimengDropdownComponent,
              });
             this.formlyConfig.setType({
                name: 'p-repeatsectionformly',
                component: RepeatsectionComponent,
              });
              this.formlyConfig.setType({
                name:'custom',component:FormlyCustomRowBridgeComponent
              })
            //// ← add this line
                this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent })

            this.getForm_Customer();
          
            }

  getForm_Customer(){
//formkey:customer_form

var tenantId=this.authServ.getTenantId(); 
var raw:FormlyFieldConfig[]=[];
    // this.formService.getForm(tenantId!,'customer_form').subscribe(aform=>{
      
      
    //   this.aForm=aform; 
     
      
    //    raw=JSON.parse(this.aForm.FormlyConfig) ;
      

    //    const hydrated = this.hydrateFormlyConfig(raw);
      

    //   // 3️⃣ Assign to the Formly component
    //   this.fields = hydrated;
      
    // })
  //}
//----------------------------------------------------------------------
  //sample raw json below, which is master-detail
  //----------------------------------------------------------------------
// raw = [
//   {
//     "key": "customerName",
//     "type": "input",
//     "props": {
//       "label": "Customer Name",
//       "placeholder": "Enter customer name",
//       "required": true
//     }
//   },
//   {
//     "key": "organisations",
//     "type": "p-repeatsectionformly",
//     "wrappers": ["panel"],
//     "defaultValue": [],
//     "props": {
//       "label": "Organisations",
//       "addText": "Add Organisation"
//     },
//     "fieldArray": { "fieldGroupClassName": 'row p-fluid',
//     "fieldGroup": [
//       {
//         "type": "custom",
//         "props": {
//                     "rowTemplate": {
//                       "key": "organisations[${index}]",
//                       "fieldGroupClassName": "formgrid grid",//p-grid p-fluid .customerCategory
//                       "fieldGroup": [
//                         {
//                           "type": "input",
//                           "key": "organisationName",
//                           "className": "col-12",
//                           "props": {
//                             "label": "Organisation",
//                             "placeholder": "Enter name",
//                             "required": true
//                           }
//                         },
//                         {
//                           "type": "primeng-dropdown",
//                           "key": "customerCategory",
//                           "className": "col-12 col-md-3",
//                           "props": {
//                             "label": "Customer Category",
//                             "optionLabel": "label",
//                             "optionValue": "value",
//                             "placeholder": "Select Category",
//                             "lookupKey": "customerCategoryTypes",
//                             "required": true,
//                             "filter": true
//                           }
//                         },
//                         {
//                           "type": "input",
//                           "key": "contactPersonName",
//                           "className": "col-12 col-md-2",
//                           "props": { "label": "Contact Person", "placeholder": "Enter name" }
//                         },
//                         // {
//                         //   "type": "input",
//                         //   "key": "mobileNumber",
//                         //   "className": "col-12 col-md-2",
//                         //   "props": { "label": "Mobile Number", "placeholder": "e.g. +1‑555‑123‑4567" }
//                         // },
//                         // {
//                         //   "type": "input",
//                         //   "key": "EmailId",
//                         //   "className": "col-12 col-md-2",
//                         //   "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" }
//                         // },
//                         // {
//                         //   "type": "input",
//                         //   "key": "city",
//                         //   "className": "col-12 col-md-2",
//                         //   "props": { "label": "City", "placeholder": "Enter city" }
//                         // },
//                         // {
//                         //   "type": "input",
//                         //   "key": "Remarks",
//                         //   "className": "col-12 col-md-12",
//                         //   "props": { "label": "Remarks", "placeholder": "Additional notes" }
//                         // },
//                         // {
//                         //   "type": "button",
//                         //   "className": "col-12 col-md-2 p-mt-4",
//                         //   "props": {
//                         //     "label": "Remove",
//                         //     "icon": "pi pi-trash",
//                         //     "styleClass": "p-button-danger",
//                         //     "onClick": "REMOVE_ROW"   // a sentinel that we will replace with real code
//                         //   }
//                         // }
//                       ]
//                     }//endof rowtemplate
//         }
//       }
//     ]
//   }
//   },
//   {
//     "type": "button",
//     "props": {
//       "text": "Save Customer",
//       "type": "submit",
//       "styleClass": "p-button-success"
//     }
//   }
// ]; 

raw=[
  {
    "key": "customerName",
    "type": "input",
    "props": {
      "label": "Customer Name",
      "placeholder": "Enter customer name",
      "required": true
    }
  },
  {
    "key": "organisations", 
    "type": "p-repeatsectionformly",
    "wrappers": ['panel'],
    "defaultValue": [],
    "props": {
      "label": "Organisations",
      "addText": "Add Organisation"
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",//"flex flex-wrap grid align-items-end", //formgrid grid align-items-end
      "fieldGroup": [
        {
          "type": "input",
          "key": "organisationName",
          "className": "col-span-12 md:col-span-12", 
          "props": {
            "label": "Organisation",
            "placeholder": "Enter name",
            "required": true
          }
        },
        {
          "type": "primeng-dropdown",
          "key": "customerCategory",
          "className": "col-span-6 md:col-span-5",
          "props": {
            "label": "Customer Category",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select Category",
            "lookupKey": "customerCategoryTypes",
            "required": true,
            "filter": true
          }
        },
        // {
        //   "type": "input",
        //   "key": "contactPersonName",
        //   "className": "col-12 md:col-span-12",
        //   "props": { 
        //     "label": "Contact Person", 
        //     "placeholder": "Enter name" 
        //   }
        // }
      ]
    }
  }
]

this.fields=this.hydrateFormlyConfig(raw);


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

  onSubmit() {
    if (!this.form.valid) {console.log('invalid form..');
      console.log('InvalidForm data :', this.model);
    }else
    if (this.form.valid) {
      console.log('Form data submitted:', this.model);
    }
  }
}
