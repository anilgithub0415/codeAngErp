// src/app/core/services/subscription-plan-lookup.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface SubscriptionPlanLookup {
  planName: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanLookupService {
  private apiUrl = '/subscriptionPlan';

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

  createSubscriptionPlan(planData: Partial<SubscriptionPlanLookup>): Observable<any> {
    console.log(`Creating/Updating plan at ${this.apiUrl} with data:`, planData);
    return this.http.post<any>(this.apiUrl, planData).pipe(
      tap(res => console.log('Server response:', res)),
      catchError(this.handleError)
    );
  }

  getSubscriptionPlan(planName: string): Observable<SubscriptionPlanLookup> {
    return this.http.get<SubscriptionPlanLookup>(`${this.apiUrl}/${planName}`).pipe(
      catchError(this.handleError)
    );
  }

  getSubscriptionPlans(): Observable<SubscriptionPlanLookup[]> {
    return this.http.get<SubscriptionPlanLookup[]>(`${this.apiUrl}`).pipe(
      catchError(this.handleError)
    );
  }
}
