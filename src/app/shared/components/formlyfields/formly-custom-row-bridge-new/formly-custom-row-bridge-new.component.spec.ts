import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyCustomRowBridgeNewComponent } from './formly-custom-row-bridge-new.component';

describe('FormlyCustomRowBridgeNewComponent', () => {
  let component: FormlyCustomRowBridgeNewComponent;
  let fixture: ComponentFixture<FormlyCustomRowBridgeNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyCustomRowBridgeNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyCustomRowBridgeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
