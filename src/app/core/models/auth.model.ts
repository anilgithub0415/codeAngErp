// src/app/core/models/auth.model.ts (or add to an existing auth models file)

// Assuming TenantType and SubscriptionPlan are strings in frontend models now
// from src/app/core/models/tenant.model.ts
import { TenantType,SubscriptionPlan } from './tenant.model';


// This DTO combines user registration and initial tenant creation data
export interface RegisterAndSubscribeDto {
    // User registration fields
    userName: string; // Email
    password: string;
    displayName: string;

    // Tenant creation fields
    tenantName: string; // Name of the institute/classroom/solo space
    tenantType: TenantType; // Selected by user (e.g., 'Institute', 'IndividualTeacher')
    subscriptionPlan: SubscriptionPlan; // Initial plan (e.g., 'Free', 'Basic')

    // Dynamic fields from the form (these will be stored on the User or Tenant entity,
    // depending on your backend's design. For simplicity, we'll assume they map to User properties
    // or are handled by the backend based on tenantType.)
    [key: string]: any; // Allows for arbitrary additional properties
}