import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormService } from '../../../core/services/form.service';

import { CommonModule } from '@angular/common';
import { DefaultValueAccessor, FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Vendor} from '../../../core/models/vendor.model'

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

import { FormlyCustomRowBridgeNewComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge-new/formly-custom-row-bridge-new.component';
import { organisationRowTemplate } from '../../../shared/components/formlyfields/organisation-row/organisation-row.template';
import { ClientStatus } from '../../../shared/enums/ClientStatus.enum';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';


import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { applyLocalSearchExtension, hydrateFormlyConfig } from '../../../shared/utils/hydrationOfFormlyJson';

import { VendorService } from '../../../core/services/vendor.service';

@Component({
  selector: 'app-vendor',
  imports: [CommonModule,ToastModule ,ReactiveFormsModule, FormsModule,
         FormlyModule, FormsModule,SelectModule ,InputTextModule,FormlyInputModule,
         PanelModule,  TableModule,RippleModule,ButtonModule,
         FilterControlComponent
          
        ],
        providers:[MessageService],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.scss'
})
export class VendorComponent {
visibleDataArray!: any[] ;
 tenantId!: number;          // <-- new property
 isFormHidden:boolean=true;
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

raw:any;

  form = new FormGroup({});
    model= {id:0,tenantId:0,vendorName:''};
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;
 options$!:any[]
    
   vendors: Vendor[] |undefined = [] ; 
   

    private formService=inject(FormService);
    private vendorService=inject(VendorService);

    private formlyConfig = inject(FormlyConfig);
    private authServ=inject(AuthService)
    private lookupService=inject(LookupService)
 private messageService=inject(MessageService)
    constructor( private cd: ChangeDetectorRef
      
    ){
  
    }


   ngOnInit(): void {
    this.model= {id:0,tenantId:0,vendorName:''};

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
 
 this.getForm_Vendor();
 this.getVendorList().then(vendrs=>{
    this.vendors=vendrs;   this.visibleDataArray= [...this.vendors!];
  }).catch(err=>{    console.error('Error:',err)  });
           
 }

Add(){
  this.isFormHidden=false;
  this.currOpMode=FormOpMode.Add; localStorage.setItem('currOpMode',this.currOpMode);
  
    this.model= {id:0,tenantId:0,vendorName:''};
  
}
CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}


async onEditClick(selectedRecord: any) {
  
  console.log('selectedRecord for edit:',selectedRecord);
await setTimeout(() => {
          this.isFormHidden=false;

          this.currOpMode=FormOpMode.Update; localStorage.setItem('currOpMode',this.currOpMode)
          console.log('currOpMode is:',this.currOpMode);
          
          
          this.model=selectedRecord;

                this.patchForm(selectedRecord);//selectedRecord

                this.cd.detectChanges();
            
      
            this.cd.detectChanges();
          


}, 2000);
}

private patchForm(record: any) {
   this.model = record;
  this.form.setValue(this.model);
}
 //For Filter data
 onDataFiltered(filteredResults: any[]) { 
 
    this.visibleDataArray = filteredResults;
    console.log('onDataFilter..............visibleDataArray:',this.visibleDataArray.length);
  }
   getForm_Vendor(){
  
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
          "key": "vendorName",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "label": "vendor Name",
            "placeholder": "Enter vendorName",
            "required":true
          }
        },
        {
          "type": "input",
          "key": "description",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "label": "description",
            "placeholder": "Enter description",
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

  getVendorList(): Promise<any[]> {
      const observable$ = this.vendorService.getVendors(this.tenantId).pipe(
        tap((vendrs:any) => {
          this.vendors = vendrs; // Handles the side-effect safely
          console.log('All vendors............',vendrs);
          
        })
      );
    return firstValueFrom(observable$);
    }

    
    async  saveVendor() {
      this.currOpMode=FormOpMode.View; this.isFormHidden=true;
        if ( !this.form.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Vendor Name and Category is required' });
          return;
        }

        
        // TODO: Implement API call to save order
    this.model.tenantId=this.tenantId; 
   
         try{
           const res = await firstValueFrom(this.vendorService.createVendor(this.model))
           
     
     //refresh grid
         this.getVendorList();
        console.log('Saving Vendor:', this.model);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Vendor saved successfully' });
          this.currOpMode=FormOpMode.View; 
      } catch (error) {
    console.error('Save failed', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save vendor' });
  }
    }

    removeVendor(index: number) {
    this.vendors?.splice(index, 1);
      }

      clearVendor() {
        //this.model = { tenantId:0,sitename: '' ,sites:[]};
        this.form.reset();
      }
}
