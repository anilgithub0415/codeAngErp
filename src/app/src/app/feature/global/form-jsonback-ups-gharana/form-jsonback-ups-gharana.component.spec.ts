import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormJSONBackUpsGharanaComponent } from './form-jsonback-ups-gharana.component';

describe('FormJSONBackUpsGharanaComponent', () => {
  let component: FormJSONBackUpsGharanaComponent;
  let fixture: ComponentFixture<FormJSONBackUpsGharanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormJSONBackUpsGharanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormJSONBackUpsGharanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
