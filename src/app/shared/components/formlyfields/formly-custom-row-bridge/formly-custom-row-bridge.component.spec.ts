import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyCustomRowBridgeComponent } from './formly-custom-row-bridge.component';

describe('FormlyCustomRowBridgeComponent', () => {
  let component: FormlyCustomRowBridgeComponent;
  let fixture: ComponentFixture<FormlyCustomRowBridgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyCustomRowBridgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyCustomRowBridgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
