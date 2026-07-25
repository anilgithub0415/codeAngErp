import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-migrate-db',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ButtonModule,CommonModule,InputTextModule,InputNumberModule,FormsModule],
  templateUrl: './migrate-db.component.html',
  styleUrl: './migrate-db.component.scss'
})
export class MigrateDBComponent implements OnInit{
  mypass!:string;secret:string='Anil123'
     private apiUrl = '/migrate-database';
    


    constructor(private http: HttpClient) { }

      private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            console.error('Client-side error:', error.error.message);
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
            errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
        }
        return throwError(() => new Error(errorMessage));
    }


    ngOnInit() {
}
startMigration(){

  // Trigger the actual HTTP call by subscribing
  this.migrateDB().subscribe({
    next: (response) => {
      console.log('Database migration started successfully:', response);
    },
    error: (err) => {
      console.error('Migration failed:', err.message);
    }
  });
}
migrateDB(): Observable<any> {
  const migrateDB_Body = {
    "cloudConfig": { 
      "server": "den1.mssql8.gear.host", 
      "user": "saishrustitest",  
      "password": "Pg2Nx369k~!7",//"YOUR_ACTUAL_PASSWORD_HERE",
      "database": "saishrustitest",
      "options": { "encrypt": true, "trustServerCertificate": true }
    },
    "localConfig": {
      "server": "localhost", 
      "user": "sa", 
      "password": "saadmin", 
      "database": "ignitefuture",
      "options": { "encrypt": false, "trustServerCertificate": true }
    },
    "newDbName": "ignitefuture"
  };

  console.log(`Migrating DB from cloud, posting to url: ${this.apiUrl}`);
  
  // This just sets up the blueprint; subscribing triggers it
  return this.http.post<any>(this.apiUrl, migrateDB_Body).pipe(
    catchError(this.handleError)
  );
}

    
    

     }

