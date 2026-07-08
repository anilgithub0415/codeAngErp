import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, delayWhen, shareReplay, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { Program} from '../models/program';
import { Subject} from '../models/subject.model';
import { Course } from '../models/course.model';
import { FacultyProfile } from '../models/faculty-profile';


import { Question } from '../models/question.model';
import { Topic } from '../models/topic.model';
import { CourseOffering } from '../models/course-offering';
import { UserRole } from '../models/user.model';
import { CustomerCategory } from '../models/customer-category';
import { Product } from '../models/product.model';
import { City } from '../models/city.model';
import { Customer } from '../models/customer.model';

// No need for InventoryStatus here, that was from the product example

interface ProgramOption {
  label: string;
  value: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  
  

  private apiUrl = '/lookups';

  constructor(private http: HttpClient) { }

  /**
   * Handles HTTP errors from API calls.
   * @param error The HttpErrorResponse.
   * @returns An Observable that throws an error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
          // Client-side or network error occurred.
          console.error('Client-side error:', error.error.message);
          errorMessage = `Network error: ${error.error.message}`;
      } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(
              `Backend returned code ${error.status}, ` +
              `body was: ${JSON.stringify(error.error)}`);
          errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
      }
      // Return an observable with a user-facing error message.
      return throwError(() => new Error(errorMessage));
  }

  getLookupDataByKey(key:string,ptenantId:number):Observable<any[]>{
   
   
    var url=`/lookups/${key}/ptenantId/`+ptenantId; 
   
      
    
    return this.http.get<any[]>(url).pipe(
  delayWhen(() => timer(2000)),
  shareReplay(1)
);

  }
  
  /**
   * Fetches a list of all Categories of customer from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getCustomerCategories(ptenanId:number): Observable<CustomerCategory[]> {
      var url=this.apiUrl+'/customerCategoryTypes/ptenantId/'+ptenanId;
     
       
      return this.http.get<CustomerCategory[]>(url).pipe(

  delayWhen(() => timer(2000)),
       //   tap(users => console.log('Fetched users:', users)),
          catchError(this.handleError)
      );
  }
  //customerTypes
getcustomerTypes(ptenanId:number): Observable<Customer[]> {
      var url=this.apiUrl+'/customerTypes/ptenantId/'+ptenanId;
     
       
      return this.http.get<Customer[]>(url).pipe(

  delayWhen(() => timer(2000)),
       //   tap(users => console.log('Fetched users:', users)),
          catchError(this.handleError)
      );
  }
  /**
   * Generic search helper for lookup keys.
   * @param key lookup key (e.g. 'vendors', 'roleTypes')
   * @param ptenantId tenant id
   * @param query search string
   */
  searchLookup(key: string, ptenantId: number, query: string): Observable<any[]> {
      
    const q = encodeURIComponent(query ?? '');
    
    
    const url = `/lookups/${key}/ptenantId/${ptenantId}?q=${q}`; console.log('searchLookup url:',url);
        console.log('searchLookup url:',url); 
        return this.http.get<any[]>(url).pipe(

  delayWhen(() => timer(2000)),
      catchError(this.handleError)
    );
  }



getRoleTypes(ptenanId:number): Observable<UserRole[]> {
  var url=this.apiUrl+'/roleTypes/ptenantId/'+ptenanId;
    
  return this.http.get<UserRole[]>(url).pipe(
   //   tap(users => console.log('Fetched users:', users)),
      catchError(this.handleError)
  );
 
}

//
getProductTypes(ptenanId:number): Observable<Product[]> {
  var url=this.apiUrl+'/productTypes/ptenantId/'+ptenanId;
    
  return this.http.get<Product[]>(url).pipe(
   //   tap(users => console.log('Fetched users:', users)),
      catchError(this.handleError)
  );
 
}
//withvariant
// In lookup.service.ts
getProductTypesWithVariants(ptenantId: number): Observable<any[]> {
    var url = this.apiUrl + '/productTypesWithVariants/ptenantId/' + ptenantId;
    return this.http.get<any[]>(url).pipe(
        catchError(this.handleError)
    );
}


getCityTypes(ptenanId:number): Observable<City[]> {
  var url=this.apiUrl+'/cityTypes/ptenantId/'+ptenanId;
    
  return this.http.get<City[]>(url).pipe(
   //   tap(users => console.log('Fetched users:', users)),
      catchError(this.handleError)
  );
 
}

}
