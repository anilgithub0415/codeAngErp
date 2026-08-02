import { TestBed } from '@angular/core/testing';

import { ContextUIService } from './context-ui.service';

describe('ContextUIService', () => {
  let service: ContextUIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContextUIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
