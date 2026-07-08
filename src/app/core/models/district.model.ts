export interface District {
  id?: number;
  districtName: string;
  description?: string; 
}

export interface CreateDistrictDto {
   tenantId:number;
    districtName: string;
    [key : string]:any
}
