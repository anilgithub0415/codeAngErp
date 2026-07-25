import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountTypeComponent } from './discount-type.component';

describe('DiscountTypeComponent', () => {
  let component: DiscountTypeComponent;
  let fixture: ComponentFixture<DiscountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
