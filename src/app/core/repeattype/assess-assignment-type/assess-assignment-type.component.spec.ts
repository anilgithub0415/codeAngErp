import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessAssignmentTypeComponent } from './assess-assignment-type.component';

describe('AssessAssignmentTypeComponent', () => {
  let component: AssessAssignmentTypeComponent;
  let fixture: ComponentFixture<AssessAssignmentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessAssignmentTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessAssignmentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
