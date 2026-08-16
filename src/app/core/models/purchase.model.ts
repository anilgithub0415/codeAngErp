import { POStatus } from "../../feature/purchase-mgt/kanban/purchase-kanban-card/purchase-kanban-card.component";

export interface Purchase{
    id?:number;
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



export interface IPurchaseOrderWorkflow {

    purchaseOrderId: number;

    status: POStatus;

    actions: {

            canEdit: boolean;
            canDelete: boolean;

            canSubmitToApprove: boolean;
            canApprove: boolean;
            canSend: boolean;

            canChangeCustomer: boolean;

            nextStates: POStatus[];

    };

}