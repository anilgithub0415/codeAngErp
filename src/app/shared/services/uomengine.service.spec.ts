import { TestBed } from '@angular/core/testing';

import { UOMEngineService } from './uomengine.service';

describe('UOMEngineService', () => {
  let service: UOMEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UOMEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
