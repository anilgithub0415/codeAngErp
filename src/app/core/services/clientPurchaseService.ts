import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { clientPurchase, createclientPurchase } from '../models/clientPurchase.model';

export interface PurchaseUnit {
  label: string;
  value: string;
  factor: number;
  targetSaleUom: string;
}

export interface TenantRulesMatrixResponse {
  baseInventoryUom: string;
  availablePurchaseUnits: PurchaseUnit[];
}

@Injectable({
  providedIn: 'root'
})
export class clientPurchaseService {
  private apiUrl = '/clientPurchase';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  createclientPurchaseOrder(clientPurchaseData: Partial<createclientPurchase>): Observable<clientPurchase> {
    console.log(`Creating clientPurchase at ${this.apiUrl} with data:`, clientPurchaseData);
    return this.http.post<clientPurchase>(this.apiUrl, clientPurchaseData).pipe(
      tap(newclientPurchaseOrder => console.log('Created clientPurchase order:', newclientPurchaseOrder)),
      catchError(this.handleError)
    );
  }

  // 🔄 New Method: Handles partial updates and state machine submits/locks
  updateClientPurchaseOrder(id: number, clientPurchaseData: Partial<createclientPurchase> & { action?: string; status?: string }): Observable<clientPurchase> {
    console.log(`Updating clientPurchase order ID ${id} at ${this.apiUrl}/${id} with data:`, clientPurchaseData);
    return this.http.put<clientPurchase>(`${this.apiUrl}/${id}`, clientPurchaseData).pipe(
      tap(updatedOrder => console.log('Updated clientPurchase order:', updatedOrder)),
      catchError(this.handleError)
    );
  }
getClientPOs(ptenantId: number, psiteId: number, pclientId?: number): Observable<clientPurchase[]> {
  let url = `${this.apiUrl}/?activeTenantId=${ptenantId}&siteId=${psiteId}`;
  
  // Append clientId parameter to the stream request if present
  if (pclientId) {
    url += `&clientId=${pclientId}`;
  }
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa url:',url);
  
  return this.http.get<clientPurchase[]>(url);
}


  fetchTenantRulesMatrix(tenantId: number, pProductId: number, pProductVariantId: number): Observable<TenantRulesMatrixResponse> {
    const url = `${this.apiUrl}/fetchTenantRulesMatrix/${tenantId}/${pProductId}/${pProductVariantId}`;
    console.log('url:', url);
    return this.http.get<TenantRulesMatrixResponse>(url);
  }
}
