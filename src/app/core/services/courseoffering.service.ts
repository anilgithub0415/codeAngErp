import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { CourseOffering, CreateCourseOfferingDto, UpdateCourseOfferingDto } from '../models/course-offering';

@Injectable({
  providedIn: 'root'
})
export class CourseofferingService {


  private apiUrl = '/courseoffering';

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
   * @param courseofferingDto The data for the new courseoffering.
   * @returns An Observable of the created Course.
   */
  createCourseOffering(courseofferingDto: CreateCourseOfferingDto): Observable<CourseOffering> {
    alert('creating courseoffering url:'+this.apiUrl)
    return this.http.post<CourseOffering>(this.apiUrl, courseofferingDto).pipe(
      tap(newCourse => console.log('Created courseoffering:', newCourse)),
      catchError(this.handleError)
    );
  }

  
  /**
   * Updates an existing CourseOffering. The `UpdateCourseOfferingDto` allows for partial updates.
   * @param id The ID of the courseoffering to update.
   * @param courseofferingDto The partial data for the courseoffering.
   * @returns An Observable of the updated CourseOffering.
   */
  updateCourseOffering(id: number, courseofferingDto: UpdateCourseOfferingDto): Observable<CourseOffering> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<CourseOffering>(url, courseofferingDto).pipe(
      tap(updatedCourseOffering => console.log('Updated courseoffering:', updatedCourseOffering)),
      catchError(this.handleError)
    );
  }
  
  deleteCourseOffering(id: number ): Observable<CourseOffering> {
    const url = `${this.apiUrl}/${id}`;

    alert('hitting delete courseoffering url:'+url)
    return this.http.delete<CourseOffering>(url).pipe(
      tap(deletedCourseOffering => console.log('Deleted courseoffering:',deletedCourseOffering)),
      catchError(this.handleError)
    );
  }
  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getCourseOfferings(ptenanId:number): Observable<CourseOffering[]> {
      var url=this.apiUrl+'?activeTenantId='+ptenanId;
            return this.http.get<CourseOffering[]>(url).pipe(
       //   tap(users => console.log('Fetched courseofferings:', courseofferings)),
          catchError(this.handleError)
      );
  }

  getCourseOfferingsByCourseId(pcourseId:number,ptenanId:number): Observable<CourseOffering[]> {//
     var url=this.apiUrl+'/courseid/'+pcourseId+'?activeTenantId='+ptenanId;
          return this.http.get<CourseOffering[]>(url).pipe(
     //   tap(users => console.log('Fetched courseofferings:', courseofferings)),
        catchError(this.handleError)
    );
}

}
