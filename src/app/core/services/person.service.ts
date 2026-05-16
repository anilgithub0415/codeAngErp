
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

import { CreatePersonDto, Person, UpdatePersonDto } from '../models/person.model';
@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private apiUrl = '/person';

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

  createPerson(personData: CreatePersonDto): Observable<Person> {
    return this.http.post<Person>(this.apiUrl, personData).pipe(
        tap(newPerson => console.log('Created person:', newPerson)),
        catchError(this.handleError)
    );
}

updatePerson(id: number, updateData: UpdatePersonDto): Observable<Person> {
  const url = `${this.apiUrl}/${id}`;
   return this.http.put<Person>(url, updateData).pipe(
        catchError(this.handleError)
  );
}

getPersons(): Observable<Person[]> {
  var url=this.apiUrl;
  return this.http.get<Person[]>(url).pipe(
        catchError(this.handleError)
  );
}

    /**
     * Retrieves persons using a pre-constructed API URL.
     * This is the method that DataScopeService will interact with.
     * @param url The full API URL including query parameters.
     * @returns An Observable of an array of PersonBackendModel.
     */
    getPersonsByUrl(url: string): Observable<Person[]> {
           
      return this.http.get<Person[]>(url);
  }


}
