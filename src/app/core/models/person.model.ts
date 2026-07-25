
export interface Person{    
    id: number;
    firstName?:string;
    lastName?:string;
    contactEmail?:string;
    contactPhone?:string;
    dateOfBirth?:Date;
    gender?:string;
    addressLine1?:string;
    addressLine2?:string;
    city?:string;
    state?:string;
    zipCode?:string;
    country?:string;    
}
export interface CreatePersonDto {
    firstName?:string;
    lastName?:string;
    contactEmail?:string;
    contactPhone?:string;
    dateOfBirth?:Date;
    gender?:string;
    addressLine1?:string;
    addressLine2?:string;
    city?:string;
    state?:string;
    zipCode?:string;
    country?:string; 
    CreatedByUserId?:number;
}
export type UpdatePersonDto = Partial<Omit<Person, 'id' >> & {
    // Re-add password as optional string for explicit password updates.
    // TenantId and googleId are typically not changed via a standard update DTO.
    //googleId?:string;isEmailVerified?:boolean; isActive?:boolean;  tenantId?: number
    //password?: string;
};