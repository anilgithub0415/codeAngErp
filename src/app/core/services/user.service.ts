// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable, throwError } from 'rxjs';
// import { catchError, tap, map } from 'rxjs/operators';
// import { CreateUserDto, User } from '../models/user.model'; // Verify this path matches your structure

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {

//     // Base URL for User API endpoints matching backend architecture
//     private apiUrl = '/user';

//     constructor(private http: HttpClient) { }

//     /**
//      * Handles HTTP errors from API calls.
//      * @param error The HttpErrorResponse.
//      * @returns An Observable that throws an error.
//      */
//     private handleError(error: HttpErrorResponse): Observable<never> {
//         let errorMessage = 'An unknown error occurred!';
//         if (error.error instanceof ErrorEvent) {
//             // Client-side or network error occurred.
//             console.error('Client-side error:', error.error.message);
//             errorMessage = `Network error: ${error.error.message}`;
//         } else {
//             // The backend returned an unsuccessful response code.
//             console.error(
//                 `Backend returned code ${error.status}, ` +
//                 `body was: ${JSON.stringify(error.error)}`);
//             errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
//         }
//         return throwError(() => new Error(errorMessage));
//     }

//     /**
//      * Creates a new clean user context by sending validated data to the backend API.
//      * @param userData The payload layout configuration data for the new user (CreateUserDto).
//      * @returns An Observable of the created User object structure.
//      */
//     createUserClean(userData: Partial<CreateUserDto>): Observable<User> {
//         console.log(`Creating user at ${this.apiUrl} with data:`, userData);
//         return this.http.post<User>(this.apiUrl, userData).pipe(
//             tap(newUser => console.log('Created user setup tracking:', newUser)),
//             catchError(this.handleError)
//         );
//     }

//      getUser(id: number): Observable<User> { 
        
        
//         const url = `${this.apiUrl}/${id}`;
//         return this.http.get<User>(url).pipe(
//             tap(user => {}),
//             catchError(this.handleError)
//         );
//     }
//     /**
//      * Fetches user context datasets based on target Tenant ID constraints.
//      * @param ptenantId The isolated partition namespace identification tracker.
//      */
//     getUsers(ptenantId: number): Observable<User[]> {
//     return this.http.get<User[]>(`${this.apiUrl}/${ptenantId}`).pipe(
//       map((data: any) => {
//         const users = Array.isArray(data) ? data : [];
//         return users.map(v => ({
//           id: v.id || v.userId,
//           tenantId: v.tenantId,
//           tenant: v.tenant, // 👈 Explicitly bind the required tenant relation object here
//           userName: v.userName,displayName:v.displayName,clientId:v.clientId,siteId:v.siteId,
//           userAbbrevation: v.userAbbrevation,
//           firstName: v.firstName,
//           lastName: v.lastName,
//           contactEmail: v.contactEmail,
//           contactPhone: v.contactPhone,
//           initialRoleName: v.initialRoleName,
//           deviceInfo: v.deviceInfo
//         }));
//       }),
//       catchError(this.handleError)
//     );
// }
//  getUserRoles(): Observable<string[]> { // Or Observable<EnumOption[]> if backend sends label/value
//         return this.http.get<string[]>(`${this.apiUrl}/roles`).pipe(
//           //  tap(roles => console.log('Fetched user roles:', roles)),
//             catchError(this.handleError)
//         );
//     }

// getUsersByUrl(url: string): Observable<User[]> {
//       return this.http.get<User[]>(url);
//    }

//     /**
//      * Sends a PUT request to update an existing User record mapping configuration.
//      * @param id The auto-increment target entity database primary key ID.
//      * @param userData The partial update dataset layout modifications snapshot.
//      */
//     updateUser(id: number, userData: Partial<CreateUserDto>): Observable<User> {
//         console.log(`Updating user configuration at ${this.apiUrl}/${id} with data:`, userData);
//         return this.http.put<User>(`${this.apiUrl}/${id}`, userData).pipe(
//             tap(updatedUser => console.log('Successfully updated user dataset instance:', updatedUser)),
//             catchError(this.handleError)
//         );
//     }

//     /**
//      * Triggers a DELETE transaction operation against the backend entity API.
//      * @param id The target user identification context stamp tracking token.
//      */
//     removeUser(id: number): Observable<any> {
//         console.log(`Requesting user removal transaction routing at ${this.apiUrl}/${id}`);
//         return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
//             tap(() => console.log(`Successfully completed deletion processing engine sequences for ID: ${id}`)),
//             catchError(this.handleError)
//         );
//     }
// }
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { CreateUserDto, User } from '../models/user.model'; 

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/user';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  createUserClean(userData: Partial<CreateUserDto>): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData).pipe(
      catchError(this.handleError)
    );
  }

  getUser(id: number): Observable<User> { 
   
    
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  getUsers(ptenantId: number): Observable<User[]> { console.log('url for users:',`${this.apiUrl}/${ptenantId}`);
    return this.http.get<any[]>(`${this.apiUrl}/${ptenantId}`).pipe(
      map((data: any) => { 
        const users = Array.isArray(data) ? data : [];
        return users.map(v => ({
          id: v.id || v.userId,
          tenantId: v.tenantId,
          tenant: v.tenant, 
          userName: v.userName,
          displayName: v.displayName,
          clientId: v.clientId,
          siteId: v.siteId,
          userAbbrevation: v.userAbbrevation,
          firstName: v.firstName,
          lastName: v.lastName,
          contactEmail: v.contactEmail,
          contactPhone: v.contactPhone,
          // 👈 Maps the incoming backend database array to satisfy the User interface
          assignedRoles: v.assignedRoles || (v.initialRoleName ? [v.initialRoleName] : []),
          deviceInfo: v.deviceInfo
        }));
      }),
      catchError(this.handleError)
    );
  }


  getUserRoles(): Observable<string[]> { 
    return this.http.get<string[]>(`${this.apiUrl}/roles`).pipe(
      catchError(this.handleError)
    );
  }

  getUsersByUrl(url: string): Observable<User[]> {
    return this.http.get<User[]>(url);
  }

  updateUser(id: number, userData: Partial<CreateUserDto>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData).pipe(
      catchError(this.handleError)
    );
  }

  removeUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
