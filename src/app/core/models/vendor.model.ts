export interface Vendor {
  
    vendorName: string;
    description?: string; 
      
  
}

export interface CreateVendorDto {
   tenantId:string;
    vendorName: string;
    [key : string]:any
  
}