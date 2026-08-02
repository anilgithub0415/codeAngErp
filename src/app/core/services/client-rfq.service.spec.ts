import { TestBed } from '@angular/core/testing';

import { ClientRFQService } from './client-rfq.service';

describe('ClientRFQService', () => {
  let service: ClientRFQService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientRFQService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
