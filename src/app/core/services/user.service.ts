// src/app/core/services/user.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
// No need for InventoryStatus here, that was from the product example

@Injectable({
    providedIn: 'root' // This ensures it's a singleton available throughout your application
})
export class UserService {
    // Base URL for your User API endpoints on the backend
    // Assuming your backend serves user APIs under /api/users
    private apiUrl = '/user';

    constructor(private http: HttpClient) {
 console.log('userservice constructor is running');

     }

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
    getUsers(ptenanId:string,paramcondition?:string): Observable<User[]> {
        var url=this.apiUrl+'/0/ptenantId/'+ptenanId;
        if(paramcondition){url=url+'/'+paramcondition}
        return this.http.get<User[]>(url).pipe(
         //   tap(users => console.log('Fetched users:', users)),
            catchError(this.handleError)
        );
    }

    /**
     * Retrieves users using a pre-constructed API URL.
     * This is the method that DataScopeService will interact with.
     * @param url The full API URL including query parameters.
     * @returns An Observable of an array of UserBackendModel.
     */
    getUsersByUrl(url: string): Observable<User[]> {
        return this.http.get<User[]>(url);
    }
    /**
     * Fetches a single user by their ID.
     * @param id The ID of the user to fetch.
     * @returns An Observable of a single User object.
     */
    getUser(id: number): Observable<User> { 
        
        
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<User>(url).pipe(
            tap(user => {}),
            catchError(this.handleError)
        );
    }

    /**
     * Creates a new user by sending data to the backend API.
     * @param userData The data for the new user (CreateUserDto).
     * @returns An Observable of the created User object (including its new ID).
     */
    createUser(userData: Partial<CreateUserDto>): Observable<User> {
        console.log(`Creating user at ${this.apiUrl} with data:`, userData);
        return this.http.post<User>(this.apiUrl, userData).pipe(
            tap(newUser => console.log('Created user:', newUser)),
            catchError(this.handleError)
        );
    }

    /**
     * Updates an existing user by sending partial data to the backend API.
     * @param id The ID of the user to update.
     * @param updateData The partial data for the user (UpdateUserDto).
     * @returns An Observable of the updated User object.
     */
    updateUser(id: number, updateData: UpdateUserDto): Observable<User> {
        const url = `${this.apiUrl}/${id}`;
         return this.http.put<User>(url, updateData).pipe(
          //  tap(updatedUser => console.log('Updated user:', updatedUser)),
            catchError(this.handleError)
        );
    }

    /**
     * Deletes a user by their ID.
     * @param id The ID of the user to delete.
     * @returns An Observable that completes upon successful deletion (or throws an error).
     */
    deleteUser(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        console.log(`Deleting user from ${url}`);
        return this.http.delete<void>(url).pipe(
            tap(() => console.log(`Deleted user with ID: ${id}`)),
            catchError(this.handleError)
        );
    }

      // NEW: Methods to fetch lookup options for dropdowns
      getUserRoles(): Observable<string[]> { // Or Observable<EnumOption[]> if backend sends label/value
        return this.http.get<string[]>(`${this.apiUrl}/roles`).pipe(
          //  tap(roles => console.log('Fetched user roles:', roles)),
            catchError(this.handleError)
        );
    }



    //for ngx-formly to work
    getUsertableFieldsConfig(config_usersCreatedby:string):Observable<any>{
       console.log(' m in userservice getUsertableFieldsConfig.................:');

        return this.http.get<any[]>(this.apiUrl+'/user_table_fields'+'?config_usersCreatedby='+config_usersCreatedby).pipe(
            // tap(tenants => console.log('Fetched tenants:', tenants)),
            // catchError(this.handleError)
         );
     }

}