// src/app/core/services/role-permission.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; 
import { CreateRolePermissionDto,RolePermission } from '../models/role-permission.model';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {

    private apiUrl = '/rolePermission'; // Maps to your backend RolePermission Express entry mount point

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
     * Strict POST Route Link mapping to assign a permission to a role
     */
    assignPermissionToRole(mappingData: CreateRolePermissionDto): Observable<RolePermission> {
        console.log(`Assigning role permission at ${this.apiUrl} with data:`, mappingData);
        return this.http.post<RolePermission>(this.apiUrl, mappingData).pipe(
            tap(newMap => console.log('Assigned permission to role successfully:', newMap)),
            catchError(this.handleError)
        );
    }

    /**
     * Strict DELETE Route Link mapping to revoke a permission from a role
     */
    revokePermissionFromRole(roleName: string, permissionName: string): Observable<{ message: string }> {
        const targetUrl = `${this.apiUrl}/${encodeURIComponent(roleName)}/${encodeURIComponent(permissionName)}`;
        console.log(`Revoking permission from role at address endpoint context: ${targetUrl}`);
        return this.http.delete<{ message: string }>(targetUrl).pipe(
            tap(() => console.log(`Revoked permission [${permissionName}] from role [${roleName}] successfully`)),
            catchError(this.handleError)
        );
    }

    /**
     * GET Route Link mapping to fetch all current permission rows bound to an explicit role
     */
    getPermissionsByRole(ptenantId: number, roleName: string): Observable<RolePermission[]> {
        return this.http.get<RolePermission[]>(`${this.apiUrl}/${ptenantId}/${encodeURIComponent(roleName)}`).pipe(
            map((data: any) => {
                const mappings = Array.isArray(data) ? data : [];
                return mappings.map(m => ({
                    tenantId: m.tenantId,
                    roleName: m.roleName,
                    permissionName: m.permissionName,
                    permission: m.permission
                }));
            }),
            catchError(this.handleError)
        );
    }

    /**
     * GET Route Link mapping to fetch the absolute total assignment matrix layers under a tenant namespace
     */
    getAllRolePermissions(ptenantId: number): Observable<RolePermission[]> {
        return this.http.get<RolePermission[]>(`${this.apiUrl}/${ptenantId}`).pipe(
            map((data: any) => {
                const mappings = Array.isArray(data) ? data : [];
                return mappings.map(m => ({
                    tenantId: m.tenantId,
                    roleName: m.roleName,
                    permissionName: m.permissionName
                }));
            }),
            catchError(this.handleError)
        );
    }
}
