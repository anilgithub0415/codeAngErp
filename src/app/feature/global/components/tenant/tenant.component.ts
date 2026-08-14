
// src/app/features/tenant/tenant.component.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { firstValueFrom, tap } from 'rxjs';

import { FormService } from '../../../../core/services/form.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Tenant } from '../../../../core/models/tenant.model';
import { AuthService } from '../../../../core/services/auth.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { FilterControlComponent } from '../../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { FormlyFieldButtonComponent } from '../../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { hydrateFormlyConfig, applyLocalSearchExtension } from '../../../../shared/utils/hydrationOfFormlyJson';

@Component({
  selector: 'app-tenant',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule,
    FormlyModule, SelectModule, InputTextModule, FormlyInputModule,
    PanelModule, TableModule, RippleModule, ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './tenant.component.html',
  styles: []
})
export class TenantComponent implements OnInit {
  visibleDataArray!: any[];
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode;
  currOpMode: FormOpMode = FormOpMode.View;
  raw: any;
  aForm!: any;

  form = new FormGroup({});
  model = {
    tenantId: 0,
    tenantName: '',
    tenantTypeName: '',
    subscriptionPlanName: '',
    subscriptionEndDate: '',
    isActive: true,
    autocodeConfig: { faculty: '', student: '' }
  };
  fields: FormlyFieldConfig[] = [];

  tenants: Tenant[] | undefined = [];

  private formService = inject(FormService);
  private tenantService = inject(TenantService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private lookupService = inject(LookupService);
  private messageService = inject(MessageService);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.resetModel();

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });

    this.getForm_Tenant();
    this.getTenantList().then(data => {
      this.tenants = data;
      this.visibleDataArray = [...this.tenants!];
    }).catch((err: any) => {
      console.error('Initialization Error:', err);
    });
  }

  private resetModel() {
    this.model = {
      tenantId: 0,
      tenantName: '',
      tenantTypeName: '',
      subscriptionPlanName: '',
      subscriptionEndDate: '',
      isActive: true,
      autocodeConfig: { faculty: '', student: '' }
    };
  }

  onDataFiltered(filteredResults: any[]) {
    this.visibleDataArray = filteredResults;
    console.log('onDataFiltered count:', this.visibleDataArray.length);
  }

  getForm_Tenant() {
    this.raw = [
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "tenantName",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Tenant Name",
              "placeholder": "Enter unique tenant name",
              "required": true
            }
          },
          //key:tenantTypeName
          //lookupKey:tenantTypes
          {
            "type": "primeng-dropdown",
            "key": "tenantTypeName", 
            "className": "col-span-12 md:col-span-6",
            "props": {"label": "Tenant Type", "valueProp": "value", 
              "styleClass": "w-full", "labelProp": "label", "optionLabel": "label","optionValue": "value", "placeholder": "Select tenantType",
              "lookupKey": "tenantTypes",  "required": true, "filter": true }
          },
         
         {
            "type": "primeng-dropdown",
            "key": "subscriptionPlanName", 
            "className": "col-span-12 md:col-span-6",
            "props": {"label": "Subscription Type", "valueProp": "value", 
              "styleClass": "w-full", "labelProp": "label", "optionLabel": "label","optionValue": "value", "placeholder": "Select tenantType",
              "lookupKey": "subscriptionTypes",  "required": true, "filter": true }
          },
         
          {
            "type": "input",
            "key": "subscriptionEndDate",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Subscription End Date",
              "placeholder": "YYYY-MM-DD",
              "type": "date"
            }
          },
          {
            "type": "checkbox",
            "key": "isActive",
            "className": "col-span-12 md:col-span-2 mb-2",
            "props": {
              "label": "Is Active Status"
            }
          }
        ]
      },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": { "title": "Autocode Configuration JSON" },
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "autocodeConfig.faculty",
            "className": "col-span-12 md:col-span-6",
            "props": {
              "label": "Faculty Code Mask",
              "placeholder": "FAC-{YYYY}-{NNNN}"
            }
          },
          {
            "type": "input",
            "key": "autocodeConfig.student",
            "className": "col-span-12 md:col-span-6",
            "props": {
              "label": "Student Code Mask",
              "placeholder": "STU-{YYYY}-{NNNN}"
            }
          }
        ]
      },
      {
        "type": "button",
        "className": "col-span-12 md:col-span-3 mt-4",
        "props": {
          "text": "Save Tenant",
          "type": "submit",
          "styleClass": "p-button-success"
        }
      }
    ];

    const dataSources = { mobileNumber: [], customerName: [] };
    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated;
    applyLocalSearchExtension(this.fields, dataSources);

    this.formService.getForm(0, 'tenant_form').subscribe(aform => {
      
        this.aForm = aform;
        this.raw = JSON.parse(this.aForm.FormlyConfig);
      
    });
  }

  getTenantList(): Promise<any[]> {
    const observable$ = this.tenantService.getTenants().pipe(
      tap((data: any) => {
        this.tenants = data;
        console.log('All tenants fetched:', data);
      })
    );
    return firstValueFrom(observable$);
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.resetModel();
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
  }

  async onEditClick(selectedRecord: any) {
    console.log('Selected tenant record for edit:', selectedRecord);
    await setTimeout(() => {
      this.isFormHidden = false;
      this.currOpMode = FormOpMode.Update;
      localStorage.setItem('currOpMode', this.currOpMode);
      
      // Ensure the child properties map safely
      this.model = {
        ...selectedRecord,
        autocodeConfig: selectedRecord.autocodeConfig || { faculty: '', student: '' }
      };
      
      this.patchForm(this.model);
      this.cd.detectChanges();
    }, 2000);
  }

  private patchForm(record: any) {
    this.form.patchValue(record);
  }

  async saveTenant() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tenant credentials are required' });
      return;
    }

    try {
      // Add this at the top of your method or DTO mapping
if (this.model.tenantId === 0) {
    delete (this.model as any).tenantId;
}

      await firstValueFrom(this.tenantService.createTenant(this.model));
      this.getTenantList().then(data => {
        this.tenants = data;
        this.visibleDataArray = [...this.tenants!];
        this.cd.detectChanges();
      });
      console.log('Saved entry structure:', this.model);
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Tenant profile configuration recorded successfully' });
    } catch (error) {
      console.error('Save failed', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to commit dynamic properties updates' });
    }
  }

  removeTenant(index: number) {
    this.tenants?.splice(index, 1);
    this.visibleDataArray = [...this.tenants!];
  }

  clearTenant() {
    this.form.reset();
  }
}