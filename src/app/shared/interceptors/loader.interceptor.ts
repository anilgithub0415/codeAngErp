import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs';
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
   const loaderService = inject(LoaderService);
  
  loaderService.show();
  return next(req).pipe(
    finalize(() => {
      loaderService.hide(); // Turn off spinner when request ends (success or error)
    })
  );
};
