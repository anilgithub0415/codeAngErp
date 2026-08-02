
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TenantFormConfig {
  id?: number;
  tenantId: number;
  FormKey: string;
  FormlyConfig: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantFormConfigsService {
  private http = inject(HttpClient);
  private apiUrl = '/tenantform';
  getFormConfigs(tenantId: number): Observable<TenantFormConfig[]> {  
    return this.http.get<any[]>(`${this.apiUrl}/${tenantId}`);
  }

 

  createFormConfig(tenantId: number, payload: TenantFormConfig): Observable<TenantFormConfig> {  
    console.log('paiurl:',this.apiUrl);
    
    console.log('payload:',payload);
    
    return this.http.post<TenantFormConfig>(`${this.apiUrl}/${tenantId}`, payload);
  }

  updateFormConfig(tenantId: number, id: number, payload: Partial<TenantFormConfig>): Observable<TenantFormConfig> {  
    return this.http.put<TenantFormConfig>(`${this.apiUrl}/${tenantId}/${id}`, payload);
  }
}
