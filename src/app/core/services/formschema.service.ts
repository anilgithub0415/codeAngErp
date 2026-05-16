import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap


import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';

@Injectable({
  providedIn: 'root'
})
export class FormschemaService {

  
  private apiUrl = '/form-schemas';

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

  

// getFormschema(whichForm:string){
//   const url = `${this.apiUrl}/${whichForm}`;
//   // Fetch the form schema from your Node.js backend
//  return this.http.get<FormlyFieldConfig[]>(url)
//   .pipe(
//         catchError(error => {
//        //  console.error('Error fetching form schema:', error);
//        catchError(this.handleError)
//           // Return a static fallback schema on error
//           // return of([
//           //   { key: 'error', type: 'input', templateOptions: { label: 'Error loading form. Please try again.', disabled: true } }
//           // ]);
//           return []
//         }))


// }

// ... in your service
getFormschema(whichForm: string): Observable<FormlyFieldConfig[]> {
  const url = `${this.apiUrl}/${whichForm}`;
  return this.http.get<FormlyFieldConfig[]>(url).pipe(
    catchError(error => {
      console.error('Error fetching form schema:', error); // Log the error for debugging

      // If you want to return an EMPTY form on error:
      return of([]); // <-- This is the correct way to return an empty array as an Observable

      // OR, if you want to return a single field indicating an error:
      // return of([
      //   { key: 'formError', type: 'input', templateOptions: { label: 'Failed to load form. Please try again.', disabled: true } }
      // ]);

      // OR, if you want to re-throw the error (e.g., for a global error handler to catch):
      // return throwError(() => new Error('Failed to load form schema'));
    })
  );
}

// getPersons(): Observable<Person[]> {
//   var url=this.apiUrl;
//   return this.http.get<Person[]>(url).pipe(
//         catchError(this.handleError)
//   );
// }

//     /**
//      * Retrieves persons using a pre-constructed API URL.
//      * This is the method that DataScopeService will interact with.
//      * @param url The full API URL including query parameters.
//      * @returns An Observable of an array of PersonBackendModel.
//      */
//     getPersonsByUrl(url: string): Observable<Person[]> {
           
//       return this.http.get<Person[]>(url);
//   }


}

