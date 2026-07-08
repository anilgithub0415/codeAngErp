import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

import {DeliveryChallan,createDeliveryChallan} from '../models/deliverychallan.model'

@Injectable({
  providedIn: 'root'
})
export class DelieveryChallanService{
 private apiUrl = '/delichall';

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
        // Return an observable with a sales-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 /**
     * Creates a new deliverychallan order by sending data to the backend API.
     * @param deliverychallanData The data for the new deliverychallan (Createdeliverychallan).
     * @returns An Observable of the created deliverychallan object (including its new ID).
     */
 createDeliveryChallan(deliverychallanData: Partial<createDeliveryChallan>): Observable<DeliveryChallan> {
    console.log(`Creating deliverychallan at ${this.apiUrl} with data:`, deliverychallanData);
    return this.http.post<DeliveryChallan>(this.apiUrl, deliverychallanData).pipe(
        tap(newDeliveryChallan => console.log('Created deliverychallan order:', newDeliveryChallan)),
        catchError(this.handleError)
    );
}
getDCs(ptenantId:number): Observable<DeliveryChallan[]> {
    return this.http.get<DeliveryChallan[]>(this.apiUrl+'/'+ptenantId)
}

}

