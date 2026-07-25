// src/app/core/models/permission.model.ts
export interface Permission {
  id: number;
  tenantId: number;
  permissionName: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePermissionDto {
  id?: number;
  tenantId: number;
  permissionName: string;
  description?: string | null;
  isActive?: boolean;
}
