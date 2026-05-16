
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core'; // Import the inject function
import { AuthService } from '../services/auth.service'; // Adjust path as needed
import { map, take, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { RoleService } from '../services/role.service';

// Define your user roles (ensure this matches your backend's UserRoleLookup.rolename values)
export type AppUserRole = 'InstituteAdmin' | 'Teacher' | 'Student' | 'TeacherAdmin' | 'StudentSolo' | 'SharedAccessTeacher' | 'Assessor';

export const roleGuard: CanActivateFn = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot): Observable<boolean | UrlTree> => 
{
    const authService = inject(AuthService);
    const roleService = inject(RoleService); // Inject the RoleService
    const router = inject(Router);

    const requiredRoles = route.data['roles'] as AppUserRole[];

    if (!requiredRoles || requiredRoles.length === 0) {
        console.warn('RoleGuard: No roles defined for this route. Access granted by default.');
       // return of(true); // Use 'of' for immediate observable emission
       return of<boolean>(true);
    }

    // First, check if the user is logged in.
    return authService.isLoggedIn$.pipe(
        take(1), // Take the current login status
        switchMap(isLoggedIn => {
            if (!isLoggedIn) {
                console.log('RoleGuard: User not logged in. Redirecting to login.');
               // return of(router.createUrlTree(['/auth/login']));
               return of<UrlTree>(router.createUrlTree(['/auth/login']));
            }


            // If logged in, then use RoleService to check for roles.
            return roleService.hasAnyRole(requiredRoles).pipe(
                take(1), // Take the current role check result
                map(hasRequiredRole => {
                    if (hasRequiredRole) {
                     
                        return true;
                    } else {
                        console.warn(`RoleGuard: Access denied. User does not have any of the required roles: ${requiredRoles.join(', ')}. Redirecting to unauthorized.`);
                        return router.createUrlTree(['/unauthorized']);
                    }
                })
            );
        })
    );
};