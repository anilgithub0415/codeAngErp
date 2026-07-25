import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ProductWithVariantsDto, CreateProductWithVariantsDto } from '../models/ProductWithVariant.model';

@Injectable({
  providedIn: 'root'
})
export class ProductWithService {
  private apiUrl = '/product/with-variants';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  createProductWithVariants(payload: Partial<CreateProductWithVariantsDto>): Observable<ProductWithVariantsDto> {
    console.log('Save ProductWithVariant:',payload);
    
    return this.http.post<ProductWithVariantsDto>(this.apiUrl, payload).pipe(
      tap(res => console.log('createProductWithVariants response', res)),
      catchError(this.handleError)
    );
  }

  getProductWithVariants(productId: number): Observable<ProductWithVariantsDto> {
    const url = `/product/${productId}/with-variants`;
    return this.http.get<ProductWithVariantsDto>(url).pipe(
      catchError(this.handleError)
    );
  }

  updateProductWithVariants(productId: number, payload: Partial<CreateProductWithVariantsDto>): Observable<ProductWithVariantsDto> {
    return this.http.put<ProductWithVariantsDto>(`${this.apiUrl}/${productId}`, payload).pipe(
      catchError(this.handleError)
    );
  }
}
