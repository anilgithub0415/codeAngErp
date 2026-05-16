import { TestBed } from '@angular/core/testing';

import { AssignmentAttemptService } from './assignment-attempt.service';

describe('AssignmentAttemptService', () => {
  let service: AssignmentAttemptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentAttemptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
