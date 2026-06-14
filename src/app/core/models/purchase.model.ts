export interface Purchase{
    poNumber:number;
    tenantId:number;
    vendorId:number;
    orderDate:Date;
    deliveryDate:Date;
    status?:string;
    totalAmount:number;
    notes:string;
    createdAt:Date;
    updatedAt:Date;
    items:PurchaseOrderItem[]
    
}
export interface PurchaseOrderItem{
    purchaseOrderId:number;
    productId:number;
    quantity:number;
    finalPrice:number;
    createdAt:Date;
    updatedAt:Date;

}

export interface createPurchase{
    poNumber:number;
    tenantId:number;
    vendorId:number;
    orderDate:Date;
    deliveryDate:Date;
    status?:string;
    totalAmount:number;
    notes:string;
    createdAt:Date;
    updatedAt:Date;
    items:PurchaseOrderItem[]
}