import { TestBed } from '@angular/core/testing';

import { DatascopeService } from './datascope.service';

describe('DatascopeService', () => {
  let service: DatascopeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatascopeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
