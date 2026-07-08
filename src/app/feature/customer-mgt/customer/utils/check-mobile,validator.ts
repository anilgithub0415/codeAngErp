import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CustomerService } from '../../../../core/services/customer.service'

export function checkMobileExists(tenantId: number, mobileService: CustomerService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<any> => {
    const value = control.value ? control.value.toString() : '';

    if (value.length !== 10) {
      console.log('need 10 digits mobile.............');
      return of(null); 
    }
   return mobileService.checkMobileNumberExists(tenantId, control.value).pipe(
      map((isExisting: boolean | null) => (isExisting ? { mobileExists: true } : null)),
      catchError(() => of(null)) 
    );
  };
}
