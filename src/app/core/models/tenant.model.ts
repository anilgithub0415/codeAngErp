
export enum TenantType{
    INSTITUTE = 'INSTITUTE',
    INDIVIDUAL_STUDENT = 'INDIVIDUAL_STUDENT',
    INDIVIDUAL_TEACHER = 'INDIVIDUAL_TEACHER'
    
}
export enum SubscriptionPlan{
    Free='Free'
}

export interface TType {
    TenatType:string;
}

export interface Tenant {
    tenantId: string;
    tenantName: string;
    tenantType?: string;
    subscriptionPlan: string;
    subscriptionEndDate?: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTenantDto {
    tenantName: string;
    tenantType?: string;
    subscriptionPlan?: string; // Optional, assumed backend defaults to FREE, but if its not defaults to FREE then it must be mandatory
}

export type UpdateTenantDto = Partial<Omit<Tenant,
    'tenantId' |
    'createdAt' |
    'updatedAt'
>>;