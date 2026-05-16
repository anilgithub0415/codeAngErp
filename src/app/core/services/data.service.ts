
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EmployeeDataService } from '../interfaces/employee-data-service';
import { Employee, EmployeeImp } from '../interfaces/employee';

@Injectable({
  providedIn: 'root'
})
export class DataService implements EmployeeDataService {

  private readonly http=inject(HttpClient);

  constructor() { }
  getData():Observable<any>{
    return of({})
  }

  getDataOfEmployee():Observable<Employee[]>{
     return this.http.get<Employee[]>('/emp')
  }
}
