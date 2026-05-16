import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessStudentAnswerTypeComponent } from './assess-student-answer-type.component';

describe('AssessStudentAnswerTypeComponent', () => {
  let component: AssessStudentAnswerTypeComponent;
  let fixture: ComponentFixture<AssessStudentAnswerTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessStudentAnswerTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessStudentAnswerTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
