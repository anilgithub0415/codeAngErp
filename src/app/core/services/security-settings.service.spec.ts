import { TestBed } from '@angular/core/testing';

import { SecuritySettingsService } from './security-settings.service';

describe('SecuritySettingsService', () => {
  let service: SecuritySettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecuritySettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
