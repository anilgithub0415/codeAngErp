import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ProductVariantDto, CreateProductVariantDto } from '../models/productvariant.model';

@Injectable({
  providedIn: 'root'
})
export class ProductvariantService {
  private apiUrl = '/product/variant';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      console.error(`Backend returned code ${error.status}, body:`, error.error);
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  createVariant(payload: Partial<CreateProductVariantDto>): Observable<ProductVariantDto> {
    return this.http.post<ProductVariantDto>(this.apiUrl, payload).pipe(
      tap(v => console.log('createVariant result', v)),
      catchError(this.handleError)
    );
  }

  getVariants(productId: number): Observable<ProductVariantDto[]> {
    const url = `/product/${productId}/variants`;
    return this.http.get<ProductVariantDto[]>(url).pipe(
      tap(list => console.log('fetched variants for product', productId, list)),
      catchError(this.handleError)
    );
  }

  getVariant(variantId: number): Observable<ProductVariantDto> {
    return this.http.get<ProductVariantDto>(`${this.apiUrl}/${variantId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateVariant(variantId: number, payload: Partial<CreateProductVariantDto>): Observable<ProductVariantDto> {
    return this.http.put<ProductVariantDto>(`${this.apiUrl}/${variantId}`, payload).pipe(
      catchError(this.handleError)
    );
  }

  deleteVariant(variantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${variantId}`).pipe(
      catchError(this.handleError)
    );
  }

  adjustStock(variantId: number, deltaBaseUnits: number): Observable<ProductVariantDto> {
    return this.http.post<ProductVariantDto>(`${this.apiUrl}/${variantId}/stock-adjust`, { deltaBaseUnits }).pipe(
      catchError(this.handleError)
    );
  }
}