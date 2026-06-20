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
import { Observable, take } from 'rxjs';

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
import { LeadStatus } from '../../../shared/enums/LeadStatus.enum';
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
  leadstatus:LeadStatus=LeadStatus.NewLead;
raw:any;

leftCol = '30%'; rowHeight="50"
  form = new FormGroup({});
    model= {tenantId:0,customerName:'',leadStatus:LeadStatus.NewLead,leadSource:'',organisations:[{organisationName:'',customerCategory:'',contactPersonName:'',customerDetailsRequired:true,mobileNumber:'',EmailId:'',city:'',Remarks:'',creditDays:0,creditLimit:0}] };//Partial<createCustomer> 
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

    private lookupService=inject(LookupService)

    constructor( private messageService: MessageService, private cd: ChangeDetectorRef
      ,private authServ:AuthService
    ){
  
    }
 
   ngOnInit(): void {
    this.model={tenantId:0,customerName:'',leadStatus:LeadStatus.NewLead,leadSource:''
      ,organisations:[{organisationName:'',customerCategory:'',contactPersonName:'',customerDetailsRequired:false,mobileNumber:'',EmailId:'',city:'',Remarks:'',creditDays:0,creditLimit:0}] };//Partial<createCustomer> 
    this.tenantId = this.authServ.getTenantId()!;   // <-- store once

     this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),
  
           this.formlyConfig.setType({
     name: 'primeng-dropdown',
     component: FormlyFieldPrimengDropdownComponent,
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
 this.getCustomerList()
           
 }
 
   getForm_Customer(){
 //formkey:customer_form
  
 //var raw:any;
     this.formService.getForm(this.tenantId!,'customer_form').subscribe(aform=>{
       
       
       this.aForm=aform; 
      
      //console.log('this.aForm.FormlyConfig:',this.aForm.FormlyConfig);
      
       
        this.raw=JSON.parse(this.aForm.FormlyConfig) ;
        //expression used for copying typed customername to contactperson
        //"expressions": {  "model.contactPersonName": "field.model.contactPersonName ? field.model.contactPersonName : (field.options.parentForm?.value?.customerName || '')"}
        
        //raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {         "rowTemplate": {           "key": "organisations[${index}]",           "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",           "fieldGroup": [ {   "type": "input",   "key": "organisationName",   "className": "col-span-4 md:col-span-4",   "props": {     "label": "Organisation",     "placeholder": "Enter name",     "required": true   } }, {   "type": "primeng-dropdown",   "key": "customerCategory",   "className": "col-span-2 md:col-span-2",   "props": {     "label": "Customer Category",     "optionLabel": "label",     "optionValue": "value",     "placeholder": "Select Category",     "lookupKey": "customerCategoryTypes",     "required": true,     "filter": true   } }, {   "type": "input",   "key": "contactPersonName",   "className": "col-span-4 md:col-span-4",   "props": { "label": "Contact Person", "placeholder": "Enter name" } }, {   "type": "input",   "key": "mobileNumber",   "className": "col-span-2 md:col-span-2",   "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567" } }, {   "type": "input",   "key": "EmailId",   "className": "col-span-3 md:col-span-3",   "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" } }, {   "type": "input",   "key": "city",   "className": "col-span-3 md:col-span-3",   "props": { "label": "City", "placeholder": "Enter city" } }, {   "type": "input",   "key": "Remarks",   "className": "col-span-3 md:col-span-3",   "props": { "label": "Remarks", "placeholder": "Additional notes" } },        {       "key": "creditDays",        "type": "input",        "className": "col-span-2 md:col-span-2",        "props": { "label": "Credit Days", "placeholder": "Enter credit days" }        },   {       "key": "creditLimit",        "type": "input",        "className": "col-span-2 md:col-span-2",        "props": { "label": "Credit Limit", "placeholder": "Enter credit limit" }        }, {   "type": "button",   "className": "col-span-3 md:col-span-3",   "props": {     "label": "Remove",     "icon": "pi pi-trash",     "styleClass": "p-button-danger",     "onClick": "REMOVE_ROW"      } }           ]         }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]
        this.raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Lead Name",       "placeholder": "Enter lead name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {         "rowTemplate": {           "key": "organisations[${index}]",           "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end",           "fieldGroup": [ {   "type": "input",   "key": "organisationName",   "className": "col-span-4 md:col-span-4",   "props": {     "label": "Firm ",     "placeholder": "Enter name",     "required": true   } }, {  "type": "primeng-dropdown",   "key": "customerCategory",   "className": "col-span-2 md:col-span-2",   "props": {     "label": "Category",     "optionLabel": "label",     "optionValue": "value", "dataKey":"customerCategory", "placeholder": "Select Category",     "lookupKey": "customerCategoryTypes",     "required": true,     "filter": true   } }, 
          {   "type": "input",   "key": "contactPersonName",   "className": "col-span-3 md:col-span-3",   "props": { "label": "Contact Person", "placeholder": "Enter name" }},{ "type": "input",   "key": "mobileNumber",  "resetOnHide":true, "className": "col-span-2 md:col-span-2",     "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567", "required": true }          }, {   "type": "checkbox", "key": "customerDetailsRequired",    "defaultValue":true,        "className": "col-span-12 md:col-span-12",   "props": { "label": "More Details", "placeholder": "customerDetailsRequired"}     }, 
{  "type": "primeng-dropdown",   "key": "leadSource", "hide":true,  "className": "col-span-2 md:col-span-2",   "props": {     "label": "Lead Source",     "optionLabel": "label",     "optionValue": "value",     "placeholder": "Select LeadSource",     "lookupKey": "leadSourceTypes",         "filter": true   },
   "expressionProperties": {"hide":"!field.parent.parent.model.customerDetailsRequired"}  },          
     {    "type": "input", "hide":true,   "key": "EmailId",         "className": "col-span-2 md:col-span-2",   "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" } , "expressionProperties": {"hide":"field.model.customerDetailsRequired !== true"}      }, {   "type": "input", "hide":true, "key": "city",   "className": "col-span-2 md:col-span-2",   "props": { "label": "City", "placeholder": "Enter city" } , "expressionProperties": {"hide":"field.model.customerDetailsRequired !== true"}  },  {  "type": "input", "hide":true, "key": "Remarks" ,  "className": "col-span-2 md:col-span-2",   "props": { "label": "Remarks", "placeholder": "Additional notes" } , "expressionProperties": {"hide":"field.model.customerDetailsRequired !== true"}   }, {    "key": "creditDays",   "type": "input", "hide":true,   "className": "col-span-1 md:col-span-1",        "props": { "label": "CreditDays", "placeholder": "" }  , "expressionProperties": {"hide":"field.model.customerDetailsRequired !== true"}   },  {       "key": "creditLimit",   "type": "input", "hide":true,       "className": "col-span-1 md:col-span-1",        "props": { "label": "CreditLimit", "placeholder": "" } , "expressionProperties": {"hide":"field.model.customerDetailsRequired !== true"}  },  {  "type": "button",   "className": "col-span-3 md:col-span-3",   "props": {     "label": "Remove",     "icon": "pi pi-trash",     "styleClass": "p-button-danger",     "onClick": "REMOVE_ROW"      } }           ]         }         }       }     ]   }   },   {     "type": "button",  "className": "col-span-3 md:col-span-3",   "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]

     //without $index and rowtemplate
     this.raw=[
  { "key": "id", "type": "input", "hide": false },{"key":"createdByUserId","type":"input","hide":true},
  { "key": "tenantId", "type": "input", "hide": false },
  {
    "key": "customerName",
    "type": "input",
    "props": {
      "label": "Lead Name",
      "placeholder": "Enter lead name",
      "required": true
    }
  },
  {
          "type": "input",
          "key": "leadStatus",
          "className": "col-span-2 md:col-span-2",
          "props": {
            "label": "leadStatus",
            "placeholder": "Enter leadstatus",
            "required": true
          }
        },
        {
          "type": "primeng-dropdown",
          "key": "leadSource",
          "className": "col-span-2 md:col-span-2",
          "props": {
            "label": "Lead Source",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select LeadSource",
            "lookupKey": "leadSourceTypes",
            "filter": true
                   },
          "expressions": {
            "hide": "!model.customerDetailsRequired"
          }
        },
  {
    "key": "organisations",
    "type": "p-repeatsectionformly",
    "wrappers": ["panel"],
    "defaultValue": [],
    "props": {
      "label": "",
      "addText": "Add Organisation"
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end",
      "fieldGroup": [  
        { "key": "id", "type": "input", "hide": false },
        {
          "type": "input",
          "key": "id","hide":true},
          {
          "type": "input",
          "key": "organisationName",
          "className": "col-span-4 md:col-span-4",
          "props": {
            "label": "Firm Name",
            "placeholder": "Enter name",
            "required": true
          }
        },
        {
          "type": "primeng-dropdown",
          "key": "customerCategory",
          "className": "col-span-2 md:col-span-2",
          "props": {
            "label": "Category", "valueProp":"value", "labelProp":"label",
            "optionLabel": "label",
            "optionValue": "value",// "dataKey":"customerCategory", 
            "placeholder": "Select Category",
            "lookupKey": "customerCategoryTypes",
            "required": true,
            "filter": true
          }
        },
        {
          "type": "input",
          "key": "contactPersonName",
          "className": "col-span-3 md:col-span-3",
          "props": {
            "label": "Contact Person",
            "placeholder": "Enter name"
          }
        },
        {
          "type": "input",
          "key": "mobileNumber",
          "resetOnHide": true,
          "className": "col-span-2 md:col-span-2",
          "props": {
            "label": "Mobile Number",
            "placeholder": "e.g. +1-555-123-4567",
            "required": true
          }
        },
      
        
        {
          "type": "checkbox",
          "key": "customerDetailsRequired",
          "defaultValue": true,
          "className": "col-span-12 md:col-span-12",
          "props": {
            "label": "More Details"
          }
        },
        
        {
          "type": "input",
          "key": "EmailId",
          "className": "col-span-2 md:col-span-2",
          "props": {
            "label": "Email",
            "placeholder": "example@domain.com",
            "type": "email"
          },
          "expressions": {
            "hide": "!model.customerDetailsRequired"
          }
        },
        {
          "type": "input",
          "key": "city",
          "className": "col-span-2 md:col-span-2",
          "props": {
            "label": "City",
            "placeholder": "Enter city"
          },
          "expressions": {
            "hide": "!model.customerDetailsRequired"
          }
        },
        {
          "type": "input",
          "key": "Remarks",
          "className": "col-span-2 md:col-span-2",
          "props": {
            "label": "Remarks",
            "placeholder": "Additional notes"
          },
          "expressions": {
            "hide": "!model.customerDetailsRequired"
          }
        },
        {
          "key": "creditDays",
          "type": "input",
          "className": "col-span-1 md:col-span-1",
          "props": {
            "label": "CreditDays",
            "placeholder": ""
          },
          "expressions": {
            "hide": "!model.customerDetailsRequired"
          }
        },
        {
          "key": "creditLimit",
          "type": "input",
          "className": "col-span-1 md:col-span-1",
          "props": {
            "label": "CreditLimit",
            "placeholder": ""
          },
          "expressions": {
            "hide": "!model.customerDetailsRequired"
          }
        },
        {
          "type": "button",
          "className": "col-span-3 md:col-span-3",
          "props": {
            "label": "Remove",
            "icon": "pi pi-trash",
            "styleClass": "p-button-danger",
            "onClick": "REMOVE_ROW"
          }
        }
      ]
    }
  },
  {
    "type": "button",
    "className": "col-span-3 md:col-span-3",
    "props": {
      "text": "Save Customer",
      "type": "submit",
      "styleClass": "p-button-success"
    }
  }
]

        //{"hide":"!field.model.customerDetailsRequired !== true"} 
// 

        //raw =[{"key":'needFood',"type":"checkbox","defaultValue":false},{"key":'Breakfast',"type":"input", "expressionProperties" :{"hide":"!model.needFood"},"props":{"label":"breakfast"}},          {"key":'dinner',"type":"input", "expressionProperties" :{"hide":true},"props":{"label":"dinner"}}    ]
     
  //console.log('i got raw chged:',raw);
        
  //  raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {         "rowTemplate": {           "key": "organisations[${index}]",           "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",           "fieldGroup": [ {   "type": "input",   "key": "organisationName",   "className": "col-span-6 md:col-span-5",   "props": {     "label": "Organisation",     "placeholder": "Enter name",     "required": true   } }, {   "type": "primeng-dropdown",   "key": "customerCategory",   "className": "col-span-6 md:col-span-3",   "props": {     "label": "Customer Category",     "optionLabel": "label",     "optionValue": "value",     "placeholder": "Select Category",     "lookupKey": "customerCategoryTypes",     "required": true,     "filter": true   } }, {   "type": "input",   "key": "contactPersonName",   "className": "col-span-6 md:col-span-2",   "props": { "label": "Contact Person", "placeholder": "Enter name" } }, {   "type": "input",   "key": "mobileNumber",   "className": "col-span-4 md:col-span-2",   "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567" } }, {   "type": "input",   "key": "EmailId",   "className": "col-span-4 md:col-span-2",   "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" } }, {   "type": "input",   "key": "city",   "className": "col-span-4 md:col-span-2",   "props": { "label": "City", "placeholder": "Enter city" } }, {   "type": "input",   "key": "Remarks",   "className": "col-span-6 md:col-span-12",   "props": { "label": "Remarks", "placeholder": "Additional notes" } },        {       "key": "creditDays",        "type": "input",        "className": "col-span-4 md:col-span-2",        "props": { "label": "Credit Days", "placeholder": "Enter credit days" }        },   {       "key": "creditLimit",        "type": "input",        "className": "col-span-4 md:col-span-2",        "props": { "label": "Credit Limit", "placeholder": "Enter credit limit" }        }, {   "type": "button",   "className": "col-span-12 md:col-span-2",   "props": {     "label": "Remove",     "icon": "pi pi-trash",     "styleClass": "p-button-danger",     "onClick": "REMOVE_ROW"      } }           ]         }         }       }     ]   }   },   {     "type": "button",     "props": {       "text": "Save Customer",       "type": "submit",       "styleClass": "p-button-success"     }   } ]
      //  raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {         "rowTemplate": {           "key": "organisations[${index}]",           "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",           "fieldGroup": [ {   "type": "input",   "key": "organisationName",   "className": "col-span-6 md:col-span-5",   "props": {     "label": "Organisation",     "placeholder": "Enter name",     "required": true   } }, {   "type": "primeng-dropdown",   "key": "customerCategory",   "className": "col-span-6 md:col-span-3",   "props": {     "label": "Customer Category",     "optionLabel": "label",     "optionValue": "value",     "placeholder": "Select Category",     "lookupKey": "customerCategoryTypes",     "required": true,     "filter": true   } }, {   "type": "input",   "key": "contactPersonName",   "className": "col-span-6 md:col-span-2",   "props": { "label": "Contact Person", "placeholder": "Enter name" } },           ]         }         }       }     ]   }   },    ];
      //  raw=[ { "key": "id",     "type": "input",     "hide": true  }, { "key": "tenantId",     "type": "input",     "hide": true  },   {     "key": "customerName",     "type": "input",     "props": {       "label": "Customer Name",       "placeholder": "Enter customer name",       "required": true     }   },   {     "key": "organisations",     "type": "p-repeatsectionformly",     "wrappers": ["panel"],     "defaultValue": [],     "props": {       "label": "Organisations",       "addText": "Add Organisation"     },     "fieldArray": {     "fieldGroup": [       {         "type": "custom",         "props": {         "rowTemplate": {           "key": "organisations[${index}]",           "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",           "fieldGroup": [ {   "type": "input",   "key": "organisationName",   "className": "col-span-6 md:col-span-12",   "props": {     "label": "Organisation",     "placeholder": "Enter name",     "required": true   } }, {   "type": "primeng-dropdown",   "key": "customerCategory",   "className": "col-span-6 md:col-span-4",   "props": {     "label": "Customer Category",     "optionLabel": "label",     "optionValue": "value",     "placeholder": "Select Category",     "lookupKey": "customerCategoryTypes",     "required": true,     "filter": true   } }, {   "type": "input",   "key": "contactPersonName",   "className": "col-span-6 md:col-span-4",   "props": { "label": "Contact Person", "placeholder": "Enter name" } },           ]         }         }       }     ]   }   },    ];

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
// "label": "Organisation",
// "placeholder": "Enter name",
// "required": true
//           }
//         },
//         {
//           "type": "primeng-dropdown",
//           "key": "customerCategory",
//           "className": "col-span-6 md:col-span-6",
//           "props": {
// "label": "Customer Category",
// "optionLabel": "label",
// "optionValue": "value",
// "placeholder": "Select Category",
// "lookupKey": "customerCategoryTypes",
// "required": true,
// "filter": true
//           }
//         },{
//           "type": "input",
//           "key": "Taluka",
//           "className": "col-span-6 md:col-span-4", 
//           "props": {
// "label": "Taluka",
// "placeholder": "Enter Tq",
// "required": true
//           }
//         },{
//           "type": "input",
//           "key": "Dist",
//           "className": "col-span-6 md:col-span-4", 
//           "props": {
// "label": "Dist",
// "placeholder": "Dt",
// "required": true
//           }
//         },{
//           "type": "input",
//           "key": "newf",
//           "className": "col-span-6 md:col-span-4", 
//           "props": {
// "label": "newf",
// "placeholder": "Enter newf",
// "required": true
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
// "label": "Organisation",
// "placeholder": "Enter name",
// "required": true
//           }
//         },
//         {
//           "type": "primeng-dropdown",
//           "key": "customerCategory",
//           "className": "col-span-6 md:col-span-5",
//           "props": {
// "label": "Customer Category",
// "optionLabel": "label",
// "optionValue": "value",
// "placeholder": "Select Category",
// "lookupKey": "customerCategoryTypes",
// "required": true,
// "filter": true
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
//this.raw=organisationRowTemplate;
        const hydrated = this.hydrateFormlyConfig1(this.raw);
        this.fields=hydrated;

  
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
//   "hide": true   // hidden but kept in the model
//   // or
//   // templateOptions: { readonly: true } // to show it as read‑only
// },
//{
//   "key": "tenantId",
//   "type": "input",
//   "hide": true   // hidden but kept in the model
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
//          "rowTemplate": {
//"key": "organisations[${index}].customerCategory",
//"fieldGroupClassName": "p-grid p-fluid",
//"fieldGroup": [
//  {
//    "type": "input",
//    "key": "organisationName",
//    "className": "p-col-12 p-md-5",
//    "props": {
//      "label": "Organisation",
//      "placeholder": "Enter name",
//      "required": true
//    }
//  },
//  {
//    "type": "primeng-dropdown",
//    "key": "customerCategory",
//    "className": "p-col-12 p-md-3",
//    "props": {
//      "label": "Customer Category",
//      "optionLabel": "label",
//      "optionValue": "value",
//      "placeholder": "Select Category",
//      "lookupKey": "customerCategoryTypes",
//      "required": true,
//      "filter": true
//    }
//  },
//  {
//    "type": "input",
//    "key": "contactPersonName",
//    "className": "p-col-12 p-md-2",
//    "props": { "label": "Contact Person", "placeholder": "Enter name" }
//  },
//  {
//    "type": "input",
//    "key": "mobileNumber",
//    "className": "p-col-12 p-md-2",
//    "props": { "label": "Mobile Number", "placeholder": "e.g. +1‑555‑123‑4567" }
//  },
//  {
//    "type": "input",
//    "key": "EmailId",
//    "className": "p-col-12 p-md-2",
//    "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email" }
//  },
//  {
//    "type": "input",
//    "key": "city",
//    "className": "p-col-12 p-md-2",
//    "props": { "label": "City", "placeholder": "Enter city" }
//  },
//  {
//    "type": "input",
//    "key": "Remarks",
//    "className": "p-col-12 p-md-12",
//    "props": { "label": "Remarks", "placeholder": "Additional notes" }
//  },
//  {
//    "type": "button",
//    "className": "p-col-12 p-md-2 p-mt-4",
//    "props": {
//      "label": "Remove",
//      "icon": "pi pi-trash",
//      "styleClass": "p-button-danger",
//      "onClick": "REMOVE_ROW"   // a sentinel that we will replace with real code
//    }
//  }
//]
//          }//endof rowtemplate
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
      customerDetailsRequired: defaultFlag,
    };


          // ---- replace the sentinel "REMOVE_ROW" with a real function -------
          const replaceSentinel = (field: any) => {
if (field.props?.onClick === 'REMOVE_ROW') {
  field.props.onClick = (_event: any, fld: any) => {
    // `fld.parent` points to the repeat container (e.g. organisations)
    const arr = fld.parent.model.organisations as any[];
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
//   const orgArray = this.form.value?.organisations! ?? [];
//   // Assuming a single organisation row (or adapt the index as needed)
//   return (orgArray[0] as any)?.customerDetailsRequired ?? false;
// }
  getCustomerList(){
    this.customerService.getCustomers(this.tenantId).subscribe(custs=>{
      this.customers=custs; 
      
      
    })
  }
Add(){
  this.currOpMode=FormOpMode.Add; localStorage.setItem('currOpMode',this.currOpMode);
  this.leadstatus=LeadStatus.NewLead;
  this.customerDetailsRequired=false;
  //
  //this.fields=[];
   this.model={tenantId:0,customerName:'',leadStatus:LeadStatus.NewLead,leadSource:''
    ,organisations:[{organisationName:'',customerCategory:'',contactPersonName:''
      ,customerDetailsRequired:false,mobileNumber:'',EmailId:'anilkoli@gmail.com'
      ,city:'',Remarks:'',creditDays:0,creditLimit:0}] };
  // const hydrated = this.hydrateFormlyConfig(this.raw);
  // this.fields=hydrated; setTimeout(() => this.form.updateValueAndValidity(), 0);
  
}
CancelFormOp(){this.currOpMode=FormOpMode.View}
// onEditClick(selectedRecord: any) {

//   this.currOpMode=FormOpMode.Update; localStorage.setItem('currOpMode',this.currOpMode)
  
  
//   //this.model=selectedRecord;

//   const cleaned = {
//     ...selectedRecord,
//     organisations: selectedRecord.organisations?.map((org: any) => ({
//       ...org,
//       customerCategory: org.customerCategory?.value ?? org.customerCategory
//     })) ?? []
//   };

//   this.model = cleaned;  console.log('model setvalue:',this.model);
  
//   // //wait a tick so that the dropdown options are already populated
//   // setTimeout(() => this.form.setValue(this.model), 7000);
//    // 2. Safely notify Formly to read the updated model values instead of forcing form.setValue
//   setTimeout(() => {
   
//       // Fallback if options framework isn't declared: patch instead of set
//       this.form.patchValue(this.model, { emitEvent: true });
//       console.log('Patching model:',this.model);
      
    
//   }, 100); 
// }

// customer.component.ts – edit handler
onEditClick(selectedRecord: any) {console.log('form patchForm');

  this.currOpMode=FormOpMode.Update; localStorage.setItem('currOpMode',this.currOpMode)
  console.log('currOpMode is:',this.currOpMode);
  
  // 1️⃣  Load the lookup data first (only in ADD mode)
  if (this.currOpMode !== "UPDATE") {
    this.lookupService
      .getLookupDataByKey('customerCategoryTypes', 1)
      .pipe(take(1))
      .subscribe(() => { console.log('subscribing getLookup.. patchvalue with selectedRecord:',selectedRecord);
      
          const cleaned = {
    ...selectedRecord,
    organisations: selectedRecord.organisations?.map((org: any) => ({
      ...org,
      customerCategory: org.customerCategory?.value ?? org.customerCategory
    })) ?? []
  };
  this.model=cleaned;

        this.patchForm(cleaned);//selectedRecord
      });
  } else { // in Update

   
    
    // UPDATE – no lookup needed
     const cleaned = {
    ...selectedRecord,
    organisations: selectedRecord.organisations?.map((org: any) => ({
      ...org,
      customerDetailsRequired:true,
      customerCategory: 'B2BC'//org.customerCategory?.value ?? org.customerCategory
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
console.log('-------------------->:updateCategoryInRow(0,B2BC))')
this.updateCategoryInRow(0,'B2BC');


    this.cd.detectChanges();
  }
}
updateCategoryInRow(rowIndex: number,newValue: string = 'Dealer') {
  // 1. Get the parent FormArray
  const organisationsArray  = <any>(this.form.get('organisations')) as FormArray;


  if (organisationsArray && organisationsArray.length > rowIndex) {
    // 2. Get the specific row's FormGroup
    const rowGroup = organisationsArray.at(rowIndex) as FormGroup;
    
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
    organisations: record.organisations?.map((org: any) => ({
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
