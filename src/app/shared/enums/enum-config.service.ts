import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LookupService } from '../../core/services/lookup.service';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EnumConfigService {
private lookupService=inject(LookupService);
private authServ=inject(AuthService);

  public LeadStatuses = signal<Record<string, string>>({});
  tenantId!:number;

  constructor() { 
     this.tenantId=this.authServ.getTenantId()!;

     this.LoadEnums();
  }
 
  LoadEnums():void{ 
  
                this.lookupService.searchLookup('leadSourceTypes', this.tenantId, '')
                .subscribe(data=>{ 
                 
                  
                  const mapped = data.reduce((acc,item)=>{
                    acc[item.key]=item.value;
                    return acc;

                  },{} as Record<string, string>);

                  
                  
                          this.LeadStatuses.set(mapped);
                })
              }
            }
              
  

