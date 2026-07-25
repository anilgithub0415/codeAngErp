// src/app/core/services/permission.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; 
import { CreatePermissionDto,Permission } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

    private apiUrl = '/permission';

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

    /**
     * Strict POST Route Link mapping to createPermissionClean on the backend
     */
    createPermission(permissionData: Partial<CreatePermissionDto>): Observable<Permission> {
        console.log(`Creating permission at ${this.apiUrl} with data:`, permissionData);
        return this.http.post<Permission>(this.apiUrl, permissionData).pipe(
            tap(newPerm => console.log('Created permission successfully:', newPerm)),
            catchError(this.handleError)
        );
    }

    /**
     * Strict PUT Route Link mapping to updatePermission on the backend
     */
    updatePermission(id: number, permissionData: Partial<CreatePermissionDto>): Observable<Permission> {
        console.log(`Updating permission at ${this.apiUrl}/${id} with data:`, permissionData);
        return this.http.put<Permission>(`${this.apiUrl}/${id}`, permissionData).pipe(
            tap(updatedPerm => console.log('Updated permission successfully:', updatedPerm)),
            catchError(this.handleError)
        );
    }

    getPermission(ptenantId: number, permId: number): Observable<Permission> {
        return this.http.get<Permission>(`${this.apiUrl}/${ptenantId}/${permId}`);
    }

    getPermissions(ptenantId: number): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${this.apiUrl}/${ptenantId}`).pipe(
            map((data: any) => {
                const permissions = Array.isArray(data) ? data : [];
                return permissions.map(p => ({
                    id: p.id,
                    permissionName: p.permissionName,
                    description: p.description,
                    isActive: p.isActive !== undefined ? p.isActive : true,
                    tenantId: p.tenantId
                }));
            }),
            catchError(this.handleError)
        );
    }
}
