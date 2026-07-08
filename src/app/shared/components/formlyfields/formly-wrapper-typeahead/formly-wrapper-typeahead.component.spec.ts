import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyWrapperTypeaheadComponent } from './formly-wrapper-typeahead.component';

describe('FormlyWrapperTypeaheadComponent', () => {
  let component: FormlyWrapperTypeaheadComponent;
  let fixture: ComponentFixture<FormlyWrapperTypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyWrapperTypeaheadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyWrapperTypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
