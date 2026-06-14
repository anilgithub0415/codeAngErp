import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { AssignmentAttempt, CreateAssignmentAttemptDto, UpdateAssignmentAttemptDto } from '../models/assignment-attempt';


@Injectable({
  providedIn: 'root'
})
export class AssignmentAttemptService {

  private apiUrl = '/assignmentattempt';

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
   * Creates a new AssignmentAttempt. The `CreateAssignmentAttemptDto` ensures we are sending the correct data.
   * @param assignmentattemptDto The data for the new assignmentattempt.
   * @returns An Observable of the created AssignmentAttempt.
   */
  createAssignmentAttempt(assignmentattemptDto: CreateAssignmentAttemptDto): Observable<AssignmentAttempt> {
    return this.http.post<AssignmentAttempt>(this.apiUrl, assignmentattemptDto).pipe(
      tap(newAssignmentAttempt => console.log('Created assignmentattempt:', newAssignmentAttempt)),
      catchError(this.handleError)
    );
  }

  
  /**
   * Updates an existing AssignmentAttempt. The `UpdateAssignmentAttemptDto` allows for partial updates.
   * @param id The ID of the assignmentattempt to update.
   * @param assignmentattemptDto The partial data for the assignmentattempt.
   * @returns An Observable of the updated AssignmentAttempt.
   */
  updateAssignmentAttempt(id: number, assignmentattemptDto: UpdateAssignmentAttemptDto): Observable<AssignmentAttempt> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<AssignmentAttempt>(url, assignmentattemptDto).pipe(
      tap(updatedAssignmentAttempt => console.log('Updated assignmentattempt:', updatedAssignmentAttempt)),
      catchError(this.handleError)
    );
  }
  deleteAssignmentAttempt(id: number ): Observable<AssignmentAttempt> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<AssignmentAttempt>(url).pipe(
      tap(deletedAssignmentAttempt => console.log('Deleted assignmentattempt:',deletedAssignmentAttempt)),
      catchError(this.handleError)
    );
  }

  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getAssignmentAttempts(ptenanId:number): Observable<AssignmentAttempt[]> {
    console.log('getAssignmentAttempt url:',this.apiUrl);
    
      var url=this.apiUrl+'?activeTenantId='+ptenanId;
            return this.http.get<AssignmentAttempt[]>(url).pipe(
       //   tap(users => console.log('Fetched assignmentattempts:', assignmentattempts)),
          catchError(this.handleError)
      );
  }

  getAssignmentAttemptDetailsByAttemptId(ptenanId:number,attemptId:number): Observable<AssignmentAttempt[]> {
    
      var url=this.apiUrl+'/'+attemptId+'?activeTenantId='+ptenanId;
            return this.http.get<AssignmentAttempt[]>(url).pipe(
       //   tap(users => console.log('Fetched assignmentattempts:', assignmentattempts)),
          catchError(this.handleError)
      );
  }


  getReviewResultOfAssignmentAttempt(passignmentAttemptId:number,ptenanId:number){
    
    var url=this.apiUrl+'/reviewresult/'+passignmentAttemptId+'?activeTenantId='+ptenanId;
          return this.http.get<any>(url).pipe(
     //   tap(users => console.log('Fetched assignments:', assignments)),
        catchError(this.handleError)
    );

  }
}
