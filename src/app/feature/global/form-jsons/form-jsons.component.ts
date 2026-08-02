import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import { TenantFormConfigsService, TenantFormConfig } from "../../../core/services/tenant-form-configs.service";
import { FormlyCardWrapperComponent } from "../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component";
import { hydrateFormlyConfig } from "../../../shared/utils/hydrationOfFormlyJson";
import { firstValueFrom, tap } from "rxjs";
import { FormlyTextAreaModule } from "@ngx-formly/primeng/textarea";

@Component({
  selector: 'app-form-jsons',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule,
    FormlyModule, InputTextModule, FormlyInputModule, PanelModule, 
    TableModule, RippleModule, ButtonModule, FilterControlComponent, FormlyTextAreaModule
  ],
  providers: [MessageService],
  templateUrl: './form-jsons.component.html',
  styleUrl: './form-jsons.component.scss'
})
export class FormJSONsComponent implements OnInit {
  visibleDataArray: TenantFormConfig[] = [];
  @Input() tenantId!: number;
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  //form = new FormGroup({});
    // Replace the old failing form definition completely with this clean block:
  form = new FormGroup({
    id: new FormControl<number | null>(null),
    tenantId: new FormControl<number | null>(null),
    FormKey: new FormControl<string>('', { nonNullable: true }),
    FormlyConfig: new FormControl<string>('', { nonNullable: true })
  });

  model: TenantFormConfig = { id: 0, tenantId: 0, FormKey: '', FormlyConfig: '' };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  configs: TenantFormConfig[] = []; 

  private formService = inject(FormService);
  private configService = inject(TenantFormConfigsService);
  private formlyConfig = inject(FormlyConfig);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

    ngOnInit(): void {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    
    // Explicit runtime fallback registration mapping
    this.formlyConfig.setType({
      name: 'textarea',
      extends: 'input',
      defaultOptions: {
        templateOptions: {
          rows: 8
        }
      }
    });

    this.getForm_TenantFormConfigs();
    this.refreshConfigList().catch(err => console.error('Error fetching baseline layout grid details:', err));
  }
  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    this.form.reset({ id: 0, tenantId: this.tenantId, FormKey: '', FormlyConfig: '' });
    this.model = { id: 0, tenantId: this.tenantId, FormKey: '', FormlyConfig: '' };
  }

  async onEditClick(selectedRecord: TenantFormConfig) {
    console.log('Record targeted for update layout execution:', selectedRecord);
    this.model = { ...selectedRecord };
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update;

    // Use absolute field matching to guarantee values load into the HTML controls
    this.form.patchValue({
      id: selectedRecord.id,
      tenantId: selectedRecord.tenantId,
      FormKey: selectedRecord.FormKey,
      FormlyConfig: selectedRecord.FormlyConfig
    });
    
    this.cd.detectChanges();
  }

  clearFormConfig() {
    this.form.reset({ id: 0, tenantId: this.tenantId, FormKey: '', FormlyConfig: '' });
  }
  
    async saveFormConfig() { console.log('.........yes running');
    
    if (!this.form.valid) { console.log('this.form.valid:',this.form.valid);
    
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Form Key and Formly Config properties are required fields.' 
      });
      return;
    }

    // Extract current raw values to bypass potential undefined status flags
    const formValues = this.form.getRawValue();

    // Construct the payload with explicit string fallback constraints
    const submissionPayload: TenantFormConfig = {
      id: this.model.id || undefined,
      tenantId: this.tenantId,
      FormKey: formValues.FormKey || '',
      FormlyConfig: formValues.FormlyConfig || ''
    };

    try {
      if (this.currOpMode === FormOpMode.Update && this.model.id) {
        console.log('Routing PUT modification pipeline details matching target key:', submissionPayload);
        await firstValueFrom(this.configService.updateFormConfig(this.tenantId, this.model.id, submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Form layout configuration details updated successfully' });
      } else {
        console.log('Routing generic configuration creation POST pipeline...');
        await firstValueFrom(this.configService.createFormConfig(this.tenantId, submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Form layout configuration registered successfully' });
      }

      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();
      
      await this.refreshConfigList();
      this.cd.detectChanges();
    } catch (error: any) {
      console.error('Data pipeline write sequence anomaly identified:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.message || 'Failed to apply form configuration variable context changes.' 
      });
    }
  }


  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }


  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  refreshConfigList(): Promise<any> {
    const observable$ = this.configService.getFormConfigs(this.tenantId).pipe(
      tap((data: TenantFormConfig[]) => {
        this.configs = data;
        this.visibleDataArray = [...this.configs];
        console.log('All tracking form configurations updated successfully:', data);
      })
    );
    return firstValueFrom(observable$);
  }

  getForm_TenantFormConfigs() {
    this.formService.getForm(this.tenantId!, 'tenant_form_configs_form').subscribe(aform => {
      this.aForm = aform; 
      if (this.aForm?.FormlyConfig) {
        this.raw = JSON.parse(this.aForm.FormlyConfig);
      }
    });
           this.raw = [
      { "key": "id", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        // "w-full block" cleanly takes up full layout real estate space
        "className": "w-full block mb-0",
        "props": {},
        // Flex column layout configuration breaks everything into independent vertical rows
        "fieldGroupClassName": "flex flex-col gap-4 w-full p-fluid mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "FormKey",
            "className": "w-full",
            "props": {
              "label": "Form Schema Identification Key",
              "placeholder": "Enter descriptive Form Key (e.g. user_form)",
              "required": true
            }
          },
          {
            // Now behaves natively as a clean textarea box structure
            "type": "textarea",
            "key": "FormlyConfig",
            "className": "w-full",
            "props": {
              "label": "Formly JSON Layout Configuration Schema",
              "placeholder": "Enter valid raw or escaped Formly JSON array text metadata",
              "required": true,
              "rows": 8 // Enforces height space expansion limit parameters
            }
          }
        ]
      }
    ];


    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 
    console.log('Formly schema configuration layouts compiled successfully.');
  }
}
