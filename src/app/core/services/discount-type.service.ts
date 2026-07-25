
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; 
import { CreateDiscountTypeDto, DiscountType } from '../models/discount-type.model';

@Injectable({
  providedIn: 'root'
})
export class DiscountTypeService {

    private apiUrl = '/discountType'; // like Perentage/Fixed_Amount

    constructor(private http: HttpClient) { }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
        }
        return throwError(() => new Error(errorMessage));
    }

    createDiscountType(typeData: Partial<CreateDiscountTypeDto>): Observable<DiscountType> {
        return this.http.post<DiscountType>(this.apiUrl, typeData).pipe(
            tap(newType => console.log('Created discount type:', newType)),
            catchError(this.handleError)
        );
    }

    updateDiscountType(id: number, typeData: Partial<CreateDiscountTypeDto>): Observable<DiscountType> {
        return this.http.put<DiscountType>(`${this.apiUrl}/${id}`, typeData).pipe(
            tap(updatedType => console.log('Updated discount type:', updatedType)),
            catchError(this.handleError)
        );
    }

    getDiscountType(ptenantId: number, typeId: number): Observable<DiscountType> {
        return this.http.get<DiscountType>(`${this.apiUrl}/${ptenantId}/${typeId}`);
    }

    getDiscountTypes(ptenantId: number): Observable<DiscountType[]> {
        return this.http.get<DiscountType[]>(`${this.apiUrl}/${ptenantId}`).pipe(
            map((data: any) => {
                const types = Array.isArray(data) ? data : [];
                return types.map(t => ({
                    id: t.id,
                    tenantId: t.tenantId,
                    typeName: t.typeName,
                    description: t.description,
                    isActive: t.isActive !== undefined ? t.isActive : true,
                    createdByUserId: t.createdByUserId
                }));
            }),
            catchError(this.handleError)
        );
    }
}
