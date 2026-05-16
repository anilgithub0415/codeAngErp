import { TestBed } from '@angular/core/testing';

import { FacultyprofileService } from './facultyprofile.service';

describe('FacultyprofileService', () => {
  let service: FacultyprofileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacultyprofileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
