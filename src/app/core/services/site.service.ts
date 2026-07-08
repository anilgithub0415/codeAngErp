// src/app/core/services/site.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; 

// Import the Site interfaces/DTOs you just defined
import { Site } from '../models/site.model';

@Injectable({
    providedIn: 'root' 
})
export class SiteService {
    // Base URL matching your exact router prefix gateway parameters
    private apiUrl = '/site';

    constructor(private http: HttpClient) { }

    /**
     * Handles HTTP errors from API calls.
     * @param error The HttpErrorResponse.
     * @returns An Observable that throws an error.
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            console.error('Client-side error:', error.error.message);
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
        }
        return throwError(() => new Error(errorMessage));
    }

    /**
     * Creates a new site by sending data to the backend API.
     * @param siteData The data for the new site (CreateSite).
     * @returns An Observable of the created Site object.
     */
    createSite(siteData: Partial<Site>): Observable<Site> {
        console.log(`Creating site at ${this.apiUrl} with data:`, siteData);
        return this.http.post<Site>(this.apiUrl, siteData).pipe(
            tap(newSite => console.log('Created site:', newSite)),
            catchError(this.handleError)
        );
    }

    /**
     * Updates an existing site by sending data to the backend API resource identifier route parameter.
     * @param id The primary auto-increment database row ID of the target site record.
     * @param siteData The updated dataset values payload.
     * @returns An Observable of the updated Site database layout state.
     */
    updateSite(id: number, siteData: Partial<Site>): Observable<Site> {
        console.log(`Updating site configuration at ${this.apiUrl}/${id} with data:`, siteData);
        return this.http.put<Site>(`${this.apiUrl}/${id}`, siteData).pipe(
            tap(updatedSite => console.log('Updated site output snapshot context:', updatedSite)),
            catchError(this.handleError)
        );
    }

    getSite(ptenantId: number, prodId: number): Observable<Site[]> {
        return this.http.get<Site[]>(`${this.apiUrl}/${ptenantId}/${prodId}`).pipe(
            catchError(this.handleError)
        );
    }

    getSites(ptenantId: number): Observable<Site[]> {
        return this.http.get<Site[]>(`${this.apiUrl}/${ptenantId}`).pipe(
            catchError(this.handleError)
        );
    }

    checkMobileNumberExists(ptenantId: number, mobileNo: string): Observable<boolean | null> {
        return of(true);
    }
}
