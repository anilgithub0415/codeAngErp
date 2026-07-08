import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; // Import catchError, tap and map
import { CreateDistrictDto, District } from '../models/district.model';


@Injectable({
  providedIn: 'root'
})
export class DistrictService {

    // Base URL for your District API endpoints on the backend
    // Assuming your backend serves district APIs under /api/districts
    private apiUrl = '/district';

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
        // Return an observable with a district-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 

/**
 * Executes a PUT tracking request mapping directly onto route parameters.
 */
updateDistrict(id: number, districtData: any): Observable<any> {
    console.log(`Updating district config at ${this.apiUrl}/${id} with data:`, districtData);
    return this.http.put<any>(`${this.apiUrl}/${id}`, districtData).pipe(
        tap(updatedDistrict => console.log('Successfully updated district instance:', updatedDistrict)),
        catchError(this.handleError)
    );
}

// Ensure your existing createDistrict still tracks correctly:
createDistrict(districtData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, districtData).pipe(
        catchError(this.handleError)
    );
}


getDistrict(ptenantId:number,prodId:number): Observable<District[]> {
    return this.http.get<District[]>(this.apiUrl+'/'+ptenantId+'/'+prodId)
}

getDistricts(ptenantId:number): Observable<District[]> {
    return this.http.get<District[]>(this.apiUrl+'/'+ptenantId).pipe(
      map((data: any) => {
        // Ensure the response is an array and map it properly
        const districts = Array.isArray(data) ? data : [];
        return districts.map(v => ({
          id: v.id || v.districtId,
          districtName: v.districtName || v.name,
          description: v.description
        }));
      })
    );
}


  

}
