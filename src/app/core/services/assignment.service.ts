import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { Assignment, CreateAssignmentDto, UpdateAssignmentDto } from '../models/assignment.model';
import { AssignmentAttemptEnum } from '../../shared/enums/AssignAttempt-enum';


@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = '/assignment';

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
   * Creates a new Assignment. The `CreateAssignmentDto` ensures we are sending the correct data.
   * @param assignmentDto The data for the new assignment.
   * @returns An Observable of the created Assignment.
   */
  createAssignment(assignmentDto: CreateAssignmentDto): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, assignmentDto).pipe(
      tap(newAssignment => console.log('Created assignment:', newAssignment)),
      catchError(this.handleError)
    );
  }

  /**
   * Updates an existing Assignment. The `UpdateAssignmentDto` allows for partial updates.
   * @param id The ID of the assignment to update.
   * @param assignmentDto The partial data for the assignment.
   * @returns An Observable of the updated Assignment.
   */
  updateAssignment(id: number, assignmentDto: UpdateAssignmentDto): Observable<Assignment> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Assignment>(url, assignmentDto).pipe(
      tap(updatedAssignment => console.log('Updated assignment:', updatedAssignment)),
      catchError(this.handleError)
    );
  }
  deleteAssignment(id: number ): Observable<Assignment> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Assignment>(url).pipe(
      tap(deletedAssignment => console.log('Deleted assignment:',deletedAssignment)),
      catchError(this.handleError)
    );
  }

  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getAssignments(ptenanId:string): Observable<Assignment[]> {
      var url=this.apiUrl+'?activeTenantId='+ptenanId;
            return this.http.get<Assignment[]>(url).pipe(
       //   tap(users => console.log('Fetched assignments:', assignments)),
          catchError(this.handleError)
      );
  }
  getAssignmentsForStudent(ptenanId:string,studentProfileId:number): Observable<Assignment[]> {
      var url=this.apiUrl+'/studentProfileId/'+studentProfileId+'?activeTenantId='+ptenanId;
            return this.http.get<Assignment[]>(url).pipe(
       //   tap(users => console.log('Fetched assignments:', assignments)),
          catchError(this.handleError)
      );
  }
  getAssignmentsForFaculty(ptenanId:string,facultyProfileId:number): Observable<Assignment[]> {
       var url=this.apiUrl+'/facultyProfileId/'+facultyProfileId+'?activeTenantId='+ptenanId;
            return this.http.get<Assignment[]>(url).pipe(
       //   tap(users => console.log('Fetched assignments:', assignments)),
          catchError(this.handleError)
      );
  }
  getAssignmentsById(assignmentid:number,ptenanId:string): Observable<Assignment[]> {
    
      var url=this.apiUrl+'/'+assignmentid+'?activeTenantId='+ptenanId; 
      
            return this.http.get<Assignment[]>(url).pipe(
       //   tap(users => console.log('Fetched assignments:', assignments)),
          catchError(this.handleError)
      );

  }


}
