import { TestBed } from '@angular/core/testing';

import { ClientRequirementService } from './client-requirement.service';

describe('ClientRequirementService', () => {
  let service: ClientRequirementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientRequirementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
