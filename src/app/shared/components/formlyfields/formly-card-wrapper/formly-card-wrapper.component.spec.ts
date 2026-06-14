import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyCardWrapperComponent } from './formly-card-wrapper.component';

describe('FormlyCardWrapperComponent', () => {
  let component: FormlyCardWrapperComponent;
  let fixture: ComponentFixture<FormlyCardWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyCardWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyCardWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
