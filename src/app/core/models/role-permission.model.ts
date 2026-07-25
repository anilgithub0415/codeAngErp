// src/app/core/models/role-permission.model.ts
import { Permission } from './permission.model';

export interface CreateRolePermissionDto {
    roleName: string;
    permissionName: string;
}

export interface RolePermission {
    tenantId: number;
    roleName: string;
    permissionName: string;
    permission?: Permission; // Optional relation metadata populated by backend map joins
}
