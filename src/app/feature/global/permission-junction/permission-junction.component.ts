import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { ButtonTabsComponent, TabDirective } from '../../../shared/components/button-tabs/button-tabs.component';
import { PermissionComponent } from '../permission/permission.component';
import { RolePermissionsComponent } from '../role-permissions/role-permissions.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UserRoleComponent } from '../user-role/user-role.component'; 

@Component({
  selector: 'app-permission-junction', schemas:[CUSTOM_ELEMENTS_SCHEMA],standalone:true,
  imports: [ButtonTabsComponent,TabDirective, 
    ToastModule,
    UserRoleComponent,PermissionComponent,RolePermissionsComponent],
  providers:[MessageService],
  templateUrl: './permission-junction.component.html',
  styleUrl: './permission-junction.component.scss'
})
export class PermissionJunctionComponent {
@Input() tenantId!:number;
myTabConfig:any;
  ngOnInit(){
     this.myTabConfig = [
    { label: 'Roles', id: 'Roles' },
    {label:'Permissions',id:'Permissions'},
         { label: 'Role Permissions', id: 'RolePermissions'}
  ];
  }

}
