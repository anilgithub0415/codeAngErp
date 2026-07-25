

export interface CustomerCategory {
  tenantId: number;
  customerCategory: string;
  createdByUserId: any;
}

export interface Customer {
  id: number;
  tenantId: number;
  customerName: string;customer_autocode:string;
  customerCategoryId:any;
  commercialContactPhone:string;commercialContactPerson:string;
  clientStatus:string; city:string;cityName:string;
  organisations: Organisation[];
  creditLimit:number;
  createdByUserId: any;

}
/** One organisation entry inside the repeat‑section */
export interface Organisation {
  
  /** Name of the organisation – required */
  organisationName: string;

  /** Customer category selected from the lookup “customerCategoryTypes” */
  customerCategory: string | number;   // adjust the type to match the lookup values

  /** Optional contact‑person name */
  siteContactPerson?: string;

  customerDetailsRequired?:boolean;

  /** Optional mobile number */
  commercialContactPhone?: string;

  /** Optional e‑mail address */
  EmailId?: string;

  /** Optional city */
  city?: string;

  /** Optional free‑form remarks */
  Remarks?: string;
  creditDays?: number;
  creditLimit?: number;
}