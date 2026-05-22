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
    tenantId: string;
    tenantName: string;
    roleName: string;
    permissions: string[];
}

// 1. User Interface (for data received from the backend API)
// This should mirror the backend's User entity, but exclude sensitive fields like raw passwords.
export interface User {
    id: number;
   // tenantId: string;
    userName: string; // Changed from userName to userName for Angular/JS convention
    displayName?: string | null; // Changed from displayName to displayName
    profilePictureUrl?:string;
    roleNameInContext?: any; // Changed from Role to role, using enum
    tenantId?: string;
    isActive?: boolean;
    isEmailVerified?: boolean | undefined;
    tenant:any;
    // verificationToken and verificationTokenExpiresAt are typically internal to backend,
    // not sent to frontend for standard user listing/editing.
    googleId?: string | null;
    createdByUserId?:number;
    person?:any
    userTenantContexts?:AvailableContext[]
    // Add any other fields you expect to receive from the backend for a user.
    // Example: createdAt?: Date; updatedAt?: Date; if your API sends them.
}

// 2. CreateUserDto (for data sent to backend when creating a new user)
// This includes fields necessary for creation. Password is required for non-Google users.
export interface CreateUserDto {
  
    userName: string;
    password?: string; // Optional if using googleId for social login, otherwise required
    displayName?: string | null;
    initialRoleName: string|null|undefined;
    initialTenantId: string|null; // Crucial: must provide tenantId for new user
    googleId?: string | null; // Optional, for social logins
    isEmailVerified?:boolean;
     isActive?:boolean;
     createdByUserId?:number;
     personId?:number;
     person?:any;
  
    //, isEmailVerified would typically be set by backend with defaults
}

// 3. UpdateUserDto (for data sent to backend when updating an existing user)
// This uses Partial and Omit utility types for flexibility.
export type UpdateUserDto = Partial<Omit<User, 'id' | 'tenantId' | 'googleId'>> & {
    // Re-add password as optional string for explicit password updates.
    // TenantId and googleId are typically not changed via a standard update DTO.
    googleId?:string;isEmailVerified?:boolean; isActive?:boolean;  activeTenantId?: string;
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