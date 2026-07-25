import { TestBed } from '@angular/core/testing';

import { TenantTypeService } from './tenant-type.service';

describe('TenantTypeService', () => {
  let service: TenantTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
