import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp?: number;
  iat?: number;
  // Other claims
}
export   function getRemainingTokenExpiry(token: string): number | null {
    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      if (decodedToken?.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTime = decodedToken.exp - currentTime;
        return Math.max(0, remainingTime); // Ensure non-negative value
      }
      return null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  
  // // Example usage in your Angular interceptor or service:
  // const accessToken = this.authService.getAuthToken();
  // if (accessToken) {
  //   const remainingSeconds = getRemainingTokenExpiry(accessToken);
  //   console.log('Remaining token expiry:', remainingSeconds, 'seconds');
  
  //   const refreshThreshold = 30; // Refresh if remaining time is less than 30 seconds
  //   if (remainingSeconds !== null && remainingSeconds <= refreshThreshold) {
  //     console.log('Token nearing expiry, initiating refresh...');
  //     this.authService.refreshToken().subscribe(/* ... */);
  //   }
  // }
  

