import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomLabelTextComponent } from './custom-label-text.component';

describe('CustomLabelTextComponent', () => {
  let component: CustomLabelTextComponent;
  let fixture: ComponentFixture<CustomLabelTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomLabelTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomLabelTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
