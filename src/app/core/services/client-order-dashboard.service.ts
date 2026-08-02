import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientOrderDashboardService {
  // 1. Ensure this base URL matches your server entry point (e.g., '/api/orders' or just '/')
  private apiUrl = '/ClientSummaryCountOfOrders'; 

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // 2. Dynamic query param construction using HttpParams
  getClientSummaryCountOfOrders(ptenantId: number, siteId?: number, clientId?: number): Observable<any> {
    let params = new HttpParams().set('activeTenantId', ptenantId.toString());
    
    if (siteId) params = params.set('siteId', siteId.toString());
    if (clientId) params = params.set('clientId', clientId.toString());

    // Fixes the 'sammary' typo -> changes to '/summary'
    return this.http.get<any>(`${this.apiUrl}/summary`, { params }).pipe(
      catchError(this.handleError)
    );
  }
}
