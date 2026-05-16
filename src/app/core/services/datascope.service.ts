
import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from './auth.service'; // Assuming AuthService provides tenantId, userId observables

@Injectable({
    providedIn: 'root'
})
export class DataScopeService {

    constructor(
        private permissionsService: NgxPermissionsService,
        private authService: AuthService
    ) { }

    /**
     * Constructs an API URL with appropriate query parameters based on the current user's view permissions.
     * This method is designed for filtering lists of users or other tenant-scoped data.
     *
     * @param basePath The base API path (e.g., '/api/users', '/api/courses').
     * @param permissionPrefix The prefix for view permissions (e.g., 'user.view.', 'course.view.').
     * This prefix will be combined with role names (e.g., 'user.view.Student').
     * @param allPossibleViewRoles An array of all possible roles that can be viewed by specific permissions
     * (e.g., ['Student', 'Faculty', 'Coordinator', 'InstituteAdmin']).
     * Include 'all' if you have a permission like 'user.view.all'.
     * Include 'createdBySelf' if you have a permission like 'user.view.createdBySelf'.
     * @returns An Observable of the constructed URL string.
     */
    getScopedListUrl(
        basePath: string,
        permissionPrefix: string,
        allPossibleViewRoles: string[] // e.g., ['Student', 'Faculty', 'Coordinator', 'InstituteAdmin', 'all', 'createdBySelf']
    ): Observable<string> {
            return combineLatest([
            this.permissionsService.permissions$, // Reactive to permission changes
            this.authService.activeTenantId$,     // Reactive to tenant changes
            this.authService.currentUserId$       // Reactive to user ID changes (for createdBySelf)
        ]).pipe(
            map(([permissionsMap, activeTenantId, currentUserId]) => { //tenantId,
                const queryParams: string[] = [];
                const allowedRoles: string[] = [];

                // 1. Always filter by tenantId if available and applicable
                // if (tenantId) {
                //     queryParams.push(`tenantId=${tenantId}`);
                // } else {
                //     // If no tenantId, and it's a tenant-scoped API, perhaps return a URL that yields no results
                //     // Or handle this as an error/unauthorized state.
                //     // For now, assume tenantId is always present for logged-in users in tenant-scoped views.
                //     console.warn('DataScopeService: Tenant ID not available for scoped URL construction.');
                //     return ''; // Return empty string, indicating no valid URL can be formed
                // }

                // 2. Check for general 'view.all' permission first
                if (permissionsMap[`${permissionPrefix}all`]) {
                    // If 'all' permission exists, no need for specific role filters.
                    // This assumes 'all' means all roles within the current tenant.
                    // If 'all' means across tenants, then tenantId filter needs to be conditional too.
                    // For this method, we assume all data is tenant-scoped.
                } else {
                    // 3. Check specific role-based view permissions
                    allPossibleViewRoles.forEach(role => {
                        // Ensure we don't accidentally add 'all' or 'createdBySelf' as a role filter
                        if (role !== 'all' && role !== 'createdBySelf' && permissionsMap[`${permissionPrefix}${role}`]) {
                            allowedRoles.push(role);
                        }
                    });

                    if (allowedRoles.length > 0) { 
                    
                        queryParams.push(`roles=${allowedRoles.join(',')}`);
                    }
                }

                // 4. Check for 'view.createdBySelf' permission
                // This typically means the user can only see records they created.
                // You need to decide if this is exclusive or additive with role filters.
                // For example, can a Faculty view all Students AND only the Faculty they created?
                // For simplicity, let's make it additive for now, meaning it adds an *additional* filter.
                if (permissionsMap[`${permissionPrefix}createdBySelf`] && currentUserId) {
                    queryParams.push(`createdByUserId=${currentUserId}`);
                }
                if(activeTenantId){
                    queryParams.push(`activeTenantId=${activeTenantId}`);
                }

                let url = basePath;
                if (queryParams.length > 0) {
                    url += `?${queryParams.join('&')}`;
                }
                return url;
            }),
            distinctUntilChanged(), // Only emit if the constructed URL string actually changes
            shareReplay(1) // Cache the last URL for multiple subscribers and late subscribers
        );
    }

    // You might also want methods for single item access (e.g., /api/users/:id)
    // where you check if the user has permission to view *that specific* item.
    // This would typically involve a backend check based on context.
}