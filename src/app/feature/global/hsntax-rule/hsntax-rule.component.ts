import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormService } from '../../../core/services/form.service';
import { HSNTaxRuleService} from '../../../core/services/hsntaxrule.service'
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

import { FormlyCustomRowBridgeNewComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge-new/formly-custom-row-bridge-new.component';
import { organisationRowTemplate } from '../../../shared/components/formlyfields/organisation-row/organisation-row.template';
import { ClientStatus } from '../../../shared/enums/ClientStatus.enum';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';


import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { applyLocalSearchExtension, hydrateFormlyConfig } from '../../../shared/utils/hydrationOfFormlyJson';
import { FORMLY_ROW_REGISTRY, PlainFormlyFieldConfig, RegistryFieldConfig } from '../../customer-mgt/formly-registry';
import { HSNTaxRule } from '../../../core/models/hsntaxrule.model';

@Component({
  selector: 'app-hsntax-rule',
  imports: [CommonModule,ToastModule ,ReactiveFormsModule, FormsModule,
         FormlyModule, FormsModule,SelectModule ,InputTextModule,FormlyInputModule,
         PanelModule,  TableModule,RippleModule,ButtonModule,
         FilterControlComponent],
  providers:[MessageService],
  templateUrl: './hsntax-rule.component.html',
  styleUrl: './hsntax-rule.component.scss'
})
export class HSNTaxRuleComponent {
visibleDataArray!: any[] ;
  isFormHidden:boolean=true;
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; customerDetailsRequired:boolean=true;
  raw:any;

  form = new FormGroup({});
    model= {hsnCode:'',description:'',cgstRate:0,sgstRate:0,igstRate:0};//Partial<createCustomer> 
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;
 options$!:any[]
    
   hsnTaxRules: HSNTaxRule[] |undefined = [] ; 
   
   expandedRows: { [id: number]: boolean } = {};
     private formService=inject(FormService);
    private hsnTaxRuleService=inject(HSNTaxRuleService);

    private formlyConfig = inject(FormlyConfig);
    private authServ=inject(AuthService)
    private lookupService=inject(LookupService)
 private messageService=inject(MessageService)
    constructor( private cd: ChangeDetectorRef
      
    ){
  
    }
 

   ngOnInit(): void {
    this.model= {hsnCode:'',description:'',cgstRate:0,sgstRate:0,igstRate:0};

   
     this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),
  
           this.formlyConfig.setType({
              name: 'primeng-dropdown',
              component: FormlyFieldPrimengDropdownComponent,
            });


    
   this.formlyConfig.setWrapper({
     name:'typeahead-wrapper',component:FormlyWrapperTypeaheadComponent
   }); 

  
   
 //// ← add this line
     this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent })
 
 this.getForm_HSNTaxRule();
 this.getHSNTaxRuleList().then(custs=>{
    this.hsnTaxRules=custs;   this.visibleDataArray= [...this.hsnTaxRules!];
  }).catch((err:any)=>{    console.error('Error:',err)  });


  

           
 }


 //For Filter data
 onDataFiltered(filteredResults: any[]) { 
 
    this.visibleDataArray = filteredResults;
    console.log('onDataFilter..............visibleDataArray:',this.visibleDataArray.length);
  }

   getForm_HSNTaxRule(){
 //formkey:customer_form
  
 //var raw:any;
 //passing tenantId zero, as its dont have tenant




  //without $index and rowtemplate
     this.raw=
     [
  { "key": "id", "type": "input", "hide": true },
  { "key": "createdByUserId", "type": "input", "hide": true },
  {
    "wrappers": ["panel"],
    "className": "col-span-12 w-full block mb-0",
    "props": {},
    "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
    "fieldGroup": [
      {
          "type": "input",
          "key": "hsnCode",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "label": "hsnCode ",
            "placeholder": "Enter hsnCode",
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
        {
          "type": "input",
          "key": "cgstRate",
          "className": "col-span-12 md:col-span-1",
          "props": {
            "label": "cgstRate",
            "placeholder": "Enter cgstRate",
            "required":true
          }
        },
        {
          "type": "input",
          "key": "sgstRate",
          "className": "col-span-12 md:col-span-1",
          "props": {
            "label": "sgstRate",
            "placeholder": "Enter sgstRate",
            "required":true
          }
        },
        //
        {
          "type": "input",
          "key": "igstRate",
          "className": "col-span-12 md:col-span-1",
          "props": {
            "label": "igstRate",
            "placeholder": "Enter igstRate",
            "required":true
          }
        },
    ]
  },
  {
    "type": "button",
    "className": "col-span-12 md:col-span-3 mt-4",
    "props": {
      "text": "Save HSNTaxRule",
      "type": "submit",
      "styleClass": "p-button-success"
    }
  }
]

        const hydrated = hydrateFormlyConfig(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
        
        applyLocalSearchExtension(this.fields);






     this.formService.getForm(0,'customer_form').subscribe(aform=>{
       
       
       this.aForm=aform; 
      
            
        this.raw=JSON.parse(this.aForm.FormlyConfig) ;
       
       
    

  
     })
   
   } 
 

  getHSNTaxRuleList(): Promise<any[]> {
      const observable$ = this.hsnTaxRuleService.getHSNTaxRules().pipe(
        tap((hsntaxRules:any) => {
          this.hsnTaxRules = hsntaxRules; 
          console.log('All hsntaxRules............',hsntaxRules);
          
        })
      );
    return firstValueFrom(observable$);
    }
    

Add(){
  this.isFormHidden=false;
  this.currOpMode=FormOpMode.Add; localStorage.setItem('currOpMode',this.currOpMode);
  
    this.model= {hsnCode:'',description:'',cgstRate:0,sgstRate:0,igstRate:0};
  
  
}

CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}
  async onEditClick(selectedRecord: any) {
  console.log('selectedRecord:',selectedRecord);
  
await setTimeout(() => {
          this.isFormHidden=false;

          this.currOpMode=FormOpMode.Update; localStorage.setItem('currOpMode',this.currOpMode)
          console.log('currOpMode is:',this.currOpMode);
          
         this.model=selectedRecord
                this.patchForm(selectedRecord);//selectedRecord

           
            this.cd.detectChanges();
          


}, 2000);
}


private patchForm(record: any) {
  
  this.form.setValue(this.model);
  
}
    async  saveHSNTaxRule() {
      this.currOpMode=FormOpMode.View; this.isFormHidden=true;
        if ( !this.form.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Customer Name and Category is required' });
          return;
        }

        
   
         try{
           const res = await firstValueFrom(this.hsnTaxRuleService.createHSNTaxRule(this.model))
           //.subscribe(res=>console.log('Customer saved successfully!',res)   )
     
     //refresh grid
         this.getHSNTaxRuleList();
        console.log('Saving Customer:', this.model);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Customer saved successfully' });
          this.currOpMode=FormOpMode.View; 
      } catch (error) {
    console.error('Save failed', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save customer' });
  }
    }

    removeHSNTaxRule(index: number) {
    this.hsnTaxRules?.splice(index, 1);
      }

      clearHSNTaxRule() {
        
        this.form.reset();
      }


}
