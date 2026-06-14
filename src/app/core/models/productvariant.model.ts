export interface Product {
  id?: number;
  prodName?: string;
  description?: string;
  sku?: string | null;
  basePrice?: number | null;
  customAttributes?: any;
  [key: string]: any;
}

export interface ProductVariantDto {
  id?: number;
  sku?: string | null;
  productId: number;
  variantName: string;
  basePrice: number;
  customAttributes?: any;
  conversionFactor: number;       // grams per variant unit
  currentStockBaseUnits?: number; // stored in grams
  createdByUserId?: number;
  [key: string]: any;
}

export interface CreateProductVariantDto {
  productId: number;
  sku?: string | null;
  variantName: string;
  basePrice: number;
  customAttributes?: any;
  conversionFactor: number;
  initialStockUnits?: number;      // convenience for UI
  currentStockBaseUnits?: number;  // backend field (optional here)
  createdByUserId?: number;
  tenantId?: string | number;
  [key: string]: any;
}