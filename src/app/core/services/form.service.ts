// src/app/core/services/product.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap
import { form } from '../models/form.model';

@Injectable({
    providedIn: 'root' // This ensures it's a singleton available throughout your application
})
export class FormService {
    // Base URL for your Product API endpoints on the backend
    // Assuming your backend serves product APIs under /api/products
    private apiUrl = '/form';

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
        // Return an observable with a product-facing error message.
        return throwError(() => new Error(errorMessage));
    }

getForm(ptenantId:string,formKey:string): Observable<form> {
    const url=this.apiUrl+'/'+ptenantId+'/'+formKey;
    console.log('url for for:',url)
    return this.http.get<form>(url)
}


}
