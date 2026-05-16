import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Employee, EmployeeImp } from '../interfaces/employee';
import { EmployeeDataService } from '../interfaces/employee-data-service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService implements EmployeeDataService{

  private readonly http=inject(HttpClient);

  constructor() { }
  getData():Observable<any>{
    return of({})
  }
  // getDataOfEmployee():Observable<Employee[]> | undefined{
  //   console.log('m employee service')
  //    return this.http.get<Employee[]>('/emp')
  // }

  // getDataOfEmployee(): Observable<Employee[]> {
  //   console.log('m employee service');
  //   return this.http.get<Employee[]>('/emp').pipe(
  //     tap(data => console.log('Raw employee data from backend:', data)), // Log the raw data
  //     map(data => {
  //       // Deserialization/Transformation logic here if needed
  //       // For example, if the backend structure doesn't exactly match your Employee model
  //       return data.map(item => ({
  //         id: item.id,
  //         fname: item.fname,
  //         lname: item.lname,
  //         // ... map other properties as needed
  //       } as Employee));
  //     }),
  //     catchError(error => {
  //       console.error('Error fetching employees:', error);
  //       // Return a safe observable or rethrow the error
  //       return of([]); // Example: return an empty array on error
  //       // throw error; // To propagate the error to the component
  //     })
  //   );
  // }



  getDataOfEmployee(): Observable<Employee[]> {
    
    return this.http.get<Employee[]>('/emp').pipe(
      //tap(data => console.log('Raw employee data from backend:', data)), // Log the raw data
      map(data => {
        // Deserialization/Transformation logic here if needed
        return data.map(rawdata => {
         /// rawdata.fname='xyz';
         const empobj=new EmployeeImp();
         return empobj.deserialise(rawdata)

        } );
        
      }),
      catchError(error => {
        console.error('Error fetching employees:', error);
        // Return a safe observable or rethrow the error
        return of([]); // Example: return an empty array on error
        // throw error; // To propagate the error to the component
      })
    );
  }
  
}
