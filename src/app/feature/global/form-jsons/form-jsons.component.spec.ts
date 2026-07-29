import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormJSONsComponent } from './form-jsons.component';

describe('FormJSONsComponent', () => {
  let component: FormJSONsComponent;
  let fixture: ComponentFixture<FormJSONsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormJSONsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormJSONsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
