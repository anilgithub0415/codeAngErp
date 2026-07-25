import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IClientRequirement } from '../models/client-requirement.model';

  import { HttpParams } from '@angular/common/http'; // 💡 Make sure HttpParams is imported
@Injectable({
  providedIn: 'root'
})
export class ClientRequirementService {
 private apiUrl = '/clientRequirement';

  private http = inject(HttpClient);
  private resourceUrl = `${this.apiUrl}`; // Configured API route matching Node controller context

  /**
   * List all requirement configurations stored inside a clean multi-tenant perimeter
   */

getClientRequirements(tenantId: number, clientId?: number): Observable<IClientRequirement[]> {
  // 1. Initialize empty HttpParams token tracking records
  let params = new HttpParams();

  // 2. 💡 CONDITIONAL APPEND: Inject query string parameter safely if provided
  if (clientId !== undefined && clientId !== null) {
    params = params.set('clientId', clientId.toString());
  }

  // 3. Dispatch data stream query (Also fixed a trailing curly bracket typo from the string template)
  return this.http.get<IClientRequirement[]>(`${this.resourceUrl}/${tenantId}`, { params });
}

  /**
   * Fetch a single customer requirements block by tracking ID and tenant boundaries
   */
  getClientRequirement(tenantId: number, id: number): Observable<IClientRequirement> {
    return this.http.get<IClientRequirement>(`${this.resourceUrl}/${tenantId}/${id}`);
  }

  /**
   * Save a completely fresh multi-row client requirement layout matrix
   */
  createClientRequirementClean(payload: Partial<IClientRequirement>): Observable<{ clientRequirement: IClientRequirement }> {
    return this.http.post<{ clientRequirement: IClientRequirement }>(this.resourceUrl, payload);
  }

  /**
   * Modify an existing master layout configuration matching the targeted update parameters
   */
  updateClientRequirement(id: number, payload: Partial<IClientRequirement>): Observable<IClientRequirement> {
    return this.http.put<IClientRequirement>(`${this.resourceUrl}/${id}`, payload);
  }
}