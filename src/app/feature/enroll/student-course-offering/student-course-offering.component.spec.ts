import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCourseOfferingComponent } from './student-course-offering.component';

describe('StudentCourseOfferingComponent', () => {
  let component: StudentCourseOfferingComponent;
  let fixture: ComponentFixture<StudentCourseOfferingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCourseOfferingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCourseOfferingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
