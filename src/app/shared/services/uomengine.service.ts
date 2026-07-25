import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UOMEngineService {

  // High-performance direct conversion routine
  public convertQuantity(qty: number, factor: number, toBase: boolean = true): number {
    if (!qty || isNaN(qty)) return 0;
    return toBase ? qty * factor : qty / factor;
  }

  // Determines fallback unit assignments based on operational scenario contexts
  public getProductUomMeta(product: any, mode: 'SALES' | 'PURCHASE'): { base: string, operational: string } {
    if (!product) return { base: 'PCS', operational: 'PCS' };
    
    // Abstracted abstraction layer capturing both Variant formats or Flat formats interchangeably
    const base = product.baseUom || product.productTemplate?.baseUom || 'PCS';
    let operational = base;

    if (mode === 'SALES') {
      operational = product.defaultSalesUom || product.productTemplate?.defaultSalesUom || base;
    } else {
      operational = product.defaultPurchaseUom || product.productTemplate?.defaultPurchaseUom || base;
    }

    return { base, operational };
  }
}
