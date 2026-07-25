import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationLayoutComponent } from './quotation-layout.component';

describe('QuotationLayoutComponent', () => {
  let component: QuotationLayoutComponent;
  let fixture: ComponentFixture<QuotationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
