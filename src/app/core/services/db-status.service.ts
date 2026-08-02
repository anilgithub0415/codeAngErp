import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface DbStatus{
  status:string;
  daabase:string;
  type:string;
  host:string;
}
@Injectable({
  providedIn: 'root'
})
export class DbStatusService {
private apiUrl = '/dbStatus';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }


  getdbStatus(): Observable<DbStatus> {
    return this.http.get<DbStatus>(`${this.apiUrl}`).pipe(
      catchError(this.handleError)
    );
  }

}
