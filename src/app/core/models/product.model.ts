export interface Product {
  id?:number;
    prodName: string;
    description?: string; 
    sku: string | null;
    basePrice?: number|null|undefined;
    customAttributes?:string;
    defaultPurchaseUom?:string;
    defaultSalesUom?:string;
   
  
}
interface ITierPrices{
    [categoryName:string]:number
}

interface IProductCustomAttributes{
    tier_prices:ITierPrices;
    [key:string]:any
}
export interface CreateProductDto {
  id:number;
  tenantId:number;
  hsnId:number;
    prodName: string;
    description?: string; 
    sku: string | null;
    basePrice?: number|null|undefined;
    isVariablePrice?:boolean;
    isActive?:boolean;
    currentstock?:number;
    isOEMProduct?:boolean;
    isBulkPacking?:boolean;
    reorderLevel?:number;
    defaultPurchaseUom?:string;
    defaultSalesUom?:string;
    baseUom?:string;
customAttributes?:IProductCustomAttributes|null
   [key : string]:any
  
}