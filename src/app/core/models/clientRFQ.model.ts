
export enum RFQStatus {
    DRAFT = "DRAFT",                     // Client is writing the request
    SUBMITTED = "SUBMITTED",             // Client dispatched it to wholesalers (Replaces SENT)
    
    // --- Processing States ---
    PARTIALLY_QUOTED = "PARTIALLY_QUOTED", // Some items linked to a SENT/APPROVED Quote
    QUOTED = "QUOTED",                   // All items linked to a SENT/APPROVED Quote
    IN_NEGOTIATION = "IN_NEGOTIATION",   // Linked Quote is currently COUNTER_OFFERED/REVISED
    
    // --- Terminal States ---
    CLOSED = "CLOSED",                   // Successfully converted to an Order/Contract
    CANCELLED = "CANCELLED"              // Client withdrew the request entirely
}

export interface clientRFQ{
    id?:number;
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

export interface IClientRFQWorkflow {

    clientRFQId: number;

    status: RFQStatus;

    actions: {

        canEdit: boolean;

        canDelete: boolean;

        canSubmit: boolean;

        canConvertToQuotation: boolean;

        canCancel: boolean;

        canClose: boolean;

        canChangeCustomer: boolean;

        nextStates: RFQStatus[];
    };
}