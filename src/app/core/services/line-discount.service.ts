import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; 
import { CreateLineDiscountDto, LineDiscount } from '../models/line-discount.model';

@Injectable({
  providedIn: 'root'
})
export class LineDiscountService {

    private apiUrl = '/lineDiscount';

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

    createDiscount(discountData: Partial<CreateLineDiscountDto>): Observable<LineDiscount> {
        console.log('create line dicount with url:',discountData);
        
        return this.http.post<LineDiscount>(this.apiUrl, discountData).pipe(
            tap(newDiscount => console.log('Created discount successfully:', newDiscount)),
            catchError(this.handleError)
        );
    }

    updateDiscount(id: number, discountData: Partial<CreateLineDiscountDto>): Observable<LineDiscount> {
          console.log('update line dicount with url:',discountData);
        return this.http.put<LineDiscount>(`${this.apiUrl}/${id}`, discountData).pipe(
            tap(updatedDiscount => console.log('Updated discount successfully:', updatedDiscount)),
            catchError(this.handleError)
        );
    }

    getDiscount(ptenantId: number, discountId: number): Observable<LineDiscount> {
        return this.http.get<LineDiscount>(`${this.apiUrl}/${ptenantId}/${discountId}`);
    }

    getDiscounts(ptenantId: number): Observable<LineDiscount[]> {
    return this.http.get<LineDiscount[]>(`${this.apiUrl}/${ptenantId}`).pipe(
        map((data: any) => {
            const discounts = Array.isArray(data) ? data : [];
            return discounts.map(d => ({
                id: d.id,
                tenantId: d.tenantId,
                discountCode: d.discountCode,
                description: d.description,
                // 💡 BRIDGE: Extract the string name label from the joined object relation
                discountType: d.discountType ? d.discountType.typeName : 'N/A', 
                discountValue: Number(d.discountValue) || 0,
                productId: d.productId,
                product: d.product ? { prodName: d.product.prodName, sku: d.product.sku } : null,
                categoryId: d.categoryId,
                validFrom: d.validFrom,
                validTo: d.validTo,
                isActive: d.isActive !== undefined ? d.isActive : true,
                createdByUserId: d.createdByUserId
            }));
        }),
        catchError(this.handleError)
    );
}

}
