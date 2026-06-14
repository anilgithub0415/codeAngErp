import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormService } from '../../../core/services/form.service';
import {CustomerService} from '../../../core/services/customer.service'
import { CommonModule } from '@angular/common';
import { DefaultValueAccessor, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Customer} from '../../../core/models/customer.model'

import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { FormlyConfig, FormlyField, FormlyFieldConfig, FormlyModule, provideFormlyCore,  } from '@ngx-formly/core';
import { ToastModule } from 'primeng/toast';
import { Observable } from 'rxjs';

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



 import { FORMLY_ROW_REGISTRY } from '../formly-registry';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-customer',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule,ToastModule ,ReactiveFormsModule, FormsModule,
     FormlyModule, FormsModule,SelectModule ,InputTextModule,FormlyInputModule,
     PanelModule,  TableModule,RippleModule,ButtonModule
      
    ],
  providers:[MessageService

         
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {
 tenantId!: number;          // <-- new property
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; customerDetailsRequired:boolean=true;

raw:any;

leftCol = '30%'; rowHeight="50"
  form = new FormGroup({});
    model= {tenantId:0,customerName:'',organisations:[{organisationName:'',customerCategory:'',contactPersonName:'',customerDetailsRequired:true,mobileNumber:'',EmailId:'',city:'',Remarks:'',creditDays:0,creditLimit:0}] };//Partial<createCustomer> 
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


    constructor( private messageService: MessageService
      ,private authServ:AuthService
    ){
  
    }
 
   ngOnInit(): void {
    this.model={tenantId:0,customerName:'',organisations:[{organisationName:'',customerCategory:'',contactPersonName:'',customerDetailsRequired:false,mobileNumber:'',EmailId:'',city:'',Remarks:'',creditDays:0,creditLimit:0}] };//Partial<createCustomer> 
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
 
             this.getForm_Customer();
             this.getCustomerList()
           
             }
 
   getForm_Customer(){
 //formkey:customer_form
  
 //var raw:any;
     this.formService.getForm(this.tenantId!,'customer_form').subscribe(aform=>{
       
       
       this.aForm=aform; 
      
      //console.log('this.aForm.FormlyConfig:',this.aForm.FormlyConfig);
      
       
        this.raw=JSON.parse(this.aForm.FormlyConfig) ;
        
        //raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-span-4 md:col-span-4",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-span-2 md:col-span-2",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-span-4 md:col-span-4",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         },                         {                           "type": "input",                           "key": "mobileNumber",                           "className": "col-span-2 md:col-span-2",                           "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567" }                         },                         {                           "type": "input",                           "key": "EmailId",                           "className": "col-span-3 md:col-span-3",                           "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" }                         },                         {                           "type": "input",                           "key": "city",                           "className": "col-span-3 md:col-span-3",                           "props": { "label": "City", "placeholder": "Enter city" }                         },                         {                           "type": "input",                           "key": "Remarks",                           "className": "col-span-3 md:col-span-3",                           "props": { "label": "Remarks", "placeholder": "Additional notes" }                         },                                {       "key": "creditDays",        "type": "input",        "className": "col-span-2 md:col-span-2",        "props": { "label": "Credit Days", "placeholder": "Enter credit days" }        },               {       "key": "creditLimit",        "type": "input",        "className": "col-span-2 md:col-span-2",        "props": { "label": "Credit Limit", "placeholder": "Enter credit limit" }        },                         {                           "type": "button",                           "className": "col-span-3 md:col-span-3",                           "props": {                             "label": "Remove",                             "icon": "pi pi-trash",                             "styleClass": "p-button-danger",                             "onClick": "REMOVE_ROW"                              }                         }                       ]                     }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]
        this.raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-span-4 md:col-span-4",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-span-2 md:col-span-2",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-span-4 md:col-span-4",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         }, {   "type": "checkbox", "key": "customerDetailsRequired",    "defaultValue":true,                    "className": "col-span-12 md:col-span-12",                           "props": { "label": "customerDetailsRequired", "placeholder": "customerDetailsRequired"}     }, {             "type": "input",               "key": "mobileNumber",  "resetOnHide":true, "className": "col-span-2 md:col-span-2",     "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567"}, "expressionProperties": {"hide":"!field.parent.parent.model.customerDetailsRequired"}         },  {                           "type": "input",                           "key": "EmailId",   "hide":true ,      "className": "col-span-3 md:col-span-3",                           "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" } , "expressions": {"hide":"field.model.customerDetailsRequired !== true"}      }, {   "type": "input", "key": "city", "hide":true ,  "className": "col-span-3 md:col-span-3",                           "props": { "label": "City", "placeholder": "Enter city" } , "expressions": {"hide":"field.model.customerDetailsRequired !== true"}  },  {  "type": "input", "key": "Remarks", "hide":true ,  "className": "col-span-3 md:col-span-3",                           "props": { "label": "Remarks", "placeholder": "Additional notes" } , "expressions": {"hide":"field.model.customerDetailsRequired !== true"}   }, {    "key": "creditDays",        "type": "input", "hide":true ,        "className": "col-span-2 md:col-span-2",        "props": { "label": "Credit Days", "placeholder": "Enter credit days" }  , "expressions": {"hide":"field.model.customerDetailsRequired !== true"}   },  {       "key": "creditLimit",        "type": "input",  "hide":true ,       "className": "col-span-2 md:col-span-2",        "props": { "label": "Credit Limit", "placeholder": "Enter credit limit" } , "expressions": {"hide":"field.model.customerDetailsRequired !== true"}  },  {  "type": "button",                           "className": "col-span-3 md:col-span-3",                           "props": {                             "label": "Remove",                             "icon": "pi pi-trash",                             "styleClass": "p-button-danger",                             "onClick": "REMOVE_ROW"                              }                         }                       ]                     }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]
        //{"hide":"!field.model.customerDetailsRequired !== true"} 
// 

        //raw =[{"key":'needFood',"type":"checkbox","defaultValue":false},{"key":'Breakfast',"type":"input", "expressionProperties" :{"hide":"!model.needFood"},"props":{"label":"breakfast"}},          {"key":'dinner',"type":"input", "expressionProperties" :{"hide":true},"props":{"label":"dinner"}}    ]
     
              //console.log('i got raw chged:',raw);
        
              //  raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-span-6 md:col-span-5",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-span-6 md:col-span-3",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-span-6 md:col-span-2",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         },                         {                           "type": "input",                           "key": "mobileNumber",                           "className": "col-span-4 md:col-span-2",                           "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567" }                         },                         {                           "type": "input",                           "key": "EmailId",                           "className": "col-span-4 md:col-span-2",                           "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" }                         },                         {                           "type": "input",                           "key": "city",                           "className": "col-span-4 md:col-span-2",                           "props": { "label": "City", "placeholder": "Enter city" }                         },                         {                           "type": "input",                           "key": "Remarks",                           "className": "col-span-6 md:col-span-12",                           "props": { "label": "Remarks", "placeholder": "Additional notes" }                         },                                {       "key": "creditDays",        "type": "input",        "className": "col-span-4 md:col-span-2",        "props": { "label": "Credit Days", "placeholder": "Enter credit days" }        },               {       "key": "creditLimit",        "type": "input",        "className": "col-span-4 md:col-span-2",        "props": { "label": "Credit Limit", "placeholder": "Enter credit limit" }        },                         {                           "type": "button",                           "className": "col-span-12 md:col-span-2",                           "props": {                             "label": "Remove",                             "icon": "pi pi-trash",                             "styleClass": "p-button-danger",                             "onClick": "REMOVE_ROW"                              }                         }                       ]                     }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]
      //  raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-span-6 md:col-span-5",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-span-6 md:col-span-3",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-span-6 md:col-span-2",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         },                                                                                                                                                                                               ]                     }         }       }     ]   }   },    ];
      //  raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {                     "rowTemplate": {                       "key": "organisations[${index}]",                       "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",                       "fieldGroup": [                         {                           "type": "input",                           "key": "organisationName",                           "className": "col-span-6 md:col-span-12",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-span-6 md:col-span-4",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-span-6 md:col-span-4",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         },                                                                                                                                                                                               ]                     }         }       }     ]   }   },    ];

// raw=[{"key":'needFood',"type":"checkbox","defaultValue":false},{"key":'Breakfast',"type":"input", "expressionProperties" :{"hide":"!model.needFood"},"props":{"label":"breakfast"}}]
// raw=[
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
//     "wrappers": ['panel'],
//     "defaultValue": [],
//     "props": {
//       "label": "Organisations",
//       "addText": "Add Organisation"
//     },
//     "fieldArray": {
//       "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",//"flex flex-wrap grid align-items-end", //formgrid grid align-items-end
//       "fieldGroup": [
//         {
//           "type": "input",
//           "key": "organisationName",
//           "className": "col-span-6 md:col-span-6", 
//           "props": {
//             "label": "Organisation",
//             "placeholder": "Enter name",
//             "required": true
//           }
//         },
//         {
//           "type": "primeng-dropdown",
//           "key": "customerCategory",
//           "className": "col-span-6 md:col-span-6",
//           "props": {
//             "label": "Customer Category",
//             "optionLabel": "label",
//             "optionValue": "value",
//             "placeholder": "Select Category",
//             "lookupKey": "customerCategoryTypes",
//             "required": true,
//             "filter": true
//           }
//         },{
//           "type": "input",
//           "key": "Taluka",
//           "className": "col-span-6 md:col-span-4", 
//           "props": {
//             "label": "Taluka",
//             "placeholder": "Enter Tq",
//             "required": true
//           }
//         },{
//           "type": "input",
//           "key": "Dist",
//           "className": "col-span-6 md:col-span-4", 
//           "props": {
//             "label": "Dist",
//             "placeholder": "Dt",
//             "required": true
//           }
//         },{
//           "type": "input",
//           "key": "newf",
//           "className": "col-span-6 md:col-span-4", 
//           "props": {
//             "label": "newf",
//             "placeholder": "Enter newf",
//             "required": true
//           }
//         },
//         // {
//         //   "type": "input",
//         //   "key": "contactPersonName",
//         //   "className": "col-12 md:col-span-12",
//         //   "props": { 
//         //     "label": "Contact Person", 
//         //     "placeholder": "Enter name" 
//         //   }
//         // }
//         {"key":'needFood',"type":"checkbox","defaultValue":false},{"key":'Breakfast',"type":"input", "expressionProperties" :{"hide":"!model.needFood"},"props":{"label":"breakfast"}}
//       ]
//     }
//   }
// ]



// raw=[
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
//     "wrappers": ['panel'],
//     "defaultValue": [],
//     "props": {
//       "label": "Organisations",
//       "addText": "Add Organisation"
//     },
//     "fieldArray": {
//       "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",//"flex flex-wrap grid align-items-end", //formgrid grid align-items-end
//       "fieldGroup": [
//         {
//           "type": "input",
//           "key": "organisationName",
//           "className": "col-span-12 md:col-span-12", 
//           "props": {
//             "label": "Organisation",
//             "placeholder": "Enter name",
//             "required": true
//           }
//         },
//         {
//           "type": "primeng-dropdown",
//           "key": "customerCategory",
//           "className": "col-span-6 md:col-span-5",
//           "props": {
//             "label": "Customer Category",
//             "optionLabel": "label",
//             "optionValue": "value",
//             "placeholder": "Select Category",
//             "lookupKey": "customerCategoryTypes",
//             "required": true,
//             "filter": true
//           }
//         },
//         // {
//         //   "type": "input",
//         //   "key": "contactPersonName",
//         //   "className": "col-12 md:col-span-12",
//         //   "props": { 
//         //     "label": "Contact Person", 
//         //     "placeholder": "Enter name" 
//         //   }
//         // }
//       ]
//     }
//   }
// ]
        const hydrated = this.hydrateFormlyConfig(this.raw);
        
  console.log('..................hydrated:',hydrated);
  // Get the first (or current) organisation object from the form
// const firstOrganisation = this.form.value?.organisations!?.[0] ?? null;

// // The boolean flag is stored under `customerDetailsRequired` on that object
// const isChecked = firstOrganisation?.customerDetailsRequired ?? false;

// console.log('customerDetailsRequired =', isChecked);
       // 3️⃣ Assign to the Formly component
      // this.fields = hydrated;
       //       this.form.updateValueAndValidity();
      // setTimeout(() => this.form.updateValueAndValidity(), 0);
     })
   
 //----------------------------------------------------------------------
   //sample raw json below, which is master-detail
   //----------------------------------------------------------------------
//  raw = [
// {
//   "key": "id",
//   "type": "input",
//   "hide": true               // hidden but kept in the model
//   // or
//   // templateOptions: { readonly: true } // to show it as read‑only
// },
//{
//   "key": "tenantId",
//   "type": "input",
//   "hide": true               // hidden but kept in the model
//   // or
//   // templateOptions: { readonly: true } // to show it as read‑only
// },
//    {
//      "key": "customerName",
//      "type": "input",
//      "props": {
//        "label": "Customer Name",
//        "placeholder": "Enter customer name",
//        "required": true
//      }
//    },
//    {
//      "key": "organisations",
//      "type": "p-repeatsectionformly",
//      "wrappers": ["panel"],
//      "defaultValue": [],
//      "props": {
//        "label": "Organisations",
//        "addText": "Add Organisation"
//      },
//      "fieldArray": {
//      "fieldGroup": [
//        {
//          "type": "custom",
//          "props": {
//                      "rowTemplate": {
//                        "key": "organisations[${index}].customerCategory",
//                        "fieldGroupClassName": "p-grid p-fluid",
//                        "fieldGroup": [
//                          {
//                            "type": "input",
//                            "key": "organisationName",
//                            "className": "p-col-12 p-md-5",
//                            "props": {
//                              "label": "Organisation",
//                              "placeholder": "Enter name",
//                              "required": true
//                            }
//                          },
//                          {
//                            "type": "primeng-dropdown",
//                            "key": "customerCategory",
//                            "className": "p-col-12 p-md-3",
//                            "props": {
//                              "label": "Customer Category",
//                              "optionLabel": "label",
//                              "optionValue": "value",
//                              "placeholder": "Select Category",
//                              "lookupKey": "customerCategoryTypes",
//                              "required": true,
//                              "filter": true
//                            }
//                          },
//                          {
//                            "type": "input",
//                            "key": "contactPersonName",
//                            "className": "p-col-12 p-md-2",
//                            "props": { "label": "Contact Person", "placeholder": "Enter name" }
//                          },
//                          {
//                            "type": "input",
//                            "key": "mobileNumber",
//                            "className": "p-col-12 p-md-2",
//                            "props": { "label": "Mobile Number", "placeholder": "e.g. +1‑555‑123‑4567" }
//                          },
//                          {
//                            "type": "input",
//                            "key": "EmailId",
//                            "className": "p-col-12 p-md-2",
//                            "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" }
//                          },
//                          {
//                            "type": "input",
//                            "key": "city",
//                            "className": "p-col-12 p-md-2",
//                            "props": { "label": "City", "placeholder": "Enter city" }
//                          },
//                          {
//                            "type": "input",
//                            "key": "Remarks",
//                            "className": "p-col-12 p-md-12",
//                            "props": { "label": "Remarks", "placeholder": "Additional notes" }
//                          },
//                          {
//                            "type": "button",
//                            "className": "p-col-12 p-md-2 p-mt-4",
//                            "props": {
//                              "label": "Remove",
//                              "icon": "pi pi-trash",
//                              "styleClass": "p-button-danger",
//                              "onClick": "REMOVE_ROW"   // a sentinel that we will replace with real code
//                            }
//                          }
//                        ]
//                      }//endof rowtemplate
//          }
//        }
//      ]
//    }
//    },
//    {
//      "type": "button",
//      "props": {
//        "text": "Save Customer",
//        "type": "submit",
//        "styleClass": "p-button-success"
//      }
//    }
//  ]; 
//  this.fields=this.hydrateFormlyConfig(raw);
 
 
 }
 
 
  
 
 private hydrateFormlyConfig(rawConfig: any[]): FormlyFieldConfig[] {
   
   
   // Walk the tree and replace every placeholder with the real function
   const walk = (fields: any[]) => {
     fields.forEach(f => {

     console.log('inside walk f:',f)

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
  const parentModel = (clone as any).model ?? {};
  clone.model = { ...parentModel };   // shallow copy is enough for a boolean flag
console.log('clone.model:',clone.model);

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
           };console.log('clone as a fields:',clone);
           
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

//  private getCustomerDetailsFlag(): boolean {
//   const orgArray = this.form.value?.organisations! ?? [];
//   // Assuming a single organisation row (or adapt the index as needed)
//   return (orgArray[0] as any)?.customerDetailsRequired ?? false;
// }
  getCustomerList(){
    this.customerService.getCustomers(this.tenantId).subscribe(custs=>{
      this.customers=custs; console.log('count:',this.customers.length);
      
      
    })
  }
Add(){
  this.fields=[];
  this.currOpMode=FormOpMode.Add; this.customerDetailsRequired=false;
  
  this.model={tenantId:0,customerName:'',organisations:[{organisationName:'',customerCategory:'',contactPersonName:'',customerDetailsRequired:false,mobileNumber:'',EmailId:'anilkoli@gmail.com',city:'',Remarks:'',creditDays:0,creditLimit:0}] };
  const hydrated = this.hydrateFormlyConfig(this.raw);
  this.fields=hydrated; setTimeout(() => this.form.updateValueAndValidity(), 0);
  
}
CancelFormOp(){this.currOpMode=FormOpMode.View}
onEditClick(selectedRecord:any){
  this.model={...selectedRecord}
}
/** optional – toggle a row programmatically */
  toggleRow(rowData: Customer) { console.log('its toggleRow...............',!this.expandedRows[rowData.id]);
  
    this.expandedRows[rowData.id] = !this.expandedRows[rowData.id];
  }
    
    onSubmit() {
    if (!this.form.valid) {console.log('invalid form..');
      console.log('InvalidForm data :', this.model);
    }else
    if (this.form.valid) {
      console.log('Form data submitted:', this.model);
    
      this.saveCustomer();
       
      
    }
  }

  
      saveCustomer() {
        if ( !this.form.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Customer Name and Category is required' });
          return;
        }

        
        // TODO: Implement API call to save order
    this.model.tenantId=this.tenantId; console.log('Creating customer with model:',this.model);
    
         this.customerService.createCustomer(this.model).subscribe(res=>console.log('Customer saved successfully!',res)   )
     
     //refresh grid
        this.getCustomerList();            
        console.log('Saving Customer:', this.model);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Customer saved successfully' });
      }

    removeCustomer(index: number) {
    this.customers?.splice(index, 1);
      }

      clearCustomer() {
        //this.model = { tenantId:0,customerName: '' ,organisations:[]};
        this.form.reset();
      }

}
