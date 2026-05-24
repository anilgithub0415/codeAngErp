export interface Product {
  
    prod_name: string;
    description?: string; 
    sku: string | null;
    base_price?: number|null|undefined;
   
  
}

export interface CreateProductDto {
  
    prod_name: string;
    description?: string; 
    sku: string | null;
    base_price?: number|null|undefined;
   
  
}