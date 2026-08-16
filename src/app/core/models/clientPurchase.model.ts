export enum Client_POStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    SENT = "SENT",
    PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED",
    FULFILLED ='FULFILLED',
    CLOSED = "CLOSED",
    CANCELLED = "CANCELLED"
}

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


export interface IClientPOWorkflow {

    clientRFQId: number;

    status: Client_POStatus;

    actions: {

        canEdit: boolean;

        canDelete: boolean;

        canSubmit: boolean;

        canConvertToSales: boolean;

        canCancel: boolean;

        canClose: boolean;

        canChangeCustomer: boolean;

        nextStates: Client_POStatus[];
    };
}