import { HttpInterceptorFn, HttpClient, HttpBackend, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

//Note:we need full url for refreshtoken as we are skipping interceptor purposely

// Shared state variables to handle multiple concurrent 401 errors cleanly
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  
   let baseurl='http://localhost:3000/api';
   
  const tokenService = inject(TokenService);
  const httpBackend = inject(HttpBackend);
  const authToken = tokenService.getAuthToken();

  // DIAGNOSTIC LOG 1: Print state for every outgoing call
  console.log(`📡 [Interceptor Routing Request]: URL = ${req.url}`);
  console.log(`🔑 [Interceptor Current Token Status]: Token Found = ${!!authToken}`);

  if (authToken) {
    // DIAGNOSTIC LOG 2: Decode the token to see its ACTUAL expiration timestamp
    try {
      const decoded: any = jwtDecode(authToken);
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsUntilExpiry = decoded.exp - currentTime;
      
      console.log(`⏰ [Token Time Analysis]: Expires in exactly ${secondsUntilExpiry} seconds. (Current Time: ${currentTime}, Token Exp: ${decoded.exp})`);
    } catch (e) {
      console.error('❌ [Interceptor Error]: Failed to decode token string!', e);
    }

    let clonedReq = req;
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` }
    });

    return next(clonedReq).pipe(
      catchError((error: any) => {
        // DIAGNOSTIC LOG 3: Catch any API failure status codes
        console.error(`🚨 [Interceptor Caught Failure]: Status Code = ${error.status} for URL = ${req.url}`);
        
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return handle401Error(req, next, tokenService, httpBackend,baseurl);
        }
        return throwError(() => error);
      })
    );
  } else {
    console.warn('⚠️ [Interceptor Notice]: No Auth Token found in storage. Passing request raw.');
    return next(req);
  }
};


// Helper function to manage token rotation lock
function handle401Error(req: any, next: any, tokenService: TokenService, httpBackend: HttpBackend, baseurl:string): Observable<any> {
  if (!isRefreshing) { 
    
    console.log('%c⚙️ [Interceptor]: Access token expired! Locking queue and initiating silent refresh...', 'color: #ff9800');


    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      tokenService.clearTokens();
      isRefreshing = false;
      return throwError(() => new Error('No refresh token available. User logged out.'));
    }
console.log('...........................posting to url:/api/token/refresh-token');

    // Bypass interceptors using HttpBackend to prevent infinite redirect loops
    const bypassClient = new HttpClient(httpBackend);
   
    return bypassClient.post<any>(baseurl+'/token/refresh-token', { refreshToken }).pipe(
      switchMap((resp: any) => {

        console.log('%c✅ [Interceptor]: Token refresh successful. Resuming queued API requests.', 'color: #4caf50');

        isRefreshing = false;
        tokenService.setAuthToken(resp.access_token);
        tokenService.setRefreshToken(resp.refresh_token);
        refreshTokenSubject.next(resp.access_token);

        // Retry the original request that failed with the new access token
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${resp.access_token}` } }));
      }),
      catchError((refreshErr) => {
        isRefreshing = false;
        tokenService.clearTokens();
        return throwError(() => refreshErr);
      })
    );
  } else {

    console.log('%c⏳ [Interceptor]: Refresh in progress. Queueing request:', req.url);

    // If a refresh is already in progress, wait for the new token to arrive
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
      })
    );
  }
}
