import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Interaction, CreateInteractionDto, UpdateInteractionDto } from '../models/interaction.model';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private apiUrl = '/interaction';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
          errorMessage = `Network error: ${error.error.message}`;
      } else {
          console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
          errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
      }
      return throwError(() => new Error(errorMessage));
  }

  /**
   * Fetches full timeline grids for a specific client tied to dashboard selection context
   */
  getInteractions(customerId: number, ptenantId: number): Observable<Interaction[]> {
      const url = `${this.apiUrl}/customer/${customerId}/ptenantId/${ptenantId}`;
      return this.http.get<Interaction[]>(url).pipe(
          catchError(this.handleError)
      );
  }

  /**
   * Commits a fresh interaction log entry
   */
  createInteraction(ptenantId: number, interactionData: CreateInteractionDto): Observable<Interaction> {
      const url = `${this.apiUrl}/ptenantId/${ptenantId}`;
      return this.http.post<Interaction>(url, interactionData).pipe(
          tap(newLog => console.log('Created interaction log:', newLog)),
          catchError(this.handleError)
      );
  }

  /**
   * Modifies narrative points or follow-up milestones
   */
  updateInteraction(id: number, ptenantId: number, updateData: UpdateInteractionDto): Observable<Interaction> {
      const url = `${this.apiUrl}/${id}/ptenantId/${ptenantId}`;
      return this.http.put<Interaction>(url, updateData).pipe(
          catchError(this.handleError)
      );
  }

  /**
   * Removes interaction logs
   */
  deleteInteraction(id: number, ptenantId: number): Observable<void> {
      const url = `${this.apiUrl}/${id}/ptenantId/${ptenantId}`;
      return this.http.delete<void>(url).pipe(
          tap(() => console.log(`Deleted interaction entry ID: ${id}`)),
          catchError(this.handleError)
      );
  }
}
