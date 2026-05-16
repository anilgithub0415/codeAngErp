import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs'; 
import { map, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from './auth.service';

export type AppUserRole = 'InstituteAdmin' | 'Teacher' | 'Student' | 'TeacherAdmin' | 'StudentSolo' | 'SharedAccessTeacher' | 'Assessor';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  
  private _userRoles = new BehaviorSubject<AppUserRole[]>([]);
  public userRoles$: Observable<AppUserRole[]> = this._userRoles.asObservable();

  constructor(private authService: AuthService) {
      combineLatest([
          this.authService.isLoggedIn$,
          this.authService.currentUserRole$ // Use the observable from AuthService
      ]).pipe(
          distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
          map(([isLoggedIn, role]) => {
              if (isLoggedIn && role) {
                  return [role as AppUserRole]; // Cast to AppUserRole
              } else {
                  return [];
              }
          })
      ).subscribe(roles => {
          this._userRoles.next(roles);
          console.log('RoleService: User roles updated to:', roles);
      });
  }

  hasRole(role: AppUserRole): Observable<boolean> {
      return this.userRoles$.pipe(
          map(roles => roles.includes(role)),
          distinctUntilChanged()
      );
  }

  hasAnyRole(roles: AppUserRole[]): Observable<boolean> {
      return this.userRoles$.pipe(
      
          map(userCurrentRoles => roles.some(r => userCurrentRoles.includes(r))),
          distinctUntilChanged()
      );
  }
}
