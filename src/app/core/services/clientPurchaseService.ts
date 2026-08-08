import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { clientPurchase, createclientPurchase } from '../models/clientPurchase.model';
import { clientRFQ } from '../models/clientRFQ.model';

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

  
    /**
   * Deletes a draft or cancels an active purchase order via DELETE resource id path binding.
   */
  deletePurchaseOrder(id: number): Observable<{ success: boolean; action: 'DELETED' | 'CANCELLED'; message: string }> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`Sending delete/cancel request for purchase order at ${url}`);
    
    return this.http.delete<{ success: boolean; action: 'DELETED' | 'CANCELLED'; message: string }>(url).pipe(
      tap(response => console.log('Delete/Cancel purchase order response:', response)),
      catchError(this.handleError)
    );
  }

/**
 * Executes the formal approval workflow for a Client PO, tracking item variations
 * @param id The primary database identifier sequence of the target PO
 * @param approvalData Contains the explicit action string and the updated array items
 */
approveClientPurchaseOrder(
  id: number, 
  approvalData: { action: 'APPROVE' | 'REJECT'; items?: any[] }
): Observable<clientPurchase> {
  console.log(`Executing dedicated PO approval for ID ${id} at ${this.apiUrl}/${id}/approve`, approvalData);
  
  return this.http.post<clientPurchase>(`${this.apiUrl}/${id}/approve`, approvalData).pipe(
    tap(updatedOrder => console.log('Successfully completed workflow execution:', updatedOrder)),
    catchError(this.handleError)
  );
}

/** 

* Executes the formal dispatch workflow for a Client PO, advancing state from APPROVED to SENT
* @param id The primary database identifier sequence of the target PO
* @param sendData Contains the explicit action string and the updated array items
*/
sendClientPurchaseOrder(
id: number,
sendData: { action: 'SENT'; items?: any[] }
): Observable<clientPurchase> {
console.log('Executing dedicated PO dispatch for ID ${id} at ${this.apiUrl}/${id}/send, sendData');

return this.http.post<clientPurchase> (`${this.apiUrl}/${id}/send`, sendData).pipe(
tap(updatedOrder => console.log('Successfully completed dispatch workflow execution:', updatedOrder)),
catchError(this.handleError)
);
}

convertClientPOToSalesOrder(poId: number) {
  return this.http.post(
    `${this.apiUrl}/${poId}/convert-to-sales`,
    {}
  );
}

getClientPOs(
  ptenantId: number, 
  psiteId: number, 
  pclientId?: number,
  pStatuses?: string[],includeConverted?:boolean,
): Observable<clientPurchase[]> {
  // 1. Build base path first before query parameters
  let url = `${this.apiUrl}?activeTenantId=${ptenantId}&siteId=${psiteId}`;
  
  // 2. Safely append clientId parameter if it's truthy and greater than zero
  if (pclientId && pclientId > 0) {
    url += `&clientId=${pclientId}`;
  }

  // 3. Append array of statuses as a comma-separated query string
  if (pStatuses && pStatuses.length > 0) {
    url += `&status=${pStatuses.join(',')}`;
  }
  url += `&includeConverted=${includeConverted}`;
  console.log('Generated Client PO Request URL:', url);
  
  console.log('url at front......',url);
  
  return this.http.get<clientPurchase[]>(url);
}



getClientRFQs_notinuse(ptenantId: number, psiteId: number, pclientId?: number): Observable<clientRFQ[]> {
  let url = `${this.apiUrl}/?activeTenantId=${ptenantId}&siteId=${psiteId}`;
  
  // Append clientId parameter to the stream request if present
  if (pclientId) {
    url += `&clientId=${pclientId}`;
  }
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa url:',url);
  
  return this.http.get<clientRFQ[]>(url+'/clientRFQs');
}

  fetchTenantRulesMatrix(tenantId: number, pProductId: number, pProductVariantId: number): Observable<TenantRulesMatrixResponse> {
    const url = `${this.apiUrl}/fetchTenantRulesMatrix/${tenantId}/${pProductId}/${pProductVariantId}`;
    console.log('url:', url);
    return this.http.get<TenantRulesMatrixResponse>(url);
  }
}
