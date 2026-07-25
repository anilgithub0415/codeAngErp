// src/app/core/services/leadsource.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Leadsource {
  id?: number;
  tenantId: number;
  leadSource: string;
  createdByUserId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeadsourceService {
  private apiUrl = '/leadsource';

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

  createLeadsource(leadsourceData: Partial<Leadsource>): Observable<any> {
    console.log(`Creating/Updating leadsource at ${this.apiUrl} with data:`, leadsourceData);
    return this.http.post<any>(this.apiUrl, leadsourceData).pipe(
      tap(res => console.log('Server response:', res)),
      catchError(this.handleError)
    );
  }

  getLeadsource(id: number): Observable<Leadsource> {
    return this.http.get<Leadsource>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getLeadsources(): Observable<Leadsource[]> {
    return this.http.get<Leadsource[]>(`${this.apiUrl}`).pipe(
      catchError(this.handleError)
    );
  }
}
