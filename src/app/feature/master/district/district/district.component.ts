import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormlyInputModule } from "@ngx-formly/primeng/input";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { RippleModule } from "primeng/ripple";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { FilterControlComponent } from "../../../../shared/components/filter-control/filter-control.component";
import { MessageService } from "primeng/api";
import { FormOpMode } from "../../../../shared/enums/FormOpMode.enum";
import { District } from "../../../../core/models/district.model";
import { FormService } from "../../../../core/services/form.service";
import { DistrictService } from "../../../../core/services/district.service";
import { AuthService } from "../../../../core/services/auth.service";
import { LookupService } from "../../../../core/services/lookup.service";
import { FormlyCardWrapperComponent } from "../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component";
import { FormlyFieldPrimengDropdownComponent } from "../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component";
import { FormlyWrapperTypeaheadComponent } from "../../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component";
import { RepeatsectionformlyComponent } from "../../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component";
import { FormlyCustomRowBridgeComponent } from "../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component";
import { FormlyFieldButtonComponent } from "../../../../shared/components/formlyfields/formly-field-button/formly-field-button.component";
import { applyLocalSearchExtension, hydrateFormlyConfig } from "../../../../shared/utils/hydrationOfFormlyJson";
import { firstValueFrom, tap } from "rxjs";

@Component({
  selector: 'app-district',
    imports: [CommonModule,ToastModule ,ReactiveFormsModule, FormsModule,
           FormlyModule, FormsModule,SelectModule, CommonModule,InputTextModule,FormlyInputModule,
           PanelModule,  TableModule,RippleModule,ButtonModule,
           FilterControlComponent
            
          ],
          providers:[MessageService],
  templateUrl: './district.component.html',
  styleUrl: './district.component.scss'
})
export class DistrictComponent {

visibleDataArray!: any[] ;
 tenantId!: number;          // <-- new property
 isFormHidden:boolean=true;
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

raw:any;

  form = new FormGroup({});
    model= {id:0,tenantId:0,districtName:''};
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;
 options$!:any[]
    
   districts: District[] |undefined = [] ; 
   

    private formService=inject(FormService);
    private districtService=inject(DistrictService);

    private formlyConfig = inject(FormlyConfig);
    private authServ=inject(AuthService)
    private lookupService=inject(LookupService)
 private messageService=inject(MessageService)
    constructor( private cd: ChangeDetectorRef
      
    ){
  
    }


   ngOnInit(): void {
    this.model= {id:0,tenantId:0,districtName:''};

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
 
 this.getForm_District();
 this.getDistrictList().then(vendrs=>{
    this.districts=vendrs;   this.visibleDataArray= [...this.districts!];
  }).catch(err=>{    console.error('Error:',err)  });
           
 }
  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    
    // Explicitly wipe active validation controls to guarantee clean data isolation 
    this.form.reset();
    this.model = { id: 0, tenantId: this.tenantId, districtName: '' } as any;
  }

  async onEditClick(selectedRecord: any) {
    console.log('selectedRecord for edit snapshot tracking:', selectedRecord);
    
    this.model = { ...selectedRecord }; // Preserves the record's target "id" safely inside the model state scope
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update; 
    localStorage.setItem('currOpMode', this.currOpMode);

    setTimeout(() => {
      try {
        this.form.patchValue(this.model);
        console.log('Successfully patchform executed in district context.');
      } catch (error) {
        console.error('An error occurred during formly patch assignment logic loops:', error);
      }
      this.cd.detectChanges();
    }, 50); // Faster execution loop to prevent input lag
  }

  async saveDistrict() {
    if (!this.form.valid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'District Name and Description are required fields.' 
      });
      return;
    }

    // Cast as 'any' to ensure TypeScript safely extracts dynamic entity structural IDs
    const submissionPayload = {
      ...this.model,
      ...this.form.value,
      tenantId: this.tenantId
    } as any;

    try {
      let response: any;

      // Smart routing engine processing logic separating POST and PUT flows
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        console.log('Routing PUT modification context transaction sequence for target ID:', submissionPayload.id);
        response = await firstValueFrom(
          this.districtService.updateDistrict(submissionPayload.id, submissionPayload)
        );
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'District updated successfully' });
      } else {
        console.log('Routing standard POST generation pipeline for raw dataset creation...');
        response = await firstValueFrom(
          this.districtService.createDistrict(submissionPayload)
        );
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'District saved successfully' });
      }

      // Shared cleanup routine logic
      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();
      
      // Force instant data reload view refresh sync
      await this.getDistrictList();
      this.cd.detectChanges();

    } catch (error: any) {
      console.error('District persistence mutation pipeline failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.message || 'Failed to save district context data mappings.' 
      });
    }
  }


CancelFormOp(){this.currOpMode=FormOpMode.View; this.isFormHidden=true;}

private patchForm(record: any) {
   this.model = record;
  this.form.setValue(this.model);
}
 //For Filter data
 onDataFiltered(filteredResults: any[]) { 
 
    this.visibleDataArray = filteredResults;
    console.log('onDataFilter..............visibleDataArray:',this.visibleDataArray.length);
  }
   getForm_District(){
  
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
          "key": "districtName",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "label": "district Name",
            "placeholder": "Enter districtName",
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
        
       // applyLocalSearchExtension(this.fields);

  
   
   
   } 

  getDistrictList(): Promise<any[]> {
      const observable$ = this.districtService.getDistricts(this.tenantId).pipe(
        tap((vendrs:any) => {
          this.districts = vendrs; // Handles the side-effect safely
          console.log('All districts............',vendrs);
          
        })
      );
    return firstValueFrom(observable$);
    }

    
    

    removeDistrict(index: number) {
    this.districts?.splice(index, 1);
      }

      clearDistrict() {
        //this.model = { tenantId:0,sitename: '' ,sites:[]};
        this.form.reset();
      }
}

