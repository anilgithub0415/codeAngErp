// src/app/core/models/user.model.ts

// Make sure to match the UserRole enum exactly as it is defined in your backend
// You can copy-paste it here or define it similarly if it's not a shared file.
// For simplicity, let's redefine it here.
export enum urlphrases{
    OnlyStudents='onlystudents'
}
export enum UserRole {
    INSTITUTE_ADMIN = 'InstituteAdmin',
    TEACHER = 'Teacher',
    STUDENT = 'Student',
    TEACHER_ADMIN = 'TeacherAdmin',
    STUDENT_SOLO = 'StudentSolo',
    SHARED_ACCESS_TEACHER = 'SharedAccessTeacher',
}

// Interface for AvailableContext (copy from AuthService or define globally if shared)
interface AvailableContext {
    tenantId: number;
    tenantName: string;
    roleName: string;
    permissions: string[];
}

// 1. User Interface (for data received from the backend API)
// This should mirror the backend's User entity, but exclude sensitive fields like raw passwords.
export interface User {
  id: number;
  tenantId: number;
  userName: string;
  displayName?: string | null;
  profilePictureUrl?:string|null;googleId?:string|null;isEmailVerified?:boolean;isActive?:boolean;userTenantContexts?:any;
  clientId?: number | null;
  siteId?: number | null;
  assignedRoles: string[]; // 👈 Changed from string to string[] to hold multiple parallel roles
  userAbbrevation?: string;
  firstName?: string;
  lastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  deviceInfo?: string;
}

export interface CreateUserDto {
  id?: number;
  tenantId: number;
  userName: string;
  displayName?: string|null;
  clientId?: number | null;
  siteId?: number | null;
  assignedRoles: string[]; // 👈 Changed to support multi-role arrays in payload packets
  password?: string;
  [key: string]: any;
}


// 3. UpdateUserDto (for data sent to backend when updating an existing user)
// This uses Partial and Omit utility types for flexibility.
export type UpdateUserDto = Partial<Omit<User, 'id' | 'tenantId' | 'googleId'>> & {
    // Re-add password as optional string for explicit password updates.
    // TenantId and googleId are typically not changed via a standard update DTO.
    googleId?:string;isEmailVerified?:boolean; isActive?:boolean;  activeTenantId?: number;
    password?: string;
    faculty_department?:string;
    faculty_designation?:string;
};

// Explanation of UpdateUserDto:
// - Omit<User, 'id' | 'tenantId' | 'googleId'>: Removes 'id' (primary key, not updated),
//   'tenantId' (usually set on creation, not changeable), and 'googleId' (linked identity, not changed).
// - Partial<...>: Makes all remaining properties optional, allowing for partial updates.
// - & { password?: string; }: Adds 'password' back as an optional field specifically for updates,
//   as it was omitted initially but can be provided for a password change.