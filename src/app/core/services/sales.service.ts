import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ISalesOrderWorkflow, Sales, createSales } from '../models/sales.model';

export interface SalesUnit {
  label: string;
  value: string;
  factor: number;
  sourcePurchaseUom: string;
}

export interface TenantSalesRulesMatrixResponse {
  baseInventoryUom: string;
  availableSalesUnits: SalesUnit[];
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = '/sales';

  constructor(private http: HttpClient) { }

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


    getWorkflow(
      salesId:number
    ):Observable<ISalesOrderWorkflow>{
  
      console.log('........................getworkflow url:' ,`${this.apiUrl}/${salesId}/workflow`);
      
        return this.http.get<ISalesOrderWorkflow>(
            `${this.apiUrl}/${salesId}/workflow`
        );
  
    }

    
  /**
   * Creates a new sales order via POST.
   */
  createSalesOrder(salesData: Partial<createSales>): Observable<Sales> {
    console.log(`Creating sales order at ${this.apiUrl} with data:`, salesData);
    return this.http.post<Sales>(this.apiUrl, salesData).pipe(
      tap(newSalesOrder => console.log('Created sales order response:', newSalesOrder)),
      catchError(this.handleError)
    );
  }

  /**
   * Updates an existing sales order via PUT resource id path binding.
   */
  updateSalesOrder(id: number, salesData: Partial<createSales>): Observable<Sales> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`Updating sales order at ${url} with data:`, salesData);
    return this.http.put<Sales>(url, salesData).pipe(
      tap(updatedSalesOrder => console.log('Updated sales order response:', updatedSalesOrder)),
      catchError(this.handleError)
    );
  }

  sendSales(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/send`, {}).pipe(
      tap(response => console.log('Sales finalized and approved:', response)),
      catchError(this.handleError)
    );
  }


submitSalesForApproval(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/finalize`, {});
}

approveSalesOrder(id: number): Observable<any> {
  console.log('........approving SO.............................');
  
    return this.http.patch<any>(`${this.apiUrl}/${id}/approve`, {});
}


    /**
   * Deletes a draft or cancels an active sales order via DELETE resource id path binding.
   */
  deleteSalesOrder(id: number): Observable<{ success: boolean; action: 'DELETED' | 'CANCELLED'; message: string }> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`Sending delete/cancel request for sales order at ${url}`);
    
    return this.http.delete<{ success: boolean; action: 'DELETED' | 'CANCELLED'; message: string }>(url).pipe(
      tap(response => console.log('Delete/Cancel sales order response:', response)),
      catchError(this.handleError)
    );
  }


  getSOs(ptenantId: number): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.apiUrl}/${ptenantId}`).pipe(
      catchError(this.handleError)
    );
  }

  fetchTenantRulesMatrix(tenantId: number, pProductId: number, pProductVariantId: number): Observable<TenantSalesRulesMatrixResponse> {
    const url = `${this.apiUrl}/fetchTenantRulesMatrix/${tenantId}/${pProductId}/${pProductVariantId}`;
    return this.http.get<TenantSalesRulesMatrixResponse>(url).pipe(
      catchError(this.handleError)
    );
  }
}
