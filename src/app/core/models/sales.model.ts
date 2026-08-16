export enum SOStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    SENT = "SENT",
    PARTIALLY_DELIVERED = "PARTIALLY_DELIVERED",
    DELIVERED="DELIVERED",
    CLOSED = "CLOSED",
    CANCELLED = "CANCELLED"
}

export interface Sales{
    id?:number;
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

export interface ISalesOrderWorkflow {

    salesOrderId: number;

    status: SOStatus;

    actions: {

            canEdit: boolean;
            canDelete: boolean;

            canSubmitToApprove: boolean;
            canApprove: boolean;
            canSend: boolean;

            canChangeCustomer: boolean;

            nextStates: SOStatus[];

    };

}