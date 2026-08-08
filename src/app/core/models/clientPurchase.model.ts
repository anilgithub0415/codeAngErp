export interface clientPurchase{
    id?:number;
    clientPoNumber:number;
    tenantId:number;
    clientId:number;
    poDate:Date;
    requestedDeliveryDate:Date;
    deliveryDate:Date;
    status?:string;
    totalAmount:number;
    clientNotes:string;
    internalNotes:string;
    createdAt:Date;
    updatedAt:Date;
    items:clientPurchaseOrderItem[]
    
}
export interface clientPurchaseOrderItem{
    clientPurchaseOrderId:number;
    productId:number;
    quantity:number;
    finalPrice:number;
    createdAt:Date;
    updatedAt:Date;

}

export interface createclientPurchase{
    
    clientPoNumber:number;
    tenantId:number;
    clientId:number;
    poDate:Date;
    deliveryDate:Date;
    status?:string;
    totalAmount:number;
    clientNotes:string;
    internalNotes:string;
    convertedSalesOrderId:number;
    createdAt:Date;
    updatedAt:Date;
    items:clientPurchaseOrderItem[]
}