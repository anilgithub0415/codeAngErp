import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

import {Purchase,createPurchase} from '../models/purchase.model'

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
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
        // Return an observable with a purchase-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 /**
     * Creates a new purchase order by sending data to the backend API.
     * @param purchaseData The data for the new purchase (CreatePurchase).
     * @returns An Observable of the created Purchase object (including its new ID).
     */
 createPurchaseOrder(purchaseData: Partial<createPurchase>): Observable<Purchase> {
    console.log(`Creating purchase at ${this.apiUrl} with data:`, purchaseData);
    return this.http.post<Purchase>(this.apiUrl, purchaseData).pipe(
        tap(newPurchaseOrder => console.log('Created purchase order:', newPurchaseOrder)),
        catchError(this.handleError)
    );
}


}

