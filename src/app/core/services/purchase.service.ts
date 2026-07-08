import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; 

import { Purchase, createPurchase } from '../models/purchase.model';

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
export class PurchaseService {
    // Base URL matching your project's express API prefix routes gateway
    private apiUrl = '/purchase';

    constructor(private http: HttpClient) { }

    /**
     * Handles HTTP errors from API calls.
     * @param error The HttpErrorResponse.
     * @returns An Observable that throws an error.
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            console.error('Client-side error:', error.error.message);
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
        }
        return throwError(() => new Error(errorMessage));
    }

    /**
     * POST: Creates a brand new purchase order transaction record in the DB.
     * @param purchaseData The data for the new purchase (createPurchase).
     * @returns An Observable of the created Purchase object.
     */
    createPurchaseOrder(purchaseData: Partial<createPurchase>): Observable<Purchase> {
        console.log(`Creating purchase at ${this.apiUrl} with data:`, purchaseData);
        return this.http.post<Purchase>(this.apiUrl, purchaseData).pipe(
            tap(newPurchaseOrder => console.log('Created purchase order:', newPurchaseOrder)),
            catchError(this.handleError)
        );
    }

    /**
     * 🔒 PUT: Updates an un-approved purchase order record, triggering inventory delta calculations.
     * @param id The auto-increment primary key database row ID of the target purchase order.
     * @param purchaseData The updated transaction variables and line arrays payload.
     * @returns An Observable of the updated Purchase object layout state.
     */
    updatePurchaseOrder(id: number, purchaseData: Partial<createPurchase>): Observable<Purchase> {
        const url = `${this.apiUrl}/${id}`;
        console.log(`Updating purchase order at ${url} with data:`, purchaseData);
        return this.http.put<Purchase>(url, purchaseData).pipe(
            tap(updatedPurchaseOrder => console.log('Successfully updated purchase order logs:', updatedPurchaseOrder)),
            catchError(this.handleError)
        );
    }

    /**
     * GET: Retrieves all purchase orders assigned to a specific tenant ID.
     */
    getPOs(ptenantId: number): Observable<Purchase[]> {
        return this.http.get<Purchase[]>(`${this.apiUrl}/${ptenantId}`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * GET: Fetches the multi-tier unit conversion matrix context for a given product or variant.
     */
    fetchTenantRulesMatrix(tenantId: number, pProductId: number, pProductVariantId: number): Observable<TenantRulesMatrixResponse> {
        const url = `${this.apiUrl}/fetchTenantRulesMatrix/${tenantId}/${pProductId}/${pProductVariantId}`;
        console.log('Fetching unit selection matrix rules at URL:', url);
        return this.http.get<TenantRulesMatrixResponse>(url).pipe(
            catchError(this.handleError)
        );
    }
}
