export interface Product {
  
    prodName: string;
    description?: string; 
    sku: string | null;
    basePrice?: number|null|undefined;
    customAttributes?:string;
   
  
}

export interface CreateProductDto {
  tenantId:string;
    prodName: string;
    description?: string; 
    sku: string | null;
    basePrice?: number|null|undefined;
   [key : string]:any
  
}