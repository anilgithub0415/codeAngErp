// src/app/core/services/user-role.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private apiUrl = '/roles'; // Points to your newly designed roles router path

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

  createRole(roleData: any): Observable<any> {
    console.log(`Creating user role at ${this.apiUrl} with data:`, roleData);
    return this.http.post<any>(this.apiUrl, roleData).pipe(
      tap(newRole => console.log('Created role successfully:', newRole)),
      catchError(this.handleError)
    );
  }

  updateRole(roleName: string, roleData: any): Observable<any> {
    // encodeURIComponent safeguards composite string values containing whitespace keys
    const encodedRoleName = encodeURIComponent(roleName);
    console.log(`Updating role at ${this.apiUrl}/${encodedRoleName} with data:`, roleData);
    return this.http.put<any>(`${this.apiUrl}/${encodedRoleName}`, roleData).pipe(
      tap(updatedRole => console.log('Updated role successfully:', updatedRole)),
      catchError(this.handleError)
    );
  }

  getRole(ptenantId: number, roleName: string): Observable<any> {
    const encodedRoleName = encodeURIComponent(roleName);
    return this.http.get<any>(`${this.apiUrl}/${ptenantId}/${encodedRoleName}`).pipe(
      catchError(this.handleError)
    );
  }

  getRoles(ptenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${ptenantId}`).pipe(
      map((data: any) => {
        const roles = Array.isArray(data) ? data : [];
        return roles.map(r => ({
          tenantId: r.tenantId,
          rolename: r.rolename,
          description: r.description,
          isActive: r.isActive !== undefined ? r.isActive : true,
          rolePermissions: r.rolePermissions || []
        }));
      }),
      catchError(this.handleError)
    );
  }

  deleteRole(ptenantId: number, roleName: string): Observable<any> {
    const encodedRoleName = encodeURIComponent(roleName);
    return this.http.delete<any>(`${this.apiUrl}/${ptenantId}/${encodedRoleName}`).pipe(
      catchError(this.handleError)
    );
  }
}
