import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { Tenant, CreateTenantDto , UpdateTenantDto } from '../models/tenant.model';

// No need for InventoryStatus here, that was from the product example


@Injectable({
  providedIn: 'root'
})
export class TenantService {
  // Base URL for your User API endpoints on the backend
  // Assuming your backend serves user APIs under /api/users
  private apiUrl = '/tenant';

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
      // Return an observable with a user-facing error message.
      return throwError(() => new Error(errorMessage));
  }

  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getTenants(): Observable<Tenant[]> {
    console.log('............................url tenant get..............',this.apiUrl);
    
       return this.http.get<Tenant[]>(this.apiUrl).pipe(
         // tap(tenants => console.log('Fetched tenants:', tenants)),
          catchError(this.handleError)
      );
  }

getTenant(tid:number): Observable<Tenant> {
       return this.http.get<Tenant>(this.apiUrl+'/'+tid).pipe(
         // tap(tenants => console.log('Fetched tenants:', tenants)),
          catchError(this.handleError)
      );
  }


  /**
   * Creates a new user by sending data to the backend API.
   * @param userData The data for the new user (CreateUserDto).
   * @returns An Observable of the created User object (including its new ID).
   */
  createTenant(userData: CreateTenantDto): Observable<Tenant> {
    
      console.log(`Creating tenant at ${this.apiUrl} with data:`, userData);
      return this.http.post<Tenant>(this.apiUrl, userData).pipe(
          tap(newTenant => console.log('Created tenant:', newTenant)),
          catchError(this.handleError)
      );
  }

  /**
   * Updates an existing user by sending partial data to the backend API.
   * @param id The ID of the user to update.
   * @param updateData The partial data for the user (UpdateUserDto).
   * @returns An Observable of the updated User object.
   */
  updateTenant(id: number, updateData: UpdateTenantDto): Observable<Tenant> {
      const url = `${this.apiUrl}/${id}`;
      return this.http.put<Tenant>(url, updateData).pipe(
         // tap(updatedTenant => console.log('Updated tenant:', updatedTenant)),
          catchError(this.handleError)
      );
  }

  /**
   * Deletes a user by their ID.
   * @param id The ID of the user to delete.
   * @returns An Observable that completes upon successful deletion (or throws an error).
   */
  deleteTenant(id: number): Observable<void> {
      const url = `${this.apiUrl}/${id}`;
      console.log(`Deleting tenant from ${url}`); 
      return this.http.delete<void>(url).pipe(
          tap(() => console.log(`Deleted tenant with ID: ${id}`)),
          catchError(this.handleError)
      );
  }


    // NEW: Methods to fetch lookup options for dropdowns
    getTenantTypes(): Observable<string[]> { // Or Observable<EnumOption[]> if backend sends label/value
        return this.http.get<string[]>(`${this.apiUrl}/types`).pipe(
       //     tap(types => console.log('Fetched tenant types:', types)),
            catchError(this.handleError)
        );
    }

    getSubscriptionPlans(): Observable<string[]> { // Or Observable<EnumOption[]>
        return this.http.get<string[]>(`${this.apiUrl}/plans`).pipe(
           // tap(plans => console.log('Fetched subscription plans:', plans)),
            catchError(this.handleError)
        );
    }
    
}
