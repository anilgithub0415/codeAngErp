import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; 
import { CreateVendorDto, Vendor } from '../models/vendor.model';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

    private apiUrl = '/vendor';

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

    /**
     * Strict POST Route Link mapping to createVendorClean on the backend
     */
    createVendor(vendorData: Partial<CreateVendorDto>): Observable<Vendor> {
        console.log(`Creating vendor at ${this.apiUrl} with data:`, vendorData);
        return this.http.post<Vendor>(this.apiUrl, vendorData).pipe(
            tap(newVendor => console.log('Created vendor successfully:', newVendor)),
            catchError(this.handleError)
        );
    }

    /**
     * Strict PUT Route Link mapping to updateVendor on the backend
     */
    updateVendor(id: number, vendorData: Partial<CreateVendorDto>): Observable<Vendor> {
        console.log(`Updating vendor at ${this.apiUrl}/${id} with data:`, vendorData);
        return this.http.put<Vendor>(`${this.apiUrl}/${id}`, vendorData).pipe(
            tap(updatedVendor => console.log('Updated vendor successfully:', updatedVendor)),
            catchError(this.handleError)
        );
    }

    getVendor(ptenantId: number, prodId: number): Observable<Vendor> {
        return this.http.get<Vendor>(`${this.apiUrl}/${ptenantId}/${prodId}`);
    }

    getVendors(ptenantId: number): Observable<Vendor[]> {
        return this.http.get<Vendor[]>(`${this.apiUrl}/${ptenantId}`).pipe(
            map((data: any) => {
                const vendors = Array.isArray(data) ? data : [];
                return vendors.map(v => ({
                    id: v.id || v.vendorId,
                    vendorName: v.vendorName || v.name,
                    description: v.description,
                    createdByUserId: v.createdByUserId,
                    tenantId: v.tenantId
                }));
            }),
            catchError(this.handleError)
        );
    }
}
