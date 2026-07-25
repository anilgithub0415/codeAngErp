import { TestBed } from '@angular/core/testing';

import { SubscriptionPlanLookupService } from './subscription-plan-lookup.service';

describe('SubscriptionPlanLookupService', () => {
  let service: SubscriptionPlanLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscriptionPlanLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
