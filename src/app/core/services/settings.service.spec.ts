import { TestBed } from '@angular/core/testing';

import { SecuritySettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SecuritySettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecuritySettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
