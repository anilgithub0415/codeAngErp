import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentdashboardComponent } from './assignmentdashboard.component';

describe('AssignmentdashboardComponent', () => {
  let component: AssignmentdashboardComponent;
  let fixture: ComponentFixture<AssignmentdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentdashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
