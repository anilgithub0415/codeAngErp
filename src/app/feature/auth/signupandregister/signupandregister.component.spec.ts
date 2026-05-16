import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupandregisterComponent } from './signupandregister.component';

describe('SignupandregisterComponent', () => {
  let component: SignupandregisterComponent;
  let fixture: ComponentFixture<SignupandregisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupandregisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupandregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
