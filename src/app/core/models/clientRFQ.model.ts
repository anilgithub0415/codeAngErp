export interface clientRFQ{
    clientRFQNumber:number;
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
    items:clientRFQOrderItem[]
    
}
export interface clientRFQOrderItem{
    clientRFQOrderId:number;
    productId:number;
    quantity:number;
    finalPrice:number;
    createdAt:Date;
    updatedAt:Date;

}

export interface createclientRFQ{
    
    clientRFQNumber:number;
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
    items:clientRFQOrderItem[]
}