import { TestBed } from '@angular/core/testing';

import { CourseofferingService } from './courseoffering.service';

describe('CourseofferingService', () => {
  let service: CourseofferingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseofferingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
