// src/app/core/services/user.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
//import { Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto } from '../models/enrollment';
import { CreateStudentEnrollmentDto, Enrollment } from '../models/enrollment.interfaces';
// No need for InventoryStatus here, that was from the product example

@Injectable({
    providedIn: 'root' // This ensures it's a singleton available throughout your application
})

@Injectable({
  providedIn: 'root'
})
export class EnrollService {
  // Base URL for your User API endpoints on the backend
  // Assuming your backend serves user APIs under /api/users
  private apiUrl = '/enroll';

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
  getEnrollments(ptenanId:number): Observable<Enrollment[]> {
      var url=this.apiUrl;
            return this.http.get<Enrollment[]>(url).pipe(
       //   tap(users => console.log('Fetched users:', users)),
          catchError(this.handleError)
      );
  }

  // /**
  //  * Retrieves users using a pre-constructed API URL.
  //  * This is the method that DataScopeService will interact with.
  //  * @param url The full API URL including query parameters.
  //  * @returns An Observable of an array of UserBackendModel.
  //  */
  // getUsersByUrl(url: string): Observable<User[]> {
  //     return this.http.get<User[]>(url);
  // }

  // /**
  //  * Fetches a single user by their ID.
  //  * @param id The ID of the user to fetch.
  //  * @returns An Observable of a single User object.
  //  */
  getEnrollment(id: number): Observable<Enrollment> { 
      const url = `${this.apiUrl}/${id}`;
      return this.http.get<Enrollment>(url).pipe(
          tap(user => {}),
          catchError(this.handleError)
      );
  }


//   /**
//    * Creates a new enrollment by sending data to the backend API.
//    * @param enrollmentData The data for the new enrollment (CreateEnrollmentDto).
//    * @returns An Observable of the created Enrollment object (including its new ID).
//    */
//   createEnrollment(enrollmentData: CreateEnrollmentDto): Observable<Enrollment> {
    
//       console.log(`Creating enrollment at ${this.apiUrl} with data:`, enrollmentData);
//       return this.http.post<Enrollment>(this.apiUrl, enrollmentData).pipe(
//           tap(newEnrollment => console.log('Created enrollment:', newEnrollment)),
//           catchError(this.handleError)
//       );
//   }

createEnrollment(enrollmentData: CreateStudentEnrollmentDto): Observable<Enrollment> {
    console.log(`Creating enrollment at ${this.apiUrl} with data:`, enrollmentData);
    return this.http.post<Enrollment>(this.apiUrl, enrollmentData).pipe(
        tap(newEnrollment => console.log('Created enrollment:', newEnrollment)),
        catchError(this.handleError)
    );
}

    

}
