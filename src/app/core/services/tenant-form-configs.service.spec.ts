import { TestBed } from '@angular/core/testing';

import { TenantFormConfigsService } from './tenant-form-configs.service';

describe('TenantFormConfigsService', () => {
  let service: TenantFormConfigsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantFormConfigsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
