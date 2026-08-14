export enum QuotationStatus {
      DRAFT = "DRAFT",                                     // Wholesaler creating the quote
    SENT = "SENT",                                       // Sent to client, visible in ClientPortal
    COUNTER_OFFERED = "COUNTER_OFFERED",                 // Client changed prices and sent back
    REVISED = "REVISED",                                 // Wholesaler adjusted prices based on counter-offer
    APPROVED = "APPROVED",                               // Client accepted (Ready to convert to Order/PO)
    REJECTED = "REJECTED",                               // Client or Wholesaler cancelled negotiation
    EXPIRED = "EXPIRED"                                  // Validity date passed

}

export interface IQuotationItem {
  id?: number;
  quotationId?: number;
  productId: number | null;
  productVariantId?: number | null;
  appliedLineDiscountId?: number | null; // Tracks calculated coupon link 
  prodName: string;
  sku: string | null;
  description?: string | null;
  unit: string;
  quantity: number;
  gstPercentage: number;
  price: number;
  discount: number;                       // Calculated total currency reduction
  totalItemAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IQuotation {
  id?: number;
  tenantId: number;
  clientId: number;
  clientName: string;
  status:QuotationStatus;version:number;isActive:boolean;
  clientCategory?: string | null;
  contactPerson?: string | null;
  deliveryLocation?: string | null;
  totalAmount: number;                    // Calculated Grand Total
  remarksNotes?: string | null;
  createdByUserId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  items: IQuotationItem[];
}


//Convert to Quotation new approach:tag:convertToQuoteNewIdea
export interface IQuotationWorkflow{

    quotationId:number;

    status:QuotationStatus;

    actions:{

        canEdit:boolean;

        canDelete:boolean;

        canSubmitToApprove:boolean;

        canApprove:boolean;

        canSend:boolean;

        canCounterOffer:boolean;

        canRevise:boolean;

        canChangeCustomer:boolean;

        nextStates:QuotationStatus[];

    };

}
