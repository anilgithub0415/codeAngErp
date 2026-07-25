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
