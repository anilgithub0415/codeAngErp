// src/app/core/services/tenant-type.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TenantType {
  typeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantTypeService {
  private http = inject(HttpClient);

  getTenantTypes(): Observable<TenantType[]> {  
    return this.http.get<TenantType[]>('/tenantType');
  }

  createTenantType(payload: TenantType): Observable<TenantType> {  
    return this.http.post<TenantType>('/tenantType', payload);
  }

  deleteTenantType(typeName: string): Observable<any> {  
    return this.http.delete(`/tenantType/${encodeURIComponent(typeName)}`);
  }
}
