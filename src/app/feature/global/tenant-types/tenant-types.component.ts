
// src/app/feature/settings/tenant-types/tenant-types.component.ts (Part 1)
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, Input, OnInit } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormlyInputModule } from "@ngx-formly/primeng/input";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { RippleModule } from "primeng/ripple";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { FilterControlComponent } from "../../../shared/components/filter-control/filter-control.component";
import { FormOpMode } from "../../../shared/enums/FormOpMode.enum";
import { FormService } from "../../../core/services/form.service";
import { TenantTypeService,TenantType } from "../../../core/services/tenant-type.service";
import { AuthService } from "../../../core/services/auth.service";
import { FormlyCardWrapperComponent } from "../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component";
import { hydrateFormlyConfig } from "../../../shared/utils/hydrationOfFormlyJson";
import { firstValueFrom, tap } from "rxjs";

@Component({
  selector: 'app-tenant-types',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule,
    FormlyModule, InputTextModule, FormlyInputModule, PanelModule, 
    TableModule, RippleModule, ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './tenant-types.component.html',
  styleUrl: './tenant-types.component.scss'
})
export class TenantTypesComponent implements OnInit {
  visibleDataArray: TenantType[] = [];
  @Input()  tenantId!: number;
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  form = new FormGroup({});
  model: TenantType = { typeName: '' };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  tenantTypes: TenantType[] = []; 

  private formService = inject(FormService);
  private tenantTypeService = inject(TenantTypeService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
  
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });

    this.getForm_TenantTypes();
    this.refreshTypeList().catch(err => console.error('Error fetching layout data:', err));
  }
// src/app/feature/settings/tenant-types/tenant-types.component.ts (Part 2)
  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    this.form.reset();
    this.model = { typeName: '' };
  }

  async saveTenantType() {
    if (!this.form.valid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Tenant Type Name is required.' 
      });
      return;
    }

    const submissionPayload = {
      ...this.model,
      ...this.form.value
    };

    try {
      console.log('Routing standard POST generation pipeline for tenant type lookup creation...');
      await firstValueFrom(this.tenantTypeService.createTenantType(submissionPayload));
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Tenant type saved successfully' });

      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();
      
      await this.refreshTypeList();
      this.cd.detectChanges();
    } catch (error: any) {
      console.error('Lookup mutation execution layer crash:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.message || 'Failed to save lookup record context.' 
      });
    }
  }

  async removeTenantType(record: TenantType) {
    try {
      console.log('Routing DELETE transaction context sequence for payload key:', record.typeName);
      await firstValueFrom(this.tenantTypeService.deleteTenantType(record.typeName));
      this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Tenant type deleted successfully' });
      
      await this.refreshTypeList();
      this.cd.detectChanges();
    } catch (error: any) {
      console.error('Delete mutation pipeline error execution context block:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to delete lookup value.' });
    }
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }

  clearForm() {
    this.form.reset();
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  refreshTypeList(): Promise<any> {
    const observable$ = this.tenantTypeService.getTenantTypes().pipe(
      tap((types: TenantType[]) => {
        this.tenantTypes = types;
        this.visibleDataArray = [...this.tenantTypes];
        console.log('All tenant structural types tracked successfully:', types);
      })
    );
    return firstValueFrom(observable$);
  }

  getForm_TenantTypes() {
    this.formService.getForm(this.tenantId!, 'tenant_types_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });
       
    this.raw = [
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "typeName",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Tenant Type Name",
              "placeholder": "Enter type name (e.g. Corporate, Education)",
              "required": true
            }
          }
        ]
      }
    ];

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 
    console.log('Tenant type lookup forms mapped successfully.');
  }
}
