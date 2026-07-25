
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export interface ProductCategory {
  id: number;
  tenantId: number;
  categoryName: string;
  description: string | null;
  isActive: boolean;
  defaultHsnId: number | null;
  defaultHsnTaxRule?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {
  private apiUrl = '/productCategory'; // Maps directly to your backend Express route wrapper

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

  createCategory(categoryData: Partial<ProductCategory>): Observable<any> {
    // Standardizes routing parameters by targeting /:tenantId endpoint structure
    return this.http.post<any>(`${this.apiUrl}/${categoryData.tenantId}`, categoryData).pipe(
      tap(res => console.log('Created category successfully:', res)),
      catchError(this.handleError)
    );
  }

  updateCategory(id: number, categoryData: Partial<ProductCategory>): Observable<any> {
    // Targets the standard multi-tenant update route parameter signature
    return this.http.post<any>(`${this.apiUrl}/${categoryData.tenantId}/${id}`, categoryData).pipe(
      tap(res => console.log('Updated category successfully:', res)),
      catchError(this.handleError)
    );
  }

  getCategory(tenantId: number, id: number): Observable<ProductCategory> {
    return this.http.get<ProductCategory>(`${this.apiUrl}/${tenantId}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getCategories(tenantId: number): Observable<ProductCategory[]> {
    return this.http.get<any>(`${this.apiUrl}/${tenantId}`).pipe(
      map((data: any) => {
        // Safe mapping ensuring your template handles incoming payloads reliably
        const categories = Array.isArray(data) ? data : (data.categories || []);
        return categories.map((c: any) => ({
          id: c.id,
          tenantId: c.tenantId,
          categoryName: c.categoryName,
          description: c.description,
          isActive: c.isActive !== undefined ? c.isActive : true,
          defaultHsnId: c.defaultHsnId,
          defaultHsnTaxRule: c.defaultHsnTaxRule
        }));
      }),
      catchError(this.handleError)
    );
  }

  deleteCategory(tenantId: number, categoryId: number): Observable<any> {
    const url = `${this.apiUrl}/${tenantId}/${categoryId}`; // Adjust base URL path if needed
    return this.http.delete<any>(url).pipe(
        catchError(this.handleError)
    );
}

}
