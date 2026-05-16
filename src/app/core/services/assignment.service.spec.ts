import { TestBed } from '@angular/core/testing';

import { AssignmentService } from './assignment.service';

describe('AssessmentService', () => {
  let service: AssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
