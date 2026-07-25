import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountOfferComponent } from './discount-offer.component';

describe('DiscountOfferComponent', () => {
  let component: DiscountOfferComponent;
  let fixture: ComponentFixture<DiscountOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountOfferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
