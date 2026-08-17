
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Import jwt-decode
import { jwtDecode } from 'jwt-decode';
import { UrlTree } from '@angular/router';

import { NgxPermissionsService } from 'ngx-permissions'; 
import { LayoutService } from '../../layout/service/layout.service';
import { TenantType } from '../models/tenant.model';
// Define the structure of your JWT payload (claims)
// Ensure these property names match exactly what your backend embeds in the JWT.
interface JwtPayload {
    userId: number; // IMPORTANT: Ensure this matches your backend's JWT payload type
    userName: string; // Typically the user's email
    role: any;     // The user's role (e.g., 'InstituteAdmin', 'Teacher', 'Student')
    tenantId?: number // The ID of the currently active tenant (if applicable for context switching)
    permissions: string[];
    exp?: number;     // Expiration timestamp (seconds since epoch)
    iat?: number;     // Issued at timestamp
    // Add any other custom claims your JWT includes (e.g., 'displayName', 'profilePictureUrl')
    availableContexts?:any;
}

// Interface for the *response* from your backend's login/refresh/register endpoints
// This defines the structure of the JSON object you expect to receive.
interface TokenResponse {
    access_token: string;
    token_type?: string;
    expires_in?: number; // Lifetime in seconds (often from backend, e.g., 3600 for 1 hour)
    exp?: number; // Expiration timestamp (if backend directly provides JWT 'exp' claim, e.g., 1678886400)
    refresh_token?: string;
    siteId:number,clientId:number;permissions:any[],
    message?: string; // For login/registration failure messages from backend
    userId?:number;
    tenantId?:string;
    availableContexts?:any;
    // userId is typically extracted from the JWT payload, not directly in the TokenResponse body,
    // but if your backend sends it directly in the response body, keep it.
    // However, it's safer to rely on JWT payload for user details.
    // If your backend *does* send userId in the response body, ensure its type matches JwtPayload.userId
    // userId?: number; // Changed to number to match JwtPayload, made optional as it's often from JWT
}
interface userTenantContext{
    UserId:any;
    TenantId:any;
    RoleName:any;
}
// Define the structure for a single available context (must match backend)
interface AvailableContext {
    displayName:string;
    tenantId: number;
    tenantName: string;tenantType:string;
    roleName: string;
    permissions: string[];
}
// DTO for the combined registration and initial subscription process
interface RegisterAndSubscribeDto {
    userName: string; // Email
    password: string;
    displayName: string;
    tenantName: string;
    tenantType: string; // String value from lookup table
    subscriptionPlan: string; // String value from lookup table
    [key: string]: any; // Allows for additional dynamic fields
}


// Define the JWT Payload structure for the initial global login token (must match backend)
interface InitialJwtPayload {
    userId: number;displayName:string;
    userName: string;
    availableContexts: AvailableContext[];
    exp: number; // Expiration timestamp
    iat: number; // Issued at timestamp
}

// Define the JWT Payload structure for the context-specific access token (will be used after context selection)
interface ContextSpecificJwtPayload {
    userId: number;
    userName: string;
    tenantId: number;
    roleName: string;
    permissions: string[];
    exp: number; // Expiration timestamp
    iat: number; // Issued at timestamp
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private _siteId = new BehaviorSubject<number | null>(null);
private _clientId = new BehaviorSubject<number | null>(null);

    private contextsCache: AvailableContext[] | null = null;

    private authToken: string | null = null;
    private tokenExpiryTimestamp: number | null = null; // Seconds since epoch
    
    private readonly USER_ID_KEY = 'user_id';
    private readonly ACTIVE_CONTEXT_KEY = 'active_context'; // New key to store the selected context

    // BehaviorSubject to reactively manage and emit the current login status.
    private _isLoggedIn = new BehaviorSubject<boolean>(this.hasAuthToken());//earlier was checkInitialLoginStatus or this.hasAuthToken()
    public isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();
    // Add a BehaviorSubject for the user's role
    private _currentUserRole = new BehaviorSubject<string | null>(null);
    public currentUserRole$: Observable<string | null> = this._currentUserRole.asObservable();
 
   private _activeTenantId = new BehaviorSubject<number | null>(null);

    public activeTenantId$: Observable<number | null> = this._activeTenantId.asObservable();

    private _currentUserId = new BehaviorSubject<number | null>(this.getUserId());
    public currentUserId$: Observable<number | null> = this._currentUserId.asObservable();
   
    
    // BehaviorSubject to hold the currently active context
// 1. Initialize cleanly with a starting value of null
private _activeContext = new BehaviorSubject<AvailableContext | null>(null);
public activeContext$ = this._activeContext.asObservable();


    constructor(private http: HttpClient,private permissionsService: NgxPermissionsService , private layoutService:LayoutService) {
        this.loadActiveContext();
        // When the service is created, attempt to load tokens from localStorage
        // and set the initial authentication state.
        this.authToken = localStorage.getItem('mytoken');
        const expiry = localStorage.getItem('tokenExpiry');
        if (expiry) {
            this.tokenExpiryTimestamp = parseInt(expiry, 10);
        }
        // IMPORTANT: Call isLoggedIn() to set the initial state of the BehaviorSubject
        // This ensures that when any component subscribes to isLoggedIn$, it gets the correct initial status.
        
        this._isLoggedIn.next(this.isLoggedIn());

         this._activeTenantId.next(this.getTenantId());
         // After setting initial login status, also set initial role
        this.updateCurrentUserRoleAndPermissions();//updateCurrentUserRoleAndPermissions

        // You might want to update the role whenever auth state changes
        // Example: If you have an onAuthStateChanged listener or similar
        // this.authService.onAuthStateChanged(...).subscribe(() => this.updateCurrentUserRole());
    

    }
// Inside your AuthService class file:

/**
 * Public method to safely toggle the login state from external components
 */
public setLoginStatus(isLoggedIn: boolean): void {
  this._isLoggedIn.next(isLoggedIn);
}

    /**
     * Checks the initial login status based on tokens in localStorage.
     * This is called internally by the constructor and isLoggedIn() method.
     */
    private checkInitialLoginStatus(): boolean {
        const token = localStorage.getItem('mytoken');
        const expiry = localStorage.getItem('tokenExpiry');
        if (!token || !expiry) {
            return false;
        }
        const expiryTimestamp = parseInt(expiry, 10);
        const now = Math.floor(Date.now() / 1000);
        
        return now < expiryTimestamp;
    }

    /**
     * Handles user login.
     * @param userName The user's username (email).
     * @param password The user's password.
     * @returns An Observable of the TokenResponse from the backend.
     */
    login(userName: string, password: string): Observable<TokenResponse> {
         // Clear old state before proceeding with the new authentication
    
        // localStorage.removeItem(this.ACTIVE_CONTEXT_KEY);

    this.saveActiveContext(null);
    
        return this.http.post<TokenResponse>('/login', { userName, password }).pipe(
            tap((response: TokenResponse) => {

              
                                const initialContext = response.availableContexts[0];
                                this._activeContext.next({
                                    displayName: initialContext.displayName || initialContext.userName, // Fallback if missing
                                    roleName: initialContext.roleName,
                                    tenantName: initialContext.tenantName,tenantType:initialContext.tenantType,tenantId: parseInt(initialContext.tenantId!), permissions:initialContext.permissions
                                });


console.log('.........logiin in with ...initialContext:',initialContext);

                if (response && response.access_token) {

                   // console.log('seeting userId ',response.userId,'with key and response is......................: ',response.availableContexts);                    
                    //added
                    this.setUserId(response.userId!);

this.setSiteId(response.siteId);
this.setClientId(response.clientId);


                  //  console.log('.......................................first login  refresh_token:',response.refresh_token);
//console.log('............response.tenantid:',response.tenantId);

                    //added
                    this._currentUserRole.next(response.availableContexts[0].roleName);
                    console.log('just looggeed in setting activecontext');
                    
                    //this.setActiveContext(response.availableContexts)
                    //end added

                    this.setAuthToken(response.access_token);
                    console.log('setted authtoken...................................');
                    
                    this.setRefreshToken(response.refresh_token);
                      //combinined permissions are in response.permissions , 
                      //context now have permission of one role but we need combined permissions
                    //  console.log('..................one role permissions are:',response.availableContexts[0].permissions);
                      
                      response.availableContexts[0].permissions=response.permissions;

                    //  console.log('..................combined permissions are:',response.availableContexts[0].permissions);
                      //end 
                //     //added
                    this.saveActiveContext(response.availableContexts[0]);
                     
                     console.log(' m in authservice caling loadUserPreferences with userId:',response.userId);
                     
                     
                  //read userpreferences from DB
                //3.//  this.layoutService.loadUserPreferences(parseInt(response.tenantId!),response.userId!);
                   
                    

                    
   //
  // if (this._isLoggedIn.getValue() !== true) {
      // 2.//  this._isLoggedIn.next(true); // Update login status via BehaviorSubject  
  // }

  console.log('isLoggedIn true');
  
                    if (typeof response.expires_in === 'number') {
                        this.tokenExpiryTimestamp = Math.floor(Date.now() / 1000) + response.expires_in;
                    } else if (typeof response.exp === 'number') {
                        this.tokenExpiryTimestamp = response.exp; // 'exp' is already a timestamp
                    } else {
                        console.warn('AuthService: No valid expiry information (expires_in or exp) provided in token response for login. Setting a default short expiry.');
                        // Fallback to 1 hour if no expiry is provided by backend
                        this.tokenExpiryTimestamp = Math.floor(Date.now() / 1000) + 3600;
                    }
                    localStorage.setItem('tokenExpiry', this.tokenExpiryTimestamp.toString());
                 
                   // this.updateCurrentUserRoleAndPermissions();

                } else if (response && response.message) {
                    console.log('Login failed:', response.message);
                    throw new Error(response.message);
                } else {
                    console.log('Login failed: Unknown response');
                    throw new Error('Login failed: Unknown response from server.');
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Login HTTP error:', error);
                this.clearAuthToken(); // Use the consistent clearAuthTokens()
          
           if (this._isLoggedIn.getValue() !== false) {
         
                this._isLoggedIn.next(false);
           }
                let errorMessage = 'Login failed. Please check your credentials.';
                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error.status === 401) {
                    errorMessage = 'Invalid username or password.';
                }
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    // Add this helper method inside your AuthService class
public evaluateAndSetContext(contexts: any[]): { shouldShowDialog: boolean, availableContexts?: any[] } {
  if (contexts && contexts.length > 1) {
    return { shouldShowDialog: true, availableContexts: contexts };
  } else if (contexts && contexts.length === 1) {
    this.setActiveContext(contexts[0]).subscribe({
      next: () => console.log('Auto-selected single context.'),
      error: (err) => {
        console.error('Auto-selection failed:', err);
        this.logout(this.getRefreshToken());
      }
    });
    return { shouldShowDialog: false };
  } else {
    console.warn('No contexts found after login.');
    this.logout(this.getRefreshToken());
    return { shouldShowDialog: false };
  }
}

    /**
     * Handles user registration and initial tenant/subscription creation.
     * @param registerDto The combined registration and subscription data.
     * @returns An Observable of the TokenResponse (if auto-login on success) or a success message.
     */
    registerAndSubscribe(registerDto: RegisterAndSubscribeDto): Observable<any> {
        
      //  localStorage.removeItem(this.ACTIVE_CONTEXT_KEY); this._activeContext.next(null); alert('_activecontext made null')

        console.log('..............................................................trying to registerandsubscribe');
        return this.http.post<any>('/login/register-and-subscribeAtomic', registerDto).pipe(
            tap((response: any) => {
             
                console.log('..............................................................tap after registerandsubscribe');
                

                if (response && response.access_token) {
                    //added
                    console.log('seeting userId ',response.userId,'with key ');                    
                    //added
                    this.setUserId(response.userId!);
                    
                    this.setAuthToken(response.access_token);
                    this.setRefreshToken(response.refresh_token);

                    if (typeof response.expires_in === 'number') {
                        this.tokenExpiryTimestamp = Math.floor(Date.now() / 1000) + response.expires_in;
                    } else if (typeof response.exp === 'number') {
                        this.tokenExpiryTimestamp = response.exp;
                    } else {
                        console.warn('AuthService: No valid expiry information (expires_in or exp) provided in registration response. Setting a default short expiry.');
                        // Fallback to 1 hour if no expiry is provided by backend
                        this.tokenExpiryTimestamp = Math.floor(Date.now() / 1000) + 3600;
                    }
                    localStorage.setItem('tokenExpiry', this.tokenExpiryTimestamp!.toString());
                  
                 //  if (this._isLoggedIn.getValue() !== true) {
                    this._isLoggedIn.next(true); // Update login status
                  
                 //  }
                    this.updateCurrentUserRoleAndPermissions();
                 
                    console.log('...After get response in register i got below');

                    console.log('response:',response);
                    

                    //console.log('response.tenantId:',response.tenantId,' , response.tenantName:',response.tenantName,' , ',response.tenantType);
                    


                    // after registration loadContext 
                            
                            //---------------------------added 3 Sept 2025 ---------------------
                            const selectedContextFromResponse: AvailableContext = {
                                tenantId: response.availableContexts[0].tenantId,
                                tenantName: response.availableContexts[0].tenantName,
                                tenantType: response.availableContexts[0].tenantType,// 'INDIVIDUAL_STUDENT',// response.tenantType, // no 
                                roleName: response.availableContexts[0].roleName,
                                permissions: response.availableContexts[0].permissions, 
                                //added
                        displayName:response.displayName,//no
                            };
                        
                        
            
                            
                            this.saveActiveContext(selectedContextFromResponse);

                            //end added 3 sept 2025-------------------------------------------------

                } else {
                    console.warn('AuthService: Access token NOT found in registration response or response is null/undefined.', response);
                    throw new Error(response?.message || 'Access token missing from registration response.');
                }
            }),
            catchError((error: HttpErrorResponse) => {
               
                this.clearAuthToken(); // Use the consistent clearAuthTokens()
                
                if (this._isLoggedIn.getValue() !== false) {
                this._isLoggedIn.next(false);
                }
                let errorMessage = 'Registration failed. Please try again.';
                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error.status === 409) {
                    errorMessage = 'Email already registered. Please try logging in.';
                }
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    /**
     * Logs out the user by clearing tokens and sending a request to the backend.
     * @param refreshToken The refresh token to invalidate on the backend.
     * @returns An Observable for the logout request.
     */
    logout(refreshToken: string | null): Observable<any> {
         this.clearAuthToken(); // Clear frontend tokens immediately
         this.contextsCache = null;
        // Send logout request to backend to invalidate refresh token
        return this.http.put('/login', { refreshToken: refreshToken }).pipe(
            tap(() => console.log('Backend logout successful')),
            catchError((error) => {
                console.error('Backend logout failed:', error);
                // Even if backend logout fails, frontend tokens are already cleared.
                return throwError(() => new Error('Logout failed on server.'));
            })
        );
    }

    private setUserId(userId: number): void {
                
        localStorage.setItem(this.USER_ID_KEY, userId.toString());
    }

    /**
     * Retrieves the stored access token from localStorage.
     */
    getAuthToken(): string | null {
        return localStorage.getItem('mytoken');
    }

    setSiteId(siteId: number): void {
    if (siteId) {
        localStorage.setItem('siteId', siteId.toString());
        this._siteId.next(siteId);
    }
}

setClientId(clientId: number): void {
    if (clientId) {
        localStorage.setItem('clientId', clientId.toString());
        this._clientId.next(clientId);
    }    
}


getSiteId(): number | null {
    const siteId = localStorage.getItem('siteId');
    return siteId ? parseInt(siteId, 10) : this._siteId.getValue();
}

getClientId(): number | null {
    const clientId = localStorage.getItem('clientId');
    return clientId ? parseInt(clientId, 10) : this._clientId.getValue();
}


    /**
     * Stores the access token in memory and localStorage.
     */
    setAuthToken(token: string): void {
        this.authToken = token;
        localStorage.setItem('mytoken', token);
       
    //   if (this._isLoggedIn.getValue() !== true) {
        this._isLoggedIn.next(true);
      // }
    }

    /**
     * Stores the refresh token in localStorage.
     */
    setRefreshToken(refreshToken: string | undefined): void {
        localStorage.setItem('refreshToken', refreshToken || '');
    }

    /**
     * Retrieves the stored refresh token from localStorage.
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    /**
     * Clears all authentication-related tokens from memory and local storage.
     * Also updates the public login status observable.
     */
    clearAuthToken(): void { // Renamed to clearAuthTokens (plural) for consistency
        this.authToken = null;
        this.tokenExpiryTimestamp = null;
        localStorage.removeItem('mytoken');
        localStorage.removeItem('siteId');
        localStorage.removeItem('clientId');
        this._siteId.next(null);               // 👈 ADDED
    this._clientId.next(null); localStorage.removeItem('user_permissions'); localStorage.removeItem('tenant_id');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(this.USER_ID_KEY);
        localStorage.removeItem(this.ACTIVE_CONTEXT_KEY); 
        
        this._isLoggedIn.next(false); // Update login status via BehaviorSubject
       
        this._currentUserRole.next(null);
        this.permissionsService.flushPermissions(); 
        this._activeTenantId.next(null);
        this._currentUserId.next(null);
    }

    /**
     * Attempts to refresh the access token using the refresh token.
     * @returns An Observable of the new TokenResponse.
     */
    refreshToken(): Observable<TokenResponse> {
        const refreshToken = this.getRefreshToken();

        console.log('refreshing refreshtoken:',refreshToken);
        
        if (!refreshToken) {
            this.clearAuthToken();
            return throwError(() => new Error('No refresh token available. Please log in again.'));
        }

        return this.http.post<TokenResponse>('/token/refresh-token', { refreshToken }).pipe(
            tap((response: TokenResponse) => {
                if (response.access_token) {
                    this.setAuthToken(response.access_token);
                    if (response.refresh_token) {
                        localStorage.setItem('refreshToken', response.refresh_token);
                    }
                    if (typeof response.expires_in === 'number') {
                        this.tokenExpiryTimestamp = Math.floor(Date.now() / 1000) + response.expires_in;
                    } else if (typeof response.exp === 'number') {
                        this.tokenExpiryTimestamp = response.exp;
                    } else {
                        console.warn('AuthService: No valid expiry information (expires_in or exp) provided in refresh token response. Setting a default short expiry.');
                        this.tokenExpiryTimestamp = Math.floor(Date.now() / 1000) + 3600; // Default to 1 hour
                    }
                    localStorage.setItem('tokenExpiry', this.tokenExpiryTimestamp.toString());
                    //
                  //  if (this._isLoggedIn.getValue() !== true) {
                    this._isLoggedIn.next(true); // Update login status
                    
                   // }
                    this.updateCurrentUserRoleAndPermissions();
                } else {
                    throw new Error('Refresh token response missing access token.');
                }
            }),
            catchError((error) => {
                console.error('Refresh token failed:', error);
                this.clearAuthToken();
              
              if (this._isLoggedIn.getValue() !== false) {
                this._isLoggedIn.next(false);
              }
                return throwError(() => new Error('Failed to refresh token. Please log in again.'));
            })
        );
    }

    /**
     * Checks if the user is currently logged in and their access token is valid.
     * This method directly checks localStorage and token expiry.
     * It also performs cleanup if tokens are invalid or expired.
     * @returns True if logged in and token is valid, false otherwise.
     */
    isLoggedIn(): boolean {
        const token = this.getAuthToken();
        const expiry = localStorage.getItem('tokenExpiry');

        if (!token || !expiry) {
            this.clearAuthToken(); // Ensure complete cleanup if parts are missing
            return false;
        }

        const expiryTimestamp = parseInt(expiry, 10);
        if (isNaN(expiryTimestamp)) {
            console.warn('Invalid token expiry timestamp in localStorage. Clearing all tokens.');
            this.clearAuthToken(); // Clean up bad data
            
            return false;
        }

        const now = Math.floor(Date.now() / 1000); // Current time in seconds since epoch

        const loggedIn = now < expiryTimestamp; // Check only expiry here, token presence checked above

        if (!loggedIn) {
            console.log('Access token is expired. Clearing all tokens.');
            this.clearAuthToken(); // Automatically clean up expired tokens
        }

    //  alert(loggedIn?'isLoggedin :true':'isLoggedin :false')
        return loggedIn;
    }

    
    // --- Active Context Management ---
   private saveActiveContext(
    context: AvailableContext | null
): void {

    console.log(
        'saving context:',
        context
    );

    if (context) {

        localStorage.setItem(
            this.ACTIVE_CONTEXT_KEY,
            JSON.stringify(context)
        );

    } else {

        localStorage.removeItem(
            this.ACTIVE_CONTEXT_KEY
        );
    }

    this._activeContext.next(context);
}

   // Inside your auth.service.ts constructor or session initialization helper:
   public loadActiveContext(): boolean {

    const savedContext =
        localStorage.getItem(this.ACTIVE_CONTEXT_KEY);

    if (!savedContext) {
        return false;
    }

    try {

        const restoredContext: AvailableContext =
            JSON.parse(savedContext);

        if (
            !restoredContext ||
            restoredContext.tenantId === undefined ||
            !restoredContext.roleName
        ) {
            return false;
        }

        console.log(
            'Restored active context:',
            restoredContext
        );

        this._activeContext.next(
            restoredContext
        );

        this.updateCurrentUserRoleAndPermissions();

        return true;

    } catch (error) {

        console.error(
            'Failed to restore active context:',
            error
        );

        localStorage.removeItem(
            this.ACTIVE_CONTEXT_KEY
        );

        return false;
    }
}





    // --- NEW: Method to get all available contexts after initial login ---
    getAvailableContexts(): AvailableContext[] | null {

    const savedContexts =
        localStorage.getItem('available_contexts');

    if (savedContexts) {

        try {

            return JSON.parse(
                savedContexts
            );

        }
        catch (error) {

            console.error(
                'Invalid stored available contexts:',
                error
            );

            localStorage.removeItem(
                'available_contexts'
            );
        }
    }

    const token =
        this.getAuthToken();

    if (!token) {
        return null;
    }

    try {

        const decodedToken =
            jwtDecode<InitialJwtPayload>(
                token
            );

        if (
            Array.isArray(
                decodedToken.availableContexts
            )
        ) {

            return decodedToken.availableContexts;
        }

        return null;

    }
    catch (error) {

        console.error(
            'Error decoding JWT to get available contexts:',
            error
        );

        return null;
    }
}

    setActiveContext(context: any): Observable<any> {
    console.log('setting Active context now....................');
    
    const userId = this.getUserId();
    const refreshToken = this.getRefreshToken();
   
    console.log('got userid n Rtoken:', userId);

    if (!userId) { 
        console.log('nope userid is controll............');
        return of(new Error('User not logged in or user ID missing.'));
    }

    // Make a backend call to get a context-specific access token
    return this.http.post('/login/select-context', {
        userId: userId,
        refreshToken: refreshToken, 
        tenantId: context.tenantId,
        roleName: context.roleName
    }).pipe(
        tap((response: any) => {                     
            console.log('setting activecontext from response:', response); 

            // 1. Update core application identifiers
            // Added safe check in case response.user is missing
            const siteId = response.user?.siteId || response.siteId; 
            this.setSiteId(siteId);
            this.setClientId(response.clientId);

            // 2. Rotate core authentication session tokens
            this.setAuthToken(response.access_token); 
            this.setRefreshToken(response.refresh_token); 

            // 3. Map final verified properties into the complete Context profile object
            const selectedContextFromResponse: AvailableContext = {
                tenantId: response.tenantId,
                tenantName: response.tenantName,
                tenantType: response.tenantType,
                roleName: response.roleName+'_added',
                permissions: response.permissions, 
                displayName: response.displayName
            };
          
            console.log('saving activecontext :', selectedContextFromResponse); 
            
            // 4. [PRESERVED] Save context values using your existing persistence helper
            this.saveActiveContext(selectedContextFromResponse);

            // 5. [FIX] PUSH NEW VALUE TO RXJS BROADCAST STREAM 
            // This forces your Topbar async pipes to instantly re-render 'Client' or 'Admin'
            if (this._activeContext) {
                this._activeContext.next(selectedContextFromResponse);
            
            }

            // 6. Push role string to your standalone role stream if your application relies on it
            if (this._currentUserRole) {
                this._currentUserRole.next(response.roleName);
            }
        }),
        catchError(error => {
            console.error('Error setting active context:', error);
            const currentRefreshToken = this.getRefreshToken();
            this.logout(currentRefreshToken); 
            return throwError(() => error); // Using throwError to correctly bubble up back to components
        })
    );
}

    
    //this version of getUserId is replaced by new one below
    // /**
    //  * Extracts and returns the userId from the stored access token.
    //  * @returns The userId as a number, or null if the token is invalid or userId is not found.
    //  */
    // getUserId(): number | null {
    //     const token = this.getAuthToken();
    //     if (!token) {
    //         return null;
    //     }
    //     try {
    //         // IMPORTANT: Use JwtPayload interface for decoding the token's content
    //         const decodedToken = jwtDecode<JwtPayload>(token);
    //         if (typeof decodedToken.userId === 'number') {
    //             return decodedToken.userId;
    //         }
    //         console.warn('JWT payload does not contain a valid userId (number):', decodedToken);
    //         return null;
    //     } catch (error) {
    //         console.error('Error decoding JWT to get userId:', error);
    //         return null;
    //     }
    // }

    getUserId(): number | null {
        const userId = localStorage.getItem(this.USER_ID_KEY); 
        
        return userId ? parseInt(userId, 10) : null;
    }

    hasAuthToken(): boolean {
        return !!this.getAuthToken();
    }
    // /**
    //  * Extracts and returns the user's role from the stored access token.
    //  * @returns The user's role as a string, or null if the token is invalid or role is not found.
    //  */
    // getUserRole(): string | null {
    //     const token = this.getAuthToken();
    //     if (!token) {
    //         return null;
    //     }
    //     try {
    //         const decodedToken = jwtDecode<JwtPayload>(token);
    //         console.log('decodedToken.role:',decodedToken.role);
    //         if (typeof decodedToken.role?.rolename! === 'string') {
                           
    //             return decodedToken.role.rolename;
    //         }
    //         console.warn('JWT payload does not contain a valid role (string):', decodedToken);
    //         return null;
    //     } catch (error) {
    //         console.error('Error decoding JWT to get user role:', error);
    //         return null;
    //     }
    // }

//this version of getUserRole is replaced by new one below
    // //above is replaced by
    // //by availableContexts    
    // /**
    //  * Extracts and returns the user's role from the stored access token.
    //  * @returns The user's role as a string, or null if the token is invalid or role is not found.
    //  */
    // getUserRole(): string | null {
    //     const token = this.getAuthToken();
    //     if (!token) {
    //         return null;
    //     }
    //     try {
    //         const decodedToken = jwtDecode<JwtPayload>(token);
    //         console.log('decodedToken:',decodedToken.availableContexts.find((ac:any)=>ac.tenantId=='67bacfa1-09bd-4a17-be97-2f84781bd02f'));
            
    //         //pending-we need here standard method that will check an object matches complete interface userTenantContext declared above
    //        // if (typeof decodedToken.availableContexts.UserId=== 'number' && typeof decodedToken.availableContexts.TenantId === 'string') {
                           
           
    //        return decodedToken.availableContexts[0].roleName;
    //        //return decodedToken.availableContexts.find((e:any)=>e.TenantId=="67bacfa1-09bd-4a17-be97-2f84781bd02f")[0].roleName;
    //        // }
    //         console.warn('JWT payload does not contain a valid availableContexts:', decodedToken);
    //         return null;
    //     } catch (error) {
    //         console.error('Error decoding JWT to get user role:', error);
    //         return null;
    //     }
    // }

     // --- Modified getUserRole() ---
     getUserRole(): string | null {
    // 1. Grab the actual structured context object from the stream value
    const activeContext = this._activeContext.value;
    
    // 2. Safely read and return the roleName string
    return activeContext ? activeContext.roleName : null;
}


    
   

    getUserRoleObservable(): Observable<string | null> {
        return this.currentUserRole$;
    }

    //this version of getUserPermissions is replaced by new one below
    // getUserPermissions(): string[] {
    //     const token = this.getAuthToken();
    //     if (!token) { return []; }
    //     try {
    //         const decodedToken = jwtDecode<JwtPayload>(token);
    //         //return Array.isArray(decodedToken.permissions) ? decodedToken.permissions : [];
    //         return Array.isArray(decodedToken.availableContexts[0].permissions) ? decodedToken.availableContexts[0].permissions : [];
            
    //     } catch (error) {
    //         console.error('Error decoding JWT to get user permissions:', error);
    //         return [];
    //     }
    // }

     // --- Modified getUserPermissions() ---
     getUserPermissions(): string[] {
    // 1. Grab the actual structured context object from the stream memory snapshot
    const activeContext = this._activeContext.value;
    
    // 2. Return the permissions array if it exists, otherwise fallback to an empty list
    return activeContext ? activeContext.permissions : [];
}

//this version was called from line# 103, 597 now getTenantId is used
    /**
     * Extracts and returns the active tenantId from the stored access token.
     * @returns The tenantId as a string, or null if not found.
     */
    getActiveTenantId(): string | null {
        
        const token = this.getAuthToken();
        if (!token) {
            return null;
        }
        try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            if (typeof decodedToken.tenantId === 'string') {
               
                return decodedToken.tenantId;
            }
            console.warn('JWT payload does not contain a valid tenantId (string):', decodedToken);
            return null;
        } catch (error) {
            console.error('Error decoding JWT to get tenantId:', error);
            return null;
        }
    }

    // --- Modified getTenantId() --- earlier was getActiveTenant
   getTenantId(): number | null {
    // 1. Grab the actual structured context object from the stream snapshot
    const activeContext = this._activeContext.value;
    
    // 2. Return the tenantId if it exists, otherwise return null
    return activeContext ? activeContext.tenantId : null;
}

     // Helper to update the _currentUserRole subject
     public updateCurrentUserRoleAndPermissions(): void {
      
        const role = this.getUserRole(); // Use the synchronous method to get the current role;
        const permissions = this.getUserPermissions();
        const tenantId = this.getTenantId();// earlier was this.getActiveTenantId();
        const userId = this.getUserId();
        
        
        this._currentUserRole.next(role);
        
        this.permissionsService.loadPermissions(permissions);
        this._activeTenantId.next(tenantId); // Update tenant ID subject
        this._currentUserId.next(userId);     // Update user ID subject
    }

    /**
     * Extracts and returns the user's username (email) from the stored access token.
     * @returns The user's username as a string, or null if the token is invalid or username is not found.
     */
    getUserName(): string | null {
        const token = this.getAuthToken();
        if (!token) {
            return null;
        }
        try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            if (typeof decodedToken.userName === 'string') {
                return decodedToken.userName;
            }
            console.warn('JWT payload does not contain a valid userName (string):', decodedToken);
            return null;
        } catch (error) {
            console.error('Error decoding JWT to get user name:', error);
            return null;
        }
    }

    
    //helper methods
    // Inside auth.service.ts

// A BehaviorSubject to broadcast the active workspace tenant ID context
private activeTenantIdSubject = new BehaviorSubject<number>(0);
public activeTenantIdObs = this.activeTenantIdSubject.asObservable();

/**
 * Checks if the currently authenticated token profile represents a core system SuperAdmin
 */
// Inside your auth.service.ts -> Update this method to look at the token payload or a baseline key
public isSuperAdminProfile(): boolean {
  const token = this.getAuthToken();
  if (!token) return false;
  
  try {
    // Decode your JWT token payload structure
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if the original array contains a SuperAdmin role option 
    // OR if you set a baseline flag in local storage upon initial credentials login
    const contexts = payload.availableContexts || [];
    return contexts.some((ctx: any) => Number(ctx.tenantId) === 0 && ctx.roleName === 'SuperAdmin');
  } catch (e) {
    return false;
  }
}


/**
 * Switch context helper method executed when the SuperAdmin changes the dropdown option
 */
public switchContext1(targetTenantId: number): Observable<any> {
  const userId = this.getUserId();
  const refreshToken = this.getRefreshToken();
  const contexts = this.getAvailableContexts() || [];
  
  const selectedContext = contexts.find(c => Number(c.tenantId) === Number(targetTenantId));

  const targetRoleName = Number(targetTenantId) === 0 
    ? 'SuperAdmin' 
    : (selectedContext ? selectedContext.roleName : 'Admin');

  const payload = {
    userId: Number(userId),
    refreshToken: refreshToken!,
    tenantId: Number(targetTenantId),
    roleName: targetRoleName,
    availableContexts: contexts 
  };

  return this.http.post<any>('/login/select-context', payload).pipe(
   // Inside your frontend auth.service.ts -> switchContext1() method
tap((response) => {
      //console.log('...................while switch response.permissions...............',response.displayName);
    
      
  if (response && response.access_token) {
    // 1. Core Session Token Overwrites
    this.setAuthToken(response.access_token);
    this.setRefreshToken(response.refresh_token);
    
    // 2. 🚨 CRITICAL OVERWRITE: Force storage primitives to hold the newly spoofed values
    localStorage.setItem('tenant_id', response.tenantId.toString());
    localStorage.setItem('active_context_role', response.roleName); // Overwrites 'SuperAdmin' with 'Admin'
    localStorage.setItem('user_permissions', JSON.stringify(response.permissions || []));
    localStorage.setItem('tenant_type', response.tenantType || 'INSTITUTE');
    
    // Keep the dropdown configuration array intact across the reload boundary
    if (response.availableContexts) {
       localStorage.setItem('available_contexts', JSON.stringify(response.availableContexts));
    }

  
    // 3. Build a complete layout profile structure 
    const structuralContextProfile: AvailableContext = {
      tenantId: Number(response.tenantId),
      displayName: response.displayName || 'SuperAdmin (Impersonated)',
      tenantName: response.tenantName || 'Spoofed Workspace',
      tenantType: response.tenantType || 'INSTITUTE',
      roleName: response.roleName, // Holds 'Admin'
      permissions: response.permissions || []
    };

    // 4. Update the reactive state pipeline
    this.saveActiveContext(structuralContextProfile);
    if (this._activeContext) {
      this._activeContext.next(structuralContextProfile);
    }
  }
})

  );
}




    //----------------------------------------------------------------------------------
}