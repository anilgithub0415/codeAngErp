import { TestBed } from '@angular/core/testing';

import { LineDiscountService } from './line-discount.service';

describe('LineDiscountService', () => {
  let service: LineDiscountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LineDiscountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
