import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldDropdownComponent } from './formly-field-dropdown.component';

describe('FormlyFieldDropdownComponent', () => {
  let component: FormlyFieldDropdownComponent;
  let fixture: ComponentFixture<FormlyFieldDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyFieldDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyFieldDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
