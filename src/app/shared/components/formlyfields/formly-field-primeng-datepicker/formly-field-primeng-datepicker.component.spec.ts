import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldPrimengDatepickerComponent } from './formly-field-primeng-datepicker.component';

describe('FormlyFieldPrimengDatepickerComponent', () => {
  let component: FormlyFieldPrimengDatepickerComponent;
  let fixture: ComponentFixture<FormlyFieldPrimengDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyFieldPrimengDatepickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyFieldPrimengDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
