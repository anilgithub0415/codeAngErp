import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode
import {throwError} from 'rxjs'
import { switchMap, catchError} from 'rxjs/operators';
import {currentTimestamp} from '../../core/auth/helpers'
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
 
  const authService = inject(AuthService);
  const authToken = authService.getAuthToken();

  // Skip token handling for login requests
  if (req.url.includes('/login') && req.method=='POST'){
    const accessToken=  authService.getAuthToken()
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  return next(modifiedReq);
  }

 
//authService.clearAuthToken();//  && !req.url.includes('/login')
//|| req.url.includes('/api/login')

//authService.clearAuthToken();
  if (authToken) {   
    if(req.url.includes('/api/login')){alert('authtoken exists for login url:'+req.url)}
    
    const remainingSeconds =authToken? getRemainingTokenExpiry(authToken):30;
    const refreshThreshold = 30; // Refresh if remaining time is less than 30 seconds
console.log('remainingSeconds:',remainingSeconds);

    //Token about to expire or expired
    if (remainingSeconds !== null && remainingSeconds <= refreshThreshold) {
      
      
      // **Important:** You need to handle the asynchronous nature of the refreshToken call properly.
      // Returning `authService.refreshToken().pipe(switchMap((newTokenResponse) => { ... }))` is a common approach.
      authService.clearAuthToken();
      //req.url
      return authService.refreshToken().pipe(
        switchMap((newTokenResponse:any) => {
          console.log('Token refreshed successfully in interceptor.');
          authService.setAuthToken(newTokenResponse.access_token);authService.setRefreshToken(newTokenResponse.refresh_token);
          const newAuthToken = authService.getAuthToken(); // Get the newly refreshed token

          const modifiedReq = req.clone({
            setHeaders: {
               Authorization: `Bearer ${newAuthToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          return next(modifiedReq); // Proceed with the original request using the new token
        }),
        catchError((error) => {
          console.error('Error refreshing token in interceptor:', error);
          // Handle refresh failure (e.g., clear tokens, redirect to login)
          authService.clearAuthToken();
          // You might want to re-throw the error or return a specific observable
          return throwError(error);
        })
      );
    }
    

    // Token is still valid, proceed with the original request
    else {
      
      const modifiedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      return next(modifiedReq);
    }
  } 
  
    // No token, proceed with the original request without authorization header
  else { console.log('no token','req.url:',req.url,'method:',req.method);
      const modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    });
    return next(modifiedReq);
  }
};