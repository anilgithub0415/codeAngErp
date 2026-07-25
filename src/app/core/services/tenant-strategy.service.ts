
// src/app/core/services/tenant-strategy.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TenantStrategy {
  id?: number;
  tenantId: number;
  tenantStrategyName: string;
  tenantStrategy: string;
  createdByUserId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TenantStrategyService {
  private http = inject(HttpClient);

  getStrategies(tenantId: number): Observable<TenantStrategy[]> {  
    return this.http.get<TenantStrategy[]>(`/tenantStartegies/${tenantId}`);
  }

  getStrategy(tenantId: number, id: number): Observable<TenantStrategy> {  
    return this.http.get<TenantStrategy>(`/tenantStartegies/${tenantId}/${id}`);
  }

  createStrategy(payload: TenantStrategy): Observable<TenantStrategy> {  
    return this.http.post<TenantStrategy>('/tenantStartegies', payload);
  }

  updateStrategy(id: number, payload: Partial<TenantStrategy>): Observable<TenantStrategy> {  
    return this.http.put<TenantStrategy>(`/tenantStartegies/${id}`, payload);
  }
}
