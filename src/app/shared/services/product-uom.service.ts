
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

interface ConversionRow {
  id?: number;
  tenantId: number;
  productId: number;
  productVariantId: number | null;
  purchaseUom: string;
  saleUom: string;
  conversionFactor: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductUomService {
  private http = inject(HttpClient);
  
  // Resolves to your backend gateway URL (e.g., http://myerp.local)
  private readonly apiUrl = '/uom-conversion';//`${environment.apiUrl}/api/uom-conversion`;

  /**
   * Fetches active conversion rules matching a specific product context safely partitioned by Tenant ID.
   * Target Route: GET /api/uom-conversion/product/:productId?tenantId=:tenantId
   */
  getConversionsByProduct(tenantId: number, productId: number,productVariantId:number): Observable<ConversionRow[]> {
    // const params = new HttpParams()
    //   .set('tenantId', tenantId.toString());

   // return this.http.get<ConversionRow[]>(`${this.apiUrl}/${tenantId}&productId=${productId}&productVariantId=${productVariantId}`, { params });
    return this.http.get<ConversionRow[]>(`${this.apiUrl}/${tenantId}/${productId}/${productVariantId}`);
  }

  /**
   * Saves or registers a new validation record set to the database matrix framework.
   * Target Route: POST /api/uom-conversion
   */
  saveUomConversion(payload: ConversionRow): Observable<ConversionRow> {
    console.log('payload to submit:',payload);
    console.log('to api:',this.apiUrl);
    
    
    return this.http.post<ConversionRow>(this.apiUrl, payload);
  }

  /**
   * Deletes a specific rule block sequence mapping by database tracking primary keys.
   * Target Route: DELETE /api/uom-conversion/:id?tenantId=:tenantId
   */
  deleteUomConversion(tenantId: number, id: number): Observable<void> {
    const params = new HttpParams().set('tenantId', tenantId.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }
}
