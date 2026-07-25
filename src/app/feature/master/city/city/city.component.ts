import { CommonModule } from "@angular/common";
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
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormOpMode } from "../../../../shared/enums/FormOpMode.enum";

import { FormService } from "../../../../core/services/form.service";
import { CityService } from "../../../../core/services/city.service";
import { AuthService } from "../../../../core/services/auth.service";
import { LookupService } from "../../../../core/services/lookup.service";
import { FormlyCardWrapperComponent } from "../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component";
import { FormlyFieldPrimengDropdownComponent } from "../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component";
import { FormlyFieldButtonComponent } from "../../../../shared/components/formlyfields/formly-field-button/formly-field-button.component";
import { applyLocalSearchExtension, hydrateFormlyConfig } from "../../../../shared/utils/hydrationOfFormlyJson";
import { firstValueFrom, tap } from "rxjs";
import { City } from "../../../../core/models/city.model";

@Component({
  selector: 'app-city',
  imports: [CommonModule,ToastModule,ReactiveFormsModule, FormsModule,
           FormlyModule, FormsModule,SelectModule ,InputTextModule,FormlyInputModule,
           PanelModule,  TableModule,RippleModule,ButtonModule,
           FilterControlComponent
            
          ],
          providers:[MessageService],
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss'
})
export class CityComponent {

visibleDataArray!: any[] ;
 tenantId!: number;          // <-- new property
 isFormHidden:boolean=true;
 readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

raw:any;

  form = new FormGroup({});
    model= {id:0,tenantId:0,cityName:'',cityAbbrevation:''};
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;
 options$!:any[]
    
   citys: City[] |undefined = [] ; 
   

    private formService=inject(FormService);
    private cityService=inject(CityService);

    private formlyConfig = inject(FormlyConfig);
    private authServ=inject(AuthService)
    private lookupService=inject(LookupService)
 private messageService=inject(MessageService)
    constructor( private cd: ChangeDetectorRef
      
    ){
  
    }


   ngOnInit(): void {
    this.model= {id:0,tenantId:0,cityName:'',cityAbbrevation:''};

    this.tenantId = this.authServ.getTenantId()!;   // <-- store once

     this.formlyConfig.setWrapper({name:'panel',component:FormlyCardWrapperComponent}),
  
           this.formlyConfig.setType({
              name: 'primeng-dropdown',
              component: FormlyFieldPrimengDropdownComponent,
            });


    
  
 //// ← add this line
     this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent })
 
 this.getForm_City();
 this.getCityList().then(cts=>{
    this.citys=cts;   this.visibleDataArray= [...this.citys!];
  }).catch(err=>{    console.error('Error:',err)  });
           
 }

// Inside class CityComponent { ...

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    
    // Explicitly wipe active validation controls to guarantee clean data isolation 
    this.form.reset();
    this.model = { id: 0, tenantId: this.tenantId, cityName: '', cityAbbrevation: '' };
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
        console.log('Successfully patchform executed in city context.');
      } catch (error) {
        console.error('An error occurred during formly patch assignment logic loops:', error);
      }
      this.cd.detectChanges();
    }, 50); // Faster execution loop to prevent input lag
  }

  async saveCity() {
    if (!this.form.valid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'City Name and Abbreviation fields are mandatory configurations.' 
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

      // Smart routing engine processing logic
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        console.log('Routing PUT modification context transaction sequence for target ID:', submissionPayload.id);
        response = await firstValueFrom(
          this.cityService.updateCity(submissionPayload.id, submissionPayload)
        );
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'City metadata was updated successfully' });
      } else {
        console.log('Routing standard POST generation pipeline for raw dataset creation...');
        response = await firstValueFrom(
          this.cityService.createCity(submissionPayload)
        );
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'New city location added successfully' });
      }

      // Shared cleanup routine logic
      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();
      
      // Force instant data reload view refresh sync
      await this.getCityList();
      this.cd.detectChanges();

    } catch (error: any) {
      console.error('City persistence mutation pipeline failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Database Write Failed', 
        detail: error.message || 'Failed to successfully sync city model details.' 
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
   getForm_City(){
  
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
          "key": "cityName",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "label": "City Name",
            "placeholder": "Enter City ",
            "required":true
          }
        },
        {
          "type": "input",
          "key": "cityAbbrevation",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "label": "cityAbbrevation",
            "placeholder": "Enter cityAbbrevation",
            "required":true
          }
        },
    ]
  },
  {
    "type": "button",
    "className": "col-span-12 md:col-span-3 mt-4",
    "props": {
      "text": "Save City",
      "type": "submit",
      "styleClass": "p-button-success"
    }
  }
]

        const hydrated = hydrateFormlyConfig(this.raw);
        this.fields=hydrated; console.log('fields loaded now...............................');
        
      //  applyLocalSearchExtension(this.fields);

  
   
   
   } 

  getCityList(): Promise<any[]> {
      const observable$ = this.cityService.getCitys(this.tenantId).pipe(
        tap((cts:any) => {
          this.citys = cts; // Handles the side-effect safely
          console.log('All citys............',cts);
          
        })
      );
    return firstValueFrom(observable$);
    }

    
    

    removeCity(index: number) {
    this.citys?.splice(index, 1);
      }

      clearCity() {
        //this.model = { tenantId:0,sitename: '' ,sites:[]};
        this.form.reset();
      }
}
