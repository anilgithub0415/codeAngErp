import { TestBed } from '@angular/core/testing';

import { ClientOrderDashboardService } from './client-order-dashboard.service';

describe('ClientOrderDashboardService', () => {
  let service: ClientOrderDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientOrderDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
