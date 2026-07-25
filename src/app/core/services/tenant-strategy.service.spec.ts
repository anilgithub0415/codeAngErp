import { TestBed } from '@angular/core/testing';

import { TenantStrategyService } from './tenant-strategy.service';

describe('TenantStrategyService', () => {
  let service: TenantStrategyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantStrategyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
