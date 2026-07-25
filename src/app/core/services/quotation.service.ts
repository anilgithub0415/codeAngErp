import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IQuotation } from '../models/quotation.model';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private apiUrl = '/quotation'; 
  private http = inject(HttpClient);

  getQuotations(tenantId: number, clientId?: number): Observable<IQuotation[]> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId.toString());
    }
    return this.http.get<IQuotation[]>(`${this.apiUrl}/${tenantId}`, { params });
  }

  getQuotation(tenantId: number, id: number): Observable<IQuotation> {
    return this.http.get<IQuotation>(`${this.apiUrl}/${tenantId}/${id}`);
  }

  createQuotationClean(payload: Partial<IQuotation>): Observable<{ quotation: IQuotation }> {
    return this.http.post<{ quotation: IQuotation }>(this.apiUrl, payload);
  }

  updateQuotation(id: number, payload: Partial<IQuotation>): Observable<IQuotation> {
    return this.http.put<IQuotation>(`${this.apiUrl}/${id}`, payload);
  }

  /**
   * 🌟 CLIENT PORTAL: Submit a lower target price proposal 
   * Updates state to COUNTER_OFFERED, sets old round isActive: false, creates version + 1
   */
  submitClientCounterOffer(id: number, payload: Partial<IQuotation>): Observable<IQuotation> {
    return this.http.post<IQuotation>(`${this.apiUrl}/${id}/counter-offer`, payload);
  }

  /**
   * 🌟 WHOLESALER ERP: Revise the pricing rules from internal dashboard 
   * Updates state to REVISED, preparing it back for Client Portal evaluation
   */
  submitWholesalerRevision(id: number, payload: Partial<IQuotation>): Observable<IQuotation> {
    return this.http.post<IQuotation>(`${this.apiUrl}/${id}/revise`, payload);
  }

  /**
   * 🌟 CLIENT PORTAL / ERP: Lock negotiation phase completely
   * Updates state to APPROVED, marking the structure ready for conversion to an Internal PO
   */
  approveQuotationFinal(id: number): Observable<IQuotation> {
    return this.http.patch<IQuotation>(`${this.apiUrl}/${id}/approve`, {});
  }
}
