import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { CreateProgramDto, Program, UpdateProgramDto} from '../models/program';
// No need for InventoryStatus here, that was from the product example


@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private apiUrl = '/program';

  constructor(private http: HttpClient) { }

  /**
   * Handles HTTP errors from API calls.
   * @param error The HttpErrorResponse.
   * @returns An Observable that throws an error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
          // Client-side or network error occurred.
          console.error('Client-side error:', error.error.message);
          errorMessage = `Network error: ${error.error.message}`;
      } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(
              `Backend returned code ${error.status}, ` +
              `body was: ${JSON.stringify(error.error)}`);
          errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
      }
      // Return an observable with a user-facing error message.
      return throwError(() => new Error(errorMessage));
  }

  
  /**
   * Creates a new Program. The `CreateProgramDto` ensures we are sending the correct data.
   * @param programDto The data for the new program.
   * @returns An Observable of the created Program.
   */
  createProgram(programDto: CreateProgramDto): Observable<Program> {
    return this.http.post<Program>(this.apiUrl, programDto).pipe(
      tap(newProgram => console.log('Created program:', newProgram)),
      catchError(this.handleError)
    );
  }

  /**
   * Updates an existing Program. The `UpdateProgramDto` allows for partial updates.
   * @param id The ID of the program to update.
   * @param programDto The partial data for the program.
   * @returns An Observable of the updated Program.
   */
  updateProgram(id: number, programDto: UpdateProgramDto): Observable<Program> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Program>(url, programDto).pipe(
      tap(updatedProgram => console.log('Updated program:', updatedProgram)),
      catchError(this.handleError)
    );
  }
  deleteProgram(id: number ): Observable<Program> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Program>(url).pipe(
      tap(deletedProgram => console.log('Deleted program:',deletedProgram)),
      catchError(this.handleError)
    );
  }
  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getPrograms(ptenanId:string): Observable<Program[]> {
      var url=this.apiUrl+'/0/ptenantId/'+ptenanId;
      
      return this.http.get<Program[]>(url).pipe(
       
          catchError(this.handleError)
      );
  }
//byIdOrPersonId:'byId' | 'byPersonId'
  getById(id: number, activeTenantId:string): Observable<Program|null> { 
    console.log('yes its executing.....................................');
    
    const params = new HttpParams().set('activeTenantId',activeTenantId);

   
    return this.http.get<Program>(`${this.apiUrl}/${id}`, { params })       
    
    
}

  // /**
  //  * Retrieves users using a pre-constructed API URL.
  //  * This is the method that DataScopeService will interact with.
  //  * @param url The full API URL including query parameters.
  //  * @returns An Observable of an array of UserBackendModel.
  //  */
  // getUsersByUrl(url: string): Observable<User[]> {
  //     return this.http.get<User[]>(url);
  // }
  // /**
  //  * Fetches a single user by their ID.
  //  * @param id The ID of the user to fetch.
  //  * @returns An Observable of a single User object.
  //  */
  // getUser(id: number): Observable<User> { 
  //     const url = `${this.apiUrl}/${id}`;
  //     return this.http.get<User>(url).pipe(
  //         tap(user => console.log('Fetched single user:', user)),
  //         catchError(this.handleError)
  //     );
  // }

  // /**
  //  * Creates a new user by sending data to the backend API.
  //  * @param userData The data for the new user (CreateUserDto).
  //  * @returns An Observable of the created User object (including its new ID).
  //  */
  // createUser(userData: CreateUserDto): Observable<User> {
  //     console.log(`Creating user at ${this.apiUrl} with data:`, userData);
  //     return this.http.post<User>(this.apiUrl, userData).pipe(
  //         tap(newUser => console.log('Created user:', newUser)),
  //         catchError(this.handleError)
  //     );
  // }

  // /**
  //  * Updates an existing user by sending partial data to the backend API.
  //  * @param id The ID of the user to update.
  //  * @param updateData The partial data for the user (UpdateUserDto).
  //  * @returns An Observable of the updated User object.
  //  */
  // updateUser(id: number, updateData: UpdateUserDto): Observable<User> {
  //     const url = `${this.apiUrl}/${id}`;
  //      return this.http.put<User>(url, updateData).pipe(
  //       //  tap(updatedUser => console.log('Updated user:', updatedUser)),
  //         catchError(this.handleError)
  //     );
  // }

  // /**
  //  * Deletes a user by their ID.
  //  * @param id The ID of the user to delete.
  //  * @returns An Observable that completes upon successful deletion (or throws an error).
  //  */
  // deleteUser(id: number): Observable<void> {
  //     const url = `${this.apiUrl}/${id}`;
  //     console.log(`Deleting user from ${url}`);
  //     return this.http.delete<void>(url).pipe(
  //         tap(() => console.log(`Deleted user with ID: ${id}`)),
  //         catchError(this.handleError)
  //     );
  // }
}
