
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { clientPurchase, createclientPurchase } from '../models/clientPurchase.model';
import { clientRFQ, createclientRFQ } from '../models/clientRFQ.model';

@Injectable({
  providedIn: 'root'
})
export class ClientRFQService {

  private apiUrl = '/clientRFQ';
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

  createclientRFQOrder(clientRFQData: Partial<createclientRFQ>): Observable<clientRFQ> {
    console.log(`Creating clientRFQ at ${this.apiUrl} with data:`, clientRFQData);
    return this.http.post<clientRFQ>(this.apiUrl, clientRFQData).pipe(
      tap(newclientRFQOrder => console.log('Created clientRFQ order:', newclientRFQOrder)),
      catchError(this.handleError)
    );
  }

  // 🔄 New Method: Handles partial updates and state machine submits/locks
  updateClientRFQOrder(id: number, clientPurchaseData: Partial<createclientPurchase> & { action?: string; status?: string }): Observable<clientPurchase> {
    console.log(`Updating clientPurchase order ID ${id} at ${this.apiUrl}/${id} with data:`, clientPurchaseData);
    return this.http.put<clientPurchase>(`${this.apiUrl}/${id}`, clientPurchaseData).pipe(
      tap(updatedOrder => console.log('Updated clientPurchase order:', updatedOrder)),
      catchError(this.handleError)
    );
  }
    /**
   * Deletes a draft or cancels an active purchase order via DELETE resource id path binding.
   */
  deleteRFQOrder(id: number): Observable<{ success: boolean; action: 'DELETED' | 'CANCELLED'; message: string }> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`Sending delete/cancel request for purchase order at ${url}`);
    
    return this.http.delete<{ success: boolean; action: 'DELETED' | 'CANCELLED'; message: string }>(url).pipe(
      tap(response => console.log('Delete/Cancel purchase order response:', response)),
      catchError(this.handleError)
    );
  }


/**
 * Executes the formal approval workflow for a Client RFQ, tracking item variations
 * @param id The primary database identifier sequence of the target RFQ
 * @param approvalData Contains the explicit action string and the updated array items
 */
approveClientRFQOrder(
  id: number, 
  approvalData: { action: 'APPROVE' | 'REJECT'; items?: any[] }
): Observable<clientPurchase> {
  console.log(`Executing dedicated RFQ approval for ID ${id} at ${this.apiUrl}/${id}/approve`, approvalData);
  
  return this.http.post<clientPurchase>(`${this.apiUrl}/${id}/approve`, approvalData).pipe(
    tap(updatedOrder => console.log('Successfully completed workflow execution:', updatedOrder)),
    catchError(this.handleError)
  );
}

/** 

* Executes the formal dispatch workflow for a Client RFQ, advancing state from APPROVED to SENT
* @param id The primary database identifier sequence of the target RFQ
* @param sendData Contains the explicit action string and optional final item tracking payload
*/
sendClientRFQOrder(
id: number,
sendData: { action: 'SENT'; items?: any[] }
): Observable<clientRFQ> {
console.log('Executing dedicated RFQ dispatch for ID ${id} at ${this.apiUrl}/${id}/send, sendData');

return this.http.post<clientRFQ>(`${this.apiUrl}/${id}/send`, sendData).pipe(
tap(updatedOrder => console.log('Successfully completed dispatch workflow execution:', updatedOrder)),
catchError(this.handleError)
);
}


getClientRFQs(
  ptenantId: number, 
  psiteId: number, 
  pclientId?: number, 
  pStatuses?: string[] // 🚀 NEW: Optional statuses parameter
): Observable<clientRFQ[]> {
  let url = `${this.apiUrl}/?activeTenantId=${ptenantId}&siteId=${psiteId}`;
  
  if (pclientId) {
    url += `&clientId=${pclientId}`;
  }

  // 🚀 NEW: Append statuses as a comma-separated string if provided
  if (pStatuses && pStatuses.length > 0) {
    url += `&status=${pStatuses.join(',')}`;
  }
  
  console.log('Final URL Request:', url);
  
  return this.http.get<clientRFQ[]>(url);
}


 
}
