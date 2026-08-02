// src/app/pages/role-permissions/role-permissions.component.ts
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
import { MessageService } from 'primeng/api';

import { RolePermission } from '../../../core/models/role-permission.model';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { PermissionService } from '../../../core/services/permission.service';
import { RolePermissionService } from '../../../core/services/role-permission.service';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-role-permissions',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    SelectModule, InputTextModule, PanelModule, TableModule, RippleModule, 
    ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './role-permissions.component.html',
  styleUrl: './role-permissions.component.scss'
})
export class RolePermissionsComponent implements OnInit {
  visibleDataArray!: any[];
  @Input()   tenantId!: number;          
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  form = new FormGroup({});
  model: any = { tenantId: 0, roleName: '', permissionName: '' };
  fields: FormlyFieldConfig[] = [];
  rolePermissions: RolePermission[] = []; 

  private rolePermissionService = inject(RolePermissionService);
  private permissionService = inject(PermissionService);
  private lookupService = inject(LookupService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    
    this.resetModel();
    this.buildFormlyFields();
    this.refreshGrid();
  }

  private resetModel() {
    this.model = { tenantId: this.tenantId, roleName: '', permissionName: '' };
  }

  async refreshGrid() {
    try {
      const data = await firstValueFrom(this.rolePermissionService.getAllRolePermissions(this.tenantId));
      this.rolePermissions = data || [];
      this.visibleDataArray = [...this.rolePermissions];
      this.cd.detectChanges();
    } catch (err: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load grid matrix' });
    }
  }

  async buildFormlyFields() {
    try {
      // 1. Fetch available permissions list to map options
      const permsData = await firstValueFrom(this.permissionService.getPermissions(this.tenantId));
      const permissionOptions = permsData.map(p => ({ label: p.permissionName, value: p.permissionName }));

      // 2. Fetch system active security roles from your global LookupService 
      const rolesData = await firstValueFrom(this.lookupService.getRoleTypes(this.tenantId)); //.getRoles
      const roleOptions = rolesData.map((r: any) => ({ 
  label: r.label, 
  value: r.value 
}));


      this.fields = [
        {
          fieldGroupClassName: 'grid flex row gap-4 p-3',
          fieldGroup: [
            {
              className: 'col-12 md:col-6',
              type: 'primeng-dropdown',
              key: 'roleName',
              templateOptions: {
                label: 'System Security Role',
                placeholder: 'Select a Security Role Role',
                required: true,
                options: roleOptions
              }
            },
            {
              className: 'col-12 md:col-6',
              type: 'primeng-dropdown',
              key: 'permissionName',
              templateOptions: {
                label: 'Assigned Action Permission Name',
                placeholder: 'Select target Action permission string',
                required: true,
                options: permissionOptions
              }
            }
          ]
        }
      ];
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error hydrating fields options:', error);
    }
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    this.resetModel();
    this.form.reset(this.model);
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }

  clearRolePermission() {
    this.form.reset();
    this.resetModel();
  }

  onDataFiltered(filteredData: any[]) {
    this.visibleDataArray = filteredData;
  }

  async saveRolePermission() {
    if (!this.form.valid) return;

    try {
      const payload = { ...this.model, tenantId: this.tenantId };
      await firstValueFrom(this.rolePermissionService.assignPermissionToRole(payload));
      
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permission mapped successfully' });
      this.CancelFormOp();
      this.refreshGrid();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Mapping Failed', detail: error.message });
    }
  }

  async removeRolePermission(mapping: RolePermission) {
    try {
      await firstValueFrom(this.rolePermissionService.revokePermissionFromRole(mapping.roleName, mapping.permissionName));
      this.messageService.add({ severity: 'warn', summary: 'Revoked', detail: 'Permission revoked cleanly' });
      this.refreshGrid();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Revocation Failed', detail: error.message });
    }
  }
}
