import { HttpClient, HttpBackend, HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode
import { inject } from '@angular/core';
import {currentTimestamp} from '../../core/auth/helpers'
interface TokenResponse {
    access_token: string;
    token_type?: string;
    expires_in?: number; // Lifetime in seconds (often from backend, e.g., 3600 for 1 hour)
    exp?: number; // Expiration timestamp (if backend directly provides JWT 'exp' claim, e.g., 1678886400)
    refresh_token?: string;
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
interface JwtPayload {
  exp?: number;
  iat?: number;
  // Other claims
}

function getRemainingTokenExpiry(token: string): number | null { 
 
  try {
    const decodedToken = jwtDecode<JwtPayload>(token); console.log('decodedToken:',decodedToken?.exp);
    if (decodedToken?.exp) {
      //const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = decodedToken.exp - currentTimestamp(); console.log('remainingTime:',remainingTime);
      
     
      
      
      return Math.max(0, remainingTime); // Ensure non-negative value
    }
    return null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
 
}
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authToken = tokenService.getAuthToken();

  if (authToken) {
    const remainingSeconds = getRemainingTokenExpiry(authToken) ?? 0;
    const refreshThreshold = 30;

    if (remainingSeconds <= refreshThreshold) {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) { tokenService.clearTokens(); return next(req); }

      // Use HttpBackend to bypass interceptors for the refresh call
      const backend = inject(HttpBackend);
      const backendHttp = new HttpClient(backend);

      return backendHttp.post<TokenResponse>('/token/refresh-token', { refreshToken }).pipe(
        switchMap((resp: any) => {
          tokenService.setAuthToken(resp.access_token);
          tokenService.setRefreshToken(resp.refresh_token);
          const modified = req.clone({ setHeaders: { Authorization: `Bearer ${resp.access_token}` }});
          return next(modified);
        }),
        catchError(err => {
          tokenService.clearTokens();
          return throwError(err);
        })
      );
    }

    const modifiedReq = req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` }});
    return next(modifiedReq);
  } else {
    return next(req);
  }
};