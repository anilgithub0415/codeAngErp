import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationGridComponent } from './quotation-grid.component';

describe('QuotationGridComponent', () => {
  let component: QuotationGridComponent;
  let fixture: ComponentFixture<QuotationGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
