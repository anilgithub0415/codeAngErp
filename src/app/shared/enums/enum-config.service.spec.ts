import { TestBed } from '@angular/core/testing';

import { EnumConfigService } from './enum-config.service';

describe('EnumConfigService', () => {
  let service: EnumConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnumConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
