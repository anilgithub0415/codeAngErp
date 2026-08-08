import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqConversionService {
  // 1. Initialize with null state context
  private convertRfqSubject = new BehaviorSubject<any | null>(null);
  convertRfq$: Observable<any | null> = this.convertRfqSubject.asObservable();

  // 2. Call this from the RFQ Grid component
  triggerConversion(rfq: any): void {
    console.log('1. Service: Caching RFQ payload state data.', rfq);
    this.convertRfqSubject.next(rfq);
  }

  // 3. Call this from the Quotation component after it successfully processes the data
  clearConversionState(): void {
    console.log('4. Service: Clearing processed state.');
    this.convertRfqSubject.next(null);
  }
}
