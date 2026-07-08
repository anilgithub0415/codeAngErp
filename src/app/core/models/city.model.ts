export interface City {
  id?:number;
   
    cityName?: string;
    cityAbbrevation?: string;
  
}



export interface CreateCityDto {
   tenantId:number;
    cityName: string;
     cityAbbrevation?: string;
    [key : string]:any
}
