import { TestBed } from '@angular/core/testing';

import { ProgramcourseService } from './programcourse.service';

describe('ProgramcourseService', () => {
  let service: ProgramcourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramcourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
