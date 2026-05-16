import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAnswerTypeComponent } from './student-answer-type.component';

describe('StudentAnswerTypeComponent', () => {
  let component: StudentAnswerTypeComponent;
  let fixture: ComponentFixture<StudentAnswerTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAnswerTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAnswerTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
