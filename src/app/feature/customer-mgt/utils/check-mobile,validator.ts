import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, takeLast , take} from 'rxjs/operators';
import { CustomerService } from '../../../core/services/customer.service'


// export function checkMobileExists(tenantId: number, mobileService: CustomerService): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<any> => {
//     const value = control.value ? control.value.toString() : '';

//     if (value.length !== 10) {
//       console.log('need 10 digits mobile.............');
//       return of(null); 
//     }
//    return mobileService.checkMobileNumberExists(tenantId, control.value).pipe(
//       map((isExisting: boolean | null) => (isExisting ? { mobileExists: true } : null)),
//       catchError(() => of(null)) 
//     );
//   };
// }
// Define your validation factory to map the boolean response to a Formly error object


// 1. Keep your factory function the same



// 1. Keep your factory function the same
//this is notinuse , as there are 3 ways to find repeating mobilenumber
//one way is use in json field after props that is:
//"asyncValidators": {  "validation": ["mobileExistsCheck"]   }, and
   /*    
                                  this.formlyConfig.validators['mobileExistsCheck'] = {
                                  name: 'mobileExistsCheck',
                                  validation: (control: any) => {
                                    return checkMobileExists(this.tenantId, this.customerService)(control);
                                  },
                                  options: { async: true },
                                  
                                };

                                this.formlyConfig.addValidatorMessage(
                                'mobileExistsCheck',
                                'This mobile number is already registered.'
                                );
                            */
 //second way is use searchable:true where searchable is userdefined term which is used in  utils funcion : applyLocalSearchExtension     
//third way use hooks, as we dont want to create a situation of declaring field is invalid data consequently form invalid
//so this is not used currently
export function checkMobileExists(tenantId: number, customerService: any) {
  return (control: any) => {
    if (!control.value) return of(null); 

    return customerService.checkMobileNumberExists(tenantId, control.value).pipe(
      map((exists: boolean | null) => (exists ? { mobileExistsCheck: true } : null)),
      take(1) // Essential: Async validation observables MUST complete
    );
  };
}




