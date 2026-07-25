import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { CreateProgramCourseDto, ProgramCourse, UpdateProgramCourseDto} from '../models/program-courses';
// No need for InventoryStatus here, that was from the product example



@Injectable({
  providedIn: 'root'
})
export class ProgramcourseService {

  private apiUrl = '/programcourse';

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
   * Creates a new Programcourse. The `CreateProgramcourseDto` ensures we are sending the correct data.
   * @param programcourseDto The data for the new programcourse.
   * @returns An Observable of the created Programcourse.
   */
  createProgramcourse(programcourseDto: CreateProgramCourseDto): Observable<ProgramCourse> {
    return this.http.post<ProgramCourse>(this.apiUrl, programcourseDto).pipe(
      tap(newProgramcourse => console.log('Created programcourse:', newProgramcourse)),
      catchError(this.handleError)
    );
  }

  /**
   * Updates an existing Programcourse. The `UpdateProgramcourseDto` allows for partial updates.
   * @param id The ID of the programcourse to update.
   * @param programcourseDto The partial data for the programcourse.
   * @returns An Observable of the updated Programcourse.
   */
  updateProgramcourse(id: number, programcourseDto: UpdateProgramCourseDto): Observable<ProgramCourse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ProgramCourse>(url, programcourseDto).pipe(
      tap(updatedProgramCourse => console.log('Updated programcourse:', updatedProgramCourse)),
      catchError(this.handleError)
    );
  }
  deleteProgramCourse(id: number ): Observable<ProgramCourse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ProgramCourse>(url).pipe(
      tap(deletedProgramCourse => console.log('Deleted programcourse:',deletedProgramCourse)),
      catchError(this.handleError)
    );
  }
  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getProgramCourses(ptenanId:number): Observable<ProgramCourse[]> {
      var url=this.apiUrl;//+'/0/ptenantId/'+ptenanId;
      
      return this.http.get<ProgramCourse[]>(url).pipe(
       
          catchError(this.handleError)
      );
  }
//byIdOrPersonId:'byId' | 'byPersonId'
  getById(id: number, activeTenantId:number): Observable<ProgramCourse[]|null> { 
    console.log('yes its executing.....................................');
    
    const params = new HttpParams().set('activeTenantId',activeTenantId);

   
    return this.http.get<ProgramCourse[]>(`${this.apiUrl}/${id}`, { params })       
    
    
}

}

