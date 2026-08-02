
// src/app/pages/user-role/user-role.component.ts
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRoleService } from '../../../core/services/user-role.service';
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
  selector: 'app-user-role',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    SelectModule, InputTextModule, PanelModule, TableModule, RippleModule, 
    ButtonModule, FilterControlComponent, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-role.component.html',
  styleUrl: './user-role.component.scss'
})
export class UserRoleComponent implements OnInit {
  visibleDataArray!: any[];
  @Input()   tenantId!: number;          
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  form = new FormGroup({});
  model: any = { tenantId: 0, rolename: '', description: '', isActive: true, assignedPermissions: [] };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  roles: any[] = []; 

  private formService = inject(FormService);
  private userRoleService = inject(UserRoleService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.resetModel();

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent }); 
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });
 
    this.getForm_RoleConfig();
    this.refreshGrid();
  }

  private resetModel() {
    this.model = { tenantId: this.tenantId, rolename: '', description: '', isActive: true, assignedPermissions: [] };
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
    console.log('Fetching fresh role data context for composite targeting:', selectedRecord.rolename);
    
    // Antipattern Fix: Fetch fresh, single source of truth from database before patching formly view 
    this.userRoleService.getRole(this.tenantId, selectedRecord.rolename).subscribe({
      next: (freshRecord) => {
        this.isFormHidden = false;
        this.currOpMode = FormOpMode.Update; 
        localStorage.setItem('currOpMode', this.currOpMode);
        
        // Map backend junction entity rows into simple scalar string array for formly checkboxes
        const permissionsArray = freshRecord.rolePermissions?.map((p: any) => p.permissionName) || [];
        
        this.model = { 
          ...freshRecord,
          assignedPermissions: permissionsArray
        };
        
        this.form.patchValue(this.model);
        this.cd.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Sync Failed', detail: 'Could not fetch latest role configurations.' });
      }
    });
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  getForm_RoleConfig() {
    this.formService.getForm(this.tenantId!, 'user_role_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });
       
    // Hardcoded design fallback schema mirroring your layout options
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
            "key": "rolename",
            "className": "col-span-12 md:col-span-4",
            "props": { "label": "Role Identifier Name", "placeholder": "e.g. SalesManager", "required": true }
          },
          {
            "type": "input",
            "key": "description",
            "className": "col-span-12 md:col-span-5",
            "props": { "label": "Description", "placeholder": "Enter functional scope details", "required": false }
          },
          {
            "type": "checkbox",
            "key": "isActive",
            "className": "col-span-12 md:col-span-3 mb-2",
            "props": { "label": "Active Status", "binary": true }
          }
        ]
      }
    ];

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 
  }

  getRoleList(): Promise<any[]> {
    const observable$ = this.userRoleService.getRoles(this.tenantId).pipe(
      tap((data: any[]) => {
        this.roles = data; 
        this.visibleDataArray = [...this.roles];
      })
    );
    return firstValueFrom(observable$);
  }

  async refreshGrid() {
    try {
      await this.getRoleList();
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error fetching system roles list:', err);
    }
  }

  async saveRole() {
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Role validation constraints failed' });
      return;
    }

    const payload = { ...this.form.value, tenantId: this.tenantId };
    const savedOpMode = this.currOpMode; 

    this.isFormHidden = true;
    this.currOpMode = FormOpMode.View;

    try {
      if (savedOpMode === FormOpMode.Update) {
        // Pass composite parameter tracking key explicitly
        await firstValueFrom(this.userRoleService.updateRole(this.model.rolename, payload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Role mapping updated successfully' });
      } else {
        await firstValueFrom(this.userRoleService.createRole(payload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'New system role registered successfully' });
      }
     
      await this.refreshGrid();
    } catch (error: any) {
      console.error('Save configuration process crashed:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to finish transaction save' });
      
      this.isFormHidden = false;
      this.currOpMode = savedOpMode;
    }
  }
  removeRole(targetRole: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete the security role "${targetRole.rolename}"?`,
      header: 'Confirm Role Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        
        // Anti-pattern Fix: Do not splice local array! Verify through network database endpoints 
        this.userRoleService.deleteRole(this.tenantId, targetRole.rolename).subscribe({
          next: () => {
            this.roles = this.roles.filter(r => r.rolename !== targetRole.rolename);
            this.visibleDataArray = [...this.roles];
            
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Role deleted successfully.' });
          },
          error: (err) => {
            // String evaluation fallback completely bypasses undefined err.status problems
            const errPayloadText = JSON.stringify(err) + (err?.message || '');
            if (errPayloadText.includes('409') || errPayloadText.includes('REFERENCE constraint')) {
              this.messageService.add({ 
                severity: 'warn', 
                summary: 'Deletion Blocked', 
                detail: 'Cannot delete. Active users or configured security matrices depend on this role context.',
                life: 6000 
              });
            } else {
              this.messageService.add({ severity: 'error', summary: 'System Error', detail: 'Unable to complete database deletion operation.' });
            }
          }
        });
        
      }
    });
  }

  clearRole() {
    this.form.reset({ isActive: true, tenantId: this.tenantId });
  }

  
}

