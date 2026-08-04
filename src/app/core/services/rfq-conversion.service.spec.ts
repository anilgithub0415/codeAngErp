import { TestBed } from '@angular/core/testing';

import { RfqConversionService } from './rfq-conversion.service';

describe('RfqConversionService', () => {
  let service: RfqConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
