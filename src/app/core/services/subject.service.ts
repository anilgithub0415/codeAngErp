import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { Subject, CreateSubjectDto, UpdateSubjectDto } from '../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private apiUrl = '/subject';

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
   * Creates a new Course. The `CreateCourseDto` ensures we are sending the correct data.
   * @param subjectDto The data for the new subject.
   * @returns An Observable of the created Course.
   */
  createSubject(subjectDto: CreateSubjectDto): Observable<Subject> {
    alert('creating subject url:'+this.apiUrl)
    return this.http.post<Subject>(this.apiUrl, subjectDto).pipe(
      tap(newCourse => console.log('Created subject:', newCourse)),
      catchError(this.handleError)
    );
  }

  
  /**
   * Updates an existing Subject. The `UpdateSubjectDto` allows for partial updates.
   * @param id The ID of the subject to update.
   * @param subjectDto The partial data for the subject.
   * @returns An Observable of the updated Subject.
   */
  updateSubject(id: number, subjectDto: UpdateSubjectDto): Observable<Subject> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Subject>(url, subjectDto).pipe(
      tap(updatedSubject => console.log('Updated subject:', updatedSubject)),
      catchError(this.handleError)
    );
  }
  
  deleteSubject(id: number ): Observable<Subject> {
    const url = `${this.apiUrl}/${id}`;

    alert('hitting delete subject url:'+url)
    return this.http.delete<Subject>(url).pipe(
      tap(deletedSubject => console.log('Deleted subject:',deletedSubject)),
      catchError(this.handleError)
    );
  }
  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getSubjects(ptenanId:number): Observable<Subject[]> {
      var url=this.apiUrl+'?activeTenantId='+ptenanId;;
            return this.http.get<Subject[]>(url).pipe(
       //   tap(users => console.log('Fetched subjects:', subjects)),
          catchError(this.handleError)
      );
  }
}
