import { TestBed } from '@angular/core/testing';

import { DiscountTypeService } from './discount-type.service';

describe('DiscountTypeService', () => {
  let service: DiscountTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscountTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
