export interface Customer{
    tenantId:string;
    customerName:string;
    customerCategory:string;
    
}


export interface createCustomer{
    tenantId:string;
    customerName:string;
    customerCategory:string;
    createdByUserId?:string;
}
