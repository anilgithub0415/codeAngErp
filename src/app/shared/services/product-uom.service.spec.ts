import { TestBed } from '@angular/core/testing';

import { ProductUomService } from './product-uom.service';

describe('ProductUomService', () => {
  let service: ProductUomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductUomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
