import { TestBed } from '@angular/core/testing';

import { LeadsourceService } from './leadsource.service';

describe('LeadsourceService', () => {
  let service: LeadsourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeadsourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
