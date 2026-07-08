import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; // Import catchError, tap and map
import { CreateCityDto, City } from '../models/city.model';


@Injectable({
  providedIn: 'root'
})
export class CityService {

    // Base URL for your City API endpoints on the backend
    // Assuming your backend serves city APIs under /api/citys
    private apiUrl = '/city';

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
        // Return an observable with a city-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 /**
     * Creates a new city by sending data to the backend API.
     * @param cityData The data for the new city (CreateCityDto).
     * @returns An Observable of the created City object (including its new ID).
     */
 createCity(cityData: Partial<CreateCityDto>): Observable<City> {
    console.log(`Creating city at ${this.apiUrl} with data:`, cityData);
    return this.http.post<City>(this.apiUrl, cityData).pipe(
        tap(newCity => console.log('Created city:', newCity)),
        catchError(this.handleError)
    );
}


getCity(ptenantId:number,prodId:number): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl+'/'+ptenantId+'/'+prodId)
}

getCitys(ptenantId:number): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl+'/'+ptenantId).pipe(
      map((data: any) => {
        // Ensure the response is an array and map it properly
        const citys = Array.isArray(data) ? data : [];
        return citys.map(v => ({
          id: v.id || v.cityId,
          cityName: v.cityName || v.name,
          cityAbbrevation: v.cityAbbrevation
        }));
      })
    );
}

// Inside class CityService { ...

/**
 * Sends a PUT request to update an existing City record resource.
 * @param id The auto-increment database primary key ID mapping.
 * @param cityData The partial modification layout snapshot.
 */
updateCity(id: number, cityData: Partial<CreateCityDto>): Observable<City> {
    console.log(`Updating city configuration at ${this.apiUrl}/${id} with data:`, cityData);
    return this.http.put<City>(`${this.apiUrl}/${id}`, cityData).pipe(
        tap(updatedCity => console.log('Successfully updated city dataset instance:', updatedCity)),
        catchError(this.handleError)
    );
}

  

}
