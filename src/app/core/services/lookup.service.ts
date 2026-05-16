import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { Program} from '../models/program';
import { Subject} from '../models/subject.model';
import { Course } from '../models/course.model';
import { FacultyProfile } from '../models/faculty-profile';


import { Question } from '../models/question.model';
import { Topic } from '../models/topic.model';
import { CourseOffering } from '../models/course-offering';
import { UserRole } from '../models/user.model';

// No need for InventoryStatus here, that was from the product example

interface ProgramOption {
  label: string;
  value: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  
  private dummyPrograms: ProgramOption[] = [
    { label: '11th Sci JEE Main & Advanced Prep', value: 'P1' },
    { label: '12th Sci NEET Prep', value: 'P2' },
    { label: 'Foundation Course 9th-10th', value: 'P3' },
  ];




  private apiUrl = '/lookups';

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
  getPrograms(ptenanId:string): Observable<Program[]> {
      var url=this.apiUrl+'/programs/ptenantId/'+ptenanId;
        
      return this.http.get<Program[]>(url).pipe(
       //   tap(users => console.log('Fetched users:', users)),
          catchError(this.handleError)
      );
     // return of(this.dummyPrograms);
  }

  
  /**
   * Fetches a list of all subjects from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getSubjects(ptenanId:string): Observable<Subject[]> {
    var url=this.apiUrl+'/subjects/ptenantId/'+ptenanId;
      
    return this.http.get<Subject[]>(url).pipe(
     //   tap(users => console.log('Fetched users:', users)),
        catchError(this.handleError)
    );
   // return of(this.dummyPrograms);
}


  
  /**
   * Fetches a list of all subjects from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getCourses(ptenanId:string): Observable<Course[]> {
    var url=this.apiUrl+'/courses/ptenantId/'+ptenanId;
      
    return this.http.get<Course[]>(url).pipe(
     //   tap(users => console.log('Fetched users:', users)),
        catchError(this.handleError)
    );
   // return of(this.dummyPrograms);
}

getCourseofferings(ptenanId:string): Observable<CourseOffering[]> {
  var url=this.apiUrl+'/courseofferings/ptenantId/'+ptenanId;
    
  return this.http.get<CourseOffering[]>(url).pipe(
   //   tap(users => console.log('Fetched users:', users)),
      catchError(this.handleError)
  );
 // return of(this.dummyPrograms);
}

getCourseofferingsByFacultyIdThruPersonId(ptenanId:string,personId:number): Observable<CourseOffering[]> {
  var url=this.apiUrl+'/courseofferings/ptenantId/'+ptenanId+'/personId/'+personId;
    
  return this.http.get<CourseOffering[]>(url).pipe(
   //   tap(users => console.log('Fetched users:', users)),
      catchError(this.handleError)
  );
 // return of(this.dummyPrograms);
}

  
  /**
   * Fetches a list of all subjects from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getFacultyProfiles(ptenanId:string): Observable<FacultyProfile[]> {
    var url=this.apiUrl+'/facultyProfiles/ptenantId/'+ptenanId;
      
    return this.http.get<FacultyProfile[]>(url).pipe(
     //   tap(users => console.log('Fetched users:', users)),
        catchError(this.handleError)
    );
   // return of(this.dummyPrograms);
}

getQuestionTypes(ptenanId:string): Observable<Question[]> {
    var url=this.apiUrl+'/questionTypes/ptenantId/'+ptenanId;
      
    return this.http.get<Question[]>(url).pipe(
     //   tap(users => console.log('Fetched users:', users)),
        catchError(this.handleError)
    );
   // return of(this.dummyPrograms);
}

getRoleTypes(ptenanId:string): Observable<UserRole[]> {
  var url=this.apiUrl+'/roleTypes/ptenantId/'+ptenanId;
    
  return this.http.get<UserRole[]>(url).pipe(
   //   tap(users => console.log('Fetched users:', users)),
      catchError(this.handleError)
  );
 // return of(this.dummyPrograms);
}

getQuestionCategories(ptenanId:string): Observable<Question[]> {
  var url=this.apiUrl+'/questionCategorys/ptenantId/'+ptenanId;
    
  return this.http.get<Question[]>(url).pipe(
   //   tap(users => console.log('Fetched users:', users)),
      catchError(this.handleError)
  );
 // return of(this.dummyPrograms);
}


getQuestionPurposes(ptenanId:string): Observable<Question[]> {
    var url=this.apiUrl+'/questionPurposes/ptenantId/'+ptenanId;
      
    return this.http.get<Question[]>(url).pipe(
     //   tap(users => console.log('Fetched users:', users)),
        catchError(this.handleError)
    );
   // return of(this.dummyPrograms);
}



getTopics(ptenanId:string): Observable<Topic[]> {
  var url=this.apiUrl+'/topics/ptenantId/'+ptenanId;
    
  return this.http.get<Topic[]>(url).pipe(
   //   tap(users => console.log('Fetched users:', users)),
      catchError(this.handleError)
  );
 // return of(this.dummyPrograms);
}

}
