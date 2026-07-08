import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; // Import catchError, tap and map
import { CreateVendorDto, Vendor } from '../models/vendor.model';


@Injectable({
  providedIn: 'root'
})
export class VendorService {

    // Base URL for your Vendor API endpoints on the backend
    // Assuming your backend serves vendor APIs under /api/vendors
    private apiUrl = '/vendor';

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
        // Return an observable with a vendor-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 /**
     * Creates a new vendor by sending data to the backend API.
     * @param vendorData The data for the new vendor (CreateVendorDto).
     * @returns An Observable of the created Vendor object (including its new ID).
     */
 createVendor(vendorData: Partial<CreateVendorDto>): Observable<Vendor> {
    console.log(`Creating vendor at ${this.apiUrl} with data:`, vendorData);
    return this.http.post<Vendor>(this.apiUrl, vendorData).pipe(
        tap(newVendor => console.log('Created vendor:', newVendor)),
        catchError(this.handleError)
    );
}
getVendor(ptenantId:number,prodId:number): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.apiUrl+'/'+ptenantId+'/'+prodId)
}

getVendors(ptenantId:number): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.apiUrl+'/'+ptenantId).pipe(
      map((data: any) => {
        // Ensure the response is an array and map it properly
        const vendors = Array.isArray(data) ? data : [];
        return vendors.map(v => ({
          id: v.id || v.vendorId,
          vendorName: v.vendorName || v.name,
          description: v.description
        }));
      })
    );
}


  

}
