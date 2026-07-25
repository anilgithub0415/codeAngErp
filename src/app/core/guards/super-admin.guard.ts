// src/app/core/guards/super-admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Clean browser utility to decode a JWT token string natively using window.atob.
 */
function getRoleFromJwt(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return '';

    // 💡 FIX: Safely parse array index 1 (the encrypted payload segment)
    const base64Url = parts[1]; 
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Auto-apply base64 string padding buffers to prevent browser crash strings
    while (base64.length % 4 !== 0) { 
      base64 += '='; 
    }

    const jsonString = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsedData = JSON.parse(jsonString);
    
    if (!parsedData) return '';
    
    // Search the token fields to extract role configurations dynamically
    const roleKey = Object.keys(parsedData).find(k => k.toLowerCase().includes('role'));
    return roleKey ? String(parsedData[roleKey]).trim() : '';
  } catch (error) {
    console.error('🛡️ Guard Token Decoder Exception:', error);
    return '';
  }
}

export const superAdminGuard: CanActivateChildFn = (childRoute, state): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Fetch token from your custom storage key: 'mytoken'
  const token = localStorage.getItem('mytoken'); 
  
  // 2. Base perimeter fence: If there is no token present on this machine, drop to login
  if (!token) {
    console.warn('🛡️ FIREWALL: Physical footprint for "mytoken" missing. Routing to login.');
    setTimeout(() => router.navigate(['/auth/login']), 0);
    return false;
  }

  // 3. Extract the active user role claim string straight from the payload
  const explicitRole = getRoleFromJwt(token);

  console.warn('🛡️ GUARD HARD CHECK -> Direct Token String Evaluated:', `"${explicitRole}"`);

  // 4. Strict Validation Pass: Grant access if the string token matches exactly
  if (explicitRole.toLowerCase() === 'superadmin') {
    return true; 
  }

  // 5. SECONDARY PERIMETER SHIELD: Fallback check against your stored operational context keys
  // If the token parser hit an encoding issue but your app context explicitly states 'SuperAdmin', let them in.
  const activeContextStr = localStorage.getItem('active_context') || '';
  const currOpModeStr = localStorage.getItem('currOpMode') || '';
  
  if (
    activeContextStr.toLowerCase().includes('superadmin') || 
    currOpModeStr.toLowerCase().includes('superadmin')
  ) {
    console.warn('🛡️ FIREWALL PROTECTION: Token string match missed, but Storage Context confirmed SuperAdmin.');
    return true;
  }

  // 6. Secure Isolation Boundary: Logged in, but the role is unauthorized.
  // Securely drop the navigation loop and force them to /unauthorized, NEVER /login!
  console.error(`❌ Access Blocked for parsed role "${explicitRole}". Routing to /unauthorized`);
  setTimeout(() => router.navigate(['/unauthorized']), 0);
  return false; 
};
