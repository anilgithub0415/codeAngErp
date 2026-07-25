export interface DeliveryChallan{
    dcNumber:number;
    tenantId:number;
    salesOrderId:number;
    customerId:number;
    status?:string;
    vehicleNumber?:string;
    transporterName?:string;
    dispatchDate?:Date;
    items:DeliveryChallanItem[]
    createdAt:Date;
    updatedAt:Date;
    
}
export interface DeliveryChallanItem{
    deliveryChallanId:number;
    salesOrderItemId:number;
    productId:number;
    quantityShipped:number;
    createdAt:Date;
    updatedAt:Date;

}

export interface createDeliveryChallan{
    dcNumber:number;
    tenantId:number;
    salesOrderId:number;
    customerId:number;
    status?:string;
    vehicleNumber?:string;
    transporterName?:string;
    dispatchDate?:Date;
    createdAt:Date;
    updatedAt:Date;
    items:DeliveryChallanItem[]
}