import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

import {clientPurchase,createclientPurchase} from '../models/clientPurchase.model'
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

    /**
     * Handles HTTP errors from API calls.
     * @param error The HttpErrorResponse.
     * @returns An Observable that throws an error.
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error occurred.
            console.error('Client-side error:', error.error.message);
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
        }
        // Return an observable with a clientPurchase-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 /**
     * Creates a new clientPurchase order by sending data to the backend API.
     * @param clientPurchaseData The data for the new clientPurchase (CreatePurchase).
     * @returns An Observable of the created Purchase object (including its new ID).
     */
 createclientPurchaseOrder(clientPurchaseData: Partial<createclientPurchase>): Observable<clientPurchase> {
    console.log(`Creating clientPurchase at ${this.apiUrl} with data:`, clientPurchaseData);
    return this.http.post<clientPurchase>(this.apiUrl, clientPurchaseData).pipe(
        tap(newclientPurchaseOrder => console.log('Created clientPurchase order:', newclientPurchaseOrder)),
        catchError(this.handleError)
    );
}
getClientPOs(ptenantId:number): Observable<clientPurchase[]> {
    return this.http.get<clientPurchase[]>(this.apiUrl+'/?activeTenantId='+ptenantId)
}


fetchTenantRulesMatrix(tenantId:number, pProductId:number, pProductVariantId:number):Observable<TenantRulesMatrixResponse>{
    const url=this.apiUrl+'/fetchTenantRulesMatrix'+'/'+tenantId+'/'+pProductId+'/'+pProductVariantId;
    console.log('url:',url);
    
 return this.http.get<TenantRulesMatrixResponse>(url);
}
}

