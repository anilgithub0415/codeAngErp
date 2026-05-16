import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmenttakeComponent } from './assignmenttake.component';

describe('AssignmenttakeComponent', () => {
  let component: AssignmenttakeComponent;
  let fixture: ComponentFixture<AssignmenttakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmenttakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmenttakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
