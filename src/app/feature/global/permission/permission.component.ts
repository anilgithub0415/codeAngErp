


// src/app/pages/permission/permission.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { Permission } from '../../../core/models/permission.model';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { PermissionService } from '../../../core/services/permission.service';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { hydrateFormlyConfig } from '../../../shared/utils/hydrationOfFormlyJson';
import { firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-permission',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    SelectModule, InputTextModule, PanelModule, TableModule, RippleModule, 
    ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss'
})
export class PermissionComponent implements OnInit {
  visibleDataArray!: any[];
  tenantId!: number;          
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  form = new FormGroup({});
  model: any = { id: 0, tenantId: 0, permissionName: '', description: '', isActive: true };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  permissions: Permission[] | undefined = []; 

  private formService = inject(FormService);
  private permissionService = inject(PermissionService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private lookupService = inject(LookupService);
  private messageService = inject(MessageService);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.resetModel();
    this.tenantId = this.authServ.getTenantId()!;   

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent }); 
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });
 
    this.getForm_Permission();
    this.refreshGrid();
  }

  private resetModel() {
    this.model = { id: 0, tenantId: 0, permissionName: '', description: '', isActive: true };
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    this.resetModel();
    this.form.reset(this.model);
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }

  async onEditClick(selectedRecord: any) {
    console.log('selectedRecord for edit:', selectedRecord);
    setTimeout(() => {
      this.isFormHidden = false;
      this.currOpMode = FormOpMode.Update; 
      localStorage.setItem('currOpMode', this.currOpMode);
      
      this.model = { ...selectedRecord };
      this.patchForm(this.model);
      this.cd.detectChanges();
    }, 100);
  }

  private patchForm(record: any) {
    this.form.patchValue(record);
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  getForm_Permission() {
    this.formService.getForm(this.tenantId!, 'permission_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });
       
    this.raw = [
      { "key": "id", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "permissionName",
            "className": "col-span-12 md:col-span-4",
            "props": { "label": "Permission Name", "placeholder": "Enter permission name", "required": true }
          },
          {
            "type": "input",
            "key": "description",
            "className": "col-span-12 md:col-span-5",
            "props": { "label": "Description", "placeholder": "Enter description", "required": false }
          },
          {
            "type": "checkbox",
            "key": "isActive",
            "className": "col-span-12 md:col-span-3 mb-2",
            "props": { "label": "Active Status", "binary": true }
          }
        ]
      },
      {
        "type": "button",
        "className": "col-span-12 md:col-span-3 mt-4",
        "props": { "text": "Save Permission", "type": "submit", "styleClass": "p-button-success" }
      }
    ];

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 
  }

  getPermissionList(): Promise<any[]> {
    const observable$ = this.permissionService.getPermissions(this.tenantId).pipe(
      tap((perms: any) => {
        this.permissions = perms; 
        this.visibleDataArray = [...this.permissions!];
      })
    );
    return firstValueFrom(observable$);
  }

  async refreshGrid() {
    try {
      await this.getPermissionList();
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  }

  async savePermission() {
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Permission Form validation rules failed' });
      return;
    }

    const payload = { ...this.form.value, tenantId: this.tenantId };
    const savedOpMode = this.currOpMode; 

    this.isFormHidden = true;
    this.currOpMode = FormOpMode.View;

    try {
      if (savedOpMode === FormOpMode.Update) {
        await firstValueFrom(this.permissionService.updatePermission(this.model.id, payload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Permission updated successfully' });
      } else {
        await firstValueFrom(this.permissionService.createPermission(payload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Permission created successfully' });
      }
     
      await this.refreshGrid();
    } catch (error: any) {
      console.error('Save operation failed completely:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to complete save sequence' });
      
      this.isFormHidden = false;
      this.currOpMode = savedOpMode;
    }
  }

  removePermission(index: number) {
    this.permissions?.splice(index, 1);
  }

  clearPermission() {
    this.form.reset({ isActive: true });
  }
}
