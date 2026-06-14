import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldPrimengDropdownComponent } from './formly-field-primeng-dropdown.component';

describe('FormlyFieldPrimengDropdownComponent', () => {
  let component: FormlyFieldPrimengDropdownComponent;
  let fixture: ComponentFixture<FormlyFieldPrimengDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyFieldPrimengDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyFieldPrimengDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
