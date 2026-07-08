export interface Sales{
    soNumber:number;
    tenantId:number;
    customerId:number;
    status?:string;
    subTotal?:number;
    taxAmount?:number;
    shippingAmount?:number;
    totalAmount:number;
    items:SalesOrderItem[]
    customAttributes?:any;
    createdAt:Date;
    updatedAt:Date;
    
}
export interface SalesOrderItem{
    salesOrderId:number;
    productId:number;
    quantity:number;
    unitPrice:number;
    description?:string;
    sku?:string;
    customAttributes?:any;
    createdAt:Date;
    updatedAt:Date;

}

export interface createSales{
    soNumber:number;
    tenantId:number;
    customerId:number;
  
    status?:string;
    subTotal?:number;
    taxAmount?:number;
    shippingAmount?:number;
    totalAmount:number;
    
    createdAt:Date;
    updatedAt:Date;
    items:SalesOrderItem[]
}