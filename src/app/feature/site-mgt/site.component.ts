import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormService } from '../../core/services/form.service';
import {SiteService} from '../../core/services/site.service'
import { CommonModule } from '@angular/common';
import { DefaultValueAccessor, FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Customer} from '../../core/models/customer.model'

import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { LookupService } from '../../core/services/lookup.service';
import { FormlyConfig, FormlyField, FormlyFieldConfig, FormlyModule, provideFormlyCore,  } from '@ngx-formly/core';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom, Observable, take, tap } from 'rxjs';

import { SelectModule } from 'primeng/select';

import { FormlyFieldPrimengDropdownComponent } from '../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { RepeatFormlySectionComponent } from '../../shared/components/formlyfields/repeat-formly-section/repeat-formly-section.component';

import { InputTextModule } from 'primeng/inputtext';
import { FormlyPrimeNGModule, withFormlyPrimeNG } from '@ngx-formly/primeng';
import { PanelModule } from 'primeng/panel';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { FormlyCardWrapperComponent } from '../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { RepeatsectionformlyComponent } from '../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../shared/components/formlyfields/formly-field-button/formly-field-button.component';




import { FormOpMode } from '../../shared/enums/FormOpMode.enum';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { RepeatsectionformlyNewComponent } from '../../shared/components/formlyfields/repeatsectionformly-new/repeatsectionformly-new.component';

import { FormlyCustomRowBridgeNewComponent } from '../../shared/components/formlyfields/formly-custom-row-bridge-new/formly-custom-row-bridge-new.component';
import { organisationRowTemplate } from '../../shared/components/formlyfields/organisation-row/organisation-row.template';
import { ClientStatus } from '../../shared/enums/ClientStatus.enum';
import { FormlyWrapperTypeaheadComponent } from '../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';


import { FilterControlComponent } from '../../shared/components/filter-control/filter-control.component';
import { applyLocalSearchExtension, hydrateFormlyConfig } from '../../shared/utils/hydrationOfFormlyJson';
import { FORMLY_ROW_REGISTRY, PlainFormlyFieldConfig, RegistryFieldConfig } from '../customer-mgt/formly-registry';

@Component({
  selector: 'app-site',
    schemas:[CUSTOM_ELEMENTS_SCHEMA],
    imports: [ CommonModule,ToastModule ,ReactiveFormsModule, FormsModule,
       FormlyModule, FormsModule,SelectModule ,InputTextModule,FormlyInputModule,
       PanelModule,  TableModule,RippleModule,ButtonModule,
       FilterControlComponent
        
      ],
      providers:[MessageService],
      templateUrl: './site.component.html',
      styleUrl: './site.component.scss'
})
export class SiteComponent {

clientId!:number;

  visibleDataArray!: any[] ;
 tenantId!: number;          // <-- new property
 isFormHidden:boolean=true;
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; customerDetailsRequired:boolean=true;
  clientstatus:ClientStatus=ClientStatus.NewLead;
raw:any;

  form = new FormGroup({});
    model= {tenantId:0,siteName:'',contactPersonName:'',customer:{}};
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;
 options$!:any[]
    
   sites: Customer[] |undefined = [] ; 
   

    private formService=inject(FormService);
    private siteService=inject(SiteService)
    private formlyConfig = inject(FormlyConfig);
    private authServ=inject(AuthService)
    private lookupService=inject(LookupService)
 private messageService=inject(MessageService)
    constructor( private cd: ChangeDetectorRef
      
    ){
  
    }
 
   ngOnInit(): void {
    this.clientId= this.authServ.getClientId()!;
    this.model= {tenantId:0,siteName:'',contactPersonName:'',customer:{}};

    this.tenantId = this.authServ.getTenantId()!;   // <-- store once

     this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),
  
           this.formlyConfig.setType({
              name: 'primeng-dropdown',
              component: FormlyFieldPrimengDropdownComponent,
            });


    
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
 
 this.getForm_Site();
 this.getSiteList().then(custs=>{
    this.sites=custs;   this.visibleDataArray= [...this.sites!];
  }).catch(err=>{    console.error('Error:',err)  });
           
 }
  

 //For Filter data
 onDataFiltered(filteredResults: any[]) { 
 
    this.visibleDataArray = filteredResults;
    console.log('onDataFilter..............visibleDataArray:',this.visibleDataArray.length);
  }
   getForm_Site(){
 //formkey:customer_form
  
 //var raw:any;
     this.formService.getForm(this.tenantId!,'customer_form').subscribe(aform=>{
       
       
       this.aForm=aform; 
      
            
        this.raw=JSON.parse(this.aForm.FormlyConfig) ;
       
       })

     //without $index and rowtemplate
     this.raw=
     [
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
          "type": "input",
          "key": "siteName",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "label": "Site Name",
            "placeholder": "Enter name",
            "required":true
          }
        },
        {
          "type": "input",
          "key": "contactPersonName",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "label": "Contact Person",
            "placeholder": "Enter Contact Person",
            "required":true
          }
        },
    ]
  },
  {
    "type": "button",
    "className": "col-span-12 md:col-span-3 mt-4",
    "props": {
      "text": "Save Site",
      "type": "submit",
      "styleClass": "p-button-success"
    }
  }
]

        const hydrated = hydrateFormlyConfig(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
        
        applyLocalSearchExtension(this.fields);

  
     
   
   } 
 
 
 
 
  
 
 
 


  getSiteList(): Promise<any[]> {
      const observable$ = this.siteService.getSites(this.tenantId).pipe(
        tap((custs:any) => {
          this.visibleDataArray = custs; // Handles the side-effect safely

          console.log('All sites............',custs);
          
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
  
  // Reset the form values to a baseline state (No "id" present)
  this.form.reset();
  
  this.model = {
    tenantId: this.tenantId,        // Tracked from active JWT Context session
    siteName: '',
    contactPersonName: '',
    customer: { id: this.clientId } // Bound to client token identification mapping
  };
}

CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}

// customer.component.ts – edit handler
async onEditClick(selectedRecord: any) {
  console.log('selectedRecord for edit:', selectedRecord);
  
  // Capture full structure context and clear out invalid UI wrappers
  const cleaned = {
    ...selectedRecord,
    sites: selectedRecord.sites?.map((org: any) => ({
      ...org,
      customerDetailsRequired: true,
      customerCategory: org.customerCategory?.value ?? org.customerCategory
    })) ?? []
  };

  this.model = cleaned; // Model now safely contains this record's database "id"
  this.isFormHidden = false;
  this.currOpMode = FormOpMode.Update; 
  localStorage.setItem('currOpMode', this.currOpMode);

  // Trigger Formly layout patching
  setTimeout(() => {
    try {
      this.form.patchValue(cleaned);
      console.log('Successfully patchform executed in Update state context.');
    } catch (error) {
      console.error('An error occurred during patchform execution:', error);
    }
    this.cd.detectChanges();
  }, 50); // Reduced delay threshold to minimize UI lag
}

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


  
    async saveSite() {
  if (!this.form.valid) {
    this.messageService.add({ 
      severity: 'error', 
      summary: 'Validation Error', 
      detail: 'Site Name and Contact Person are required.' 
    });
    return;
  }

  // Cast as 'any' to dynamically extract database tracking primary keys safely
  const submissionPayload = {
    ...this.model,
    ...this.form.value,
    tenantId: this.tenantId 
  } as any;

  try {
    let response: any;

    // TypeScript can now read the .id property cleanly without compilation blocks
    if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
      console.log('Routing updating transaction execution for ID:', submissionPayload.id);
      
      response = await firstValueFrom(
        this.siteService.updateSite(submissionPayload.id, submissionPayload)
      );
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Site configurations updated successfully' });
    } else {
      console.log('Routing raw site instantiation registration pipeline...');
      
      response = await firstValueFrom(
        this.siteService.createSite(submissionPayload)
      );
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'New site record has been generated' });
    }

    // Common Cleanup Sequence Loop 
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
    this.form.reset();
    
    await this.getSiteList();
    this.cd.detectChanges();

  } catch (error: any) {
    console.error('Data persistence operation failed:', error);
    this.messageService.add({ 
      severity: 'error', 
      summary: 'Server Execution Failure', 
      detail: error.error?.message || 'Failed to submit site structural dataset context.' 
    });
  }
}



    removeSite(index: number) {
    this.sites?.splice(index, 1);
      }

      clearSite() {
        //this.model = { tenantId:0,sitename: '' ,sites:[]};
        this.form.reset();
      }

}

