// src/app/core/services/hsnTaxRule.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the HSNTaxRule interfaces/DTOs you just defined
import { HSNTaxRule  } from '../models/hsntaxrule.model';
// No need for InventoryStatus here, that was from the hsnTaxRule example

@Injectable({
    providedIn: 'root' // This ensures it's a singleton available throughout your application
})
export class HSNTaxRuleService {
    // Base URL for your HSNTaxRule API endpoints on the backend
    // Assuming your backend serves hsnTaxRule APIs under /api/hsnTaxRules
    private apiUrl = '/hsnTaxRule';

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
        // Return an observable with a hsnTaxRule-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 /**
     * Creates a new hsnTaxRule by sending data to the backend API.
     * @param hsnTaxRuleData The data for the new hsnTaxRule (CreateHSNTaxRule).
     * @returns An Observable of the created HSNTaxRule object (including its new ID).
     */
 createHSNTaxRule(hsnTaxRuleData: Partial<HSNTaxRule>): Observable<HSNTaxRule> {
    console.log(`Creating hsnTaxRule at ${this.apiUrl} with data:`, hsnTaxRuleData);
    return this.http.post<HSNTaxRule>(this.apiUrl, hsnTaxRuleData).pipe(
        tap(newHSNTaxRule => console.log('Created hsnTaxRule:', newHSNTaxRule)),
        catchError(this.handleError)
    );
}
getHSNTaxRule(hsnCode:string): Observable<HSNTaxRule[]> {
    return this.http.get<HSNTaxRule[]>(this.apiUrl+'/'+'/'+hsnCode)
}

getHSNTaxRules(): Observable<HSNTaxRule[]> {
    return this.http.get<HSNTaxRule[]>(this.apiUrl+'/')
}



}
