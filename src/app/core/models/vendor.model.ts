export interface Vendor {
  id?: number;
  vendorName: string;
  description?: string; 
}

export interface CreateVendorDto {
   tenantId:number;
    vendorName: string;
    [key : string]:any
}
