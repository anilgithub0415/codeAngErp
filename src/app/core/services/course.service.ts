import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { Course, CreateCourseDto, UpdateCourseDto } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = '/course';

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
   * @param courseDto The data for the new course.
   * @returns An Observable of the created Course.
   */
  createCourse(courseDto: CreateCourseDto): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, courseDto).pipe(
      tap(newCourse => console.log('Created course:', newCourse)),
      catchError(this.handleError)
    );
  }

  /**
   * Updates an existing Course. The `UpdateCourseDto` allows for partial updates.
   * @param id The ID of the course to update.
   * @param courseDto The partial data for the course.
   * @returns An Observable of the updated Course.
   */
  updateCourse(id: number, courseDto: UpdateCourseDto): Observable<Course> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Course>(url, courseDto).pipe(
      tap(updatedCourse => console.log('Updated course:', updatedCourse)),
      catchError(this.handleError)
    );
  }
  deleteCourse(id: number ): Observable<Course> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Course>(url).pipe(
      tap(deletedCourse => console.log('Deleted course:',deletedCourse)),
      catchError(this.handleError)
    );
  }

  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getCourses(ptenanId:number): Observable<Course[]> {
    console.log('getCourse url:',this.apiUrl);
    
      var url=this.apiUrl+'?activeTenantId='+ptenanId;
            return this.http.get<Course[]>(url).pipe(
       //   tap(users => console.log('Fetched courses:', courses)),
          catchError(this.handleError)
      );
  }

  getCoursesByProgram(programid:number,ptenanId:number): Observable<Course[]> {
    
      var url=this.apiUrl+'/programId/'+programid+'?activeTenantId='+ptenanId;
            return this.http.get<Course[]>(url).pipe(
       //   tap(users => console.log('Fetched courses:', courses)),
          catchError(this.handleError)
      );
  }
}
