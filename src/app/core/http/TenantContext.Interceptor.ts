import { HttpInterceptorFn } from '@angular/common/http';

export const tenantContextInterceptor: HttpInterceptorFn = (req, next) => {
  // Read the active tenantId from localStorage
  const currentTenantId = localStorage.getItem('tenantId');

  if (currentTenantId) {
    // Clone request and add the custom context header
    const modifiedReq = req.clone({
      headers: req.headers.set('x-tenant-id', currentTenantId)
    });
    return next(modifiedReq);
  }

  return next(req);
};
