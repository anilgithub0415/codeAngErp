
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators'; // Import catchError and tap
//CreateStudentprofileDto,  UpdateStudentprofileDto 
import { CreateStudentprofileDto, StudentProfile} from '../models/student-profile';

@Injectable({
  providedIn: 'root'
})
export class StudentprofileService {


  private apiUrl = '/studprofile';

  constructor(private http: HttpClient) { }
  
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

  createStudentprofile(personData: CreateStudentprofileDto): Observable<StudentProfile> {
    console.log('hitting: post it   '+this.apiUrl+' with persondata:',personData)
    return this.http.post<StudentProfile>(this.apiUrl, personData).pipe(
        tap(newStudentprofile => console.log('Created student profile:', newStudentprofile)),
        catchError(this.handleError)
    );
}

// updateStudentprofile(id: number, updateData: UpdateStudentprofileDto): Observable<Studentprofile> {
//   const url = `${this.apiUrl}/${id}`;
//    return this.http.put<Studentprofile>(url, updateData).pipe(
//         catchError(this.handleError)
//   );
// }

getStudentprofiles(): Observable<StudentProfile[]> {
  var url=this.apiUrl;
  return this.http.get<StudentProfile[]>(url).pipe(
        catchError(this.handleError)
  );
}

  getStudentprofile_byIdOrPersonId(id: number,byIdOrPersonId:'byId' | 'byPersonId', activeTenantId:number): Observable<StudentProfile|null> { 
     const params = new HttpParams().set('byIdOrPersonId', byIdOrPersonId).set('activeTenantId',activeTenantId);

   console.log('studprofile url:',`${this.apiUrl}/${id}`);
   
    return this.http.get<StudentProfile>(`${this.apiUrl}/${id}`, { params })       
    .pipe(
      // The map operator is not strictly necessary here since the API returns the profile directly,
      // but it's a good place to transform data if needed.
      map((profile:StudentProfile) => profile),
      

      // --- The workaround to handle the corrupted error object ---
      catchError(error => { 
        // 1. Log the full object again for a sanity check, just in case
        console.group('--- CATCHERROR DEBUGGING ---');
        console.log('Received error object:', error);
        console.log('Is it an HttpErrorResponse?', error instanceof HttpErrorResponse);
        console.groupEnd();
        
        // 2. Check the error object's content for our expected message
        // This is a workaround for the missing 'status' property.
        if (error && error.message === 'Student Profile not found.') {
          console.warn(`(Service) Received expected 'not found' message in error. Returning null.`);
          return of(null);
        }

        // 3. For any other unexpected error, re-throw it.
        // This handles all other cases (network errors, 500 errors, etc.)
        // We can't access `error.status`, so we just re-throw the error object itself.
        console.error('(Service) An unexpected error occurred:', error);
        return throwError(() => error);
      })

    )
    
}

}
