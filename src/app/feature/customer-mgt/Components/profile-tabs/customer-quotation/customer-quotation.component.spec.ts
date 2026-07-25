import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerQuotationComponent } from './customer-quotation.component';

describe('CustomerQuotationComponent', () => {
  let component: CustomerQuotationComponent;
  let fixture: ComponentFixture<CustomerQuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerQuotationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
