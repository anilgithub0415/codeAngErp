import { TestBed } from '@angular/core/testing';

import { ProductvariantService } from './productvariant.service';

describe('ProductvariantService', () => {
  let service: ProductvariantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductvariantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
