import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { FacultyProfile, CreateFacultyProfileDto, UpdateFacultyProfileDto } from '../models/faculty-profile';


@Injectable({
  providedIn: 'root'
})
export class FacultyprofileService {

  private apiUrl = '/facultyprofile';

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
   * Creates a new FacultyProfile. The `CreateFacultyProfileDto` ensures we are sending the correct data.
   * @param facultyprofileDto The data for the new facultyprofile.
   * @returns An Observable of the created FacultyProfile.
   */
  createFacultyProfile(facultyprofileDto: CreateFacultyProfileDto): Observable<FacultyProfile> {
    return this.http.post<FacultyProfile>(this.apiUrl, facultyprofileDto).pipe(
      tap(newFacultyProfile => console.log('Created facultyprofile:', newFacultyProfile)),
      catchError(this.handleError)
    );
  }

  /**
   * Updates an existing FacultyProfile. The `UpdateFacultyProfileDto` allows for partial updates.
   * @param id The ID of the facultyprofile to update.
   * @param facultyprofileDto The partial data for the facultyprofile.
   * @returns An Observable of the updated FacultyProfile.
   */
  updateFacultyProfile(id: number, facultyprofileDto: UpdateFacultyProfileDto): Observable<FacultyProfile> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<FacultyProfile>(url, facultyprofileDto).pipe(
      tap(updatedFacultyProfile => console.log('Updated facultyprofile:', updatedFacultyProfile)),
      catchError(this.handleError)
    );
  }
  deleteFacultyProfile(id: number ): Observable<FacultyProfile> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<FacultyProfile>(url).pipe(
      tap(deletedFacultyProfile => console.log('Deleted facultyprofile:',deletedFacultyProfile)),
      catchError(this.handleError)
    );
  }

  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getFacultyProfiles(ptenanId:number): Observable<FacultyProfile[]> {
    console.log('getFacultyProfile url:',this.apiUrl);
    
      var url=this.apiUrl+'?activeTenantId='+ptenanId;
            return this.http.get<FacultyProfile[]>(url).pipe(
       //   tap(users => console.log('Fetched facultyprofiles:', facultyprofiles)),
          catchError(this.handleError)
      );
  }
}
