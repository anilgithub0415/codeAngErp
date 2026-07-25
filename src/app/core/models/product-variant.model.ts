export interface Product {
  tenantId?: string | number;
  id?: number;
  prodName?: string;
  description?: string;
  sku?: string | null;
  isActive?:boolean;
  isOEMProduct?:boolean;
  isBulkPacking?:boolean;
  [key: string]: any;
}

export interface ProductVariantDto {
  tenantId?: string | number;
  id?: number;
  productTemplateId?: number;
  sku?: string | null;
  size?: string;
  finish?:string;
  basePrice: number;
  isVariablePrice?:boolean;
  customAttributes?: any;
  currentstock?: number;
  reorderLevel?: number; 
  
  [key: string]: any;
}

export interface CreateProductVariantDto {
  tenantId?: string | number;
  
  sku?: string | null;
  size?: string;
  finish?:string;
  //variantName: string;
  
  
  customAttributes?: any;
  //conversionFactor: number;
  initialStockUnits?: number;      // convenience for UI
  currentStockBaseUnits?: number;  // backend field (optional here)
  reorderLevel?:number;
  createdByUserId?: number;
  [key: string]: any;

  variants?:ProductVariantDto[];
}