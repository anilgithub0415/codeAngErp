import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldPrimengDropdownNewComponent } from './formly-field-primeng-dropdown-new.component';

describe('FormlyFieldPrimengDropdownNewComponent', () => {
  let component: FormlyFieldPrimengDropdownNewComponent;
  let fixture: ComponentFixture<FormlyFieldPrimengDropdownNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyFieldPrimengDropdownNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyFieldPrimengDropdownNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
