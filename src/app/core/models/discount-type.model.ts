export interface DiscountType {
    id: number;
    tenantId: number;
    typeName: string; // 'PERCENTAGE' or 'FIXED_AMOUNT'
    description?: string | null;
    isActive: boolean;
    createdByUserId?: number;
}

export interface CreateDiscountTypeDto {
    id?: number;
    tenantId: number;
    typeName: string;
    description?: string | null;
    isActive?: boolean;
}
