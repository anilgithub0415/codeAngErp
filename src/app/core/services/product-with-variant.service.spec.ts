import { TestBed } from '@angular/core/testing';

import { ProductWithVariantService } from './product-with-variant.service';

describe('ProductWithVariantService', () => {
  let service: ProductWithVariantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductWithVariantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
