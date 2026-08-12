// src/app/core/services/product.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; 

import { Product, CreateProductDto } from '../models/product.model';
import { CreateProductWithVariantsDto } from '../models/ProductWithVariant.model';
import { CreateProductVariantDto } from '../models/product-variant.model';

@Injectable({
    providedIn: 'root' 
})
export class ProductService {
    private apiUrl = '/product';

    constructor(private http: HttpClient) { }
    
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        
        if (error.error instanceof ErrorEvent) {
            console.error('Client-side error:', error.error.message);
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.log('Raw HTTP Error Intercepted:', error);

            if (error.status === 409 || JSON.stringify(error).includes('409') || error.message?.includes('409')) {
                return throwError(() => new Error('DB_DEPENDENCY_RESTRICTION_ERROR'));
            }

            console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
            errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
        }
        
        return throwError(() => new Error(errorMessage));
    }

    getProductSuggestions(tenantId: number, query: string): Observable<any[]> {
        const url = `${this.apiUrl}/suggestions/${tenantId}?q=${encodeURIComponent(query)}`;
        console.log('hitting url for getProductSuggestions............', url);
        
        return this.http.get<any[]>(url).pipe(
            catchError(this.handleError)
        );
    }

    reactivateProduct(tenantId: number, productId: number): Observable<Product> {
        const url = `${this.apiUrl}/reactivate/${tenantId}/${productId}`;
        return this.http.post<Product>(url, {}).pipe(
            tap(restored => console.log('Reactivated product structure entity:', restored)),
            catchError(this.handleError)
        );
    }

    createProduct(productData: Partial<CreateProductDto>): Observable<Product> {
        console.log(`Creating product at ${this.apiUrl} with data:`, productData);
        return this.http.post<Product>(this.apiUrl, productData).pipe(
            tap(newProduct => console.log('Created product:', newProduct)),
            catchError(this.handleError)
        );
    }

    updateProduct(productData: Partial<CreateProductDto>): Observable<Product> {
        console.log(`Updating product at ${this.apiUrl} via PUT with data:`, productData);
        return this.http.put<Product>(this.apiUrl, productData).pipe(
            tap(updatedProduct => console.log('Updated product response:', updatedProduct)),
            catchError(this.handleError)
        );
    }

    createProductWithVariant(productTemplateData: Partial<CreateProductVariantDto>): Observable<Product> {
        const url = this.apiUrl + '/withvariant/';
        console.log(`Creating product withvariant at ${url} with data:`, productTemplateData);
      
        return this.http.post<Product>(url, productTemplateData).pipe(
            tap(newProduct => console.log('Created product:', newProduct)),
            catchError(this.handleError)
        );
    }

    getProduct(ptenantId: number, prodId: number): Observable<Product> {
        console.log('fetching product by url:', this.apiUrl + '/' + ptenantId + '/' + prodId);
        return this.http.get<Product>(this.apiUrl + '/' + ptenantId + '/' + prodId);
    }

    getProducts(ptenantId: number): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl + '/' + ptenantId);
    }

    getProductsWithVariant(ptenantId: number): Observable<Product[]> {
        const url = this.apiUrl + '/withvariant';
        return this.http.get<any[]>(url + '/' + ptenantId);
    }

    getProductFinalPrice(pProductId: number, ptenantId: number, p: any, customerId?: number): Observable<number> {
        console.log('getProductFinalPrice for custId:', customerId, ' for product:',p);
        
        let url = this.apiUrl + '/finalPrice/' + pProductId + '/' + ptenantId;
        if (customerId) { url = this.apiUrl + '/finalPrice/' + pProductId + '/' + ptenantId + '/' + customerId; }
        console.log('posting url:', url);
        
        return this.http.post<number>(url, p);
    }

    getProducttableFieldsConfig(ptenantId: any): Observable<any> {
        let url = this.apiUrl + '/product_table_fields/' + ptenantId;
        return this.http.get<any[]>(url).pipe(
            catchError(this.handleError)
        );
    }

    deleteProduct(tenantId: number, productId: number): Observable<any> {
        const url = `${this.apiUrl}/${tenantId}/${productId}`;
        console.log('Sending delete request to url:', url);
        
        return this.http.delete<any>(url).pipe(
            catchError(this.handleError)
        );
    }
}
