import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseOfferingComponent } from './course-offering.component';

describe('CourseOfferingComponent', () => {
  let component: CourseOfferingComponent;
  let fixture: ComponentFixture<CourseOfferingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseOfferingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseOfferingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
