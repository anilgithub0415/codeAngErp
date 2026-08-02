// src/app/core/services/customer.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the Customer interfaces/DTOs you just defined
import { Customer  } from '../models/customer.model';
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
 createCustomer(customerData: Partial<Customer>): Observable<Customer> {
    console.log(`Creating customer at ${this.apiUrl} with data:`, customerData);
    return this.http.post<Customer>(this.apiUrl, customerData).pipe(
        tap(newCustomer => console.log('Created customer:', newCustomer)),
        catchError(this.handleError)
    );
}
/**
 * Triggers a PUT mutation request mapping directly onto path parameters logic interfaces.
 */
updateCustomer(id: number, customerData: any): Observable<Customer> {
  return this.http.put<Customer>(`/customer/${id}`, customerData).pipe(
    tap(updatedCustomer => console.log('Successfully updated customer tracking record graphs:', updatedCustomer)),
    catchError(this.handleError)
  );
}

// 💡 FIX: Changed Observable data shape from array to singular item metadata
getCustomer(ptenantId: number, clientId: number): Observable<Customer> {
  return this.http.get<Customer>(this.apiUrl + '/' + ptenantId + '/' + clientId);
}


getCustomers(ptenantId:number): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl+'/'+ptenantId)
}

// Add this method inside your CustomerService class in customer.service.ts

/**
 * Fetches all customer mobile numbers and names for local lookups.
 */
getMobileNumbersLookup(ptenantId: number): Observable<Array<{ id: number; commercialContactPhone: string; name: string }>> {
    return this.http.get<Array<{ id: number; commercialContactPhone: string; name: string }>>(`/lookups/customerMobileTypes/ptenantId/${ptenantId}`).pipe(
        catchError(this.handleError)
    );
}
getEmailIDLookup(ptenantId: number): Observable<Array<{ id: number; EmailId: string; name: string }>> {
    return this.http.get<Array<{ id: number; EmailId: string; name: string }>>(`/lookups/customerEmailIdTypes/ptenantId/${ptenantId}`).pipe(
        catchError(this.handleError)
    );
}

/**
 * Fetches all city values and display labels for drop-down parsing.
 * Targets endpoint pattern: /lookups/cityTypes/ptenantId/:tenantId
 */
getCityLookup(ptenantId: number): Observable<Array<{ value: string | number; label: string }>> {
    return this.http.get<Array<{ value: string | number; label: string }>>(`/lookups/cityTypes/ptenantId/${ptenantId}`).pipe(
        catchError(this.handleError)
    );
}


//this is notinuse as there are 3 ways to find mobilenumber is already exists
//one way is use in json field after props that is:
//"asyncValidators": {  "validation": ["mobileExistsCheck"]   }, and
   /*    
                                  this.formlyConfig.validators['mobileExistsCheck'] = {
                                  name: 'mobileExistsCheck',
                                  validation: (control: any) => {
                                    return checkMobileExists(this.tenantId, this.customerService)(control);
                                  },
                                  options: { async: true },
                                  
                                };

                                this.formlyConfig.addValidatorMessage(
                                'mobileExistsCheck',
                                'This mobile number is already registered.'
                                );
                            */
 //second way is use searchable:true where searchable is userdefined term which is used in  utils funcion : applyLocalSearchExtension     
//third way use hooks, as we dont want to create a situation of declaring field is invalid data consequently form invalid
//so this is not used currently, currently utils.applyLocalSearchExtension is used for finding already existing mobile#
checkMobileNumberExists(ptenantId:number,mobileNo:string): Observable<boolean|null> {
    // this.http.get<Customer[]>(this.apiUrl+'/?activeTenantId='+ptenantId)
    return of(true);

}

}
