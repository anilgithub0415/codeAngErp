// src/app/core/services/customer.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the Customer interfaces/DTOs you just defined
import { Customer, createCustomer } from '../models/customer.model';
// No need for InventoryStatus here, that was from the customer example

@Injectable({
    providedIn: 'root' // This ensures it's a singleton available throughout your application
})
export class CustomerService {
    // Base URL for your Customer API endpoints on the backend
    // Assuming your backend serves customer APIs under /api/customers
    private apiUrl = '/customer';

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
        // Return an observable with a customer-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 /**
     * Creates a new customer by sending data to the backend API.
     * @param customerData The data for the new customer (CreateCustomer).
     * @returns An Observable of the created Customer object (including its new ID).
     */
 createCustomer(customerData: Partial<createCustomer>): Observable<Customer> {
    console.log(`Creating customer at ${this.apiUrl} with data:`, customerData);
    return this.http.post<Customer>(this.apiUrl, customerData).pipe(
        tap(newCustomer => console.log('Created customer:', newCustomer)),
        catchError(this.handleError)
    );
}
getCustomer(ptenantId:string,prodId:number): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl+'/'+ptenantId+'/'+prodId)
}

getCustomers(ptenantId:string): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl+'/?activeTenantId='+ptenantId)
}


}
