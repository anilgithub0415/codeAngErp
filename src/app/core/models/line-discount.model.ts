export interface LineDiscount {
    id: number;
    tenantId: number;
    discountCode: string;
    description?: string | null;
    discountType: string;
    discountValue: number;
    productId: number; // Tied directly to item validation
    product?: { prodName: string; sku: string } | null;
    categoryId?: number | null;
    validFrom?: string | Date | null;
    validTo?: string | Date | null;
    isActive: boolean;
    createdByUserId?: number;
}

export interface CreateLineDiscountDto {
    id?: number;
    tenantId: number;
    discountCode: string;
    description?: string;
    discountType: string;
    discountValue: number;
    productId: number;
    categoryId?: number | null;
    [key: string]: any;
}
