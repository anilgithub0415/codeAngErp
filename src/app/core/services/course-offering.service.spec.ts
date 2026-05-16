import { TestBed } from '@angular/core/testing';

import { CourseOfferingService } from './course-offering.service';

describe('CourseOfferingService', () => {
  let service: CourseOfferingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseOfferingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
