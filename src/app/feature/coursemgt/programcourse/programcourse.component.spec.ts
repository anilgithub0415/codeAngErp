import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramcourseComponent } from './programcourse.component';

describe('ProgramcourseComponent', () => {
  let component: ProgramcourseComponent;
  let fixture: ComponentFixture<ProgramcourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramcourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramcourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
