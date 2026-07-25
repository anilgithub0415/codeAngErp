// src/app/core/services/user-context.service.ts
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, switchMap, tap, map, distinctUntilChanged } from 'rxjs';
import { AuthService } from './auth.service'; // Your existing AuthService
import { UserService } from './user.service'; // Your existing Angular-side UserService
import { User } from '../models/user.model'; // Your User interface

@Injectable({
    providedIn: 'root'
})
export class UserContextService {
    private _currentUserProfile = new BehaviorSubject<User | null>(null);
    currentUserProfile$: Observable<User | null> = this._currentUserProfile.asObservable();
//private authService: AuthService,
private authService = inject(AuthService)
    constructor(
        
        private userService: UserService
    ) {
     
        // When auth state changes (e.g., user logs in/out), update the profile
        this.authService.isLoggedIn$.pipe(
           // distinctUntilChanged(), // <-- Add this operator
            switchMap(isLoggedIn => {
               // if(!isLoggedIn){console.log('*****user contexts say not logged in.')}
                if (isLoggedIn) { 
                
                    const userId = this.authService.getUserId(); // Get ID from auth service
                  
                  if(!userId){console.log('*****user context not finding userid')} else{
                  }
                    
                    if (userId) {
                  
                        
                        
                        return this.userService.getUser(userId); // Fetch full profile
                    }
              }
                return new Observable<null>(subscriber => subscriber.next(null)); // Not logged in, clear profile
            }),
          
            map(profile => {
                if(profile!.userTenantContexts![0].tenantId){
                profile!.tenantId=profile?.userTenantContexts![0].tenantId; //alert('contexttenantid now :'+profile?.tenantId)
     
                this._currentUserProfile.next(profile); // Update the BehaviorSubject

                }
            })
        )
        .subscribe(isLoggedIn=>{
          
            
        }); // Don't forget to subscribe!
    }

    // Method to manually refresh the profile if needed (e.g., after user updates their profile)
    refreshUserProfile(): void {
        const userId = this.authService.getUserId();
        if (userId) {
            this.userService.getUser(userId).subscribe(
               
                profile => this._currentUserProfile.next(profile),
                error => console.error('Error refreshing user profile:', error)
            );
        } else {
            console.log('*****_currentUserProfile filling null')
            this._currentUserProfile.next(null);
        }
    }
}